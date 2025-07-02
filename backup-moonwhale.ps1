# ==================================================================
# MoonWhale Voice-Over Database Backup Script (PowerShell)
# ==================================================================
# This script helps you backup your Supabase database before RLS setup
# Run this in PowerShell: .\backup-moonwhale.ps1

Write-Host "🛡️ MoonWhale Voice-Over Database Backup Tool" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Get current date for backup filename
$BackupDate = Get-Date -Format "yyyy-MM-dd-HHmm"
$BackupFileName = "moonwhale-backup-$BackupDate.txt"

Write-Host "📋 Backup Options:" -ForegroundColor Yellow
Write-Host "1. SQL Script Backup (Recommended - works in Supabase Dashboard)" -ForegroundColor Green
Write-Host "2. Supabase CLI Backup (requires CLI installation)" -ForegroundColor Blue
Write-Host "3. Environment Variables Backup" -ForegroundColor Magenta
Write-Host "4. Complete Backup (All options)" -ForegroundColor Cyan
Write-Host ""

$Choice = Read-Host "Enter your choice (1-4)"

switch ($Choice) {
    "1" {
        Write-Host "🔸 SQL Script Backup Selected" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚡ Steps to complete backup:" -ForegroundColor Yellow
        Write-Host "1. Go to your Supabase Dashboard → SQL Editor"
        Write-Host "2. Copy and paste this content from 'backup-database.sql':"
        Write-Host "3. Run the script in SQL Editor"
        Write-Host "4. Copy ALL the output INSERT statements"
        Write-Host "5. Save to file: $BackupFileName"
        Write-Host ""
        Write-Host "📁 Opening backup-database.sql file..." -ForegroundColor Blue
        
        if (Test-Path "backup-database.sql") {
            Start-Process notepad.exe "backup-database.sql"
            Write-Host "✅ File opened in Notepad. Copy the content to Supabase SQL Editor." -ForegroundColor Green
        } else {
            Write-Host "❌ backup-database.sql not found in current directory!" -ForegroundColor Red
            Write-Host "Make sure you're running this script from the correct folder." -ForegroundColor Yellow
        }
    }
    
    "2" {
        Write-Host "🔸 Supabase CLI Backup Selected" -ForegroundColor Blue
        Write-Host ""
        
        # Check if Supabase CLI is installed
        try {
            $SupabaseVersion = supabase --version 2>$null
            Write-Host "✅ Supabase CLI found: $SupabaseVersion" -ForegroundColor Green
        } catch {
            Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
            Write-Host "Installing Supabase CLI..." -ForegroundColor Yellow
            npm install -g supabase
        }
        
        Write-Host ""
        Write-Host "📝 You'll need your database connection string from:"
        Write-Host "   Supabase Dashboard → Settings → Database → Connection string → URI"
        Write-Host ""
        
        $DatabaseUrl = Read-Host "Enter your database connection string"
        
        if ($DatabaseUrl) {
            Write-Host "Creating backup..." -ForegroundColor Yellow
            supabase db dump --db-url $DatabaseUrl > $BackupFileName
            Write-Host "✅ Backup saved to: $BackupFileName" -ForegroundColor Green
        } else {
            Write-Host "❌ No database URL provided. Backup cancelled." -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host "🔸 Environment Variables Backup Selected" -ForegroundColor Magenta
        Write-Host ""
        
        $EnvBackupFile = "moonwhale-env-backup-$BackupDate.txt"
        
        Write-Host "📝 Please enter your environment variables:"
        Write-Host ""
        
        $SupabaseUrl = Read-Host "NEXT_PUBLIC_SUPABASE_URL"
        $SupabaseAnonKey = Read-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY" 
        $SupabaseServiceKey = Read-Host "SUPABASE_SERVICE_ROLE_KEY"
        $GeminiApiKey = Read-Host "GEMINI_API_KEY"
        
        $EnvContent = @"
# MoonWhale Voice-Over Environment Variables Backup
# Generated: $(Get-Date)
# 
# Restore these in your .env.local file:

NEXT_PUBLIC_SUPABASE_URL=$SupabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SupabaseAnonKey
SUPABASE_SERVICE_ROLE_KEY=$SupabaseServiceKey
GEMINI_API_KEY=$GeminiApiKey
"@

        $EnvContent | Out-File -FilePath $EnvBackupFile -Encoding UTF8
        Write-Host "✅ Environment variables saved to: $EnvBackupFile" -ForegroundColor Green
    }
    
    "4" {
        Write-Host "🔸 Complete Backup Selected" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "This will create multiple backup files..." -ForegroundColor Yellow
        
        # Create backup folder
        $BackupFolder = "moonwhale-backup-$BackupDate"
        New-Item -ItemType Directory -Path $BackupFolder -Force | Out-Null
        
        # Copy SQL backup script
        if (Test-Path "backup-database.sql") {
            Copy-Item "backup-database.sql" "$BackupFolder\"
            Write-Host "✅ SQL backup script copied" -ForegroundColor Green
        }
        
        # Copy RLS setup script  
        if (Test-Path "setup-optimized-rls.sql") {
            Copy-Item "setup-optimized-rls.sql" "$BackupFolder\"
            Write-Host "✅ RLS setup script copied" -ForegroundColor Green
        }
        
        # Create instructions file
        $Instructions = @"
# MoonWhale Voice-Over Complete Backup
Generated: $(Get-Date)

## Files in this backup:
- backup-database.sql: Run this in Supabase SQL Editor to export data
- setup-optimized-rls.sql: RLS setup script to run after backup
- instructions.txt: This file

## Steps to backup:
1. Go to Supabase Dashboard → SQL Editor
2. Run backup-database.sql
3. Copy all INSERT statement output to a text file
4. Save your environment variables separately

## Steps to restore (if needed):
1. Disable RLS on all tables
2. Run the INSERT statements from your data backup
3. Re-run setup-optimized-rls.sql if needed

## Environment Variables to backup:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY  
- SUPABASE_SERVICE_ROLE_KEY
- GEMINI_API_KEY
"@

        $Instructions | Out-File -FilePath "$BackupFolder\instructions.txt" -Encoding UTF8
        
        Write-Host "✅ Complete backup folder created: $BackupFolder" -ForegroundColor Green
        Write-Host "📁 Opening backup folder..." -ForegroundColor Blue
        Start-Process explorer.exe $BackupFolder
    }
    
    default {
        Write-Host "❌ Invalid choice. Please run the script again and select 1-4." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Complete your backup (see instructions above)"
Write-Host "2. Run the RLS setup script: setup-optimized-rls.sql"
Write-Host "3. Test your application with demo users"
Write-Host ""
Write-Host "💡 Tip: Keep your backup files safe - they contain sensitive data!" -ForegroundColor Cyan

# Wait for user to press any key
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 