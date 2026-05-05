import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminApiService } from "../services/api";
import Modal from "../components/Modal";
import AdminLayout from "./AdminLayout";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const emptyForm = {
  name: "", description: "", cuisine: "", cooking_time: "",
  prep_time: "", servings: 4, difficulty: "Medium",
  ingredients: "", instructions: "", tags: "", substitutions: "",
  image_url: "",
};

function recipeToForm(r) {
  return {
    name: r.name || "",
    description: r.description || "",
    cuisine: r.cuisine || "",
    cooking_time: r.cooking_time || "",
    prep_time: r.prep_time || "",
    servings: r.servings || 4,
    difficulty: r.difficulty || "Medium",
    ingredients: (r.ingredients || [])
      .map((i) => i.quantity ? `${i.quantity} ${i.item}` : i.item)
      .join("\n"),
    instructions: (r.instructions || []).join("\n"),
    tags: (r.tags || []).join(", "),
    substitutions: (r.substitutions || []).join("\n"),
    image_url: r.image_url || "",
  };
}

function buildPayload(form) {
  return {
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
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("recipes");
  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [refreshingImage, setRefreshingImage] = useState(null);
  const [imageModal, setImageModal] = useState(null);
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
      const data = res?.data ?? res;
      setRecipes(data?.recipes ?? []);
      setTotal(data?.total ?? 0);
      setPages(data?.pages ?? 1);
    } catch (err) {
      if (err?.message?.includes("Token")) {
        logout();
      } else {
        setError(err?.message || "Unknown error");
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

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (r) => {
    setEditId(r.id);
    setForm(recipeToForm(r));
    setFormError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const handleRefreshImage = async (id) => {
    setRefreshingImage(id);
    setError("");
    try {
      const res = await adminApiService.refreshImage(id);
      const url = res?.data?.image_url ?? res?.image_url;
      if (url) {
        setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, image_url: url } : r)));
      }
    } catch (err) {
      setError("Image refresh failed: " + err.message);
    } finally {
      setRefreshingImage(null);
    }
  };

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setFormError("");
    try {
      const res = await adminApiService.uploadImage(file);
      const url = res?.url ?? res?.data?.url;
      setForm((f) => ({ ...f, image_url: url }));
    } catch (err) {
      setFormError("Image upload failed: " + (err?.message || "unknown error"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const payload = buildPayload(form);
      if (editId) {
        await adminApiService.updateRecipe(editId, payload);
      } else {
        await adminApiService.createRecipe(payload);
      }
      closeForm();
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={(section) => { setActiveSection(section); setShowForm(false); setError(""); }}
      onLogout={logout}
    >
      {error && <div className="alert alert-danger">{error}</div>}

      {/* ── Overview ── */}
      {activeSection === "overview" && (
        <div>
          <h5 className="fw-bold mb-1">Dashboard</h5>
          <p className="text-secondary mb-4" style={{ fontSize: ".9rem" }}>Welcome back, here's a summary.</p>

          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm rounded-3 p-4 h-100">
                <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--ph-blue)", lineHeight: 1 }}>
                  {loading ? "—" : total}
                </div>
                <div className="text-secondary mt-1" style={{ fontSize: ".85rem" }}>Total Recipes</div>
                <i className="bi bi-journal-richtext mt-2" style={{ fontSize: "1.4rem", color: "var(--ph-blue-light)" }}></i>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm rounded-3 p-4 h-100">
                <div style={{ fontSize: "2rem", fontWeight: 700, color: "#16a34a", lineHeight: 1 }}>
                  {loading ? "—" : recipes.filter((r) => r.source === "ai").length}
                </div>
                <div className="text-secondary mt-1" style={{ fontSize: ".85rem" }}>AI Generated (this page)</div>
                <i className="bi bi-stars mt-2" style={{ fontSize: "1.4rem", color: "#d1fae5" }}></i>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary rounded-pill px-4"
            onClick={() => setActiveSection("recipes")}
          >
            <i className="bi bi-journal-richtext me-2"></i>Manage Recipes
          </button>
        </div>
      )}

      {/* ── Recipes ── */}
      {activeSection === "recipes" && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="fw-bold mb-0">Recipes</h5>
              <small className="text-secondary">{total} total</small>
            </div>
            <button
              className="btn btn-primary btn-sm rounded-pill px-3"
              onClick={showForm ? closeForm : openCreate}
            >
              <i className="bi bi-plus-lg me-1"></i>{showForm ? "Cancel" : "Add Recipe"}
            </button>
          </div>

          {/* Create / Edit Form */}
          {showForm && (
            <div className="card border-0 shadow-sm rounded-3 p-4 mb-4">
              <h6 className="fw-bold mb-3">{editId ? "Edit Recipe" : "Create Recipe Manually"}</h6>
              {formError && <div className="alert alert-danger py-2">{formError}</div>}
              <form onSubmit={handleSubmit}>
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

                  {/* Image */}
                  <div className="col-12">
                    <label className="form-label fw-medium">Recipe Image</label>
                    <div className="d-flex gap-3 align-items-start flex-wrap">
                      {form.image_url && (
                        <div className="position-relative" style={{ width: 140 }}>
                          <img
                            src={form.image_url}
                            alt="preview"
                            className="rounded-3 border"
                            style={{ width: 140, height: 100, objectFit: "cover" }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle p-0"
                            style={{ width: 22, height: 22, fontSize: ".7rem", lineHeight: 1 }}
                            onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
                          >×</button>
                        </div>
                      )}
                      <div className="flex-grow-1">
                        <label className="btn btn-outline-primary btn-sm rounded-pill px-3 me-2" style={{ cursor: "pointer" }}>
                          <i className="bi bi-upload me-1"></i>
                          {uploading ? "Uploading…" : "Upload from computer"}
                          <input
                            type="file"
                            accept="image/*"
                            className="d-none"
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                        </label>
                        <small className="text-secondary d-block mt-2">JPG, PNG, WEBP — max 32MB</small>
                        <input
                          className="form-control form-control-sm mt-2"
                          name="image_url"
                          value={form.image_url}
                          onChange={handleFormChange}
                          placeholder="Or paste an image URL"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 d-flex gap-2">
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={saving}>
                    {saving ? "Saving…" : editId ? "Save Changes" : "Create Recipe"}
                  </button>
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={closeForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Recipe Table */}
          {loading ? (
            <div className="text-center py-5 text-secondary">Loading…</div>
          ) : (
            <>
              <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: 64 }}>Image</th>
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
                          <td>
                            {r.image_url ? (
                              <img
                                src={r.image_url}
                                alt={r.name}
                                onClick={() => setImageModal({ url: r.image_url, name: r.name })}
                                style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 4, cursor: "zoom-in" }}
                              />
                            ) : (
                              <div style={{ width: 56, height: 40, background: "#f3f4f6", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <i className="bi bi-image text-secondary" style={{ fontSize: ".9rem" }}></i>
                              </div>
                            )}
                          </td>
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
                                <button className="btn btn-danger btn-sm rounded-pill px-2" onClick={() => handleDelete(r.id)}>Confirm</button>
                                <button className="btn btn-outline-secondary btn-sm rounded-pill px-2" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                              </div>
                            ) : (
                              <div className="d-flex gap-1">
                                <button className="btn btn-outline-primary btn-sm rounded-pill px-2" onClick={() => openEdit(r)}>
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-outline-secondary btn-sm rounded-pill px-2"
                                  onClick={() => handleRefreshImage(r.id)}
                                  disabled={refreshingImage === r.id}
                                  title="Refresh image"
                                >
                                  {refreshingImage === r.id
                                    ? <span className="spinner-border spinner-border-sm" style={{ width: ".75rem", height: ".75rem" }}></span>
                                    : <i className="bi bi-arrow-clockwise"></i>
                                  }
                                </button>
                                <button className="btn btn-outline-danger btn-sm rounded-pill px-2" onClick={() => setDeleteConfirm(r.id)}>
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

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
      )}

      {/* Image preview modal */}
      <Modal
        show={!!imageModal}
        onClose={() => setImageModal(null)}
        title={imageModal?.name}
      >
        <img
          src={imageModal?.url}
          alt={imageModal?.name}
          style={{ width: "100%", borderRadius: 8, objectFit: "contain", maxHeight: "70vh" }}
        />
      </Modal>
    </AdminLayout>
  );
}
