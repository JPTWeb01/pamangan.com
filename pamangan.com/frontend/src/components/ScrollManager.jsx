import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import SEO from "../data/seo-pages.json";
import { pageView } from "../utils/analytics";


// Scrolls to top (or to #hash) on navigation and sets the document title.
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    document.title = SEO.pages[pathname]?.title || (pathname.startsWith("/recipe/") ? "Recipe — Pamangan Recipe Kitchen" : "Pamangan");
    // Recipe pages set their own title once loaded; give it a moment
    const t = setTimeout(pageView, pathname.startsWith("/recipe/") ? 1200 : 0);
    return () => clearTimeout(t);
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
