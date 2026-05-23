You are an expert developer. Your task is to build a complete AI PhotoStudio platform.

## Step 1: Create GitHub Repository
- Create a public repo called "ai-photostudio" under geniok1980 on GitHub
- Get the token: run `cd /root/clawhost && git remote get-url origin | grep -oP 'ghp_[^@]+' | head -1`
- Use GitHub API to create the repo

## Step 2: Initialize Monorepo
- Create a Turborepo monorepo with this structure:
```
ai-photostudio/
├── apps/
│   ├── web/          # React + Vite (TypeScript)
│   └── api/          # Hono.js + Bun (TypeScript)
├── packages/
│   └── shared/       # Shared types
├── package.json
├── turbo.json
└── README.md
```

## Step 3: Build the Backend (apps/api)
Framework: Hono.js + Bun

### Database (SQLite with bun:sqlite)
Tables: users, locations, packages, generations, payments
Schema is standard SQL - users (id, email, password_hash, name, role, balance), locations (id, name, prompt, category), packages (id, name, price, generations_count), generations (id, user_id, location_id, status, result_url), payments (id, user_id, amount, status, wata_transaction_id)

### API Routes:
- POST /api/auth/register - email+password registration with JWT
- POST /api/auth/login - JWT login
- GET /api/locations - list active locations
- GET /api/packages - list packages
- POST /api/generate - create generation (checks balance, calls OpenRouter)
- GET /api/generate/:id - check status
- GET /api/generate/history - user history
- POST /api/payments/create-link - WATA Pay link
- POST /api/webhooks/wata - payment webhook
- GET /api/admin/dashboard - admin stats
- Admin CRUD routes for locations, packages, users

### Services:
src/services/openrouter.ts - calls OpenRouter API with google/gemini-2.5-flash-image-preview
src/services/wata.ts - WATA Pay integration with wata-pay SDK

## Step 4: Build the Frontend (apps/web)
React 18 + Vite + TypeScript

Pages: Landing (/), Login, Register, App (upload+generate), History, Pricing, Admin
Components: PhotoUploader, LocationSelector, GeneratedResult, AuthGuard, PackageCard
Dark theme, responsive, loading skeletons

## Step 5: Seed Data
Default locations (7 locations like beach, nyc, space, castle, etc.)
Default packages (Trial 0₽/2gen, Starter 299₽/10gen, Optimal 599₽/30gen, PRO 1499₽/100gen)

## Step 6: Git
- Initialize git repo
- Make initial commit
- Push to GitHub

Important: Make sure everything builds and runs. Use `bun run dev` to verify.