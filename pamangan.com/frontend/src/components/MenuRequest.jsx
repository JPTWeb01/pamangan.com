import React, { useEffect, useMemo, useRef, useState } from "react";
import { BUSINESS } from "../data/business";
import { menuRequestApi } from "../services/api";
import { copyText } from "../utils/clipboard";

const LIMITS = { dish: 80, name: 60, contact: 80, message: 500 };
const EMPTY = { dish: "", name: "", contact: "", message: "" };

function buildMessage(f) {
  const lines = [
    "Hi Pamangan! I'd love to request a dish 🍽️",
    "",
    `Dish: ${f.dish.trim() || "—"}`,
    `Name: ${f.name.trim() || "—"}`,
  ];
  if (f.contact.trim()) lines.push(`Contact: ${f.contact.trim()}`);
  if (f.message.trim()) lines.push(`Message: ${f.message.trim()}`);
  return lines.join("\n");
}

// "Request a dish" — visitors suggest a dish; it's saved for the admin dashboard,
// copied to the clipboard and sent through Facebook Messenger (same flow as the order form).
export default function MenuRequest() {
  const [form, setForm] = useState(EMPTY);
  const [honeypot, setHoneypot] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState(""); // "messenger" | "copy" | "failed"
  const startedAt = useRef(Date.now());
  const lastSaved = useRef("");

  useEffect(() => { startedAt.current = Date.now(); }, []);

  const errors = useMemo(() => {
    const e = {};
    if (form.dish.trim().length < 2) e.dish = "Which dish are you craving?";
    if (form.name.trim().length < 2) e.name = "Please tell us your name.";
    return e;
  }, [form]);
  const valid = Object.keys(errors).length === 0;
  const message = useMemo(() => buildMessage(form), [form]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value.slice(0, LIMITS[k]) }));
    setStatus("");
  };
  const err = (k) => touched && errors[k];

  // Save to the dashboard in the background; Messenger + clipboard never wait on it.
  const save = () => {
    const payload = {
      dish: form.dish.trim(),
      name: form.name.trim(),
      contact: form.contact.trim(),
      message: form.message.trim(),
    };
    const key = JSON.stringify(payload);
    if (key === lastSaved.current) return;
    lastSaved.current = key;
    menuRequestApi
      .create({ ...payload, website: honeypot, t: Date.now() - startedAt.current })
      .catch(() => { lastSaved.current = ""; });
  };

  const guard = (e) => {
    setTouched(true);
    if (!valid) {
      e.preventDefault();
      const first = document.querySelector(".dish-request .is-invalid");
      if (first) first.focus();
      return false;
    }
    return true;
  };

  const onMessenger = (e) => {
    if (!guard(e)) return;
    save();
    copyText(message).then((ok) => setStatus(ok ? "messenger" : "failed"));
  };

  const onCopy = (e) => {
    if (!guard(e)) return;
    save();
    copyText(message).then((ok) => setStatus(ok ? "copy" : "failed"));
  };

  return (
    <section className="biz-section alt dish-request" id="request-a-dish" aria-labelledby="request-title">
      <div className="container">
        <div className="row g-4 g-lg-5 align-items-center">
          <div className="col-lg-6">
            <span className="eyebrow mb-2">Request a dish</span>
            <h2 id="request-title" className="biz-title mb-3">
              Craving something that's not on our menu?
            </h2>
            <p className="font-script request-sub mb-3">Tell us what you miss from home.</p>
            <p className="biz-lead mb-4">
              Many of our dishes started as a customer's request. Missing a Kapampangan or Filipino
              favourite like tocino, bringhe, lumpia, or <em>Lola's</em> leche flan? Let us know.
              If enough ka-Pamangan ask for it, we'll cook it fresh on an upcoming cook day, and
              we'll message you first.
            </p>
            <ul className="request-points list-unstyled mb-0">
              <li><i className="bi bi-heart-fill"></i><span>Cooked the way you remember, in small homemade batches</span></li>
              <li><i className="bi bi-people-fill"></i><span>The most-requested dishes go on the menu first</span></li>
              <li><i className="bi bi-bell-fill"></i><span>Leave your contact and we'll let you know when it's ready</span></li>
            </ul>
          </div>

          <div className="col-lg-6">
            <form className="order-panel request-panel" noValidate onSubmit={(e) => e.preventDefault()}>
              {/* Honeypot: hidden from people and screen readers; bots tend to fill it */}
              <div className="hp-field" aria-hidden="true">
                <label htmlFor="req-website">Website</label>
                <input
                  id="req-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="req-dish">Dish you'd love us to cook</label>
                  <input
                    id="req-dish"
                    className={`form-control ${err("dish") ? "is-invalid" : ""}`}
                    value={form.dish}
                    onChange={set("dish")}
                    maxLength={LIMITS.dish}
                    placeholder="e.g. Bringhe, Tocino, Leche flan"
                    autoComplete="off"
                    aria-invalid={!!err("dish")}
                    aria-describedby={err("dish") ? "req-dish-err" : undefined}
                  />
                  {err("dish") && <div id="req-dish-err" className="invalid-feedback">{errors.dish}</div>}
                </div>
                <div className="col-sm-6">
                  <label className="form-label" htmlFor="req-name">Your name</label>
                  <input
                    id="req-name"
                    className={`form-control ${err("name") ? "is-invalid" : ""}`}
                    value={form.name}
                    onChange={set("name")}
                    maxLength={LIMITS.name}
                    autoComplete="name"
                    aria-invalid={!!err("name")}
                    aria-describedby={err("name") ? "req-name-err" : undefined}
                  />
                  {err("name") && <div id="req-name-err" className="invalid-feedback">{errors.name}</div>}
                </div>
                <div className="col-sm-6">
                  <label className="form-label" htmlFor="req-contact">
                    Phone or Facebook name <span className="text-secondary fw-normal">(optional)</span>
                  </label>
                  <input
                    id="req-contact"
                    className="form-control"
                    value={form.contact}
                    onChange={set("contact")}
                    maxLength={LIMITS.contact}
                    autoComplete="tel"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="req-message">
                    Anything we should know? <span className="text-secondary fw-normal">(optional)</span>
                  </label>
                  <textarea
                    id="req-message"
                    className="form-control"
                    rows={3}
                    value={form.message}
                    onChange={set("message")}
                    maxLength={LIMITS.message}
                    placeholder="e.g. The way my Lola made it, with turmeric and coconut milk"
                  />
                </div>
              </div>

              <label className="form-label small text-secondary mt-3 mb-1" htmlFor="req-preview">Message preview</label>
              <pre id="req-preview" className="summary-box mb-3">{message}</pre>

              <div className="d-grid gap-2">
                <a
                  href={BUSINESS.messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onMessenger}
                  className="btn btn-maroon btn-lg rounded-pill"
                >
                  <i className="bi bi-messenger me-2"></i>Send my request on Messenger
                </a>
                <button type="button" onClick={onCopy} className="btn btn-link text-secondary">
                  <i className="bi bi-clipboard me-1"></i>Copy request text
                </button>
              </div>

              <div aria-live="polite">
                {status === "messenger" && (
                  <div className="alert alert-success small mt-3 mb-0">
                    <strong>Salamat po! 🙏</strong> Your request for <em>{form.dish.trim()}</em> is copied.
                    Just paste it in our Messenger chat and hit send.
                  </div>
                )}
                {status === "copy" && (
                  <div className="alert alert-success small mt-3 mb-0">
                    <strong>Salamat po! 🙏</strong> Your request is copied. Paste it in our Messenger chat whenever you're ready.
                  </div>
                )}
                {status === "failed" && (
                  <div className="alert alert-warning small mt-3 mb-0">
                    Couldn't copy automatically. Please select the message preview above and copy it.
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
