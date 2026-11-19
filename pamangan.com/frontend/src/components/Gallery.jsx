import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";

export default function Gallery({ images }) {
  const [index, setIndex] = useState(null);
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d) => setIndex((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  return (
    <>
      <div className="gallery-grid">
        {images.map((img, i) => (
          <button
            type="button"
            key={img.src}
            className="gallery-item"
            onClick={() => setIndex(i)}
            aria-label={`View photo: ${img.alt}`}
          >
            <img src={img.src} alt={img.alt} loading="lazy" />
          </button>
        ))}
      </div>

      {open &&
        ReactDOM.createPortal(
          <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={close}>
            <img src={images[index].src} alt={images[index].alt} onClick={(e) => e.stopPropagation()} />
            <button type="button" className="lightbox-btn lightbox-close" onClick={close} aria-label="Close">
              <i className="bi bi-x-lg"></i>
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="lightbox-btn lightbox-prev"
                  onClick={(e) => { e.stopPropagation(); step(-1); }}
                  aria-label="Previous photo"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <button
                  type="button"
                  className="lightbox-btn lightbox-next"
                  onClick={(e) => { e.stopPropagation(); step(1); }}
                  aria-label="Next photo"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
