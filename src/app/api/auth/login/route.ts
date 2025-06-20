import { NextResponse } from 'next/server';
import { validateUser } from '@/lib/users';
import { sign } from 'jsonwebtoken';
import { createServerSupabaseClient } from '@/lib/supabase';

export const runtime = 'nodejs';

// Simple JWT secret for demo (in production, use environment variable)
const JWT_SECRET = 'moonwhale-demo-secret-key-2024';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate user credentials
    const user = validateUser(email, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get latest usage data from Supabase
    const supabase = createServerSupabaseClient();
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('current_usage, max_usage')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('Error fetching user data from Supabase:', userError);
    }

    // Use Supabase data if available, otherwise fall back to local data
    const safeUsage = userData 
      ? { used: userData.current_usage, max: userData.max_usage }
      : { used: 0, max: 3 };

    // Create JWT token
    const token = sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        usage: safeUsage
      }
    });

  } catch (err: Error | unknown) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 