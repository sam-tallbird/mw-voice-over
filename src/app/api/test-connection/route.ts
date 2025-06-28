import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'GEMINI_API_KEY environment variable is missing' 
      }, { status: 400 });
    }

    // Initialize the client
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Try to list models to test connection
    try {
      const modelsPager = await ai.models.list();
      const models = [];
      for await (const model of modelsPager) {
        models.push(model);
      }
      
      // Look for the TTS model specifically
      const ttsModel = models.find((model: any) => 
        model.name?.includes('gemini-2.5-pro-preview-tts')
      );

      // Test TTS voice availability
      let ttsVoiceTest = null;
      if (ttsModel) {
        try {
          // Try a simple TTS request to see available voices
          const testConfig = {
            temperature: 0,
            responseModalities: ['audio'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Orus', // Try the default voice
                }
              }
            }
          };

          const testContents = [{
            role: 'user',
            parts: [{ text: 'Test' }]
          }];

          // Testing TTS with Orus voice
          const testResponse = await ai.models.generateContentStream({
            model: 'gemini-2.5-pro-preview-tts',
            config: testConfig,
            contents: testContents,
          });

          ttsVoiceTest = { success: true, voice: 'Orus' };
          
          // Try to consume the stream to check for errors
          for await (const chunk of testResponse) {
            break; // Just test the first chunk
          }
          
        } catch (voiceError: any) {
          ttsVoiceTest = { 
            success: false, 
            error: voiceError.message,
            voice: 'Orus'
          };
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Connection successful!',
        apiKeyPresent: !!process.env.GEMINI_API_KEY,
        apiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
        modelsAvailable: models.length,
        ttsModelAvailable: !!ttsModel,
        ttsModelName: ttsModel?.name || 'Not found',
        ttsVoiceTest: ttsVoiceTest
      });

    } catch (apiError: any) {
      // If listing models fails, it might be an API key issue
      if (apiError.message?.includes('API key') || apiError.message?.includes('authentication')) {
        return NextResponse.json({
          success: false,
          error: 'Invalid API key or authentication failed',
          details: apiError.message
        }, { status: 401 });
      }

      return NextResponse.json({
        success: false,
        error: 'API connection failed',
        details: apiError.message
      }, { status: 500 });
    }

  } catch (err: any) {
    console.error('Connection test error:', err);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error during connection test',
      details: err.message
    }, { status: 500 });
  }
} 