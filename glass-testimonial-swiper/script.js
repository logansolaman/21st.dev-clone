/**
 * 1-to-1 Vanilla Script for Glass Testimonial Swiper
 * Original component by @jahed / Easemize
 */

const REVIEWS = [
  {
    id: 1,
    initials: "SM",
    name: "Sarah Mitchell",
    role: "VP of Engineering at TechFlow",
    quote: "This platform has completely transformed how our team collaborates. The AI-powered analytics provide insights we never had before, and the performance improvements are remarkable. Best investment we've made this year.",
    tags: [
      { text: "FEATURED", type: "featured" },
      { text: "Enterprise", type: "default" },
      { text: "Productivity", type: "default" }
    ]
  },
  {
    id: 2,
    initials: "AK",
    name: "Alex Kumar",
    role: "Lead Product Designer at Aura",
    quote: "The visual fidelity and animation ergonomics here are unmatched. Integrating these components took minutes instead of days of custom engineering. Our users immediately praised the new interfaces.",
    tags: [
      { text: "Design System", type: "default" },
      { text: "UI/UX", type: "default" }
    ]
  },
  {
    id: 3,
    initials: "EL",
    name: "Elena Rostova",
    role: "Founder & CTO at Nexus Core",
    quote: "We replaced our legacy UI component library in a single sprint. The glassmorphism and spring physics run at a solid 60 FPS even on mid-tier mobile hardware.",
    tags: [
      { text: "Performance", type: "default" },
      { text: "Mobile First", type: "default" }
    ]
  }
];

let currentIndex = 0;
const stackContainer = document.getElementById("stack-container");
const dotsContainer = document.getElementById("pagination-dots");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");

function renderStack() {
  stackContainer.innerHTML = "";
  dotsContainer.innerHTML = "";

  REVIEWS.forEach((rev, idx) => {
    // Relative offset to current index
    const diff = (idx - currentIndex + REVIEWS.length) % REVIEWS.length;
    
    // Stack calculation: 0 = front, 1 = behind, 2 = further behind
    const cardEl = document.createElement("div");
    cardEl.className = "testimonial-card absolute w-full max-w-md p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl flex flex-col justify-between cursor-pointer";
    
    // 3D Stacking transform
    const scale = 1 - diff * 0.05;
    const translateY = diff * 14;
    const opacity = diff === 0 ? 1 : diff === 1 ? 0.7 : 0.35;
    const zIndex = 30 - diff;

    cardEl.style.transform = `translateY(${translateY}px) scale(${scale})`;
    cardEl.style.opacity = diff > 2 ? 0 : opacity;
    cardEl.style.zIndex = zIndex;

    const tagsHtml = rev.tags.map(t => {
      const isFeat = t.type === "featured";
      return `<span class="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold ${
        isFeat ? "bg-amber-400/15 text-amber-300 border border-amber-400/30" : "bg-white/10 text-white/70"
      }">${t.text}</span>`;
    }).join("");

    cardEl.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-black font-mono shadow-md">
            ${rev.initials}
          </div>
          <div>
            <h4 class="text-sm font-semibold text-white leading-tight">${rev.name}</h4>
            <p class="text-[11px] text-white/50">${rev.role}</p>
          </div>
        </div>
        <div class="flex gap-1.5">${tagsHtml}</div>
      </div>

      <p class="text-xs text-white/80 leading-relaxed italic mb-6">
        "${rev.quote}"
      </p>

      <div class="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-white/40 font-mono">
        <span>Verified Customer Review</span>
        <span>★★★★★</span>
      </div>
    `;

    cardEl.addEventListener("click", () => {
      if (diff > 0) {
        currentIndex = idx;
        renderStack();
      }
    });

    stackContainer.appendChild(cardEl);

    // Dot
    const dot = document.createElement("button");
    dot.className = `w-2 h-2 rounded-full transition-all duration-300 ${
      idx === currentIndex ? "bg-white w-6" : "bg-white/20 hover:bg-white/40"
    }`;
    dot.addEventListener("click", () => {
      currentIndex = idx;
      renderStack();
    });
    dotsContainer.appendChild(dot);
  });
}

btnPrev.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + REVIEWS.length) % REVIEWS.length;
  renderStack();
});

btnNext.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % REVIEWS.length;
  renderStack();
});

document.addEventListener("DOMContentLoaded", () => {
  renderStack();
});
