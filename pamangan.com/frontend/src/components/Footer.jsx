import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="footer-brand mb-2">pamangan.com</div>
            <p style={{ fontSize: ".9rem", color: "rgba(255,255,255,.6)", maxWidth: 300 }}>
              An AI-powered recipe platform celebrating Filipino cuisine and global
              flavors. Discover, generate, and cook with confidence.
            </p>
            <div className="d-flex gap-3 mt-3">
              {["facebook", "instagram", "youtube"].map((icon) => (
                <button
                  key={icon}
                  className="d-flex align-items-center justify-content-center rounded-circle border-0"
                  style={{
                    width: 36,
                    height: 36,
                    background: "rgba(255,255,255,.1)",
                    transition: "background .2s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.1)")}
                >
                  <i className={`bi bi-${icon}`} style={{ color: "#fff", fontSize: ".9rem" }}></i>
                </button>
              ))}
            </div>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6>Explore</h6>
            <ul className="list-unstyled" style={{ fontSize: ".9rem" }}>
              {[
                { to: "/recipes", label: "All Recipes" },
                { to: "/categories", label: "Categories" },
                { to: "/meal-planner", label: "Meal Planner" },
                { to: "/about", label: "About Us" },
              ].map(({ to, label }) => (
                <li key={to} className="mb-1">
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6>Cuisine</h6>
            <ul className="list-unstyled" style={{ fontSize: ".9rem" }}>
              {["Filipino", "Asian", "Italian", "Mexican", "Healthy"].map((c) => (
                <li key={c} className="mb-1">
                  <Link to={`/recipes?cuisine=${c}`}>{c}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6>AI Recipe Generator</h6>
            <p style={{ fontSize: ".85rem", color: "rgba(255,255,255,.6)" }}>
              Can't find a recipe? Let our AI create one for you instantly.
            </p>
            <Link
              to="/recipes?generate=1"
              className="btn btn-sm rounded-pill px-4 fw-semibold"
              style={{ background: "#FCD116", color: "#111" }}
            >
              <i className="bi bi-stars me-2"></i>Generate a Recipe
            </Link>
          </div>
        </div>

        <hr className="footer-divider" />

        <div
          className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2"
          style={{ fontSize: ".8rem", color: "rgba(255,255,255,.4)" }}
        >
          <span>© {new Date().getFullYear()} pamangan.com — All rights reserved.</span>
          <span>
            Powered by{" "}
            <span style={{ color: "rgba(255,255,255,.6)" }}>Google Gemini</span> &amp;{" "}
            <span style={{ color: "rgba(255,255,255,.6)" }}>Groq</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
