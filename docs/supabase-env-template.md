# Supabase Environment Variables Template

Copy these variables to your `.env.local` file and replace the placeholder values with your actual Supabase project details.

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Secret (for authentication)
JWT_SECRET=your-jwt-secret-at-least-32-characters-long

# Admin Configuration
ADMIN_PASSWORD=your-secure-admin-password-for-reset-functions
```

## Where to Find These Values

1. **NEXT_PUBLIC_SUPABASE_URL** and **NEXT_PUBLIC_SUPABASE_ANON_KEY**:
   - Go to your Supabase project dashboard
   - Click on the "Settings" icon (gear) in the left sidebar
   - Select "API" from the menu
   - Find these values under "Project URL" and "anon public" in the "Project API keys" section

2. **SUPABASE_SERVICE_ROLE_KEY**:
   - In the same "API" settings page
   - Find this under "service_role secret" in the "Project API keys" section
   - ⚠️ WARNING: This is a powerful key that bypasses RLS. Keep it secure and never expose it client-side!

3. **JWT_SECRET**:
   - Create a secure random string (at least 32 characters)
   - You can generate one with: `openssl rand -base64 32`
   - This will be used to sign JWT tokens for your own auth system

4. **ADMIN_PASSWORD**:
   - Create a secure password for admin operations like resetting usage
   - This will be used to authenticate admin API endpoints

## Security Notes

- `NEXT_PUBLIC_` variables are exposed to the browser - only include public keys
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only (in API routes)
- Store these in Vercel environment variables when deploying 