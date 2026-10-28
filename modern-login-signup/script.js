/* 21st.dev — @pulseawan / modern-login-signup (vanilla clone)
 *
 * An email-first auth card floating over a canvas dot field: the dots react to
 * the pointer with a soft radial falloff, the card switches between sign-in and
 * sign-up, the email field validates, and the OAuth buttons acknowledge which
 * provider you picked instead of pretending to redirect. */

/* ---------------- canvas dot field ---------------- */
const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

const GAP = 26;
const DOT_R = 1.35;
const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
let dots = [];
let dpr = 1;
let raf = 0;
let visible = true;

function build() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  dots = [];
  const cols = Math.ceil(w / GAP) + 1;
  const rows = Math.ceil(h / GAP) + 1;
  const offX = (w - (cols - 1) * GAP) / 2;
  const offY = (h - (rows - 1) * GAP) / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push({
        x: offX + c * GAP,
        y: offY + r * GAP,
        // deterministic-ish variation so the field reads as printed, not uniform
        base: 0.06 + ((c * 7 + r * 13) % 11) / 90,
      });
    }
  }
  draw();
}

function draw() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);

  const radius = 190;
  for (let i = 0; i < dots.length; i++) {
    const d = dots[i];
    let a = d.base;
    if (pointer.x > -999) {
      const dx = d.x - pointer.x;
      const dy = d.y - pointer.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) {
        const t = 1 - dist / radius;
        a += t * t * 0.5;                     // soft radial falloff
      }
    }
    ctx.globalAlpha = Math.min(0.72, a);
    ctx.beginPath();
    ctx.arc(d.x, d.y, DOT_R, 0, Math.PI * 2);
    ctx.fillStyle = "#e6e6e6";
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function tick() {
  pointer.x += (pointer.tx - pointer.x) * 0.18;
  pointer.y += (pointer.ty - pointer.y) * 0.18;
  draw();
  const settled = Math.abs(pointer.tx - pointer.x) < 0.4 && Math.abs(pointer.ty - pointer.y) < 0.4;
  if (settled && pointer.x < -900) { raf = 0; return; }
  raf = requestAnimationFrame(tick);
}

function wake() {
  if (!raf) raf = requestAnimationFrame(tick);
}

window.addEventListener("pointermove", (e) => {
  if (reduced.matches) return;
  pointer.tx = e.clientX;
  pointer.ty = e.clientY;
  if (pointer.x < -900) { pointer.x = pointer.tx; pointer.y = pointer.ty; }
  wake();
});
window.addEventListener("pointerleave", () => {
  pointer.tx = -9999;
  pointer.ty = -9999;
  wake();
});

let resizeId = 0;
window.addEventListener("resize", () => {
  clearTimeout(resizeId);
  resizeId = setTimeout(build, 100);
});

document.addEventListener("visibilitychange", () => {
  visible = !document.hidden;
  if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
});

build();

/* ---------------- mode switch ---------------- */
const title = document.getElementById("title");
const sub = document.getElementById("sub");
const submit = document.getElementById("submit");
const switchText = document.getElementById("switchText");
const switchBtn = document.getElementById("switchBtn");
const status = document.getElementById("status");
const form = document.getElementById("form");
const email = document.getElementById("email");

let mode = "signin";

function setMode(next) {
  mode = next;
  const signup = mode === "signup";
  title.textContent = signup ? "Create your Account" : "Sign in to Account";
  sub.textContent = signup ? "Start with your work email." : "Sign in to your Account.";
  submit.textContent = signup ? "Continue with Email" : "Continue with Email";
  switchText.textContent = signup ? "Already have an account?" : "Don't have an account?";
  switchBtn.textContent = signup ? "Sign In" : "Sign Up";
  email.setAttribute("autocomplete", signup ? "new-password" : "email");
  status.classList.remove("is-on");
}

switchBtn.addEventListener("click", () => setMode(mode === "signin" ? "signup" : "signin"));

/* ---------------- submit ---------------- */
function say(msg) {
  status.textContent = msg;
  status.classList.add("is-on");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = email.value.trim();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  if (!valid) {
    email.setAttribute("aria-invalid", "true");
    email.focus();
    say("Enter a valid email address.");
    if (!reduced.matches) {
      email.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(-4px)" },
         { transform: "translateX(4px)" }, { transform: "translateX(0)" }],
        { duration: 240, easing: "ease-out" }
      );
    }
    return;
  }

  email.removeAttribute("aria-invalid");
  say(mode === "signup"
    ? `Sign-up link sent to ${value}.`
    : `Sign-in link sent to ${value}.`);
  submit.disabled = true;
  submit.style.opacity = "0.6";
  setTimeout(() => { submit.disabled = false; submit.style.opacity = ""; }, 1800);
});

email.addEventListener("input", () => email.removeAttribute("aria-invalid"));

/* ---------------- oauth ---------------- */
document.querySelectorAll(".oauth").forEach((btn) => {
  btn.addEventListener("click", () => {
    say(`${btn.dataset.provider} sign-in would open a consent window.`);
  });
});
