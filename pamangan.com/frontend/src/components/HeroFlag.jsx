import React, { useEffect, useRef, useState } from "react";

// Five-point star path centred on (cx, cy)
function star(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.4;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

// Eight-ray sun used on the flag and behind the hero photo
export function sunRays(cx, cy, inner, outer) {
  const rays = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i;
    for (const off of [-0.16, 0, 0.16]) {
      const len = off === 0 ? outer : outer * 0.82;
      const w = off === 0 ? 0.07 : 0.045;
      const p = (ang, rr) => `${(cx + rr * Math.sin(ang)).toFixed(1)},${(cy - rr * Math.cos(ang)).toFixed(1)}`;
      rays.push(`M${p(a + off - w, inner)}L${p(a + off, len)}L${p(a + off + w, inner)}Z`);
    }
  }
  return rays.join("");
}

const GOLD = "#FCD116";
const PH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" preserveAspectRatio="none">
<rect width="1200" height="300" fill="#0038A8"/><rect y="300" width="1200" height="300" fill="#CE1126"/>
<path d="M0,0L519.6,300L0,600Z" fill="#fff"/>
<circle cx="173" cy="300" r="40" fill="${GOLD}"/><path d="${sunRays(173, 300, 46, 112)}" fill="${GOLD}"/>
<path d="${star(58, 62, 27)}" fill="${GOLD}"/><path d="${star(58, 538, 27)}" fill="${GOLD}"/><path d="${star(452, 300, 27)}" fill="${GOLD}"/>
</svg>`;

// Canadian maple leaf (official geometry), scaled into the centre square
const MAPLE_LEAF =
  "m-90 2030 45-863a95 95 0 0 0-111-98l-859 151 116-320a65 65 0 0 0-20-73l-941-762 212-99a65 65 0 0 0 34-79l-186-572 542 115a65 65 0 0 0 73-38l105-247 423 454a65 65 0 0 0 111-57l-204-1052 327 189a65 65 0 0 0 91-27l332-652 332 652a65 65 0 0 0 91 27l327-189-204 1052a65 65 0 0 0 111 57l423-454 105 247a65 65 0 0 0 73 38l542-115-186 572a65 65 0 0 0 34 79l212 99-941 762a65 65 0 0 0-20 73l116 320-859-151a95 95 0 0 0-111 98l45 863z";
const CA_RED = "#D52B1E";
const CA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" preserveAspectRatio="none">
<rect width="1200" height="600" fill="#fff"/><rect width="300" height="600" fill="${CA_RED}"/><rect x="900" width="300" height="600" fill="${CA_RED}"/>
<path transform="translate(600 298) scale(.122)" d="${MAPLE_LEAF}" fill="${CA_RED}"/>
</svg>`;

const toUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
const FLAGS = { ph: toUrl(PH_SVG), ca: toUrl(CA_SVG) };

const STRIPS = 44;

// Decorative waving flag for the hero background.
// Built from thin vertical strips animated with transforms only (GPU-friendly).
// `side="right"` mirrors the cloth so the flag flies from a pole on the right.
export default function HeroFlag({ country = "ph", side = "left" }) {
  const ref = useRef(null);
  const [paused, setPaused] = useState(false);

  // Pause the animation while the hero is scrolled out of view
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined" || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => setPaused(!entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`hero-flag hero-flag--${side}${paused ? " is-paused" : ""}`}
      style={{ "--flag": FLAGS[country] || FLAGS.ph, "--n": STRIPS }}
      aria-hidden="true"
    >
      <div className="hero-flag-cloth">
        {Array.from({ length: STRIPS }, (_, i) => {
          // Distance from the pole: the wave starts there and grows toward the free edge
          const d = side === "right" ? STRIPS - 1 - i : i;
          return (
            <span
              key={i}
              className="hero-flag-strip"
              style={{
                "--i": d,
                "--amp": `${(2 + 14 * (d / (STRIPS - 1))).toFixed(2)}px`,
                left: `${(i * 100) / STRIPS}%`,
                backgroundPosition: `${(i * 100) / (STRIPS - 1)}% 0`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
