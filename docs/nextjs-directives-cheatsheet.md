# Next.js App Router Directives – Quick Cheat-Sheet

> A high-signal summary of the three file/function level directives that control **rendering behavior, runtime environment, and caching** inside the Next.js App Router (≥ v13.4). Optimised for day-to-day use when building or reviewing code.

---

## 1. `"use client"`

|            | Details |
|------------|---------|
| **Scope**  | Top of a file **_or_** top of an **exported function** within `/app` or any module imported by it. |
| **Purpose**| Opt-in to **Client Components** – the code is bundled, sent to the browser and executed there. |
| **When to use** | • Needs React hooks (`useState`, `useEffect`, …)  <br/>• Browser-only APIs (`window`, `localStorage`, media queries)  <br/>• Interactive UI (forms, event handlers) |
| **What you lose** | • Automatic server rendering  <br/>• Access to Node APIs / FS  <br/>• Smaller JS bundles (beware of bloat) |
| **Gotchas** | • **Cannot import Server-only modules** (e.g. `fs`)  <br/>• Every *child* of a Client Component is also treated as client by default (bubble-down model). |

```tsx
// src/components/ThemeToggle.tsx
"use client";
import { useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  return (
    <button onClick={() => setDark(!dark)}>
      {dark ? "🌑" : "🌕"}
    </button>
  );
}
```

---

## 2. `"use server"`

|            | Details |
|------------|---------|
| **Scope**  | Top of an **async function** (Server Action) or entire file. |
| **Purpose**| Explicitly declare **Server Actions / Functions** that run **only on the server** & can be invoked from the client via `action` props or programmatic calls. |
| **Common use cases** | • Mutations (DB writes)  <br/>• Secure secrets usage  <br/>• Form `action` handlers without API routes |
| **Rules**  | • Must **export** if called across module boundary  <br/>• First argument from React comes from `<form action={someAction}>…`  <br/>• Can return values (serialisable) back to the client. |
| **Security** | Code never ships to the browser – secrets stay server-side. |

```tsx
// app/actions/sendEmail.ts
"use server";
import { resend } from "@resend/sdk";

export async function sendEmail(formData: FormData) {
  const email = formData.get("email") as string;
  await resend.emails.send({ to: email, … });
}
```

---

## 3. `"use cache"`

|                     | Details |
|---------------------|---------|
| **Scope**           | Top of an **async function** (usually data-fetching helpers). |
| **Purpose**         | Memoises the function's **resolved value** during a request **and across requests** (unless revalidated). Effectively a built-in, opinionated wrapper around `React.cache`. |
| **Cache key**       | Derived from **arguments** + **caller route segment**. Identical calls return the cached result. |
| **Invalidation**    | Controlled via `revalidatePath`, `revalidateTag`, route segment options (`export const revalidate = …`), or manual params. |
| **When to use**     | • Expensive database / API reads  <br/>• Computed values that rarely change  <br/>• Third-party requests with aggressive caching. |
| **When *not* to use**| • Highly dynamic per-user data  <br/>• Functions that rely on mutable globals. |

```ts
// lib/data.ts
"use cache";
import { sql } from "@vercel/postgres";

export async function getTopProducts(limit = 10) {
  return sql`SELECT * FROM products ORDER BY sales DESC LIMIT ${limit}`;
}
```

---

## Quick Decision Matrix

| Need state / DOM? | Need secret access? | Expensive read? | Directive |
|-------------------|---------------------|-----------------|-----------|
| ✅               | –                   | –               | **`use client`** |
| ❌               | ✅                  | –               | **`use server`** |
| ❌               | –                   | ✅              | **`use cache`** |

---

### Additional Tips
1. Directives are **compile-time annotations** – no runtime cost.
2. You can combine `"use cache"` and `"use server"` inside the same function to run on the server *and* be cached.
3. colocate actions & data functions near their usage – keeps mental model clear.

> For full docs see Next.js official pages: [`use client`](https://nextjs.org/docs/app/api-reference/directives/use-client), [`use server`](https://nextjs.org/docs/app/api-reference/directives/use-server), [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache). 