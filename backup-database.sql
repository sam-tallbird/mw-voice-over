-- ======================================================================
--  MOONWHALE VOICE-OVER - DATABASE BACKUP SCRIPT
--  ─────────────────────────────────────────────────────────────────────
--  Run this in Supabase SQL Editor to create a backup before RLS setup
--  This exports your data as INSERT statements for easy restoration
-- ======================================================================

-- ======================================================================
--  BACKUP TABLE STRUCTURES AND DATA
-- ======================================================================

-- 📋 EXPORT USERS DATA ------------------------------------------------
DO $$
DECLARE
    rec record;
    backup_sql text := '';
BEGIN
    RAISE NOTICE '=== USERS TABLE BACKUP ===';
    
    FOR rec IN 
        SELECT id, email, password_hash, email_verified, full_name, plan, 
               status, max_usage, current_usage, usage_reset_date, custom_limit,
               stripe_customer_id, ip_address, user_agent, last_login_at, 
               created_at, updated_at
        FROM users
        ORDER BY created_at
    LOOP
        backup_sql := format(
            'INSERT INTO users (id, email, password_hash, email_verified, full_name, plan, status, max_usage, current_usage, usage_reset_date, custom_limit, stripe_customer_id, ip_address, user_agent, last_login_at, created_at, updated_at) VALUES (%L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L);',
            rec.id, rec.email, rec.password_hash, rec.email_verified, rec.full_name, 
            rec.plan, rec.status, rec.max_usage, rec.current_usage, rec.usage_reset_date,
            rec.custom_limit, rec.stripe_customer_id, rec.ip_address, rec.user_agent,
            rec.last_login_at, rec.created_at, rec.updated_at
        );
        RAISE NOTICE '%', backup_sql;
    END LOOP;
    
    RAISE NOTICE 'Users backup completed. Count: %', (SELECT COUNT(*) FROM users);
END $$;

-- 🔉 EXPORT VOICES DATA -----------------------------------------------
DO $$
DECLARE
    rec record;
    backup_sql text := '';
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VOICES TABLE BACKUP ===';
    
    FOR rec IN 
        SELECT id, google_api_name, display_name, arabic_name, characteristics,
               gender, language, dialect, description, sample_url, is_active,
               sort_order, created_at, updated_at
        FROM voices
        ORDER BY sort_order
    LOOP
        backup_sql := format(
            'INSERT INTO voices (id, google_api_name, display_name, arabic_name, characteristics, gender, language, dialect, description, sample_url, is_active, sort_order, created_at, updated_at) VALUES (%L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L);',
            rec.id, rec.google_api_name, rec.display_name, rec.arabic_name,
            rec.characteristics, rec.gender, rec.language, rec.dialect,
            rec.description, rec.sample_url, rec.is_active, rec.sort_order,
            rec.created_at, rec.updated_at
        );
        RAISE NOTICE '%', backup_sql;
    END LOOP;
    
    RAISE NOTICE 'Voices backup completed. Count: %', (SELECT COUNT(*) FROM voices);
END $$;

-- 🎙️ EXPORT GENERATIONS DATA (Last 100 records) ----------------------
DO $$
DECLARE
    rec record;
    backup_sql text := '';
    counter integer := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== GENERATIONS TABLE BACKUP (Last 100) ===';
    
    FOR rec IN 
        SELECT id, user_id, voice_id, input_text, char_count, temperature,
               audio_url, storage_path, duration_seconds, file_size_bytes,
               ip_address, user_agent, status, error_message, created_at, completed_at
        FROM generations
        ORDER BY created_at DESC
        LIMIT 100
    LOOP
        counter := counter + 1;
        backup_sql := format(
            'INSERT INTO generations (id, user_id, voice_id, input_text, char_count, temperature, audio_url, storage_path, duration_seconds, file_size_bytes, ip_address, user_agent, status, error_message, created_at, completed_at) VALUES (%L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L);',
            rec.id, rec.user_id, rec.voice_id, rec.input_text, rec.char_count,
            rec.temperature, rec.audio_url, rec.storage_path, rec.duration_seconds,
            rec.file_size_bytes, rec.ip_address, rec.user_agent, rec.status,
            rec.error_message, rec.created_at, rec.completed_at
        );
        RAISE NOTICE '%', backup_sql;
    END LOOP;
    
    RAISE NOTICE 'Generations backup completed. Last % records backed up.', counter;
END $$;

-- 📊 EXPORT MONTHLY USAGE SUMMARY DATA --------------------------------
DO $$
DECLARE
    rec record;
    backup_sql text := '';
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== MONTHLY USAGE SUMMARY BACKUP ===';
    
    FOR rec IN 
        SELECT id, user_id, year, month, total_generations, total_characters,
               total_seconds, total_file_size_bytes, created_at, updated_at
        FROM monthly_usage_summary
        ORDER BY year DESC, month DESC
    LOOP
        backup_sql := format(
            'INSERT INTO monthly_usage_summary (id, user_id, year, month, total_generations, total_characters, total_seconds, total_file_size_bytes, created_at, updated_at) VALUES (%L, %L, %L, %L, %L, %L, %L, %L, %L, %L);',
            rec.id, rec.user_id, rec.year, rec.month, rec.total_generations,
            rec.total_characters, rec.total_seconds, rec.total_file_size_bytes,
            rec.created_at, rec.updated_at
        );
        RAISE NOTICE '%', backup_sql;
    END LOOP;
    
    RAISE NOTICE 'Monthly usage summary backup completed. Count: %', (SELECT COUNT(*) FROM monthly_usage_summary);
END $$;

-- ======================================================================
--  BACKUP SUMMARY AND VERIFICATION
-- ======================================================================

-- Show current data counts
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== BACKUP SUMMARY ===';
    RAISE NOTICE 'Users: % records', (SELECT COUNT(*) FROM users);
    RAISE NOTICE 'Voices: % records', (SELECT COUNT(*) FROM voices);
    RAISE NOTICE 'Generations: % total records', (SELECT COUNT(*) FROM generations);
    RAISE NOTICE 'Monthly Usage: % records', (SELECT COUNT(*) FROM monthly_usage_summary);
    RAISE NOTICE '';
    RAISE NOTICE '✅ Database backup completed!';
    RAISE NOTICE 'Copy all the INSERT statements above to a text file for restoration.';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Save the backup output to a file';
    RAISE NOTICE '2. Run the RLS setup script';
    RAISE NOTICE '3. Test your application';
    RAISE NOTICE '4. Keep this backup safe for restoration if needed';
END $$; 