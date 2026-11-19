import React from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../data/business";

export default function MenuCard({ item, showOrder = true }) {
  return (
    <article className="menu-card">
      <div className="menu-card-img">
        {item.image ? (
          <img src={item.image} alt={item.name} loading="lazy" width="800" height="600" />
        ) : (
          <div className="menu-card-placeholder" role="img" aria-label={item.name}>
            <i className="bi bi-egg-fried"></i>
            <span>Photo coming soon</span>
          </div>
        )}
        {item.tags?.[0] && <span className="menu-tag">{item.tags[0]}</span>}
      </div>
      <div className="menu-card-body">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div>
            <h3>{item.name}</h3>
            {item.native !== item.name && (
              <div className="text-secondary" style={{ fontSize: ".82rem" }}>{item.native}</div>
            )}
          </div>
          <span className={`menu-price ${item.price == null ? "ask" : ""}`}>{formatPrice(item.price)}</span>
        </div>
        <div className="menu-serving mt-2">{item.serving}</div>
        <p className="menu-desc">{item.description}</p>
        {showOrder && (
          <Link
            to={`/order?item=${item.id}#order-form`}
            className="btn btn-ghost rounded-pill mt-auto align-self-start px-4"
          >
            <i className="bi bi-plus-lg me-2"></i>Add to order
          </Link>
        )}
      </div>
    </article>
  );
}
