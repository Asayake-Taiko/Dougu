-- Trigger Function: Enforce 100 image limit per organization for equipment
CREATE OR REPLACE FUNCTION public.check_org_image_limit()
RETURNS trigger AS $$
DECLARE
  org_id text;
  image_count integer;
BEGIN
  -- Check if the path matches 'organizations/{orgId}/equipment/%'
  -- split_part(name, '/', 1) = 'organizations'
  -- split_part(name, '/', 2) = orgId
  -- split_part(name, '/', 3) = 'equipment'
  
  IF (TG_OP = 'INSERT') THEN
    IF (split_part(NEW.name, '/', 1) = 'organizations' AND split_part(NEW.name, '/', 3) = 'equipment') THEN
      org_id := split_part(NEW.name, '/', 2);
      
      SELECT count(*) INTO image_count
      FROM storage.objects
      WHERE bucket_id = 'images'
      AND name LIKE 'organizations/' || org_id || '/equipment/%';
      
      IF image_count >= 100 THEN
        RAISE EXCEPTION 'Organization has reached the 100 equipment image limit';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Address function_search_path_mutable advisory for check_org_image_limit
-- This is a security best practice to prevent search path hijacking.
ALTER FUNCTION public.check_org_image_limit() SET search_path = public;
