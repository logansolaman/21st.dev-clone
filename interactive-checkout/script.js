/* 21st.dev — @kokonutd / interactive-checkout (vanilla clone)
 *
 * A shop / cart pair: add a product, the cart count and the total roll into
 * place digit by digit, quantities step, lines remove themselves, and the
 * checkout button stays disabled until there is something to pay for. */

const SHOE = "assets/shoe.png";

const PRODUCTS = [
  { id: "1", name: "Air Max 90", price: 129.99, category: "Running", color: "Black/White" },
  { id: "2", name: "Ultra Boost", price: 179.99, category: "Performance", color: "Grey/Blue" },
  { id: "3", name: "Classic Trainer", price: 89.99, category: "Casual", color: "White/Red" },
];

const ICON = {
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M5 12h14"></path><path d="M12 5v14"></path></svg>`,
  minus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M5 12h14"></path></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,
};

const listEl = document.getElementById("list");
const linesEl = document.getElementById("lines");
const emptyEl = document.getElementById("empty");
const countEl = document.getElementById("count");
const totalEl = document.getElementById("total");
const totalSr = document.getElementById("totalSr");
const checkoutEl = document.getElementById("checkout");
const toastEl = document.getElementById("toast");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

/** cart: id -> qty */
const cart = new Map();

/* ---------------- rolling digits ---------------- */
function makeReel(digitChar) {
  const d = document.createElement("span");
  d.className = "digit";
  const reel = document.createElement("span");
  reel.className = "reel";
  for (let n = 0; n <= 9; n++) {
    const s = document.createElement("span");
    s.textContent = String(n);
    reel.appendChild(s);
  }
  d.appendChild(reel);
  d.dataset.digit = digitChar;
  return d;
}

/** renders "399.97" into reels, reusing existing ones so they can roll */
function setFlow(el, text) {
  const chars = [...text];
  const existing = [...el.children];

  if (existing.length !== chars.length) {
    el.textContent = "";
    chars.forEach((ch) => {
      if (/\d/.test(ch)) el.appendChild(makeReel(ch));
      else {
        const s = document.createElement("span");
        s.className = "sep";
        s.textContent = ch;
        el.appendChild(s);
      }
    });
  } else {
    chars.forEach((ch, i) => {
      const node = el.children[i];
      if (/\d/.test(ch)) { node.dataset.digit = ch; }
      else node.textContent = ch;
    });
  }

  // roll each reel to its digit (staggered, like number-flow)
  [...el.children].forEach((node, i) => {
    if (!node.classList || !node.classList.contains("digit")) return;
    const target = Number(node.dataset.digit);
    const reel = node.querySelector(".reel");
    const prev = Number(node.dataset.shown ?? "-1");
    if (prev === target) return;
    if (prev < 0) {
      reel.style.transition = "none";
      reel.style.transform = `translateY(-${target}em)`;
      // force layout, then re-enable the transition for the next change
      void reel.offsetHeight;
      reel.style.transition = "";
    } else {
      reel.style.transitionDelay = reduced.matches ? "0ms" : `${i * 28}ms`;
      reel.style.transform = `translateY(-${target}em)`;
    }
    node.dataset.shown = String(target);
  });
}

/* ---------------- products ---------------- */
function productRow(p, i) {
  const row = document.createElement("div");
  row.className = "product";
  row.setAttribute("role", "listitem");
  row.style.setProperty("--d", `${i * 70}ms`);
  row.innerHTML = `
    <div class="left">
      <div class="thumb">
        <img src="${SHOE}" alt="${p.name}" loading="lazy" draggable="false" />
      </div>
      <div class="meta">
        <div class="name-row">
          <span class="name">${p.name}</span>
          <span class="badge">${p.category}</span>
        </div>
        <div class="sub">
          <span>$${p.price.toFixed(2)}</span>
          <span aria-hidden="true">•</span>
          <span>${p.color}</span>
        </div>
      </div>
    </div>
    <button class="btn add" type="button" data-add="${p.id}" aria-label="Add ${p.name} to cart">
      ${ICON.plus}Add
    </button>`;
  row.querySelector("[data-add]").addEventListener("click", (e) => {
    addToCart(p.id);
    const btn = e.currentTarget;
    btn.animate(
      [{ transform: "scale(1)" }, { transform: "scale(0.94)" }, { transform: "scale(1)" }],
      { duration: 200, easing: "ease-out" }
    );
  });
  return row;
}
PRODUCTS.forEach((p, i) => listEl.appendChild(productRow(p, i)));

/* ---------------- cart ---------------- */
function money(n) {
  return n.toFixed(2);
}

function cartCount() {
  let n = 0;
  for (const q of cart.values()) n += q;
  return n;
}

function cartTotal() {
  let t = 0;
  for (const [id, q] of cart) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (p) t += p.price * q;
  }
  return t;
}

function render() {
  const ids = [...cart.keys()];
  emptyEl.style.display = ids.length ? "none" : "grid";

  // rebuild line items (cheap, and keeps the order in sync with insertion)
  linesEl.querySelectorAll(".line").forEach((n) => n.remove());
  ids.forEach((id) => {
    const p = PRODUCTS.find((x) => x.id === id);
    const q = cart.get(id);
    const line = document.createElement("div");
    line.className = "line";
    line.setAttribute("role", "listitem");
    line.innerHTML = `
      <div class="body">
        <div class="top">
          <span class="nm">${p.name}</span>
          <button class="icon-btn remove" type="button" data-remove="${id}"
                  aria-label="Remove ${p.name} from cart">${ICON.x}</button>
        </div>
        <div class="bottom">
          <div class="stepper">
            <button class="icon-btn" type="button" data-dec="${id}"
                    aria-label="Decrease quantity of ${p.name}">${ICON.minus}</button>
            <span class="q" data-qty="${id}">${q}</span>
            <button class="icon-btn" type="button" data-inc="${id}"
                    aria-label="Increase quantity of ${p.name}">${ICON.plus}</button>
          </div>
          <span class="amt">$${(p.price * q).toFixed(2)}</span>
        </div>
      </div>`;
    linesEl.appendChild(line);
  });

  countEl.textContent = String(cartCount());
  const amount = money(cartTotal());
  setFlow(totalEl, amount);
  totalSr.textContent = `$${amount}`;
  checkoutEl.disabled = cart.size === 0;
}

linesEl.addEventListener("click", (e) => {
  const inc = e.target.closest("[data-inc]");
  const dec = e.target.closest("[data-dec]");
  const rem = e.target.closest("[data-remove]");
  if (inc) {
    const id = inc.dataset.inc;
    cart.set(id, cart.get(id) + 1);
    render();
  } else if (dec) {
    const id = dec.dataset.dec;
    const q = cart.get(id) - 1;
    if (q <= 0) removeLine(id);
    else { cart.set(id, q); render(); }
  } else if (rem) {
    removeLine(rem.dataset.remove);
  }
});

function removeLine(id) {
  const btn = linesEl.querySelector(`[data-remove="${id}"]`);
  const line = btn ? btn.closest(".line") : null;
  const finish = () => { cart.delete(id); render(); };
  if (line && !reduced.matches) {
    line.classList.add("removing");
    line.addEventListener("animationend", finish, { once: true });
    setTimeout(finish, 260);   // safety net if the animation never fires
  } else {
    finish();
  }
}

function addToCart(id) {
  cart.set(id, (cart.get(id) || 0) + 1);
  render();
  const lines = [...linesEl.querySelectorAll(".line")];
  const last = lines[lines.length - 1];
  if (last && !reduced.matches) {
    last.animate(
      [{ boxShadow: "0 0 0 0 rgba(0,0,0,0)" }, { boxShadow: "0 0 0 2px rgba(0,0,0,0.06)" },
       { boxShadow: "0 0 0 0 rgba(0,0,0,0)" }],
      { duration: 520, easing: "ease-out" }
    );
  }
}

/* ---------------- checkout ---------------- */
let toastTimer = 0;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2200);
}

checkoutEl.addEventListener("click", () => {
  if (!cart.size) return;
  toast(`Checking out ${cartCount()} item${cartCount() > 1 ? "s" : ""} · $${money(cartTotal())}`);
});

/* ---------------- boot ---------------- */
setFlow(totalEl, "0.00");
requestAnimationFrame(() => {
  checkoutEl.disabled = true;
});

// theme follows the preview iframe (?theme=dark) or the OS
const q = new URL(window.location.href).searchParams.get("theme");
const dark = q ? q === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.classList.toggle("dark", dark);
