import { NextResponse } from 'next/server';
import { generateSpeech } from '@/lib/gemini';
import { createServerSupabase } from '@/lib/supabase-server';
import { createServiceSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { text, voiceName, temperature } = await req.json();

    if (typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Get authenticated user
    const supabase = createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Use service role client for database operations
    const serviceSupabase = createServiceSupabase();

    // Get user data and check usage limits
    const { data: userData, error: userError } = await serviceSupabase
      .from('users')
      .select('current_usage, max_usage, custom_limit, status, email')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json({ error: 'User data not found' }, { status: 404 });
    }

    // Check if user is active
    if (userData.status !== 'active') {
      return NextResponse.json({ error: 'Account is not active' }, { status: 403 });
    }

    // Check usage limits
    const effectiveLimit = userData.custom_limit || userData.max_usage;
    if (userData.current_usage >= effectiveLimit) {
      return NextResponse.json({ 
        error: `Generation limit reached (${userData.current_usage}/${effectiveLimit})` 
      }, { status: 429 });
    }

    // Get voice information
    const { data: voiceData, error: voiceError } = await serviceSupabase
      .from('voices')
      .select('id, display_name, arabic_name')
      .eq('google_api_name', voiceName || 'orus')
      .eq('is_active', true)
      .single();

    if (voiceError || !voiceData) {
      return NextResponse.json({ error: 'Voice not found' }, { status: 400 });
    }

    // Restrict temperature control to demo1 user only
    const effectiveTemperature = userData.email === 'demo1@mw.com' ? (temperature || 1) : 1;

    // Generate speech with selected voice and temperature
    console.log('Generating speech for user:', user.id, 'with temperature:', effectiveTemperature);
    const audioBuffer = await generateSpeech(text.trim(), voiceName || 'orus', effectiveTemperature);
    
    // Create unique filename
    const timestamp = Date.now();
    const cleanVoiceName = voiceData.display_name.toLowerCase().replace(/\s+/g, '-');
    const fileName = `${cleanVoiceName}-${timestamp}.wav`;
    const storagePath = `${user.id}/${fileName}`;

    // Upload to Supabase Storage
    console.log('Uploading to storage:', storagePath);
    const { data: storageData, error: storageError } = await serviceSupabase.storage
      .from('voice-overs')
      .upload(storagePath, audioBuffer, {
        contentType: 'audio/wav',
        upsert: false
      });

    if (storageError) {
      console.error('Storage upload error:', storageError);
      return NextResponse.json({ error: 'Failed to save audio file' }, { status: 500 });
    }

    // Get public URL for the uploaded file
    const { data: urlData } = serviceSupabase.storage
      .from('voice-overs')
      .getPublicUrl(storagePath);

    const audioUrl = urlData.publicUrl;
    
    // Track the generation in database with storage info
    const { data: generationData, error: generationError } = await serviceSupabase
      .from('generations')
      .insert({
        user_id: user.id,
        voice_id: voiceData.id,
        input_text: text.trim(),
        char_count: text.trim().length,
        temperature: effectiveTemperature,
        audio_url: audioUrl,
        storage_path: storagePath,
        file_size_bytes: audioBuffer.byteLength,
        status: 'completed',
        completed_at: new Date().toISOString(),
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent')
      })
      .select()
      .single();

    if (generationError) {
      console.error('Error logging generation:', generationError);
      // Don't fail the request, just log the error
    }

    // Increment user usage count
    const { error: usageError } = await serviceSupabase
      .from('users')
      .update({ 
        current_usage: userData.current_usage + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (usageError) {
      console.error('Error updating usage:', usageError);
      // Don't fail the request, just log the error
    }

    console.log('Generation completed successfully:', generationData?.id);

    // Return the audio buffer directly for immediate playback
    // The file is now also saved in storage for permanent access
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'X-Usage-Count': (userData.current_usage + 1).toString(),
        'X-Usage-Limit': effectiveLimit.toString(),
        'X-Generation-Id': generationData?.id || '',
        'X-Storage-Path': storagePath,
        'X-Audio-URL': audioUrl,
      },
    });
  } catch (err: Error | unknown) {
    console.error('TTS API Error:', err);
    const message = process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 