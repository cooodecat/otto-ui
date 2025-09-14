# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application using the App Router, React 19, TypeScript, and Tailwind CSS v4. The project uses pnpm as the package manager.

## Essential Commands

```bash
# Development
pnpm dev          # Start development server with Turbopack on http://localhost:3000

# Build & Production
pnpm build        # Build for production with Turbopack
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint on all .js,.jsx,.ts,.tsx files
pnpm lint:fix     # Auto-fix ESLint issues
```

## Architecture & Structure

### App Router Structure

- `/app` directory contains the Next.js App Router pages and layouts
- `app/layout.tsx` - Root layout with Geist font configuration
- `app/page.tsx` - Homepage component
- `app/globals.css` - Global styles with Tailwind CSS

### TypeScript Configuration

- **Base URL**: `src/` - All imports resolve from src directory
- **Path Aliases**:
  - `@/styles/*` → `styles/*`
  - `@/components/*` → `components/*`
- **Strict Mode**: Enabled with all TypeScript strict checks

### ESLint Configuration

- Uses ESLint 9 flat config format in `eslint.config.mjs`
- Extends Next.js core-web-vitals and TypeScript rules
- Custom rules for React 19 (no React import needed), TypeScript, and code quality
- Ignores: `.next/`, `node_modules/`, build files, and config files

### Styling

- Tailwind CSS v4 with PostCSS
- Configuration uses `@tailwindcss/postcss` plugin

## Development Guidelines

### Component Development

- Favor React Server Components (RSC) by default
- Use `'use client'` directive only when client-side interactivity is needed
- Follow functional and declarative programming patterns
- Implement proper error boundaries and use Suspense for async operations

### TypeScript Best Practices

- Prefer interfaces over types
- Use const maps instead of enums
- Variables/args starting with `_` are intentionally unused (ESLint configured)
- Implement proper type safety and inference

### Async Request APIs

For Next.js 15, always use async versions of runtime APIs:

```typescript
const cookieStore = await cookies();
const headersList = await headers();
const params = await props.params;
const searchParams = await props.searchParams;
```

### State Management

- Use `useActionState` instead of deprecated `useFormState`
- Leverage enhanced `useFormStatus` with new properties (data, method, action)
- Consider URL state management with 'nuqs' for client state
- Minimize client-side state when possible

## Environment Variables

- `.env.dev` - Development environment variables
- `.env.example` - Template for environment variables

## 구현 방식

- 구현 방식에 있어서는 .cursorrules를 참조하세요.
