drop extension if exists "pg_net";
create table "public"."containers" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" text not null,
    "organization_id" uuid,
    "assigned_to" uuid,
    "color" text,
    "details" text,
    "last_updated_date" timestamp with time zone default now()
      );
create table "public"."equipment" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" text not null,
    "organization_id" uuid,
    "assigned_to" uuid,
    "container_id" uuid,
    "image" text,
    "color" text,
    "details" text,
    "last_updated_date" timestamp with time zone default now()
      );
create table "public"."org_memberships" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid,
    "type" text not null,
    "user_id" uuid,
    "storage_name" text,
    "profile_image" text,
    "details" text
      );
create table "public"."organizations" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" text not null,
    "access_code" text not null,
    "manager_id" uuid not null,
    "image" text,
    "created_at" timestamp with time zone default now()
      );
create table "public"."profiles" (
    "id" uuid not null,
    "name" text,
    "profile_image" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );
CREATE UNIQUE INDEX containers_pkey ON public.containers USING btree (id);
CREATE UNIQUE INDEX equipment_pkey ON public.equipment USING btree (id);
CREATE UNIQUE INDEX org_memberships_pkey ON public.org_memberships USING btree (id);
CREATE UNIQUE INDEX organizations_access_code_key ON public.organizations USING btree (access_code);
CREATE UNIQUE INDEX organizations_pkey ON public.organizations USING btree (id);
CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);
alter table "public"."containers" add constraint "containers_pkey" PRIMARY KEY using index "containers_pkey";
alter table "public"."equipment" add constraint "equipment_pkey" PRIMARY KEY using index "equipment_pkey";
alter table "public"."org_memberships" add constraint "org_memberships_pkey" PRIMARY KEY using index "org_memberships_pkey";
alter table "public"."organizations" add constraint "organizations_pkey" PRIMARY KEY using index "organizations_pkey";
alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";
alter table "public"."containers" add constraint "containers_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES public.org_memberships(id) ON DELETE CASCADE not valid;
alter table "public"."containers" validate constraint "containers_assigned_to_fkey";
alter table "public"."containers" add constraint "containers_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;
alter table "public"."containers" validate constraint "containers_organization_id_fkey";
alter table "public"."equipment" add constraint "equipment_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES public.org_memberships(id) ON DELETE CASCADE not valid;
alter table "public"."equipment" validate constraint "equipment_assigned_to_fkey";
alter table "public"."equipment" add constraint "equipment_container_id_fkey" FOREIGN KEY (container_id) REFERENCES public.containers(id) ON DELETE CASCADE not valid;
alter table "public"."equipment" validate constraint "equipment_container_id_fkey";
alter table "public"."equipment" add constraint "equipment_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;
alter table "public"."equipment" validate constraint "equipment_organization_id_fkey";
alter table "public"."org_memberships" add constraint "membership_requirement" CHECK ((((type = 'USER'::text) AND (user_id IS NOT NULL)) OR ((type = 'STORAGE'::text) AND (storage_name IS NOT NULL)))) not valid;
alter table "public"."org_memberships" validate constraint "membership_requirement";
alter table "public"."org_memberships" add constraint "org_memberships_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;
alter table "public"."org_memberships" validate constraint "org_memberships_organization_id_fkey";
alter table "public"."org_memberships" add constraint "org_memberships_type_consistency" CHECK ((((type = 'USER'::text) AND (user_id IS NOT NULL)) OR ((type = 'STORAGE'::text) AND (user_id IS NULL)))) not valid;
alter table "public"."org_memberships" validate constraint "org_memberships_type_consistency";
alter table "public"."org_memberships" add constraint "org_memberships_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;
alter table "public"."org_memberships" validate constraint "org_memberships_user_id_fkey";
alter table "public"."organizations" add constraint "organizations_access_code_key" UNIQUE using index "organizations_access_code_key";
alter table "public"."organizations" add constraint "organizations_manager_id_fkey" FOREIGN KEY (manager_id) REFERENCES public.profiles(id) ON UPDATE RESTRICT not valid;
alter table "public"."organizations" validate constraint "organizations_manager_id_fkey";
alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;
alter table "public"."profiles" validate constraint "profiles_id_fkey";
set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.handle_new_organization_owner()
 RETURNS trigger
 LANGUAGE plpgsql
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
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  INSERT INTO public.profiles (id, name, profile_image)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'name', 
    new.raw_user_meta_data->>'profile_image'
  );
  RETURN new;
END;$function$;
CREATE OR REPLACE FUNCTION public.prevent_organization_manager_deletion()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Check if the user being removed is the manager of the organization
  IF EXISTS (
    SELECT 1 
    FROM public.organizations 
    WHERE id = OLD.organization_id 
    AND manager_id = OLD.user_id
  ) THEN
    -- If true, block the deletion and raise an error
    RAISE EXCEPTION 'Cannot delete membership: User is the Organization Manager. Transfer ownership first.';
  END IF;

  -- If they are not the manager, allow the deletion to proceed
  RETURN OLD;
END;
$function$;
grant delete on table "public"."containers" to "anon";
grant insert on table "public"."containers" to "anon";
grant references on table "public"."containers" to "anon";
grant select on table "public"."containers" to "anon";
grant trigger on table "public"."containers" to "anon";
grant truncate on table "public"."containers" to "anon";
grant update on table "public"."containers" to "anon";
grant delete on table "public"."containers" to "authenticated";
grant insert on table "public"."containers" to "authenticated";
grant references on table "public"."containers" to "authenticated";
grant select on table "public"."containers" to "authenticated";
grant trigger on table "public"."containers" to "authenticated";
grant truncate on table "public"."containers" to "authenticated";
grant update on table "public"."containers" to "authenticated";
grant select on table "public"."containers" to "powersync_role";
grant delete on table "public"."containers" to "service_role";
grant insert on table "public"."containers" to "service_role";
grant references on table "public"."containers" to "service_role";
grant select on table "public"."containers" to "service_role";
grant trigger on table "public"."containers" to "service_role";
grant truncate on table "public"."containers" to "service_role";
grant update on table "public"."containers" to "service_role";
grant delete on table "public"."equipment" to "anon";
grant insert on table "public"."equipment" to "anon";
grant references on table "public"."equipment" to "anon";
grant select on table "public"."equipment" to "anon";
grant trigger on table "public"."equipment" to "anon";
grant truncate on table "public"."equipment" to "anon";
grant update on table "public"."equipment" to "anon";
grant delete on table "public"."equipment" to "authenticated";
grant insert on table "public"."equipment" to "authenticated";
grant references on table "public"."equipment" to "authenticated";
grant select on table "public"."equipment" to "authenticated";
grant trigger on table "public"."equipment" to "authenticated";
grant truncate on table "public"."equipment" to "authenticated";
grant update on table "public"."equipment" to "authenticated";
grant select on table "public"."equipment" to "powersync_role";
grant delete on table "public"."equipment" to "service_role";
grant insert on table "public"."equipment" to "service_role";
grant references on table "public"."equipment" to "service_role";
grant select on table "public"."equipment" to "service_role";
grant trigger on table "public"."equipment" to "service_role";
grant truncate on table "public"."equipment" to "service_role";
grant update on table "public"."equipment" to "service_role";
grant delete on table "public"."org_memberships" to "anon";
grant insert on table "public"."org_memberships" to "anon";
grant references on table "public"."org_memberships" to "anon";
grant select on table "public"."org_memberships" to "anon";
grant trigger on table "public"."org_memberships" to "anon";
grant truncate on table "public"."org_memberships" to "anon";
grant update on table "public"."org_memberships" to "anon";
grant delete on table "public"."org_memberships" to "authenticated";
grant insert on table "public"."org_memberships" to "authenticated";
grant references on table "public"."org_memberships" to "authenticated";
grant select on table "public"."org_memberships" to "authenticated";
grant trigger on table "public"."org_memberships" to "authenticated";
grant truncate on table "public"."org_memberships" to "authenticated";
grant update on table "public"."org_memberships" to "authenticated";
grant select on table "public"."org_memberships" to "powersync_role";
grant delete on table "public"."org_memberships" to "service_role";
grant insert on table "public"."org_memberships" to "service_role";
grant references on table "public"."org_memberships" to "service_role";
grant select on table "public"."org_memberships" to "service_role";
grant trigger on table "public"."org_memberships" to "service_role";
grant truncate on table "public"."org_memberships" to "service_role";
grant update on table "public"."org_memberships" to "service_role";
grant delete on table "public"."organizations" to "anon";
grant insert on table "public"."organizations" to "anon";
grant references on table "public"."organizations" to "anon";
grant select on table "public"."organizations" to "anon";
grant trigger on table "public"."organizations" to "anon";
grant truncate on table "public"."organizations" to "anon";
grant update on table "public"."organizations" to "anon";
grant delete on table "public"."organizations" to "authenticated";
grant insert on table "public"."organizations" to "authenticated";
grant references on table "public"."organizations" to "authenticated";
grant select on table "public"."organizations" to "authenticated";
grant trigger on table "public"."organizations" to "authenticated";
grant truncate on table "public"."organizations" to "authenticated";
grant update on table "public"."organizations" to "authenticated";
grant select on table "public"."organizations" to "powersync_role";
grant delete on table "public"."organizations" to "service_role";
grant insert on table "public"."organizations" to "service_role";
grant references on table "public"."organizations" to "service_role";
grant select on table "public"."organizations" to "service_role";
grant trigger on table "public"."organizations" to "service_role";
grant truncate on table "public"."organizations" to "service_role";
grant update on table "public"."organizations" to "service_role";
grant delete on table "public"."profiles" to "anon";
grant insert on table "public"."profiles" to "anon";
grant references on table "public"."profiles" to "anon";
grant select on table "public"."profiles" to "anon";
grant trigger on table "public"."profiles" to "anon";
grant truncate on table "public"."profiles" to "anon";
grant update on table "public"."profiles" to "anon";
grant delete on table "public"."profiles" to "authenticated";
grant insert on table "public"."profiles" to "authenticated";
grant references on table "public"."profiles" to "authenticated";
grant select on table "public"."profiles" to "authenticated";
grant trigger on table "public"."profiles" to "authenticated";
grant truncate on table "public"."profiles" to "authenticated";
grant update on table "public"."profiles" to "authenticated";
grant select on table "public"."profiles" to "powersync_role";
grant delete on table "public"."profiles" to "service_role";
grant insert on table "public"."profiles" to "service_role";
grant references on table "public"."profiles" to "service_role";
grant select on table "public"."profiles" to "service_role";
grant trigger on table "public"."profiles" to "service_role";
grant truncate on table "public"."profiles" to "service_role";
grant update on table "public"."profiles" to "service_role";
CREATE TRIGGER check_manager_before_delete BEFORE DELETE ON public.org_memberships FOR EACH ROW EXECUTE FUNCTION public.prevent_organization_manager_deletion();
CREATE TRIGGER on_organization_created AFTER INSERT ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.handle_new_organization_owner();
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
