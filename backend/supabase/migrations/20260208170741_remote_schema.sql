set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_user(user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$BEGIN
  DELETE FROM public.profiles
  WHERE id = user_id;
END;$function$
;


