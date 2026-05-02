import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminApiService } from "../services/api";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const emptyForm = {
  name: "", description: "", cuisine: "", cooking_time: "",
  prep_time: "", servings: 4, difficulty: "Medium",
  ingredients: "", instructions: "", tags: "", substitutions: "",
};

export default function AdminDashboard() {
  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem("adminToken");
    navigate("/manage/login");
  }, [navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApiService.listRecipes(page, 20);
      console.log("listRecipes raw response:", JSON.stringify(res));
      const data = res?.data ?? res;
      setRecipes(data?.recipes ?? []);
      setTotal(data?.total ?? 0);
      setPages(data?.pages ?? 1);
    } catch (err) {
      if (err.message.includes("Token")) {
        logout();
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [page, logout]);

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      navigate("/manage/login");
      return;
    }
    load();
  }, [load, navigate]);

  const handleDelete = async (id) => {
    try {
      await adminApiService.deleteRecipe(id);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const data = {
        ...form,
        servings: parseInt(form.servings) || 4,
        ingredients: form.ingredients
          .split("\n")
          .filter(Boolean)
          .map((line) => {
            const [quantity, ...rest] = line.split(" ");
            return { item: rest.join(" ") || quantity, quantity: rest.length ? quantity : "", notes: null };
          }),
        instructions: form.instructions.split("\n").filter(Boolean),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        substitutions: form.substitutions.split("\n").filter(Boolean),
      };
      await adminApiService.createRecipe(data);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Admin Dashboard</h4>
          <small className="text-secondary">{total} recipes total</small>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary btn-sm rounded-pill px-3"
            onClick={() => { setShowForm(!showForm); setFormError(""); }}
          >
            <i className="bi bi-plus-lg me-1"></i>{showForm ? "Cancel" : "Add Recipe"}
          </button>
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={logout}>
            <i className="bi bi-box-arrow-right me-1"></i>Logout
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Create Recipe Form */}
      {showForm && (
        <div className="card border-0 shadow-sm rounded-3 p-4 mb-4">
          <h6 className="fw-bold mb-3">Create Recipe Manually</h6>
          {formError && <div className="alert alert-danger py-2">{formError}</div>}
          <form onSubmit={handleCreate}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Name *</label>
                <input className="form-control" name="name" value={form.name} onChange={handleFormChange} required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Cuisine</label>
                <input className="form-control" name="cuisine" value={form.cuisine} onChange={handleFormChange} placeholder="e.g. Filipino" />
              </div>
              <div className="col-md-3">
                <label className="form-label">Difficulty</label>
                <select className="form-select" name="difficulty" value={form.difficulty} onChange={handleFormChange}>
                  {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" rows={2} value={form.description} onChange={handleFormChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Cooking Time</label>
                <input className="form-control" name="cooking_time" value={form.cooking_time} onChange={handleFormChange} placeholder="e.g. 45 minutes" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Prep Time</label>
                <input className="form-control" name="prep_time" value={form.prep_time} onChange={handleFormChange} placeholder="e.g. 15 minutes" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Servings</label>
                <input className="form-control" type="number" name="servings" value={form.servings} onChange={handleFormChange} min={1} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Ingredients <small className="text-secondary">(one per line: "2 cups flour")</small></label>
                <textarea className="form-control" name="ingredients" rows={5} value={form.ingredients} onChange={handleFormChange} placeholder={"2 cups flour\n1 tsp salt\n3 cloves garlic"} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Instructions <small className="text-secondary">(one step per line)</small></label>
                <textarea className="form-control" name="instructions" rows={5} value={form.instructions} onChange={handleFormChange} placeholder={"Mix the flour and salt.\nAdd garlic and stir."} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Tags <small className="text-secondary">(comma-separated)</small></label>
                <input className="form-control" name="tags" value={form.tags} onChange={handleFormChange} placeholder="chicken, grilled, healthy" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Substitution Tips <small className="text-secondary">(one per line)</small></label>
                <textarea className="form-control" name="substitutions" rows={2} value={form.substitutions} onChange={handleFormChange} />
              </div>
            </div>
            <div className="mt-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={saving}>
                {saving ? "Saving…" : "Create Recipe"}
              </button>
              <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recipe List */}
      {loading ? (
        <div className="text-center py-5 text-secondary">Loading…</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Cuisine</th>
                  <th>Difficulty</th>
                  <th>Source</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((r) => (
                  <tr key={r.id}>
                    <td className="fw-medium">{r.name}</td>
                    <td>{r.cuisine}</td>
                    <td>{r.difficulty}</td>
                    <td>
                      <span className={`badge rounded-pill ${r.source === "ai" ? "bg-primary" : "bg-secondary"}`}>
                        {r.source}
                      </span>
                    </td>
                    <td style={{ fontSize: ".85rem", color: "var(--bs-secondary)" }}>
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      {deleteConfirm === r.id ? (
                        <div className="d-flex gap-1">
                          <button className="btn btn-danger btn-sm rounded-pill px-2" onClick={() => handleDelete(r.id)}>
                            Confirm
                          </button>
                          <button className="btn btn-outline-secondary btn-sm rounded-pill px-2" onClick={() => setDeleteConfirm(null)}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-outline-danger btn-sm rounded-pill px-2"
                          onClick={() => setDeleteConfirm(r.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-3">
              <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
              <span className="align-self-center text-secondary" style={{ fontSize: ".9rem" }}>
                Page {page} of {pages}
              </span>
              <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" disabled={page === pages} onClick={() => setPage(page + 1)}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
