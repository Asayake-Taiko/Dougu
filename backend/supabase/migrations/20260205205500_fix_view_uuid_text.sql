-- Recreate view with text IDs to avoid casting issues in PowerSync
DROP VIEW IF EXISTS public.related_org_members;

CREATE OR REPLACE VIEW public.related_org_members AS
SELECT 
  my_om.user_id::text as viewer_id,
  other_om.user_id::text as target_user_id,
  other_om.organization_id
FROM org_memberships my_om
JOIN org_memberships other_om ON my_om.organization_id = other_om.organization_id;

GRANT SELECT ON public.related_org_members TO authenticated;
GRANT SELECT ON public.related_org_members TO service_role;
GRANT SELECT ON public.related_org_members TO powersync_role;
