DROP FUNCTION IF EXISTS "public"."get_user_id_by_email"("text");

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
GRANT ALL ON FUNCTION "public"."get_user_id_by_email"("p_email" "text") TO "service_role";
