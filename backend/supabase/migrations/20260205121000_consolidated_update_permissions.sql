-- Migration: Consolidated Equipment and Container Update Permissions
-- Addresses search_path security warnings and merges logic.

-- 1. Function for Container Update Permissions
CREATE OR REPLACE FUNCTION public.check_container_update_permissions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  is_mgr boolean;
  is_mem boolean;
BEGIN
  -- Check if user is manager
  is_mgr := public.is_org_manager(OLD.organization_id);
  
  IF is_mgr THEN
    RETURN NEW; -- Managers can update everything
  END IF;

  -- Check if user is member
  is_mem := public.is_org_member(OLD.organization_id);

  IF is_mem THEN
    -- Check restricted fields
    IF (OLD.name IS DISTINCT FROM NEW.name) OR
       (OLD.details IS DISTINCT FROM NEW.details) OR
       (OLD.color IS DISTINCT FROM NEW.color) OR
       (OLD.organization_id IS DISTINCT FROM NEW.organization_id) THEN
       
       RAISE EXCEPTION 'Only managers can update container details.';
    END IF;

    RETURN NEW;
  END IF;

  -- Neither manager nor member
  RAISE EXCEPTION 'Permission denied.';
END;
$function$;

-- 2. Function for Equipment Update Permissions
CREATE OR REPLACE FUNCTION public.check_equipment_update_permissions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  is_mgr boolean;
  is_mem boolean;
BEGIN
  -- Check if user is manager
  is_mgr := public.is_org_manager(OLD.organization_id);
  
  IF is_mgr THEN
    RETURN NEW; -- Managers can update everything
  END IF;

  -- Check if user is member
  is_mem := public.is_org_member(OLD.organization_id);

  IF is_mem THEN
    -- Check restricted fields
    IF (OLD.name IS DISTINCT FROM NEW.name) OR
       (OLD.details IS DISTINCT FROM NEW.details) OR
       (OLD.image IS DISTINCT FROM NEW.image) OR
       (OLD.color IS DISTINCT FROM NEW.color) OR
       (OLD.organization_id IS DISTINCT FROM NEW.organization_id) THEN
       
       RAISE EXCEPTION 'Only managers can update equipment details.';
    END IF;

    RETURN NEW;
  END IF;

  -- Neither manager nor member
  RAISE EXCEPTION 'Permission denied.';
END;
$function$;

-- 3. Triggers
DROP TRIGGER IF EXISTS check_container_update_permissions_trigger ON public.containers;
CREATE TRIGGER check_container_update_permissions_trigger
  BEFORE UPDATE ON public.containers
  FOR EACH ROW
  EXECUTE FUNCTION public.check_container_update_permissions();

DROP TRIGGER IF EXISTS check_equipment_update_permissions_trigger ON public.equipment;
CREATE TRIGGER check_equipment_update_permissions_trigger
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.check_equipment_update_permissions();

-- 4. RLS Policies
DROP POLICY IF EXISTS "Members can update containers" ON "public"."containers";
CREATE POLICY "Members can update containers"
ON "public"."containers"
FOR UPDATE TO authenticated
USING ( public.is_org_member(organization_id) )
WITH CHECK ( public.is_org_member(organization_id) );

DROP POLICY IF EXISTS "Members can update equipment" ON "public"."equipment";
CREATE POLICY "Members can update equipment"
ON "public"."equipment"
FOR UPDATE TO authenticated
USING ( public.is_org_member(organization_id) )
WITH CHECK ( public.is_org_member(organization_id) );
