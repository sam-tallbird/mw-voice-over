# Integrating Google Gemini API (Audio) with a Next.js App Router Project

> **Goal** – Send user-provided text to the Google Gemini API → receive an **audio file (speech synthesis)** → stream / play it back in the browser.

This overview maps the moving parts in a modern **Next.js 15 App Router** code-base and links to the official docs you should be comfortable with before wiring things up.

| Area | Why it matters | Official doc |
|------|----------------|-------------|
| **Route Handlers** (`app/api/**/route.ts`) | Replace legacy *API Routes* with the App Router equivalent; run server-side code that talks to Gemini & returns an audio stream. | [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) |
| **Streaming & File responses** | Gemini returns binary audio. We must set the correct `Content-Type` (`audio/mpeg`, `audio/wav`, …) and optionally **stream** the `ReadableStream` to the client. | [Streaming – Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#streaming) |
| **Server Actions** (`"use server"`) | Opt-in functions that run on the server, can be invoked from a form or client component without extra fetch boiler-plate. Ideal for *triggering* the Gemini call. | [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions) |
| **Forms & Mutations** | Built-in ways to wire `<form action={myAction}>` to a Server Action, passing the 1000-char textarea text. | [Forms Guide](https://nextjs.org/docs/app/building-your-application/forms) |
| **Environment Variables** | Keep `GEMINI_API_KEY` secure and only available server-side. | [Environment Vars](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables) |
| **Client Components** (`"use client"`) | Needed for an **interactive audio player** (play/ pause UI); cannot import server-only code here. | [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-and-client-components#client-components) |
| **Caching / Revalidation** | Optional – cache identical TTS requests (`"use cache"`) or tag responses for later invalidation. | [Caching Guide](https://nextjs.org/docs/app/building-your-application/data-fetching/caching) |

---

## Recommended File Structure

```
src/
  app/
    api/
      gemini-aaudio/
        route.ts        ← POST handler: calls Gemini, returns audio
    page.tsx           ← Home page with textarea + "Generate" button
  components/
    AudioPlayer.tsx     ← Client component that plays returned audio
```

---

## Integration Steps (High-level)

1. **Create Route Handler** – `app/api/gemini-audio/route.ts`
   ```ts
   import { NextResponse } from 'next/server';
   import { generateAudio } from '@/lib/gemini';

   export async function POST(req: Request) {
     const { text } = await req.json();
     const audioStream = await generateAudio(text);
     return new NextResponse(audioStream, {
       headers: {
         'Content-Type': 'audio/mpeg' // or wav
       }
     });
   }
   ```
2. **Server Action** – Submit textarea content to the handler (or call Gemini directly inside the action if you don't need a separate route).
3. **Client Audio Player** – Receive a Blob/URL, feed it to `<audio>` or `Audio` element, show basic controls.
4. **Env Vars** – Add `GEMINI_API_KEY` to `.env.local`; mark any file that uses it with `"use server"`.
5. **Deploy** – Ensure the hosting platform (Vercel, Netlify) allows streaming/binary responses.

> The following markdowns dive into each bullet in detail. 