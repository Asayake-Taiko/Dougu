-- Enable RLS on all tables
alter table "public"."containers" enable row level security;
alter table "public"."equipment" enable row level security;
alter table "public"."org_memberships" enable row level security;
alter table "public"."organizations" enable row level security;
alter table "public"."profiles" enable row level security;

-- 1. CLEANUP & FUNCTIONS
-- Drop redundant triggers/functions if they exist
DROP TRIGGER IF EXISTS check_manager_before_delete ON "public"."org_memberships";
DROP FUNCTION IF EXISTS public.prevent_organization_manager_deletion();
DROP FUNCTION IF EXISTS public.check_user_membership(uuid, uuid); 

-- Helper: Check if current user is a member of an org
create or replace function public.is_org_member(_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from org_memberships
    where organization_id = _org_id
    and user_id = (select auth.uid())
  );
$$;

-- Helper: Check if current user is the manager of an org
create or replace function public.is_org_manager(_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from organizations
    where id = _org_id
    and manager_id = (select auth.uid())
  );
$$;

-- Trigger: Handle new organization owner (adds creator to memberships)
CREATE OR REPLACE FUNCTION public.handle_new_organization_owner()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.org_memberships (
    organization_id,
    user_id,
    type,
    details
  )
  VALUES (
    NEW.id,          -- The ID of the newly created organization
    NEW.manager_id,  -- The ID of the user who created it
    'USER',          -- Default type as 'USER'
    'Organization Creator/Owner'
  );

  RETURN NEW;
END;
$function$;

-- Trigger: Handle new user (creates profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, profile_image)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'name', 
    new.raw_user_meta_data->>'profile_image'
  );
  RETURN new;
END;
$function$;


-- 2. SCHEMA CONSTRAINTS
-- Ensure (organization_id, user_id) is unique.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'org_memberships_org_user_key') THEN
        ALTER TABLE "public"."org_memberships" ADD CONSTRAINT "org_memberships_org_user_key" UNIQUE (organization_id, user_id);
    END IF;
END $$;

-- Enforce that the Organization Manager MUST be a Member of that Organization.
-- Deferrable to allow trigger-based creation.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organizations_manager_membership_fkey') THEN
        ALTER TABLE "public"."organizations"
        ADD CONSTRAINT "organizations_manager_membership_fkey"
        FOREIGN KEY (id, manager_id)
        REFERENCES "public"."org_memberships" (organization_id, user_id)
        DEFERRABLE INITIALLY DEFERRED;
    END IF;
END $$;


-- 2.5 INDEXES
-- Optimize Foreign Key lookups
CREATE INDEX IF NOT EXISTS idx_containers_organization_id ON public.containers(organization_id);
CREATE INDEX IF NOT EXISTS idx_containers_assigned_to ON public.containers(assigned_to);

CREATE INDEX IF NOT EXISTS idx_equipment_organization_id ON public.equipment(organization_id);
CREATE INDEX IF NOT EXISTS idx_equipment_container_id ON public.equipment(container_id);
CREATE INDEX IF NOT EXISTS idx_equipment_assigned_to ON public.equipment(assigned_to);

CREATE INDEX IF NOT EXISTS idx_org_memberships_user_id ON public.org_memberships(user_id);

CREATE INDEX IF NOT EXISTS idx_organizations_manager_id ON public.organizations(manager_id);


-- 3. POLICIES: PROFILES
create policy "Users can view accessible profiles"
on "public"."profiles" for select to authenticated
using (
  (select auth.uid()) = id
  OR EXISTS (
    select 1 from public.org_memberships my_orgs
    join public.org_memberships other_orgs on my_orgs.organization_id = other_orgs.organization_id
    where my_orgs.user_id = (select auth.uid())
    and other_orgs.user_id = profiles.id
  )
);

create policy "Users can update own profile"
on "public"."profiles" for update to authenticated
using ( (select auth.uid()) = id ) with check ( (select auth.uid()) = id );

create policy "Users can insert own profile"
on "public"."profiles" for insert to authenticated
with check ( (select auth.uid()) = id );


-- 4. POLICIES: ORGANIZATIONS
create policy "Authenticated users can view organizations"
on "public"."organizations" for select to authenticated
using ( true );

create policy "Users can create organizations as manager"
on "public"."organizations" for insert to authenticated
with check ( (select auth.uid()) = manager_id );

create policy "Manager can update organization"
on "public"."organizations" for update to authenticated
using ( (select auth.uid()) = manager_id )
with check (
  EXISTS (
    SELECT 1 FROM public.org_memberships m
    WHERE m.organization_id = organizations.id
    AND m.user_id = manager_id
  )
);

create policy "Manager can delete organization"
on "public"."organizations" for delete to authenticated
using ( (select auth.uid()) = manager_id );


-- 5. POLICIES: ORG MEMBERSHIPS
create policy "Members can view other members in same org"
on "public"."org_memberships" for select to authenticated
using ( public.is_org_member(organization_id) OR user_id = (select auth.uid()) );

create policy "Users can join or managers create storage"
on "public"."org_memberships" for insert to authenticated
with check (
  (type = 'USER' AND (select auth.uid()) = user_id) OR
  (type = 'STORAGE' AND public.is_org_manager(organization_id))
);

create policy "Manager can remove members"
on "public"."org_memberships" for delete to authenticated
using ( public.is_org_manager(organization_id) );


-- 6. POLICIES: EQUIPMENT & CONTAINERS
create policy "Members can view equipment"
on "public"."equipment" for select to authenticated
using ( public.is_org_member(organization_id) );

create policy "Members can view containers"
on "public"."containers" for select to authenticated
using ( public.is_org_member(organization_id) );

create policy "Manager can create equipment"
on "public"."equipment" for insert to authenticated
with check ( public.is_org_manager(organization_id) );

create policy "Manager can delete equipment"
on "public"."equipment" for delete to authenticated
using ( public.is_org_manager(organization_id) );

create policy "Manager can create containers"
on "public"."containers" for insert to authenticated
with check ( public.is_org_manager(organization_id) );

create policy "Manager can delete containers"
on "public"."containers" for delete to authenticated
using ( public.is_org_manager(organization_id) );

create policy "Members can update equipment"
on "public"."equipment" for update to authenticated
using ( public.is_org_member(organization_id) )
with check ( public.is_org_member(organization_id) );

create policy "Members can update containers"
on "public"."containers" for update to authenticated
using ( public.is_org_member(organization_id) )
with check ( public.is_org_member(organization_id) );
