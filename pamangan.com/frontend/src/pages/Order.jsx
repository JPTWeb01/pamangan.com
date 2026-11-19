import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BUSINESS, ACTIVE_MENU, STEPS, formatPrice, smsLink, telLink } from "../data/business";

const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true, () => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// One order line per size: items with a half option get a second line at half the price
const ORDER_LINES = ACTIVE_MENU.flatMap((m) => {
  const whole = { ...m, key: m.id, label: m.name };
  if (!m.half) return [whole];
  return [
    whole,
    {
      ...m,
      key: `${m.id}-half`,
      label: `${m.name} (half)`,
      price: m.price == null ? null : m.price / 2,
      serving: m.half.serving,
      isHalf: true,
    },
  ];
});

export default function Order() {
  const [params] = useSearchParams();
  const preselect = params.get("item");

  const [qty, setQty] = useState(() =>
    Object.fromEntries(ORDER_LINES.map((m) => [m.key, m.key === preselect ? 1 : 0]))
  );
  const [form, setForm] = useState({
    name: "",
    phone: "",
    method: "pickup",
    address: "",
    date: "",
    notes: "",
  });
  const [touched, setTouched] = useState(false);
  const [copied, setCopied] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const bump = (id, d) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(20, q[id] + d)) }));

  const chosen = ORDER_LINES.filter((m) => qty[m.key] > 0);
  const knownTotal = chosen.reduce((sum, m) => sum + (m.price ?? 0) * qty[m.key], 0);
  const hasUnpriced = chosen.some((m) => m.price == null);

  const errors = {
    items: chosen.length === 0 ? "Please add at least one item." : "",
    name: form.name.trim() ? "" : "Please enter your name.",
    phone: form.phone.replace(/\D/g, "").length >= 10 ? "" : "Please enter a valid phone number.",
    address: form.method === "delivery" && !form.address.trim() ? "Please enter your delivery address or area." : "",
  };
  const valid = !Object.values(errors).some(Boolean);

  const message = useMemo(() => {
    const lines = [`Hi Pamangan! I'd like to place a pre-order:`, ""];
    chosen.forEach((m) => {
      const line = m.price != null ? ` — $${m.price * qty[m.key]}` : "";
      const note = m.festive ? " (December)" : "";
      lines.push(`• ${qty[m.key]} × ${m.label}${note}${line}`);
    });
    if (chosen.length) {
      lines.push("");
      lines.push(
        hasUnpriced
          ? `Estimated total: $${knownTotal} + items to confirm`
          : `Estimated total: $${knownTotal}`
      );
    }
    lines.push("");
    lines.push(`Name: ${form.name.trim()}`);
    lines.push(`Phone: ${form.phone.trim()}`);
    lines.push(`Method: ${form.method === "pickup" ? "Pickup in Stittsville" : "Delivery"}`);
    if (form.method === "delivery") lines.push(`Delivery address: ${form.address.trim()}`);
    if (form.date) lines.push(`Preferred date: ${form.date}`);
    if (form.notes.trim()) lines.push(`Notes: ${form.notes.trim()}`);
    return lines.join("\n");
  }, [chosen, qty, form, knownTotal, hasUnpriced]);

  // Returns true if the order may be sent; otherwise reveals the errors.
  const guard = (e) => {
    setTouched(true);
    if (!valid) {
      e.preventDefault();
      const first = document.querySelector(".is-invalid, .items-error");
      if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  };

  const onMessenger = (e) => {
    if (!guard(e)) return;
    copyText(message).then((ok) => setCopied(ok ? "messenger" : "failed"));
  };

  const onCopy = (e) => {
    if (!guard(e)) return;
    copyText(message).then((ok) => setCopied(ok ? "copy" : "failed"));
  };

  const err = (k) => touched && errors[k];

  return (
    <>
      <header className="page-head">
        <div className="container">
          <span className="eyebrow mb-2">How to order</span>
          <h1 className="mb-3">Pre-order your Pamangan favourites</h1>
          <p className="biz-lead mb-0">
            We cook by schedule, so pre-orders help us prepare everything fresh.
            Order with the form below, on Messenger, or by text — whatever is easiest for you.
          </p>
        </div>
      </header>

      {/* Ways to order */}
      <section className="pb-4">
        <div className="container">
          <div className="row g-3">
            <div className="col-md-4">
              <a href="#order-form" className="info-tile d-block text-decoration-none">
                <div className="ico"><i className="bi bi-ui-checks"></i></div>
                <h3 style={{ color: "var(--ink)" }}>Order form</h3>
                <p>Pick your trays below and we'll prepare the message for you.</p>
              </a>
            </div>
            <div className="col-md-4">
              <a href={BUSINESS.messengerUrl} target="_blank" rel="noopener noreferrer" className="info-tile d-block text-decoration-none">
                <div className="ico"><i className="bi bi-messenger"></i></div>
                <h3 style={{ color: "var(--ink)" }}>Facebook Messenger</h3>
                <p>Message our Pamangan page directly.</p>
              </a>
            </div>
            <div className="col-md-4">
              <a href={smsLink()} className="info-tile d-block text-decoration-none">
                <div className="ico"><i className="bi bi-chat-dots"></i></div>
                <h3 style={{ color: "var(--ink)" }}>Call or text</h3>
                <p>{BUSINESS.phoneDisplay}</p>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="biz-section pt-4" id="order-form">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-7">
              <form className="order-panel" noValidate onSubmit={(e) => e.preventDefault()}>
                <h2 className="biz-title mb-1" style={{ fontSize: "1.6rem" }}>Order form</h2>
                <p className="text-secondary mb-4" style={{ fontSize: ".92rem" }}>
                  Choose your trays, add your details, then send it to us by text or Messenger.
                </p>

                <fieldset className="mb-4">
                  <legend className="form-label mb-1">1. Choose your trays</legend>
                  {ORDER_LINES.map((m) => (
                    <div className={`qty-row${m.isHalf ? " is-half" : ""}`} key={m.key}>
                      {m.isHalf ? (
                        <span className="qty-thumb qty-half" aria-hidden="true">½</span>
                      ) : m.image ? (
                        <img className="qty-thumb" src={m.image} alt="" loading="lazy" />
                      ) : (
                        <span className={`qty-thumb${m.festive ? " festive" : ""}`}><i className={`bi ${m.icon || "bi-egg-fried"}`}></i></span>
                      )}
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="fw-semibold" style={{ color: "var(--ink)" }}>
                          {m.isHalf ? <>Half order <span className="visually-hidden">of {m.name}</span></> : m.name}
                        </div>
                        <div className="text-secondary text-truncate" style={{ fontSize: ".8rem" }}>
                          {formatPrice(m.price)} · {m.serving}
                        </div>
                      </div>
                      <div className="qty-ctrl" role="group" aria-label={`Quantity for ${m.label}`}>
                        <button type="button" onClick={() => bump(m.key, -1)} disabled={qty[m.key] === 0} aria-label={`Remove one ${m.label}`}>
                          <i className="bi bi-dash"></i>
                        </button>
                        <span aria-live="polite">{qty[m.key]}</span>
                        <button type="button" onClick={() => bump(m.key, 1)} disabled={qty[m.key] >= 20} aria-label={`Add one ${m.label}`}>
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                  {err("items") && <div className="text-danger small mt-2 items-error">{errors.items}</div>}
                </fieldset>

                <fieldset className="mb-4">
                  <legend className="form-label mb-2">2. Pickup or delivery</legend>
                  <div className="choice-group">
                    <label className={`choice ${form.method === "pickup" ? "active" : ""}`}>
                      <input type="radio" name="method" value="pickup" checked={form.method === "pickup"} onChange={set("method")} />
                      <span>
                        <strong>Pickup</strong>
                        <small>Stittsville — address shared on confirmation</small>
                      </span>
                    </label>
                    <label className={`choice ${form.method === "delivery" ? "active" : ""}`}>
                      <input type="radio" name="method" value="delivery" checked={form.method === "delivery"} onChange={set("method")} />
                      <span>
                        <strong>Delivery</strong>
                        <small>Selected areas near Stittsville &amp; Kanata · fee applies</small>
                      </span>
                    </label>
                  </div>
                  {form.method === "delivery" && (
                    <div className="mt-3">
                      <label className="form-label" htmlFor="address">Delivery address or area</label>
                      <input
                        id="address"
                        className={`form-control ${err("address") ? "is-invalid" : ""}`}
                        value={form.address}
                        onChange={set("address")}
                        placeholder="Street address, Kanata"
                        autoComplete="street-address"
                      />
                      {err("address") && <div className="invalid-feedback">{errors.address}</div>}
                    </div>
                  )}
                </fieldset>

                <fieldset>
                  <legend className="form-label mb-2">3. Your details</legend>
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <label className="form-label" htmlFor="name">Name</label>
                      <input
                        id="name"
                        className={`form-control ${err("name") ? "is-invalid" : ""}`}
                        value={form.name}
                        onChange={set("name")}
                        autoComplete="name"
                      />
                      {err("name") && <div className="invalid-feedback">{errors.name}</div>}
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label" htmlFor="phone">Phone</label>
                      <input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        className={`form-control ${err("phone") ? "is-invalid" : ""}`}
                        value={form.phone}
                        onChange={set("phone")}
                        placeholder="613-555-0123"
                        autoComplete="tel"
                      />
                      {err("phone") && <div className="invalid-feedback">{errors.phone}</div>}
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label" htmlFor="date">Preferred date <span className="text-secondary fw-normal">(optional)</span></label>
                      <input id="date" type="date" className="form-control" min={todayISO()} value={form.date} onChange={set("date")} />
                    </div>
                    <div className="col-12">
                      <label className="form-label" htmlFor="notes">Notes <span className="text-secondary fw-normal">(optional)</span></label>
                      <textarea
                        id="notes"
                        className="form-control"
                        rows={3}
                        value={form.notes}
                        onChange={set("notes")}
                        placeholder="Allergies, preferred pickup time, questions…"
                      />
                    </div>
                  </div>
                </fieldset>
              </form>
            </div>

            {/* Summary */}
            <div className="col-lg-5">
              <div className="order-aside">
                <div className="order-panel">
                  <h2 className="biz-title mb-3" style={{ fontSize: "1.4rem" }}>Your order</h2>
                  {chosen.length === 0 ? (
                    <p className="text-secondary mb-3" style={{ fontSize: ".92rem" }}>
                      No trays yet — use the <strong>+</strong> buttons to add items.
                    </p>
                  ) : (
                    <ul className="list-unstyled mb-3">
                      {chosen.map((m) => (
                        <li key={m.key} className="d-flex justify-content-between py-1" style={{ fontSize: ".95rem" }}>
                          <span>{qty[m.key]} × {m.label}</span>
                          <span className="fw-semibold">
                            {m.price != null ? `$${m.price * qty[m.key]}` : "TBC"}
                          </span>
                        </li>
                      ))}
                      <li className="d-flex justify-content-between pt-2 mt-2 border-top">
                        <span className="fw-bold">Estimated total</span>
                        <span className="fw-bold" style={{ color: "var(--maroon)" }}>
                          ${knownTotal}{hasUnpriced ? " + TBC" : ""}
                        </span>
                      </li>
                    </ul>
                  )}
                  {form.method === "delivery" && (
                    <p className="small text-secondary">A delivery fee will be added based on your location.</p>
                  )}

                  <label className="form-label small text-secondary mb-1" htmlFor="summary">Message preview</label>
                  <pre id="summary" className="summary-box mb-3">{message}</pre>

                  <div className="d-grid gap-2">
                    <a href={smsLink(message)} onClick={guard} className="btn btn-maroon btn-lg rounded-pill">
                      <i className="bi bi-chat-dots me-2"></i>Send by text
                    </a>
                    <a
                      href={BUSINESS.messengerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onMessenger}
                      className="btn btn-ghost btn-lg rounded-pill"
                    >
                      <i className="bi bi-messenger me-2"></i>Copy &amp; open Messenger
                    </a>
                    <button type="button" onClick={onCopy} className="btn btn-link text-secondary">
                      <i className="bi bi-clipboard me-1"></i>Copy order text
                    </button>
                  </div>

                  <div aria-live="polite">
                    {copied === "messenger" && (
                      <div className="alert alert-success small mt-3 mb-0">
                        Order copied! Paste it into the Messenger chat and hit send.
                      </div>
                    )}
                    {copied === "copy" && (
                      <div className="alert alert-success small mt-3 mb-0">Order copied to your clipboard.</div>
                    )}
                    {copied === "failed" && (
                      <div className="alert alert-warning small mt-3 mb-0">
                        Couldn't copy automatically — please select the message preview above and copy it.
                      </div>
                    )}
                  </div>

                  <p className="small text-secondary mt-3 mb-0">
                    Your order is confirmed once we reply. Questions? Call <a href={telLink}>{BUSINESS.phoneDisplay}</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps recap */}
      <section className="biz-section deep">
        <div className="container">
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
        </div>
      </section>
    </>
  );
}
