/* 21st.dev — @victorwelander / expandable-tabs (vanilla clone)
 *
 * Icon-only tabs that expand to reveal their label when selected, with a
 * sliding highlight, optional separators between groups, click-outside to
 * collapse, and full keyboard support (arrows, Home, End, Escape). */

const ICONS = {
  house: `<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>`,
  bell: `<path d="M10.268 21a2 2 0 0 0 3.464 0"></path>
    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path>`,
  settings: `<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>`,
  help: `<circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <path d="M12 17h.01"></path>`,
  shield: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>`,
  user: `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>`,
  mail: `<rect width="20" height="16" x="2" y="4" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>`,
  filetext: `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
    <path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>`,
  lock: `<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>`,
};

const SETS = [
  {
    label: "Default",
    tabs: [
      { title: "Dashboard", icon: "house" },
      { title: "Notifications", icon: "bell" },
      { type: "separator" },
      { title: "Settings", icon: "settings" },
      { title: "Support", icon: "help" },
      { title: "Security", icon: "shield" },
    ],
  },
  {
    label: "Custom colour",
    accent: "var(--accent-color)",
    tabs: [
      { title: "Profile", icon: "user" },
      { title: "Messages", icon: "mail" },
      { type: "separator" },
      { title: "Documents", icon: "filetext" },
      { title: "Privacy", icon: "lock" },
    ],
  },
];

const host = document.getElementById("tabs");
const hint = document.getElementById("hint");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

let activeIndex = -1;       // -1 == collapsed (icon-only)
let setIndex = 0;
let buttons = [];
let glider = null;

function svg(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

function build() {
  const set = SETS[setIndex];
  host.innerHTML = "";
  host.style.setProperty("--accent-color", setIndex === 1 ? "#3b82f6" : "var(--foreground)");

  glider = document.createElement("span");
  glider.className = "glider";
  glider.setAttribute("aria-hidden", "true");
  host.appendChild(glider);

  buttons = [];
  let tabIndexCounter = 0;

  set.tabs.forEach((t, i) => {
    if (t.type === "separator") {
      const s = document.createElement("span");
      s.className = "sep";
      s.setAttribute("role", "separator");
      s.setAttribute("aria-orientation", "vertical");
      host.appendChild(s);
      return;
    }
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tab";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", "false");
    b.tabIndex = tabIndexCounter === 0 ? 0 : -1;
    b.dataset.i = String(i);
    b.innerHTML = `${svg(t.icon)}<span class="label">${t.title}</span>`;
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      const wasActive = activeIndex === i;
      activeIndex = wasActive ? -1 : i;      // clicking the open tab collapses it
      sync();
    });
    b.addEventListener("keydown", onKey);
    host.appendChild(b);
    buttons.push(b);
    tabIndexCounter++;
  });

  activeIndex = -1;
  host.classList.remove("has-active");
  sync(false);
}

function sync(animate = true) {
  const set = SETS[setIndex];
  buttons.forEach((b) => {
    const i = Number(b.dataset.i);
    const on = i === activeIndex;
    b.setAttribute("aria-selected", on ? "true" : "false");
    b.tabIndex = on || (activeIndex === -1 && buttons[0] === b) ? 0 : -1;
  });

  if (activeIndex === -1) {
    host.classList.remove("has-active");
    hint.textContent = "Click a tab to expand it";
    return;
  }

  const el = buttons.find((b) => Number(b.dataset.i) === activeIndex);
  if (!el) return;
  host.classList.add("has-active");

  // measure after the label has expanded so the glider wraps the final width
  const place = () => {
    const hr = host.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    glider.style.width = `${r.width}px`;
    glider.style.height = `${r.height}px`;
    glider.style.transform = `translate(${r.left - hr.left}px, ${r.top - hr.top}px)`;
  };
  place();
  requestAnimationFrame(place);
  if (!reduced.matches && animate) {
    const ro = new ResizeObserver(place);
    ro.observe(el);
    setTimeout(() => ro.disconnect(), 600);
  }
  hint.textContent = `${SETS[setIndex].tabs[activeIndex].title} selected`;
}

function onKey(e) {
  const i = buttons.indexOf(e.currentTarget);
  const last = buttons.length - 1;
  let next = null;

  if (e.key === "ArrowRight") next = i === last ? 0 : i + 1;
  else if (e.key === "ArrowLeft") next = i === 0 ? last : i - 1;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = last;
  else if (e.key === "Escape") {
    if (activeIndex !== -1) { e.preventDefault(); activeIndex = -1; sync(); }
    return;
  } else if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    const idx = Number(e.currentTarget.dataset.i);
    activeIndex = activeIndex === idx ? -1 : idx;
    sync();
    return;
  }

  if (next === null) return;
  e.preventDefault();
  buttons[next].focus();
  activeIndex = Number(buttons[next].dataset.i);
  sync();
}

/* click anywhere outside collapses the open tab */
document.addEventListener("click", (e) => {
  if (e.target.closest("#tabs")) return;
  if (activeIndex !== -1) { activeIndex = -1; sync(); }
});

window.addEventListener("resize", () => { if (activeIndex !== -1) sync(false); });

/* theme from ?theme= or the OS, matching the preview harness */
const q = new URL(window.location.href).searchParams.get("theme");
const dark = q ? q === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.classList.toggle("dark", dark);

/* expose the alternate demo for testing / capture */
window.__setTabSet = (n) => { setIndex = n % SETS.length; build(); };

build();
