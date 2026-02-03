-- Enable RLS on all tables
alter table "public"."containers" enable row level security;
alter table "public"."equipment" enable row level security;
alter table "public"."org_memberships" enable row level security;
alter table "public"."organizations" enable row level security;
alter table "public"."profiles" enable row level security;

-- FUNCTIONS to avoid infinite recursion
-- Check if current user is a member of an org
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
    and user_id = auth.uid()
  );
$$;

-- Check if current user is the manager of an org
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
    and manager_id = auth.uid()
  );
$$;

-- Fix the trigger function to be SECURITY DEFINER so it can insert membership bypassing RLS
CREATE OR REPLACE FUNCTION public.handle_new_organization_owner()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
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


-- PROFILES
-- View: Self or if sharing an organization
create policy "Users can view own profile"
on "public"."profiles"
for select
to authenticated
using (
  auth.uid() = id
);

create policy "Users can view profiles of shared org members"
on "public"."profiles"
for select
to authenticated
using (
  exists (
    select 1 from public.org_memberships my_orgs
    join public.org_memberships other_orgs on my_orgs.organization_id = other_orgs.organization_id
    where my_orgs.user_id = auth.uid()
    and other_orgs.user_id = profiles.id
  )
);

-- Update: Self only
create policy "Users can update own profile"
on "public"."profiles"
for update
to authenticated
using ( auth.uid() = id )
with check ( auth.uid() = id );

-- Insert: Self only (Registration)
create policy "Users can insert own profile"
on "public"."profiles"
for insert
to authenticated
with check ( auth.uid() = id );


-- ORGANIZATIONS
-- Select: Any authenticated user (Simplified rule for joining by code)
create policy "Authenticated users can view organizations"
on "public"."organizations"
for select
to authenticated
using ( true );

-- Insert: Authenticated users (creation)
create policy "Authenticated users can create organizations"
on "public"."organizations"
for insert
to authenticated
with check ( true ); 

-- Update/Delete: Manager only
create policy "Manager can update organization"
on "public"."organizations"
for update
to authenticated
using ( auth.uid() = manager_id )
with check ( auth.uid() = manager_id );

create policy "Manager can delete organization"
on "public"."organizations"
for delete
to authenticated
using ( auth.uid() = manager_id );


-- ORG MEMBERSHIPS
-- Select: Members of the same organization OR self (to view own memberships)
create policy "Members can view other members in same org"
on "public"."org_memberships"
for select
to authenticated
using (
  public.is_org_member(organization_id) OR user_id = auth.uid()
);

-- Insert: Any authenticated user (Simplified rule for joining)
create policy "Authenticated users can create memberships"
on "public"."org_memberships"
for insert
to authenticated
with check ( true );

-- Delete: Manager only (Removing members)
create policy "Manager can remove members"
on "public"."org_memberships"
for delete
to authenticated
using (
  public.is_org_manager(organization_id)
);


-- EQUIPMENT & CONTAINERS (Shared logic)
-- Select: Members only
create policy "Members can view equipment"
on "public"."equipment"
for select
to authenticated
using (
  public.is_org_member(organization_id)
);

create policy "Members can view containers"
on "public"."containers"
for select
to authenticated
using (
  public.is_org_member(organization_id)
);

-- Insert/Delete: Manager only
create policy "Manager can create equipment"
on "public"."equipment"
for insert
to authenticated
with check (
  public.is_org_manager(organization_id)
);

create policy "Manager can delete equipment"
on "public"."equipment"
for delete
to authenticated
using (
  public.is_org_manager(organization_id)
);

create policy "Manager can create containers"
on "public"."containers"
for insert
to authenticated
with check (
  public.is_org_manager(organization_id)
);

create policy "Manager can delete containers"
on "public"."containers"
for delete
to authenticated
using (
  public.is_org_manager(organization_id)
);

-- Update: Members (relaxed rule)
create policy "Members can update equipment"
on "public"."equipment"
for update
to authenticated
using (
  public.is_org_member(organization_id)
)
with check (
  public.is_org_member(organization_id)
);

create policy "Members can update containers"
on "public"."containers"
for update
to authenticated
using (
  public.is_org_member(organization_id)
)
with check (
  public.is_org_member(organization_id)
);
