import React, { useState } from "react";
import logo from "../assets/logo.png";

const NAV_ITEMS = [
  { key: "overview", label: "Dashboard", icon: "bi-speedometer2" },
  { key: "recipes",  label: "Recipes",   icon: "bi-journal-richtext" },
];

export default function AdminLayout({ activeSection, onSectionChange, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="admin-overlay d-lg-none" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Brand */}
        <div className="admin-brand">
          <img src={logo} alt="Pamangan" style={{ height: 38, width: "auto" }} />
          <div>
            <div className="admin-brand-name">Pamangan</div>
            <div className="admin-brand-sub">Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`admin-nav-item${activeSection === item.key ? " active" : ""}`}
              onClick={() => { onSectionChange(item.key); closeSidebar(); }}
            >
              <i className={`bi ${item.icon}`}></i>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={onLogout}>
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="admin-main">
        {/* Mobile top bar */}
        <div className="admin-topbar d-flex d-lg-none">
          <button
            className="admin-topbar-toggle"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
          >
            <i className={`bi ${sidebarOpen ? "bi-x" : "bi-list"}`}></i>
          </button>
          <span className="admin-topbar-title">Admin Panel</span>
        </div>

        {/* Page content */}
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}
