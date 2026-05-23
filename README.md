# AI PhotoStudio

AI-powered photo studio — transform your photos into artistic masterpieces across various styles and locations.

## 🚀 Tech Stack

- **Monorepo**: Turborepo
- **Runtime**: Bun
- **API**: Hono (Bun-native web framework)
- **Web**: React + Vite + TailwindCSS
- **Database**: SQLite (via bun:sqlite)
- **Payments**: Wata Pay

## 📁 Project Structure

```
ai-photostudio/
├── apps/
│   ├── api/          # Backend API (Hono)
│   └── web/          # Frontend (React + Vite)
├── packages/
│   └── shared/       # Shared types and utilities
├── package.json      # Root workspace config
├── turbo.json        # Turborepo pipeline
└── bun.lock          # Bun lockfile
```

## 🛠️ Getting Started

```bash
# Install dependencies
bun install

# Start development
bun run dev

# Build all packages
bun run build
```

## 📦 Packages

- `@ai-photostudio/shared` — Shared TypeScript types
- `apps/api` — Backend API server
- `apps/web` — Frontend application

## 🔑 Environment Variables

Create a `.env` file in each app directory:

### apps/api/.env
```
JWT_SECRET=your-secret-key
WATA_API_KEY=your-wata-api-key
```

### apps/web/.env
```
VITE_API_URL=http://localhost:3001
```
