/**
 * Stacked Card Carousel (carousel-07)
 * Cloned from @shadcnspace/carousel-07
 */

const SLIDES = [
  {
    image: "https://cdn.21st.dev/assets/mirror/c1/c1e7bf149d430fd5bd5aa6dd3aaebb771fbc95b3a7cd303851ed585fd838a7b9.webp",
    title: "Mountain Trek",
    description: "Scale new heights and embrace the hiker's journey.",
    badge: "Adventure",
  },
  {
    image: "https://cdn.21st.dev/assets/mirror/fa/fac14e3cb2b67d40c5f3a2a0e212d0c60c1fd0aff588e59bc80883e4aceb4eee.webp",
    title: "River Rafting",
    description: "Feel the adrenaline rush as you navigate the wild rapids.",
    badge: "Extreme",
  },
  {
    image: "https://cdn.21st.dev/assets/mirror/c1/c1e7bf149d430fd5bd5aa6dd3aaebb771fbc95b3a7cd303851ed585fd838a7b9.webp",
    title: "Forest Walk",
    description: "Deep dive into the silence of the ancient woods.",
    badge: "Nature",
  },
  {
    image: "https://cdn.21st.dev/assets/mirror/b4/b49b413f935303df7e05362b3530028b05c913cc039b44e25e491f12f9ba0015.webp",
    title: "Azure Beach",
    description: "Unwind on the crystal clear shores of a tropical paradise.",
    badge: "Paradise",
  },
  {
    image: "https://cdn.21st.dev/assets/mirror/84/84c0ff283758085418b1cd942706a764ffa0bf5a06312b415fc441fec23d22d6.webp",
    title: "Spiritual Path",
    description: "Discover inner peace through ancient wisdom.",
    badge: "Serenity",
  },
];

function getCarouselConfig(width) {
  if (width < 640) {
    return {
      distanceDivisor: 120,
      velocityDivisor: 500,
      sensitivity: 180,
      xMultiplier: 90,
      yMultiplier: 20,
      rotationMultiplier: 8,
      scaleReduction: 0.06,
    };
  }
  if (width < 1024) {
    return {
      distanceDivisor: 160,
      velocityDivisor: 650,
      sensitivity: 220,
      xMultiplier: 130,
      yMultiplier: 30,
      rotationMultiplier: 10,
      scaleReduction: 0.09,
    };
  }
  return {
    distanceDivisor: 200,
    velocityDivisor: 800,
    sensitivity: 250,
    xMultiplier: 170,
    yMultiplier: 40,
    rotationMultiplier: 12,
    scaleReduction: 0.12,
  };
}

// Piecewise linear interpolation
function interpolate(input, inputMin, inputMax, outputMin, outputMax) {
  if (inputMin === inputMax) return outputMin;
  const ratio = (input - inputMin) / (inputMax - inputMin);
  return outputMin + ratio * (outputMax - outputMin);
}

function multiInterpolate(val, inRanges, outRanges) {
  if (val <= inRanges[0]) return outRanges[0];
  if (val >= inRanges[inRanges.length - 1]) return outRanges[outRanges.length - 1];

  for (let i = 0; i < inRanges.length - 1; i++) {
    if (val >= inRanges[i] && val <= inRanges[i + 1]) {
      return interpolate(val, inRanges[i], inRanges[i + 1], outRanges[i], outRanges[i + 1]);
    }
  }
  return outRanges[outRanges.length - 1];
}

class StackedCarousel {
  constructor(container, slides) {
    this.container = container;
    this.slides = slides;
    this.total = slides.length;
    this.progress = 0;
    this.targetProgress = 0;
    this.config = getCarouselConfig(window.innerWidth);

    this.isDragging = false;
    this.startX = 0;
    this.startProgress = 0;
    this.lastX = 0;
    this.lastTime = 0;
    this.velocityX = 0;

    this.cardElements = [];
    this.render();
    this.bindEvents();
    this.startLoop();
  }

  render() {
    this.container.innerHTML = "";
    this.cardElements = [];

    this.slides.forEach((slide, index) => {
      const card = document.createElement("div");
      card.className =
        "carousel-card absolute rounded-2xl overflow-hidden bg-muted group pointer-events-none w-44 h-56 sm:w-56 sm:h-80 lg:w-64 lg:h-96 shadow-2xl";

      card.innerHTML = `
        <img
          src="${slide.image}"
          alt="${slide.title}"
          class="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-110"
        />
        <!-- Darkness Overlay -->
        <div class="card-darkness absolute inset-0 bg-black pointer-events-none"></div>
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <!-- Badge -->
        <div class="absolute top-3 right-3 sm:top-5 sm:right-5 lg:top-6 lg:right-6 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-black shadow-md">
          ${slide.badge}
        </div>
        <!-- Caption -->
        <div class="absolute bottom-5 left-3 right-3 sm:bottom-8 sm:left-5 sm:right-5 lg:bottom-10 lg:left-6 lg:right-6 text-white text-center sm:text-left">
          <p class="card-title text-sm sm:text-lg lg:text-xl font-bold leading-tight mb-0.5 sm:mb-1 drop-shadow-md">
            ${slide.title}
          </p>
          <p class="card-desc hidden sm:block text-xs text-white/70 line-clamp-2 italic font-medium">
            ${slide.description}
          </p>
        </div>
      `;

      this.container.appendChild(card);
      this.cardElements.push({
        el: card,
        darkness: card.querySelector(".card-darkness"),
        title: card.querySelector(".card-title"),
        desc: card.querySelector(".card-desc"),
      });
    });
  }

  bindEvents() {
    window.addEventListener("resize", () => {
      this.config = getCarouselConfig(window.innerWidth);
    });

    const dragSurface = document.getElementById("drag-surface");

    const onPointerDown = (clientX) => {
      this.isDragging = true;
      this.startX = clientX;
      this.lastX = clientX;
      this.startProgress = this.progress;
      this.lastTime = performance.now();
      this.velocityX = 0;
    };

    const onPointerMove = (clientX) => {
      if (!this.isDragging) return;
      const now = performance.now();
      const dt = Math.max(1, now - this.lastTime);
      const dx = clientX - this.lastX;
      this.velocityX = (dx / dt) * 1000;
      this.lastX = clientX;
      this.lastTime = now;

      const totalDelta = clientX - this.startX;
      const progressDelta = -totalDelta / this.config.sensitivity;
      this.progress = this.startProgress + progressDelta;
      this.targetProgress = this.progress;
    };

    const onPointerUp = () => {
      if (!this.isDragging) return;
      this.isDragging = false;

      const totalDelta = this.lastX - this.startX;
      const T = -totalDelta / this.config.distanceDivisor;
      const M = -this.velocityX / this.config.velocityDivisor;
      let D = Math.round(T + M);
      D = Math.max(-3, Math.min(3, D));

      this.targetProgress = Math.round(this.startProgress) + D;
    };

    dragSurface.addEventListener("mousedown", (e) => onPointerDown(e.clientX));
    window.addEventListener("mousemove", (e) => onPointerMove(e.clientX));
    window.addEventListener("mouseup", onPointerUp);

    dragSurface.addEventListener("touchstart", (e) => onPointerDown(e.touches[0].clientX), { passive: true });
    window.addEventListener("touchmove", (e) => onPointerMove(e.touches[0].clientX), { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // Prev / Next button listeners
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    if (btnPrev) {
      btnPrev.addEventListener("click", () => {
        this.targetProgress = Math.round(this.targetProgress) - 1;
      });
    }
    if (btnNext) {
      btnNext.addEventListener("click", () => {
        this.targetProgress = Math.round(this.targetProgress) + 1;
      });
    }
  }

  startLoop() {
    let lastNow = performance.now();
    let velocity = 0;

    const loop = (now) => {
      const dt = Math.min((now - lastNow) / 1000, 0.033);
      lastNow = now;

      if (!this.isDragging) {
        // Spring physics: stiffness: 200, damping: 30, mass: 1
        const stiffness = 200;
        const damping = 30;
        const mass = 1;

        const force = -stiffness * (this.progress - this.targetProgress) - damping * velocity;
        const accel = force / mass;
        velocity += accel * dt;
        this.progress += velocity * dt;
      } else {
        velocity = 0;
      }

      this.updateCards();
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  updateCards() {
    const o = this.total;
    const f = this.config;

    // Active slide index for indicator
    let normalizedActive = Math.round(this.progress) % o;
    if (normalizedActive < 0) normalizedActive += o;
    const indicator = document.getElementById("slide-indicator");
    if (indicator) {
      indicator.textContent = `${normalizedActive + 1} / ${o}`;
    }

    this.cardElements.forEach((cardObj, a) => {
      let M = (a - this.progress) % o;
      if (M > o / 2) M -= o;
      if (M < -o / 2) M += o;

      const p = M * f.xMultiplier;
      const m = Math.abs(M) < 0.05 ? 0 : M * f.rotationMultiplier;
      const g = Math.abs(M) < 0.05 ? 0 : Math.abs(M) * f.yMultiplier;
      const y = 1 - Math.abs(M) * f.scaleReduction;

      const v = multiInterpolate(M, [-o / 2, -o / 2 + 0.5, 0, o / 2 - 0.5, o / 2], [0, 1, 1, 1, 0]);
      const S = Math.round(100 - Math.abs(M) * 10);

      cardObj.el.style.transform = `translate3d(${p}px, ${g}px, 0px) rotate(${m}deg) scale(${y})`;
      cardObj.el.style.opacity = v.toString();
      cardObj.el.style.zIndex = S.toString();

      // Darkness overlay interpolation: [-2, -0.5, 0, 0.5, 2] -> [0.5, 0.2, 0, 0.2, 0.5]
      const darkOpacity = multiInterpolate(M, [-2, -0.5, 0, 0.5, 2], [0.5, 0.2, 0, 0.2, 0.5]);
      cardObj.darkness.style.opacity = darkOpacity.toString();

      // Title & description opacity: [-.5, 0, .5] -> [0, 1, 0]
      const textOpacity = multiInterpolate(M, [-0.5, 0, 0.5], [0, 1, 0]);
      cardObj.title.style.opacity = textOpacity.toString();
      if (cardObj.desc) {
        cardObj.desc.style.opacity = textOpacity.toString();
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("slides-container");
  if (container) {
    new StackedCarousel(container, SLIDES);
  }

  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
    });
  }
});
