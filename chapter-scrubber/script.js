/**
 * Chapter Scrubber Component
 * Faithfully cloned from @ruixen.ui/components/chapter-scrubber (21st.dev)
 * MIT License
 */

const CHAPTERS = [
  {
    id: "clone",
    title: "clone the repo and read the layout",
    description: "Pulled the branch and mapped the workspace — the scroll feature lives under registry/ruixenui.",
    meta: "00:00",
  },
  {
    id: "reproduce",
    title: "reproduce the reported bug",
    description: "Confirmed the rail flickers on fast pointer moves between adjacent lines. Traced it to state churn.",
    meta: "00:14",
  },
  {
    id: "grep",
    title: "grep for the hover handler",
    description: "Found two pointer listeners fighting over the same index every frame.",
    meta: "00:21",
  },
  {
    id: "read-test",
    title: "read the failing snapshot test",
    description: "The snapshot expected a clamped card position; the component placed it unclamped near the edges.",
    meta: "00:33",
  },
  {
    id: "hypothesis",
    title: "form a hypothesis",
    description: "The card top was never clamped to the rail bounds, so it overshot on the first and last chapters.",
    meta: "00:41",
  },
  {
    id: "magnify",
    title: "drive the rail off one pointer value",
    description: "Replaced per-line state with a single spring; each tick reads its rise from the cursor's distance.",
    meta: "00:52",
  },
  {
    id: "falloff",
    title: "shape the falloff",
    description: "Swapped the linear ramp for a raised-cosine bump so the wave has no seams at its edges.",
    meta: "01:07",
  },
  {
    id: "dedupe",
    title: "collapse hover and focus into one source",
    description: "Hover and keyboard now feed the same pointer value. No more dueling listeners, no more flicker.",
    meta: "01:19",
  },
  {
    id: "keyboard",
    title: "add roving tabindex + arrow keys",
    description: "Up/Down walk the rail, Home/End jump to the ends, Enter selects. Only one tick is tabbable at a time.",
    meta: "01:38",
  },
  {
    id: "reduced-motion",
    title: "honor prefers-reduced-motion",
    description: "Kept the spatial wave but dropped the springs, so the rise is instant instead of eased.",
    meta: "01:50",
  },
  {
    id: "flip",
    title: "auto-flip the card near the edge",
    description: "Compared room on each side against the card width and flipped toward the roomier one.",
    meta: "02:04",
  },
  {
    id: "run-tests",
    title: "run the test suite",
    description: "24 passed, 0 failed. The snapshot matches the clamped layout.",
    meta: "02:22",
  },
  {
    id: "lint",
    title: "lint and typecheck",
    description: "Clean. Tightened the ref callback and dropped an unused import.",
    meta: "02:30",
  },
  {
    id: "self-review",
    title: "re-read my own diff",
    description: "Skimmed the change end to end and trimmed a comment that no longer matched the code.",
    meta: "02:41",
  },
  {
    id: "commit",
    title: "commit the fix",
    description: "fix(scrubber): magnify the rail from a single pointer spring.",
    meta: "02:48",
  },
  {
    id: "push",
    title: "push and open the PR",
    description: "Opened PR #11148 against main and requested review.",
    meta: "02:55",
  },
  {
    id: "update-desc",
    title: "ok update pr desc with bullet points for what was done",
    description: "Updated PR #11148 with accurate implementation bullets, including its opt-in scope and browser fallback.",
    meta: "03:10",
  },
  {
    id: "respond",
    title: "respond to review comments",
    description: "Reviewer asked about touch devices — added a note that the rail falls back to focus + tap.",
    meta: "03:26",
  },
  {
    id: "green",
    title: "wait for CI to go green",
    description: "All checks passed on the second run after the flaky network mock settled.",
    meta: "03:44",
  },
  {
    id: "done",
    title: "hand off — ready to merge",
    description: "Left a summary comment and marked the PR ready. Waiting on the final approval.",
    meta: "03:51",
  },
];

// Exact math constants from Ruixen UI source
const CARD_WIDTH = 260;
const CARD_OFFSET = 20;
const SPRING_F = { stiffness: 700, damping: 52, mass: 0.5 };
const SPRING_W = { stiffness: 260, damping: 30, mass: 0.6 };

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// Raised-cosine bump falloff
function bump(dist, radius) {
  if (dist >= radius) return 0;
  return 0.5 * (1 + Math.cos(Math.PI * (dist / radius)));
}

/**
 * Lightweight spring simulation for continuous 60fps smoothing
 */
class SpringValue {
  constructor(initialValue, config) {
    this.target = initialValue;
    this.current = initialValue;
    this.velocity = 0;
    this.config = config;
  }

  set(val) {
    this.target = val;
  }

  update(dt) {
    // Semi-implicit Euler integration for damp spring
    const { stiffness, damping, mass } = this.config;
    const force = -stiffness * (this.current - this.target) - damping * this.velocity;
    const accel = force / mass;
    this.velocity += accel * dt;
    this.current += this.velocity * dt;
    return this.current;
  }

  isSettled() {
    return Math.abs(this.current - this.target) < 0.001 && Math.abs(this.velocity) < 0.001;
  }
}

class ChapterScrubber {
  constructor(container, options = {}) {
    this.container = container;
    this.chapters = options.chapters || CHAPTERS;
    this.side = options.side || "right"; // 'right' or 'left'
    this.peakLength = options.peakLength || 56;
    this.restLength = options.restLength || 14;
    this.rowHeight = options.rowHeight || 10;
    this.radius = options.radius || 4;
    this.currentIndex = options.currentIndex ?? null;
    this.onActiveChange = options.onActiveChange || null;
    this.onSelect = options.onSelect || null;
    this.label = options.label || "Chapters";

    this.pointerSpring = new SpringValue(0, SPRING_F);
    this.strengthSpring = new SpringValue(0, SPRING_W);

    this.activeIndex = 0;
    this.isEngaged = false;
    this.isPointerInside = false;
    this.focusedIndex = null;
    this.cardHeight = 0;
    this.flipped = false;

    this.buttons = [];
    this.tickSpans = [];

    this.render();
    this.bindEvents();
    this.startLoop();
  }

  render() {
    this.container.innerHTML = "";
    this.container.style.width = `${this.peakLength}px`;
    this.container.classList.add("relative");

    // Listbox container
    this.listbox = document.createElement("div");
    this.listbox.setAttribute("role", "listbox");
    this.listbox.setAttribute("aria-label", this.label);
    this.listbox.setAttribute("aria-orientation", "vertical");
    this.listbox.className = "flex w-full flex-col";

    this.chapters.forEach((chapter, index) => {
      const isSelected = index === this.currentIndex;
      const descLabel = chapter.description ? `. ${chapter.description}` : "";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.role = "option";
      btn.id = `chapter-opt-${chapter.id || index}`;
      btn.setAttribute("aria-selected", isSelected ? "true" : "false");
      btn.setAttribute("aria-label", `${chapter.title}${descLabel}`);
      btn.tabIndex = index === (this.currentIndex ?? 0) ? 0 : -1;
      btn.style.height = `${this.rowHeight}px`;

      const alignClass = this.side === "left" ? "justify-end" : "justify-start";
      btn.className = `flex w-full items-center rounded-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${alignClass}`;

      // Tick
      const tick = document.createElement("span");
      tick.setAttribute("aria-hidden", "true");
      tick.className = `scrubber-tick block h-[2px] rounded-full ${
        isSelected ? "bg-primary" : "bg-foreground"
      }`;
      tick.style.width = `${this.restLength}px`;
      tick.style.opacity = isSelected ? "0.55" : "0.22";

      btn.appendChild(tick);
      this.listbox.appendChild(btn);

      this.buttons.push(btn);
      this.tickSpans.push(tick);
    });

    this.container.appendChild(this.listbox);

    // Preview Card
    this.card = document.createElement("div");
    this.card.setAttribute("aria-hidden", "true");
    this.card.className =
      "preview-card pointer-events-none absolute z-10 w-[260px] rounded-2xl border border-border bg-popover px-4 py-3.5 text-popover-foreground shadow-[0_2px_6px_-2px_rgba(0,0,0,0.08),0_16px_36px_-12px_rgba(0,0,0,0.22)]";
    this.card.style.opacity = "0";
    this.card.style.display = "none";

    this.container.appendChild(this.card);
  }

  updateCardContent(chapter) {
    if (!chapter) return;
    this.card.innerHTML = `
      ${
        chapter.meta
          ? `<div class="mb-1 text-xs font-medium tabular-nums text-muted-foreground">${chapter.meta}</div>`
          : ""
      }
      <div class="truncate text-sm font-semibold leading-snug tracking-[-0.01em]">${chapter.title}</div>
      ${
        chapter.description
          ? `<p class="mt-1 line-clamp-3 text-sm leading-relaxed text-muted-foreground">${chapter.description}</p>`
          : ""
      }
    `;
    this.cardHeight = this.card.offsetHeight;
  }

  engageAt(pointerIdx, activeIdx) {
    this.pointerSpring.set(pointerIdx);
    this.strengthSpring.set(1);

    const clampedIdx = clamp(activeIdx, 0, this.chapters.length - 1);
    if (clampedIdx !== this.activeIndex || !this.isEngaged) {
      this.activeIndex = clampedIdx;
      this.updateCardContent(this.chapters[this.activeIndex]);
      if (this.onActiveChange) {
        this.onActiveChange(this.chapters[this.activeIndex], this.activeIndex);
      }
    }

    if (!this.isEngaged) {
      this.isEngaged = true;
      this.card.style.display = "block";
    }

    // Auto flip logic near viewport bounds
    this.checkEdgeFlip();
  }

  checkEdgeFlip() {
    const rect = this.container.getBoundingClientRect();
    const winWidth = window.innerWidth;
    const requiredSpace = CARD_WIDTH + CARD_OFFSET + 8;

    let onRight = this.side === "right";
    if (onRight && winWidth - rect.right < requiredSpace && rect.left >= requiredSpace) {
      onRight = false;
    } else if (!onRight && rect.left < requiredSpace && winWidth - rect.right >= requiredSpace) {
      onRight = true;
    }

    this.flipped = onRight !== (this.side === "right");
  }

  bindEvents() {
    this.listbox.addEventListener("pointermove", (e) => {
      const rect = this.listbox.getBoundingClientRect();
      const relativeY = (e.clientY - rect.top) / this.rowHeight - 0.5;
      this.isPointerInside = true;
      this.engageAt(clamp(relativeY, -0.5, this.chapters.length - 0.5), Math.round(relativeY));
    });

    this.listbox.addEventListener("pointerleave", () => {
      this.isPointerInside = false;
      if (this.focusedIndex !== null) {
        this.pointerSpring.set(this.focusedIndex);
      } else {
        this.strengthSpring.set(0);
        this.isEngaged = false;
      }
    });

    this.listbox.addEventListener("blur", (e) => {
      if (!this.listbox.contains(e.relatedTarget)) {
        this.focusedIndex = null;
        if (!this.isPointerInside) {
          this.strengthSpring.set(0);
          this.isEngaged = false;
        }
      }
    }, true);

    this.listbox.addEventListener("keydown", (e) => {
      let nextIdx = this.focusedIndex ?? this.activeIndex;
      const maxIdx = this.chapters.length - 1;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          nextIdx = Math.min(maxIdx, nextIdx + 1);
          break;
        case "ArrowUp":
        case "ArrowLeft":
          nextIdx = Math.max(0, nextIdx - 1);
          break;
        case "Home":
          nextIdx = 0;
          break;
        case "End":
          nextIdx = maxIdx;
          break;
        default:
          return;
      }

      e.preventDefault();
      if (this.buttons[nextIdx]) {
        this.buttons[nextIdx].focus();
      }
    });

    this.buttons.forEach((btn, index) => {
      btn.addEventListener("focus", () => {
        this.focusedIndex = index;
        this.engageAt(index, index);
        this.buttons.forEach((b, i) => {
          b.tabIndex = i === index ? 0 : -1;
        });
      });

      btn.addEventListener("click", () => {
        if (this.onSelect) {
          this.onSelect(this.chapters[index], index);
        }
      });
    });
  }

  startLoop() {
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      // Update spring values
      const currentPointer = this.pointerSpring.update(dt);
      const currentStrength = this.strengthSpring.update(dt);

      // Render ticks
      for (let i = 0; i < this.chapters.length; i++) {
        const tick = this.tickSpans[i];
        const dist = Math.abs(i - currentPointer);
        const bumpVal = currentStrength * bump(dist, this.radius);

        const width = this.restLength + bumpVal * (this.peakLength - this.restLength);
        const isCurrent = i === this.currentIndex;
        const baseOpacity = isCurrent ? 0.55 : 0.22;
        const opacity = baseOpacity + bumpVal * (1 - baseOpacity);
        const scaleY = 1 + bumpVal * 0.4;

        tick.style.width = `${width}px`;
        tick.style.opacity = opacity.toString();
        tick.style.transform = `scaleY(${scaleY})`;
      }

      // Render preview card
      if (this.card && (currentStrength > 0.005 || this.isEngaged)) {
        const totalHeight = this.chapters.length * this.rowHeight;
        const halfCard = this.cardHeight / 2 || 40;
        const rawTop = (currentPointer + 0.5) * this.rowHeight;
        const clampedTop = clamp(rawTop, halfCard, Math.max(halfCard, totalHeight - halfCard)) - halfCard;

        const effectiveSide = this.side === "right"
          ? (this.flipped ? "left" : "right")
          : (this.flipped ? "right" : "left");

        // Calculate transform and position
        const scale = 0.97 + currentStrength * 0.03;
        const shiftX = (effectiveSide === "right" ? -6 : 6) * (1 - currentStrength);

        this.card.style.top = `${clampedTop}px`;
        this.card.style.opacity = currentStrength.toString();
        this.card.style.transform = `translateX(${shiftX}px) scale(${scale})`;

        if (effectiveSide === "right") {
          this.card.style.left = `${this.peakLength + CARD_OFFSET}px`;
          this.card.style.right = "auto";
          this.card.style.transformOrigin = "left center";
        } else {
          this.card.style.right = `${this.peakLength + CARD_OFFSET}px`;
          this.card.style.left = "auto";
          this.card.style.transformOrigin = "right center";
        }

        if (currentStrength <= 0.005 && !this.isEngaged) {
          this.card.style.display = "none";
        }
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("scrubber-root");
  if (root) {
    new ChapterScrubber(root, {
      chapters: CHAPTERS,
      side: "right",
      onSelect: (chapter, index) => {
        console.log("Selected chapter:", index, chapter.title);
      }
    });
  }

  // Theme toggle button
  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
    });
  }
});
