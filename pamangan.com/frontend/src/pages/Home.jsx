import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import { recipeApi } from "../services/api";

const CATEGORIES = [
  {
    name: "Filipino",
    emoji: "🇵🇭",
    image: "https://flagcdn.com/w40/ph.png",
    bg: "linear-gradient(135deg,#0038A8,#002d87)",
    count: "Classic dishes",
    link: "/recipes?cuisine=Filipino",
  },
  {
    name: "Asian",
    emoji: "🍜",
    bg: "linear-gradient(135deg,#CE1126,#8b0011)",
    count: "Pan-Asian flavors",
    link: "/recipes?q=asian",
  },
  {
    name: "Healthy",
    emoji: "🥗",
    bg: "linear-gradient(135deg,#16a34a,#0f6b31)",
    count: "Nutritious picks",
    link: "/recipes?q=healthy",
  },
  {
    name: "Quick & Easy",
    emoji: "⚡",
    bg: "linear-gradient(135deg,#d97706,#b45309)",
    count: "30 min or less",
    link: "/recipes?q=quick",
  },
  {
    name: "Soup",
    emoji: "🍲",
    bg: "linear-gradient(135deg,#7c3aed,#5b21b6)",
    count: "Warm & comforting",
    link: "/recipes?q=soup",
  },
  {
    name: "Snack",
    emoji: "🍢",
    bg: "linear-gradient(135deg,#0891b2,#0e7490)",
    count: "Light bites",
    link: "/recipes?q=snack",
  },
];

const FEATURES = [
  {
    icon: "bi-cart3",
    label: "Grocery List",
    desc: "Combine ingredients from multiple recipes",
    color: "#0038A8",
    bg: "var(--ph-blue-light)",
    to: null,
    action: "grocery",
  },
  {
    icon: "bi-bar-chart-fill",
    label: "Nutrition Info",
    desc: "AI-estimated calories & macros",
    color: "#16a34a",
    bg: "#d1fae5",
    to: null,
    action: "nutrition",
  },
  {
    icon: "bi-book",
    label: "Food History",
    desc: "Cultural stories behind every dish",
    color: "#7c3aed",
    bg: "#ede9fe",
    to: null,
    action: "history",
  },
  {
    icon: "bi-calendar3",
    label: "Meal Planner",
    desc: "Plan your entire week",
    color: "#d97706",
    bg: "#fef3c7",
    to: "/meal-planner",
  },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [popular, setPopular] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [generateModal, setGenerateModal] = useState(false);
  const [generateName, setGenerateName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    recipeApi
      .popular(8)
      .then((res) => setPopular(res.data || []))
      .catch(() => {})
      .finally(() => setLoadingPopular(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/recipes?q=${encodeURIComponent(query.trim())}`);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!generateName.trim()) return;
    setGenerating(true);
    setGenerateError("");
    try {
      const res = await recipeApi.generate(generateName.trim());
      navigate(`/recipe/${res.data.id}`);
    } catch (err) {
      setGenerateError(err.message);
      setGenerating(false);
    }
  };

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <span className="badge-pill mb-4">
                <i className="bi bi-stars"></i>AI-Powered Recipe Platform
              </span>
              <h1
                className="text-white fw-black mb-3"
                style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.1 }}
              >
                Discover Filipino &amp;{" "}
                <span style={{ color: "#FCD116" }}>Global Recipes</span>
              </h1>
              <p className="text-white mb-4" style={{ opacity: 0.8, fontSize: "1.05rem" }}>
                Search thousands of authentic recipes or request a custom one
                — ready instantly.
              </p>

              <div className="hero-search-wrapper mx-auto mb-4">
                <form onSubmit={handleSearch}>
                  <i className="bi bi-search search-icon"></i>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={'Try "Chicken Adobo", "Sinigang", "Pasta"…'}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <button type="submit" className="btn-search">
                    Search
                  </button>
                </form>
              </div>

              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link
                  to="/recipes"
                  className="btn rounded-pill px-4 fw-semibold"
                  style={{ background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.3)", backdropFilter: "blur(6px)" }}
                >
                  <i className="bi bi-grid me-2"></i>Browse All Recipes
                </Link>
                <button
                  className="btn rounded-pill px-4 fw-semibold"
                  style={{ background: "#FCD116", color: "#111" }}
                  onClick={() => setGenerateModal(true)}
                >
                  <i className="bi bi-stars me-2"></i>Request a Recipe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="section-title">What You Can Do</h2>
            <p className="section-subtitle">AI-powered tools to level up your cooking</p>
          </div>
          <div className="row g-3">
            {FEATURES.map((f) => (
              <div className="col-6 col-lg-3" key={f.label}>
                {f.to ? (
                  <Link to={f.to} className="text-decoration-none d-block">
                    <FeatureCard feature={f} />
                  </Link>
                ) : (
                  <FeatureCard feature={f} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Recipes ── */}
      <section className="py-5" style={{ background: "var(--surface)" }}>
        <div className="container">
          <div className="d-flex align-items-end justify-content-between mb-4">
            <div>
              <h2 className="section-title">Popular Recipes</h2>
              <p className="section-subtitle mb-0">Most viewed dishes on the platform</p>
            </div>
            <Link to="/recipes" className="btn btn-sm btn-outline-primary rounded-pill px-3">
              View all <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loadingPopular ? (
            <LoadingSpinner message="Loading recipes…" />
          ) : popular.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <i className="bi bi-egg-fried display-4 d-block mb-3" style={{ opacity: .3 }}></i>
              <p>No recipes yet — add some by running the seed script.</p>
            </div>
          ) : (
            <div className="row g-3">
              {popular.map((r) => (
                <div className="col-6 col-md-4 col-lg-3" key={r.id}>
                  <RecipeCard recipe={r} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="section-title">Explore by Category</h2>
            <p className="section-subtitle">From Filipino classics to global favorites</p>
          </div>
          <div className="row g-3">
            {CATEGORIES.map((cat) => (
              <div className="col-6 col-md-4 col-lg-2" key={cat.name}>
                <Link
                  to={cat.link}
                  className="text-decoration-none"
                >
                  <div
                    className="rounded-3 p-3 text-center text-white"
                    style={{
                      background: cat.bg,
                      transition: "transform .2s, box-shadow .2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "var(--shadow-md)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "";
                      e.currentTarget.style.boxShadow = "";
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: ".35rem" }}>
                      {cat.image
                        ? <img src={cat.image} alt={cat.name} style={{ width: 38, height: "auto", borderRadius: 3, display: "block", margin: "0 auto" }} />
                        : cat.emoji}
                    </div>
                    <div className="fw-bold" style={{ fontSize: ".95rem" }}>{cat.name}</div>
                    <div style={{ fontSize: ".72rem", opacity: .75 }}>{cat.count}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section
        className="py-5"
        style={{ background: "linear-gradient(135deg,#0038A8 0%,#001a5c 100%)" }}
      >
        <div className="container text-center text-white">
          <h2 className="fw-black mb-2" style={{ fontSize: "clamp(1.5rem,3vw,2.25rem)" }}>
            Can't find a recipe?
          </h2>
          <p className="mb-4" style={{ opacity: .8 }}>
            You can request any recipe you crave — instantly saved for everyone.
          </p>
          <button
            className="btn rounded-pill px-5 py-2 fw-bold"
            style={{ background: "#FCD116", color: "#111", fontSize: "1.05rem" }}
            onClick={() => setGenerateModal(true)}
          >
            <i className="bi bi-stars me-2"></i>Request a Recipe
          </button>
        </div>
      </section>

      {/* ── Generate Modal ── */}
      <Modal
        show={generateModal}
        onClose={() => { setGenerateModal(false); setGenerateError(""); }}
        title={<span><i className="bi bi-stars me-2 text-primary"></i>Request a Recipe</span>}
        footer={
          <button
            className="btn btn-primary rounded-pill px-4 fw-semibold"
            onClick={handleGenerate}
            disabled={generating || !generateName.trim()}
          >
            {generating ? (
              <><span className="spinner-border spinner-border-sm me-2"></span>Requesting…</>
            ) : (
              <><i className="bi bi-stars me-2"></i>Request a Recipe</>
            )}
          </button>
        }
      >
        <p className="text-secondary mb-3">
          Type any dish name and we'll create a complete recipe with ingredients,
          instructions, and more.
        </p>
        <form onSubmit={handleGenerate}>
          <input
            type="text"
            className="form-control form-control-lg rounded-3"
            placeholder="e.g. Chicken Adobo, Carbonara, Pad Thai…"
            value={generateName}
            onChange={(e) => setGenerateName(e.target.value)}
            autoFocus
          />
        </form>
        {generateError && (
          <div className="alert alert-danger mt-3 mb-0">{generateError}</div>
        )}
      </Modal>
    </>
  );
}

function FeatureCard({ feature: f }) {
  return (
    <div className="feature-card h-100">
      <div className="feature-icon" style={{ background: f.bg, color: f.color }}>
        <i className={`bi ${f.icon}`}></i>
      </div>
      <div className="fw-bold mb-1" style={{ fontSize: ".95rem" }}>{f.label}</div>
      <div className="text-secondary" style={{ fontSize: ".82rem" }}>{f.desc}</div>
    </div>
  );
}
