-- Add unique constraint to prevent duplicate memberships
ALTER TABLE public.org_memberships
ADD CONSTRAINT org_memberships_user_org_unique UNIQUE (user_id, organization_id);
