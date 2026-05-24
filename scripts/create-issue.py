#!/usr/bin/env python3
"""Create GitHub Issue for ai-photostudio"""
import subprocess
import json

# Get token
result = subprocess.run(
    ['git', 'remote', 'get-url', 'origin'],
    capture_output=True, text=True, cwd='/root/ai-photostudio'
)
url = result.stdout.strip()
import re
m = re.search(r'ghp_[^@]+', url)
token = m.group(0) if m else None

if not token:
    print("ERROR: Could not extract token")
    exit(1)

body = """## 🎯 Goal: Add Aidentika-style features — Product Photography, Infographics, Spark System

Inspired by [Aidentika.com](https://aidentika.com) — turn AI PhotoStudio into a dual-mode platform: **Portrait** (existing) + **Product Photography** (new).

Full technical specification: see `TZ-AIDENTIKA-FEATURES.md` in the repo root.

---

### Phase 1: Product Photography Mode

Add a new generation type — users upload product photos, choose a concept and category, and get studio-quality e-commerce photos.

**Database changes** (add to `apps/api/src/db/schema.sql`):
- New tables: `generation_modes`, `product_categories`, `concepts`
- New fields on `generations`: `mode_id`, `concept_id`, `category_id`, `product_description`

**Backend API routes** (create in `apps/api/src/routes/`):
- `GET /api/modes` — list generation modes (portrait, product)
- `GET /api/concepts?mode_id=X` — concepts (catalog_shot, on_model, composition)
- `GET /api/categories` — product categories (7 categories)
- `POST /api/generate/product` — create product generation
- Register all new routes in `apps/api/src/index.ts`

**Frontend**:
- Add mode switch toggle on Dashboard (Портрет / Товар)
- Create `apps/web/src/pages/ProductDashboard.tsx` with workflow:
  1. Upload product photo + description
  2. Select category → auto-filters suggested concepts
  3. Select concept → prompt built from template
  4. Generate and display result
- Add `/app/product` route in `App.tsx`
- Create `apps/web/src/components/ProductPhotoUploader.tsx`

**Prompt templates** (store in `concepts.prompt_template`):
- `catalog_shot`: \"Product photography of {description}. Clean white background, studio lighting, professional catalog shot, high detail, 8K, centered\"
- `on_model`: \"Product photography of {description}. Held by a person, lifestyle shot, natural lighting, realistic, professional e-commerce\"
- `composition`: \"Artistic composition of {description} with complementary props, flat lay style, premium product photography\"

---

### Phase 2: Infographics Overlay

After product photo generation, user can add text badges/features for marketplace-ready cards.

**Component**: `apps/web/src/components/InfographicEditor.tsx`
- Generated photo as canvas background via HTML Canvas
- 3 ready templates (Variant 1, 2, 3 — like Aidentika)
- Drag & drop text blocks: product name, price, features (use fabric.js or native HTML drag)
- Badges: «Скидка», «Хит», «Новинка», «Акция»
- Export to PNG

**Backend**: `POST /api/infographics/render` — accepts JSON with element positions + image id, returns rendered image URL

**Database**: `infographic_templates` table (id, name, preview_url, config JSON, is_active)

---

### Phase 3: Spark Virtual Currency System

Replace/add to the existing `balance_generations` with a universal Spark currency.

**Database**: `spark_transactions` table (user_id, amount, balance_after, type, reference_id)
- Add `spark_balance` and `total_sparks_earned` columns to `users`

**Pricing** (4 tiers like Aidentika):
| Plan | Price | Sparks | Images | Video |
|------|-------|--------|--------|-------|
| Старт | 390₽ | 50 | 12 | 3 |
| Креатор | 990₽ | 140 | 35 | 8 |
| Студия | 2,490₽ | 400 | 100 | 25 |
| Бизнес | 6,490₽ | 1,200 | 300 | 75 |

**Cost per action**:
- 1 image (portrait or product) = 4 sparks
- 1 image + infographic = 5 sparks
- 1 video (5s) = 15 sparks
- 1 video (15s) = 30 sparks

**New/updated API**:
- `GET /api/sparks/balance` — current spark balance
- `GET /api/sparks/history` — transaction history
- `POST /api/sparks/buy` — purchase sparks via WATA Pay
- Update `POST /api/generate/*` to deduct sparks
- Update `GET /api/packages` to return spark-based tiers

**Frontend**:
- Update Pricing page with 4 spark tiers
- Show spark balance in Dashboard header
- Add spark history page or section

---

### Admin Panel Updates

Update existing admin (`apps/web/src/pages/Admin.tsx` + `apps/api/src/routes/admin.ts`):
- CRUD for concepts (per mode)
- CRUD for product categories
- CRUD for infographic templates
- Spark balance stats for users
- Generation logs filtered by mode

---

### Acceptance Criteria
- [ ] Product photography mode: upload → select concept → AI generates → result displayed
- [ ] 7 product categories with tailored concept suggestions
- [ ] Infographic editor with 3 templates, drag-drop positioning, PNG export
- [ ] Spark balance visible in UI and deducted on each generation
- [ ] 4 Spark pricing tiers purchasable via existing WATA Pay integration
- [ ] Admin panel: manage concepts, categories, templates, view spark stats
- [ ] All new DB tables created via `initDb()` in schema.sql
- [ ] TypeScript compiles with 0 errors (`bun run build --filter=@ai-photostudio/api`)

### Technical Constraints
- Tech stack stays: **Bun, Hono, React/Vite, TailwindCSS, SQLite (bun:sqlite)**
- AI generation: **OpenRouter → `google/gemini-2.5-flash-image-preview`** (existing `openrouter.ts` service)
- Payments: **WATA Pay** (existing `wata.ts` service + `payments.ts` route)
- TypeScript strict mode
- All prompts stored in DB (concepts.prompt_template), not hardcoded
- Follow existing code patterns: relative imports, functional React components with hooks, TailwindCSS classes
- One PR per phase

---

### Implementation Plan

**Branch**: `agent/4-aidentika-features`

**Phase 1 (Product Photography) — 8 steps**:
1. Update schema.sql with new tables and migration
2. Create routes: modes.ts, concepts.ts, categories.ts
3. Register new routes in index.ts
4. Create ProductDashboard.tsx frontend page
5. Create ProductPhotoUploader.tsx component
6. Update App.tsx with new route
7. Update existing generate route to support mode switching
8. Seed initial data (2 modes, 3 concepts, 7 categories)

**Phase 2 (Infographics) — 4 steps**:
1. Create infographic_templates table + seed data
2. Create InfographicEditor.tsx component
3. Create infographics.ts API route
4. Add infographics to admin panel

**Phase 3 (Spark) — 5 steps**:
1. Update users table + create spark_transactions table
2. Create spark.ts service
3. Create sparks API routes
4. Update pricing page with spark tiers
5. Update admin with spark stats"""

payload = {
    'title': 'Add Aidentika-style features: Product Photography, Infographics, Spark System',
    'body': body,
    'labels': ['enhancement', 'agent-ready', 'gemini'],
}

import urllib.request
req = urllib.request.Request(
    'https://api.github.com/repos/geniok1980/ai-photostudio/issues',
    data=json.dumps(payload).encode(),
    headers={
        'Authorization': f'token {token}',
        'Content-Type': 'application/json',
    },
    method='POST'
)

try:
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
        print(f'Issue #{result["number"]}: {result["title"]}')
        print(f'URL: {result["html_url"]}')
        labels = ', '.join(l['name'] for l in result['labels'])
        print(f'Labels: {labels}')
        assignee = result.get('assignee', {}) or {}
        print(f'Assignee: {assignee.get("login", "None")}')
except urllib.error.HTTPError as e:
    print(f'HTTP Error {e.code}: {e.read().decode()}')
except Exception as e:
    print(f'Error: {e}')
