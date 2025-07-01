import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    gemini: { success: false, details: {} },
    supabase: { success: false, details: {} }
  };

  // Test Gemini API
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
      { method: 'GET' }
    );

    if (response.ok) {
      const data = await response.json();
      const models = data.models || [];
      const ttsModel = models.find((m: any) => m.name?.includes('text-to-speech'));
      
      results.gemini = {
        success: true,
        details: {
          api_key_length: process.env.GEMINI_API_KEY?.length || 0,
          total_models: models.length,
          tts_model_available: !!ttsModel,
          tts_model_name: ttsModel?.name || 'Not found'
        }
      };
    } else {
      results.gemini = {
        success: false,
        details: { error: `HTTP ${response.status}: ${response.statusText}` }
      };
    }
  } catch (error: any) {
    results.gemini = {
      success: false,
      details: { error: error.message }
    };
  }

  // Test Supabase Connection
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Simple connection test - try to query a non-existent table
    // This will fail but confirm the connection works
    const { data, error } = await supabase
      .from('connection_test_table')
      .select('*')
      .limit(1);

    // If we get a "relation does not exist" error, that means connection is working
    if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
      results.supabase = {
        success: true,
        details: {
          message: 'Connection successful',
          url_configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          service_key_configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          ready_for_schema: true
        }
      };
    } else if (!error) {
      // Unexpected success (table exists)
      results.supabase = {
        success: true,
        details: {
          message: 'Connection successful (table exists)',
          url_configured: true,
          service_key_configured: true,
          ready_for_schema: true
        }
      };
    } else {
      // Real connection error
      results.supabase = {
        success: false,
        details: { 
          error: error.message,
          url_configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          service_key_configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      };
    }

  } catch (error: any) {
    results.supabase = {
      success: false,
      details: { error: error.message }
    };
  }

  // Overall status
  const allSuccess = results.gemini.success && results.supabase.success;
  
  return NextResponse.json({
    ...results,
    overall: {
      success: allSuccess,
      message: allSuccess ? 
        'All services connected successfully!' : 
        'Some services have connection issues',
      next_steps: allSuccess ? 
        'Ready to implement Supabase schema and full features' :
        'Please check failed services'
    }
  }, { 
    status: allSuccess ? 200 : 500 
  });
} 