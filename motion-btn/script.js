/**
 * 1-to-1 Vanilla Script for Motion Button
 * Original component by @radiumcoders / evilbuttons.com
 * Handles tap / click feedback duration and keyboard triggers
 */

const wrap = document.getElementById("motion-btn-wrap");
const tapDuration = 500;
let isTap = false;
let tapTimeout = null;

function triggerTap() {
  if (isTap) return;
  isTap = true;
  wrap.classList.add("is-tap");

  clearTimeout(tapTimeout);
  tapTimeout = setTimeout(() => {
    isTap = false;
    wrap.classList.remove("is-tap");
  }, tapDuration);
}

wrap.addEventListener("click", () => {
  triggerTap();
});

wrap.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    triggerTap();
  }
});
