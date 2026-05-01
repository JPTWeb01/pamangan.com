import React, { useState } from "react";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";
import { aiApi } from "../services/api";

export default function GroceryModal({ show, onClose, recipeIds, recipeNames }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!recipeIds?.length) return;
    setLoading(true);
    setError("");
    try {
      const res = await aiApi.grocery(recipeIds);
      setData(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (!data && !loading) generate();
  };

  React.useEffect(() => {
    if (show) handleOpen();
    else setData(null);
  }, [show]); // eslint-disable-line

  const grouped = data?.grouped || {};
  const sections = Object.entries(grouped).filter(([, items]) => items?.length);

  const handlePrint = () => window.print();

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={
        <span>
          <i className="bi bi-cart3 me-2 text-primary"></i>Grocery List
          {recipeNames?.length > 0 && (
            <small className="text-secondary ms-2 fw-normal" style={{ fontSize: ".8rem" }}>
              from {recipeNames.join(", ")}
            </small>
          )}
        </span>
      }
      footer={
        data && (
          <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={handlePrint}>
            <i className="bi bi-printer me-1"></i>Print
          </button>
        )
      }
    >
      {loading && <LoadingSpinner message="Generating grocery list with AI…" />}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-circle"></i>
          {error}
          <button className="btn btn-sm btn-outline-danger ms-auto rounded-pill" onClick={generate}>
            Retry
          </button>
        </div>
      )}
      {data && (
        <>
          <p className="text-secondary small mb-3">
            <i className="bi bi-check2-circle me-1 text-success"></i>
            {data.total_items} items across {sections.length} categories
          </p>

          {sections.map(([section, items]) => (
            <div key={section} className="mb-4">
              <h6
                className="text-uppercase fw-bold mb-2"
                style={{ fontSize: ".75rem", letterSpacing: ".5px", color: "var(--ph-blue)" }}
              >
                <i className="bi bi-tag me-1"></i>{section}
              </h6>
              <ul className="list-unstyled mb-0">
                {items.map((item, i) => (
                  <li
                    key={i}
                    className="d-flex align-items-center gap-2 py-2 border-bottom"
                    style={{ fontSize: ".9rem" }}
                  >
                    <input type="checkbox" className="form-check-input mt-0 flex-shrink-0" />
                    <span className="flex-grow-1">{item.item}</span>
                    <span className="text-secondary small fw-medium">{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </Modal>
  );
}
