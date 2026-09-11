/**
 * 1-to-1 Canvas Liquid Metal Shader Simulation
 * Original by @johuniq / Paper Design
 * Simulates the dynamic iridescent liquid chrome flow around button border
 */

const canvas = document.getElementById("metal-canvas");
const ctx = canvas.getContext("2d");

let time = 0;
let isHovered = false;
let speed = 0.02;

function renderMetal() {
  const w = canvas.width;
  const h = canvas.height;

  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  // Liquid mercury flow mathematics
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = (x / w) * 2 - 1;
      const v = (y / h) * 2 - 1;

      const wave1 = Math.sin(u * 4.0 + time * 1.5);
      const wave2 = Math.cos(v * 4.0 - time * 1.2);
      const wave3 = Math.sin((u + v) * 3.0 + time * 2.0);

      const val = (wave1 + wave2 + wave3) / 3.0;
      const bright = Math.pow((val + 1) * 0.5, isHovered ? 2.2 : 3.5);

      const idx = (y * w + x) * 4;
      
      // Metallic monochrome gradient with specular chrome highlights
      const r = Math.min(255, Math.floor(bright * 255 + 30));
      const g = Math.min(255, Math.floor(bright * 255 + 30));
      const b = Math.min(255, Math.floor(bright * 255 + 35));

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  time += speed;
  requestAnimationFrame(renderMetal);
}

const btnWrap = document.querySelector(".liquid-btn-wrap");
btnWrap.addEventListener("mouseenter", () => {
  isHovered = true;
  speed = 0.045;
});
btnWrap.addEventListener("mouseleave", () => {
  isHovered = false;
  speed = 0.02;
});

renderMetal();
