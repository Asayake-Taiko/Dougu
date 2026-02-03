-- Drop the overly permissive policy
DROP POLICY "Authenticated users can create memberships" ON "public"."org_memberships";

-- Policy for Users joining an organization
-- They can only insert if the type is 'USER' and they are inserting for themselves
CREATE POLICY "Users can join organizations"
ON "public"."org_memberships"
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND type = 'USER'
);

-- Policy for Managers adding resources (like Storages)
-- Managers can insert rows for their organization if the type is NOT 'USER' (e.g., STORAGE)
CREATE POLICY "Managers can add resources"
ON "public"."org_memberships"
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_org_manager(organization_id)
  AND type != 'USER'
);
