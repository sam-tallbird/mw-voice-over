# Supabase Auth Integration Guide

**Last Updated:** December 2024  
**Version:** 1.0 - Initial Setup

## Overview

This document outlines how to implement authentication in the MoonWhale Voice-Over application using Supabase Auth. We'll cover setup, implementation, and best practices for managing user authentication and authorization.

## Authentication vs. Authorization

- **Authentication**: Verifies that users are who they claim to be (login process)
- **Authorization**: Determines what resources a user can access (permissions)

Supabase Auth handles both through:
- JWT tokens for authentication
- Row Level Security (RLS) for authorization

## Implementation Steps

### 1. Environment Setup

Add these variables to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Secret (for custom auth if needed)
JWT_SECRET=your-jwt-secret-at-least-32-characters-long

# Admin Configuration
ADMIN_PASSWORD=your-secure-admin-password-for-reset-functions
```

### 2. Install Required Packages

```bash
npm install @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared
```

### 3. Create Supabase Client

Create a file at `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a Supabase client for use on the client side
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This helper should only be used in server-side contexts
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  // The service role key can bypass RLS policies
  return createClient(supabaseUrl, supabaseServiceKey);
};
```

### 4. Create Auth Context Provider

Create a file at `src/components/AuthProvider.tsx`:

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get session from storage
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

### 5. Add Auth Provider to Root Layout

Update `src/app/layout.tsx`:

```typescript
import { AuthProvider } from '@/components/AuthProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 6. Create Login Form Component

Create a file at `src/components/LoginForm.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // For email/password login
  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Option 1: Custom Form */}
      <form onSubmit={handleEmailLogin} className="space-y-4 mb-8">
        <h2 className="text-2xl font-bold text-center">Login to MoonWhale</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Option 2: Supabase Auth UI */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-medium text-center mb-4">Or use Supabase Auth UI</h3>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          redirectTo={`${window.location.origin}/dashboard`}
        />
      </div>
    </div>
  );
}
```

### 7. Create Protected Route Middleware

Create a file at `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session and trying to access protected route
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If session exists and trying to access login page
  if (session && req.nextUrl.pathname === '/login') {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
```

### 8. Create API Routes for User Management

Create a file at `src/app/api/auth/reset-usage/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId, adminPassword } = await request.json();
    
    // Verify admin password
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = createServerSupabaseClient();
    
    // Call the database function to reset usage
    const { data, error } = await supabase.rpc('reset_user_usage', { 
      user_id_param: userId || null 
    });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Reset ${data} user(s)` 
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Create a file at `src/app/api/auth/reset-demo-users/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { adminPassword } = await request.json();
    
    // Verify admin password
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = createServerSupabaseClient();
    
    // Call the database function to reset demo users
    const { data, error } = await supabase.rpc('reset_demo_users');
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Reset ${data} demo user(s)` 
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 9. Update TTS API to Check Usage Limits

Update `src/app/api/tts/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get the current user from the session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Check if user can generate voice
    const { data: canGenerate, error: checkError } = await supabase.rpc(
      'can_user_generate',
      { user_id_param: userId }
    );
    
    if (checkError || !canGenerate) {
      return NextResponse.json(
        { error: 'Usage limit reached' },
        { status: 403 }
      );
    }
    
    // Get the request body
    const { text, voice } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    // Your existing TTS logic here
    // ...
    
    // Record the usage
    const { error: usageError } = await supabase.rpc(
      'increment_user_usage',
      {
        user_id_param: userId,
        text_length_param: text.length,
        voice_model_param: voice || 'default'
      }
    );
    
    if (usageError) {
      console.error('Failed to record usage:', usageError);
    }
    
    // Return the generated audio
    return NextResponse.json({ 
      success: true,
      audioUrl: 'url-to-generated-audio'
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 10. Create Dashboard Component with Usage Info

Create a file at `src/app/dashboard/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

type UsageInfo = {
  current_usage: number;
  max_usage: number;
  usage_remaining: number;
  plan_type: string;
  last_reset: string;
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUsageInfo = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase.rpc(
          'get_user_usage',
          { user_id_param: user.id }
        );
        
        if (error) {
          console.error('Error fetching usage info:', error);
        } else {
          setUsageInfo(data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch usage info:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsageInfo();
  }, [user]);
  
  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Sign Out
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your Account</h2>
        <p><strong>Email:</strong> {user.email}</p>
        
        {loading ? (
          <p>Loading usage information...</p>
        ) : usageInfo ? (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Usage Information</h3>
            <p><strong>Plan:</strong> {usageInfo.plan_type}</p>
            <p><strong>Used:</strong> {usageInfo.current_usage} of {usageInfo.max_usage}</p>
            <p><strong>Remaining:</strong> {usageInfo.usage_remaining}</p>
            <p><strong>Last Reset:</strong> {new Date(usageInfo.last_reset).toLocaleDateString()}</p>
            
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-purple-600 h-2.5 rounded-full" 
                style={{ width: `${(usageInfo.current_usage / usageInfo.max_usage) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <p>No usage information available</p>
        )}
      </div>
    </div>
  );
}
```

### 11. Create Login Page

Create a file at `src/app/login/page.tsx`:

```typescript
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
}
```

## Authentication Strategies

### Email/Password Authentication

The default method for authenticating demo users. Passwords are stored as hashes in the database.

### Magic Link Authentication (Optional)

For passwordless authentication, users receive an email with a link to sign in:

```typescript
const { error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
});
```

### Social Authentication (Optional)

To enable social logins, configure providers in your Supabase dashboard and update the Auth UI component:

```typescript
<Auth
  supabaseClient={supabase}
  appearance={{ theme: ThemeSupa }}
  providers={['google', 'github']}
  redirectTo={`${window.location.origin}/dashboard`}
/>
```

## Security Best Practices

1. **Password Hashing**: Supabase automatically handles password hashing
2. **JWT Tokens**: Securely manage authentication state
3. **Row Level Security**: Enforce data access control at the database level
4. **Service Role Key**: Keep this key secure and only use server-side
5. **Environment Variables**: Store sensitive keys in environment variables

## Row Level Security Policies

Our database already has RLS policies configured:

```sql
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can only view their own usage logs
CREATE POLICY "Users can view own usage logs" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);
```

## Next Steps

1. **Update Password Hashes**: Replace placeholder hashes with real bcrypt hashes
2. **Test Authentication Flow**: Verify login, session management, and protected routes
3. **Implement Password Reset**: Add functionality for users to reset passwords
4. **Add User Profile Management**: Allow users to update their information
5. **Integrate with TTS Features**: Connect authentication to voice generation features

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [JWT Authentication](https://supabase.com/docs/guides/auth/jwt) 