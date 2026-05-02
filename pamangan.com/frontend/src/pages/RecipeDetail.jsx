import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import LoadingSpinner from "../components/LoadingSpinner";
import GroceryModal from "../components/GroceryModal";
import NutritionModal from "../components/NutritionModal";
import HistoryModal from "../components/HistoryModal";
import { recipeApi } from "../services/api";

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // "grocery" | "nutrition" | "history"
  const [addedToPlanner, setAddedToPlanner] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError("");
    setRecipe(null);

    Promise.all([recipeApi.get(id), recipeApi.similar(id)])
      .then(([rRes, sRes]) => {
        setRecipe(rRes.data);
        setSimilar(sRes.data || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const addToPlanner = () => {
    if (!recipe) return;
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem("mealPlan") || "{}");
    } catch {
      saved = {};
    }
    const today = new Date().toISOString().split("T")[0];
    if (!saved[today]) saved[today] = {};
    const slots = ["breakfast", "lunch", "dinner"];
    const free = slots.find((s) => !saved[today][s]);
    if (free) {
      saved[today][free] = { id: recipe.id, name: recipe.name };
      localStorage.setItem("mealPlan", JSON.stringify(saved));
      setAddedToPlanner(true);
      setTimeout(() => setAddedToPlanner(false), 3000);
    }
  };

  if (loading) return <LoadingSpinner message="Loading recipe…" />;

  if (error || !recipe)
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-emoji-frown display-4 text-secondary d-block mb-3"></i>
        <h4 className="text-secondary">{error || "Recipe not found"}</h4>
        <Link to="/recipes" className="btn btn-primary rounded-pill mt-3">Back to Recipes</Link>
      </div>
    );

  const imgSrc =
    recipe.image_url ||
    `https://loremflickr.com/800/450/${encodeURIComponent(recipe.slug || recipe.name)},food`;

  return (
    <>
      <div className="container py-4">
        {/* Breadcrumb */}
        <nav className="mb-3" aria-label="breadcrumb">
          <ol className="breadcrumb mb-0" style={{ fontSize: ".85rem" }}>
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/recipes">Recipes</Link></li>
            <li className="breadcrumb-item active">{recipe.name}</li>
          </ol>
        </nav>

        <div className="row g-4">
          {/* ── Main content ── */}
          <div className="col-lg-8">
            {/* Hero image */}
            <div className="recipe-detail-hero mb-4">
              <img src={imgSrc} alt={recipe.name} />
            </div>

            {/* Title + meta */}
            <div className="mb-4">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                {recipe.cuisine && (
                  <span className="badge rounded-pill bg-primary">{recipe.cuisine}</span>
                )}
                {recipe.source === "ai" && (
                  <span className="ai-badge"><i className="bi bi-stars"></i> AI Generated</span>
                )}
                {recipe.difficulty && (
                  <span
                    className={`difficulty-badge ${
                      recipe.difficulty === "Easy" ? "difficulty-easy" :
                      recipe.difficulty === "Hard" ? "difficulty-hard" : "difficulty-medium"
                    }`}
                  >
                    {recipe.difficulty}
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: "clamp(1.5rem,4vw,2.25rem)" }}>{recipe.name}</h1>

              {recipe.description && (
                <p className="text-secondary" style={{ fontSize: "1rem" }}>{recipe.description}</p>
              )}

              {/* Stats row */}
              <div
                className="d-flex flex-wrap gap-4 py-3 px-4 rounded-3 mt-3"
                style={{ background: "var(--ph-blue-light)", fontSize: ".9rem" }}
              >
                {[
                  { icon: "bi-clock", value: recipe.cooking_time, label: "Cook time" },
                  { icon: "bi-stopwatch", value: recipe.prep_time, label: "Prep time" },
                  { icon: "bi-people", value: recipe.servings ? `${recipe.servings} servings` : null, label: "Servings" },
                ].filter((s) => s.value).map(({ icon, value, label }) => (
                  <div key={label} className="text-center">
                    <i className={`bi ${icon} text-primary d-block mb-1`}></i>
                    <div className="fw-bold">{value}</div>
                    <div className="text-secondary" style={{ fontSize: ".75rem" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Action buttons */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              <button
                className="btn btn-sm rounded-pill fw-semibold px-3"
                style={{ background: "var(--ph-blue-light)", color: "var(--ph-blue)" }}
                onClick={() => setModal("grocery")}
              >
                <i className="bi bi-cart3 me-2"></i>Grocery List
              </button>
              <button
                className="btn btn-sm rounded-pill fw-semibold px-3"
                style={{ background: "#d1fae5", color: "#065f46" }}
                onClick={() => setModal("nutrition")}
              >
                <i className="bi bi-bar-chart-fill me-2"></i>Nutrition Info
              </button>
              <button
                className="btn btn-sm rounded-pill fw-semibold px-3"
                style={{ background: "#ede9fe", color: "#6d28d9" }}
                onClick={() => setModal("history")}
              >
                <i className="bi bi-book me-2"></i>Food History
              </button>
              <button
                className="btn btn-sm rounded-pill fw-semibold px-3"
                style={{ background: "#fef3c7", color: "#92400e" }}
                onClick={addToPlanner}
              >
                <i className={`bi ${addedToPlanner ? "bi-check2" : "bi-calendar-plus"} me-2`}></i>
                {addedToPlanner ? "Added!" : "Add to Planner"}
              </button>
            </div>

            {/* Ingredients */}
            {recipe.ingredients?.length > 0 && (
              <div className="mb-4">
                <h3 className="h5 fw-bold mb-3">
                  <i className="bi bi-basket me-2 text-primary"></i>Ingredients
                </h3>
                <ul className="ingredient-list list-unstyled mb-0">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="d-flex justify-content-between align-items-start">
                      <div className="d-flex align-items-start gap-2">
                        <input type="checkbox" className="form-check-input mt-1 flex-shrink-0" />
                        <span>{ing.item}{ing.notes ? ` (${ing.notes})` : ""}</span>
                      </div>
                      <span className="text-secondary fw-medium ms-2 flex-shrink-0">{ing.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructions */}
            {recipe.instructions?.length > 0 && (
              <div className="mb-4">
                <h3 className="h5 fw-bold mb-3">
                  <i className="bi bi-list-ol me-2 text-primary"></i>Instructions
                </h3>
                {recipe.instructions.map((step, i) => (
                  <div className="instruction-step" key={i}>
                    <div className="step-number">{i + 1}</div>
                    <p className="mb-0" style={{ paddingTop: "4px" }}>{step}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Substitutions */}
            {recipe.substitutions?.length > 0 && (
              <div
                className="rounded-3 p-4"
                style={{ background: "#fef3c7", border: "1px solid #fde68a" }}
              >
                <h3 className="h6 fw-bold mb-2">
                  <i className="bi bi-arrow-left-right me-2" style={{ color: "#92400e" }}></i>
                  Substitution Tips
                </h3>
                <ul className="mb-0" style={{ paddingLeft: "1.25rem" }}>
                  {recipe.substitutions.map((s, i) => (
                    <li key={i} style={{ fontSize: ".9rem", marginBottom: ".25rem" }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: "80px" }}>
              {/* Tags */}
              {recipe.tags?.length > 0 && (
                <div className="card border-0 shadow-sm rounded-3 mb-3 p-3">
                  <h6 className="fw-bold mb-2">Tags</h6>
                  <div className="d-flex flex-wrap gap-1">
                    {recipe.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/recipes?q=${encodeURIComponent(tag)}`}
                        className="badge rounded-pill text-decoration-none"
                        style={{ background: "var(--ph-blue-light)", color: "var(--ph-blue)", fontWeight: 500 }}
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar recipes */}
              {similar.length > 0 && (
                <div>
                  <h6 className="fw-bold mb-3">You Might Also Like</h6>
                  <div className="d-flex flex-column gap-3">
                    {similar.map((r) => (
                      <RecipeCard key={r.id} recipe={r} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <GroceryModal
        show={modal === "grocery"}
        onClose={() => setModal(null)}
        recipeIds={[recipe.id]}
        recipeNames={[recipe.name]}
      />
      <NutritionModal
        show={modal === "nutrition"}
        onClose={() => setModal(null)}
        recipeId={recipe.id}
        recipeName={recipe.name}
      />
      <HistoryModal
        show={modal === "history"}
        onClose={() => setModal(null)}
        recipeId={recipe.id}
        recipeName={recipe.name}
      />
    </>
  );
}
