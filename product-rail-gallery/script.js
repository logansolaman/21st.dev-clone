/* 21st.dev — @dhxwhy / product-rail-gallery (vanilla clone)
 *
 * A clothing rail you can handle. Pieces hang from the rail, turn to face you
 * on hover / focus, slide along the rail with hanger physics when dragged
 * (pushing their neighbours), and lift off into an accessible detail modal
 * with Escape to close and focus returned to the piece.
 */

const A = "assets/";
const ITEMS = [
  { id: "bone-tee", name: "Heavyweight tee · Bone", color: "#EFEBE2", tag: "$48",
    description: "240 gsm organic cotton with a tonal DHxWHY embroidery on the chest.",
    details: ["240 gsm", "Regular fit", "Tonal embroidery"],
    image: "1485bf44725b18fc.webp", backImage: "69937e656430ae33.webp", sideImage: "838468c32f16b4ac.webp" },
  { id: "cc-graphic", name: "Graphic tee · CCgather", color: "#101214", tag: "$52",
    description: "Black tee with the CCgather wordmark printed front and back.",
    details: ["240 gsm", "Regular fit", "Screen print"],
    image: "d769f183472d0fd9.webp", backImage: "fec6f7e96b198cc5.webp", sideImage: "b3b6984ea94b8b8c.webp" },
  { id: "oxford-sky", name: "Oxford shirt · Sky", color: "#A3D3EB", tag: "$74",
    description: "Pale sky oxford with a button-down collar and a tiny Maestiq embroidery.",
    details: ["Oxford cotton", "Button-down collar", "Chest pocket"],
    image: "470a7723cef068f8.webp", backImage: "9be14e5dce879756.webp", sideImage: "5984d5ca60fd1aee.webp" },
  { id: "cardigan-olive", name: "Knit cardigan · Olive", color: "#758151", tag: "$96",
    description: "Chunky olive wool cardigan with wooden buttons and ribbed trims.",
    details: ["Lambswool", "Wooden buttons", "V-neck"],
    image: "581b13c5ca241c65.webp", backImage: "d9178d906d372685.webp", sideImage: "dee1c529600e0460.webp" },
  { id: "hoodie-heather", name: "Hoodie · Maestiq", color: "#A0A5AB", tag: "$88",
    description: "Heather fleece hoodie with the Maestiq wordmark across the chest.",
    details: ["400 gsm fleece", "Kangaroo pocket", "Chest print"],
    image: "51750ba098dd622d.webp", backImage: "e75c4ac8fb7f14ca.webp", sideImage: "a2eb2463d52146c3.webp" },
  { id: "sweat-lilac", name: "Crewneck sweatshirt · Lilac", color: "#CCB2E0", tag: "$78",
    description: "Muted lilac fleece crewneck with a raised DHxWHY puff print.",
    details: ["400 gsm fleece", "Ribbed trims", "Puff print"],
    image: "8e38660e2add9637.webp", backImage: "b9214a6e009ce4b3.webp", sideImage: "591872e42b483c43.webp" },
  { id: "polo-forest", name: "Piqué polo · Forest", color: "#185B37", tag: "$62",
    description: "Forest piqué polo with a bone CCgather embroidery on the chest.",
    details: ["Piqué knit", "Two-button placket", "Embroidered"],
    image: "19fe43cb681195ae.webp", backImage: "e095182b1a7f04e6.webp", sideImage: "005a8e10be234bc4.webp" },
  { id: "henley-brick", name: "Henley · Brick", color: "#B05139", tag: "$56",
    description: "Dusty brick henley with a three-button placket, worn in from day one.",
    details: ["Slub cotton", "Three buttons", "Long sleeve"],
    image: "84aa4b0e21ed11fc.webp", backImage: "01c299df56a29afc.webp", sideImage: "9ca38eeb156aae7d.webp" },
  { id: "breton", name: "Breton long sleeve", color: "#E4DFD3", tag: "$58",
    description: "Classic ink-and-bone Breton stripe with a boat neck.",
    details: ["220 gsm", "Boat neck", "Long sleeve"],
    image: "096002a95aba7de9.webp", backImage: "74408a7dbb4f4fc6.webp", sideImage: "eda3afca537071a8.webp" },
  { id: "oversized-ochre", name: "Oversized tee · CCgather", color: "#DE9C31", tag: "$52",
    description: "Boxy ochre tee with a small chest mark and a large CCgather back print.",
    details: ["Oversized", "Dropped shoulder", "Back print"],
    image: "7208c811f54e123d.webp", backImage: "d356989b7bc741c5.webp", sideImage: "bf94beeafb21f9cb.webp" },
];

const REST_TURN = 46;        // deg a piece hangs turned away from you
const GAP_RATIO = 0.010;     // gap between footprints, fraction of garment height
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

const wrap = document.getElementById("railWrap");
const track = document.getElementById("track");
const featureName = document.getElementById("featureName");
const featureDesc = document.getElementById("featureDesc");

let H = 320;        // garment height
let FW = 200;       // garment front width
let width = 620;    // rail width
let active = 0;
let dragging = -1;
let grabDX = 0;
let pointerDownAt = null;
let raf = 0;
let lastT = 0;
let autoplay = true;
let autoplayTimer = 0;

const els = [];
const sim = { x: [], vx: [], tx: [], turn: [], vturn: [], swing: [], vswing: [], tag: [], vtag: [] };

/* ---------- build ---------- */
const frag = document.createDocumentFragment();
ITEMS.forEach((item, i) => {
  const el = document.createElement("div");
  el.className = "piece";
  el.dataset.i = String(i);
  el.setAttribute("role", "listitem");
  el.setAttribute("aria-label", `${item.name}, ${item.tag}`);
  el.innerHTML = `
    <div class="sway">
      <span class="hook" aria-hidden="true"></span>
      <div class="frame">
        <img class="shot front" src="${A}${item.image}" alt="" draggable="false" />
        <img class="shot side" src="${A}${item.sideImage}" alt="" draggable="false" />
      </div>
      <span class="tag" aria-hidden="true">${item.tag}</span>
    </div>`;
  frag.appendChild(el);
  els.push(el);
  sim.x[i] = 0; sim.vx[i] = 0; sim.tx[i] = 0;
  sim.turn[i] = REST_TURN; sim.vturn[i] = 0;
  sim.swing[i] = 0; sim.vswing[i] = 0;
  sim.tag[i] = 0; sim.vtag[i] = 0;
});
track.appendChild(frag);

/* ---------- geometry ---------- */
const facing = (i) => Math.max(0, Math.cos((sim.turn[i] * Math.PI) / 180));
const footprint = (i) => FW * (0.56 + 0.44 * facing(i));
const gapPx = () => Math.round(H * GAP_RATIO);
const bounds = () => {
  const pad = gapPx() * 0.5;
  return { min: pad + FW * 0.15, max: width - pad - FW * 0.15 };
};

function measure() {
  width = Math.max(300, track.clientWidth || wrap.clientWidth);
  const n = els.length;
  // the whole rail always fits: solve garment height from the available width
  const gaps = gapPx() * (n - 1);
  const perPiece = (width - gaps) / n;
  H = Math.round(Math.min(430, Math.max(150, perPiece / 0.62)));
  FW = Math.round(H * 0.62);
  els.forEach((el) => {
    el.style.width = FW + "px";
    el.style.height = H + "px";
    el.style.zIndex = "";
  });
  track.style.height = H + "px";
  layout(true);
}

/* slot centres: laid out from the turned-away footprints so pieces never
 * overlap while they rotate, and centred as a group once they settle */
function layout(snap) {
  const gap = gapPx();
  const total = els.reduce((s, _, i) => s + footprint(i), 0) + gap * (els.length - 1);
  let cursor = (width - total) / 2;
  for (let i = 0; i < els.length; i++) {
    const fp = footprint(i);
    const c = cursor + fp / 2;
    sim.tx[i] = c;
    cursor += fp + gap;
    if (snap) { sim.x[i] = c; sim.vx[i] = 0; }
  }
}

/* ---------- paint ---------- */
function paint(i) {
  const el = els[i];
  el.style.transform = `translate3d(${((sim.x[i] || 0) - FW / 2).toFixed(2)}px,0,0)`;
  const sway = el.firstElementChild;
  sway.style.transform = `rotate(${(sim.swing[i] || 0).toFixed(2)}deg)`;
  const frame = sway.querySelector(".frame");
  const t = sim.turn[i] || 0;
  // a piece turned away shows its true side profile, not a squashed front
  frame.style.transform = `perspective(1200px) rotateY(${(t * 0.55).toFixed(2)}deg)`;
  // crisp swap: front while it is facing you, side profile while it is turned
  const showFront = Math.max(0, Math.min(1, (30 - t) / 12));
  el.querySelector(".front").style.opacity = showFront.toFixed(3);
  el.querySelector(".side").style.opacity = (1 - showFront).toFixed(3);
  const f = facing(i);
  const lift = i === active ? 1.04 : 1;
  el.querySelector(".frame").style.setProperty("--lift", lift);
  el.style.setProperty("--shade", (0.3 + 0.7 * f).toFixed(3));
  el.querySelector(".tag").style.transform =
    `rotate(${(-11 + (sim.tag[i] || 0)).toFixed(2)}deg)`;
}

/* ---------- physics ---------- */
function step(now) {
  const dt = lastT ? Math.min(0.034, (now - lastT) / 1000) : 1 / 60;
  lastT = now;
  const gap = gapPx();
  let moving = false;

  for (let pass = 0; pass < 2; pass++) {
    const h = dt / 2;
    for (let i = 0; i < els.length; i++) {
      if (i !== dragging) {                       // slide back to its slot
        const k = 120, c = 2 * Math.sqrt(120) * 0.82;
        const ax = -k * (sim.x[i] - sim.tx[i]) - c * sim.vx[i];
        sim.vx[i] += ax * h;
        sim.x[i] += sim.vx[i] * h;
      }
      const targetTurn = i === active ? 0 : REST_TURN;   // turn to face you
      const at = -150 * (sim.turn[i] - targetTurn) - 2 * Math.sqrt(150) * 0.8 * sim.vturn[i];
      sim.vturn[i] += at * h;
      sim.turn[i] += sim.vturn[i] * h;

      // hanger sway: pushed by how fast the piece is travelling
      const vx = Math.max(-2600, Math.min(2600, sim.vx[i]));
      const as = -30 * sim.swing[i] - 2.4 * sim.vswing[i] + vx * 0.02 * -1;
      sim.vswing[i] += as * h;
      sim.swing[i] = Math.max(-13, Math.min(13, sim.swing[i] + sim.vswing[i] * h));

      // the price tag lags the sway
      const ag = -46 * (sim.tag[i] + sim.swing[i] * 0.8) - 3.4 * sim.vtag[i];
      sim.vtag[i] += ag * h;
      sim.tag[i] = Math.max(-26, Math.min(26, sim.tag[i] + sim.vtag[i] * h));
    }

    // neighbours: hangers cannot overlap, so dragging one pushes the row
    for (let i = 0; i < els.length - 1; i++) {
      const need = (footprint(i) + footprint(i + 1)) / 2 + gap;
      const pen = need - (sim.x[i + 1] - sim.x[i]);
      if (pen <= 0) continue;
      if (i === dragging) sim.x[i + 1] += pen;
      else if (i + 1 === dragging) sim.x[i] -= pen;
      else { sim.x[i] -= pen / 2; sim.x[i + 1] += pen / 2; }
      const v0 = sim.vx[i], v1 = sim.vx[i + 1];
      if (v0 > v1) {
        const m = (v0 + v1) / 2;
        if (i !== dragging) sim.vx[i] = m;
        if (i + 1 !== dragging) sim.vx[i + 1] = m;
      }
    }

    // the rail ends
    const b = bounds(), last = els.length - 1;
    if (sim.x[0] < b.min) { sim.x[0] = b.min; sim.vx[0] = Math.abs(sim.vx[0]) * 0.28; }
    if (sim.x[last] > b.max) { sim.x[last] = b.max; sim.vx[last] = -Math.abs(sim.vx[last]) * 0.28; }
  }

  for (let i = 0; i < els.length; i++) {
    paint(i);
    const tTarget = i === active ? 0 : REST_TURN;
    if (Math.abs(sim.vx[i]) > 0.35 ||
        Math.abs(sim.x[i] - sim.tx[i]) > 0.3 ||
        Math.abs(sim.turn[i] - tTarget) > 0.2 ||
        Math.abs(sim.vturn[i]) > 0.2 ||
        Math.abs(sim.swing[i]) > 0.06 ||
        Math.abs(sim.tag[i]) > 0.06) moving = true;
  }
  if (dragging >= 0) moving = true;

  if (moving) raf = requestAnimationFrame(step);
  else { raf = 0; lastT = 0; }
}

function kick() {
  if (raf) return;
  lastT = 0;
  raf = requestAnimationFrame(step);
}

function snapAll() {
  els.forEach((_, i) => {
    sim.turn[i] = i === active ? 0 : REST_TURN;
    sim.vturn[i] = 0; sim.swing[i] = 0; sim.vswing[i] = 0; sim.tag[i] = 0; sim.vtag[i] = 0;
  });
  layout(true);
  els.forEach((_, i) => paint(i));
}

/* ---------- state ---------- */
function setFeature(i) {
  const item = ITEMS[i];
  featureName.textContent = item.name;
  featureDesc.textContent = item.description;
}

function setActive(i, byUser = true) {
  if (i < 0 || i >= els.length) return;
  if (i === active) return;
  active = i;
  els.forEach((el, k) => { el.tabIndex = k === i ? 0 : -1; });
  setFeature(i);
  if (byUser) stopAutoplay();
  layout(false);
  kick();
}

function stopAutoplay() {
  autoplay = false;
  clearInterval(autoplayTimer);
  autoplayTimer = 0;
}

function startAutoplay() {
  if (!autoplay || reduced.matches) return;
  clearInterval(autoplayTimer);
  autoplayTimer = setInterval(() => {
    if (dragging >= 0 || document.hidden || modalOpen) return;
    setActive((active + 1) % els.length, false);
  }, 2600);
}

/* ---------- interaction ---------- */
els.forEach((el, i) => {
  el.tabIndex = i === 0 ? 0 : -1;

  el.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") setActive(i); });
  el.addEventListener("focus", () => setActive(i));

  el.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const n = (i + (e.key === "ArrowRight" ? 1 : -1) + els.length) % els.length;
      els[n].focus(); setActive(n);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const n = e.key === "Home" ? 0 : els.length - 1;
      els[n].focus(); setActive(n);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDetail(i);
    }
  });

  el.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    stopAutoplay();
    dragging = i;
    grabDX = e.clientX - sim.x[i];
    pointerDownAt = { x: e.clientX, y: e.clientY, moved: false };
    el.classList.add("is-grabbed");
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
    setActive(i);
  });

  el.addEventListener("pointermove", (e) => {
    if (dragging !== i) return;
    if (pointerDownAt && Math.abs(e.clientX - pointerDownAt.x) > 3) pointerDownAt.moved = true;
    const b = bounds();
    const nx = Math.max(b.min, Math.min(b.max, e.clientX - grabDX));
    sim.vx[i] = (nx - sim.x[i]) * 14;
    sim.x[i] = nx;
    kick();
  });

  const release = (e) => {
    if (dragging !== i) return;
    dragging = -1;
    el.classList.remove("is-grabbed");
    sim.vswing[i] += Math.max(-12, Math.min(12, sim.vx[i] * 0.012));
    kick();
    try { if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId); } catch (_) {}
  };
  el.addEventListener("pointerup", release);
  el.addEventListener("pointercancel", release);

  el.addEventListener("click", () => {
    const dragged = pointerDownAt && pointerDownAt.moved;
    pointerDownAt = null;
    if (dragged) return;                       // a slide is not a lift
    if (i !== active) { setActive(i); return; } // touch: first tap turns it
    openDetail(i);                             // then a tap lifts it off the rail
  });
});

/* ---------- lift off the rail ---------- */
const modal = document.getElementById("detail");
const scrim = document.getElementById("scrim");
let modalOpen = false;
let returnFocus = null;

function openDetail(i) {
  const item = ITEMS[i];
  returnFocus = els[i];
  modalOpen = true;
  stopAutoplay();
  document.getElementById("dName").textContent = item.name;
  document.getElementById("dTag").textContent = item.tag;
  document.getElementById("dDesc").textContent = item.description;
  document.getElementById("dSwatch").style.background = item.color;
  const front = document.getElementById("dFront");
  front.src = A + item.image;
  front.alt = item.name;
  document.getElementById("dBack").src = A + item.backImage;
  document.getElementById("dDetails").innerHTML =
    item.details.map((d) => `<li>${d}</li>`).join("");
  modal.hidden = false;
  scrim.hidden = false;
  document.body.classList.add("no-scroll");
  requestAnimationFrame(() => {
    modal.classList.add("is-open");
    scrim.classList.add("is-open");
    document.getElementById("dClose").focus();
  });
}

function closeDetail() {
  if (!modalOpen) return;
  modalOpen = false;
  modal.classList.remove("is-open");
  scrim.classList.remove("is-open");
  document.body.classList.remove("no-scroll");
  setTimeout(() => { modal.hidden = true; scrim.hidden = true; }, 220);
  if (returnFocus) returnFocus.focus();
}

document.getElementById("dClose").addEventListener("click", closeDetail);
scrim.addEventListener("click", closeDetail);
modal.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { e.preventDefault(); closeDetail(); return; }
  if (e.key !== "Tab") return;
  const f = [...modal.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')]
    .filter((n) => n.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDetail(); });

/* ---------- boot ---------- */
setFeature(0);
measure();
snapAll();
paint(0);

let resizeId = 0;
window.addEventListener("resize", () => {
  clearTimeout(resizeId);
  resizeId = setTimeout(() => { measure(); kick(); }, 80);
});
reduced.addEventListener("change", () => { if (reduced.matches) snapAll(); });
startAutoplay();
