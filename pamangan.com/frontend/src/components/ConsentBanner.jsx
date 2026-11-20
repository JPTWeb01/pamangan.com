import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { analyticsEnabled, getConsent, setConsent } from "../utils/analytics";

// Small, non-blocking cookie notice. Shown only when analytics is configured
// and the visitor hasn't chosen yet. "No thanks" is as easy as "Accept".
export default function ConsentBanner() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(() => analyticsEnabled() && !getConsent());

  if (!open || pathname.startsWith("/manage")) return null;

  const choose = (granted) => {
    setConsent(granted);
    setOpen(false);
  };

  return (
    <div className="consent-banner" role="dialog" aria-live="polite" aria-label="Cookie preferences">
      <p className="mb-0">
        <i className="bi bi-cookie me-2" aria-hidden="true"></i>
        We use Google Analytics cookies to see which dishes and recipes people like, so we can improve Pamangan.
        No ads, and we never sell your data.
      </p>
      <div className="consent-actions">
        <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => choose(false)}>
          No thanks
        </button>
        <button type="button" className="btn btn-sm btn-maroon rounded-pill px-3" onClick={() => choose(true)}>
          Accept
        </button>
      </div>
    </div>
  );
}
