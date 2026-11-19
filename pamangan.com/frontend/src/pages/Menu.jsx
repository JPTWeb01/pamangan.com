import React from "react";
import { Link } from "react-router-dom";
import MenuCard from "../components/MenuCard";
import { ACTIVE_MENU, BUSINESS } from "../data/business";

export default function Menu() {
  return (
    <>
      <header className="page-head">
        <div className="container">
          <span className="eyebrow mb-2">Our menu</span>
          <h1 className="mb-3">Kapampangan favourites, by the tray</h1>
          <p className="biz-lead mb-0">
            Everything is homemade and cooked fresh on our scheduled cook days. Pre-order
            for pickup in Stittsville, or ask about delivery near Stittsville and Kanata.
          </p>
        </div>
      </header>

      <section className="pb-5">
        <div className="container">
          <div className="row g-4">
            {ACTIVE_MENU.map((item) => (
              <div className="col-md-6 col-lg-4" key={item.id}>
                <MenuCard item={item} />
              </div>
            ))}
          </div>

          <div className="row g-4 mt-4">
            <div className="col-md-4">
              <div className="info-tile">
                <div className="ico"><i className="bi bi-calendar-check"></i></div>
                <h3>Pre-order only</h3>
                <p>We cook in batches on scheduled days. Watch our Facebook page for the next cook day and order cut-off.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="info-tile">
                <div className="ico"><i className="bi bi-geo-alt"></i></div>
                <h3>Pickup in Stittsville</h3>
                <p>We'll share the pickup address and time when we confirm your order.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="info-tile">
                <div className="ico"><i className="bi bi-truck"></i></div>
                <h3>Delivery available</h3>
                <p>To selected areas near Stittsville and Kanata. A delivery fee applies depending on location.</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-5 pt-2">
            <p className="text-secondary mb-3">
              Prices may change with ingredient costs — we'll always confirm your total before cooking.
            </p>
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              <Link to="/order" className="btn btn-maroon btn-lg rounded-pill px-5">
                <i className="bi bi-bag-heart me-2"></i>Start your order
              </Link>
              <a href={BUSINESS.messengerUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg rounded-pill px-4">
                <i className="bi bi-messenger me-2"></i>Ask a question
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
