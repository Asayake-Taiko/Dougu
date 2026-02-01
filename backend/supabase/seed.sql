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
);

-- 2. Create Organizations
INSERT INTO public.organizations (id, name, access_code, manager_id, image)
VALUES
  ('c3333333-3333-3333-3333-333333333333', 'Asayake_Taiko', 'ASAYAKE_2026', 'a1111111-1111-1111-1111-111111111111', 'asayake'),
  ('d4444444-4444-4444-4444-444444444444', 'Kyodo Taiko', 'KYODO_2026', 'a2222222-2222-2222-2222-222222222222', 'default');

-- 3. Add Additional Memberships
INSERT INTO public.org_memberships (id, organization_id, user_id, type, details)
VALUES
  ('e5555555-5555-5555-5555-555555555555', 'd4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'USER', 'Standard Member'),
  ('f6666666-6666-6666-6666-666666666666', 'c3333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', 'USER', 'Standard Member');

-- 4. Create Equipment
DO $$
DECLARE
    kane_asayake_id uuid;
    enak_asayake_id uuid;
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
END $$;