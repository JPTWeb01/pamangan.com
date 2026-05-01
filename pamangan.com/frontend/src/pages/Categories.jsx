import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { categoryApi } from "../services/api";

const PRESET_CATEGORIES = [
  {
    name: "Filipino",
    description: "Authentic Philippine cuisine — from adobo to sinigang.",
    emoji: "🇵🇭",
    gradient: "linear-gradient(135deg,#0038A8,#001a5c)",
    featured: true,
  },
  {
    name: "Asian",
    description: "Pan-Asian flavors spanning Japan, China, Korea, Thailand.",
    emoji: "🍜",
    gradient: "linear-gradient(135deg,#CE1126,#7a000b)",
    featured: true,
  },
  {
    name: "Italian",
    description: "Classic pasta, pizza, and Mediterranean comfort.",
    emoji: "🍝",
    gradient: "linear-gradient(135deg,#16a34a,#0f6b31)",
    featured: true,
  },
  {
    name: "Healthy",
    description: "Nutritious, balanced meals for everyday wellness.",
    emoji: "🥗",
    gradient: "linear-gradient(135deg,#0891b2,#0c5964)",
    featured: true,
  },
  {
    name: "Soup",
    description: "Broths, stews, and soups from around the world.",
    emoji: "🍲",
    gradient: "linear-gradient(135deg,#7c3aed,#4c1d95)",
    featured: false,
  },
  {
    name: "Snack",
    description: "Quick bites and street food favorites.",
    emoji: "🍢",
    gradient: "linear-gradient(135deg,#d97706,#92400e)",
    featured: false,
  },
  {
    name: "Dessert",
    description: "Sweet endings from leche flan to tiramisu.",
    emoji: "🍮",
    gradient: "linear-gradient(135deg,#ec4899,#831843)",
    featured: false,
  },
  {
    name: "Seafood",
    description: "Fresh catches and ocean-inspired dishes.",
    emoji: "🦐",
    gradient: "linear-gradient(135deg,#0e7490,#164e63)",
    featured: false,
  },
];

export default function Categories() {
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi.list()
      .then((res) => setDbCategories(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = PRESET_CATEGORIES.filter((c) => c.featured);
  const more = PRESET_CATEGORIES.filter((c) => !c.featured);

  const getCount = (name) => {
    const match = dbCategories.find(
      (c) => c.name?.toLowerCase() === name.toLowerCase()
    );
    return match ? `${match.count} recipe${match.count !== 1 ? "s" : ""}` : "";
  };

  return (
    <div className="py-5">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="section-title">Browse Categories</h1>
          <p className="section-subtitle">
            Explore recipes by cuisine, style, or dietary preference
          </p>
        </div>

        {loading && <LoadingSpinner message="Loading categories…" />}

        {/* Featured large cards */}
        <div className="row g-3 mb-3">
          {featured.map((cat, idx) => (
            <div
              key={cat.name}
              className={idx < 2 ? "col-12 col-md-6" : "col-6 col-md-3"}
            >
              <CategoryBigCard cat={cat} count={getCount(cat.name)} />
            </div>
          ))}
        </div>

        {/* More categories */}
        <div className="row g-3 mb-5">
          {more.map((cat) => (
            <div key={cat.name} className="col-6 col-md-4 col-lg-3">
              <CategoryBigCard cat={cat} count={getCount(cat.name)} small />
            </div>
          ))}
        </div>

        {/* Database tag cloud */}
        {dbCategories.length > 0 && (
          <div className="mt-2">
            <h2 className="h5 fw-bold mb-3">All Tags</h2>
            <div className="d-flex flex-wrap gap-2">
              {dbCategories.map(({ name, count }) => (
                <Link
                  key={name}
                  to={`/recipes?q=${encodeURIComponent(name)}`}
                  className="d-inline-flex align-items-center gap-1 text-decoration-none rounded-pill px-3 py-1"
                  style={{
                    background: "var(--ph-blue-light)",
                    color: "var(--ph-blue)",
                    fontSize: ".85rem",
                    fontWeight: 500,
                    border: "1px solid rgba(0,56,168,.15)",
                  }}
                >
                  {name}
                  <span
                    className="badge rounded-pill ms-1"
                    style={{ background: "var(--ph-blue)", fontSize: ".65rem" }}
                  >
                    {count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryBigCard({ cat, count, small }) {
  return (
    <Link
      to={`/recipes?cuisine=${encodeURIComponent(cat.name)}`}
      className="text-decoration-none d-block"
      style={{ height: small ? 140 : 220 }}
    >
      <div
        className="h-100 rounded-3 d-flex flex-column justify-content-end p-3 p-md-4 overflow-hidden position-relative"
        style={{
          background: cat.gradient,
          transition: "transform .2s, box-shadow .2s",
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
        <div
          className="position-absolute"
          style={{ top: 16, right: 20, fontSize: small ? "2rem" : "2.8rem", opacity: .45 }}
        >
          {cat.emoji}
        </div>
        <div className="position-relative" style={{ zIndex: 1 }}>
          <div className="text-white fw-black" style={{ fontSize: small ? "1rem" : "1.4rem" }}>
            {cat.name}
          </div>
          {!small && (
            <div className="text-white mt-1" style={{ fontSize: ".85rem", opacity: .8 }}>
              {cat.description}
            </div>
          )}
          {count && (
            <div
              className="mt-2 d-inline-block text-white rounded-pill px-2 py-0"
              style={{ background: "rgba(255,255,255,.18)", fontSize: ".75rem", fontWeight: 600 }}
            >
              {count}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
