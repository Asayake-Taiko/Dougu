-- Migration to update bucket limits for 'images'

-- Ensure the bucket is private (matches security requirements)
update storage.buckets
set public = false,
    file_size_limit = 204800, -- 200KB in bytes
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp']
where id = 'images';
