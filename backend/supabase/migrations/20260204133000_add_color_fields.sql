-- Add color field to profiles
ALTER TABLE public.profiles ADD COLUMN color TEXT NOT NULL DEFAULT '#791111';

-- Add color field to organizations
ALTER TABLE public.organizations ADD COLUMN color TEXT NOT NULL DEFAULT '#791111';

-- Add color field to org_memberships (optional)
ALTER TABLE public.org_memberships ADD COLUMN color TEXT;
