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

// Woven salakot (Filipino hat) worn by the "P" in the wordmark
function Salakot() {
  return (
    <svg className="salakot" viewBox="0 0 100 46" focusable="false" aria-hidden="true">
      <defs>
        <linearGradient id="salakotFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3CB6B" />
          <stop offset=".55" stopColor="#D9A441" />
          <stop offset="1" stopColor="#B07A26" />
        </linearGradient>
      </defs>
      <path d="M3 37 C 20 27, 36 13, 50 8 C 64 13, 80 27, 97 37 Q 50 47, 3 37 Z" fill="url(#salakotFill)" stroke="#6B3A12" strokeWidth="2.2" strokeLinejoin="round" />
      <g stroke="#8A5418" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity=".75">
        <path d="M50 9 L 16 39" /><path d="M50 9 L 30 41" /><path d="M50 9 L 50 42" />
        <path d="M50 9 L 70 41" /><path d="M50 9 L 84 39" />
        <path d="M30 23 Q 50 28 70 23" /><path d="M18 31 Q 50 38 82 31" />
      </g>
      <path d="M3 37 Q 50 47, 97 37" fill="none" stroke="#7B1E22" strokeWidth="3" strokeLinecap="round" />
      <rect x="46.5" y="2.5" width="7" height="7" rx="2" fill="#7B1E22" />
      <circle cx="50" cy="2.8" r="2.6" fill="#E9B949" stroke="#6B3A12" strokeWidth="1" />
    </svg>
  );
}

export function Wordmark({ className = "" }) {
  return (
    <span className={`wordmark ${className}`}>
      <span className="wordmark-name" aria-label={BUSINESS.name}>
        <span className="wordmark-p" aria-hidden="true">
          <Salakot />
          {BUSINESS.name.charAt(0)}
        </span>
        <span aria-hidden="true">{BUSINESS.name.slice(1)}</span>
      </span>
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
