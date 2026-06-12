# pamangan.com

An AI-powered recipe platform celebrating Filipino and global cuisine. Search an ever-growing recipe database or let the AI generate a recipe on demand — every AI-generated result is cached to the database, making the platform smarter over time.

---

## Use Cases

- **Filipino food discovery** — Browse curated recipes for classic dishes like Adobo, Sinigang, Kare-Kare, and more.
- **On-demand recipe generation** — Ask for any recipe; Gemini generates it and it's saved permanently for the next user who searches.
- **Meal planning** — Build a weekly meal plan and export a consolidated grocery list as a PDF.
- **Nutrition lookup** — Get estimated nutritional info for any recipe.
- **Admin curation** — Manage the recipe database through a protected admin dashboard.

---

## Features

- **Database-first search** — MongoDB text index is checked before any AI call; AI is only invoked on a cache miss.
- **Automatic AI fallback** — Gemini (primary) → Groq llama-3.1-8b (fallback). Failures are silent to the user.
- **PDF export** — Download individual recipes or full grocery lists as formatted PDFs.
- **Meal planner** — Weekly planner persisted in `localStorage`.
- **Admin panel** — JWT-authenticated dashboard at `/manage/dashboard` for CRUD on all recipes.
- **Security headers** — `X-Frame-Options`, `X-Content-Type-Options`, HSTS, CSP, and `Permissions-Policy` on every response.
- **Health endpoint** — `GET /health` for uptime monitoring.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Bootstrap 5.3, React Router |
| Backend | Flask (Python 3), Flask-CORS |
| Database | MongoDB Atlas (pymongo) |
| AI — Primary | Google Gemini API |
| AI — Fallback | Groq (llama-3.1-8b) |
| Backend hosting | Hugging Face Spaces (Docker) |
| Frontend hosting | Hostinger (static files via rsync) |
| CI/CD | GitHub Actions |

**Design system:** Filipino flag colors — Blue `#0038A8`, Red `#CE1126`, Yellow `#FCD116`. Defined as CSS variables in `frontend/src/index.css`.

---

## Project Structure

```
pamangan.com/
├── backend/
│   ├── app.py                  # Flask app factory
│   ├── config.py               # Config loaded from environment
│   ├── wsgi.py                 # WSGI entry point
│   ├── seed.py                 # Seeds 8 classic Filipino recipes
│   ├── Dockerfile              # Container config for HF Spaces
│   ├── Procfile                # Process declaration
│   ├── routes/
│   │   ├── api.py              # Public API routes
│   │   └── admin.py            # JWT-protected admin routes
│   ├── services/
│   │   ├── ai_service.py       # Gemini → Groq AI abstraction
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
        │   └── api.js          # Axios API client
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── RecipeCard.jsx
        │   ├── Modal.jsx       # Custom modal (no Bootstrap JS)
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

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A MongoDB Atlas cluster
- Google Gemini API key
- Groq API key (for fallback)

### 1. Clone the repo

```bash
git clone https://github.com/JPTWeb01/pamangan.com.git
cd pamangan.com
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
cd frontend
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000/api
npm start
# Runs on http://localhost:3000 (proxied to :5000)
```

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `DB_NAME` | Database name (e.g. `pamangan`) |
| `GEMINI_API_KEY` | Google Gemini API key (primary AI) |
| `GROQ_API_KEY` | Groq API key (fallback AI) |
| `SECRET_KEY` | 64-character random string for JWT signing |
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
DEBUG=False
FLASK_ENV=production
PORT=5000
CORS_ORIGINS=http://localhost:3000,https://pamangan.com
```

### Frontend — `frontend/.env`

| Variable | Purpose |
|---|---|
| `REACT_APP_API_URL` | Base URL for the Flask API |
| `REACT_APP_SITE_NAME` | Site name used in metadata |

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SITE_NAME=pamangan.com
```

> **Important:** `REACT_APP_API_URL` for production is defined in `frontend/.env.production`. Do **not** set it as a GitHub Actions secret or variable — doing so will override it with an empty string during the build.

---

## Deployment Workflow

### Backend — Hugging Face Spaces

The backend is containerized and deployed to HF Space `jptweb01/pamangan-api`.

1. Push changes to the backend directory.
2. The Dockerfile at `backend/Dockerfile` defines the container.
3. The HF Space rebuilds on push to the linked repo branch.
4. Live at: `https://jptweb01-pamangan-api.hf.space`

### Frontend — Hostinger via GitHub Actions

The frontend is built and deployed over SSH using rsync.

**Required GitHub Secrets:**

| Secret | Value |
|---|---|
| `SSH_HOST` | Hostinger server hostname |
| `SSH_USER` | SSH username |
| `SSH_PRIVATE_KEY` | Private key for SSH auth |
| `SSH_PORT` | `65002` (Hostinger's non-standard SSH port) |
| `DEPLOY_PATH` | `/home/<user>/domains/pamangan.com/public_html` |

**Workflow steps:**
1. `npm ci` — clean install
2. `npm run build` — production React build
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
  │                       ├── Google Gemini  (primary)
  │                       └── Groq llama-3.1-8b  (fallback)
  │                             └── Auto-save generated recipe → MongoDB
  │
  └──▶ Admin Panel (/manage)
          └──▶ Flask /api/admin/* (JWT protected)
```

**Data flow for a recipe search:**
1. User submits a search query from the React frontend.
2. Frontend calls `POST /api/search`.
3. Backend queries MongoDB text index.
4. **Cache hit** → recipe returned immediately, no AI called.
5. **Cache miss** → Gemini generates the recipe → saved to MongoDB → returned to user.
6. Next user searching the same dish hits the cache.

---

## Security

### Authentication
- Admin routes are protected by **JWT tokens** issued at `POST /api/admin/login`.
- Tokens are stored in `localStorage` on the admin client.
- Public recipe endpoints require no authentication.

### Authorization
- All `/api/admin/*` routes validate the JWT on every request.
- Regular users have read-only access to public endpoints.

### API Security
- **CORS** is restricted to the configured `CORS_ORIGINS` list.
- Input is validated server-side before any database or AI call.
- AI prompt construction avoids direct user-string interpolation to reduce prompt injection surface.

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
- MongoDB credentials and API keys are environment variables — never committed to the repo.
- `.env.example` files are provided with placeholder values only.
- `SECRET_KEY` should be a cryptographically random 64-character string.

---

## License

MIT
