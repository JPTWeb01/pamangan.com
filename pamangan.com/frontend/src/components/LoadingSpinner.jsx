import React from "react";

export default function LoadingSpinner({ message = "Loading…", size = "normal" }) {
  return (
    <div className="spinner-wrapper">
      <div
        className="spinner-border"
        style={{ width: size === "sm" ? "1.5rem" : "2.5rem", height: size === "sm" ? "1.5rem" : "2.5rem" }}
        role="status"
      >
        <span className="visually-hidden">Loading</span>
      </div>
      {message && <span style={{ fontSize: ".9rem" }}>{message}</span>}
    </div>
  );
}
