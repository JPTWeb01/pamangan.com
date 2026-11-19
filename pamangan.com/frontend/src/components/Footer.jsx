import React from "react";
import { Link } from "react-router-dom";
import { BUSINESS, telLink, smsLink } from "../data/business";
import { Wordmark } from "./Navbar";

export default function Footer() {
  return (
    <footer className="biz-footer">
      <div className="container">
        <div className="row g-4 g-lg-5">
          <div className="col-lg-4 col-md-6">
            <Link to="/" aria-label={`${BUSINESS.name} home`}>
              <Wordmark />
            </Link>
            <p className="mt-3 mb-4" style={{ fontSize: ".92rem", maxWidth: 320 }}>
              Homemade Kapampangan food, cooked with love in Stittsville. Pre-order
              for pickup, with delivery to selected areas near Stittsville and Kanata.
            </p>
            <div className="d-flex gap-2">
              <a href={BUSINESS.facebookUrl} target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href={BUSINESS.messengerUrl} target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Messenger">
                <i className="bi bi-messenger"></i>
              </a>
              <a href={smsLink()} className="social-btn" aria-label="Send a text">
                <i className="bi bi-chat-dots"></i>
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6>Visit</h6>
            <ul className="list-unstyled d-grid gap-2" style={{ fontSize: ".92rem" }}>
              <li><Link to="/menu">Menu</Link></li>
              <li><Link to="/order">How to Order</Link></li>
              <li><Link to="/about">Our Story</Link></li>
              <li><Link to="/kitchen">Recipe Kitchen</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-3 col-6">
            <h6>Order</h6>
            <ul className="list-unstyled d-grid gap-2" style={{ fontSize: ".92rem" }}>
              <li><a href={telLink}><i className="bi bi-telephone me-2"></i>{BUSINESS.phoneDisplay}</a></li>
              <li><a href={BUSINESS.messengerUrl} target="_blank" rel="noopener noreferrer"><i className="bi bi-messenger me-2"></i>Messenger</a></li>
              <li><Link to="/order#order-form"><i className="bi bi-ui-checks me-2"></i>Order form</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6>Pickup &amp; Delivery</h6>
            <p className="mb-2" style={{ fontSize: ".92rem" }}>
              <i className="bi bi-geo-alt me-2"></i>Pickup in {BUSINESS.pickupArea}
            </p>
            <p className="mb-2" style={{ fontSize: ".92rem" }}>
              <i className="bi bi-truck me-2"></i>Delivery to selected areas near Stittsville &amp; Kanata (fee applies)
            </p>
            <p className="mb-0" style={{ fontSize: ".92rem" }}>
              <i className="bi bi-calendar-check me-2"></i>Pre-order only, by schedule
            </p>
          </div>
        </div>

        <hr style={{ borderColor: "rgba(255,255,255,.12)", margin: "2.5rem 0 1.5rem" }} />

        <div className="d-flex flex-column flex-md-row justify-content-between gap-2" style={{ fontSize: ".82rem", color: "rgba(255,255,255,.5)" }}>
          <span>© {new Date().getFullYear()} {BUSINESS.name} · Stittsville, Ontario</span>
          <span>Maraming salamat, mga ka-Pamangan!</span>
        </div>
      </div>
    </footer>
  );
}
