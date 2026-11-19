import React from "react";
import { Link } from "react-router-dom";
import Gallery from "../components/Gallery";
import { BUSINESS, GALLERY } from "../data/business";

const VALUES = [
  { icon: "bi-house-heart", title: "Lutong bahay", desc: "Home-style cooking, the way it's made in Kapampangan kitchens — no shortcuts." },
  { icon: "bi-basket", title: "Fresh, small batches", desc: "We cook by schedule so every tray goes out fresh, never sitting around." },
  { icon: "bi-people", title: "Community first", desc: "From our family to yours — bringing Filipino families and neighbours together around good food." },
];

export default function About() {
  return (
    <>
      <header className="page-head">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <span className="eyebrow mb-2">Our story</span>
              <h1 className="mb-3">
                A taste of Pampanga, <span className="font-script" style={{ color: "var(--maroon)" }}>right here in Stittsville</span>
              </h1>
              <p className="biz-lead">
                <strong style={{ color: "var(--ink)" }}>Pamangan</strong> means “food” in Kapampangan —
                the language of Pampanga, known as the culinary capital of the Philippines.
              </p>
              <p className="biz-lead">
                We started Pamangan to share the dishes we grew up with: sizzling sisig, chewy black
                kutsinta, and the comforting flavours of a Kapampangan family table. Every tray is
                cooked at home in Stittsville, in small batches, with the same care we'd give our own family.
              </p>
              <p className="biz-lead mb-4">
                Whether you're Kapampangan and missing home, or trying Filipino food for the first time —
                welcome, ka-Pamangan. Kain na!
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/menu" className="btn btn-maroon rounded-pill px-4">See the menu</Link>
                <a href={BUSINESS.facebookUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost rounded-pill px-4">
                  <i className="bi bi-facebook me-2"></i>Follow on Facebook
                </a>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="biz-hero-img">
                <img src="/images/gallery/5.jpg" alt="Friends and family sharing a Pamangan meal" width="900" height="900" style={{ aspectRatio: "1 / 1" }} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="biz-section">
        <div className="container">
          <div className="row g-4">
            {VALUES.map((v) => (
              <div className="col-md-4" key={v.title}>
                <div className="info-tile">
                  <div className="ico"><i className={`bi ${v.icon}`}></i></div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="biz-section alt">
        <div className="container">
          <div className="text-center mb-5">
            <span className="eyebrow mb-2">From our kitchen</span>
            <h2 className="biz-title">Thank you, mga ka-Pamangan</h2>
            <p className="biz-lead mx-auto">
              Every order means the world to our small business. Maraming salamat for your support!
            </p>
          </div>
          <Gallery images={GALLERY} />
        </div>
      </section>
    </>
  );
}
