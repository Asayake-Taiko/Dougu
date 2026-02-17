-- Redefine related_org_members as security invoker to resolve lint warning.
-- This ensures the view respects the RLS of the querying user.
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

-- Fix function_search_path_mutable warnings by setting explicit search_path.
-- This is a security best practice to prevent search path hijacking.

-- 1. Fix delete_user
ALTER FUNCTION public.delete_user(uuid) SET search_path = public;

-- 2. Fix reassign_and_delete_user
ALTER FUNCTION public.reassign_and_delete_user(uuid) SET search_path = public;

-- 3. Fix get_user_id_by_email
ALTER FUNCTION public.get_user_id_by_email(text) SET search_path = public;

