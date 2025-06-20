# MoonWhale Voice-Over - Project Structure Documentation

This document provides a comprehensive overview of the MoonWhale Voice-Over project structure, built with Next.js 15.3.4 using the App Router pattern.

## 📋 Project Overview

**Project Name:** moonwhale-voice-over  
**Version:** 0.1.0  
**Framework:** Next.js 15.3.4  
**UI Framework:** TailwindCSS v4  
**Language:** TypeScript  
**Package Manager:** npm  

## 📁 Root Directory Structure

```
moonwhale-voice-over/
├── 📁 .git/                     # Git version control
├── 📁 docs/                     # Project documentation
├── 📁 node_modules/             # Dependencies (auto-generated)
├── 📁 public/                   # Static assets
├── 📁 src/                      # Source code
├── 📄 .gitignore               # Git ignore rules
├── 📄 eslint.config.mjs        # ESLint configuration
├── 📄 next-env.d.ts            # Next.js TypeScript definitions
├── 📄 next.config.ts           # Next.js configuration
├── 📄 package-lock.json        # Dependency lock file
├── 📄 package.json             # Project manifest
├── 📄 postcss.config.mjs       # PostCSS configuration
├── 📄 README.md                # Project readme
└── 📄 tsconfig.json            # TypeScript configuration
```

## 📂 Detailed Directory Breakdown

### `/src` - Source Code Directory

Following Next.js best practices, all application code is contained within the `src` directory:

```
src/
└── 📁 app/                     # App Router directory (Next.js 13+)
    ├── 📄 favicon.ico          # Website favicon
    ├── 📄 globals.css          # Global styles
    ├── 📄 layout.tsx           # Root layout component
    └── 📄 page.tsx             # Home page component
```

#### `/src/app` - App Router Structure

This project uses Next.js App Router (introduced in Next.js 13), which provides:
- File-based routing system
- Layout components for shared UI
- Server and client components
- Streaming and Suspense support

**Key Files:**
- `layout.tsx` - Root layout wrapping all pages
- `page.tsx` - Default home page (maps to `/`)
- `globals.css` - Application-wide CSS styles
- `favicon.ico` - Browser tab icon

### `/public` - Static Assets

```
public/
├── 📄 file.svg                 # File icon SVG
├── 📄 globe.svg                # Globe icon SVG  
├── 📄 next.svg                 # Next.js logo SVG
├── 📄 vercel.svg               # Vercel logo SVG
└── 📄 window.svg               # Window icon SVG
```

The `public` folder contains static assets that are served directly:
- All files are accessible via root URL path (`/file.svg`, `/globe.svg`, etc.)
- SVG icons for UI components
- Logos and branding assets

### `/docs` - Documentation

```
docs/
└── 📄 project-structure.md     # This documentation file
```

Project documentation and guides are stored here for:
- Architecture decisions
- Development guidelines
- API documentation
- Deployment instructions

## ⚙️ Configuration Files

### `package.json` - Project Manifest
```json
{
  "name": "moonwhale-voice-over",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build", 
    "start": "next start",
    "lint": "next lint"
  }
}
```

**Key Dependencies:**
- `next: 15.3.4` - Next.js framework
- `react: ^19.0.0` - React library
- `react-dom: ^19.0.0` - React DOM renderer
- `typescript: ^5` - TypeScript support
- `tailwindcss: ^4` - Utility-first CSS framework

**Development Scripts:**
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint code quality checks

### `next.config.ts` - Next.js Configuration
TypeScript-based configuration for Next.js build and runtime settings.

### `tsconfig.json` - TypeScript Configuration
Defines TypeScript compiler options and project structure for type checking.

### `eslint.config.mjs` - Code Quality
ESLint configuration using the new flat config format with Next.js recommended rules.

### `postcss.config.mjs` - CSS Processing
PostCSS configuration for processing CSS, particularly for TailwindCSS.

## 🎯 Architecture Patterns

### App Router Structure
This project follows Next.js 13+ App Router conventions:

1. **File-System Based Routing**: Routes are defined by folder structure in `/src/app`
2. **Layouts**: Shared UI components that wrap pages
3. **Pages**: Route endpoints that render content
4. **Colocation**: Components can be placed alongside routes

### Component Organization
Currently using a flat structure within `/src/app`, but can be expanded to:

```
src/
├── app/
│   ├── (auth)/                 # Route groups
│   ├── dashboard/              # Feature-based routes
│   └── components/             # Shared components
├── components/                 # Global components
├── lib/                        # Utility functions
└── types/                      # TypeScript definitions
```

## 🚀 Getting Started

### Development Workflow
1. **Clone Repository**: `git clone [repository-url]`
2. **Install Dependencies**: `npm install`
3. **Start Development**: `npm run dev`
4. **Access Application**: `http://localhost:3000`

### Development Features
- **Turbopack**: Fast bundler for development (enabled via `--turbopack` flag)
- **Hot Reload**: Automatic page refresh on file changes
- **TypeScript**: Full type safety and IntelliSense
- **ESLint**: Code quality and style enforcement
- **TailwindCSS v4**: Modern utility-first styling

## 📝 File Naming Conventions

### Next.js Special Files
- `layout.tsx` - Layout components
- `page.tsx` - Page components  
- `loading.tsx` - Loading UI (not yet implemented)
- `error.tsx` - Error boundaries (not yet implemented)
- `not-found.tsx` - 404 pages (not yet implemented)

### General Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Types**: PascalCase with `.types.ts` suffix

## 🔄 Recommended Expansion

As the project grows, consider this structure:

```
src/
├── app/
│   ├── (marketing)/            # Marketing pages group
│   ├── (dashboard)/            # Dashboard pages group
│   ├── api/                    # API routes
│   └── globals.css
├── components/
│   ├── ui/                     # Base UI components
│   ├── forms/                  # Form components
│   └── layout/                 # Layout components
├── lib/
│   ├── utils.ts                # Utility functions
│   ├── validations.ts          # Form validations
│   └── constants.ts            # App constants
├── hooks/                      # Custom React hooks
├── types/                      # TypeScript definitions
└── styles/                     # Additional stylesheets
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [TailwindCSS v4 Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated:** [Current Date]  
**Maintainer:** MoonWhale Voice-Over Team 