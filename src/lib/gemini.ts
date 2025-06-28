"use server";

import { GoogleGenAI } from "@google/genai";
import mime from 'mime';

export async function generateSpeech(text: string, voiceName: string = 'orus', temperature: number = 1): Promise<Uint8Array> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY env var is missing");
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const model = 'gemini-2.5-pro-preview-tts';

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text }] }],
      config: {
        temperature: temperature,
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName,
            }
          }
        },
      },
    });

    // Extract audio data from response
    if (!response.candidates || !response.candidates[0]) {
      throw new Error("No candidates in response");
    }

    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
      throw new Error("No content parts in response");
    }

    const part = candidate.content.parts[0];
    if (!part.inlineData || !part.inlineData.data) {
      throw new Error("No audio data in response");
    }

    // Convert base64 to buffer
    const audioData = part.inlineData.data;
    const mimeType = part.inlineData.mimeType || 'audio/wav';
    
    let buffer = Buffer.from(audioData, 'base64');
    
    // Convert to WAV if needed
    let fileExtension = mime.getExtension(mimeType);
    if (!fileExtension || fileExtension !== 'wav') {
      buffer = convertToWav(audioData, mimeType);
    }
    
    return Uint8Array.from(buffer);

  } catch (err: any) {
    // More specific error messages for common issues
    if (err?.message?.includes('fetch failed')) {
      throw new Error(`Network connectivity issue: Unable to reach Gemini API. Please check your internet connection, firewall settings, or try again later. Original error: ${err?.message}`);
    }
    
    if (err?.message?.includes('API key')) {
      throw new Error(`API authentication failed: Please verify your GEMINI_API_KEY is correct. Original error: ${err?.message}`);
    }
    
    if (err?.message?.includes('quota') || err?.message?.includes('limit')) {
      throw new Error(`API quota exceeded: You may have reached your usage limit. Original error: ${err?.message}`);
    }
    
    throw new Error(`Gemini request failed: ${err?.message || err}`);
  }
}

interface WavConversionOptions {
  numChannels: number,
  sampleRate: number,
  bitsPerSample: number
}

function convertToWav(rawData: string, mimeType: string) {
  const options = parseMimeType(mimeType);
  const buffer = Buffer.from(rawData, 'base64');
  const wavHeader = createWavHeader(buffer.length, options);

  return Buffer.concat([wavHeader, buffer]);
}

function parseMimeType(mimeType: string): WavConversionOptions {
  const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
  const [_, format] = fileType.split('/');

  const options: Partial<WavConversionOptions> = {
    numChannels: 1,
    sampleRate: 24000, // Default sample rate
    bitsPerSample: 16, // Default bits per sample
  };

  if (format && format.startsWith('L')) {
    const bits = parseInt(format.slice(1), 10);
    if (!isNaN(bits)) {
      options.bitsPerSample = bits;
    }
  }

  for (const param of params) {
    const [key, value] = param.split('=').map(s => s.trim());
    if (key === 'rate') {
      options.sampleRate = parseInt(value, 10);
    }
  }

  return options as WavConversionOptions;
}

function createWavHeader(dataLength: number, options: WavConversionOptions) {
  const {
    numChannels,
    sampleRate,
    bitsPerSample,
  } = options;

  // http://soundfile.sapp.org/doc/WaveFormat
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const buffer = Buffer.alloc(44);

  buffer.write('RIFF', 0);                      // ChunkID
  buffer.writeUInt32LE(36 + dataLength, 4);     // ChunkSize
  buffer.write('WAVE', 8);                      // Format
  buffer.write('fmt ', 12);                     // Subchunk1ID
  buffer.writeUInt32LE(16, 16);                 // Subchunk1Size (PCM)
  buffer.writeUInt16LE(1, 20);                  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);        // NumChannels
  buffer.writeUInt32LE(sampleRate, 24);         // SampleRate
  buffer.writeUInt32LE(byteRate, 28);           // ByteRate
  buffer.writeUInt16LE(blockAlign, 32);         // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34);      // BitsPerSample
  buffer.write('data', 36);                     // Subchunk2ID
  buffer.writeUInt32LE(dataLength, 40);         // Subchunk2Size

  return buffer;
} 