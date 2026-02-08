CREATE OR REPLACE FUNCTION "public"."delete_user"("user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  DELETE FROM public.profiles
  WHERE id = user_id;

  DELETE FROM auth.users
  WHERE id = user_id;
END;$$;

ALTER FUNCTION "public"."delete_user"("user_id" "uuid") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."delete_user"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user"("user_id" "uuid") TO "service_role";
