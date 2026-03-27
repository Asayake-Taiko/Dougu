-- 1. Insert Users
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
)
VALUES
-- Kane Li
(
    '00000000-0000-0000-0000-000000000000',
    'a1111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'kal036@ucsd.edu',
    extensions.crypt('password1', extensions.gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Kane Li"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
),
-- Enak Il
(
    '00000000-0000-0000-0000-000000000000',
    'a2222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'kaneli200456@gmail.com',
    extensions.crypt('password2', extensions.gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Enak Il"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
),
-- TESTUSER1
(
    '00000000-0000-0000-0000-000000000000',
    'a3333333-3333-3333-3333-333333333333',
    'authenticated',
    'authenticated',
    'testuser1@gmail.com',
    extensions.crypt('password1', extensions.gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Test User 1"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
),
-- New User 1
(
    '00000000-0000-0000-0000-000000000000',
    'b1111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'newuser1@gmail.com',
    extensions.crypt('password1', extensions.gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "New User 1"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
),
-- New User 2
(
    '00000000-0000-0000-0000-000000000000',
    'b2222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'newuser2@gmail.com',
    extensions.crypt('password1', extensions.gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "New User 2"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
),
-- New User 3
(
    '00000000-0000-0000-0000-000000000000',
    'b3333333-3333-3333-3333-333333333333',
    'authenticated',
    'authenticated',
    'newuser3@gmail.com',
    extensions.crypt('password1', extensions.gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "New User 3"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
),
-- New User 4
(
    '00000000-0000-0000-0000-000000000000',
    'b4444444-4444-4444-4444-444444444444',
    'authenticated',
    'authenticated',
    'newuser4@gmail.com',
    extensions.crypt('password1', extensions.gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "New User 4"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
),
-- New User 5
(
    '00000000-0000-0000-0000-000000000000',
    'b5555555-5555-5555-5555-555555555555',
    'authenticated',
    'authenticated',
    'newuser5@gmail.com',
    extensions.crypt('password1', extensions.gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "New User 5"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
),
-- New User 6
(
    '00000000-0000-0000-0000-000000000000',
    'b6666666-6666-6666-6666-666666666666',
    'authenticated',
    'authenticated',
    'newuser6@gmail.com',
    extensions.crypt('password1', extensions.gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "New User 6"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
),
-- New User 7
(
    '00000000-0000-0000-0000-000000000000',
    'b7777777-7777-7777-7777-777777777777',
    'authenticated',
    'authenticated',
    'newuser7@gmail.com',
    extensions.crypt('password1', extensions.gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "New User 7"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
),
-- New User 8
(
    '00000000-0000-0000-0000-000000000000',
    'b8888888-8888-8888-8888-888888888888',
    'authenticated',
    'authenticated',
    'newuser8@gmail.com',
    extensions.crypt('password1', extensions.gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "New User 8"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
),
-- New User 9
(
    '00000000-0000-0000-0000-000000000000',
    'b9999999-9999-9999-9999-999999999999',
    'authenticated',
    'authenticated',
    'newuser9@gmail.com',
    extensions.crypt('password1', extensions.gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "New User 9"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
);

-- 2. Create Organizations
INSERT INTO public.organizations (id, name, access_code, manager_id, image, color)
VALUES
  ('c3333333-3333-3333-3333-333333333333', 'Asayake_Taiko', 'ASAYAKE_2026', 'a1111111-1111-1111-1111-111111111111', 'asayake', '#791111'),
  ('d4444444-4444-4444-4444-444444444444', 'Kyodo Taiko', 'KYODO_2026', 'a2222222-2222-2222-2222-222222222222', 'default_org', '#791111');

-- 3. Add Additional Memberships
INSERT INTO public.org_memberships (id, organization_id, user_id, type, details)
VALUES
  ('a5555555-5555-5555-5555-555555555555', 'd4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'USER', 'Standard Member'),
  ('a6666666-6666-6666-6666-666666666666', 'c3333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', 'USER', 'Standard Member'),
  ('f1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'USER', 'Standard Member'),
  ('f2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 'USER', 'Standard Member'),
  ('f3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'USER', 'Standard Member'),
  ('f4444444-4444-4444-4444-444444444444', 'c3333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444', 'USER', 'Standard Member'),
  ('f5555555-5555-5555-5555-555555555555', 'c3333333-3333-3333-3333-333333333333', 'b5555555-5555-5555-5555-555555555555', 'USER', 'Standard Member'),
  ('f6666666-6666-6666-6666-666666666666', 'c3333333-3333-3333-3333-333333333333', 'b6666666-6666-6666-6666-666666666666', 'USER', 'Standard Member'),
  ('f7777777-7777-7777-7777-777777777777', 'c3333333-3333-3333-3333-333333333333', 'b7777777-7777-7777-7777-777777777777', 'USER', 'Standard Member'),
  ('f8888888-8888-8888-8888-888888888888', 'c3333333-3333-3333-3333-333333333333', 'b8888888-8888-8888-8888-888888888888', 'USER', 'Standard Member'),
  ('f9999999-9999-9999-9999-999999999999', 'c3333333-3333-3333-3333-333333333333', 'b9999999-9999-9999-9999-999999999999', 'USER', 'Standard Member');

-- 4. Create Equipment
DO $$
DECLARE
    kane_asayake_id uuid;
    enak_asayake_id uuid;
    type_name text;
BEGIN
    -- Get the IDs generated from the trigger
    SELECT id INTO kane_asayake_id FROM public.org_memberships WHERE user_id = 'a1111111-1111-1111-1111-111111111111' AND organization_id = 'c3333333-3333-3333-3333-333333333333';
    SELECT id INTO enak_asayake_id FROM public.org_memberships WHERE user_id = 'a2222222-2222-2222-2222-222222222222' AND organization_id = 'c3333333-3333-3333-3333-333333333333';

    -- Insert 6 New Chu for Kane Li
    FOR i IN 1..6 LOOP
        INSERT INTO public.equipment (name, organization_id, assigned_to, image, color, details)
        VALUES ('New Chu', 'c3333333-3333-3333-3333-333333333333', kane_asayake_id, 'chu', '#ff7373', 'Brand new condition');
    END LOOP;

    -- Insert 6 Old Chu for Enak Il
    FOR i IN 1..6 LOOP
        INSERT INTO public.equipment (name, organization_id, assigned_to, image, color, details)
        VALUES ('Old Chu', 'c3333333-3333-3333-3333-333333333333', enak_asayake_id, 'chu', '#ab2020', 'Vintage condition');
    END LOOP;

    -- Insert a Container for Kane Li
    INSERT INTO public.containers (id, name, organization_id, assigned_to, color, details)
    VALUES ('aaaa1111-aaaa-1111-aaaa-111111111111', 'Sample Container', 'c3333333-3333-3333-3333-333333333333', kane_asayake_id, '#ddd', 'Container with 3 items');

    -- Insert 3 items into the container
    INSERT INTO public.equipment (name, organization_id, assigned_to, container_id, image, color, details)
    VALUES 
      ('Item 1', 'c3333333-3333-3333-3333-333333333333', kane_asayake_id, 'aaaa1111-aaaa-1111-aaaa-111111111111', 'bachi', '#ff7373', 'Item inside container'),
      ('Item 2', 'c3333333-3333-3333-3333-333333333333', kane_asayake_id, 'aaaa1111-aaaa-1111-aaaa-111111111111', 'kane', '#ff7373', 'Item inside container'),
      ('Item 3', 'c3333333-3333-3333-3333-333333333333', kane_asayake_id, 'aaaa1111-aaaa-1111-aaaa-111111111111', 'bells', '#ff7373', 'Item inside container');

    -- Insert 5 Storages (Memberships of type STORAGE)
    INSERT INTO public.org_memberships (id, organization_id, type, storage_name, details)
    VALUES
      ('aaaa2222-aaaa-2222-aaaa-222222222222', 'c3333333-3333-3333-3333-333333333333', 'STORAGE', 'Storage 1', 'Bulk storage 1'),
      ('aaaa3333-aaaa-3333-aaaa-333333333333', 'c3333333-3333-3333-3333-333333333333', 'STORAGE', 'Storage 2', 'Bulk storage 2'),
      ('aaaa4444-aaaa-4444-aaaa-444444444444', 'c3333333-3333-3333-3333-333333333333', 'STORAGE', 'Storage 3', 'Bulk storage 3'),
      ('aaaa5555-aaaa-5555-aaaa-555555555555', 'c3333333-3333-3333-3333-333333333333', 'STORAGE', 'Storage 4', 'Bulk storage 4'),
      ('aaaa6666-aaaa-6666-aaaa-666666666666', 'c3333333-3333-3333-3333-333333333333', 'STORAGE', 'Storage 5', 'Bulk storage 5');

    -- Insert 10 different types of equipment, 3 of each
    FOREACH type_name IN ARRAY ARRAY['Bachi', 'Kane', 'Chappa', 'Tebachi', 'Stand', 'Mat', 'Drum Covering', 'Cables', 'Cases', 'Mic'] LOOP
        FOR i IN 1..3 LOOP
            INSERT INTO public.equipment (name, organization_id, assigned_to, image, color, details)
            VALUES (type_name || ' ' || i, 'c3333333-3333-3333-3333-333333333333', kane_asayake_id, 'default_image', '#999999', 'Bulk added equipment');
        END LOOP;
    END LOOP;
END $$;