/**
 * Enhanced Motion Button Studio Script
 * Manages live theme switching, bracket sizing, icons, and spring feedback
 */

const PALETTES = {
  teal: {
    accent: "#2CD4BD",
    textColor: "#042f2e",
    bracketHover: "#5eead4",
    iconClass: "text-emerald-400"
  },
  amber: {
    accent: "#F59E0B",
    textColor: "#451a03",
    bracketHover: "#fcd34d",
    iconClass: "text-amber-400"
  },
  crimson: {
    accent: "#EF4444",
    textColor: "#450a0a",
    bracketHover: "#fca5a5",
    iconClass: "text-red-400"
  }
};

const wrap = document.getElementById("enhanced-btn-wrap");
const labelText = document.getElementById("btn-label-text");
const labelInput = document.getElementById("label-input");
const btnIcon = document.getElementById("btn-icon");
const iconSelect = document.getElementById("icon-select");
const bracketSlider = document.getElementById("bracket-slider");
const bracketSizeVal = document.getElementById("bracket-size-val");
const paletteBtns = document.querySelectorAll(".palette-btn");
const tapToast = document.getElementById("tap-toast");
const copyBtn = document.getElementById("copy-btn");
const brackets = document.querySelectorAll(".bracket-enh");

let currentPalette = "teal";
let isTap = false;
let tapTimeout = null;

function applyPalette(key) {
  currentPalette = key;
  const config = PALETTES[key];
  document.documentElement.style.setProperty("--accent-active", config.accent);
  document.documentElement.style.setProperty("--bracket-hover", config.bracketHover);

  paletteBtns.forEach(btn => {
    if (btn.dataset.palette === key) {
      btn.classList.add("border-emerald-500/50", "bg-emerald-500/10", "text-emerald-400");
      btn.classList.remove("border-slate-700", "bg-slate-800/40", "text-slate-300");
    } else {
      btn.classList.remove("border-emerald-500/50", "bg-emerald-500/10", "text-emerald-400");
      btn.classList.add("border-slate-700", "bg-slate-800/40", "text-slate-300");
    }
  });

  btnIcon.className = `w-4 h-4 ${config.iconClass} relative z-20 transition-transform duration-300`;
}

function triggerTap() {
  if (isTap) return;
  isTap = true;
  wrap.classList.add("is-active-tap");

  const config = PALETTES[currentPalette];
  labelText.style.color = config.textColor;

  tapToast.classList.remove("opacity-0");

  clearTimeout(tapTimeout);
  tapTimeout = setTimeout(() => {
    isTap = false;
    wrap.classList.remove("is-active-tap");
    labelText.style.color = "";
    tapToast.classList.add("opacity-0");
  }, 500);
}

wrap.addEventListener("click", () => triggerTap());
wrap.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    triggerTap();
  }
});

paletteBtns.forEach(btn => {
  btn.addEventListener("click", () => applyPalette(btn.dataset.palette));
});

bracketSlider.addEventListener("input", (e) => {
  const val = e.target.value;
  bracketSizeVal.textContent = `${val}px`;
  brackets.forEach(b => {
    b.style.width = `${val}px`;
    b.style.height = `${val}px`;
  });
});

labelInput.addEventListener("input", (e) => {
  labelText.textContent = e.target.value || "JOIN THE HORDE";
});

iconSelect.addEventListener("change", (e) => {
  const val = e.target.value;
  if (val === "none") {
    btnIcon.classList.add("hidden");
  } else {
    btnIcon.classList.remove("hidden");
    btnIcon.setAttribute("data-lucide", val);
    if (window.lucide) window.lucide.createIcons();
  }
});

copyBtn.addEventListener("click", () => {
  const code = `<div class="relative inline-block cursor-pointer" tabindex="0">
  <div class="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-slate-700 z-20"></div>
  <div class="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-slate-700 z-20"></div>
  <div class="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-slate-700 z-20"></div>
  <div class="absolute right-0 bottom-0 w-3 h-3 border-r-2 border-b-2 border-slate-700 z-20"></div>

  <button class="relative overflow-hidden px-10 py-3.5 font-bold uppercase tracking-wider text-sm flex items-center gap-3 border-0 bg-transparent text-white cursor-pointer">
    <span class="absolute inset-0 z-0 bg-[repeating-linear-gradient(315deg,rgba(255,255,255,0.06)_0,rgba(255,255,255,0.06)_1px,transparent_0,transparent_50%)] [background-size:8px_8px]"></span>
    <span class="absolute inset-0 z-10 origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100 bg-[#121826]"></span>
    <span class="relative z-20">${labelText.textContent}</span>
  </button>
</div>`;

  navigator.clipboard.writeText(code).then(() => {
    copyBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-emerald-400"></i><span class="text-emerald-400">Copied to Clipboard!</span>`;
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => {
      copyBtn.innerHTML = `<i data-lucide="copy" class="w-4 h-4"></i><span>Copy HTML/CSS Snippet</span>`;
      if (window.lucide) window.lucide.createIcons();
    }, 2000);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  applyPalette("teal");
  if (window.lucide) window.lucide.createIcons();
});
