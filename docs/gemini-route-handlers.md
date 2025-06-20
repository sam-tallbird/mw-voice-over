# Route Handlers for Gemini Audio Generation

This guide explains how to implement a **Route Handler** in the Next.js App Router that proxies requests to the Google Gemini API and streams the returned audio back to the browser.

> Reference: [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## 1. File Location & Naming

```
app/api/gemini-audio/route.ts   // folder = endpoint, file = route.ts
```

A `POST` handler is used because we need to send *user text* in the request body.

```ts
import { NextResponse } from 'next/server';
import { generateSpeech } from '@/lib/gemini';

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text || text.length === 0) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  // Call helper that talks to Google Gemini
  const audioStream = await generateSpeech(text);

  return new NextResponse(audioStream, {
    headers: {
      'Content-Type': 'audio/mpeg',      // or audio/wav depending on Gemini settings
      'Cache-Control': 'no-store',       // avoid accidental caching
    },
  });
}
```

## 2. Talking to Gemini inside `/lib/gemini.ts`

```ts
"use server";
import { Readable } from 'node:stream';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generateSpeech(text: string): Promise<Readable> {
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [text],
    audioConfig: {
      voice: 'en-US-Neural2-F',
      mimeType: 'audio/mpeg',
    },
  });

  // SDK returns `Uint8Array` or stream depending on method; convert to Node stream
  return Readable.from(res.audio.data);
}
```

## 3. Streaming vs. Buffering

* **Streaming** (recommended): send `ReadableStream` directly – instant playback starts sooner.
* **Buffering**: if SDK returns a Buffer you can `return new NextResponse(buffer)` but user waits for full file.

> **Tip**: For large audio, use `Readable.toWeb()` to convert Node stream → WHATWG `ReadableStream` required by `NextResponse`.

## 4. Error Handling

Throw within the handler or return `NextResponse.json({error}, {status})` so the client can display nice messages.

```ts
try {
  …
} catch (err) {
  console.error(err);
  return NextResponse.json({ error: 'Gemini request failed' }, { status: 500 });
}
```

## 5. Local Testing

```bash
curl -X POST http://localhost:3000/api/gemini-audio \
     -H "Content-Type: application/json" \
     -d '{"text":"Hello world"}' --output hello.mp3
```

You should receive an `mp3` you can play.

---

## Next Step

Read **Server Actions & Forms** guide to see how to trigger this endpoint from your React UI without writing imperative `fetch` logic. 