# pamangan.com

An AI-powered recipe platform celebrating Filipino cuisine and global flavors. Discover, search, and generate recipes — complete with grocery lists, nutrition estimates, and cultural history — all powered by Google Gemini and Groq.

---

## Features

- **Recipe Browser** — Search and filter recipes by name, cuisine, and difficulty
- **AI Recipe Generator** — Generate a full recipe for any dish by name
- **AI Grocery List** — Combine ingredients from multiple recipes into an organized shopping list
- **AI Nutrition Info** — Estimate nutritional breakdown per serving
- **AI Food History** — Get cultural and historical background for any dish
- **Meal Planner** — Plan breakfast, lunch, and dinner for each day of the week
- **Categories & Cuisines** — Browse recipes by category or cuisine type

---

## Tech Stack

### Frontend
| Technology | Version |
|---|---|
| React | 18.3 |
| React Router | 6.24 |
| Axios | 1.7 |
| Bootstrap | 5.3 |
| Bootstrap Icons | 1.11 |

### Backend
| Technology | Version |
|---|---|
| Python | 3.x |
| Flask | 3.0 |
| Flask-CORS | 4.0 |
| PyMongo | 4.8 |
| Gunicorn | 22.0 |
| python-dotenv | 1.0 |

### Database
| Technology | Notes |
|---|---|
| MongoDB | MongoDB Atlas for production, local for development |

### AI Providers
| Provider | Model | Role |
|---|---|---|
| Google Gemini | gemini-1.5-flash | Primary AI provider |
| Groq | llama-3.1-8b-instant | Fallback AI provider |

---

## Project Structure

```
pamangan.com/          ← repository root
├── README.md
├── SECURITY.md
├── .gitignore
└── pamangan.com/
    ├── backend/
    │   ├── app.py                  # Flask app factory
    │   ├── config.py               # Environment config
    │   ├── wsgi.py                 # Gunicorn entry point
    │   ├── seed.py                 # Database seed script
    │   ├── requirements.txt
    │   ├── .env.example
    │   ├── models/
    │   │   └── recipe.py           # Recipe data model
    │   ├── routes/
    │   │   └── api.py              # All API endpoints
    │   └── services/
    │       ├── ai_service.py       # Gemini & Groq AI calls
    │       ├── db_service.py       # MongoDB connection
    │       └── recipe_service.py   # Recipe business logic
    └── frontend/
        ├── package.json
        ├── .env.example
        └── src/
            ├── App.js
            ├── index.js
            ├── index.css
            ├── components/
            │   ├── Navbar.jsx
            │   ├── Footer.jsx
            │   ├── RecipeCard.jsx
            │   ├── LoadingSpinner.jsx
            │   ├── Modal.jsx
            │   ├── GroceryModal.jsx
            │   ├── NutritionModal.jsx
            │   └── HistoryModal.jsx
            ├── pages/
            │   ├── Home.jsx
            │   ├── Recipes.jsx
            │   ├── RecipeDetail.jsx
            │   ├── Categories.jsx
            │   ├── MealPlanner.jsx
            │   └── About.jsx
            ├── context/
            │   └── AppContext.js
            └── services/
                └── api.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB (local) or a MongoDB Atlas connection string
- A [Google Gemini API key](https://aistudio.google.com/) and/or a [Groq API key](https://console.groq.com/)

### Backend Setup

```bash
cd pamangan.com/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and fill in your values
```

### Frontend Setup

```bash
cd pamangan.com/frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and set REACT_APP_API_URL if needed
```

---

## Environment Variables

### Backend (`pamangan.com/backend/.env`)

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `DB_NAME` | Database name (default: `pamangan`) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GROQ_API_KEY` | Groq API key (fallback) |
| `SECRET_KEY` | Flask secret key (use a long random string) |
| `DEBUG` | Set to `True` for development |
| `FLASK_ENV` | `development` or `production` |
| `PORT` | Port for the Flask server (default: `5000`) |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins |

### Frontend (`pamangan.com/frontend/.env`)

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL (default: `http://localhost:5000/api`) |
| `REACT_APP_SITE_NAME` | Site name displayed in the UI |

---

## Running Locally

### Start the backend

```bash
cd pamangan.com/backend
source venv/bin/activate        # Windows: venv\Scripts\activate
python app.py
```

The API will be available at `http://localhost:5000`.

### Seed the database (optional)

```bash
cd pamangan.com/backend
python seed.py
```

### Start the frontend

```bash
cd pamangan.com/frontend
npm start
```

The app will be available at `http://localhost:3000`.

---

## Deployment

### Production Stack

| Part | Service | Cost |
|---|---|---|
| Frontend | Hostinger (shared hosting) | Already paid |
| Backend | Koyeb | Free |
| Database | MongoDB Atlas | Free |
| Domain | Hostinger | Already paid |

---

### Step 1 — MongoDB Atlas (Database)

1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free **M0 cluster**
3. Create a database user (save username and password)
4. Under **Network Access** → Add IP → `0.0.0.0/0`
5. Click **Connect → Drivers** and copy your connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pamangan
   ```

---

### Step 2 — Deploy Backend to Koyeb

1. Sign up at [koyeb.com](https://www.koyeb.com) with GitHub
2. Click **Create App → GitHub**
3. Select the `pamangan.com` repository
4. Configure:
   - **Root Directory:** `pamangan.com/backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Run Command:** `gunicorn wsgi:app`
5. Add environment variables:
   - `MONGODB_URI` → your Atlas connection string
   - `GEMINI_API_KEY` → your Gemini API key
   - `GROQ_API_KEY` → your Groq API key
   - `SECRET_KEY` → a long random string
   - `DEBUG` → `False`
   - `FLASK_ENV` → `production`
   - `CORS_ORIGINS` → `https://yourdomain.com`
6. Deploy → copy your Koyeb URL (e.g. `https://pamangan-api-yourname.koyeb.app`)

---

### Step 3 — Build the Frontend

Create `pamangan.com/frontend/.env` with your Koyeb backend URL:

```
REACT_APP_API_URL=https://pamangan-api-yourname.koyeb.app/api
REACT_APP_SITE_NAME=pamangan.com
```

Then build:

```bash
cd pamangan.com/frontend
npm install
npm run build
```

---

### Step 4 — Upload Frontend to Hostinger

1. In **hPanel → File Manager** → go to `public_html/`
2. Delete any existing default files
3. Upload all contents of `pamangan.com/frontend/build/` to `public_html/`
4. Create a `.htaccess` file in `public_html/` with:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QR,L]
```

---

### Architecture Overview

```
yourdomain.com                → Hostinger (React frontend)
       ↓ API calls
pamangan-api.koyeb.app        → Koyeb (Flask backend)
       ↓ database queries
MongoDB Atlas                 → Database
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/recipes` | List / search recipes (`?q=`, `?cuisine=`, `?difficulty=`, `?page=`, `?limit=`) |
| GET | `/api/recipes/:id` | Get a recipe by ID |
| GET | `/api/recipes/:id/similar` | Get similar recipes |
| POST | `/api/search` | Search recipes by query body |
| POST | `/api/generate` | AI-generate a recipe by name |
| POST | `/api/grocery` | AI-generate a grocery list from recipe IDs |
| POST | `/api/nutrition` | AI-generate nutrition info for a recipe |
| POST | `/api/history` | AI-generate cultural history for a recipe |
| GET | `/api/popular` | Get popular recipes |
| GET | `/api/categories` | Get all recipe categories |
| GET | `/api/cuisine/:cuisine` | Get recipes by cuisine |
| GET | `/health` | Health check |

---

## Security

See [SECURITY.md](SECURITY.md) for how to report vulnerabilities.

---

## License

MIT License — © 2026 Jose Paulo Timbang
