import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import GroceryModal from "../components/GroceryModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { recipeApi } from "../services/api";

const SLOTS = ["Breakfast", "Lunch", "Dinner"];

function getWeekDates(offset = 0) {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - day + 1 + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MealPlanner() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [plan, setPlan] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mealPlan") || "{}");
    } catch {
      return {};
    }
  });
  const [addModal, setAddModal] = useState(null); // { dateKey, slot }
  const [groceryModal, setGroceryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const weekDates = getWeekDates(weekOffset);

  const savePlan = useCallback((updated) => {
    setPlan(updated);
    localStorage.setItem("mealPlan", JSON.stringify(updated));
  }, []);

  const removeSlot = (dateKey, slot) => {
    const updated = { ...plan };
    if (updated[dateKey]) {
      delete updated[dateKey][slot.toLowerCase()];
      if (!Object.keys(updated[dateKey]).length) delete updated[dateKey];
    }
    savePlan(updated);
  };

  const openAdd = (dateKey, slot) => {
    setAddModal({ dateKey, slot });
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await recipeApi.list({ q, limit: 6 });
      setSearchResults(res.data.recipes || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const pickRecipe = (recipe) => {
    if (!addModal) return;
    const { dateKey, slot } = addModal;
    const updated = { ...plan, [dateKey]: { ...(plan[dateKey] || {}), [slot.toLowerCase()]: { id: recipe.id, name: recipe.name } } };
    savePlan(updated);
    setAddModal(null);
  };

  const allPlannedIds = Object.values(plan).flatMap((day) =>
    Object.values(day).map((m) => m?.id).filter(Boolean)
  );
  const uniqueIds = [...new Set(allPlannedIds)];

  const clearAll = () => {
    if (!window.confirm("Clear the entire meal plan?")) return;
    savePlan({});
  };

  return (
    <div className="py-4">
      <div className="container">
        {/* Header */}
        <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="section-title mb-1">Meal Planner</h1>
            <p className="text-secondary mb-0">Plan your week, one meal at a time.</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {uniqueIds.length > 0 && (
              <button
                className="btn btn-sm rounded-pill px-3 fw-semibold"
                style={{ background: "var(--ph-blue-light)", color: "var(--ph-blue)" }}
                onClick={() => setGroceryModal(true)}
              >
                <i className="bi bi-cart3 me-1"></i>Grocery List
              </button>
            )}
            {Object.keys(plan).length > 0 && (
              <button
                className="btn btn-sm btn-outline-danger rounded-pill px-3"
                onClick={clearAll}
              >
                <i className="bi bi-trash me-1"></i>Clear All
              </button>
            )}
          </div>
        </div>

        {/* Week navigation */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <button
            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
            onClick={() => setWeekOffset((o) => o - 1)}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <span className="fw-semibold" style={{ fontSize: ".95rem" }}>
            {weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} —{" "}
            {weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
            onClick={() => setWeekOffset((o) => o + 1)}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
          {weekOffset !== 0 && (
            <button
              className="btn btn-sm btn-link text-secondary p-0"
              onClick={() => setWeekOffset(0)}
              style={{ fontSize: ".85rem" }}
            >
              Today
            </button>
          )}
        </div>

        {/* Planner grid — desktop */}
        <div className="d-none d-md-block">
          <div className="row g-2">
            {weekDates.map((date, idx) => {
              const dateKey = date.toISOString().split("T")[0];
              const isToday = new Date().toISOString().split("T")[0] === dateKey;
              const dayData = plan[dateKey] || {};
              return (
                <div key={dateKey} className="col">
                  <div
                    className="planner-day-col"
                    style={isToday ? { border: "2px solid var(--ph-blue)" } : {}}
                  >
                    <div
                      className="planner-day-header"
                      style={isToday ? { background: "var(--ph-red)" } : {}}
                    >
                      <div>{DAY_LABELS[idx]}</div>
                      <div style={{ fontSize: ".7rem", opacity: .8 }}>
                        {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                    {SLOTS.map((slot) => {
                      const meal = dayData[slot.toLowerCase()];
                      return (
                        <div key={slot} className="planner-meal-slot">
                          <div className="slot-label">{slot}</div>
                          {meal ? (
                            <div className="d-flex align-items-start justify-content-between gap-1 mt-1">
                              <Link
                                to={`/recipe/${meal.id}`}
                                className="text-decoration-none"
                                style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}
                              >
                                {meal.name}
                              </Link>
                              <button
                                className="btn p-0 text-secondary flex-shrink-0"
                                style={{ fontSize: ".7rem" }}
                                onClick={() => removeSlot(dateKey, slot)}
                              >
                                <i className="bi bi-x-circle"></i>
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn p-0 mt-1"
                              style={{ fontSize: ".72rem", color: "var(--text-muted)" }}
                              onClick={() => openAdd(dateKey, slot)}
                            >
                              <i className="bi bi-plus-circle me-1"></i>Add
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Planner list — mobile */}
        <div className="d-md-none">
          {weekDates.map((date, idx) => {
            const dateKey = date.toISOString().split("T")[0];
            const isToday = new Date().toISOString().split("T")[0] === dateKey;
            const dayData = plan[dateKey] || {};
            return (
              <div
                key={dateKey}
                className="rounded-3 overflow-hidden mb-3"
                style={{ border: isToday ? "2px solid var(--ph-blue)" : "1px solid var(--border)" }}
              >
                <div
                  className="px-3 py-2 fw-bold"
                  style={{
                    background: isToday ? "var(--ph-red)" : "var(--ph-blue)",
                    color: "#fff",
                    fontSize: ".9rem",
                  }}
                >
                  {DAY_LABELS[idx]} — {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
                {SLOTS.map((slot) => {
                  const meal = dayData[slot.toLowerCase()];
                  return (
                    <div
                      key={slot}
                      className="px-3 py-2 d-flex align-items-center justify-content-between"
                      style={{ borderTop: "1px solid var(--border)", fontSize: ".88rem" }}
                    >
                      <span className="text-secondary fw-semibold me-2" style={{ minWidth: 70 }}>{slot}</span>
                      {meal ? (
                        <div className="d-flex align-items-center justify-content-between flex-grow-1 gap-2">
                          <Link to={`/recipe/${meal.id}`} className="fw-medium text-decoration-none" style={{ color: "var(--text-primary)" }}>
                            {meal.name}
                          </Link>
                          <button className="btn p-0 text-secondary" onClick={() => removeSlot(dateKey, slot)}>
                            <i className="bi bi-x-circle"></i>
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-0"
                          style={{ fontSize: ".75rem" }}
                          onClick={() => openAdd(dateKey, slot)}
                        >
                          <i className="bi bi-plus me-1"></i>Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {uniqueIds.length === 0 && (
          <div className="text-center py-4 text-secondary">
            <i className="bi bi-calendar3 display-5 d-block mb-3" style={{ opacity: .3 }}></i>
            <p>Click <strong>+ Add</strong> on any slot to start planning your meals.</p>
          </div>
        )}
      </div>

      {/* Add recipe modal */}
      <Modal
        show={!!addModal}
        onClose={() => setAddModal(null)}
        title={
          addModal && (
            <span>
              <i className="bi bi-calendar-plus me-2 text-primary"></i>
              Add {addModal.slot} — {new Date(addModal.dateKey + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </span>
          )
        }
      >
        <div className="position-relative mb-3">
          <i className="bi bi-search position-absolute top-50 translate-middle-y" style={{ left: 12, color: "#9ca3af" }}></i>
          <input
            type="search"
            className="form-control rounded-3"
            style={{ paddingLeft: "36px" }}
            placeholder="Search for a recipe…"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
        </div>

        {searching && <LoadingSpinner size="sm" message="Searching…" />}

        <div className="d-flex flex-column gap-2">
          {searchResults.map((r) => (
            <button
              key={r.id}
              className="btn text-start rounded-3 p-2 border"
              style={{ background: "var(--surface)" }}
              onClick={() => pickRecipe(r)}
            >
              <div className="fw-semibold" style={{ fontSize: ".9rem" }}>{r.name}</div>
              <div className="text-secondary" style={{ fontSize: ".78rem" }}>
                {r.cuisine} · {r.cooking_time}
              </div>
            </button>
          ))}
          {searchQuery && !searching && searchResults.length === 0 && (
            <p className="text-secondary text-center small mb-0">No results. Try a different name.</p>
          )}
        </div>
      </Modal>

      {/* Grocery modal */}
      <GroceryModal
        show={groceryModal}
        onClose={() => setGroceryModal(false)}
        recipeIds={uniqueIds}
        recipeNames={["this week's meal plan"]}
      />
    </div>
  );
}
