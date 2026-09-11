/**
 * Ticket Confirmation Card - Ravi Katiyar (1:1 Clone)
 */

function generateBarcodeBars(svgEl, value) {
  svgEl.innerHTML = "";
  let currentX = 10;
  const barHeight = 45;

  for (let i = 0; i < value.length; i++) {
    const digit = parseInt(value[i], 10) || 1;
    const width = (digit % 3) + 1.2;
    const gap = (digit % 2) + 1.8;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", currentX.toString());
    rect.setAttribute("y", "2");
    rect.setAttribute("width", width.toString());
    rect.setAttribute("height", barHeight.toString());
    rect.setAttribute("fill", "currentColor");
    rect.classList.add("text-foreground");
    svgEl.appendChild(rect);

    currentX += width + gap;
  }

  // Extra guard bars at ends
  const endRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  endRect.setAttribute("x", currentX.toString());
  endRect.setAttribute("y", "2");
  endRect.setAttribute("width", "2.5");
  endRect.setAttribute("height", barHeight.toString());
  endRect.setAttribute("fill", "currentColor");
  endRect.classList.add("text-foreground");
  svgEl.appendChild(endRect);
}

function triggerConfetti() {
  const container = document.getElementById("confetti-container");
  if (!container) return;
  container.innerHTML = "";

  const colors = ["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#3b82f6", "#8b5cf6"];
  const count = 75;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 6;
    const left = Math.random() * 100;
    const duration = Math.random() * 2 + 2.5;
    const delay = Math.random() * 0.5;

    particle.style.position = "absolute";
    particle.style.left = `${left}%`;
    particle.style.top = "-20px";
    particle.style.width = `${size}px`;
    particle.style.height = `${size * 0.6}px`;
    particle.style.backgroundColor = color;
    particle.style.borderRadius = "2px";
    particle.style.opacity = "0.9";
    particle.style.transform = `rotate(${Math.random() * 360}deg)`;
    particle.style.transition = `transform ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s, top ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s, opacity ${duration}s ease-out ${delay}s`;

    container.appendChild(particle);

    requestAnimationFrame(() => {
      particle.style.top = `${window.innerHeight + 50}px`;
      particle.style.transform = `translateX(${Math.random() * 120 - 60}px) rotate(${Math.random() * 720}deg)`;
      particle.style.opacity = "0";
    });
  }

  setTimeout(() => {
    container.innerHTML = "";
  }, 5000);
}

document.addEventListener("DOMContentLoaded", () => {
  const barcodeSvg = document.getElementById("barcode-svg");
  if (barcodeSvg) {
    generateBarcodeBars(barcodeSvg, "28937261273650");
  }

  // Trigger initial confetti explosion
  setTimeout(() => {
    triggerConfetti();
  }, 300);

  const btnReplay = document.getElementById("btn-replay");
  if (btnReplay) {
    btnReplay.addEventListener("click", () => {
      triggerConfetti();
    });
  }

  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
    });
  }
});
