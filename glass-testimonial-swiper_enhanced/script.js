/**
 * Enhanced Glass Testimonial Swiper Script
 * Features auto-advance timer, keyboard arrows, and responsive gesture handling
 */

const REVIEWS = [
  {
    id: 1,
    initials: "SM",
    name: "Sarah Mitchell",
    role: "VP of Engineering at TechFlow",
    rating: 5,
    quote: "This platform has completely transformed how our team collaborates. The AI-powered analytics provide insights we never had before, and the performance improvements are remarkable. Best investment we've made this year.",
    companyLogo: "TechFlow Labs",
    tags: ["FEATURED", "Enterprise", "Productivity"]
  },
  {
    id: 2,
    initials: "AK",
    name: "Alex Kumar",
    role: "Lead Product Designer at Aura",
    rating: 5,
    quote: "The visual fidelity and animation ergonomics here are unmatched. Integrating these components took minutes instead of days of custom engineering. Our users immediately praised the new interfaces.",
    companyLogo: "Aura Design",
    tags: ["Design System", "UI/UX"]
  },
  {
    id: 3,
    initials: "EL",
    name: "Elena Rostova",
    role: "Founder & CTO at Nexus Core",
    rating: 5,
    quote: "We replaced our legacy UI component library in a single sprint. The glassmorphism and spring physics run at a solid 60 FPS even on mid-tier mobile hardware.",
    companyLogo: "Nexus Core",
    tags: ["Performance", "Mobile First"]
  },
  {
    id: 4,
    initials: "MW",
    name: "Marcus Vance",
    role: "Staff Infrastructure Architect",
    rating: 5,
    quote: "Zero build dependencies and purely vanilla execution means our security compliance team approved deployment on the same afternoon. Extremely impressive engineering.",
    companyLogo: "Vance Systems",
    tags: ["Security", "Vanilla"]
  }
];

let currentIndex = 0;
let autoTimer = null;
let isAutoPlaying = false;

const viewport = document.getElementById("stack-viewport");
const dots = document.getElementById("enhanced-dots");
const btnPrev = document.getElementById("prev-action");
const btnNext = document.getElementById("next-action");
const btnAuto = document.getElementById("btn-auto");
const playIcon = document.getElementById("play-icon");
const playText = document.getElementById("play-text");

function render() {
  viewport.innerHTML = "";
  dots.innerHTML = "";

  REVIEWS.forEach((item, idx) => {
    const diff = (idx - currentIndex + REVIEWS.length) % REVIEWS.length;

    const card = document.createElement("div");
    card.className = "enh-card absolute w-full max-w-lg p-7 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-2xl flex flex-col justify-between cursor-pointer";

    const scale = 1 - diff * 0.055;
    const translateY = diff * 16;
    const opacity = diff === 0 ? 1 : diff === 1 ? 0.75 : diff === 2 ? 0.4 : 0;
    const zIndex = 30 - diff;

    card.style.transform = `translateY(${translateY}px) scale(${scale})`;
    card.style.opacity = opacity;
    card.style.zIndex = zIndex;

    const tagsHtml = item.tags.map(t => {
      const isFeat = t === "FEATURED";
      return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold ${
        isFeat ? "bg-amber-400/15 text-amber-300 border border-amber-400/30" : "bg-slate-800 text-slate-300"
      }">${t}</span>`;
    }).join("");

    card.innerHTML = `
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-slate-950 font-mono shadow-md">
            ${item.initials}
          </div>
          <div>
            <h4 class="text-sm font-bold text-white leading-tight">${item.name}</h4>
            <p class="text-[11px] text-slate-400 mt-0.5">${item.role}</p>
          </div>
        </div>
        <div class="flex gap-1.5">${tagsHtml}</div>
      </div>

      <p class="text-xs text-slate-200 leading-relaxed italic mb-6">
        "${item.quote}"
      </p>

      <div class="flex items-center justify-between pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
        <span class="flex items-center gap-1.5"><i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-400"></i> ${item.companyLogo}</span>
        <span class="text-amber-400">★★★★★</span>
      </div>
    `;

    card.addEventListener("click", () => {
      if (diff > 0) {
        currentIndex = idx;
        render();
      }
    });

    viewport.appendChild(card);

    // Dot
    const dot = document.createElement("button");
    dot.className = `w-2 h-2 rounded-full transition-all duration-300 ${
      idx === currentIndex ? "bg-sky-400 w-6" : "bg-slate-700 hover:bg-slate-500"
    }`;
    dot.addEventListener("click", () => {
      currentIndex = idx;
      render();
    });
    dots.appendChild(dot);
  });

  if (window.lucide) window.lucide.createIcons();
}

function next() {
  currentIndex = (currentIndex + 1) % REVIEWS.length;
  render();
}

function prev() {
  currentIndex = (currentIndex - 1 + REVIEWS.length) % REVIEWS.length;
  render();
}

btnNext.addEventListener("click", () => next());
btnPrev.addEventListener("click", () => prev());

btnAuto.addEventListener("click", () => {
  isAutoPlaying = !isAutoPlaying;
  if (isAutoPlaying) {
    playText.textContent = "Pause";
    playIcon.setAttribute("data-lucide", "pause");
    autoTimer = setInterval(next, 4000);
  } else {
    playText.textContent = "Auto Rotate";
    playIcon.setAttribute("data-lucide", "play");
    clearInterval(autoTimer);
  }
  if (window.lucide) window.lucide.createIcons();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();
});

document.addEventListener("DOMContentLoaded", () => {
  render();
});
