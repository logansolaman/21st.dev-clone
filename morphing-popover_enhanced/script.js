/**
 * Enhanced Morphing Popover Suite
 * Supports dynamic variant switching:
 * 1. Dimensions Form (Configuration modal)
 * 2. Quick Note (Textarea with submission)
 * 3. User Profile Card
 */

const box = document.getElementById("enhanced-box");
const trigger = document.getElementById("enhanced-trigger");
const triggerIcon = document.getElementById("trigger-icon");
const triggerLabel = document.getElementById("trigger-label");
const modeBtns = document.querySelectorAll(".mode-btn");

const VARIANTS = {
  dimensions: {
    label: "Dimensions",
    icon: "sliders",
    targetWidth: "340px",
    targetHeight: "260px",
    radius: "1rem",
    viewId: "view-dimensions"
  },
  note: {
    label: "Add Note",
    icon: "edit-3",
    targetWidth: "340px",
    targetHeight: "220px",
    radius: "1rem",
    viewId: "view-note"
  },
  profile: {
    label: "User Badge",
    icon: "user",
    targetWidth: "300px",
    targetHeight: "235px",
    radius: "1.25rem",
    viewId: "view-profile"
  }
};

let currentMode = "dimensions";
let isOpen = false;

function setMode(mode) {
  if (isOpen) closePopover();
  currentMode = mode;
  const config = VARIANTS[mode];

  modeBtns.forEach(btn => {
    if (btn.dataset.mode === mode) {
      btn.classList.add("active", "text-white", "bg-slate-800");
      btn.classList.remove("text-slate-400");
    } else {
      btn.classList.remove("active", "text-white", "bg-slate-800");
      btn.classList.add("text-slate-400");
    }
  });

  triggerLabel.textContent = config.label;
  triggerIcon.setAttribute("data-lucide", config.icon);
  if (window.lucide) window.lucide.createIcons();
}

function openPopover() {
  isOpen = true;
  const config = VARIANTS[currentMode];

  trigger.classList.add("opacity-0", "pointer-events-none");

  // Morph into target dimension
  box.style.width = config.targetWidth;
  box.style.height = config.targetHeight;
  box.style.borderRadius = config.radius;
  box.classList.remove("cursor-pointer", "rounded-full");
  box.classList.add("shadow-2xl", "border-slate-700");

  // Show selected variant DOM
  document.querySelectorAll(".variant-content").forEach(el => el.classList.add("hidden"));
  const activeView = document.getElementById(config.viewId);
  if (activeView) {
    activeView.classList.remove("hidden");
    setTimeout(() => {
      activeView.classList.remove("opacity-0", "pointer-events-none");
      activeView.classList.add("opacity-100", "pointer-events-auto");
      const autoInput = activeView.querySelector("input, textarea");
      if (autoInput) autoInput.focus();
    }, 120);
  }
}

function closePopover() {
  isOpen = false;
  const activeView = document.getElementById(VARIANTS[currentMode].viewId);
  if (activeView) {
    activeView.classList.remove("opacity-100", "pointer-events-auto");
    activeView.classList.add("opacity-0", "pointer-events-none");
  }

  setTimeout(() => {
    box.style.width = "140px";
    box.style.height = "42px";
    box.style.borderRadius = "9999px";
    box.classList.add("cursor-pointer", "rounded-full");
    box.classList.remove("shadow-2xl", "border-slate-700");
    trigger.classList.remove("opacity-0", "pointer-events-none");
  }, 100);
}

box.addEventListener("click", (e) => {
  if (!isOpen) {
    openPopover();
  }
});

// Close triggers inside popover
document.querySelectorAll(".close-trigger").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    closePopover();
  });
});

modeBtns.forEach(btn => {
  btn.addEventListener("click", () => setMode(btn.dataset.mode));
});

// Click outside to dismiss
document.addEventListener("click", (e) => {
  if (isOpen && !box.contains(e.target) && !e.target.closest(".mode-btn")) {
    closePopover();
  }
});

// Escape key to dismiss
document.addEventListener("keydown", (e) => {
  if (isOpen && e.key === "Escape") {
    closePopover();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();
});
