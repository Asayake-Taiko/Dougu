-- 0. Ensure the system "deleted@dougu.app" user exists
-- This user serves as a placeholder for resources owned by deleted accounts.
DO $$
DECLARE
  v_deleted_user_id UUID := 'd31e1e1e-d31e-d31e-d31e-d31e1e1e1e1e';
BEGIN
  -- Ensure auth user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'deleted@dougu.app') THEN
    INSERT INTO auth.users (
      id, instance_id, email, raw_user_meta_data, raw_app_meta_data, role, aud, 
      email_confirmed_at, created_at, updated_at, encrypted_password
    )
    VALUES (
      v_deleted_user_id, '00000000-0000-0000-0000-000000000000', 'deleted@dougu.app',
      '{"name": "Deleted User"}', '{"provider": "email", "providers": ["email"]}',
      'authenticated', 'authenticated', now(), now(), now(), ''
    );
  END IF;

  -- Ensure profile exists (in case trigger was bypassed or ran before name was in metadata)
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_deleted_user_id) THEN
    INSERT INTO public.profiles (id, name, color)
    VALUES (v_deleted_user_id, 'Deleted User', '#791111');
  END IF;
END $$;

-- 0.1 Fix security_definer_view warning for related_org_members
-- Redefining as security_invoker = true to respect RLS of the querying user.
DROP VIEW IF EXISTS public.related_org_members;
CREATE VIEW public.related_org_members WITH (security_invoker = true) AS
SELECT 
  my_om.user_id::text as viewer_id,
  other_om.user_id::text as target_user_id,
  other_om.organization_id
FROM org_memberships my_om
JOIN org_memberships other_om ON my_om.organization_id = other_om.organization_id;

GRANT SELECT ON public.related_org_members TO authenticated;
GRANT SELECT ON public.related_org_members TO service_role;
GRANT SELECT ON public.related_org_members TO powersync_role;

CREATE OR REPLACE FUNCTION "public"."reassign_and_delete_user"("target_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    target_membership RECORD;
    existing_deleted_membership_id UUID;
    deleted_user_id UUID;
BEGIN
    -- 1. Resolve the system deleted user ID
    SELECT id INTO deleted_user_id FROM auth.users WHERE email = 'deleted@dougu.app' LIMIT 1;
    
    IF deleted_user_id IS NULL THEN
        RAISE EXCEPTION 'System deleted user account not found. Ensure migrations have ran correctly.';
    END IF;

    -- 2. Check if target_user owns any organization
    IF EXISTS (
        SELECT 1 
        FROM public.organizations 
        WHERE manager_id = target_user_id
    ) THEN
        RAISE EXCEPTION 'User owns an organization. Transfer ownership before deleting.';
    END IF;
    
    -- Check if target user is the same as deleted user (sanity check)
    IF target_user_id = deleted_user_id THEN
        RAISE EXCEPTION 'Cannot delete the system deleted user account.';
    END IF;

    -- 3. Loop through target_user's memberships
    FOR target_membership IN 
        SELECT * FROM public.org_memberships WHERE user_id = target_user_id
    LOOP
        -- Check if deleted_user already has membership in the same organization
        SELECT id INTO existing_deleted_membership_id
        FROM public.org_memberships
        WHERE organization_id = target_membership.organization_id
        AND user_id = deleted_user_id
        LIMIT 1;

        IF existing_deleted_membership_id IS NOT NULL THEN
            -- deleted_user already in org: Reassign items and delete target membership
            
            -- Reassign equipment
            UPDATE public.equipment
            SET assigned_to = existing_deleted_membership_id
            WHERE assigned_to = target_membership.id;

            -- Reassign containers
            UPDATE public.containers
            SET assigned_to = existing_deleted_membership_id
            WHERE assigned_to = target_membership.id;

            -- Delete the target membership
            DELETE FROM public.org_memberships WHERE id = target_membership.id;
        ELSE
            -- deleted_user NOT in org: Transfer the membership itself
            UPDATE public.org_memberships
            SET 
                user_id = deleted_user_id,
                details = 'Reassigned from deleted user'
            WHERE id = target_membership.id;
        END IF;

    END LOOP;

    -- 4. Delete the profile and auth user
    DELETE FROM auth.users WHERE id = target_user_id;

END;$$;

ALTER FUNCTION "public"."reassign_and_delete_user"("target_user_id" "uuid") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."reassign_and_delete_user"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."reassign_and_delete_user"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reassign_and_delete_user"("target_user_id" "uuid") TO "service_role";

-- Helper function to get user ID by email (strictly for service_role usage recommended)
CREATE OR REPLACE FUNCTION "public"."get_user_id_by_email"("p_email" "text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    found_id UUID;
BEGIN
    SELECT id INTO found_id FROM auth.users WHERE email = p_email LIMIT 1;
    RETURN found_id;
END;$$;

ALTER FUNCTION "public"."get_user_id_by_email"("p_email" "text") OWNER TO "postgres";

-- Only allow service role to look up IDs by email to prevent enumeration attacks
GRANT ALL ON FUNCTION "public"."get_user_id_by_email"("p_email" "text") TO "service_role";
