# 🛡️ Supabase Database Backup Guide

Multiple backup options for your MoonWhale Voice-Over database before enabling RLS.

## 📋 Option 1: SQL Backup Script (Recommended)

**✅ Pros:** Works in Supabase Dashboard, exports as INSERT statements  
**⏱️ Time:** 2-3 minutes

### Steps:
1. Go to **Supabase Dashboard → SQL Editor**
2. **Run the `backup-database.sql` script** (in this folder)
3. **Copy all the output** INSERT statements to a text file
4. **Save as:** `moonwhale-backup-$(date).sql`

### What it backs up:
- ✅ All users (with passwords)
- ✅ All voices 
- ✅ Last 100 generations
- ✅ All monthly usage summaries

---

## 📋 Option 2: Supabase Dashboard Backup

**✅ Pros:** Official Supabase feature, most reliable  
**⏱️ Time:** 5-10 minutes

### Steps:
1. Go to **Supabase Dashboard → Settings → Database**
2. Scroll to **"Database backups"** section
3. Click **"Download backup"**
4. Wait for backup file to generate
5. Download the `.sql` file

**Note:** This may not be available on all Supabase plans.

---

## 📋 Option 3: Supabase CLI Backup

**✅ Pros:** Complete database dump, includes schema  
**⏱️ Time:** 5 minutes setup + 2 minutes backup

### Prerequisites:
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
```

### Steps:
```bash
# Get your database URL from Supabase Dashboard → Settings → Database
# Look for "Connection string" → "URI"

# Create backup
supabase db dump --db-url "your-database-connection-string" > moonwhale-backup.sql
```

---

## 📋 Option 4: pg_dump (If you have direct access)

**✅ Pros:** Most comprehensive, includes everything  
**⏱️ Time:** 2 minutes

### Steps:
```bash
# Get connection details from Supabase Dashboard → Settings → Database
pg_dump "postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres" \
  --no-owner --no-privileges --clean --if-exists \
  > moonwhale-backup-$(date +%Y%m%d).sql
```

---

## 📋 Option 5: Quick Data Export (Minimal)

**✅ Pros:** Super fast, just essential data  
**⏱️ Time:** 30 seconds

### SQL to run in Supabase SQL Editor:
```sql
-- Export just the critical data
COPY users TO STDOUT WITH CSV HEADER;
COPY voices TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM generations ORDER BY created_at DESC LIMIT 50) TO STDOUT WITH CSV HEADER;
```

Copy the output to CSV files.

---

## 🚀 Recommended Backup Workflow

### **Before RLS Setup:**

1. **Run Option 1** (SQL Backup Script) - **MOST IMPORTANT**
   - This gives you INSERT statements that are easy to restore
   - Works 100% with Supabase

2. **Try Option 2** (Dashboard Backup) if available
   - Official Supabase backup as secondary

3. **Note your environment variables:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GEMINI_API_KEY=your_gemini_key
   ```

### **Backup Verification:**
```sql
-- Run this to verify your current data counts
SELECT 
  'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 
  'voices' as table_name, COUNT(*) as record_count FROM voices  
UNION ALL
SELECT 
  'generations' as table_name, COUNT(*) as record_count FROM generations
UNION ALL
SELECT 
  'monthly_usage_summary' as table_name, COUNT(*) as record_count FROM monthly_usage_summary;
```

---

## 🔄 How to Restore (If Needed)

### From SQL Backup Script:
1. **Disable RLS:** `ALTER TABLE tablename DISABLE ROW LEVEL SECURITY;`
2. **Clear tables:** `TRUNCATE users, voices, generations, monthly_usage_summary CASCADE;`
3. **Run INSERT statements** from your backup file
4. **Re-enable RLS** if needed

### From pg_dump backup:
```bash
# Restore from pg_dump
psql "your-database-connection-string" < moonwhale-backup.sql
```

---

## 📊 Backup File Sizes (Estimated)

| Method | File Size | Contains |
|--------|-----------|----------|
| SQL Script | 50-200 KB | Essential data as INSERT statements |
| Dashboard | 1-5 MB | Complete database with schema |
| pg_dump | 1-10 MB | Everything including system tables |
| CSV Export | 10-50 KB | Just data, no schema |

---

## ⚠️ Important Notes

1. **Passwords:** The SQL backup includes password hashes - keep secure!
2. **File Storage:** Audio files in Supabase Storage are NOT included in database backups
3. **Auth Users:** Supabase Auth users (auth.users table) may need separate backup
4. **API Keys:** Always backup your environment variables separately

---

## 🎯 Quick Start (Recommended)

**Just run this single command:**

1. Go to **Supabase Dashboard → SQL Editor**
2. Run the **`backup-database.sql`** script
3. **Copy all output** to a text file named `moonwhale-backup-$(date).txt`
4. **Proceed with RLS setup!**

**That's it!** You now have a complete backup that can restore your data if anything goes wrong. 