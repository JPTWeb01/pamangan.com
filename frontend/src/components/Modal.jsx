import React, { useEffect } from "react";
import ReactDOM from "react-dom";

export default function Modal({ show, onClose, title, children, footer, size = "md" }) {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [show]);

  if (!show) return null;

  const maxWidth = { sm: 480, md: 640, lg: 800, xl: 960 }[size] || 640;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-box-header">
          <h5>{title}</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          />
        </div>
        <div className="modal-box-body">{children}</div>
        {footer && <div className="modal-box-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
