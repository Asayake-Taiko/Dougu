CREATE OR REPLACE FUNCTION "public"."reassign_and_delete_user"("target_user_id" "uuid", "deleted_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SECURITY DEFINER
    AS $$
DECLARE
    target_membership RECORD;
    existing_deleted_membership_id UUID;
    
    -- Variable to store the deleted user's membership ID if we find one
    target_membership_id UUID;
BEGIN
    -- 1. Check if target_user owns any organization
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

    -- 2. Loop through target_user's memberships
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

    -- 3. Delete the profile and auth user
    -- We can just delete auth.users which cascades to profile usually, but based on previous schema:
    -- profiles.id references auth.users.id ON DELETE CASCADE.
    
    DELETE FROM auth.users WHERE id = target_user_id;

END;$$;

ALTER FUNCTION "public"."reassign_and_delete_user"("target_user_id" "uuid", "deleted_user_id" "uuid") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."reassign_and_delete_user"("target_user_id" "uuid", "deleted_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."reassign_and_delete_user"("target_user_id" "uuid", "deleted_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reassign_and_delete_user"("target_user_id" "uuid", "deleted_user_id" "uuid") TO "service_role";

-- Helper function to get user ID by email (strictly for service_role usage recommended)
CREATE OR REPLACE FUNCTION "public"."get_user_id_by_email"("p_email" "text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    SECURITY DEFINER
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
