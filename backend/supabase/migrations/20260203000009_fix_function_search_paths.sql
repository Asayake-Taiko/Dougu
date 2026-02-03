-- Fix security advisories for mutable search paths in trigger functions

-- 1. handle_new_organization_owner
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

-- 2. handle_new_user
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
