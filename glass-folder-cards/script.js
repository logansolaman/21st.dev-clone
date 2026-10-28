/* 21st.dev — @kedhareswer / glass-folder-cards (vanilla clone)
 *
 * Frosted-glass folders that assemble on scroll, lean toward the pointer,
 * open to fan out their files as clickable items, and take new files with a
 * drop-in animation. Keyboard + menu support, no images or fonts to ship. */

const FOLDERS = [
  {
    label: "My Files",
    meta: "3 items",
    art: "aurora",
    seed: 3,
    appearDelay: 0,
    action: "add",
    labelPlacement: "bottom-left",
    files: [
      { name: "Lookbook 2025", meta: "42 images", art: "dusk" },
      { name: "Grade v2", meta: "DRX · 18 MB", art: "aurora" },
      { name: "Moodboard", meta: "16 boards", art: "verdant" },
    ],
  },
  {
    label: "Archives",
    meta: "4 items",
    art: "none",
    action: "more",
    labelPlacement: "top-left",
    appearDelay: 140,
    files: [
      { name: "Lookbook 2024", meta: "38 images", art: "dusk" },
      { name: "Invoices", meta: "12 PDFs" },
      { name: "Shoot — Lisbon", meta: "RAW · 2.1 GB", art: "ember" },
      { name: "Contract.pdf", meta: "PDF · 320 KB" },
    ],
    menu: [
      { label: "Rename" },
      { label: "Share…" },
      { label: "Move to Trash", danger: true },
    ],
  },
  {
    label: "My Files",
    meta: "Wed 19 Aug",
    tone: "dark",
    art: "ember",
    seed: 11,
    action: "none",
    labelPlacement: "top-right",
    appearDelay: 280,
    files: [
      { name: "Stills", meta: "64 images", art: "verdant" },
      { name: "Edit notes", meta: "TXT · 4 KB" },
      { name: "Grade v3", meta: "DRX · 18 MB", art: "aurora" },
    ],
  },
];

const host = document.getElementById("folders");
const menuEl = document.getElementById("menu");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
let openMenuFor = null;
let uid = 0;

const MORE_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="1.7" stroke-linecap="round"><circle cx="7" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/>
  <circle cx="17" cy="12" r="1.4"/></svg>`;

function fileRow(file, index) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "file";
  btn.style.setProperty("--fd", String(index * 55) + "ms");
  if (file.art) btn.dataset.art = file.art;
  btn.innerHTML = `<span class="chip" aria-hidden="true"></span>
    <span class="nm">${file.name}</span>
    <span class="mt">${file.meta || ""}</span>`;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const folder = btn.closest(".folder");
    if (!folder.classList.contains("is-open")) return;
    btn.animate(
      [{ transform: "scale(1)" }, { transform: "scale(0.975)" }, { transform: "scale(1)" }],
      { duration: 220, easing: "ease-out" }
    );
  });
  return btn;
}

function buildFolder(cfg) {
  const el = document.createElement("div");
  el.className = "folder";
  el.dataset.tone = cfg.tone || "light";
  el.dataset.label = cfg.labelPlacement;
  el.dataset.art = cfg.art;
  el.tabIndex = 0;
  el.setAttribute("role", "button");
  el.setAttribute("aria-expanded", "false");
  el.setAttribute("aria-label", `${cfg.label}, ${cfg.meta || ""}. Press Enter to open.`);
  el.style.setProperty("--delay", `${cfg.appearDelay}ms`);

  el.innerHTML = `
    <div class="tilt">
      <div class="tab" aria-hidden="true"></div>
      <div class="body">
        <div class="art" data-art="${cfg.art}"></div>
      </div>
      <div class="tab-art" aria-hidden="true"><div class="art" data-art="${cfg.art}"></div></div>
      <div class="files" role="list"></div>
      <div class="front">
        <div class="front-inner">
          <span class="label">${cfg.label}</span>
          <span class="meta">${cfg.meta || ""}</span>
        </div>
      </div>
      ${
        cfg.action === "add"
          ? `<button class="action add" type="button" aria-label="Add a file to ${cfg.label}">+</button>`
          : cfg.action === "more"
          ? `<button class="action more" type="button" aria-haspopup="menu" aria-expanded="false"
                aria-label="Folder menu">${MORE_ICON}</button>`
          : ""
      }
    </div>`;

  const filesEl = el.querySelector(".files");
  (cfg.files || []).forEach((f, i) => filesEl.appendChild(fileRow(f, i)));

  /* --- pointer lean --- */
  el.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || el.classList.contains("is-open") || reduced.matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 … 0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.querySelector(".tilt").style.transform =
      `rotateX(${(-py * 9).toFixed(2)}deg) rotateY(${(px * 13).toFixed(2)}deg) translateZ(10px)`;
  });
  el.addEventListener("pointerleave", () => {
    el.querySelector(".tilt").style.transform = "";
  });

  /* --- open / close --- */
  const toggle = () => {
    if (el.classList.contains("is-open")) close(el);
    else open(el);
  };

  el.addEventListener("click", (e) => {
    if (e.target.closest(".action") || e.target.closest(".file") || e.target.closest(".menu")) return;
    toggle();
  });

  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    else if (e.key === "Escape" && el.classList.contains("is-open")) { e.preventDefault(); close(el); }
    else if (e.key === "ArrowDown" && el.classList.contains("is-open")) {
      e.preventDefault();
      const first = el.querySelector(".file");
      if (first) first.focus();
    }
  });

  el.querySelectorAll(".file").forEach((f, i, all) => {
    f.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { e.preventDefault(); close(el); el.focus(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); (all[i + 1] || all[0]).focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); (all[i - 1] || all[all.length - 1]).focus(); }
    });
  });

  /* --- actions --- */
  const addBtn = el.querySelector(".action.add");
  if (addBtn) {
    addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      addFile(el, cfg);
    });
  }

  const moreBtn = el.querySelector(".action.more");
  if (moreBtn) {
    moreBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (openMenuFor === el) { closeMenu(); return; }
      openMenu(el, moreBtn, cfg.menu || []);
    });
  }

  el._cfg = cfg;
  return el;
}

const folders = FOLDERS.map(buildFolder);
folders.forEach((f) => host.appendChild(f));

function open(el) {
  folders.forEach((o) => { if (o !== el) close(o); });
  el.classList.add("is-open");
  el.setAttribute("aria-expanded", "true");
  el.querySelector(".tilt").style.transform = "";
}
function close(el) {
  el.classList.remove("is-open");
  el.setAttribute("aria-expanded", "false");
}

/* --- add a file with the drop-in animation --- */
function addFile(el, cfg) {
  const n = el.querySelectorAll(".file").length + 1;
  const pool = [
    { name: "New note", meta: "TXT · 1 KB" },
    { name: "Screenshot", meta: "PNG · 840 KB", art: "dusk" },
    { name: "Export", meta: "ZIP · 12 MB", art: "ember" },
    { name: "Scan", meta: "PDF · 2 KB", art: "verdant" },
  ];
  const pick = pool[(n - 1) % pool.length];
  const row = fileRow({ ...pick, name: `${pick.name} ${n}` }, n - 1);
  row.classList.add("dropping");
  el.querySelector(".files").appendChild(row);
  row.addEventListener("animationend", () => row.classList.remove("dropping"), { once: true });
  const meta = el.querySelector(".meta");
  if (meta && /^\d+ items$/.test(meta.textContent)) {
    meta.textContent = `${el.querySelectorAll(".file").length} items`;
  }
  if (!el.classList.contains("is-open")) open(el);
}

/* --- context menu --- */
function openMenu(el, anchor, items) {
  openMenuFor = el;
  menuEl.innerHTML = "";
  items.forEach((it) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "menuitem");
    b.textContent = it.label;
    if (it.danger) b.className = "danger";
    b.addEventListener("click", () => closeMenu());
    menuEl.appendChild(b);
  });
  const r = anchor.getBoundingClientRect();
  menuEl.classList.add("is-open");
  const mw = menuEl.offsetWidth, mh = menuEl.offsetHeight;
  let left = r.right - mw;
  let top = r.bottom + 8;
  if (top + mh > window.innerHeight - 8) top = r.top - mh - 8;
  menuEl.style.left = `${Math.max(8, Math.min(left, window.innerWidth - mw - 8))}px`;
  menuEl.style.top = `${Math.max(8, top)}px`;
  menuEl.style.position = "fixed";
  anchor.setAttribute("aria-expanded", "true");
  const first = menuEl.querySelector("button");
  if (first) first.focus();
}
function closeMenu() {
  if (openMenuFor) {
    const a = openMenuFor.querySelector(".action.more");
    if (a) a.setAttribute("aria-expanded", "false");
  }
  openMenuFor = null;
  menuEl.classList.remove("is-open");
  menuEl.innerHTML = "";
}
document.addEventListener("click", (e) => {
  if (!e.target.closest("#menu") && !e.target.closest(".action.more")) closeMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (openMenuFor) closeMenu();
    else folders.forEach(close);
  }
});

/* --- assemble on scroll --- */
if (reduced.matches) {
  folders.forEach((f) => f.classList.add("is-in"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.25 }
  );
  folders.forEach((f) => io.observe(f));
  // above-the-fold folders appear immediately
  requestAnimationFrame(() => {
    folders.forEach((f) => {
      const r = f.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9) f.classList.add("is-in");
    });
  });
}
