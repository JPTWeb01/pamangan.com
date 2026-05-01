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
pamangan.com/
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
cd backend

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
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and set REACT_APP_API_URL if needed
```

---

## Environment Variables

### Backend (`backend/.env`)

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

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL (default: `http://localhost:5000/api`) |
| `REACT_APP_SITE_NAME` | Site name displayed in the UI |

---

## Running Locally

### Start the backend

```bash
cd backend
source venv/bin/activate        # Windows: venv\Scripts\activate
python app.py
```

The API will be available at `http://localhost:5000`.

### Seed the database (optional)

```bash
cd backend
python seed.py
```

### Start the frontend

```bash
cd frontend
npm start
```

The app will be available at `http://localhost:3000`.

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
