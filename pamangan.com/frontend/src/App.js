import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollManager from "./components/ScrollManager";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Order from "./pages/Order";
import About from "./pages/About";
import LoadingSpinner from "./components/LoadingSpinner";

// Recipe Kitchen + admin are code-split so the business pages load fast.
const Kitchen = lazy(() => import("./pages/Kitchen"));
const Recipes = lazy(() => import("./pages/Recipes"));
const RecipeDetail = lazy(() => import("./pages/RecipeDetail"));
const Categories = lazy(() => import("./pages/Categories"));
const MealPlanner = lazy(() => import("./pages/MealPlanner"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

function NotFound() {
  return (
    <section className="biz-section text-center">
      <div className="container">
        <span className="eyebrow mb-2">404</span>
        <h1 className="biz-title mb-3">This page isn't on the menu</h1>
        <p className="biz-lead mx-auto mb-4">The page you're looking for doesn't exist or has moved.</p>
        <Link to="/" className="btn btn-maroon rounded-pill px-4">Back to home</Link>
      </div>
    </section>
  );
}

function MobileOrderBar() {
  return (
    <div className="mobile-order-bar">
      <Link to="/order" className="btn btn-maroon rounded-pill">
        <i className="bi bi-bag-heart me-1"></i>Order Now
      </Link>
    </div>
  );
}

function AppContent() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/manage");

  if (isAdmin) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
          <Routes>
          <Route path="/manage/login" element={<AdminLogin />} />
          <Route path="/manage/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
    );
  }

  // Hide the floating "Order Now" bar on the order page and the Recipe Kitchen pages,
  // so it doesn't look like recipes can be ordered.
  const isKitchen = /^\/(kitchen|recipes|recipe|categories|meal-planner)(\/|$)/.test(pathname);
  const showOrderBar = pathname !== "/order" && !isKitchen;

  return (
    <div className={`d-flex flex-column min-vh-100 ${showOrderBar ? "has-order-bar" : ""}`}>
      <ScrollManager />
      <Navbar />
      <main className="flex-grow-1">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/order" element={<Order />} />
          <Route path="/about" element={<About />} />
          <Route path="/kitchen" element={<Kitchen />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/meal-planner" element={<MealPlanner />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
      {showOrderBar && <MobileOrderBar />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}
