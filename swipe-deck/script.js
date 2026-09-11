/**
 * 1-to-1 Vanilla Script for Swipe Deck
 * Original by @ddoemonn
 * Implements mouse drag gestures, left/right decisions, undo stack, and keyboard navigation
 */

const CANDIDATES = [
  {
    id: "a",
    name: "Nadia Roussel",
    role: "Design engineer",
    note: "Shipped a design system for a 40-person team.",
    avatar: "NR"
  },
  {
    id: "b",
    name: "Tobias Lund",
    role: "Motion engineer",
    note: "Six years of high-performance canvas motion work.",
    avatar: "TL"
  },
  {
    id: "c",
    name: "Priya Menon",
    role: "Frontend architect",
    note: "Rewrote checkout funnel with 12 percent conversion lift.",
    avatar: "PM"
  },
  {
    id: "d",
    name: "Caleb Sterling",
    role: "Systems Developer",
    note: "Maintains zero-dependency WebGL toolchain.",
    avatar: "CS"
  },
  {
    id: "e",
    name: "Sora Takahashi",
    role: "Product strategist",
    note: "Scaled B2B workspace from 0 to 1M daily active users.",
    avatar: "ST"
  }
];

let currentIndex = 0;
const history = []; // stores { index, direction }

const viewport = document.getElementById("deck-viewport");
const statusEl = document.getElementById("deck-status");
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const btnUndo = document.getElementById("btn-undo");

function renderDeck() {
  viewport.innerHTML = "";

  if (currentIndex >= CANDIDATES.length) {
    viewport.innerHTML = `
      <div class="w-full h-full p-8 rounded-3xl border border-stone-800 bg-stone-900/40 backdrop-blur-xl flex flex-col items-center justify-center text-center">
        <h3 class="text-base font-bold text-white mb-1">Deck Completed</h3>
        <p class="text-xs text-stone-400 mb-4">You have reviewed all current candidates in this stack.</p>
        <button id="reset-deck-btn" class="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-white transition-colors cursor-pointer">
          Reset Stack
        </button>
      </div>
    `;
    document.getElementById("reset-deck-btn").addEventListener("click", () => {
      currentIndex = 0;
      history.length = 0;
      renderDeck();
    });
    statusEl.textContent = "All reviewed";
    btnLeft.disabled = true;
    btnRight.disabled = true;
    btnUndo.disabled = history.length === 0;
    return;
  }

  statusEl.textContent = `Card ${currentIndex + 1} of ${CANDIDATES.length}`;
  btnLeft.disabled = false;
  btnRight.disabled = false;
  btnUndo.disabled = history.length === 0;

  // Render cards in reverse order (bottom to top)
  for (let i = Math.min(CANDIDATES.length - 1, currentIndex + 2); i >= currentIndex; i--) {
    const item = CANDIDATES[i];
    const diff = i - currentIndex;

    const card = document.createElement("div");
    card.className = "swipe-card absolute w-full h-full p-6 rounded-3xl border border-stone-800 bg-[#221e1a] shadow-2xl flex flex-col justify-between";

    const scale = 1 - diff * 0.05;
    const translateY = diff * 12;
    const zIndex = 20 - diff;
    const opacity = 1 - diff * 0.25;

    card.style.transform = `translateY(${translateY}px) scale(${scale})`;
    card.style.zIndex = zIndex;
    card.style.opacity = opacity;

    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-700 flex items-center justify-center font-bold text-white text-sm font-mono shadow-md">
          ${item.avatar}
        </div>
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-stone-800/80 text-stone-400 border border-stone-700/50">AVAILABLE</span>
      </div>

      <div class="my-auto">
        <h3 class="text-xl font-bold text-white tracking-tight leading-snug">${item.name}</h3>
        <p class="text-xs font-mono text-amber-400/90 mt-0.5">${item.role}</p>
        <p class="text-xs text-stone-300 mt-3 leading-relaxed bg-stone-900/60 p-3 rounded-xl border border-stone-800">
          "${item.note}"
        </p>
      </div>

      <div class="flex items-center justify-between text-[11px] text-stone-500 font-mono pt-3 border-t border-stone-800/80">
        <span>Verified Profile</span>
        <span>ID #${item.id.toUpperCase()}</span>
      </div>
    `;

    // Enable drag gesture only on top card
    if (diff === 0) {
      attachDragGesture(card);
    }

    viewport.appendChild(card);
  }
}

function decide(direction) {
  if (currentIndex >= CANDIDATES.length) return;

  const topCard = viewport.querySelector(".swipe-card:last-child");
  if (!topCard) return;

  history.push({ index: currentIndex, direction });

  const moveX = direction === "right" ? 400 : -400;
  const rot = direction === "right" ? 22 : -22;

  topCard.style.transform = `translate(${moveX}px, 20px) rotate(${rot}deg)`;
  topCard.style.opacity = "0";

  setTimeout(() => {
    currentIndex++;
    renderDeck();
  }, 300);
}

function undo() {
  if (history.length === 0) return;
  const last = history.pop();
  currentIndex = last.index;
  renderDeck();
}

function attachDragGesture(card) {
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  const onPointerDown = (e) => {
    isDragging = true;
    startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    card.style.transition = "none";
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    currentX = x - startX;
    const rot = currentX * 0.08;
    card.style.transform = `translate(${currentX}px, ${Math.abs(currentX) * 0.1}px) rotate(${rot}deg)`;
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    isDragging = false;
    card.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease";

    if (currentX > 90) {
      decide("right");
    } else if (currentX < -90) {
      decide("left");
    } else {
      card.style.transform = "translate(0px, 0px) rotate(0deg)";
    }
    currentX = 0;
  };

  card.addEventListener("mousedown", onPointerDown);
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);

  card.addEventListener("touchstart", onPointerDown, { passive: true });
  window.addEventListener("touchmove", onPointerMove, { passive: true });
  window.addEventListener("touchend", onPointerUp);
}

btnLeft.addEventListener("click", () => decide("left"));
btnRight.addEventListener("click", () => decide("right"));
btnUndo.addEventListener("click", () => undo());

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") decide("right");
  if (e.key === "ArrowLeft") decide("left");
  if (e.key === "Backspace") undo();
});

document.addEventListener("DOMContentLoaded", () => {
  renderDeck();
});
