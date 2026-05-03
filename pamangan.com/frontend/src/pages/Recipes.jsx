import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import { recipeApi } from "../services/api";

const CUISINES = ["All", "Filipino", "Asian", "Italian", "Mexican", "American", "Healthy"];
const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

export default function Recipes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generateModal, setGenerateModal] = useState(false);
  const [generateName, setGenerateName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const navigate = useNavigate();
  const q = searchParams.get("q") || "";
  const cuisine = searchParams.get("cuisine") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await recipeApi.list({ q, cuisine, difficulty, page });
      setRecipes(res.data.recipes || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [q, cuisine, difficulty, page]);

  useEffect(() => {
    load();
    if (searchParams.get("generate") === "1") setGenerateModal(true);
  }, [load]); // eslint-disable-line

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && String(value).toLowerCase() !== "all") next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!generateName.trim()) return;
    setGenerating(true);
    setGenerateError("");
    try {
      const res = await recipeApi.generate(generateName.trim());
      navigate(`/recipe/${res.data.id}`);
    } catch (err) {
      setGenerateError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="py-4">
      <div className="container">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="section-title mb-1">
              {q ? `Results for "${q}"` : cuisine ? `${cuisine} Recipes` : "All Recipes"}
            </h1>
            <p className="text-secondary mb-0">{total} recipe{total !== 1 ? "s" : ""} found</p>
          </div>
          <button
            className="btn btn-primary rounded-pill px-4 fw-semibold"
            onClick={() => setGenerateModal(true)}
          >
            <i className="bi bi-stars me-2"></i>Request a Recipe
          </button>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="row g-2 align-items-end">
            {/* Search */}
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary mb-1">Search</label>
              <div className="position-relative">
                <i className="bi bi-search position-absolute top-50 translate-middle-y" style={{ left: 12, color: "#9ca3af", fontSize: ".85rem" }}></i>
                <input
                  type="search"
                  className="form-control rounded-3"
                  style={{ paddingLeft: "34px" }}
                  placeholder="Dish name or ingredient…"
                  defaultValue={q}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setParam("q", e.target.value);
                  }}
                  onBlur={(e) => setParam("q", e.target.value)}
                />
              </div>
            </div>

            {/* Cuisine */}
            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold text-secondary mb-1">Cuisine</label>
              <select
                className="form-select rounded-3"
                value={cuisine || "All"}
                onChange={(e) => setParam("cuisine", e.target.value)}
              >
                {CUISINES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Difficulty */}
            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold text-secondary mb-1">Difficulty</label>
              <select
                className="form-select rounded-3"
                value={difficulty || "All"}
                onChange={(e) => setParam("difficulty", e.target.value)}
              >
                {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>

            {/* Clear */}
            <div className="col-12 col-md-2">
              {(q || cuisine || difficulty) && (
                <button
                  className="btn btn-outline-secondary rounded-3 w-100"
                  onClick={() => setSearchParams({})}
                >
                  <i className="bi bi-x-circle me-1"></i>Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <LoadingSpinner message="Searching recipes…" />
        ) : error ? (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-circle me-2"></i>{error}
            <button className="btn btn-sm btn-outline-danger ms-2 rounded-pill" onClick={load}>Retry</button>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-search display-4 text-secondary d-block mb-3" style={{ opacity: .4 }}></i>
            <h5 className="text-secondary">No recipes found</h5>
            <p className="text-secondary mb-4">Try requesting one!</p>
            <button
              className="btn btn-primary rounded-pill px-4"
              onClick={() => { setGenerateName(q || cuisine); setGenerateModal(true); }}
            >
              <i className="bi bi-stars me-2"></i>Request "{q || cuisine || "a recipe"}"
            </button>
          </div>
        ) : (
          <div className="row g-3">
            {recipes.map((r) => (
              <div className="col-6 col-md-4 col-lg-3" key={r.id}>
                <RecipeCard recipe={r} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <nav className="mt-4 d-flex justify-content-center">
            <ul className="pagination mb-0">
              <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                <button className="page-link rounded-start-pill" onClick={() => setParam("page", page - 1)}>
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setParam("page", p)}>{p}</button>
                </li>
              ))}
              <li className={`page-item ${page >= pages ? "disabled" : ""}`}>
                <button className="page-link rounded-end-pill" onClick={() => setParam("page", page + 1)}>
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* Generate Modal */}
      <Modal
        show={generateModal}
        onClose={() => { setGenerateModal(false); setGenerateError(""); }}
        title={<span><i className="bi bi-stars me-2 text-primary"></i>Request a Recipe</span>}
        footer={
          <button
            className="btn btn-primary rounded-pill px-4 fw-semibold"
            onClick={handleGenerate}
            disabled={generating || !generateName.trim()}
          >
            {generating ? (
              <><span className="spinner-border spinner-border-sm me-2"></span>Requesting…</>
            ) : (
              <><i className="bi bi-stars me-2"></i>Request a Recipe</>
            )}
          </button>
        }
      >
        <p className="text-secondary mb-3">
          Enter any dish name and we'll create a complete recipe, saved instantly.
        </p>
        <form onSubmit={handleGenerate}>
          <input
            type="text"
            className="form-control form-control-lg rounded-3"
            placeholder="e.g. Beef Kare-Kare, Tiramisu, Ramen…"
            value={generateName}
            onChange={(e) => setGenerateName(e.target.value)}
            autoFocus
          />
        </form>
        {generateError && <div className="alert alert-danger mt-3 mb-0">{generateError}</div>}
      </Modal>
    </div>
  );
}
