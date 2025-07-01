# MoonWhale Voice-Over - Complete Supabase Database Schema

**Version:** 2.0  
**Last Updated:** December 2024  
**Database:** PostgreSQL 15 (Supabase)

## 📋 Overview

This schema provides a complete foundation for the MoonWhale Voice-Over TTS SaaS application with:

- ✅ **Complete user management** with authentication
- ✅ **Strict usage control** with admin overrides  
- ✅ **Full generation history** and tracking
- ✅ **Iraqi voice catalog** properly structured
- ✅ **Monthly analytics** automatically calculated
- ✅ **Admin control functions** for user management
- ✅ **Performance optimized** with proper indexes
- ✅ **Data consistency** with automatic triggers

## 🚀 Quick Setup

1. **Create new Supabase project**
2. **Copy and run the complete schema** (see below)
3. **Update your environment variables**
4. **Test with seed data**

## 📊 Database Schema

### Extensions & Types

```sql
-- ======================================================================
--  MOONWHALE VOICE-OVER - COMPLETE DATABASE SCHEMA (PostgreSQL)
--  ─────────────────────────────────────────────────────────────────────
--  • Full usage control and user management
--  • Complete generation history and analytics
--  • Iraqi voice catalog
--  • Admin control functions
--  • Ready for scaling to paid plans
-- ======================================================================

-- 🔧 Extensions ---------------------------------------------------------
create extension if not exists "pgcrypto";   -- for gen_random_uuid()
create extension if not exists "uuid-ossp";  -- alternative UUID generation

-- 🎨 ENUM TYPES --------------------------------------------------------
create type user_status as enum ('active', 'paused', 'banned');
create type plan_type as enum ('demo', 'basic', 'pro', 'enterprise');
create type generation_status as enum ('processing', 'completed', 'failed');
create type voice_gender as enum ('male', 'female');
```

### Core Tables

#### 1. Users Table

```sql
-- 👤 USERS TABLE -------------------------------------------------------
create table users (
  id uuid primary key default gen_random_uuid(),
  
  -- AUTHENTICATION
  email text unique not null,
  password_hash text not null,
  email_verified boolean not null default false,
  
  -- PROFILE
  full_name text,
  plan plan_type not null default 'demo',
  status user_status not null default 'active',
  
  -- USAGE CONTROL
  max_usage integer not null default 3,
  current_usage integer not null default 0,
  usage_reset_date date not null default date_trunc('month', now()),
  custom_limit integer, -- Admin override for specific users
  
  -- BILLING (for future)
  stripe_customer_id text,
  
  -- TRACKING
  ip_address text,
  user_agent text,
  last_login_at timestamptz,
  
  -- TIMESTAMPS
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

#### 2. Voices Table

```sql
-- 🔉 VOICES TABLE ------------------------------------------------------
create table voices (
  id uuid primary key default gen_random_uuid(),
  
  -- VOICE IDENTITY
  google_api_name text not null unique,     -- 'puck', 'kore', etc.
  display_name text not null,               -- 'Bashar', 'Razan'
  arabic_name text not null,                -- 'بشار', 'رزان'
  
  -- CHARACTERISTICS
  characteristics text not null,            -- 'Upbeat', 'Firm', etc.
  gender voice_gender not null,
  language text not null default 'ar-IQ',  -- Iraqi Arabic
  dialect text not null default 'iraqi',
  
  -- METADATA
  description text,
  sample_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  
  -- TIMESTAMPS
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

#### 3. Generations Table

```sql
-- 🎙️ GENERATIONS TABLE (Complete History) -----------------------------
create table generations (
  id uuid primary key default gen_random_uuid(),
  
  -- RELATIONSHIPS
  user_id uuid not null references users(id) on delete cascade,
  voice_id uuid not null references voices(id),
  
  -- INPUT DATA
  input_text text not null,
  char_count integer not null,
  temperature numeric(3,2) not null default 1.0,
  
  -- OUTPUT DATA (UPDATED FOR STORAGE)
  audio_url text,                          -- Public URL from Supabase Storage
  storage_path text,                       -- Internal storage path
  duration_seconds integer,
  file_size_bytes integer,
  
  -- TRACKING
  ip_address text,
  user_agent text,
  
  -- STATUS
  status generation_status not null default 'processing',
  error_message text,
  
  -- TIMESTAMPS
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
```

#### 4. Monthly Usage Summary Table

```sql
-- 📊 MONTHLY USAGE SUMMARY (for analytics) ----------------------------
create table monthly_usage_summary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  
  -- PERIOD
  year integer not null,
  month integer not null,
  
  -- USAGE STATS
  total_generations integer not null default 0,
  total_characters integer not null default 0,
  total_seconds integer not null default 0,
  total_file_size_bytes bigint not null default 0,
  
  -- TIMESTAMPS
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- UNIQUE CONSTRAINT
  unique(user_id, year, month)
);
```

### Performance Indexes

```sql
-- 🗜 INDEXES -----------------------------------------------------------
create index idx_users_email on users(email);
create index idx_users_status on users(status);
create index idx_users_plan on users(plan);
create index idx_users_usage_reset on users(usage_reset_date);

create index idx_voices_active on voices(is_active);
create index idx_voices_gender on voices(gender);
create index idx_voices_sort on voices(sort_order);

create index idx_generations_user_created on generations(user_id, created_at desc);
create index idx_generations_status on generations(status);
create index idx_generations_voice on generations(voice_id);
create index idx_generations_created_at on generations(created_at desc);

create index idx_monthly_summary_user_period on monthly_usage_summary(user_id, year, month);
```

## 🔧 Utility Functions

### User Management Functions

```sql
-- Function to increment user usage
create or replace function increment_user_usage(user_id uuid)
returns void as $$
begin
  update users 
  set current_usage = current_usage + 1,
      updated_at = now()
  where id = user_id;
end;
$$ language plpgsql;

-- Function to reset user usage (admin)
create or replace function reset_user_usage(user_id uuid)
returns void as $$
begin
  update users 
  set current_usage = 0,
      usage_reset_date = current_date,
      updated_at = now()
  where id = user_id;
end;
$$ language plpgsql;

-- Function to set custom user limit (admin)
create or replace function set_user_custom_limit(user_id uuid, new_limit integer)
returns void as $$
begin
  update users 
  set custom_limit = new_limit,
      updated_at = now()
  where id = user_id;
end;
$$ language plpgsql;

-- Function to ban/unban user (admin)
create or replace function set_user_status(user_id uuid, new_status user_status)
returns void as $$
begin
  update users 
  set status = new_status,
      updated_at = now()
  where id = user_id;
end;
$$ language plpgsql;

-- Function to check if user can generate
create or replace function can_user_generate(user_id uuid)
returns boolean as $$
declare
  user_record record;
  effective_limit integer;
begin
  select * into user_record from users where id = user_id;
  
  if not found or user_record.status != 'active' then
    return false;
  end if;
  
  -- Use custom limit if set, otherwise use plan limit
  effective_limit := coalesce(user_record.custom_limit, user_record.max_usage);
  
  return user_record.current_usage < effective_limit;
end;
$$ language plpgsql;
```

### Analytics Functions

```sql
-- Function to update monthly usage summary
create or replace function update_monthly_usage_summary()
returns trigger as $$
declare
  generation_year integer;
  generation_month integer;
begin
  -- Only process completed generations
  if NEW.status = 'completed' then
    generation_year := extract(year from NEW.created_at);
    generation_month := extract(month from NEW.created_at);
    
    insert into monthly_usage_summary (
      user_id, year, month, total_generations, total_characters, 
      total_seconds, total_file_size_bytes, updated_at
    )
    values (
      NEW.user_id, generation_year, generation_month, 1, NEW.char_count,
      coalesce(NEW.duration_seconds, 0), coalesce(NEW.file_size_bytes, 0), now()
    )
    on conflict (user_id, year, month) 
    do update set
      total_generations = monthly_usage_summary.total_generations + 1,
      total_characters = monthly_usage_summary.total_characters + NEW.char_count,
      total_seconds = monthly_usage_summary.total_seconds + coalesce(NEW.duration_seconds, 0),
      total_file_size_bytes = monthly_usage_summary.total_file_size_bytes + coalesce(NEW.file_size_bytes, 0),
      updated_at = now();
  end if;
  
  return NEW;
end;
$$ language plpgsql;

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;
```

### Database Triggers

```sql
-- Trigger to automatically update monthly usage summary
create trigger trigger_update_monthly_usage
  after insert or update on generations
  for each row execute function update_monthly_usage_summary();

-- Triggers to update updated_at timestamp
create trigger trigger_users_updated_at before update on users
  for each row execute function update_updated_at_column();

create trigger trigger_voices_updated_at before update on voices
  for each row execute function update_updated_at_column();
```

## 🗄️ Supabase Storage Setup

### Storage Buckets Configuration

```sql
-- Note: Storage buckets are created via Supabase Dashboard or Storage API
-- Main bucket for audio files
-- Bucket name: 'voice-overs'
-- Public: false (controlled access)
```

### Storage Policies (Row Level Security)

```sql
-- Allow users to upload their own voice-overs
create policy "Users can upload own voice files" on storage.objects
for insert with check (
  bucket_id = 'voice-overs' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own voice-overs
create policy "Users can view own voice files" on storage.objects
for select using (
  bucket_id = 'voice-overs' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own voice-overs
create policy "Users can delete own voice files" on storage.objects
for delete using (
  bucket_id = 'voice-overs' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Service role can manage all files (for admin/cleanup)
create policy "Service role full access to voice files" on storage.objects
for all using (auth.jwt() ->> 'role' = 'service_role');
```

## 🌱 Seed Data

### Iraqi Voices Catalog

```sql
-- 🔉 IRAQI VOICES ------------------------------------------------------
insert into voices (
  google_api_name, display_name, arabic_name, characteristics, gender, sort_order
) values
  ('puck', 'Bashar', 'بشار', 'Upbeat', 'male', 1),
  ('kore', 'Razan', 'رزان', 'Firm', 'female', 2),
  ('fenrir', 'Firas', 'فراس', 'Excitable', 'male', 3),
  ('leda', 'Zahra', 'زهراء', 'Youthful', 'female', 4),
  ('orus', 'Qays', 'قيس', 'Firm', 'male', 5),
  ('aoede', 'Sama', 'سما', 'Breezy', 'female', 6),
  ('callirrhoe', 'Rowaida', 'رويدا', 'Easy-going', 'female', 7),
  ('enceladus', 'Naseem', 'نسيم', 'Breathy', 'male', 8),
  ('sadachbia', 'Marah', 'مرح', 'Lively', 'male', 9),
  ('zephyr', 'Sarah', 'سارة', 'Gentle', 'female', 10);
```

### Demo Users (Optional)

```sql
-- 👤 DEMO USERS (Optional - for testing) ------------------------------
-- Note: Replace password hashes with real bcrypt hashes
insert into users (email, password_hash, plan, max_usage, full_name) values
  ('demo1@moonwhale.com', '$2b$10$REPLACE_WITH_REAL_HASH_1', 'demo', 5, 'Demo User 1'),
  ('demo2@moonwhale.com', '$2b$10$REPLACE_WITH_REAL_HASH_2', 'demo', 5, 'Demo User 2'),
  ('admin@moonwhale.com', '$2b$10$REPLACE_WITH_REAL_HASH_3', 'enterprise', 1000, 'Admin User');
```

## 📊 Useful Admin Queries

### User Management Queries

```sql
-- View all users with usage stats
select 
  u.email,
  u.plan,
  u.status,
  u.current_usage,
  coalesce(u.custom_limit, u.max_usage) as effective_limit,
  round((u.current_usage::float / coalesce(u.custom_limit, u.max_usage)) * 100, 1) as usage_percent,
  count(g.id) as total_generations,
  u.created_at
from users u
left join generations g on u.id = g.user_id and g.status = 'completed'
group by u.id
order by u.created_at desc;

-- Find heavy users (approaching limits)
select 
  u.email,
  u.current_usage,
  coalesce(u.custom_limit, u.max_usage) as limit,
  round((u.current_usage::float / coalesce(u.custom_limit, u.max_usage)) * 100, 1) as usage_percent
from users u
where u.current_usage::float / coalesce(u.custom_limit, u.max_usage) > 0.8
  and u.status = 'active'
order by usage_percent desc;

-- View user generation history
select 
  g.created_at,
  v.display_name as voice,
  v.arabic_name,
  substring(g.input_text, 1, 50) || '...' as text_preview,
  g.char_count,
  g.duration_seconds,
  g.status
from generations g
join voices v on g.voice_id = v.id
where g.user_id = $1
order by g.created_at desc
limit 50;
```

### Analytics Queries

```sql
-- Monthly usage analytics
select 
  year,
  month,
  sum(total_generations) as total_gens,
  sum(total_characters) as total_chars,
  sum(total_seconds) as total_audio_seconds,
  count(distinct user_id) as active_users
from monthly_usage_summary
group by year, month
order by year desc, month desc;

-- Voice popularity
select 
  v.display_name,
  v.arabic_name,
  v.gender,
  count(g.id) as usage_count,
  round(avg(g.duration_seconds), 1) as avg_duration
from voices v
join generations g on v.id = g.voice_id
where g.status = 'completed'
  and g.created_at >= now() - interval '30 days'
group by v.id, v.display_name, v.arabic_name, v.gender
order by usage_count desc;

-- Daily active users
select 
  date(g.created_at) as date,
  count(distinct g.user_id) as active_users,
  count(g.id) as total_generations
from generations g
where g.created_at >= now() - interval '30 days'
  and g.status = 'completed'
group by date(g.created_at)
order by date desc;
```

## 🔐 Row Level Security (RLS)

### Enable RLS

```sql
-- Enable RLS on all tables
alter table users enable row level security;
alter table voices enable row level security;
alter table generations enable row level security;
alter table monthly_usage_summary enable row level security;
```

### RLS Policies

```sql
-- Users can view and update their own profile
create policy "Users can view own profile" on users
  for select using (auth.uid()::text = id::text);

create policy "Users can update own profile" on users
  for update using (auth.uid()::text = id::text);

-- All authenticated users can view active voices
create policy "Authenticated users can view active voices" on voices
  for select using (is_active = true and auth.role() = 'authenticated');

-- Users can view their own generations
create policy "Users can view own generations" on generations
  for select using (auth.uid()::text = user_id::text);

create policy "Users can insert own generations" on generations
  for insert with check (auth.uid()::text = user_id::text);

-- Users can view their own usage summary
create policy "Users can view own usage summary" on monthly_usage_summary
  for select using (auth.uid()::text = user_id::text);

-- Service role can manage all data (for admin functions)
create policy "Service role full access users" on users
  for all using (auth.jwt() ->> 'role' = 'service_role');

create policy "Service role full access voices" on voices
  for all using (auth.jwt() ->> 'role' = 'service_role');

create policy "Service role full access generations" on generations
  for all using (auth.jwt() ->> 'role' = 'service_role');

create policy "Service role full access usage summary" on monthly_usage_summary
  for all using (auth.jwt() ->> 'role' = 'service_role');
```

## 🚀 Implementation Steps

### 1. Set up Supabase Project

1. Create new Supabase project (or use existing)
2. Go to SQL Editor
3. Copy and paste the complete schema above
4. Run the script

### 2. Create Storage Bucket

**Via Supabase Dashboard:**
1. Go to Storage → Buckets
2. Click "New Bucket"
3. Name: `voice-overs`
4. Public: **false** (we'll control access via RLS)
5. Click "Create Bucket"

**Via SQL (Alternative):**
```sql
-- Create bucket via SQL
insert into storage.buckets (id, name, public) 
values ('voice-overs', 'voice-overs', false);
```

### 3. Set up Storage Policies

Run the storage RLS policies from the schema above in SQL Editor.

### 4. Configure Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key
```

### 5. Test the Schema

```sql
-- Test voice insertion worked
select count(*) from voices where is_active = true;
-- Should return 10

-- Test user creation
insert into users (email, password_hash, full_name) 
values ('test@example.com', 'temp_hash', 'Test User');

-- Test generation tracking
select can_user_generate((select id from users where email = 'test@example.com'));
-- Should return true

-- Test storage bucket
select * from storage.buckets where id = 'voice-overs';
-- Should return the bucket
```

### 6. Update Application Code

1. **TTS API** - Save audio files to Supabase Storage
2. **Audio Player** - Load from storage URLs
3. **User Dashboard** - Show saved voice-overs history
4. **Admin Panel** - Manage storage and usage

## 📝 Notes

- **Password Hashing**: Use bcrypt with salt rounds ≥ 10
- **File Storage**: Consider Supabase Storage for audio files
- **Backups**: Enable automatic backups in Supabase
- **Monitoring**: Set up logging for generation failures
- **Scaling**: Consider read replicas for analytics queries

## 🔄 Future Enhancements

- **Payment Integration**: Add Stripe webhook handlers
- **Email Verification**: Implement email confirmation flow
- **API Keys**: Add API key system for developer access
- **Webhooks**: Add webhook system for third-party integrations
- **Caching**: Add Redis for frequently accessed data

---

**Created for MoonWhale Voice-Over TTS Platform**  
**Iraqi Arabic Text-to-Speech Service** 