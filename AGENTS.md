<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CareCircle — Elder Care Coordination App

## Project Goal
Production-ready web app for families to coordinate care for aging parents. Built by a beginner learning to code.

## Stack
- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 (class-based dark mode via `@variant dark`)
- Supabase cloud (free tier) — auth, DB, Realtime
- Vitest + React Testing Library for tests
- Capacitor 8 for Android wrapper

## Infrastructure
- Supabase project: `khynszzmetxwvannbonu`
- Dev server: `http://localhost:3001` (port 3000 occupied)
- Schema: `supabase/schema.sql` — re-run in Supabase SQL Editor after RLS changes
- Email confirmation disabled in Supabase Auth → Settings

## What's Built

### Auth
- Login/signup pages with redirect support for invite flow
- Password reset flow: `/forgot-password` → email → `/update-password`
- Supabase SSR middleware: guards all routes except `/login`, `/signup`, `/auth/*`, `/invite/*`, `/forgot-password`, `/update-password`
- Auth callback at `/auth/callback` exchanges code for session

### Core Features
- **Dashboard**: list elders, create profiles, auto-add creator as admin
- **Elder detail page**: 5 tabs — Check-ins, Medications, Contacts, Invite, Feed
- **Medications**: full CRUD (add, edit inline, delete with confirmation), dosage/frequency/time/notes
- **Daily check-ins**: one-tap "All good" or "Needs help", recent list with pagination
- **Emergency contacts**: full CRUD (add, edit inline, delete with confirmation), name/phone/relationship
- **Invite system**: generate 8-char codes, copy link, revoke, public `/invite/[code]` landing page
- **Family feed**: combined timeline of check-ins + medications with pagination
- **Emergency alert**: one-tap inserts `needs_help` check-in with "🚨 Emergency alert triggered!" note

### Real-time (Supabase Realtime)
- Subscribes to `check_ins` and `medications` INSERT events per elder
- Other family members see new check-ins/medications appear instantly with toast notifications
- Skips own actions (filtered by `user_id`)
- Idempotent — no duplicates if `loadData()` runs concurrently

### UI Polish
- Custom design system: reusable `Button`, `Card`, `Input`, `Badge`, `EmptyState`, `Toast`, `Spinner`, `Skeleton`, `ConfirmDialog`, `Tooltip`
- Dark mode with `ThemeProvider` — persists to localStorage, respects system preference
- Mobile hamburger nav in `Header` component
- Staggered card animations, gradient accents, backdrop blur
- Responsive grid layout
- Toast notifications for all actions
- Inline form validation with error states
- Loading skeletons on all pages

### Pagination
- Check-ins and feed: 10 per page, "Load more" button fetches next batch via Supabase `.range()`
- `hasMore` detection: fetches `PAGE_SIZE + 1`, trims to `PAGE_SIZE`

### Testing (73 tests, 8 files)
- `ui.test.tsx` (37): Button variants/disabled/click, Card render/click, Input label/error/defaultValue, Badge colors, Spinner SVG, Skeleton class, EmptyState, Toast message/type/close, ConfirmDialog open/close/confirm/cancel, Tooltip
- `header.test.tsx` (7): brand, user name, back button, logout, dark toggle, mobile menu
- `theme-provider.test.tsx` (6): default light, toggle, localStorage persistence, system preference
- `page.test.tsx` (6): landing page hero, CTA, features, tagline, footer
- `login/page.test.tsx` (6): heading, inputs, submit button, signup link, forgot password link, form submit
- `signup/page.test.tsx` (5): heading, inputs, submit button, login link, form submit
- `forgot-password/page.test.tsx` (4): heading, email input, login link, submit → success state
- `update-password/page.test.tsx` (2): heading, password input (after session check)

### Android (Capacitor)
- Android project at `android/` with app ID `com.carecircle.app`
- Dev mode: connects to `http://10.0.2.2:3001` (emulator → host)
- `cleartext: true` for HTTP dev
- APK build: `cd android && .\gradlew assembleDebug`
- Output: `android/app/build/outputs/apk/debug/app-debug.apk`

## Key Decisions
- **Supabase cloud** over local DB (no Docker)
- **RLS with DROP POLICY IF EXISTS**: avoids infinite recursion from self-referencing policies. Uses UNION subqueries via `elders.created_by`.
- **Client-side auth pages**: all `"use client"` with `force-dynamic` to avoid SSR prerender failures
- **Inline editing** over modals for meds/contacts (simpler UX)
- **Capacitor server.url** over static export: Next.js App Router can't `next export`

## Common Gotchas
- Email rate limit on free Supabase tier (2/hr) — hitting during testing
- Android emulator uses `10.0.2.2` not `localhost` to reach host
- After RLS changes, re-run full `schema.sql` in Supabase SQL Editor
- Port 3000 occupied → use `-p 3001`
- Recovery email links need `http://localhost:3001/update-password` in Supabase Auth → Settings → Redirect URLs

## Relevant Files
- `src/app/*.tsx`: All pages (landing, auth, dashboard, elder detail, invite, forgot/reset password)
- `src/components/ui.tsx`: Reusable UI primitives
- `src/components/header.tsx`: App header with dark toggle + mobile nav
- `src/components/theme-provider.tsx`: Dark mode context
- `src/lib/supabase/client.ts`, `server.ts`, `middleware.ts`: Supabase client factories
- `src/middleware.ts`: Auth guard
- `supabase/schema.sql`: Full DB schema
- `capacitor.config.ts`: Android config
- `.env.local`: Supabase project URL and anon key
