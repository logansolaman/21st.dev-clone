/**
 * 1-to-1 Vanilla Implementation of Morphing Popover
 * Original by @ibelick / Motion Primitives
 * Recreates layout-morphing with spring physics and outside click dismiss
 */

const morphBox = document.getElementById("morph-box");
const triggerState = document.getElementById("trigger-state");
const contentState = document.getElementById("content-state");
const closeBtn = document.getElementById("close-btn");

let isOpen = false;

function openPopover() {
  isOpen = true;
  // Trigger fades out
  triggerState.classList.add("opacity-0", "pointer-events-none");

  // Morph surface scales smoothly into dialog container
  morphBox.style.width = "320px";
  morphBox.style.height = "260px";
  morphBox.style.borderRadius = "0.75rem";
  morphBox.classList.remove("cursor-pointer");
  morphBox.classList.add("shadow-2xl", "border-zinc-700");

  // Reveal interior content after brief layout expansion
  setTimeout(() => {
    contentState.classList.remove("opacity-0", "pointer-events-none");
    contentState.classList.add("opacity-100");
    const firstInput = document.getElementById("width");
    if (firstInput) firstInput.focus();
  }, 100);
}

function closePopover() {
  isOpen = false;
  // Hide content immediately
  contentState.classList.remove("opacity-100");
  contentState.classList.add("opacity-0", "pointer-events-none");

  // Morph surface collapses back to button dimensions
  setTimeout(() => {
    morphBox.style.width = "128px";
    morphBox.style.height = "38px";
    morphBox.style.borderRadius = "0.5rem";
    morphBox.classList.add("cursor-pointer");
    morphBox.classList.remove("shadow-2xl", "border-zinc-700");
    triggerState.classList.remove("opacity-0", "pointer-events-none");
  }, 100);
}

morphBox.addEventListener("click", (e) => {
  if (!isOpen) {
    openPopover();
  }
});

closeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  closePopover();
});

// Dismiss on click outside
document.addEventListener("click", (e) => {
  if (isOpen && !morphBox.contains(e.target)) {
    closePopover();
  }
});

// Dismiss on Escape key
document.addEventListener("keydown", (e) => {
  if (isOpen && e.key === "Escape") {
    closePopover();
  }
});
