import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";
import { aiApi } from "../services/api";

export default function NutritionModal({ show, onClose, recipeId, recipeName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!recipeId) return;
    setLoading(true);
    setError("");
    try {
      const res = await aiApi.nutrition(recipeId);
      setData(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) { setData(null); load(); }
  }, [show, recipeId]); // eslint-disable-line

  const macros = data
    ? [
        { value: data.calories_per_serving, label: "Calories", unit: "kcal", color: "#CE1126" },
        { value: data.protein_g, label: "Protein", unit: "g", color: "#0038A8" },
        { value: data.carbohydrates_g, label: "Carbs", unit: "g", color: "#FCD116" },
        { value: data.fat_g, label: "Fat", unit: "g", color: "#16a34a" },
        { value: data.fiber_g, label: "Fiber", unit: "g", color: "#7c3aed" },
        { value: data.sodium_mg, label: "Sodium", unit: "mg", color: "#ea580c" },
      ]
    : [];

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={
        <span>
          <i className="bi bi-bar-chart-fill me-2" style={{ color: "#16a34a" }}></i>
          Nutrition Info — {recipeName}
        </span>
      }
    >
      {loading && <LoadingSpinner message="Estimating nutrition with AI…" />}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-circle"></i>{error}
          <button className="btn btn-sm btn-outline-danger ms-auto rounded-pill" onClick={load}>Retry</button>
        </div>
      )}
      {data && (
        <>
          <p className="text-secondary small mb-3">Per serving · AI-estimated values</p>
          <div className="row g-3 mb-4">
            {macros.map(({ value, label, unit, color }) => (
              <div className="col-6 col-sm-4" key={label}>
                <div className="nutrition-stat">
                  <div className="value" style={{ color }}>{value}</div>
                  <div className="label">{label} ({unit})</div>
                </div>
              </div>
            ))}
          </div>

          {data.health_notes?.length > 0 && (
            <div className="mb-3">
              <h6 className="fw-bold mb-2" style={{ fontSize: ".85rem" }}>
                <i className="bi bi-heart-pulse me-1 text-success"></i>Health Notes
              </h6>
              <ul className="list-unstyled mb-0">
                {data.health_notes.map((note, i) => (
                  <li key={i} className="d-flex align-items-start gap-2 mb-1" style={{ fontSize: ".88rem" }}>
                    <i className="bi bi-check-circle-fill text-success mt-1 flex-shrink-0" style={{ fontSize: ".75rem" }}></i>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.allergens?.length > 0 && (
            <div>
              <h6 className="fw-bold mb-2" style={{ fontSize: ".85rem" }}>
                <i className="bi bi-exclamation-triangle me-1 text-warning"></i>Allergens
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {data.allergens.map((a, i) => (
                  <span key={i} className="badge rounded-pill bg-warning text-dark">{a}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
