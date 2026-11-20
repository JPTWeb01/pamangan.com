import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { adminApiService } from "../services/api";

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 28, label: "28 days" },
  { days: 90, label: "90 days" },
];
const nf = new Intl.NumberFormat("en-CA");
const fmt = (n) => (n == null ? "—" : nf.format(Math.round(n)));
const pct = (n) => (n == null ? "—" : `${Math.round(n * 100)}%`);
const dur = (s) => {
  if (s == null) return "—";
  const m = Math.floor(s / 60);
  return m ? `${m}m ${Math.round(s % 60)}s` : `${Math.round(s)}s`;
};
const shortDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" });

function Stat({ value, label, icon, hint }) {
  return (
    <div className="col-6 col-lg-3">
      <div className="card border-0 shadow-sm rounded-3 p-3 h-100 an-stat">
        <div className="d-flex justify-content-between align-items-start">
          <div className="an-stat-value">{value}</div>
          <i className={`bi ${icon} an-stat-icon`} aria-hidden="true"></i>
        </div>
        <div className="an-stat-label">{label}</div>
        {hint && <div className="an-stat-hint">{hint}</div>}
      </div>
    </div>
  );
}

function Panel({ title, children, className = "col-lg-6" }) {
  return (
    <div className={className}>
      <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 h-100">
        <h6 className="fw-bold mb-3">{title}</h6>
        {children}
      </div>
    </div>
  );
}

// Horizontal bars: one hue (magnitude), label + value in text ink
function BarList({ rows, labelKey, valueKey, format = fmt, empty = "No data yet", href }) {
  if (!rows?.length) return <p className="text-secondary small mb-0">{empty}</p>;
  const max = Math.max(...rows.map((r) => r[valueKey] || 0), 1);
  return (
    <ul className="an-bars list-unstyled mb-0">
      {rows.map((r) => {
        const label = r[labelKey] || "(not set)";
        const link = href?.(r);
        return (
          <li key={label} title={`${label}: ${format(r[valueKey])}`}>
            <div className="an-bar-text">
              {link ? (
                <a href={link} target="_blank" rel="noopener noreferrer" className="an-bar-label">{label}</a>
              ) : (
                <span className="an-bar-label">{label}</span>
              )}
              <span className="an-bar-value">{format(r[valueKey])}</span>
            </div>
            <div className="an-bar-track">
              <div className="an-bar-fill" style={{ width: `${Math.max(2, (r[valueKey] / max) * 100)}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// Visitors per day: single-series area chart with crosshair + tooltip
function DailyChart({ rows }) {
  const wrap = useRef(null);
  const [hover, setHover] = useState(null);
  const W = 720, H = 220, P = { t: 12, r: 12, b: 26, l: 36 };
  const data = rows || [];
  const max = Math.max(...data.map((d) => d.activeUsers), 4);
  const niceMax = Math.ceil(max / 4) * 4;
  const x = (i) => P.l + (data.length <= 1 ? 0 : (i / (data.length - 1)) * (W - P.l - P.r));
  const y = (v) => P.t + (1 - v / niceMax) * (H - P.t - P.b);

  if (!data.length) return <p className="text-secondary small mb-0">No visits recorded yet.</p>;

  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.activeUsers).toFixed(1)}`).join("");
  const area = `${line}L${x(data.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
  const ticks = [0, niceMax / 4, niceMax / 2, (3 * niceMax) / 4, niceMax];
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));

  const onMove = (e) => {
    const rect = wrap.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - P.l) / (W - P.l - P.r)) * (data.length - 1));
    setHover(Math.min(data.length - 1, Math.max(0, i)));
  };
  const h = hover != null ? data[hover] : null;

  return (
    <div className="an-chart" ref={wrap} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Visitors per day">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="an-grid" />
            <text x={P.l - 8} y={y(t) + 4} textAnchor="end" className="an-axis">{fmt(t)}</text>
          </g>
        ))}
        {data.map((d, i) => (i % labelEvery === 0 || i === data.length - 1) && (
          <text key={d.date} x={x(i)} y={H - 6} textAnchor="middle" className="an-axis">{shortDate(d.date)}</text>
        ))}
        <path d={area} className="an-area" />
        <path d={line} className="an-line" />
        {h && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={y(0)} className="an-cross" />
            <circle cx={x(hover)} cy={y(h.activeUsers)} r="5" className="an-dot" />
          </g>
        )}
      </svg>
      {h && (
        <div className="an-tip" style={{ left: `${Math.min(88, Math.max(12, (x(hover) / W) * 100))}%` }}>
          <strong>{shortDate(h.date)}</strong>
          <div>{fmt(h.activeUsers)} visitors</div>
          <div>{fmt(h.screenPageViews)} page views</div>
        </div>
      )}
    </div>
  );
}

function SetupGuide() {
  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 mb-4 an-setup">
      <h6 className="fw-bold mb-2"><i className="bi bi-google me-2"></i>Connect Google Analytics</h6>
      <p className="small text-secondary mb-2">
        Visitor numbers, traffic sources and order clicks appear here once Google Analytics 4 is connected:
      </p>
      <ol className="small mb-0 ps-3">
        <li>Dashboard: add the <code>GA_PROPERTY_ID</code> and <code>GA_SERVICE_ACCOUNT_JSON</code> secrets on the Hugging Face Space.</li>
        <li>In GA4 → Admin → Property access management, add the service account email as a <strong>Viewer</strong>.</li>
      </ol>
    </div>
  );
}

export default function AdminAnalytics({ onAuthError }) {
  const [days, setDays] = useState(28);
  const [data, setData] = useState(null);
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApiService.analytics(days);
      setData(res.data);
    } catch (err) {
      if (err?.message?.includes("Token")) onAuthError?.();
      else setError(err?.message || "Could not load analytics");
    } finally {
      setLoading(false);
    }
  }, [days, onAuthError]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!data?.ga_configured) return undefined;
    let stop = false;
    const tick = () => adminApiService.analyticsRealtime()
      .then((r) => { if (!stop) setLive(r.data?.active_users ?? null); })
      .catch(() => {});
    tick();
    const t = setInterval(tick, 60000);
    return () => { stop = true; clearInterval(t); };
  }, [data?.ga_configured]);

  const ga = data?.ga;
  const site = data?.site;
  const t = ga?.totals;
  const events = useMemo(() => (ga?.events || []).filter((e) => e.name !== "generate_recipe_failed"), [ga]);
  const contacts = events.filter((e) => e.name.startsWith("contact_") || e.name === "order_form_sent")
    .reduce((s, e) => s + e.count, 0);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h5 className="fw-bold mb-0">Analytics</h5>
          <small className="text-secondary">
            {live != null && <><span className="an-live" aria-hidden="true"></span>{live} on the site now · </>}
            Last {days} days
          </small>
        </div>
        <div className="btn-group btn-group-sm" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button key={r.days} type="button"
              className={`btn ${days === r.days ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setDays(r.days)} aria-pressed={days === r.days}>
              {r.label}
            </button>
          ))}
          <button type="button" className="btn btn-outline-primary" onClick={load} aria-label="Refresh" disabled={loading}>
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && !data && (
        <div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading…</span></div></div>
      )}

      {data && !data.ga_configured && <SetupGuide />}
      {data?.ga_error && <div className="alert alert-warning small">{data.ga_error}</div>}

      {ga && (
        <>
          <div className="row g-3 mb-3">
            <Stat value={fmt(t.activeUsers)} label="Visitors" icon="bi-people" hint={`${fmt(t.newUsers)} new`} />
            <Stat value={fmt(t.screenPageViews)} label="Page views" icon="bi-eye" hint={`${fmt(t.sessions)} visits`} />
            <Stat value={fmt(contacts)} label="Order & contact clicks" icon="bi-chat-heart" hint="Messenger, phone, text, order form" />
            <Stat value={pct(t.engagementRate)} label="Engaged visits" icon="bi-hand-thumbs-up" hint={`Avg. ${dur(t.averageSessionDuration)} per visit`} />
          </div>
          <div className="row g-3 mb-3">
            <Panel title="Visitors per day" className="col-12"><DailyChart rows={ga.daily} /></Panel>
          </div>
          <div className="row g-3 mb-3">
            <Panel title="Actions on the site">
              <BarList rows={events} labelKey="label" valueKey="count" empty="No actions yet" />
            </Panel>
            <Panel title="Top pages">
              <BarList rows={ga.pages} labelKey="pagePath" valueKey="screenPageViews"
                href={(r) => `https://pamangan.com${r.pagePath}`} />
            </Panel>
            <Panel title="How people find you">
              <BarList rows={ga.channels} labelKey="sessionDefaultChannelGroup" valueKey="sessions" />
            </Panel>
            <Panel title="Top sources">
              <BarList rows={ga.sources} labelKey="sessionSource" valueKey="sessions" />
            </Panel>
            <Panel title="Cities">
              <BarList rows={ga.cities} labelKey="city" valueKey="activeUsers" />
            </Panel>
            <Panel title="Devices">
              <BarList rows={ga.devices} labelKey="deviceCategory" valueKey="activeUsers" />
            </Panel>
            <Panel title="Most viewed recipes (Google Analytics)" className="col-12">
              <BarList rows={ga.recipes} labelKey="pageTitle" valueKey="screenPageViews"
                href={(r) => `https://pamangan.com${r.pagePath}`} />
            </Panel>
          </div>
        </>
      )}

      {site && (
        <>
          <h6 className="fw-bold mt-4 mb-3">Recipe Kitchen &amp; requests <small className="text-secondary fw-normal">(from our database)</small></h6>
          <div className="row g-3 mb-3">
            <Stat value={fmt(site.recipes_total)} label="Recipes" icon="bi-journal-richtext" hint={`${fmt(site.recipes_new)} added in ${days} days`} />
            <Stat value={fmt(site.recipe_views_total)} label="Recipe views (all time)" icon="bi-eye" />
            <Stat value={fmt(site.recipe_likes_total)} label="Recipe likes (all time)" icon="bi-heart" />
            <Stat value={fmt(site.menu_requests_new)} label="Dish requests" icon="bi-envelope-heart" hint={`in ${days} days`} />
          </div>
          <div className="row g-3">
            <Panel title="Most viewed recipes (all time)">
              <BarList rows={site.top_recipes} labelKey="name" valueKey="views"
                href={(r) => `https://pamangan.com/recipe/${r.slug}`} />
            </Panel>
            <Panel title={`Most requested dishes (${days} days)`}>
              <BarList rows={site.top_requests} labelKey="dish" valueKey="count" empty="No requests in this period" />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
