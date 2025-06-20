# MoonWhale Voice-Over - Linking and Navigating Documentation

This document provides a comprehensive guide to linking and navigating in the MoonWhale Voice-Over project, built with Next.js 15.3.4 App Router pattern.

## 📋 Overview

Based on the [Next.js Linking and Navigating documentation](https://nextjs.org/docs/app/getting-started/linking-and-navigating), this project will implement efficient client-side navigation with prefetching, caching, and optimized performance.

**Current State:**
- **Framework:** Next.js 15.3.4 with App Router
- **Navigation:** External links only (no internal navigation yet)
- **Link Component:** Not yet implemented
- **Navigation Hooks:** Not yet used

## 📚 Key Navigation Concepts

### **Link Component (`next/link`)**
The primary method for navigating between routes in Next.js. Provides:
- Client-side transitions
- Automatic prefetching
- Performance optimizations

### **useRouter Hook**
Programmatic navigation and route information access in Client Components.

### **Redirect Function**
Server-side redirects in Server Components, Route Handlers, and Server Actions.

### **Native History API**
Browser history manipulation with `pushState` and `replaceState`.

## 🏗️ Current Implementation Analysis

### External Links in Home Page (`src/app/page.tsx`)

```typescript
// Current implementation uses standard anchor tags for external links
<a
  className="rounded-full border border-solid..."
  href="https://vercel.com/new?utm_source=create-next-app..."
  target="_blank"
  rel="noopener noreferrer"
>
  Deploy now
</a>

<a
  className="rounded-full border border-solid..."
  href="https://nextjs.org/docs?utm_source=create-next-app..."
  target="_blank"
  rel="noopener noreferrer"
>
  Read our docs
</a>
```

**Current Features:**
- ✅ **External Links**: Proper `target="_blank"` and security attributes
- ✅ **Security**: `rel="noopener noreferrer"` prevents security vulnerabilities
- ✅ **Styling**: TailwindCSS classes with hover states
- ✅ **Accessibility**: Semantic anchor elements

**Missing Features:**
- ❌ **Internal Navigation**: No `next/link` implementation
- ❌ **Route Structure**: Single page application currently
- ❌ **Prefetching**: No route prefetching implemented
- ❌ **Loading States**: No navigation loading indicators

## 🛠️ Implementation Guide

### 1. Basic Link Component Usage

```typescript
import Link from 'next/link';

// Basic internal link
<Link href="/about">About Us</Link>

// Link with custom styling
<Link 
  href="/services" 
  className="bg-blue-500 text-white px-4 py-2 rounded"
>
  Our Services
</Link>

// Dynamic route link
<Link href={`/portfolio/${projectId}`}>
  View Project
</Link>
```

### 2. Advanced Link Patterns

```typescript
import Link from 'next/link';

// Link with prefetch control
<Link href="/portfolio" prefetch={false}>
  Portfolio (No Prefetch)
</Link>

// Link with scroll behavior
<Link href="/contact" scroll={false}>
  Contact (No Scroll Reset)
</Link>

// Link with replace behavior
<Link href="/login" replace>
  Login (Replace History)
</Link>

// Conditional link rendering
{isAuthenticated ? (
  <Link href="/dashboard">Dashboard</Link>
) : (
  <Link href="/login">Login</Link>
)}
```

### 3. Navigation Hooks Implementation

```typescript
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function NavigationComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Programmatic navigation
  const handleNavigation = () => {
    router.push('/services');
    // or router.replace('/services') for replace behavior
  };

  // Get current route information
  const currentPath = pathname; // e.g., '/about'
  const queryParam = searchParams.get('category'); // e.g., 'voice-over'

  return (
    <div>
      <p>Current path: {currentPath}</p>
      <button onClick={handleNavigation}>Go to Services</button>
    </div>
  );
}
```

### 4. Server-Side Redirects

```typescript
import { redirect } from 'next/navigation';

// In Server Components, Route Handlers, or Server Actions
export default async function ProtectedPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  return <div>Protected content</div>;
}

// Permanent redirect
import { permanentRedirect } from 'next/navigation';

export default function OldPage() {
  permanentRedirect('/new-page');
}
```

## 🎨 Navigation UI Patterns

### 1. Header Navigation Component

```typescript
'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-xl font-bold">
            MoonWhale Voice-Over
          </Link>
          
          <ul className="flex space-x-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`transition-colors hover:text-blue-600 ${
                    pathname === item.href 
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
```

### 2. Breadcrumb Navigation

```typescript
'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumb() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment);

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    
    return { href, label };
  });

  return (
    <nav className="flex text-sm text-gray-600 mb-4">
      <Link href="/" className="hover:text-blue-600">
        Home
      </Link>
      {breadcrumbItems.map((item, index) => (
        <span key={item.href} className="flex items-center">
          <span className="mx-2">/</span>
          {index === breadcrumbItems.length - 1 ? (
            <span className="text-gray-900">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-blue-600">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
```

### 3. Loading States with `useLinkStatus`

```typescript
'use client'

import Link from 'next/link';
import { useLinkStatus } from 'next/link';

function NavigationLink({ href, children }: { href: string; children: React.ReactNode }) {
  const { pending } = useLinkStatus();

  return (
    <Link href={href} className="relative">
      {children}
      {pending && (
        <div className="absolute inset-0 bg-blue-100 opacity-50 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </Link>
  );
}

export default function LoadingAwareNavigation() {
  return (
    <nav>
      <NavigationLink href="/services">Services</NavigationLink>
      <NavigationLink href="/portfolio">Portfolio</NavigationLink>
    </nav>
  );
}
```

## ⚡ Performance Optimizations

### 1. Prefetching Strategies

```typescript
import Link from 'next/link';

// Default prefetching (recommended)
<Link href="/portfolio">Portfolio</Link>

// Disable prefetching for less important links
<Link href="/terms" prefetch={false}>Terms</Link>

// Hover-based prefetching for resource efficiency
function HoverPrefetchLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [shouldPrefetch, setShouldPrefetch] = useState(false);

  return (
    <Link
      href={href}
      prefetch={shouldPrefetch ? undefined : false}
      onMouseEnter={() => setShouldPrefetch(true)}
    >
      {children}
    </Link>
  );
}
```

### 2. Loading UI Implementation

```typescript
// app/services/loading.tsx
export default function ServicesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 3. Error Boundaries

```typescript
// app/services/error.tsx
'use client'

export default function ServicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">
        Something went wrong!
      </h1>
      <p className="text-gray-600 mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}
```

## 🔧 Recommended Project Structure

### Enhanced Navigation Implementation

```
src/
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx           # Marketing layout with nav
│   │   ├── page.tsx             # Home page
│   │   ├── about/
│   │   │   ├── page.tsx         # About page
│   │   │   └── loading.tsx      # About loading
│   │   ├── services/
│   │   │   ├── page.tsx         # Services page
│   │   │   ├── loading.tsx      # Services loading
│   │   │   └── [category]/
│   │   │       └── page.tsx     # Service category
│   │   └── contact/
│   │       ├── page.tsx         # Contact page
│   │       └── loading.tsx      # Contact loading
│   ├── portfolio/
│   │   ├── page.tsx             # Portfolio list
│   │   ├── loading.tsx          # Portfolio loading
│   │   └── [id]/
│   │       ├── page.tsx         # Portfolio item
│   │       ├── loading.tsx      # Item loading
│   │       └── error.tsx        # Item error
│   └── layout.tsx               # Root layout
├── components/
│   ├── navigation/
│   │   ├── Header.tsx           # Main navigation
│   │   ├── Footer.tsx           # Footer navigation
│   │   ├── Breadcrumb.tsx       # Breadcrumb navigation
│   │   └── MobileMenu.tsx       # Mobile navigation
│   └── ui/
│       ├── LoadingSpinner.tsx   # Loading components
│       └── ErrorBoundary.tsx    # Error handling
└── lib/
    └── navigation.ts            # Navigation utilities
```

## 📱 Mobile Navigation Pattern

```typescript
'use client'

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <div className="md:hidden">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-gray-400 hover:text-gray-500"
      >
        <span className="sr-only">Open main menu</span>
        {/* Hamburger icon */}
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-md border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

## 🎯 SEO and Performance Best Practices

### 1. Dynamic Metadata with Navigation Context

```typescript
import type { Metadata } from 'next';

type Props = {
  params: { category: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = params.category;
  
  return {
    title: `${category} Services | MoonWhale Voice-Over`,
    description: `Professional ${category} voice-over services`,
    openGraph: {
      title: `${category} Services | MoonWhale Voice-Over`,
      description: `Professional ${category} voice-over services`,
    },
  };
}
```

### 2. Static Route Generation

```typescript
// app/services/[category]/page.tsx
export async function generateStaticParams() {
  const categories = ['narration', 'commercial', 'documentary', 'animation'];
  
  return categories.map((category) => ({
    category: category,
  }));
}
```

### 3. Optimized Link Monitoring

```typescript
'use client'

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page views for analytics
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    
    // Analytics tracking
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: url,
    });
  }, [pathname, searchParams]);

  return null;
}
```

## 🚀 Next Steps

### Immediate Implementation
1. **Add Navigation Component**: Create header navigation with Link components
2. **Implement Basic Routes**: Add About, Services, Contact pages
3. **Add Loading States**: Implement loading.tsx files for better UX
4. **Error Handling**: Add error.tsx files for graceful error handling

### Advanced Features
1. **Search Functionality**: Implement search with query parameters
2. **Infinite Scrolling**: Portfolio with dynamic loading
3. **Breadcrumb Navigation**: For deep nested routes
4. **Keyboard Navigation**: Accessibility improvements

### Performance Optimizations
1. **Route Prefetching**: Strategic prefetch implementation
2. **Bundle Splitting**: Route-based code splitting
3. **Loading Indicators**: Enhanced loading states
4. **Error Recovery**: Automatic retry mechanisms

## 📚 Additional Resources

- [Next.js Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating)
- [Next.js Link Component API](https://nextjs.org/docs/app/api-reference/components/link)
- [Next.js Navigation Hooks](https://nextjs.org/docs/app/api-reference/functions)
- [React Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)

---

**Last Updated:** [Current Date]  
**Maintainer:** MoonWhale Voice-Over Team 