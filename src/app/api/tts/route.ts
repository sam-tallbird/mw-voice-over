import { NextResponse } from 'next/server';
import { generateSpeech } from '@/lib/gemini';
import { createServerSupabaseClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { text, email } = await req.json();

    if (typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find the user by email
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (userError || !users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    // Check if user can generate
    if (user.current_usage >= user.max_usage) {
      return NextResponse.json({ 
        error: 'Usage limit exceeded',
        usage: {
          current: user.current_usage,
          max: user.max_usage
        }
      }, { status: 403 });
    }

    // Generate speech
    const audioBuffer = await generateSpeech(text.trim());
    
    // Update usage count
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        current_usage: user.current_usage + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('Failed to update usage:', updateError);
    }
    
    // Get updated user data
    const { data: updatedUser } = await supabase
      .from('users')
      .select('current_usage, max_usage')
      .eq('id', user.id)
      .single();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'X-Usage-Count': updatedUser?.current_usage?.toString() || (user.current_usage + 1).toString(),
        'X-Usage-Limit': updatedUser?.max_usage?.toString() || user.max_usage.toString(),
      },
    });
  } catch (err: Error | unknown) {
    console.error('TTS route error', err);
    const message = process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 