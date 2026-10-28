/* 21st.dev — @shadcnblockscom / hero-195-1 (vanilla clone)
 *
 * A centred hero with a tab bar that swaps the framed product screenshot, a
 * gradient spark travelling the image border, and normal roving-tabindex
 * keyboard behaviour. Insights is the only tab with a real capture; the
 * others announce that they are part of the paid block set rather than
 * pretending to render content we do not have. */

const ICONS = {
  chart: `<path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M7 16v-3"></path>
    <path d="M12 16V8"></path><path d="M17 16v-6"></path>`,
  activity: `<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>`,
  trending: `<path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path>`,
  database: `<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path>`,
  layers: `<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path>
    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path>
    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path>`,
};

const TABS = [
  { name: "Insights", icon: "chart",    src: "assets/admin-dashboard-1.png", alt: "Insights" },
  { name: "Metrics",  icon: "activity", src: null, alt: "Metrics" },
  { name: "Trends",   icon: "trending", src: null, alt: "Trends" },
  { name: "Sources",  icon: "database", src: null, alt: "Sources" },
  { name: "Models",   icon: "layers",   src: null, alt: "Models" },
];

const tablist = document.getElementById("tablist");
const panels = document.getElementById("panels");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

let selected = 0;
const tabEls = [];

function svg(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

/* ---------- build ---------- */
TABS.forEach((t, i) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "tab";
  btn.id = `tab-${i}`;
  btn.setAttribute("role", "tab");
  btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
  btn.setAttribute("aria-controls", `panel-${i}`);
  btn.tabIndex = i === 0 ? 0 : -1;
  btn.innerHTML = `${svg(t.icon)}<span>${t.name}</span>`;
  btn.addEventListener("click", () => select(i));
  btn.addEventListener("keydown", onKey);
  tablist.appendChild(btn);
  tabEls.push(btn);

  const panel = document.createElement("div");
  panel.className = "panel";
  panel.id = `panel-${i}`;
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", `tab-${i}`);
  panel.tabIndex = 0;
  if (i !== 0) panel.hidden = true;

  if (t.src) {
    panel.innerHTML = `
      <div class="shot-frame">
        <img src="${t.src}" alt="${t.alt}" />
        <div class="glow-border" aria-hidden="true"></div>
      </div>`;
  } else {
    panel.innerHTML = `<div class="placeholder">${t.name} — part of the full block set</div>`;
  }
  panels.appendChild(panel);
});

/* ---------- behaviour ---------- */
function select(i, focus = false) {
  if (i === selected) return;
  selected = i;

  tabEls.forEach((b, k) => {
    const on = k === i;
    b.setAttribute("aria-selected", on ? "true" : "false");
    b.tabIndex = on ? 0 : -1;
  });

  [...panels.children].forEach((p, k) => {
    if (k === i) {
      p.hidden = false;
      if (!reduced.matches) {
        p.classList.remove("is-entering");
        void p.offsetWidth;              // restart the animation
        p.classList.add("is-entering");
      }
    } else {
      p.hidden = true;
      p.classList.remove("is-entering");
    }
  });

  if (focus) tabEls[i].focus();
}

function onKey(e) {
  const i = tabEls.indexOf(e.currentTarget);
  const last = tabEls.length - 1;
  let next = null;

  if (e.key === "ArrowRight") next = i === last ? 0 : i + 1;
  else if (e.key === "ArrowLeft") next = i === 0 ? last : i - 1;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = last;
  else if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    select(i);
    return;
  }
  if (next === null) return;
  e.preventDefault();
  select(next, true);
}

/* theme from ?theme= or the OS */
const q = new URL(window.location.href).searchParams.get("theme");
const dark = q ? q === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.classList.toggle("dark", dark);
