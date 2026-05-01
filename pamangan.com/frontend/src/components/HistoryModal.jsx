import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";
import { aiApi } from "../services/api";

export default function HistoryModal({ show, onClose, recipeId, recipeName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!recipeId) return;
    setLoading(true);
    setError("");
    try {
      const res = await aiApi.history(recipeId);
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

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={
        <span>
          <i className="bi bi-book me-2" style={{ color: "#7c3aed" }}></i>
          Food History — {recipeName}
        </span>
      }
      size="lg"
    >
      {loading && <LoadingSpinner message="Researching culinary history with AI…" />}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-circle"></i>{error}
          <button className="btn btn-sm btn-outline-danger ms-auto rounded-pill" onClick={load}>Retry</button>
        </div>
      )}
      {data && (
        <>
          {data.origin && (
            <div className="d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-geo-alt-fill text-primary"></i>
              <span className="fw-semibold">{data.origin}</span>
            </div>
          )}

          {data.history && (
            <div className="mb-4">
              {data.history.split("\n\n").map((para, i) => (
                <p key={i} style={{ fontSize: ".95rem", lineHeight: 1.75 }}>{para}</p>
              ))}
            </div>
          )}

          {data.cultural_significance && (
            <div
              className="p-3 rounded-3 mb-4"
              style={{ background: "var(--ph-blue-light)", borderLeft: "4px solid var(--ph-blue)" }}
            >
              <p className="mb-0" style={{ fontSize: ".9rem", fontStyle: "italic" }}>
                "{data.cultural_significance}"
              </p>
            </div>
          )}

          {data.regional_variations?.length > 0 && (
            <div className="mb-4">
              <h6 className="fw-bold mb-2" style={{ fontSize: ".9rem" }}>
                <i className="bi bi-map me-1 text-primary"></i>Regional Variations
              </h6>
              <ul className="mb-0" style={{ paddingLeft: "1.25rem" }}>
                {data.regional_variations.map((v, i) => (
                  <li key={i} style={{ fontSize: ".88rem", marginBottom: ".35rem" }}>{v}</li>
                ))}
              </ul>
            </div>
          )}

          {data.fun_facts?.length > 0 && (
            <div>
              <h6 className="fw-bold mb-2" style={{ fontSize: ".9rem" }}>
                <i className="bi bi-lightbulb me-1 text-warning"></i>Did You Know?
              </h6>
              <div className="d-flex flex-column gap-2">
                {data.fun_facts.map((fact, i) => (
                  <div
                    key={i}
                    className="d-flex gap-2 p-2 rounded-2"
                    style={{ background: "var(--surface)", fontSize: ".88rem" }}
                  >
                    <i className="bi bi-stars text-warning flex-shrink-0 mt-1" style={{ fontSize: ".8rem" }}></i>
                    {fact}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
