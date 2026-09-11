/**
 * 1-to-1 Vanilla Script for Coupon Reveal Button (button-26)
 * Original by @shadcnspace
 * Implements:
 * 1. Corner peek on hover: clips front layer and shifts SVG peel flap
 * 2. Click 1: Full peel reveal of hidden coupon code
 * 3. Click 2: Copies coupon code to clipboard with teal success state
 */

const couponBtn = document.getElementById("coupon-btn");
const dashedBackplate = document.getElementById("dashed-backplate");
const codeReveal = document.getElementById("code-reveal");
const couponPill = document.getElementById("coupon-pill");
const copyIcon = document.getElementById("copy-icon");
const copiedLabel = document.getElementById("copied-label");
const backText = document.getElementById("back-text");
const frontMask = document.getElementById("front-mask");
const peelFlap = document.getElementById("peel-flap");

const couponCode = "SHADSPACE20";

let isHovered = false;
let isRevealed = false;
let isCopied = false;
let btnWidth = 280;

function updateDimensions() {
  btnWidth = couponBtn.getBoundingClientRect().width || 280;
  updateVisualState();
}

function updateVisualState() {
  // Exact coordinate logic from React component:
  // const Tt = ut ? -48 : J ? p-48 : p-24;
  let splitX;
  if (isRevealed) {
    splitX = -48;
  } else if (isHovered) {
    splitX = btnWidth - 48;
  } else {
    splitX = btnWidth - 24;
  }

  // Front Mask Clip Path
  frontMask.style.clipPath = `polygon(0px 0px, ${splitX}px 0px, ${splitX - 24}px 100%, 0px 100%)`;

  // Folded Sticker Flap Position
  peelFlap.style.left = `${splitX - 36}px`;

  if (isRevealed) {
    peelFlap.style.opacity = "0";
    peelFlap.style.transform = "scale(0.6)";
  } else {
    peelFlap.style.opacity = "1";
    peelFlap.style.transform = "scale(1)";
  }

  // Code vs BackText Visibility
  if (isRevealed || isHovered) {
    codeReveal.classList.remove("opacity-0");
    codeReveal.classList.add("opacity-100");
    backText.classList.remove("opacity-100");
    backText.classList.add("opacity-0");
  } else {
    codeReveal.classList.remove("opacity-100");
    codeReveal.classList.add("opacity-0");
    backText.classList.remove("opacity-0");
    backText.classList.add("opacity-100");
  }

  // Copied success styles (teal palette)
  if (isCopied) {
    dashedBackplate.className = "absolute inset-0 flex items-center justify-center rounded-lg border-2 border-dashed transition-colors duration-300 bg-teal-400/10 border-teal-400 text-teal-400 shadow-[inset_0_2px_4px_rgba(45,212,191,0.08)]";
    couponPill.classList.add("hidden");
    copyIcon.classList.add("hidden");
    copiedLabel.classList.remove("hidden");
  } else {
    dashedBackplate.className = "absolute inset-0 flex items-center justify-center rounded-lg border-2 border-dashed transition-colors duration-300 bg-blue-500/10 border-blue-500 text-blue-500 shadow-[inset_0_2px_4px_rgba(59,130,246,0.06)]";
    couponPill.classList.remove("hidden");
    copyIcon.classList.remove("hidden");
    copiedLabel.classList.add("hidden");
  }
}

couponBtn.addEventListener("mouseenter", () => {
  isHovered = true;
  updateVisualState();
});

couponBtn.addEventListener("mouseleave", () => {
  isHovered = false;
  updateVisualState();
});

couponBtn.addEventListener("click", () => {
  if (!isRevealed) {
    // Click 1: Peel and reveal code
    isRevealed = true;
    updateVisualState();
  } else if (!isCopied) {
    // Click 2: Copy to clipboard
    navigator.clipboard.writeText(couponCode).then(() => {
      isCopied = true;
      updateVisualState();
      setTimeout(() => {
        isCopied = false;
        updateVisualState();
      }, 2000);
    });
  }
});

window.addEventListener("resize", updateDimensions);
document.addEventListener("DOMContentLoaded", updateDimensions);
