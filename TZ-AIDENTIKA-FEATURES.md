# ТЗ: Добавление функционала Aidentika в AI PhotoStudio

> **Версия:** 1.0 | **Дата:** 2026-05-24
> **Проект:** geniok1980/ai-photostudio

---

## 1. Общее описание

### 1.1 Текущее состояние

Проект **AI PhotoStudio** — это платформа для **портретной AI-генерации**: пользователь загружает своё фото, выбирает локацию, AI генерирует его фото в новом окружении. Стек: TypeScript monorepo (React/Vite + Hono/Bun), SQLite, OpenRouter (Gemini Flash Image Preview), WATA Pay.

Текущая БД: `users`, `locations`, `packages`, `generations`, `payments`.

### 1.2 Цель

Добавить функционал, аналогичный **Aidentika.com** — платформа для **товарной AI-фотосъёмки** для e-commerce (Wildberries, Ozon, маркетплейсы). Пользователь загружает фото товара → AI генерирует студийные фото + инфографику для карточки товара.

### 1.3 Приоритет (MoSCoW)

| Приоритет | Фича | Описание |
|-----------|------|----------|
| **Must** | Режим «Товарная съёмка» | Product photography с концепциями |
| **Must** | Инфографика | Наложение текста/бейджей на фото |
| **Should** | Система Spark | Виртуальная валюта (искры) |
| **Should** | Категории товаров | Пресеты под разные типы товаров |
| **Could** | AI Try-On | Виртуальная примерка одежды |
| **Could** | AI Видео | Короткие видеоролики товаров |

---

## 2. Режим «Товарная съёмка» (Product Photography)

### 2.1 Концепция

Добавить новый тип генерации — **товарная съёмка**. Пользователь выбирает режим работы: «Портрет» (текущий) или «Товар».

### 2.2 База данных

**Новая таблица `generation_modes`:**
```sql
CREATE TABLE IF NOT EXISTS generation_modes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,               -- 'portrait', 'product'
  display_name TEXT NOT NULL,       -- 'Портрет', 'Товарная съёмка'
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1
);
```

**Новая таблица `product_categories`:**
```sql
CREATE TABLE IF NOT EXISTS product_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,               -- 'jewelry', 'shoes', 'electronics', 'clothing', 'home_goods', 'food_drinks', 'pet_supplies'
  display_name TEXT NOT NULL,       -- 'Ювелирка', 'Обувь', 'Электроника'...
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1
);
```

**Новая таблица `concepts`:**
```sql
CREATE TABLE IF NOT EXISTS concepts (
  id TEXT PRIMARY KEY,
  mode_id TEXT REFERENCES generation_modes(id),
  name TEXT NOT NULL,               -- 'catalog_shot', 'on_model', 'composition'
  display_name TEXT NOT NULL,       -- 'Каталожный снимок', 'На модели', 'Композиция'
  description TEXT,
  prompt_template TEXT NOT NULL,    -- Шаблон промпта с {product_description}
  preview_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1
);
```

**Расширить `generations`:**
```sql
ALTER TABLE generations ADD COLUMN mode_id TEXT REFERENCES generation_modes(id);
ALTER TABLE generations ADD COLUMN concept_id TEXT REFERENCES concepts(id);
ALTER TABLE generations ADD COLUMN category_id TEXT REFERENCES product_categories(id);
ALTER TABLE generations ADD COLUMN product_description TEXT;
```

### 2.3 API endpoints

**Backend:**

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/modes` | Список режимов генерации |
| GET | `/api/concepts?mode_id=X` | Концепции для режима |
| GET | `/api/categories` | Категории товаров |
| POST | `/api/generate/product` | Создать товарную генерацию |
| GET | `/api/generate/product/:id` | Статус товарной генерации |

**Фронтенд:**

Новая страница `/app/product` — аналог Dashboard, но для товаров:
1. Шаг 1: Выбор режима (Портрет / Товар) → переключатель на дашборде или отдельная страница
2. Шаг 2 (товар): Загрузка фото товара + описание товара
3. Шаг 3 (товар): Выбор категории товара (авто-пресеты)
4. Шаг 4 (товар): Выбор концепции (каталожный снимок, на модели, композиция)
5. Шаг 5: Генерация и результат

### 2.4 Prompt Engineering

Для каждого типа концепции — свой шаблон промпта. Примеры:

**catalog_shot (Каталожный снимок):**
```
Product photography of {product_description}. Clean white background, studio lighting, 
professional catalog shot, high detail, sharp focus, commercial photography, 
8K, perfect lighting, centered composition
```

**on_model (На модели):**
```
Product photography of {product_description}. Being held by a person, lifestyle shot, 
natural lighting, realistic, professional e-commerce photo, model hands visible, 
clean background, commercial quality
```

**composition (Композиция):**
```
Artistic composition of {product_description} with complementary props, 
flat lay style, aesthetic arrangement, warm lighting, premium product photography, 
social media ready, professional styling
```

> **Важно:** Промпты хранить в таблице `concepts.prompt_template` — админ может менять их через админку.

---

## 3. Инфографика (Infographics Overlay)

### 3.1 Концепция

После генерации товарного фото пользователь может добавить **текстовые бейджи, характеристики, цены** прямо на изображение — готовую карточку для маркетплейса.

### 3.2 База данных

**Новая таблица `infographic_templates`:**
```sql
CREATE TABLE IF NOT EXISTS infographic_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  preview_url TEXT,
  config TEXT NOT NULL,             -- JSON с настройками шаблона
  is_active BOOLEAN DEFAULT 1
);
```

### 3.3 Frontend: Infographic Editor

Компонент для редактирования инфографики на canvas:

```
apps/web/src/components/InfographicEditor.tsx
```

Функционал:
- [ ] Загрузка сгенерированного фото как фона
- [ ] Добавление текстовых блоков: название товара, цена, характеристики
- [ ] Бейджи: «Скидка», «Хит», «Новинка», «Акция»
- [ ] Drag & drop для позиционирования
- [ ] Выбор шрифта, цвета, размера
- [ ] 3 готовых шаблона (Variant 1, 2, 3 как на Aidentika)

**Реализация:** HTML5 Canvas + fabric.js или html2canvas для рендера.

### 3.4 API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/infographics/templates` | Список шаблонов |
| POST | `/api/infographics/render` | Рендер инфографики (принимает JSON с позициями элементов + id фото) |

### 3.5 Готовые шаблоны

Шаблон по умолчанию — Variant 1 (как Aidentika):
- Верх: бейдж «ХИТ» / «NEW»
- Центр: фото товара
- Низ слева: название товара
- Низ справа: цена
- Левый край: характеристики (галочки)

---

## 4. Система Spark (виртуальная валюта)

### 4.1 Концепция

Заменить/дополнить текущую систему `balance_generations` на универсальную валюту **Spark** (как в Aidentika). 1 spark = 1 условная единица.

### 4.2 Стоимость в spark

| Тип контента | Стоимость | 
|-------------|-----------|
| 1 изображение (портрет) | 4 spark |
| 1 изображение (товар) | 4 spark |
| 1 изображение + инфографика | 5 spark |
| 1 видео (5 сек) | 15 spark |
| 1 видео (15 сек) | 30 spark |

### 4.3 Тарифы (как на Aidentika)

| Название | Цена | Sparks | Изображений | Видео |
|----------|------|--------|-------------|-------|
| Старт | 390 ₽ | 50 | 12 | 3 |
| Креатор | 990 ₽ | 140 | 35 | 8 |
| Студия | 2 490 ₽ | 400 | 100 | 25 |
| Бизнес | 6 490 ₽ | 1 200 | 300 | 75 |

### 4.4 База данных

**Расширить `users`:**
```sql
ALTER TABLE users ADD COLUMN spark_balance INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN total_sparks_earned INTEGER DEFAULT 0;
-- balance_generations остаётся для совместимости, но основной становится spark_balance
```

**Или создать таблицу `spark_transactions` для истории:**
```sql
CREATE TABLE IF NOT EXISTS spark_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  amount INTEGER NOT NULL,          -- положительное = начисление, отрицательное = списание
  balance_after INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,   -- 'purchase', 'generation', 'video', 'infographic', 'bonus'
  reference_id TEXT,                -- id платежа, генерации и т.д.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.5 API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/sparks/balance` | Баланс spark |
| GET | `/api/sparks/history` | История транзакций |
| GET | `/api/sparks/prices` | Текущие тарифы spark (из пакетов) |
| POST | `/api/sparks/buy` | Купить spark (через WATA Pay) |

---

## 5. Категории товаров и пресеты

### 5.1 Система пресетов

Каждая категория товаров имеет:
- Рекомендованные концепции (1-3)
- Стилевые подсказки для промпта
- Примеры результатов

### 5.2 Категории для реализации

| Категория | Рекомендуемые концепции | Особенности промпта |
|-----------|------------------------|---------------------|
| Jewelry (Ювелирка) | catalog_shot, composition | Макро, блеск, отражения |
| Shoes (Обувь) | catalog_shot, composition | 360° вид, текстура |
| Electronics (Электроника) | catalog_shot | Чёткие линии, минимализм |
| Clothing (Одежда) | on_model, catalog_shot | На человеке, фактура ткани |
| Home Goods (Дом) | composition, catalog_shot | Интерьер, стилизация |
| Food & Drinks (Еда) | composition | Аппетитно, ярко |
| Pet Supplies (Зоотовары) | catalog_shot, on_model | С животными, уютно |

---

## 6. План реализации

### Фаза 1: Товарная съёмка + Инфографика (Приоритет)

**Шаги:**
1. Создать таблицы: `generation_modes`, `product_categories`, `concepts`, `infographic_templates`
2. Расширить `generations` новыми колонками
3. API: `/api/modes`, `/api/concepts`, `/api/categories`, `POST /generate/product`
4. Фронтенд: переключатель режимов, форма загрузки товара, выбор концепции
5. Prompt engineering под товарную съёмку
6. Компонент InfographicEditor с 3 шаблонами
7. API: `/api/infographics/render` (серверный рендер на Canvas или клиентский)
8. Админка: управление концепциями, категориями, шаблонами

### Фаза 2: Spark + Тарифы

1. Таблица `spark_transactions`
2. Миграция балансов пользователей
3. API spark
4. Обновить Pricing page
5. Обновить админку (статистика spark)

### Фаза 3: AI Try-On + AI Video (по желанию)

1. Режим примерки одежды (доп. модель для Inswapper/IP-Adapter)
2. Интеграция Runway/Luma API для видео
3. UI для создания видео

---

## 7. Acceptance Criteria

### Фаза 1 — Критерии приёмки

- [ ] Пользователь может переключиться в режим «Товарная съёмка» на Dashboard
- [ ] Можно загрузить фото товара и указать описание
- [ ] Можно выбрать категорию товара (7 категорий)
- [ ] Можно выбрать концепцию (каталожный, на модели, композиция)
- [ ] Генерация работает через OpenRouter (Gemini Flash Image Preview)
- [ ] Результат отображается в истории
- [ ] Инфографика: 3 готовых шаблона + ручная настройка
- [ ] Админ может управлять концепциями и категориями
- [ ] Все новые таблицы создаются через initDb()

### Фаза 2 — Критерии приёмки

- [ ] Баланс spark отображается в UI
- [ ] Покупка spark работает через WATA Pay
- [ ] Списание spark при генерациях
- [ ] История транзакций доступна пользователю
- [ ] Обновлённые тарифы на /pricing

---

## 8. Технические заметки

### Текущий стек (не менять)
- **Runtime:** Bun
- **Backend:** Hono.js
- **Frontend:** React + Vite + TailwindCSS
- **БД:** SQLite (bun:sqlite)
- **Генерация:** OpenRouter → `google/gemini-2.5-flash-image-preview`
- **Платежи:** WATA Pay

### Соглашения (соблюдать)
- Импорты: относительные (`../`)
- Компоненты React — функциональные с хуками
- TailwindCSS для стилей
- TypeScript strict mode
- Все новые промпты сохранять в БД (не хардкодить)

### Файловая структура (расширение)

```
apps/api/src/
├── db/
│   └── schema.sql          # + новые таблицы
├── routes/
│   ├── generate.ts         # расширить
│   ├── modes.ts            # NEW
│   ├── concepts.ts         # NEW
│   ├── categories.ts       # NEW
│   └── infographics.ts     # NEW
├── services/
│   ├── openrouter.ts       # расширить промпты
│   └── spark.ts            # NEW
└── index.ts                # + новые роуты

apps/web/src/
├── components/
│   ├── InfographicEditor.tsx    # NEW
│   └── ProductPhotoUploader.tsx  # NEW
├── pages/
│   ├── Dashboard.tsx        # расширить (переключатель режимов)
│   ├── ProductDashboard.tsx # NEW
│   └── InfographicPage.tsx   # NEW
└── lib/
    └── api.ts               # + новые методы
```
