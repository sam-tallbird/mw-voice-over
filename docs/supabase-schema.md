# Supabase Database Schema

**Last Updated:** December 2024  
**Version:** 1.1 - Authentication Implementation

## Overview

This document defines the database schema for the MoonWhale Voice-Over application using Supabase. The schema is designed to handle user authentication, usage tracking, and subscription management with a focus on demo users and limit control.

## Tables

### 1. `users` Table

Stores user profiles, authentication data, and subscription information.

```sql
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
```

**Field Descriptions:**
- `id`: Primary key (UUID)
- `email`: User's email address (unique)
- `password_hash`: Hashed password for authentication (bcrypt)
- `plan_type`: Subscription plan ('demo', 'basic', 'pro', 'enterprise')
- `max_usage`: Maximum voice generations allowed per period
- `current_usage`: Current usage count in the current period
- `usage_reset_date`: When the usage counter was last reset
- `is_demo`: Flag to identify demo accounts
- `demo_id`: Human-readable demo identifier (demo1, demo2, etc.)
- `created_at`: Account creation timestamp
- `updated_at`: Last modification timestamp

### 2. `usage_logs` Table

Tracks individual voice generation requests for analytics and debugging.

```sql
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
```

**Field Descriptions:**
- `id`: Primary key (UUID)
- `user_id`: Reference to the user who made the request
- `text_length`: Character count of the input text
- `audio_duration_seconds`: Length of generated audio
- `output_format`: File format (mp3, wav)
- `voice_model`: AI model/voice used
- `success`: Whether the generation was successful
- `error_message`: Error details if generation failed
- `created_at`: Request timestamp

### 3. `plan_limits` Table

Defines the limits and features for each subscription plan.

```sql
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
```

**Field Descriptions:**
- `id`: Primary key (UUID)
- `plan_type`: Plan identifier ('demo', 'basic', 'pro', 'enterprise')
- `max_monthly_usage`: Maximum voice generations per month
- `max_duration_seconds`: Maximum audio length per generation
- `allowed_formats`: Array of supported output formats
- `early_access_voices`: Access to beta/new voices
- `api_access`: API and dashboard access
- `priority_support`: Enhanced support level
- `custom_voices`: Custom voice training capability
- `price_iqd`: Monthly price in Iraqi Dinar

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_demo_id ON users(demo_id);
CREATE INDEX idx_users_plan_type ON users(plan_type);
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX idx_plan_limits_plan_type ON plan_limits(plan_type);
```

## Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_limits ENABLE ROW LEVEL SECURITY;

-- User access policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Usage logs policies
CREATE POLICY "Users can view own usage logs" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage logs" ON usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Plan limits policies
CREATE POLICY "Plan limits are publicly readable" ON plan_limits
  FOR SELECT USING (true);

-- Admin policies (for service role key access)
CREATE POLICY "Service role can manage users" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage usage logs" ON usage_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage plan limits" ON plan_limits
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
```

**Policy Descriptions:**
- **User Policies**: Users can only view and update their own profile data
- **Usage Log Policies**: Users can view and insert their own usage logs
- **Plan Limits Policies**: All authenticated users can read plan information
- **Service Role Policies**: Admin functions can manage all data using service role key

## Initial Data

### Demo Users

```sql
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
```

**Note:** The placeholder password hashes need to be updated with proper bcrypt hashes. See the `docs/update-passwords.sql` file for the SQL commands to update these hashes.

### Demo User Credentials

| User ID | Email | Password |
|---------|-------|----------|
| demo1 | demo1@mw.com | A7k$9mX2nP4qW8vZ |
| demo2 | demo2@mw.com | B9p#5rY7sL3uE6tR |
| demo3 | demo3@mw.com | C4w@8nM1oQ9kI2xV |
| demo4 | demo4@mw.com | D6z%3fH5gJ7bN0cF |
| demo5 | demo5@mw.com | E8t!1dA4hK6yU9sG |
| demo6 | demo6@mw.com | F2m&7vB9jL4wO5pQ |
| demo7 | demo7@mw.com | G5x$4cC8kM1zT6rE |
| demo8 | demo8@mw.com | H9q#2eD7lN3aS8uY |
| demo9 | demo9@mw.com | I3v@6fF0mP5bR1oW |
| demo10 | demo10@mw.com | J7y%9gG4nQ8cL2iX |

### Plan Limits

```sql
INSERT INTO plan_limits (plan_type, max_monthly_usage, max_duration_seconds, allowed_formats, early_access_voices, api_access, priority_support, custom_voices, price_iqd) VALUES
('demo', 3, 90, ARRAY['mp3'], false, false, false, false, NULL),
('basic', 20, 90, ARRAY['mp3'], false, false, false, false, 20000),
('pro', 120, 90, ARRAY['mp3', 'wav'], true, false, false, false, 60000),
('enterprise', -1, 300, ARRAY['mp3', 'wav'], true, true, true, true, NULL);
```

## Database Functions

### Reset Usage Function

```sql
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
```

### Reset Demo Users Function

```sql
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
```

### Check Usage Limit Function

```sql
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
```

### Increment Usage Function

```sql
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
```

### Get User Usage Function

```sql
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
```

**Function Descriptions:**
- **reset_user_usage()**: Reset usage for specific user or all users
- **reset_demo_users()**: Reset usage for all demo users only
- **can_user_generate()**: Check if user has remaining usage quota
- **increment_user_usage()**: Record voice generation and increment counter
- **get_user_usage()**: Get detailed usage information for a user

**Security Note:** All functions use `SECURITY DEFINER` to run with elevated privileges for admin operations.

## Authentication Implementation

### Environment Variables

The following environment variables are required for Supabase authentication:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-secure-admin-password-for-reset-functions
```

### Authentication Components

The following components have been implemented for authentication:

1. **Supabase Client** (`src/lib/supabase.ts`)
   - Client-side and server-side Supabase clients

2. **Authentication Context** (`src/components/AuthProvider.tsx`)
   - Manages user session state across the app

3. **Login UI** (`src/components/LoginForm.tsx` & `src/app/login/page.tsx`)
   - Custom login form + Supabase Auth UI

4. **Dashboard** (`src/app/dashboard/page.tsx`)
   - Protected page showing user info and usage stats

5. **Admin Panel** (`src/app/admin/page.tsx`)
   - Admin interface for resetting usage limits

6. **API Routes**
   - TTS with usage limits (`src/app/api/tts/route.ts`)
   - Admin reset endpoints (`src/app/api/auth/reset-usage/route.ts` & `src/app/api/auth/reset-demo-users/route.ts`)

7. **Route Protection** (`src/middleware.ts`)
   - Redirects unauthenticated users from protected routes

## API Endpoints

### User Management
- `GET /api/user/profile` - Get user profile and usage
- `POST /api/auth/login` - Authenticate user (handled by Supabase Auth)
- `POST /api/auth/reset-usage` - Reset usage (admin only)
- `POST /api/auth/reset-demo-users` - Reset all demo users

### Usage Tracking
- `POST /api/tts` - Generate voice and track usage
- `GET /api/usage/check` - Check if user can generate
- `GET /api/usage/history` - Get usage history

## Password Update Process

To update the placeholder password hashes with proper bcrypt hashes:

1. Generate bcrypt hashes using the `scripts/hash-passwords.js` script
2. Run the SQL commands in `docs/update-passwords.sql` to update the hashes in the database

## Future Enhancements

- **Monthly Reset**: Automatic usage reset on billing cycle
- **Usage Analytics**: Dashboard for usage patterns
- **Plan Upgrades**: User-initiated plan changes
- **API Rate Limiting**: Per-plan API call limits
- **Subscription Management**: Integration with payment providers

---

**Schema Version:** 1.1  
**Compatible with:** Supabase PostgreSQL  
**Required Extensions:** `uuid-ossp` (for UUID generation)
**Required Packages:** `@supabase/supabase-js`, `@supabase/auth-ui-react`, `@supabase/auth-ui-shared`, `@supabase/ssr` 