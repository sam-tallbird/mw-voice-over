-- ======================================================================
--  ADD DEMO USERS TO SUPABASE AUTH AND CUSTOM USERS TABLES
--  ─────────────────────────────────────────────────────────────────────
--  Run this SQL in Supabase SQL Editor to add demo2-demo10 accounts
-- ======================================================================

-- Note: These password hashes are generated with bcrypt rounds=10
-- The plain passwords are provided in comments for reference

-- First, let's create a function to safely insert auth users
CREATE OR REPLACE FUNCTION create_demo_user(
  user_email text,
  user_password text,
  user_full_name text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  user_id uuid;
  encrypted_pw text;
BEGIN
  -- Generate new UUID for user
  user_id := gen_random_uuid();
  
  -- Hash the password (Note: In production, use proper bcrypt)
  -- For demo purposes, we'll use a simple hash
  encrypted_pw := crypt(user_password, gen_salt('bf', 10));
  
  -- Insert into auth.users table
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    aud,
    role
  ) VALUES (
    user_id,
    '00000000-0000-0000-0000-000000000000',
    user_email,
    encrypted_pw,
    now(),
    now(),
    now(),
    'authenticated',
    'authenticated'
  );
  
  -- Insert into custom users table
  INSERT INTO users (
    id,
    email,
    password_hash,
    email_verified,
    full_name,
    plan,
    max_usage,
    current_usage,
    status,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_email,
    encrypted_pw,
    true,
    COALESCE(user_full_name, split_part(user_email, '@', 1)),
    'demo',
    3, -- Default 3 generations for demo users
    0,
    'active',
    now(),
    now()
  );
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create all the demo users
DO $$
DECLARE
  demo_users record;
  user_id uuid;
BEGIN
  -- Demo user data with emails and passwords
  FOR demo_users IN
    SELECT * FROM (VALUES
      ('demo2@mw.com', 'B9p#5rY7sL3uE6tR', 'Demo User 2'),
      ('demo3@mw.com', 'C4w@8nM1oQ9kI2xV', 'Demo User 3'),
      ('demo4@mw.com', 'D6z%3fH5gJ7bN0cF', 'Demo User 4'),
      ('demo5@mw.com', 'E8t!1dA4hK6yU9sG', 'Demo User 5'),
      ('demo6@mw.com', 'F2m&7vB9jL4wO5pQ', 'Demo User 6'),
      ('demo7@mw.com', 'G5x$4cC8kM1zT6rE', 'Demo User 7'),
      ('demo8@mw.com', 'H9q#2eD7lN3aS8uY', 'Demo User 8'),
      ('demo9@mw.com', 'I3v@6fF0mP5bR1oW', 'Demo User 9'),
      ('demo10@mw.com', 'J7y%9gG4nQ8cL2iX', 'Demo User 10')
    ) AS t(email, password, full_name)
  LOOP
    -- Check if user already exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = demo_users.email) THEN
      user_id := create_demo_user(demo_users.email, demo_users.password, demo_users.full_name);
      RAISE NOTICE 'Created user: % with ID: %', demo_users.email, user_id;
    ELSE
      RAISE NOTICE 'User % already exists, skipping...', demo_users.email;
    END IF;
  END LOOP;
END $$;

-- Clean up the temporary function
DROP FUNCTION IF EXISTS create_demo_user;

-- Verify the users were created
SELECT 
  u.email,
  u.full_name,
  u.plan,
  u.max_usage,
  u.current_usage,
  u.status,
  u.created_at
FROM users u
WHERE u.email LIKE 'demo%@mw.com'
ORDER BY u.email;

-- Also check auth.users table
SELECT 
  id,
  email,
  email_confirmed_at IS NOT NULL as email_confirmed,
  created_at
FROM auth.users
WHERE email LIKE 'demo%@mw.com'
ORDER BY email;

RAISE NOTICE 'Demo users creation completed!';

-- ======================================================================
--  ALTERNATIVE METHOD (If the above doesn't work)
--  ─────────────────────────────────────────────────────────────────────
--  Use this simpler approach that only creates custom users
-- ======================================================================

/*
-- If the above auth.users insertion doesn't work due to permissions,
-- use this alternative that creates users via Supabase Auth API:

-- 1. Create users in custom table only (they'll sign up via frontend)
INSERT INTO users (
  email, password_hash, email_verified, full_name, plan, max_usage, current_usage, status
) VALUES
  ('demo2@mw.com', '$2b$10$TEMP_HASH_2', true, 'Demo User 2', 'demo', 3, 0, 'active'),
  ('demo3@mw.com', '$2b$10$TEMP_HASH_3', true, 'Demo User 3', 'demo', 3, 0, 'active'),
  ('demo4@mw.com', '$2b$10$TEMP_HASH_4', true, 'Demo User 4', 'demo', 3, 0, 'active'),
  ('demo5@mw.com', '$2b$10$TEMP_HASH_5', true, 'Demo User 5', 'demo', 3, 0, 'active'),
  ('demo6@mw.com', '$2b$10$TEMP_HASH_6', true, 'Demo User 6', 'demo', 3, 0, 'active'),
  ('demo7@mw.com', '$2b$10$TEMP_HASH_7', true, 'Demo User 7', 'demo', 3, 0, 'active'),
  ('demo8@mw.com', '$2b$10$TEMP_HASH_8', true, 'Demo User 8', 'demo', 3, 0, 'active'),
  ('demo9@mw.com', '$2b$10$TEMP_HASH_9', true, 'Demo User 9', 'demo', 3, 0, 'active'),
  ('demo10@mw.com', '$2b$10$TEMP_HASH_10', true, 'Demo User 10', 'demo', 3, 0, 'active')
ON CONFLICT (email) DO NOTHING;
*/ 