/**
 * Chapter Scrubber Enhanced - Interactive Agent Transcript Minimap
 * Incorporates live log viewport synchronization, step status tags, sound effects (synthesized audio context),
 * custom rail alignment switching, and jump-to-step scrolling.
 */

const CHAPTERS = [
  {
    id: "clone",
    title: "clone the repo and read the layout",
    description: "Pulled the branch and mapped the workspace — the scroll feature lives under registry/ruixenui.",
    meta: "00:00",
    status: "completed",
    tag: "git clone",
  },
  {
    id: "reproduce",
    title: "reproduce the reported bug",
    description: "Confirmed the rail flickers on fast pointer moves between adjacent lines. Traced it to state churn.",
    meta: "00:14",
    status: "completed",
    tag: "debug",
  },
  {
    id: "grep",
    title: "grep for the hover handler",
    description: "Found two pointer listeners fighting over the same index every frame.",
    meta: "00:21",
    status: "completed",
    tag: "search",
  },
  {
    id: "read-test",
    title: "read the failing snapshot test",
    description: "The snapshot expected a clamped card position; the component placed it unclamped near the edges.",
    meta: "00:33",
    status: "completed",
    tag: "test",
  },
  {
    id: "hypothesis",
    title: "form a hypothesis",
    description: "The card top was never clamped to the rail bounds, so it overshot on the first and last chapters.",
    meta: "00:41",
    status: "completed",
    tag: "analysis",
  },
  {
    id: "magnify",
    title: "drive the rail off one pointer value",
    description: "Replaced per-line state with a single spring; each tick reads its rise from the cursor's distance.",
    meta: "00:52",
    status: "completed",
    tag: "refactor",
  },
  {
    id: "falloff",
    title: "shape the falloff",
    description: "Swapped the linear ramp for a raised-cosine bump so the wave has no seams at its edges.",
    meta: "01:07",
    status: "completed",
    tag: "math",
  },
  {
    id: "dedupe",
    title: "collapse hover and focus into one source",
    description: "Hover and keyboard now feed the same pointer value. No more dueling listeners, no more flicker.",
    meta: "01:19",
    status: "completed",
    tag: "events",
  },
  {
    id: "keyboard",
    title: "add roving tabindex + arrow keys",
    description: "Up/Down walk the rail, Home/End jump to the ends, Enter selects. Only one tick is tabbable at a time.",
    meta: "01:38",
    status: "completed",
    tag: "a11y",
  },
  {
    id: "reduced-motion",
    title: "honor prefers-reduced-motion",
    description: "Kept the spatial wave but dropped the springs, so the rise is instant instead of eased.",
    meta: "01:50",
    status: "completed",
    tag: "a11y",
  },
  {
    id: "flip",
    title: "auto-flip the card near the edge",
    description: "Compared room on each side against the card width and flipped toward the roomier one.",
    meta: "02:04",
    status: "completed",
    tag: "geometry",
  },
  {
    id: "run-tests",
    title: "run the test suite",
    description: "24 passed, 0 failed. The snapshot matches the clamped layout.",
    meta: "02:22",
    status: "completed",
    tag: "ci / test",
  },
  {
    id: "lint",
    title: "lint and typecheck",
    description: "Clean. Tightened the ref callback and dropped an unused import.",
    meta: "02:30",
    status: "completed",
    tag: "lint",
  },
  {
    id: "self-review",
    title: "re-read my own diff",
    description: "Skimmed the change end to end and trimmed a comment that no longer matched the code.",
    meta: "02:41",
    status: "completed",
    tag: "review",
  },
  {
    id: "commit",
    title: "commit the fix",
    description: "fix(scrubber): magnify the rail from a single pointer spring.",
    meta: "02:48",
    status: "completed",
    tag: "git commit",
  },
  {
    id: "push",
    title: "push and open the PR",
    description: "Opened PR #11148 against main and requested review.",
    meta: "02:55",
    status: "completed",
    tag: "git push",
  },
  {
    id: "update-desc",
    title: "ok update pr desc with bullet points for what was done",
    description: "Updated PR #11148 with accurate implementation bullets, including its opt-in scope and browser fallback.",
    meta: "03:10",
    status: "completed",
    tag: "documentation",
  },
  {
    id: "respond",
    title: "respond to review comments",
    description: "Reviewer asked about touch devices — added a note that the rail falls back to focus + tap.",
    meta: "03:26",
    status: "completed",
    tag: "feedback",
  },
  {
    id: "green",
    title: "wait for CI to go green",
    description: "All checks passed on the second run after the flaky network mock settled.",
    meta: "03:44",
    status: "completed",
    tag: "ci pass",
  },
  {
    id: "done",
    title: "hand off — ready to merge",
    description: "Left a summary comment and marked the PR ready. Waiting on the final approval.",
    meta: "03:51",
    status: "running",
    tag: "ready",
  },
];

const CARD_WIDTH = 270;
const CARD_OFFSET = 24;
const SPRING_F = { stiffness: 720, damping: 50, mass: 0.5 };
const SPRING_W = { stiffness: 280, damping: 28, mass: 0.6 };

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function bump(dist, radius) {
  if (dist >= radius) return 0;
  return 0.5 * (1 + Math.cos(Math.PI * (dist / radius)));
}

// Subtle sound synthesizer for mechanical scrubber ticks
class ScrubberAudio {
  constructor() {
    this.ctx = null;
  }
  playTick(frequency = 420) {
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      // Audio not supported or blocked
    }
  }
}

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
    const { stiffness, damping, mass } = this.config;
    const force = -stiffness * (this.current - this.target) - damping * this.velocity;
    const accel = force / mass;
    this.velocity += accel * dt;
    this.current += this.velocity * dt;
    return this.current;
  }
}

class ChapterScrubberEnhanced {
  constructor(container, options = {}) {
    this.container = container;
    this.chapters = options.chapters || CHAPTERS;
    this.side = options.side || "right";
    this.peakLength = options.peakLength || 62;
    this.restLength = options.restLength || 16;
    this.rowHeight = options.rowHeight || 12;
    this.radius = options.radius || 4.2;
    this.currentIndex = options.currentIndex ?? 0;
    this.onActiveChange = options.onActiveChange || null;
    this.onSelect = options.onSelect || null;

    this.audio = new ScrubberAudio();
    this.lastSoundIdx = -1;

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

  setSide(side) {
    this.side = side;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = "";
    this.container.style.width = `${this.peakLength}px`;
    this.buttons = [];
    this.tickSpans = [];

    this.listbox = document.createElement("div");
    this.listbox.setAttribute("role", "listbox");
    this.listbox.setAttribute("aria-label", "Transcript Chapters");
    this.listbox.setAttribute("aria-orientation", "vertical");
    this.listbox.className = "flex w-full flex-col";

    this.chapters.forEach((chapter, index) => {
      const isSelected = index === this.currentIndex;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.role = "option";
      btn.id = `enhanced-opt-${chapter.id || index}`;
      btn.setAttribute("aria-selected", isSelected ? "true" : "false");
      btn.setAttribute("aria-label", `${chapter.title}`);
      btn.tabIndex = index === (this.currentIndex ?? 0) ? 0 : -1;
      btn.style.height = `${this.rowHeight}px`;

      const alignClass = this.side === "left" ? "justify-end" : "justify-start";
      btn.className = `flex w-full items-center rounded-sm outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary ${alignClass}`;

      const tick = document.createElement("span");
      tick.setAttribute("aria-hidden", "true");
      tick.className = `scrubber-tick block h-[2.5px] rounded-full ${
        isSelected ? "bg-primary" : "bg-foreground"
      }`;
      tick.style.width = `${this.restLength}px`;
      tick.style.opacity = isSelected ? "0.6" : "0.22";

      btn.appendChild(tick);
      this.listbox.appendChild(btn);

      this.buttons.push(btn);
      this.tickSpans.push(tick);
    });

    this.container.appendChild(this.listbox);

    // Enhanced Preview Card with badge & status tag
    this.card = document.createElement("div");
    this.card.setAttribute("aria-hidden", "true");
    this.card.className =
      "pointer-events-none absolute z-20 w-[270px] rounded-2xl border border-border bg-popover/95 backdrop-blur-md px-4 py-3.5 text-popover-foreground shadow-2xl glow-effect";
    this.card.style.opacity = "0";
    this.card.style.display = "none";

    this.container.appendChild(this.card);
  }

  updateCardContent(chapter, index) {
    if (!chapter) return;
    const isRunning = chapter.status === "running";
    const statusColor = isRunning ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";

    this.card.innerHTML = `
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-xs font-mono font-medium tabular-nums text-muted-foreground">${chapter.meta}</span>
        <span class="text-[10px] px-2 py-0.5 rounded-full border font-mono uppercase font-semibold ${statusColor}">${chapter.tag || "step"}</span>
      </div>
      <div class="text-sm font-semibold leading-snug tracking-tight">${chapter.title}</div>
      <p class="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">${chapter.description}</p>
    `;
    this.cardHeight = this.card.offsetHeight;
  }

  engageAt(pointerIdx, activeIdx) {
    this.pointerSpring.set(pointerIdx);
    this.strengthSpring.set(1);

    const clampedIdx = clamp(activeIdx, 0, this.chapters.length - 1);
    if (clampedIdx !== this.activeIndex || !this.isEngaged) {
      this.activeIndex = clampedIdx;
      this.updateCardContent(this.chapters[this.activeIndex], this.activeIndex);
      
      if (this.lastSoundIdx !== clampedIdx) {
        this.audio.playTick(350 + clampedIdx * 25);
        this.lastSoundIdx = clampedIdx;
      }

      if (this.onActiveChange) {
        this.onActiveChange(this.chapters[this.activeIndex], this.activeIndex);
      }
    }

    if (!this.isEngaged) {
      this.isEngaged = true;
      this.card.style.display = "block";
    }

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
        this.currentIndex = index;
        if (this.onSelect) {
          this.onSelect(this.chapters[index], index);
        }
      });
    });
  }

  setCurrentIndex(index) {
    this.currentIndex = index;
    this.buttons.forEach((btn, i) => {
      const isSelected = i === index;
      btn.setAttribute("aria-selected", isSelected ? "true" : "false");
      const tick = this.tickSpans[i];
      if (isSelected) {
        tick.className = "scrubber-tick block h-[2.5px] rounded-full bg-primary";
      } else {
        tick.className = "scrubber-tick block h-[2.5px] rounded-full bg-foreground";
      }
    });
  }

  startLoop() {
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      const currentPointer = this.pointerSpring.update(dt);
      const currentStrength = this.strengthSpring.update(dt);

      for (let i = 0; i < this.chapters.length; i++) {
        const tick = this.tickSpans[i];
        const dist = Math.abs(i - currentPointer);
        const bumpVal = currentStrength * bump(dist, this.radius);

        const width = this.restLength + bumpVal * (this.peakLength - this.restLength);
        const isCurrent = i === this.currentIndex;
        const baseOpacity = isCurrent ? 0.65 : 0.22;
        const opacity = baseOpacity + bumpVal * (1 - baseOpacity);
        const scaleY = 1 + bumpVal * 0.45;

        tick.style.width = `${width}px`;
        tick.style.opacity = opacity.toString();
        tick.style.transform = `scaleY(${scaleY})`;
      }

      if (this.card && (currentStrength > 0.005 || this.isEngaged)) {
        const totalHeight = this.chapters.length * this.rowHeight;
        const halfCard = this.cardHeight / 2 || 40;
        const rawTop = (currentPointer + 0.5) * this.rowHeight;
        const clampedTop = clamp(rawTop, halfCard, Math.max(halfCard, totalHeight - halfCard)) - halfCard;

        const effectiveSide = this.side === "right"
          ? (this.flipped ? "left" : "right")
          : (this.flipped ? "right" : "left");

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

// Populate transcript viewer feed
function populateTranscript(chapters, onStepClick) {
  const container = document.getElementById("transcript-scroll");
  if (!container) return;

  container.innerHTML = "";
  chapters.forEach((item, index) => {
    const row = document.createElement("div");
    row.id = `log-row-${index}`;
    row.className =
      "p-3 rounded-xl border border-border/40 bg-card/40 hover:bg-muted/40 transition-all cursor-pointer flex items-start gap-3.5 group";

    row.innerHTML = `
      <div class="mt-0.5 w-6 h-6 rounded-md bg-muted flex items-center justify-center font-mono text-xs text-muted-foreground group-hover:text-foreground shrink-0">
        ${index + 1}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-semibold tracking-tight text-foreground truncate">${item.title}</span>
          <span class="text-[11px] font-mono text-muted-foreground shrink-0">${item.meta}</span>
        </div>
        <p class="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">${item.description}</p>
      </div>
    `;

    row.addEventListener("click", () => {
      onStepClick(item, index);
    });

    container.appendChild(row);
  });
}

function highlightLogRow(index) {
  const allRows = document.querySelectorAll('[id^="log-row-"]');
  allRows.forEach((r, i) => {
    if (i === index) {
      r.classList.add("ring-1", "ring-primary", "bg-primary/5");
    } else {
      r.classList.remove("ring-1", "ring-primary", "bg-primary/5");
    }
  });

  const targetRow = document.getElementById(`log-row-${index}`);
  if (targetRow) {
    targetRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  const badge = document.getElementById("current-step-badge");
  if (badge) {
    badge.textContent = `Step ${index + 1} of ${CHAPTERS.length}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("enhanced-scrubber-mount");
  let currentSide = "right";

  let scrubber = null;

  if (mount) {
    scrubber = new ChapterScrubberEnhanced(mount, {
      chapters: CHAPTERS,
      side: currentSide,
      onActiveChange: (chapter, index) => {
        highlightLogRow(index);
      },
      onSelect: (chapter, index) => {
        scrubber.setCurrentIndex(index);
        highlightLogRow(index);
      }
    });
  }

  populateTranscript(CHAPTERS, (item, index) => {
    if (scrubber) {
      scrubber.setCurrentIndex(index);
      highlightLogRow(index);
    }
  });

  // Highlight initial row
  highlightLogRow(0);

  // Side switcher toggle
  const toggleSideBtn = document.getElementById("toggle-side");
  if (toggleSideBtn && scrubber) {
    toggleSideBtn.addEventListener("click", () => {
      currentSide = currentSide === "right" ? "left" : "right";
      toggleSideBtn.textContent = currentSide === "right" ? "Right" : "Left";
      scrubber.setSide(currentSide);
    });
  }

  // Theme toggle button
  const toggleThemeBtn = document.getElementById("theme-toggle");
  if (toggleThemeBtn) {
    toggleThemeBtn.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
    });
  }
});
