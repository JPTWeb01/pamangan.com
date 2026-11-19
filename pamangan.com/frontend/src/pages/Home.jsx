import React from "react";
import { Link } from "react-router-dom";
import MenuCard from "../components/MenuCard";
import Gallery from "../components/Gallery";
import HeroFlag, { sunRays } from "../components/HeroFlag";
import { BUSINESS, ACTIVE_MENU, STEPS, TESTIMONIAL, GALLERY, telLink } from "../data/business";

export default function Home() {
  const featured = ACTIVE_MENU.filter((m) => m.image).slice(0, 3);

  return (
    <>
      {/* ── Hero ── */}
      <section className="biz-hero">
        <HeroFlag />
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="eyebrow mb-3 hero-anim" style={{ "--d": ".05s" }}>Homemade in Stittsville</span>
              <h1 className="mb-4">
                <span className="hero-line hero-anim" style={{ "--d": ".15s" }}>
                  <span className="font-script">Taste the heart</span>
                </span>
                <span className="hero-line hero-anim" style={{ "--d": ".3s" }}>of Pampanga.</span>
              </h1>
              <p className="biz-lead mb-4 hero-anim" style={{ "--d": ".45s" }}>
                Authentic Kapampangan sisig, black kutsinta, sushi bake and more —
                cooked fresh in small batches and ready for pickup in Stittsville.
              </p>
              <div className="d-flex flex-wrap gap-3 mb-4 hero-anim hero-cta" style={{ "--d": ".6s" }}>
                <Link to="/order" className="btn btn-maroon btn-lg rounded-pill px-4">
                  <i className="bi bi-bag-heart me-2"></i>Pre-order Now
                </Link>
                <Link to="/menu" className="btn btn-ghost btn-lg rounded-pill px-4">
                  View Menu
                </Link>
              </div>
              <div className="hero-points hero-anim" style={{ "--d": ".75s" }}>
                <span><i className="bi bi-check-circle-fill"></i>Made fresh to order</span>
                <span><i className="bi bi-check-circle-fill"></i>Pickup in Stittsville</span>
                <span><i className="bi bi-check-circle-fill"></i>Delivery near Kanata</span>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="biz-hero-img hero-anim hero-anim-img" style={{ "--d": ".2s" }}>
                <svg className="hero-sun" viewBox="0 0 240 240" aria-hidden="true" focusable="false">
                  <circle cx="120" cy="120" r="34" />
                  <path d={sunRays(120, 120, 42, 118)} />
                </svg>
                <img
                  src="/images/hero.jpg"
                  alt="Pamangan trays of black kutsinta, sushi bake, Kapampangan sisig and chicken roll"
                  width="900"
                  height="666"
                  fetchpriority="high"
                />
                <div className="hero-badge">
                  <i className="bi bi-heart-fill"></i>
                  <div style={{ fontSize: ".85rem", lineHeight: 1.3 }}>
                    <strong>Lutong bahay</strong>
                    <div className="text-secondary">Home-cooked Kapampangan recipes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Best sellers ── */}
      <section className="biz-section alt">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-5">
            <div>
              <span className="eyebrow mb-2">Our best sellers</span>
              <h2 className="biz-title mb-0">Favourites from our kitchen</h2>
            </div>
            <Link to="/menu" className="btn btn-ghost rounded-pill px-4 align-self-start align-self-md-auto">
              Full menu <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>
          <div className="row g-4">
            {featured.map((item) => (
              <div className="col-md-6 col-lg-4" key={item.id}>
                <MenuCard item={item} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="biz-section">
        <div className="container">
          <div className="text-center mb-5">
            <span className="eyebrow mb-2">How it works</span>
            <h2 className="biz-title">Ordering is easy</h2>
            <p className="biz-lead mx-auto">
              We cook on scheduled days, so every tray is fresh. Just pre-order before the cut-off.
            </p>
          </div>
          <div className="row g-4">
            {STEPS.map((s, i) => (
              <div className="col-md-4" key={s.title}>
                <div className="step-card">
                  <span className="step-num" aria-hidden="true">{i + 1}</span>
                  <div className="step-icon"><i className={`bi ${s.icon}`}></i></div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-5">
            <Link to="/order" className="btn btn-maroon btn-lg rounded-pill px-5">
              Start your order
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="biz-section deep">
        <div className="container">
          <div className="quote-card">
            <div className="row g-4 align-items-center">
              <div className="col-lg-8">
                <span className="eyebrow mb-3" style={{ color: "var(--gold)" }}>What our customers say</span>
                <p className="quote-original mb-3">“{TESTIMONIAL.original}”</p>
                <p className="quote-translation mb-3">
                  <i className="bi bi-translate me-2"></i>{TESTIMONIAL.translation}
                </p>
                <div style={{ fontWeight: 600 }}>— {TESTIMONIAL.author}</div>
              </div>
              <div className="col-lg-4 d-none d-lg-block">
                <img
                  src="/images/gallery/5.jpg"
                  alt="A family enjoying Pamangan food at the dinner table"
                  loading="lazy"
                  className="w-100"
                  style={{ borderRadius: 20, position: "relative", zIndex: 1 }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="biz-section alt">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-5">
            <div>
              <span className="eyebrow mb-2">Mga ka-Pamangan</span>
              <h2 className="biz-title mb-0">Made with love, served with pride</h2>
            </div>
            <a
              href={BUSINESS.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost rounded-pill px-4 align-self-start align-self-md-auto"
            >
              <i className="bi bi-facebook me-2"></i>Follow us
            </a>
          </div>
          <Gallery images={GALLERY.slice(0, 9)} />
        </div>
      </section>

      {/* ── Recipe Kitchen teaser ── */}
      <section className="biz-section">
        <div className="container">
          <div className="kitchen-teaser">
            <div className="row g-4 align-items-center">
              <div className="col-lg-8">
                <span className="badge-ai mb-3"><i className="bi bi-stars"></i>Pamangan Recipe Kitchen</span>
                <h2 className="text-white mb-3" style={{ fontSize: "clamp(1.6rem,3.4vw,2.3rem)" }}>
                  Want to cook Filipino at home?
                </h2>
                <p className="mb-0" style={{ color: "rgba(255,255,255,.78)", maxWidth: 560 }}>
                  Browse our free recipe library or generate any recipe instantly with AI —
                  complete with grocery lists, nutrition info and the story behind each dish.
                </p>
              </div>
              <div className="col-lg-4 text-lg-end">
                <Link to="/kitchen" className="btn btn-gold btn-lg rounded-pill px-4">
                  <i className="bi bi-stars me-2"></i>Try the Recipe Kitchen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="biz-section deep text-center">
        <div className="container">
          <h2 className="biz-title mb-3">
            Hungry? <span className="font-script" style={{ color: "var(--maroon)" }}>Mangan tana abe!</span>
          </h2>
          <p className="biz-lead mx-auto mb-4">
            Send us your order through the form, Messenger, or a quick text to <span className="text-nowrap">{BUSINESS.phoneDisplay}</span>.
          </p>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <Link to="/order" className="btn btn-maroon btn-lg rounded-pill px-4">
              <i className="bi bi-bag-heart me-2"></i>Order Now
            </Link>
            <a href={telLink} className="btn btn-ghost btn-lg rounded-pill px-4">
              <i className="bi bi-telephone me-2"></i>{BUSINESS.phoneDisplay}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
