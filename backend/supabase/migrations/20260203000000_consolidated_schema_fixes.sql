-- Consolidated migration for RLS fixes, Constraints, and Security cleanup
-- Replaces migrations 20260202190000 through 20260203000007

-- 1. CLEANUP: Remove redundant functions and triggers from previous iterations
-- The trigger 'prevent_organization_manager_deletion' is replaced by a native Foreign Key constraint (see below).
DROP TRIGGER IF EXISTS check_manager_before_delete ON "public"."org_memberships";
DROP FUNCTION IF EXISTS public.prevent_organization_manager_deletion();
DROP FUNCTION IF EXISTS public.check_user_membership(uuid, uuid); -- Redundant helper
DROP FUNCTION IF EXISTS public.debug_rls_transfer_check(uuid, uuid); -- Debug helper

-- 2. MEMBERSHIP CONSTRAINTS
-- Ensure (organization_id, user_id) is unique. This is required for the Foreign Key target.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'org_memberships_org_user_key') THEN
        ALTER TABLE "public"."org_memberships" ADD CONSTRAINT "org_memberships_org_user_key" UNIQUE (organization_id, user_id);
    END IF;
END $$;

-- 3. ORGANIZATION CONSTRAINTS (Circular Dependency Resolution)
-- Enforce that the Organization Manager MUST be a Member of that Organization.
-- We use a DEFERRABLE Foreign Key to handle the circular dependency during creation:
-- (Org Insert -> Trigger Inserts Membership -> Commit Check)
ALTER TABLE "public"."organizations"
DROP CONSTRAINT IF EXISTS "organizations_manager_membership_fkey";

ALTER TABLE "public"."organizations"
ADD CONSTRAINT "organizations_manager_membership_fkey"
FOREIGN KEY (id, manager_id)
REFERENCES "public"."org_memberships" (organization_id, user_id)
DEFERRABLE INITIALLY DEFERRED;
-- ON DELETE RESTRICT is default, which prevents deleting a membership if they are the manager.

-- 4. ORGANIZATION RLS REFINEMENT
-- Update Policy: Managers can transfer ownership, but ONLY to existing members of the organization.
-- We inspect the 'check' clause (NEW row) to verify the new manager_id is in the members table.
DROP POLICY IF EXISTS "Manager can update organization" ON "public"."organizations";

CREATE POLICY "Manager can update organization"
ON "public"."organizations"
FOR UPDATE
TO authenticated
USING (
  auth.uid() = manager_id -- Only current manager can update
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.org_memberships m
    WHERE m.organization_id = organizations.id         -- Matches the organization being updated
    AND m.user_id = manager_id           -- Matches the NEW manager_id
  )
);

-- 5. MEMBERSHIP RLS REFINEMENT
-- Drop separate/permissive policies if they exist from early setup
DROP POLICY IF EXISTS "Authenticated users can create memberships" ON "public"."org_memberships";

-- Allow Users to Join (Insert themselves as 'USER')
CREATE POLICY "Users can join organizations"
ON "public"."org_memberships"
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND type = 'USER'
);

-- Allow Managers to add Resources (Insert non-USER types, e.g. STORAGE, if we had that type, or just other members if invited - logic specialized)
-- Based on previous requirement: Managers can insert if type != 'USER' (e.g. system usage)
CREATE POLICY "Managers can add resources"
ON "public"."org_memberships"
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_org_manager(organization_id)
  AND type != 'USER'
);
