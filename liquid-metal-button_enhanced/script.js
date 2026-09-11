/**
 * Enhanced Liquid Metal Button Studio Script
 * Multi-palette metallic shader, real-time 3D tilt tracking, and flow control
 */

const FORMULATIONS = {
  mercury: {
    r: 255, g: 255, b: 255,
    halo: "rgba(255, 255, 255, 0.25)"
  },
  gold: {
    r: 245, g: 190, b: 60,
    halo: "rgba(245, 190, 60, 0.3)"
  },
  cyan: {
    r: 56, g: 189, b: 248,
    halo: "rgba(56, 189, 248, 0.3)"
  }
};

const canvas = document.getElementById("shader-canvas");
const ctx = canvas.getContext("2d");
const tiltAnchor = document.getElementById("tilt-anchor");
const tiltBox = document.getElementById("tilt-box");
const btnText = document.getElementById("btn-text");
const btnTextInput = document.getElementById("btn-text-input");
const speedSlider = document.getElementById("speed-slider");
const speedIndicator = document.getElementById("speed-indicator");
const tiltToggle = document.getElementById("tilt-toggle");
const actionTrigger = document.getElementById("action-trigger");
const actionToast = document.getElementById("action-toast");
const typeBtns = document.querySelectorAll(".type-btn");

let currentType = "mercury";
let baseSpeed = 0.02;
let speedMultiplier = 1.0;
let time = 0;
let isHovered = false;

function renderMetal() {
  const w = canvas.width;
  const h = canvas.height;

  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;
  const formula = FORMULATIONS[currentType];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = (x / w) * 2 - 1;
      const v = (y / h) * 2 - 1;

      const wave1 = Math.sin(u * 4.5 + time * 1.6);
      const wave2 = Math.cos(v * 4.0 - time * 1.3);
      const wave3 = Math.sin((u + v) * 3.2 + time * 2.2);

      const val = (wave1 + wave2 + wave3) / 3.0;
      const bright = Math.pow((val + 1) * 0.5, isHovered ? 2.0 : 3.4);

      const idx = (y * w + x) * 4;

      data[idx] = Math.min(255, Math.floor(bright * formula.r + 20));
      data[idx + 1] = Math.min(255, Math.floor(bright * formula.g + 20));
      data[idx + 2] = Math.min(255, Math.floor(bright * formula.b + 25));
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  time += (isHovered ? 0.04 : baseSpeed) * speedMultiplier;
  requestAnimationFrame(renderMetal);
}

// 3D Parallax Tilt Response
tiltAnchor.addEventListener("mousemove", (e) => {
  if (!tiltToggle.checked) return;
  const rect = tiltAnchor.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;

  const tiltX = (y / (rect.height / 2)) * -14;
  const tiltY = (x / (rect.width / 2)) * 14;

  tiltBox.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
});

tiltAnchor.addEventListener("mouseenter", () => {
  isHovered = true;
});

tiltAnchor.addEventListener("mouseleave", () => {
  isHovered = false;
  tiltBox.style.transform = `rotateX(0deg) rotateY(0deg)`;
});

actionTrigger.addEventListener("click", () => {
  actionToast.classList.remove("opacity-0");
  setTimeout(() => {
    actionToast.classList.add("opacity-0");
  }, 1500);
});

typeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    currentType = btn.dataset.type;
    document.documentElement.style.setProperty("--halo-color", FORMULATIONS[currentType].halo);
    typeBtns.forEach(b => {
      if (b.dataset.type === currentType) {
        b.className = "type-btn active py-2 px-2.5 rounded-lg border border-white/40 bg-white/10 text-white text-xs font-semibold text-center transition-colors";
      } else {
        b.className = "type-btn py-2 px-2.5 rounded-lg border border-slate-700 bg-slate-800/40 text-slate-300 text-xs font-semibold text-center transition-colors";
      }
    });
  });
});

speedSlider.addEventListener("input", (e) => {
  speedMultiplier = parseFloat(e.target.value);
  speedIndicator.textContent = `${speedMultiplier.toFixed(1)}x`;
});

btnTextInput.addEventListener("input", (e) => {
  btnText.textContent = e.target.value || "Get Started";
});

document.addEventListener("DOMContentLoaded", () => {
  renderMetal();
  if (window.lucide) window.lucide.createIcons();
});
