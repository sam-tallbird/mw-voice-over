import { NextResponse } from 'next/server';
import { validateUser } from '@/lib/users';
import { sign } from 'jsonwebtoken';
import { createServerSupabaseClient } from '@/lib/supabase';

export const runtime = 'nodejs';

// Simple JWT secret for demo (in production, use environment variable)
const JWT_SECRET = 'moonwhale-demo-secret-key-2024';

export async function POST(req: Request) {
  try {
    // Parse request body safely
    let email: string;
    let password: string;
    
    try {
      const body = await req.json();
      email = body.email;
      password = body.password;
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate user credentials with error handling
    let user;
    try {
      user = validateUser(email, password);
    } catch (validateError) {
      return NextResponse.json(
        { error: 'Error validating user credentials' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get latest usage data from Supabase with error handling
    let userData = null;
    try {
      const supabase = createServerSupabaseClient();
      const { data, error: userError } = await supabase
        .from('users')
        .select('current_usage, max_usage')
        .eq('email', email)
        .single();

      if (!userError) {
        userData = data;
      }
    } catch (supabaseError) {
      // Continue without Supabase data if there's an error
    }

    // Use Supabase data if available, otherwise fall back to local data
    const safeUsage = userData 
      ? { used: userData.current_usage, max: userData.max_usage }
      : { used: 0, max: 3 };

    // Create JWT token
    let token;
    try {
      token = sign(
        { 
          userId: user.id, 
          email: user.email 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Error creating authentication token' },
        { status: 500 }
      );
    }

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
    // Catch any other unexpected errors
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Login failed: ${errorMessage}` },
      { status: 500 }
    );
  }
} 