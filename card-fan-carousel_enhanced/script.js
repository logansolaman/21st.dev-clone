/**
 * Enhanced Card Fan Carousel
 * Adds:
 * 1. Rich card metadata (titles, descriptions, categories)
 * 2. Click-to-center capability on any visible fan card
 * 3. Lightbox zoom modal with keyboard ESC handling
 * 4. Autoplay toggle with smooth cycling
 * 5. Pagination dot indicators and dynamic counter
 * 6. Responsive touch swiping
 */

const ENHANCED_CARDS = [
  {
    title: "Mountain Landscape",
    category: "Alps Expedition",
    desc: "Majestic peaks rising through alpine atmosphere and morning high-altitude mist.",
    imgUrl: "https://cdn.21st.dev/assets/mirror/a6/a61a357faccddd302e85600234a02350a27f21b4cc8b3531578991614c050151.jpg",
    alt: "Mountain landscape",
  },
  {
    title: "City Night",
    category: "Urban Grid",
    desc: "Dynamic long-exposure traffic streams through towering illuminated skyscrapers.",
    imgUrl: "https://cdn.21st.dev/assets/mirror/9d/9d12401d835b58b284c6380d9f9c745112d6e2ed6cc51942982d42ae1d8e08b0.jpg",
    alt: "City night",
  },
  {
    title: "Foggy Forest",
    category: "Wilderness",
    desc: "Quiet evergreen woodlands blanketed in dense Pacific Northwest coastal fog.",
    imgUrl: "https://cdn.21st.dev/assets/mirror/4c/4c0990c5eee66fc437f8e0ca2175c48ed6bebd9b3b6e45f1ac9b3542ada80eff.jpg",
    alt: "Foggy forest",
  },
  {
    title: "Sunlit Woods",
    category: "Flora Sanctuary",
    desc: "Golden hour beams penetrating through ancient old-growth canopy leaves.",
    imgUrl: "https://cdn.21st.dev/assets/mirror/05/05536dea31a97c7c4243f835d48e2c487cfeead267d4651a9b515987bef18e61.jpg",
    alt: "Sunlit woods",
  },
  {
    title: "Tropical Beach",
    category: "Coastline",
    desc: "Crystal turquoise waters gently washing over soft white coral sands.",
    imgUrl: "https://cdn.21st.dev/assets/mirror/fe/fe3c057ea3c04ecd58640df79ace90545c86fc0e267b7cb87e4da93c8d0d0ffc.jpg",
    alt: "Tropical beach",
  },
  {
    title: "Starry Mountain",
    category: "Astro Night",
    desc: "The Milky Way galactic core shining vividly above a serene dark ridge.",
    imgUrl: "https://cdn.21st.dev/assets/mirror/ec/ec33bb1d53aef764ed557037ded0bf376df17ceb6de92411b60d8edcd68e75b2.jpg",
    alt: "Starry mountain",
  },
  {
    title: "Golden Sunset",
    category: "Horizon",
    desc: "Warm amber and violet sunset gradients washing across the open prairie.",
    imgUrl: "https://cdn.21st.dev/assets/mirror/10/109a67c3a7eab23436b0fc0e45a2bdfc722c97cff452c14a2e5944e200c56d98.jpg",
    alt: "Golden sunset",
  },
  {
    title: "Lake Reflection",
    category: "Still Waters",
    desc: "Mirror-flat glacial water reflecting snow-capped peaks with flawless symmetry.",
    imgUrl: "https://cdn.21st.dev/assets/mirror/9d/9d1fd650945e154a1a414af7188e43d1f0e334557c1ad2cf25315e4b39a98f96.jpg",
    alt: "Lake reflection",
  },
  {
    title: "Green Valley",
    category: "Highlands",
    desc: "Lush rolling emerald meadows carved by ancient glacial rivers.",
    imgUrl: "https://cdn.21st.dev/assets/mirror/d2/d2b6671fa0140e374b5d7cc1c4a6b2210b48f304ff472a88a2ea1b4ca52f5b48.jpg",
    alt: "Green valley",
  },
  {
    title: "Sunbeam Nature",
    category: "Atmosphere",
    desc: "Ethereal atmospheric crepuscular rays illuminating a tranquil river valley.",
    imgUrl: "https://cdn.21st.dev/assets/mirror/1a/1adc3553fd7cb37113b52f179fc82de7ba497a8503afa2e1f27f717aba09a2bc.jpg",
    alt: "Sunbeam nature",
  },
];

const VISIBLE_FAN_COUNT = 7;
const CENTER_SLOT = 3;

class EnhancedCardFanCarousel {
  constructor(cards) {
    this.cards = cards;
    this.total = cards.length;
    this.currentIndex = CENTER_SLOT;
    
    this.isAnimating = false;
    this.hasEntered = false;
    this.direction = null;
    this.visibleSet = new Set();
    this.hoveredSlot = null;
    this.hoverTimeout = null;
    this.autoplayInterval = null;
    this.isAutoplaying = false;

    // Elements
    this.container = document.getElementById("fan-container");
    this.btnPrev = document.getElementById("btn-prev");
    this.btnNext = document.getElementById("btn-next");
    this.btnAutoplay = document.getElementById("btn-autoplay");
    this.autoplayIcon = document.getElementById("autoplay-icon");
    this.autoplayText = document.getElementById("autoplay-text");
    this.dotsContainer = document.getElementById("pagination-dots");

    // Meta Pod
    this.metaCategory = document.getElementById("active-category");
    this.metaCounter = document.getElementById("active-counter");
    this.metaTitle = document.getElementById("active-title");
    this.metaDesc = document.getElementById("active-desc");

    // Lightbox
    this.lightboxModal = document.getElementById("lightbox-modal");
    this.lightboxImg = document.getElementById("lightbox-img");
    this.lightboxTitle = document.getElementById("lightbox-title");
    this.lightboxDesc = document.getElementById("lightbox-desc");
    this.lightboxClose = document.getElementById("lightbox-close");

    this.init();
  }

  init() {
    this.buildDom();
    this.buildDots();
    this.updateLayout(true);
    this.updateMeta();
    this.bindEvents();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  buildDom() {
    this.container.innerHTML = "";
    this.cardElements = this.cards.map((card, idx) => {
      const el = document.createElement("div");
      el.className = "fan-card-enhanced group";
      el.dataset.index = idx;
      el.innerHTML = `
        <div class="relative w-full h-full overflow-hidden bg-slate-900">
          <img loading="lazy" alt="${card.alt}" class="absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-500 group-hover:scale-105" src="${card.imgUrl}">
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20 opacity-80 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="absolute bottom-0 inset-x-0 p-4 z-30 flex flex-col justify-end text-left">
            <span class="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-semibold mb-0.5">${card.category}</span>
            <h3 class="text-sm font-bold text-white leading-snug">${card.title}</h3>
          </div>

          <button class="expand-btn absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30 hover:bg-black/80" title="Expand image">
            <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `;

      // Expand modal click
      const expandBtn = el.querySelector(".expand-btn");
      expandBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openLightbox(card);
      });

      this.container.appendChild(el);
      return el;
    });
  }

  buildDots() {
    this.dotsContainer.innerHTML = "";
    this.cards.forEach((_, idx) => {
      const dot = document.createElement("button");
      dot.className = `w-2 h-2 rounded-full transition-all duration-300 ${
        idx === this.currentIndex ? "bg-sky-400 w-6" : "bg-slate-700 hover:bg-slate-500"
      }`;
      dot.ariaLabel = `Go to card ${idx + 1}`;
      dot.addEventListener("click", () => {
        this.goToIndex(idx);
      });
      this.dotsContainer.appendChild(dot);
    });
  }

  updateDots() {
    const dots = this.dotsContainer.querySelectorAll("button");
    dots.forEach((dot, idx) => {
      if (idx === this.currentIndex) {
        dot.className = "w-6 h-2 rounded-full bg-sky-400 transition-all duration-300";
      } else {
        dot.className = "w-2 h-2 rounded-full bg-slate-700 hover:bg-slate-500 transition-all duration-300";
      }
    });
  }

  updateMeta() {
    const active = this.cards[this.currentIndex];
    if (!active) return;

    this.metaCategory.textContent = active.category;
    this.metaCounter.textContent = `${String(this.currentIndex + 1).padStart(2, "0")} / ${String(this.total).padStart(2, "0")}`;
    this.metaTitle.textContent = active.title;
    this.metaDesc.textContent = active.desc;
    this.updateDots();
  }

  getWidthMultiplier(w) {
    if (w < 480) return 0.45;
    if (w < 640) return 0.6;
    if (w < 768) return 0.75;
    if (w < 1024) return 0.9;
    return 1;
  }

  getHeightMultiplier(w) {
    let base;
    if (w < 480) base = 22 * 16;
    else if (w < 640) base = 26 * 16;
    else if (w < 768) base = 28 * 16;
    else if (w < 1024) base = 34 * 16;
    else base = 38 * 16;

    const available = window.innerHeight * 0.7;
    return available >= base ? 1 : available / base;
  }

  getSlotConfig(totalSlots, slotIndex) {
    const center = Math.floor(totalSlots / 2);
    const normalized = totalSlots > 1 ? (slotIndex - center) / center : 0;
    const absNorm = Math.abs(normalized);

    return {
      rot: normalized * 21,
      scale: 1 - 0.2244 * absNorm * absNorm,
      x: normalized * 30,
      y: absNorm * absNorm * 7.3,
      zIndex: 10 - Math.abs(slotIndex - center),
    };
  }

  getSlotMapping(centerIdx) {
    const map = new Map();
    for (let slot = 0; slot < VISIBLE_FAN_COUNT; slot++) {
      const cardIdx = ((centerIdx + slot - CENTER_SLOT) % this.total + this.total) % this.total;
      map.set(cardIdx, slot);
    }
    return map;
  }

  updateLayout(isEntrance = false) {
    const slotMap = this.getSlotMapping(this.currentIndex);
    const prevVisible = this.visibleSet;
    const dir = this.direction;
    const isFirstTime = !this.hasEntered;
    const widthMult = this.getWidthMultiplier(window.innerWidth);
    const heightMult = this.getHeightMultiplier(window.innerWidth);

    if (isFirstTime) this.isAnimating = true;

    let completedCount = 0;
    const targetCount = slotMap.size;
    const onCardDone = () => {
      completedCount++;
      if (completedCount >= targetCount) {
        this.isAnimating = false;
        if (isFirstTime) this.hasEntered = true;
      }
    };

    this.cardElements.forEach((el, cardIdx) => {
      const slot = slotMap.get(cardIdx);
      const wasVisible = prevVisible.has(cardIdx);

      if (slot !== undefined) {
        const config = this.getSlotConfig(VISIBLE_FAN_COUNT, slot);
        const targetProps = {
          x: `${config.x * widthMult}rem`,
          y: `${config.y * heightMult}rem`,
          rotation: config.rot,
          scale: config.scale,
          opacity: 1,
          zIndex: config.zIndex,
        };

        el.classList.toggle("is-active-center", slot === CENTER_SLOT);

        if (isFirstTime) {
          gsap.set(el, { x: 0, y: `${12 * heightMult}rem`, rotation: 0, scale: 0.5, opacity: 0 });
          gsap.to(el, {
            ...targetProps,
            duration: 1.2,
            ease: "elastic.out(1.05, 0.78)",
            delay: 0.2 + slot * 0.06,
            onComplete: onCardDone,
          });
        } else if (wasVisible) {
          gsap.to(el, {
            ...targetProps,
            duration: 0.5,
            ease: "power2.out",
            onComplete: onCardDone,
          });
        } else {
          const startX = dir === "right" ? 40 : -40;
          gsap.set(el, {
            x: `${startX}rem`,
            y: `${config.y * heightMult}rem`,
            rotation: dir === "right" ? 30 : -30,
            scale: 0.5,
            opacity: 0,
          });
          gsap.to(el, {
            ...targetProps,
            duration: 0.6,
            ease: "power2.out",
            onComplete: onCardDone,
          });
        }
      } else if (wasVisible) {
        el.classList.remove("is-active-center");
        const exitX = dir === "right" ? -40 : 40;
        gsap.to(el, {
          x: `${exitX}rem`,
          opacity: 0,
          scale: 0.5,
          rotation: dir === "right" ? -30 : 30,
          duration: 0.4,
          ease: "power2.in",
          zIndex: 0,
        });
      } else if (isFirstTime) {
        gsap.set(el, { opacity: 0, scale: 0.3, x: 0, y: 0, zIndex: 0 });
      }
    });

    this.visibleSet = new Set(slotMap.keys());
    this.setupHoverInteraction(slotMap);
  }

  setupHoverInteraction(slotMap) {
    const visibleCards = [];
    this.cardElements.forEach((el, cardIdx) => {
      const slot = slotMap.get(cardIdx);
      if (slot !== undefined) {
        visibleCards.push({ el, slot, cardIdx });
      }
    });
    visibleCards.sort((a, b) => a.slot - b.slot);

    const centerSlot = Math.floor(visibleCards.length / 2);

    const updateHoverSpread = (hoveredSlot) => {
      const widthMult = this.getWidthMultiplier(window.innerWidth);
      const heightMult = this.getHeightMultiplier(window.innerWidth);

      visibleCards.forEach(({ el, slot }) => {
        const base = this.getSlotConfig(VISIBLE_FAN_COUNT, slot);
        let posX = base.x * widthMult;
        let posY = base.y * heightMult;
        let rot = base.rot;
        let scale = base.scale;
        let delay = 0;

        if (hoveredSlot !== null) {
          const diff = Math.abs(slot - hoveredSlot);
          delay = diff * 0.02;

          if (slot === hoveredSlot) {
            posY -= 2.5 * heightMult;
            scale *= 1.08;
          } else {
            const norm = centerSlot > 0 ? (slot - centerSlot) / centerSlot : 0;
            const spread = 8 * (1 - Math.abs(norm)) * (1 + 0.2 * Math.max(0, 3 - diff));
            if (slot < hoveredSlot) {
              posX -= spread * widthMult;
              rot -= 3 / (diff + 1);
            } else {
              posX += spread * widthMult;
              rot += 3 / (diff + 1);
            }
          }
        } else {
          delay = Math.abs(slot - centerSlot) * 0.02;
        }

        gsap.to(el, {
          x: `${posX}rem`,
          y: `${posY}rem`,
          rotation: rot,
          scale: scale,
          duration: 0.5,
          delay: delay,
          ease: "elastic.out(1, 0.75)",
          overwrite: "auto",
        });
        gsap.set(el, { zIndex: base.zIndex });
      });
    };

    visibleCards.forEach(({ el, slot, cardIdx }) => {
      el.onmouseenter = () => {
        if (this.isAnimating) return;
        if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
        if (this.hoveredSlot !== slot) {
          this.hoveredSlot = slot;
          updateHoverSpread(slot);
        }
      };

      // Click card to bring it directly to center
      el.onclick = (e) => {
        if (this.isAnimating) return;
        if (slot !== CENTER_SLOT) {
          this.goToIndex(cardIdx);
        } else {
          this.openLightbox(this.cards[cardIdx]);
        }
      };
    });

    this.container.onmouseleave = () => {
      if (this.isAnimating) return;
      if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
      this.hoverTimeout = setTimeout(() => {
        this.hoveredSlot = null;
        updateHoverSpread(null);
      }, 50);
    };
  }

  next() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.direction = "right";
    this.currentIndex = (this.currentIndex + 1) % this.total;
    this.updateLayout();
    this.updateMeta();
  }

  prev() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.direction = "left";
    this.currentIndex = (this.currentIndex - 1 + this.total) % this.total;
    this.updateLayout();
    this.updateMeta();
  }

  goToIndex(targetIdx) {
    if (this.isAnimating || targetIdx === this.currentIndex) return;
    this.direction = targetIdx > this.currentIndex ? "right" : "left";
    this.currentIndex = targetIdx;
    this.updateLayout();
    this.updateMeta();
  }

  toggleAutoplay() {
    this.isAutoplaying = !this.isAutoplaying;
    if (this.isAutoplaying) {
      this.autoplayText.textContent = "Pause";
      this.autoplayIcon.setAttribute("data-lucide", "pause");
      this.autoplayInterval = setInterval(() => {
        this.next();
      }, 3500);
    } else {
      this.autoplayText.textContent = "Auto Play";
      this.autoplayIcon.setAttribute("data-lucide", "play");
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
    if (window.lucide) window.lucide.createIcons();
  }

  openLightbox(card) {
    this.lightboxImg.src = card.imgUrl;
    this.lightboxImg.alt = card.alt;
    this.lightboxTitle.textContent = card.title;
    this.lightboxDesc.textContent = card.desc;

    this.lightboxModal.classList.remove("opacity-0", "pointer-events-none");
    this.lightboxModal.classList.add("opacity-100", "pointer-events-auto");
  }

  closeLightbox() {
    this.lightboxModal.classList.remove("opacity-100", "pointer-events-auto");
    this.lightboxModal.classList.add("opacity-0", "pointer-events-none");
  }

  bindEvents() {
    this.btnNext.addEventListener("click", () => this.next());
    this.btnPrev.addEventListener("click", () => this.prev());
    this.btnAutoplay.addEventListener("click", () => this.toggleAutoplay());

    this.lightboxClose.addEventListener("click", () => this.closeLightbox());
    this.lightboxModal.addEventListener("click", (e) => {
      if (e.target === this.lightboxModal) this.closeLightbox();
    });

    window.addEventListener("resize", () => {
      if (!this.isAnimating) this.updateLayout();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") this.next();
      if (e.key === "ArrowLeft") this.prev();
      if (e.key === "Escape") this.closeLightbox();
    });

    // Touch swipe support
    let touchStartX = 0;
    this.container.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.container.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 45) {
        if (diff < 0) this.next();
        else this.prev();
      }
    }, { passive: true });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new EnhancedCardFanCarousel(ENHANCED_CARDS);
});
