/**
 * 1-to-1 Vanilla Implementation of Card Fan Carousel
 * Original component by @aayush-duhan on 21st.dev
 * Uses GSAP for elastic fanning and layout transitions.
 */

const DEMO_CARDS = [
  { imgUrl: "https://cdn.21st.dev/assets/mirror/a6/a61a357faccddd302e85600234a02350a27f21b4cc8b3531578991614c050151.jpg", alt: "Mountain landscape" },
  { imgUrl: "https://cdn.21st.dev/assets/mirror/9d/9d12401d835b58b284c6380d9f9c745112d6e2ed6cc51942982d42ae1d8e08b0.jpg", alt: "City night" },
  { imgUrl: "https://cdn.21st.dev/assets/mirror/4c/4c0990c5eee66fc437f8e0ca2175c48ed6bebd9b3b6e45f1ac9b3542ada80eff.jpg", alt: "Foggy forest" },
  { imgUrl: "https://cdn.21st.dev/assets/mirror/05/05536dea31a97c7c4243f835d48e2c487cfeead267d4651a9b515987bef18e61.jpg", alt: "Sunlit woods" },
  { imgUrl: "https://cdn.21st.dev/assets/mirror/fe/fe3c057ea3c04ecd58640df79ace90545c86fc0e267b7cb87e4da93c8d0d0ffc.jpg", alt: "Tropical beach" },
  { imgUrl: "https://cdn.21st.dev/assets/mirror/ec/ec33bb1d53aef764ed557037ded0bf376df17ceb6de92411b60d8edcd68e75b2.jpg", alt: "Starry mountain" },
  { imgUrl: "https://cdn.21st.dev/assets/mirror/10/109a67c3a7eab23436b0fc0e45a2bdfc722c97cff452c14a2e5944e200c56d98.jpg", alt: "Golden sunset" },
  { imgUrl: "https://cdn.21st.dev/assets/mirror/9d/9d1fd650945e154a1a414af7188e43d1f0e334557c1ad2cf25315e4b39a98f96.jpg", alt: "Lake reflection" },
  { imgUrl: "https://cdn.21st.dev/assets/mirror/d2/d2b6671fa0140e374b5d7cc1c4a6b2210b48f304ff472a88a2ea1b4ca52f5b48.jpg", alt: "Green valley" },
  { imgUrl: "https://cdn.21st.dev/assets/mirror/1a/1adc3553fd7cb37113b52f179fc82de7ba497a8503afa2e1f27f717aba09a2bc.jpg", alt: "Sunbeam nature" },
];

const VISIBLE_FAN_COUNT = 7;
const CENTER_SLOT = 3;

class CardFanCarousel {
  constructor(cards) {
    this.cards = cards;
    this.total = cards.length;
    this.hasPagination = this.total > VISIBLE_FAN_COUNT;
    this.currentIndex = this.hasPagination ? CENTER_SLOT : Math.floor(this.total / 2);
    
    this.isAnimating = false;
    this.hasEntered = false;
    this.direction = null;
    this.visibleSet = new Set();
    this.hoveredSlot = null;
    this.hoverTimeout = null;

    this.container = document.getElementById("fan-container");
    this.btnPrev = document.getElementById("btn-prev");
    this.btnNext = document.getElementById("btn-next");

    this.init();
  }

  init() {
    this.buildDom();
    this.updateLayout(true);
    this.bindEvents();
  }

  buildDom() {
    this.container.innerHTML = "";
    this.cardElements = this.cards.map((card, idx) => {
      const el = document.createElement("div");
      el.className = "fan-card";
      el.dataset.index = idx;
      el.innerHTML = `
        <div class="relative w-full h-full overflow-hidden bg-zinc-900">
          <img loading="lazy" alt="${card.alt}" class="absolute inset-0 w-full h-full object-cover z-10" src="${card.imgUrl}">
        </div>
      `;
      this.container.appendChild(el);
      return el;
    });
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
    if (!this.hasPagination) {
      this.cards.forEach((_, i) => map.set(i, i));
      return map;
    }
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
    const totalSlots = this.hasPagination ? VISIBLE_FAN_COUNT : this.total;

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
        const config = this.getSlotConfig(totalSlots, slot);
        const targetProps = {
          x: `${config.x * widthMult}rem`,
          y: `${config.y * heightMult}rem`,
          rotation: config.rot,
          scale: config.scale,
          opacity: 1,
          zIndex: config.zIndex,
        };

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
    this.setupHoverInteraction(slotMap, totalSlots);
  }

  setupHoverInteraction(slotMap, totalSlots) {
    const visibleCards = [];
    this.cardElements.forEach((el, cardIdx) => {
      const slot = slotMap.get(cardIdx);
      if (slot !== undefined) {
        visibleCards.push({ el, slot });
      }
    });
    visibleCards.sort((a, b) => a.slot - b.slot);

    const centerSlot = Math.floor(visibleCards.length / 2);

    const updateHoverSpread = (hoveredSlot) => {
      const widthMult = this.getWidthMultiplier(window.innerWidth);
      const heightMult = this.getHeightMultiplier(window.innerWidth);

      visibleCards.forEach(({ el, slot }) => {
        const base = this.getSlotConfig(totalSlots, slot);
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

    visibleCards.forEach(({ el, slot }) => {
      el.onmouseenter = () => {
        if (this.isAnimating) return;
        if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
        if (this.hoveredSlot !== slot) {
          this.hoveredSlot = slot;
          updateHoverSpread(slot);
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
    if (this.isAnimating || !this.hasPagination) return;
    this.isAnimating = true;
    this.direction = "right";
    this.currentIndex = (this.currentIndex + 1) % this.total;
    this.updateLayout();
  }

  prev() {
    if (this.isAnimating || !this.hasPagination) return;
    this.isAnimating = true;
    this.direction = "left";
    this.currentIndex = (this.currentIndex - 1 + this.total) % this.total;
    this.updateLayout();
  }

  bindEvents() {
    this.btnNext.addEventListener("click", () => this.next());
    this.btnPrev.addEventListener("click", () => this.prev());

    window.addEventListener("resize", () => {
      if (!this.isAnimating) {
        this.updateLayout();
      }
    });

    // Keyboard Arrow navigation
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") this.next();
      if (e.key === "ArrowLeft") this.prev();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new CardFanCarousel(DEMO_CARDS);
});
