import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BUSINESS } from "../data/business";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/menu", label: "Menu" },
  { to: "/order", label: "How to Order" },
  { to: "/kitchen", label: "Recipe Kitchen" },
  { to: "/about", label: "Our Story" },
];

export function Wordmark({ className = "" }) {
  return (
    <span className={`wordmark ${className}`}>
      <span className="wordmark-name">{BUSINESS.name}</span>
      <span className="wordmark-tag">{BUSINESS.tagline}</span>
    </span>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes
  useEffect(() => setMenuOpen(false), [pathname]);

  // Keep "Recipe Kitchen" highlighted on the recipe sub-pages
  const kitchenActive = ["/kitchen", "/recipes", "/recipe/", "/categories", "/meal-planner"].some(
    (p) => pathname.startsWith(p)
  );

  return (
    <nav className={`navbar navbar-expand-lg sticky-top biz-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="container">
        <Link to="/" className="navbar-brand py-0 me-4" aria-label={`${BUSINESS.name} home`}>
          <Wordmark />
        </Link>

        <button
          className="navbar-toggler border-0 px-2"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mainNav"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <i className={`bi ${menuOpen ? "bi-x-lg" : "bi-list"} fs-3`}></i>
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`} id="mainNav">
          <ul className="navbar-nav mx-auto gap-lg-1">
            {LINKS.map(({ to, label, end }) => (
              <li className="nav-item" key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `nav-link ${isActive || (to === "/kitchen" && kitchenActive) ? "active" : ""}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="d-flex gap-2 mt-2 mt-lg-0">
            <a
              href={BUSINESS.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost rounded-pill px-3 d-none d-xl-inline-flex align-items-center"
              aria-label="Pamangan on Facebook"
            >
              <i className="bi bi-facebook"></i>
            </a>
            <Link to="/order" className="btn btn-maroon rounded-pill px-4 flex-grow-1 flex-lg-grow-0">
              <i className="bi bi-bag-heart me-2"></i>Order Now
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
