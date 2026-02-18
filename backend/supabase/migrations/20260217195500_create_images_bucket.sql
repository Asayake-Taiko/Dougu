-- Create the 'images' bucket
insert into storage.buckets (id, name, public)
values ('images', 'images', true);

-- Policy to allow public access to the 'images' bucket
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'images' );

-- Policy to allow authenticated users to upload to the 'images' bucket
create policy "Authenticated Upload"
on storage.objects for insert
with check ( bucket_id = 'images' and auth.role() = 'authenticated' );
