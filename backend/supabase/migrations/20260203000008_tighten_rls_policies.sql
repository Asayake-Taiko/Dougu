-- Tighten up RLS policies to address security warnings

-- Organizations: Only allow users to create an organization if they are the manager
drop policy if exists "Authenticated users can create organizations" on "public"."organizations";
create policy "Users can create organizations as manager"
on "public"."organizations"
for insert
to authenticated
with check (
  auth.uid() = manager_id
);

-- Org Memberships: Only allow users to create their own membership OR allow managers to create storage
-- Note: This still allows "joining" if the app logic is handled correctly, 
-- but prevents someone from inserting a membership for another person.
drop policy if exists "Authenticated users can create memberships" on "public"."org_memberships";
create policy "Users can join or managers create storage"
on "public"."org_memberships"
for insert
to authenticated
with check (
  (type = 'USER' AND auth.uid() = user_id) OR
  (type = 'STORAGE' AND public.is_org_manager(organization_id))
);
