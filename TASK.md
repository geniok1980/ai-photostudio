# Task: Build AI PhotoStudio Platform

## Overview
Create a web platform where users upload their photo, choose a location/scene, and get AI-generated photos in those locations with their face preserved.

## Stack
- Frontend: React + Vite (TypeScript)
- Backend: Hono.js + Bun
- Database: SQLite (Bun's built-in, or better-sqlite3)
- AI Generation: OpenRouter API (google/gemini-2.5-flash-image-preview)
- Payments: WATA Pay (wata-pay SDK from npm)
- Monorepo: Turborepo

## What to Build

### 1. GitHub Repository
- Create a new repo called "ai-photostudio" under the geniok1980 GitHub account
- GitHub token is available via: `cd /root/clawhost && git remote get-url origin | grep -oP 'ghp_[^@]+' | head -1`
- Full monorepo structure with Turborepo

### 2. Project Structure
```
ai-photostudio/
├── apps/
│   ├── web/              # React + Vite frontend
│   └── api/              # Hono.js + Bun backend
├── packages/
│   └── shared/           # Shared types and validation
├── package.json          # Turborepo root
├── turbo.json
└── README.md
```

### 3. Backend (apps/api) - Hono.js + Bun

**Core Routes:**

POST /api/generate
- Accepts: { locationId: string }
- Checks user's generation balance
- Loads user's photo + location prompt
- Calls OpenRouter API with the photo and prompt
- Saves result, decrements balance
- Returns task status

GET /api/generate/:id
- Returns generation status and result URL

GET /api/generate/history
- User's generation history with pagination

POST /api/auth/register
- Email + password registration
- Password hashing with bcrypt

POST /api/auth/login
- JWT-based auth

GET /api/locations
- List available locations

GET /api/packages
- List available tariff packages

POST /api/payments/create-link
- Creates WATA Pay payment link
- Uses wata-pay SDK

POST /api/webhooks/wata
- WATA Pay webhook handler
- On successful payment, credits user's balance

**Admin Routes:**

GET /api/admin/dashboard
- Stats: users count, revenue, generations count

CRUD /api/admin/locations
- Manage locations (name, prompt, category, preview)

CRUD /api/admin/packages
- Manage tariff packages

GET /api/admin/users
- List/manage users

**Services:**

src/services/openrouter.ts
- generatePhoto(photoBase64, prompt) → imageUrl
- Uses: model "google/gemini-2.5-flash-image-preview"
- Endpoint: https://openrouter.ai/api/v1/chat/completions
- API key from env: OPENROUTER_API_KEY

src/services/wata.ts
- createPaymentLink(amount, orderId, description) → paymentUrl
- Uses wata-pay SDK
- API key from env: WATA_API_TOKEN

### 4. Frontend (apps/web) - React + Vite

**Pages:**
- `/` - Landing page with examples, CTA
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/app` - Main app (upload photo, choose location, generate)
- `/app/history` - Generation history
- `/pricing` - Pricing/Packages page
- `/payment/success` - Payment success page
- `/payment/fail` - Payment fail page
- `/admin` - Admin dashboard (protected)

**Components:**
- PhotoUploader - drag & drop photo upload with preview
- LocationSelector - grid of location cards with previews
- GeneratedResult - before/after comparison
- AuthGuard - route protection
- PackageCard - pricing card component

**Design:**
- Dark theme (like typical AI services)
- Clean, modern UI
- Responsive design
- Loading states with skeletons

### 5. Database Schema

```sql
-- Users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  name TEXT,
  role TEXT DEFAULT 'user',
  free_attempts_used INTEGER DEFAULT 0,
  balance_generations INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations
CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  category TEXT,
  preview_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Packages (tariffs)
CREATE TABLE packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  generations_count INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT 1
);

-- Generations
CREATE TABLE generations (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  location_id TEXT REFERENCES locations(id),
  original_photo_url TEXT NOT NULL,
  result_url TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'processing',
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Payments
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  package_id TEXT REFERENCES packages(id),
  wata_transaction_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'RUB',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP
);
```

### 6. Default Locations (seed data)

Insert these default locations:

1. "Пляж на закате" - "Transform this person to a tropical beach at sunset, warm golden light, ocean waves, palm trees, photorealistic, high quality" - category: "Природа"
2. "Нью-Йорк Таймс-сквер" - "Place this person in Times Square New York City at night, neon lights, busy streets, cinematic, high quality" - category: "Города"
3. "Космос" - "Place this person floating in outer space, Earth in background, stars, nebula, sci-fi, cinematic" - category: "Фэнтези"
4. "Средневековый замок" - "Place this person in a grand medieval castle hall, stone walls, torches, dramatic lighting" - category: "Фэнтези"
5. "Японский сад" - "Place this person in a traditional Japanese garden, cherry blossoms, pond, wooden bridge, serene" - category: "Природа"
6. "Офис будущего" - "Place this person in a futuristic office, holographic displays, sleek design, blue lighting, cyberpunk" - category: "Города"
7. "Древний Рим" - "Place this person in ancient Rome, Colosseum background, togas, roman architecture, golden hour" - category: "Эпохи"

### 7. Default Packages (seed data)

1. "Пробный" - price: 0, generations: 2, is_active: true
2. "Стартовый" - price: 29900, generations: 10, is_active: true
3. "Оптимальный" - price: 59900, generations: 30, is_active: true
4. "PRO" - price: 149900, generations: 100, is_active: true

(Prices in kopecks: 29900 = 299₽)

### 8. First Admin User

Create a seed admin user:
- Email: admin@photostudio.app
- Password: hashed version of a secure password (generate one)
- Role: admin
- Free attempts: 999

## Implementation Steps

1. **Create GitHub repo** with proper initialization
2. **Initialize Turborepo monorepo** with apps/web and apps/api
3. **Build backend** (Hono.js) - routes, services, database
4. **Build frontend** (React + Vite) - pages, components, design
5. **Seed data** - default locations and packages
6. **Push everything** to GitHub

## Important Notes

- Use Bun as the runtime (bun install, bun run dev)
- ALL code must be TypeScript
- Use JWT for authentication
- Store files locally in uploads/ directory
- Create a comprehensive .env.example with all required env vars
- Use the GitHub token from the git remote URL for creating the repo
- The repo should be PUBLIC
- Make sure the app builds and runs successfully with `bun run dev`

## WATA Pay Integration

The wata-pay SDK is available on npm:
```typescript
import { WataPayApi } from "wata-pay";
const wata = new WataPayApi("your-token", "sandbox"); // sandbox mode for dev
const link = await wata.createLink({
  amount: 29900,
  currency: "RUB",
  orderId: "test-order",
  description: "AI PhotoStudio - Пакет",
  successRedirectUrl: "http://localhost:5173/payment/success",
  failRedirectUrl: "http://localhost:5173/payment/fail",
});
```

## OpenRouter API

```typescript
const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash-image-preview",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: locationPrompt },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${photoBase64}` } }
      ]
    }]
  })
});
```
