import React, { useCallback, useEffect, useState } from "react";
import { adminApiService } from "../services/api";

export const REQUEST_STATUSES = [
  { key: "new", label: "New", icon: "bi-envelope-heart", color: "#7B1E22", bg: "#F7E9E4" },
  { key: "considering", label: "Considering", icon: "bi-hourglass-split", color: "#8a5a00", bg: "#FDF3D8" },
  { key: "added", label: "Added to menu", icon: "bi-check-circle", color: "#166534", bg: "#DCFCE7" },
  { key: "declined", label: "Declined", icon: "bi-x-circle", color: "#57534e", bg: "#F1F0EE" },
];
const STATUS_BY_KEY = Object.fromEntries(REQUEST_STATUSES.map((s) => [s.key, s]));

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
};

// Admin view of "Request a dish" submissions from the Menu page.
export default function AdminMenuRequests({ onCountsChange, onAuthError }) {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApiService.listMenuRequests({ page, limit: 20, ...(filter ? { status: filter } : {}) });
      const d = res?.data ?? res;
      setData(d);
      onCountsChange?.(d?.counts);
    } catch (err) {
      if (err?.message?.includes("Token")) onAuthError?.();
      else setError(err?.message || "Could not load requests");
    } finally {
      setLoading(false);
    }
  }, [page, filter, onCountsChange, onAuthError]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id, status) => {
    setBusyId(id);
    setError("");
    try {
      await adminApiService.updateMenuRequest(id, status);
      await load();
    } catch (err) {
      setError(err?.message || "Could not update the request");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    setBusyId(id);
    setError("");
    try {
      await adminApiService.deleteMenuRequest(id);
      setConfirmId(null);
      if (data?.requests?.length === 1 && page > 1) setPage((p) => p - 1);
      else await load();
    } catch (err) {
      setError(err?.message || "Could not delete the request");
    } finally {
      setBusyId(null);
    }
  };

  const counts = data?.counts || {};
  const all = Object.values(counts).reduce((a, b) => a + b, 0);
  const requests = data?.requests || [];

  return (
    <div className="admin-requests">
      <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
        <div>
          <h5 className="fw-bold mb-0">Menu Requests</h5>
          <p className="text-secondary mb-0" style={{ fontSize: ".88rem" }}>
            Dishes visitors asked for on the Menu page.
          </p>
        </div>
        <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={load} disabled={loading}>
          <i className="bi bi-arrow-clockwise me-1"></i>Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {/* Most requested */}
      {data?.top?.length > 0 && (
        <div className="card border-0 shadow-sm rounded-3 p-3 mb-3">
          <div className="fw-semibold mb-2" style={{ fontSize: ".9rem" }}>
            <i className="bi bi-fire me-1" style={{ color: "var(--ph-red)" }}></i>Most requested
          </div>
          <div className="d-flex flex-wrap gap-2">
            {data.top.map((t) => (
              <span key={t.dish} className="req-top-chip">
                {t.dish} <strong>×{t.count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="req-filters mb-3" role="tablist" aria-label="Filter by status">
        <button
          type="button"
          role="tab"
          aria-selected={filter === ""}
          className={`req-filter${filter === "" ? " active" : ""}`}
          onClick={() => { setFilter(""); setPage(1); }}
        >
          All <span>{all}</span>
        </button>
        {REQUEST_STATUSES.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={filter === s.key}
            className={`req-filter${filter === s.key ? " active" : ""}`}
            onClick={() => { setFilter(s.key); setPage(1); }}
          >
            {s.label} <span>{counts[s.key] ?? 0}</span>
          </button>
        ))}
      </div>

      {loading && !data ? (
        <div className="text-center py-5 text-secondary">
          <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>Loading requests…
        </div>
      ) : requests.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-3 p-5 text-center text-secondary">
          <i className="bi bi-inbox mb-2" style={{ fontSize: "2rem" }}></i>
          <div>{filter ? "No requests with this status." : "No dish requests yet."}</div>
        </div>
      ) : (
        <div className={`d-grid gap-3${loading ? " opacity-75" : ""}`}>
          {requests.map((r) => {
            const st = STATUS_BY_KEY[r.status] || STATUS_BY_KEY.new;
            const busy = busyId === r.id;
            return (
              <article key={r.id} className="card border-0 shadow-sm rounded-3 p-3 req-card">
                <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                  <div className="min-w-0">
                    <h6 className="fw-bold mb-1 text-break">{r.dish}</h6>
                    <div className="text-secondary small">
                      <i className="bi bi-person me-1"></i>{r.name}
                      {r.contact && (
                        <span className="ms-2 text-break"><i className="bi bi-telephone me-1"></i>{r.contact}</span>
                      )}
                    </div>
                  </div>
                  <span className="req-status" style={{ color: st.color, background: st.bg }}>
                    <i className={`bi ${st.icon} me-1`}></i>{st.label}
                  </span>
                </div>

                {r.message && <p className="req-message mb-0 mt-2">{r.message}</p>}

                <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mt-3">
                  <small className="text-secondary">{formatDate(r.created_at)}</small>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <label className="visually-hidden" htmlFor={`st-${r.id}`}>Status for {r.dish}</label>
                    <select
                      id={`st-${r.id}`}
                      className="form-select form-select-sm rounded-pill"
                      style={{ width: "auto" }}
                      value={r.status}
                      disabled={busy}
                      onChange={(e) => changeStatus(r.id, e.target.value)}
                    >
                      {REQUEST_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                    {confirmId === r.id ? (
                      <>
                        <button type="button" className="btn btn-danger btn-sm rounded-pill" disabled={busy} onClick={() => remove(r.id)}>
                          {busy ? "Deleting…" : "Delete"}
                        </button>
                        <button type="button" className="btn btn-light btn-sm rounded-pill" disabled={busy} onClick={() => setConfirmId(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm rounded-pill"
                        disabled={busy}
                        onClick={() => setConfirmId(r.id)}
                        aria-label={`Delete request for ${r.dish}`}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {data?.pages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
          <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-3" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
            <i className="bi bi-chevron-left"></i> Prev
          </button>
          <span className="small text-secondary">Page {data.page} of {data.pages}</span>
          <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-3" disabled={page >= data.pages || loading} onClick={() => setPage((p) => p + 1)}>
            Next <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}
