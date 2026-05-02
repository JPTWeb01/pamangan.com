import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApiService } from "../services/api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await adminApiService.login(username, password);
      localStorage.setItem("adminToken", res.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
      <div className="card border-0 shadow-sm rounded-3 p-4" style={{ width: "100%", maxWidth: 400 }}>
        <div className="text-center mb-4">
          <h4 className="fw-bold">Admin Login</h4>
          <p className="text-secondary" style={{ fontSize: ".9rem" }}>pamangan.com</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2" style={{ fontSize: ".9rem" }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-medium">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-medium">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 rounded-pill fw-semibold"
            disabled={loading}
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
