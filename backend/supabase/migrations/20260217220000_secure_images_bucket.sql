-- Secure the 'images' bucket by making it private
update storage.buckets
set public = false
where id = 'images';

-- Drop existing public/broad policies
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Upload" on storage.objects;

-- Policy: Allow users to view their own profile image
create policy "View Own Profile Image"
on storage.objects for select
to authenticated
using (
  bucket_id = 'images' 
  and name like 'profiles/' || auth.uid() || '/%'
);

-- Policy: Allow users to view profile images of people in their organizations
-- This uses the security invoker view 'related_org_members' to check relationship
create policy "View Shared Profile Images"
on storage.objects for select
to authenticated
using (
  bucket_id = 'images'
  and exists (
    select 1 
    from public.related_org_members rom
    where rom.viewer_id = auth.uid()::text
    and name like 'profiles/' || rom.target_user_id || '/%'
  )
);

-- Policy: Allow users to upload/update ONLY their own profile image
-- Enforces the path convention: profiles/{uid}/*
create policy "Upload Own Profile Image"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'images'
  and name like 'profiles/' || auth.uid() || '/%'
);

-- Policy: Allow users to update (overwrite) their own profile image
create policy "Update Own Profile Image"
on storage.objects for update
to authenticated
using (
  bucket_id = 'images'
  and name like 'profiles/' || auth.uid() || '/%'
)
with check (
  bucket_id = 'images'
  and name like 'profiles/' || auth.uid() || '/%'
);

-- Policy: Allow users to delete their own profile image
create policy "Delete Own Profile Image"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'images'
  and name like 'profiles/' || auth.uid() || '/%'
);

-- Policy: Allow organization members to view organization images
-- Matches paths: organizations/{org_id}/*
create policy "View Organization Images"
on storage.objects for select
to authenticated
using (
  bucket_id = 'images'
  and name like 'organizations/%'
  and public.is_org_member((split_part(name, '/', 2))::uuid)
);

-- Policy: Allow organization managers to upload/update/delete organization images
create policy "Manage Organization Images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'images'
  and name like 'organizations/%'
  and public.is_org_manager((split_part(name, '/', 2))::uuid)
);

create policy "Manage Organization Images Update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'images'
  and name like 'organizations/%'
  and public.is_org_manager((split_part(name, '/', 2))::uuid)
)
with check (
  bucket_id = 'images'
  and name like 'organizations/%'
  and public.is_org_manager((split_part(name, '/', 2))::uuid)
);

create policy "Manage Organization Images Delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'images'
  and name like 'organizations/%'
  and public.is_org_manager((split_part(name, '/', 2))::uuid)
);


-- Trigger Function: Enforce 50 image limit per organization for equipment
CREATE OR REPLACE FUNCTION public.check_org_image_limit()
RETURNS trigger AS $$
DECLARE
  org_id text;
  image_count integer;
BEGIN
  -- Check if the path matches 'organizations/{orgId}/equipment/%'
  -- split_part(name, '/', 1) = 'organizations'
  -- split_part(name, '/', 2) = orgId
  -- split_part(name, '/', 3) = 'equipment'
  
  IF (TG_OP = 'INSERT') THEN
    IF (split_part(NEW.name, '/', 1) = 'organizations' AND split_part(NEW.name, '/', 3) = 'equipment') THEN
      org_id := split_part(NEW.name, '/', 2);
      
      SELECT count(*) INTO image_count
      FROM storage.objects
      WHERE bucket_id = 'images'
      AND name LIKE 'organizations/' || org_id || '/equipment/%';
      
      IF image_count >= 50 THEN
        RAISE EXCEPTION 'Organization has reached the 50 equipment image limit';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Enforce limit on INSERT
DROP TRIGGER IF EXISTS enforce_org_image_limit ON storage.objects;
CREATE TRIGGER enforce_org_image_limit
BEFORE INSERT ON storage.objects
FOR EACH ROW
EXECUTE FUNCTION public.check_org_image_limit();
