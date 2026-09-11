/**
 * Enhanced Coupon Reveal Button Script
 * Dynamic themes, customizable code & labels, and reset triggers
 */

const THEMES = {
  blue: {
    primaryGrad: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    borderDashed: "border-blue-500 bg-blue-500/10 text-blue-400",
    pill: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    stop1: "#60a5fa",
    stop2: "#3b82f6",
    stop3: "#1d4ed8"
  },
  emerald: {
    primaryGrad: "linear-gradient(135deg, #10b981, #047857)",
    borderDashed: "border-emerald-500 bg-emerald-500/10 text-emerald-400",
    pill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    stop1: "#34d399",
    stop2: "#10b981",
    stop3: "#047857"
  },
  violet: {
    primaryGrad: "linear-gradient(135deg, #8b5cf6, #5b21b6)",
    borderDashed: "border-purple-500 bg-purple-500/10 text-purple-400",
    pill: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    stop1: "#a78bfa",
    stop2: "#8b5cf6",
    stop3: "#5b21b6"
  }
};

const btn = document.getElementById("enh-btn");
const backplate = document.getElementById("enh-backplate");
const revealLayer = document.getElementById("enh-reveal");
const codePill = document.getElementById("enh-pill");
const copyBadge = document.getElementById("enh-copy-badge");
const copiedMsg = document.getElementById("enh-copied");
const backHint = document.getElementById("enh-back-hint");
const frontLayer = document.getElementById("enh-front");
const frontText = document.getElementById("enh-front-text");
const flap = document.getElementById("enh-flap");
const couponInput = document.getElementById("coupon-input");
const frontInput = document.getElementById("front-input");
const resetBtn = document.getElementById("reset-state-btn");
const themeBtns = document.querySelectorAll(".theme-btn");

let currentTheme = "blue";
let isHovered = false;
let isRevealed = false;
let isCopied = false;
let btnWidth = 384;

function updateDimensions() {
  btnWidth = btn.getBoundingClientRect().width || 384;
  updateVisualState();
}

function updateVisualState() {
  let splitX;
  if (isRevealed) {
    splitX = -48;
  } else if (isHovered) {
    splitX = btnWidth - 56;
  } else {
    splitX = btnWidth - 28;
  }

  frontLayer.style.clipPath = `polygon(0px 0px, ${splitX}px 0px, ${splitX - 28}px 100%, 0px 100%)`;
  flap.style.left = `${splitX - 42}px`;

  if (isRevealed) {
    flap.style.opacity = "0";
    flap.style.transform = "scale(0.5)";
  } else {
    flap.style.opacity = "1";
    flap.style.transform = "scale(1)";
  }

  if (isRevealed || isHovered) {
    revealLayer.classList.remove("opacity-0");
    revealLayer.classList.add("opacity-100");
    backHint.classList.remove("opacity-100");
    backHint.classList.add("opacity-0");
  } else {
    revealLayer.classList.remove("opacity-100");
    revealLayer.classList.add("opacity-0");
    backHint.classList.remove("opacity-0");
    backHint.classList.add("opacity-100");
  }

  if (isCopied) {
    codePill.classList.add("hidden");
    copyBadge.classList.add("hidden");
    copiedMsg.classList.remove("hidden");
  } else {
    codePill.classList.remove("hidden");
    copyBadge.classList.remove("hidden");
    copiedMsg.classList.add("hidden");
  }
}

function applyTheme(name) {
  currentTheme = name;
  const cfg = THEMES[name];
  frontLayer.style.background = cfg.primaryGrad;
  
  const stops = document.querySelectorAll("#enhGradient stop");
  if (stops.length >= 3) {
    stops[0].setAttribute("stop-color", cfg.stop1);
    stops[1].setAttribute("stop-color", cfg.stop2);
    stops[2].setAttribute("stop-color", cfg.stop3);
  }

  themeBtns.forEach(b => {
    if (b.dataset.theme === name) {
      b.className = `theme-btn active py-2 px-2.5 rounded-lg border border-blue-500/50 bg-blue-500/10 text-blue-400 text-xs font-semibold text-center transition-colors`;
    } else {
      b.className = `theme-btn py-2 px-2.5 rounded-lg border border-slate-700 bg-slate-800/40 text-slate-300 text-xs font-semibold text-center transition-colors`;
    }
  });
}

btn.addEventListener("mouseenter", () => {
  isHovered = true;
  updateVisualState();
});

btn.addEventListener("mouseleave", () => {
  isHovered = false;
  updateVisualState();
});

btn.addEventListener("click", () => {
  if (!isRevealed) {
    isRevealed = true;
    updateVisualState();
  } else if (!isCopied) {
    const code = codePill.textContent;
    navigator.clipboard.writeText(code).then(() => {
      isCopied = true;
      updateVisualState();
      setTimeout(() => {
        isCopied = false;
        updateVisualState();
      }, 2200);
    });
  }
});

resetBtn.addEventListener("click", () => {
  isRevealed = false;
  isCopied = false;
  updateVisualState();
});

couponInput.addEventListener("input", (e) => {
  codePill.textContent = (e.target.value || "SEADON20").toUpperCase();
});

frontInput.addEventListener("input", (e) => {
  frontText.textContent = e.target.value || "Reveal 20% Off Coupon";
});

themeBtns.forEach(b => {
  b.addEventListener("click", () => applyTheme(b.dataset.theme));
});

window.addEventListener("resize", updateDimensions);

document.addEventListener("DOMContentLoaded", () => {
  updateDimensions();
  applyTheme("blue");
  if (window.lucide) window.lucide.createIcons();
});
