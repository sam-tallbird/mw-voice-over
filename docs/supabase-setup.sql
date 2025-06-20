-- =====================================================
-- MoonWhale Voice-Over Supabase Database Setup
-- Version: 1.1 - Authentication Implementation
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Users table: Store user profiles and usage limits
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  plan_type VARCHAR(50) NOT NULL DEFAULT 'demo',
  max_usage INTEGER NOT NULL DEFAULT 3,
  current_usage INTEGER NOT NULL DEFAULT 0,
  usage_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_demo BOOLEAN NOT NULL DEFAULT false,
  demo_id VARCHAR(20) UNIQUE, -- For demo1, demo2, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage logs table: Track individual voice generation requests
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text_length INTEGER NOT NULL,
  audio_duration_seconds DECIMAL(10,2),
  output_format VARCHAR(10) NOT NULL DEFAULT 'mp3',
  voice_model VARCHAR(100),
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plan limits table: Define subscription plan features and limits
CREATE TABLE plan_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type VARCHAR(50) UNIQUE NOT NULL,
  max_monthly_usage INTEGER NOT NULL,
  max_duration_seconds INTEGER NOT NULL DEFAULT 90, -- 1.5 minutes
  allowed_formats TEXT[] NOT NULL DEFAULT ARRAY['mp3'],
  early_access_voices BOOLEAN NOT NULL DEFAULT false,
  api_access BOOLEAN NOT NULL DEFAULT false,
  priority_support BOOLEAN NOT NULL DEFAULT false,
  custom_voices BOOLEAN NOT NULL DEFAULT false,
  price_iqd INTEGER, -- Price in Iraqi Dinar
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_demo_id ON users(demo_id);
CREATE INDEX idx_users_plan_type ON users(plan_type);
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX idx_plan_limits_plan_type ON plan_limits(plan_type);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_limits ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can only view their own usage logs
CREATE POLICY "Users can view own usage logs" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage logs" ON usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Plan limits are readable by all authenticated users
CREATE POLICY "Plan limits are publicly readable" ON plan_limits
  FOR SELECT USING (true);

-- Admin policies (for service role key access)
CREATE POLICY "Service role can manage users" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage usage logs" ON usage_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage plan limits" ON plan_limits
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 4. DATABASE FUNCTIONS
-- =====================================================

-- Function to reset user usage (individual or all users)
CREATE OR REPLACE FUNCTION reset_user_usage(user_id_param UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  IF user_id_param IS NULL THEN
    -- Reset all users
    UPDATE users 
    SET current_usage = 0, 
        usage_reset_date = NOW(),
        updated_at = NOW();
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
  ELSE
    -- Reset specific user
    UPDATE users 
    SET current_usage = 0, 
        usage_reset_date = NOW(),
        updated_at = NOW()
    WHERE id = user_id_param;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
  END IF;
  
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset only demo users
CREATE OR REPLACE FUNCTION reset_demo_users()
RETURNS INTEGER AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE users 
  SET current_usage = 0, 
      usage_reset_date = NOW(),
      updated_at = NOW()
  WHERE is_demo = true;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can generate voice
CREATE OR REPLACE FUNCTION can_user_generate(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
BEGIN
  SELECT current_usage, max_usage
  INTO user_record
  FROM users
  WHERE id = user_id_param;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  RETURN user_record.current_usage < user_record.max_usage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment user usage and log the generation
CREATE OR REPLACE FUNCTION increment_user_usage(
  user_id_param UUID,
  text_length_param INTEGER,
  audio_duration_param DECIMAL DEFAULT NULL,
  output_format_param VARCHAR DEFAULT 'mp3',
  voice_model_param VARCHAR DEFAULT NULL,
  success_param BOOLEAN DEFAULT true,
  error_message_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  can_generate BOOLEAN;
BEGIN
  -- Check if user can generate
  SELECT can_user_generate(user_id_param) INTO can_generate;
  
  IF NOT can_generate THEN
    RETURN FALSE;
  END IF;
  
  -- Increment usage
  UPDATE users 
  SET current_usage = current_usage + 1,
      updated_at = NOW()
  WHERE id = user_id_param;
  
  -- Log the usage
  INSERT INTO usage_logs (
    user_id, 
    text_length, 
    audio_duration_seconds, 
    output_format, 
    voice_model, 
    success, 
    error_message
  ) VALUES (
    user_id_param, 
    text_length_param, 
    audio_duration_param, 
    output_format_param, 
    voice_model_param, 
    success_param, 
    error_message_param
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user usage info
CREATE OR REPLACE FUNCTION get_user_usage(user_id_param UUID)
RETURNS TABLE(
  current_usage INTEGER,
  max_usage INTEGER,
  usage_remaining INTEGER,
  plan_type VARCHAR,
  last_reset TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.current_usage,
    u.max_usage,
    (u.max_usage - u.current_usage) as usage_remaining,
    u.plan_type,
    u.usage_reset_date
  FROM users u
  WHERE u.id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. INSERT INITIAL DATA
-- =====================================================

-- Insert plan limits (matches your pricing page)
INSERT INTO plan_limits (plan_type, max_monthly_usage, max_duration_seconds, allowed_formats, early_access_voices, api_access, priority_support, custom_voices, price_iqd) VALUES
('demo', 3, 90, ARRAY['mp3'], false, false, false, false, NULL),
('basic', 20, 90, ARRAY['mp3'], false, false, false, false, 20000),
('pro', 120, 90, ARRAY['mp3', 'wav'], true, false, false, false, 60000),
('enterprise', -1, 300, ARRAY['mp3', 'wav'], true, true, true, true, NULL);

-- Insert demo users (passwords will need to be hashed in your application)
-- Note: These are placeholder hashes - you'll need to hash the actual passwords
INSERT INTO users (email, password_hash, plan_type, max_usage, is_demo, demo_id) VALUES
('demo1@mw.com', 'PLACEHOLDER_HASH_A7k$9mX2nP4qW8vZ', 'demo', 3, true, 'demo1'),
('demo2@mw.com', 'PLACEHOLDER_HASH_B9p#5rY7sL3uE6tR', 'demo', 3, true, 'demo2'),
('demo3@mw.com', 'PLACEHOLDER_HASH_C4w@8nM1oQ9kI2xV', 'demo', 3, true, 'demo3'),
('demo4@mw.com', 'PLACEHOLDER_HASH_D6z%3fH5gJ7bN0cF', 'demo', 3, true, 'demo4'),
('demo5@mw.com', 'PLACEHOLDER_HASH_E8t!1dA4hK6yU9sG', 'demo', 3, true, 'demo5'),
('demo6@mw.com', 'PLACEHOLDER_HASH_F2m&7vB9jL4wO5pQ', 'demo', 3, true, 'demo6'),
('demo7@mw.com', 'PLACEHOLDER_HASH_G5x$4cC8kM1zT6rE', 'demo', 3, true, 'demo7'),
('demo8@mw.com', 'PLACEHOLDER_HASH_H9q#2eD7lN3aS8uY', 'demo', 3, true, 'demo8'),
('demo9@mw.com', 'PLACEHOLDER_HASH_I3v@6fF0mP5bR1oW', 'demo', 3, true, 'demo9'),
('demo10@mw.com', 'PLACEHOLDER_HASH_J7y%9gG4nQ8cL2iX', 'demo', 3, true, 'demo10');

-- =====================================================
-- 6. VERIFICATION QUERIES (Optional - for testing)
-- =====================================================

-- Uncomment these to test your setup:

-- Check if tables were created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check demo users
-- SELECT demo_id, email, current_usage, max_usage FROM users WHERE is_demo = true ORDER BY demo_id;

-- Check plan limits
-- SELECT plan_type, max_monthly_usage, price_iqd FROM plan_limits ORDER BY 
--   CASE plan_type 
--     WHEN 'demo' THEN 1 
--     WHEN 'basic' THEN 2 
--     WHEN 'pro' THEN 3 
--     WHEN 'enterprise' THEN 4 
--   END;

-- Test reset function
-- SELECT reset_demo_users();

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

-- Your database is now ready with:
-- ✅ 3 tables (users, usage_logs, plan_limits)
-- ✅ 10 demo users (demo1@mw.com through demo10@mw.com)
-- ✅ 4 subscription plans (demo, basic, pro, enterprise)
-- ✅ Usage tracking and reset functions
-- ✅ Row Level Security policies
-- ✅ Performance indexes

-- Next steps:
-- 1. Update password hashes with real bcrypt hashes
-- 2. Set up your Supabase client in Next.js
-- 3. Create API endpoints to use these functions
-- 4. Test the reset functionality

-- For password hashing, you'll need to:
-- UPDATE users SET password_hash = '$2b$10$actual_bcrypt_hash_here' WHERE demo_id = 'demo1';
-- (Repeat for each demo user with their actual hashed password) 