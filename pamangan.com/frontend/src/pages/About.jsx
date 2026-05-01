import React from "react";
import { Link } from "react-router-dom";

const TECH_STACK = [
  { icon: "bi-gem", name: "React 18", desc: "UI framework", color: "#0891b2" },
  { icon: "bi-bootstrap", name: "Bootstrap 5.3", desc: "Mobile-first CSS", color: "#7952b3" },
  { icon: "bi-server", name: "Flask", desc: "Python REST API", color: "#16a34a" },
  { icon: "bi-database", name: "MongoDB Atlas", desc: "Cloud NoSQL DB", color: "#47a248" },
  { icon: "bi-stars", name: "Google Gemini", desc: "Primary AI layer", color: "#4285F4" },
  { icon: "bi-lightning-charge", name: "Groq", desc: "AI fallback layer", color: "#f97316" },
];

const FEATURES = [
  { icon: "bi-search", title: "Smart Recipe Search", desc: "Search by name, ingredient, or cuisine with instant results from the database." },
  { icon: "bi-stars", title: "AI Recipe Generation", desc: "Can't find a recipe? Our AI generates complete, authentic recipes on demand — saved automatically." },
  { icon: "bi-cart3", title: "Grocery List Generator", desc: "Combine ingredients from multiple recipes, deduplicate, and organize by store section." },
  { icon: "bi-bar-chart-fill", title: "Nutrition Estimation", desc: "AI-powered nutritional breakdown with calories, macros, allergens, and health notes." },
  { icon: "bi-book", title: "Food History & Culture", desc: "Explore the cultural stories, regional variations, and fun facts behind every dish." },
  { icon: "bi-calendar3", title: "Weekly Meal Planner", desc: "Plan your entire week with a visual planner that generates a combined grocery list." },
];

export default function About() {
  return (
    <div className="py-5">
      {/* Hero */}
      <div
        className="py-5 mb-5 text-center text-white"
        style={{ background: "linear-gradient(135deg,#001a5c 0%,#0038A8 50%,#1a0a3e 100%)" }}
      >
        <div className="container">
          <h1 className="fw-black mb-3" style={{ fontSize: "clamp(2rem,5vw,3rem)" }}>
            About <span style={{ color: "#FCD116" }}>pamangan.com</span>
          </h1>
          <p className="mx-auto mb-4" style={{ maxWidth: 600, opacity: .85, fontSize: "1.05rem" }}>
            An AI-powered recipe platform built to celebrate Filipino cuisine
            and connect food lovers worldwide with authentic culinary heritage.
          </p>
          <Link
            to="/recipes"
            className="btn rounded-pill px-5 fw-semibold"
            style={{ background: "#FCD116", color: "#111" }}
          >
            <i className="bi bi-egg-fried me-2"></i>Explore Recipes
          </Link>
        </div>
      </div>

      <div className="container">
        {/* Mission */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-8 text-center">
            <h2 className="section-title mb-3">Our Mission</h2>
            <p style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Pamangan</strong> means "food" in Kapampangan,
              the culinary capital of the Philippines. We built this platform to preserve and share the rich
              tradition of Filipino cooking while using AI to make recipe discovery effortless for everyone
              — from home cooks to professional chefs.
            </p>
            <p style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "var(--text-secondary)" }}>
              Our smart caching system ensures that every AI-generated recipe is saved for future users,
              building an ever-growing global recipe library that gets better over time — while keeping
              AI costs minimal.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-5">
          <h2 className="section-title text-center mb-2">Platform Features</h2>
          <p className="section-subtitle text-center mb-4">Everything you need to cook with confidence</p>
          <div className="row g-3">
            {FEATURES.map((f) => (
              <div className="col-12 col-md-6 col-lg-4" key={f.title}>
                <div
                  className="h-100 rounded-3 p-4"
                  style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
                >
                  <div
                    className="rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: 44, height: 44, background: "var(--ph-blue-light)", color: "var(--ph-blue)" }}
                  >
                    <i className={`bi ${f.icon}`} style={{ fontSize: "1.1rem" }}></i>
                  </div>
                  <h5 className="fw-bold mb-1" style={{ fontSize: "1rem" }}>{f.title}</h5>
                  <p className="text-secondary mb-0" style={{ fontSize: ".88rem" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div className="mb-5">
          <h2 className="section-title text-center mb-2">Built With</h2>
          <p className="section-subtitle text-center mb-4">Modern, production-ready technology</p>
          <div className="row g-3">
            {TECH_STACK.map((t) => (
              <div className="col-6 col-md-4 col-lg-2" key={t.name}>
                <div className="tech-stack-item">
                  <i
                    className={`bi ${t.icon} d-block mb-2`}
                    style={{ fontSize: "1.75rem", color: t.color }}
                  ></i>
                  <div className="fw-bold" style={{ fontSize: ".9rem" }}>{t.name}</div>
                  <div className="text-secondary" style={{ fontSize: ".78rem" }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI system */}
        <div
          className="rounded-4 p-4 p-md-5 mb-5"
          style={{ background: "linear-gradient(135deg,var(--ph-blue-light),#ede9fe)" }}
        >
          <div className="row align-items-center g-4">
            <div className="col-md-7">
              <h2 className="h3 fw-black mb-3">Smart AI Caching System</h2>
              <p className="text-secondary mb-3" style={{ lineHeight: 1.75 }}>
                Every search first checks MongoDB. Only when a recipe doesn't exist does the system
                call an AI provider — using Google Gemini as the primary and Groq as an automatic
                fallback. The generated recipe is instantly saved, so the next user gets it instantly.
              </p>
              <div className="d-flex flex-column gap-2" style={{ fontSize: ".9rem" }}>
                {[
                  "Database-first approach minimizes AI API costs",
                  "Automatic fallback ensures near-zero downtime",
                  "Every query grows the recipe library",
                ].map((point) => (
                  <div key={point} className="d-flex align-items-center gap-2">
                    <i className="bi bi-check-circle-fill text-primary flex-shrink-0"></i>
                    {point}
                  </div>
                ))}
              </div>
            </div>
            <div className="col-md-5">
              <div
                className="rounded-3 p-3 font-monospace"
                style={{ background: "#0f172a", color: "#94a3b8", fontSize: ".8rem", lineHeight: 1.7 }}
              >
                <div style={{ color: "#64748b" }}># Request flow</div>
                <div style={{ color: "#38bdf8" }}>User Search</div>
                <div style={{ paddingLeft: "1rem" }}>↓ Check MongoDB</div>
                <div style={{ paddingLeft: "2rem", color: "#4ade80" }}>✓ Found → Return instantly</div>
                <div style={{ paddingLeft: "2rem", color: "#fb923c" }}>✗ Not found →</div>
                <div style={{ paddingLeft: "3rem", color: "#c084fc" }}>Call Gemini AI</div>
                <div style={{ paddingLeft: "3rem", color: "#818cf8" }}>(→ Groq fallback)</div>
                <div style={{ paddingLeft: "3rem" }}>Save to MongoDB</div>
                <div style={{ paddingLeft: "3rem", color: "#4ade80" }}>Return to user</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="h3 fw-black mb-3">Start Cooking Today</h2>
          <p className="text-secondary mb-4">
            Browse our growing collection or generate your first AI recipe.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/recipes" className="btn btn-primary rounded-pill px-5 fw-semibold">
              <i className="bi bi-grid me-2"></i>Browse Recipes
            </Link>
            <Link to="/meal-planner" className="btn btn-outline-primary rounded-pill px-5 fw-semibold">
              <i className="bi bi-calendar3 me-2"></i>Meal Planner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
