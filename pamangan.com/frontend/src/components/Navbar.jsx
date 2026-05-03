import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/recipes?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setMenuOpen(false);
    }
  };

  return (
    <nav
      className={`navbar navbar-expand-lg sticky-top ${
        scrolled ? "bg-white shadow-sm" : "bg-white border-bottom"
      }`}
      style={{ transition: "box-shadow .25s" }}
    >
      <div className="container">
        {/* Brand */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
          <span
            style={{
              background: "linear-gradient(135deg, #0038A8, #CE1126)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            pamangan
          </span>
          <span
            className="badge rounded-pill"
            style={{ background: "#FCD116", color: "#111", fontSize: ".6rem" }}
          >
            .com
          </span>
        </Link>

        {/* Hamburger */}
        <button
          className="navbar-toggler border-0"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <i className={`bi ${menuOpen ? "bi-x" : "bi-list"} fs-4`}></i>
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`} id="navMenu">
          {/* Nav links */}
          <ul className="navbar-nav me-auto ms-3 gap-1">
            {[
              { to: "/", label: "Home", exact: true },
              { to: "/recipes", label: "Recipes" },
              { to: "/categories", label: "Categories" },
              { to: "/meal-planner", label: "Meal Planner" },
              { to: "/about", label: "About" },
            ].map(({ to, label, exact }) => (
              <li className="nav-item" key={to}>
                <NavLink
                  to={to}
                  end={exact}
                  className={({ isActive }) =>
                    `nav-link px-2 ${isActive ? "text-primary fw-semibold" : "text-secondary"}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Search */}
          <form className="d-flex align-items-center gap-2" onSubmit={handleSearch}>
            <div className="position-relative">
              <i
                className="bi bi-search position-absolute top-50 translate-middle-y"
                style={{ left: "12px", color: "#9ca3af", fontSize: ".85rem" }}
              ></i>
              <input
                type="search"
                className="form-control form-control-sm rounded-pill"
                placeholder="Search recipes…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ paddingLeft: "34px", paddingRight: "12px", minWidth: "200px" }}
              />
            </div>
            <Link
              to="/recipes?generate=1"
              className="btn btn-sm rounded-pill px-3 fw-semibold"
              style={{ background: "#0038A8", color: "#fff", whiteSpace: "nowrap" }}
              onClick={() => setMenuOpen(false)}
            >
              <i className="bi bi-stars me-1"></i>Request a Recipe
            </Link>
          </form>
        </div>
      </div>
    </nav>
  );
}
