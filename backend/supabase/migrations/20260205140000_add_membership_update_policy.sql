-- Allow managers to update org_memberships
-- This is needed for updating storage details (image, color)

CREATE POLICY "Managers can update memberships"
ON "public"."org_memberships"
FOR UPDATE TO authenticated
USING ( public.is_org_manager(organization_id) )
WITH CHECK ( public.is_org_manager(organization_id) );
