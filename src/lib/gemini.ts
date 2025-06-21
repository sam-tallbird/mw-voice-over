"use server";

import { GoogleGenAI } from "@google/genai";
import mime from 'mime';

export async function generateSpeech(text: string, voiceName: string = 'Orus'): Promise<Uint8Array> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY env var is missing");
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  // Try the exact config format from your original code
  const config = {
    temperature: 1,
    responseModalities: [
      'audio',
    ],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: voiceName,
        }
      }
    },
  };

  const model = 'gemini-2.5-pro-preview-tts';
  
  // Try the exact contents format from your original code
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: text,
        },
      ],
    },
  ];

  console.log('Starting TTS generation...');
  console.log('Config:', JSON.stringify(config, null, 2));
  console.log('Contents:', JSON.stringify(contents, null, 2));
  console.log('Model:', model);
  console.log('Selected Voice:', voiceName);

  try {
    // Use the exact method call from your original code
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    console.log('Stream response received, processing chunks...');
    const audioChunks: Buffer[] = [];
    let chunkCount = 0;

    for await (const chunk of response) {
      chunkCount++;
      console.log(`Processing chunk ${chunkCount}:`, JSON.stringify(chunk, null, 2).slice(0, 500));
      
      if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
        console.log(`Chunk ${chunkCount}: No candidates/content/parts, skipping`);
        continue;
      }
      
      if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        const inlineData = chunk.candidates[0].content.parts[0].inlineData;
        console.log(`Chunk ${chunkCount}: Found inlineData:`, {
          mimeType: inlineData.mimeType,
          dataLength: inlineData.data?.length || 0
        });
        
        let buffer = Buffer.from(inlineData.data || '', 'base64');
        
        // Convert to WAV if needed
        let fileExtension = mime.getExtension(inlineData.mimeType || '');
        if (!fileExtension) {
          console.log(`Chunk ${chunkCount}: Converting to WAV...`);
          fileExtension = 'wav';
          buffer = convertToWav(inlineData.data || '', inlineData.mimeType || '');
        }
        
        audioChunks.push(buffer);
        console.log(`Chunk ${chunkCount}: Added buffer of length ${buffer.length}`);
      } else {
        console.log(`Chunk ${chunkCount}: No inlineData found`);
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.log(`Chunk ${chunkCount}: Found text instead:`, chunk.candidates[0].content.parts[0].text);
        }
      }
    }

    console.log(`Finished processing ${chunkCount} chunks, audioChunks.length: ${audioChunks.length}`);

    if (audioChunks.length === 0) {
      throw new Error("No audio data received from Gemini API");
    }

    // Combine all audio chunks
    const combinedBuffer = Buffer.concat(audioChunks);
    console.log('Combined buffer length:', combinedBuffer.length);
    return Uint8Array.from(combinedBuffer);

  } catch (err: any) {
    console.error("Gemini generateContentStream threw", err?.response ?? err);
    console.error("Full error:", err);
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