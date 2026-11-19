import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TITLES = {
  "/": "Pamangan — Homemade Kapampangan Food in Stittsville",
  "/menu": "Menu — Pamangan",
  "/order": "How to Order — Pamangan",
  "/about": "Our Story — Pamangan",
  "/kitchen": "Recipe Kitchen — Pamangan",
  "/recipes": "Recipes — Pamangan Recipe Kitchen",
  "/categories": "Categories — Pamangan Recipe Kitchen",
  "/meal-planner": "Meal Planner — Pamangan Recipe Kitchen",
};

// Scrolls to top (or to #hash) on navigation and sets the document title.
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    document.title = TITLES[pathname] || (pathname.startsWith("/recipe/") ? "Recipe — Pamangan Recipe Kitchen" : "Pamangan");
  }, [pathname]);

  useEffect(() => {
    if (hash) {
      // Wait a frame so the target section has rendered
      const id = decodeURIComponent(hash.slice(1));
      const t = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 60);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);

  return null;
}
