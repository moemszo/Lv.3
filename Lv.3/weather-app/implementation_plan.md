# Implementation Plan - Auth & Database (Supabase)

## Goal
Upgrade the application to be "continuously usable" by adding Authentication and Database capabilities.

## Requirements
| Item | Content |
| :--- | :--- |
| **Tools** | Supabase, Next.js |
| **Features** | Email/Social Login, Profile Edit, Memo CRUD (User Scoped) |
| **Learning** | RLS (Row Level Security), Types, Migrations, API Security |
| **Deployment** | Vercel (Frontend), Supabase (Backend) |

## Phase 1: Setup & Configuration
- [x] Install Supabase client libraries (`@supabase/supabase-js`, `@supabase/ssr`)
- [x] Configure Environment Variables (`.env.local`)
- [x] Create Supabase Utility/Client helper files

## Phase 2: Authentication
- [x] Create Login Page (`/login`)
- [x] Implement Auth Actions (Sign Up, Sign In, Sign Out)
- [x] Add Middleware for route protection

## Phase 3: Database & RLS
- [x] Define Schema (SQL) for `profiles` and `memos`
- [x] Enable RLS and write policies (User can only see their own data)
- [x] Generate TypeScript types from Schema

## Phase 4: Feature Implementation
- [x] **Profile**: Create/Edit user profile page
- [x] **Memos**: Create CRUD interface for Memos
- [x] **Integration**: Link Memos to UI (e.g., a "Dashboard" or "Notes" page)

## Phase 5: Verification
- [ ] Verify RLS (try accessing other users' data)
- [ ] Verify Deployment
