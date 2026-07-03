# pamangan.com

An AI-powered recipe platform celebrating Filipino and global cuisine. Search an ever-growing recipe database or let the AI generate a recipe on demand — every AI-generated result is cached to the database, making the platform smarter over time.

**Live demo:** [pamangan.com](https://pamangan.com)

---

## Screenshots

| Home | Recipes |
|---|---|
| ![Home](pamangan.com/docs/screenshots/home.png) | ![Recipes](pamangan.com/docs/screenshots/recipes.png) |

| Categories | Meal Planner |
|---|---|
| ![Categories](pamangan.com/docs/screenshots/categories.png) | ![Meal Planner](pamangan.com/docs/screenshots/meal-planner.png) |

---

## Use Cases

- **Filipino food discovery** — Browse curated recipes for classic dishes like Adobo, Sinigang, Kare-Kare, and more.
- **On-demand recipe generation** — Ask for any recipe; Gemini generates it and it's saved permanently for the next user who searches.
- **Meal planning** — Build a weekly meal plan and export a consolidated grocery list as a PDF.
- **Nutrition lookup** — Get AI-estimated nutritional info per serving for any recipe.
- **Cultural history** — Learn the origin story, regional variations, and cultural significance of any dish.
- **Admin curation** — Manage the recipe database through a protected admin dashboard.

---

## Features

- **Database-first search** — MongoDB text index is checked before any AI call; AI is only invoked on a cache miss.
- **Automatic AI fallback** — Gemini `gemini-2.0-flash` (primary) → Groq `llama-3.1-8b-instant` (fallback). Failures are silent to the user.
- **PDF export** — Download individual recipes or full grocery lists as formatted PDFs via `@react-pdf/renderer`.
- **Meal planner** — Weekly planner persisted in `localStorage`.
- **Like / popularity system** — Users can like recipes; popular recipes are surfaced via `GET /api/popular`.
- **Image management** — Admin can refresh recipe images from Pexels or upload custom images via ImgBB.
- **Admin panel** — JWT-authenticated dashboard at `/manage/dashboard` for full CRUD on all recipes.
- **Security headers** — `X-Frame-Options`, `X-Content-Type-Options`, HSTS, CSP, and `Permissions-Policy` on every response.
- **Health endpoint** — `GET /health` for uptime monitoring.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Bootstrap 5.3, Axios |
| PDF generation | @react-pdf/renderer |
| Backend | Flask 3 (Python 3.11), Flask-CORS, Gunicorn |
| Database | MongoDB Atlas (pymongo) |
| AI — Primary | Google Gemini (`gemini-2.0-flash`) |
| AI — Fallback | Groq (`llama-3.1-8b-instant`) |
| Image APIs | Pexels (search), ImgBB (upload) |
| Auth | PyJWT (HS256, 24-hour tokens) |
| Backend hosting | Hugging Face Spaces (Docker, port 7860) |
| Frontend hosting | Hostinger (static files via rsync) |
| CI/CD | GitHub Actions |

**Design system:** Filipino flag colors — Blue `#0038A8`, Red `#CE1126`, Yellow `#FCD116`. Defined as CSS variables in `pamangan.com/frontend/src/index.css`.

---

## Project Structure

```
pamangan.com/          ← repository root
├── README.md
├── SECURITY.md
├── .gitignore
└── pamangan.com/
    ├── LICENSE
    ├── docs/
    │   └── screenshots/
    ├── backend/
    │   ├── app.py                  # Flask app factory & security headers
    │   ├── config.py               # Config loaded from environment
    │   ├── wsgi.py                 # Gunicorn entry point
    │   ├── seed.py                 # Seeds 8 classic Filipino recipes
    │   ├── Dockerfile              # Container config for HF Spaces (port 7860)
    │   ├── Procfile                # Heroku-style process declaration
    │   ├── runtime.txt             # Python 3.11
    │   ├── routes/
    │   │   ├── api.py              # Public API routes
    │   │   └── admin.py            # JWT-protected admin routes
    │   ├── services/
    │   │   ├── ai_service.py       # Gemini → Groq fallback chain
    │   │   ├── recipe_service.py   # Business logic (search, generate, cache)
    │   │   └── db_service.py       # MongoDB connection and queries
    │   └── models/
    │       └── recipe.py           # Recipe schema/model
    └── frontend/
        ├── public/
        │   └── index.html
        └── src/
            ├── App.js              # Routes and layout
            ├── index.js            # Entry point
            ├── context/
            │   └── AppContext.js   # Global state (React Context)
            ├── services/
            │   └── api.js          # Axios API client with JWT support
            ├── components/
            │   ├── Navbar.jsx
            │   ├── Footer.jsx
            │   ├── RecipeCard.jsx
            │   ├── Modal.jsx       # Custom modal (no Bootstrap JS — avoids VDOM conflicts)
            │   ├── NutritionModal.jsx
            │   ├── HistoryModal.jsx
            │   ├── GroceryModal.jsx
            │   ├── RecipePDF.jsx
            │   ├── GroceryPDF.jsx
            │   └── LoadingSpinner.jsx
            └── pages/
                ├── Home.jsx
                ├── Recipes.jsx
                ├── RecipeDetail.jsx
                ├── Categories.jsx
                ├── MealPlanner.jsx
                ├── About.jsx
                ├── AdminLogin.jsx
                ├── AdminLayout.jsx
                └── AdminDashboard.jsx
```

---

## API Reference

### Public endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/recipes` | List recipes (search, cuisine, difficulty, pagination) |
| `GET` | `/api/recipes/:id` | Get a single recipe |
| `GET` | `/api/recipes/:id/similar` | Get similar recipes |
| `POST` | `/api/recipes/:id/like` | Like or unlike a recipe |
| `POST` | `/api/search` | Text search (DB-first, AI fallback) |
| `POST` | `/api/generate` | AI-generate a recipe by name |
| `POST` | `/api/grocery` | AI-generate a grouped grocery list |
| `POST` | `/api/nutrition` | AI-estimate nutrition info |
| `POST` | `/api/history` | AI-generate cultural history of a dish |
| `GET` | `/api/popular` | Top recipes by likes |
| `GET` | `/api/categories` | List recipe categories |
| `GET` | `/api/cuisine/:name` | Browse recipes by cuisine |
| `GET` | `/health` | Health check |

### Admin endpoints (JWT required)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/login` | Get JWT token |
| `GET` | `/api/admin/recipes` | List all recipes |
| `POST` | `/api/admin/recipes` | Create a recipe manually |
| `PATCH` | `/api/admin/recipes/:id` | Update a recipe |
| `DELETE` | `/api/admin/recipes/:id` | Delete a recipe |
| `POST` | `/api/admin/recipes/:id/refresh-image` | Fetch a fresh image from Pexels |
| `POST` | `/api/admin/upload-image` | Upload a custom image to ImgBB |

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB Atlas cluster
- Google Gemini API key
- Groq API key (for fallback)

### 1. Clone the repo

```bash
git clone https://github.com/JPTWeb01/pamangan.com.git
cd pamangan.com/pamangan.com
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Fill in your values in .env
python app.py
# Runs on http://localhost:5000
```

Seed the database with 8 starter recipes:

```bash
python seed.py
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000/api
npm start
# Runs on http://localhost:3000 (proxied to :5000)
```

---

## Environment Variables

### Backend — `pamangan.com/backend/.env`

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `DB_NAME` | Database name (e.g. `pamangan`) |
| `GEMINI_API_KEY` | Google Gemini API key (primary AI) |
| `GROQ_API_KEY` | Groq API key (fallback AI) |
| `SECRET_KEY` | 64-character random string for JWT signing |
| `ADMIN_USERNAME` | Admin panel login username |
| `ADMIN_PASSWORD` | Admin panel login password |
| `PEXELS_API_KEY` | Pexels API key for recipe image search |
| `IMGBB_API_KEY` | ImgBB API key for custom image uploads |
| `DEBUG` | `True` for local dev, `False` in production |
| `FLASK_ENV` | `development` or `production` |
| `PORT` | Port to bind (default `5000`) |
| `CORS_ORIGINS` | Comma-separated allowed origins |

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pamangan
DB_NAME=pamangan
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
SECRET_KEY=replace-with-a-64-character-random-string
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password_here
PEXELS_API_KEY=your_pexels_api_key_here
IMGBB_API_KEY=your_imgbb_api_key_here
DEBUG=False
FLASK_ENV=production
PORT=5000
CORS_ORIGINS=http://localhost:3000,https://pamangan.com
```

### Frontend — `pamangan.com/frontend/.env`

| Variable | Purpose |
|---|---|
| `REACT_APP_API_URL` | Base URL for the Flask API |
| `REACT_APP_SITE_NAME` | Site name used in metadata |

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SITE_NAME=pamangan.com
```

> **Important:** `REACT_APP_API_URL` for production is defined in `pamangan.com/frontend/.env.production` (pointing to the HF Spaces backend). Do **not** set it as a GitHub Actions secret or variable — doing so will override it with an empty string during the build.

---

## Deployment Workflow

### Backend — Hugging Face Spaces

The backend runs as a Docker container on HF Space `jptweb01/pamangan-api`. The image uses Python 3.11-slim, runs Gunicorn with 2 workers on port 7860, and executes as a non-root user.

1. Push changes to `pamangan.com/backend/**` on `main`.
2. `.github/workflows/deploy-huggingface.yml` mirrors `pamangan.com/backend/` into the linked Hugging Face Space repo and pushes, triggering a rebuild.
3. Live at: `https://jptweb01-pamangan-api.hf.space`

### Frontend — Hostinger via GitHub Actions

The frontend is built and rsync'd to Hostinger over SSH on every push to `main` that touches `pamangan.com/frontend/**`.

**Required GitHub Secrets:**

| Secret | Value |
|---|---|
| `SSH_HOST` | Hostinger server hostname |
| `SSH_USERNAME` | SSH username |
| `SSH_PRIVATE_KEY` | Private key for SSH auth |
| `SSH_PORT` | `65002` (Hostinger's non-standard SSH port) |
| `DEPLOY_PATH` | `/home/<user>/domains/pamangan.com/public_html` |

**Workflow steps:**
1. `npm ci` — clean install
2. `npm run build` — production React build (uses `pamangan.com/frontend/.env.production`)
3. `rsync` — sync `build/` to the Hostinger document root over SSH

> After deploying, go to **hPanel → Advanced → Cache Manager → Purge All** if the new bundle doesn't load in the browser.

---

## Architecture Overview

```
Browser
  │
  ├──▶ React SPA (Hostinger)
  │       │
  │       └──▶ Flask API (Hugging Face Spaces)
  │                 │
  │                 ├──▶ MongoDB Atlas
  │                 │     └── Text index search (cache hit → return immediately)
  │                 │
  │                 └──▶ AI Layer (cache miss only)
  │                       ├── Gemini gemini-2.0-flash  (primary)
  │                       └── Groq llama-3.1-8b-instant  (fallback)
  │                             └── Auto-save generated recipe → MongoDB
  │
  └──▶ Admin Panel (/manage)
          └──▶ Flask /api/admin/* (JWT protected)
```

**Data flow for a recipe search:**
1. User submits a query from the React frontend.
2. Frontend calls `POST /api/search`.
3. Backend queries MongoDB text index.
4. **Cache hit** → recipe returned immediately, no AI called.
5. **Cache miss** → Gemini generates the recipe → saved to MongoDB → returned to user.
6. The next user searching the same dish hits the cache.

---

## Security

### Authentication
- Admin routes are protected by **JWT tokens** (HS256, 24-hour expiry) issued at `POST /api/admin/login`.
- Tokens are stored in `localStorage` on the admin client.
- Public recipe endpoints require no authentication.

### Authorization
- All `/api/admin/*` routes validate the JWT on every request via a `@token_required` decorator.
- Regular users have read-only access to public endpoints.

### API Security
- **CORS** is restricted to the configured `CORS_ORIGINS` list.
- User input is validated and sanitized server-side before any database or AI call.
- AI prompts use structured schemas — user strings are not interpolated directly into prompt templates.

### Response Headers (applied globally)

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: default-src 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains  # production only
```

### Data Protection
- All credentials and API keys are environment variables — never committed to the repo.
- `.env.example` files contain placeholder values only.
- `SECRET_KEY` must be a cryptographically random 64-character string in production.

See [SECURITY.md](SECURITY.md) for how to report vulnerabilities.

---

## License

MIT License — © 2026 Jose Paulo Timbang
