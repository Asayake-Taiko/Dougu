-- Optimization: Wrap auth.uid() in (select auth.uid()) to prevent per-row re-evaluation
-- Addresses Supabase linter warning: auth_rls_initplan

-- 1. Optimize public.related_org_members
DROP POLICY IF EXISTS "Users can view their own related members" ON public.related_org_members;
CREATE POLICY "Users can view their own related members"
ON public.related_org_members FOR SELECT
TO authenticated
USING (viewer_id = (select auth.uid()));

-- 2. Optimize storage.objects (Profile Images)
DROP POLICY IF EXISTS "View Own Profile Image" ON storage.objects;
CREATE POLICY "View Own Profile Image"
ON storage.objects for select
to authenticated
using (
  bucket_id = 'images' 
  and name like 'profiles/' || (select auth.uid()) || '/%'
);

DROP POLICY IF EXISTS "View Shared Profile Images" ON storage.objects;
CREATE POLICY "View Shared Profile Images"
ON storage.objects for select
to authenticated
using (
  bucket_id = 'images'
  AND EXISTS (
    SELECT 1 
    FROM public.related_org_members rom
    WHERE rom.viewer_id = (select auth.uid())
    AND name LIKE 'profiles/' || rom.target_user_id || '/%'
  )
);

DROP POLICY IF EXISTS "Upload Own Profile Image" ON storage.objects;
CREATE POLICY "Upload Own Profile Image"
ON storage.objects for insert
to authenticated
with check (
  bucket_id = 'images'
  and name like 'profiles/' || (select auth.uid()) || '/%'
);

DROP POLICY IF EXISTS "Update Own Profile Image" ON storage.objects;
CREATE POLICY "Update Own Profile Image"
ON storage.objects for update
to authenticated
using (
  bucket_id = 'images'
  and name like 'profiles/' || (select auth.uid()) || '/%'
)
with check (
  bucket_id = 'images'
  and name like 'profiles/' || (select auth.uid()) || '/%'
);

DROP POLICY IF EXISTS "Delete Own Profile Image" ON storage.objects;
CREATE POLICY "Delete Own Profile Image"
ON storage.objects for delete
to authenticated
using (
  bucket_id = 'images'
  and name like 'profiles/' || (select auth.uid()) || '/%'
);
