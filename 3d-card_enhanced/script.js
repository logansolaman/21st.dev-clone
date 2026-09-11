/**
 * Enhanced 3D Card Script
 * Multi-spot switcher, dynamic tilt adjustment, and booking feedback
 */

const DESTINATIONS = [
  {
    id: "sapa",
    title: "Sapa Valley",
    subtitle: "Vietnam",
    price: "$640 / pax",
    badge: "TRENDING",
    imgUrl: "https://cdn.21st.dev/assets/mirror/cb/cba31f67585cf839050f0f22fbea6a3ba72bed28250b0afd82cf354da4b1e652.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Sa_Pa"
  },
  {
    id: "kyoto",
    title: "Arashiyama Grove",
    subtitle: "Kyoto, Japan",
    price: "$820 / pax",
    badge: "FEATURED",
    imgUrl: "https://cdn.21st.dev/assets/mirror/05/05536dea31a97c7c4243f835d48e2c487cfeead267d4651a9b515987bef18e61.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Arashiyama"
  },
  {
    id: "alps",
    title: "Matterhorn Ridge",
    subtitle: "Zermatt, Switzerland",
    price: "$1,250 / pax",
    badge: "EXPEDITION",
    imgUrl: "https://cdn.21st.dev/assets/mirror/a6/a61a357faccddd302e85600234a02350a27f21b4cc8b3531578991614c050151.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Matterhorn"
  }
];

const card = document.getElementById("enhanced-card");
const cardImg = document.getElementById("card-img");
const cardTitle = document.getElementById("card-title");
const cardSub = document.getElementById("card-sub");
const cardBadge = document.getElementById("card-badge");
const cardPrice = document.getElementById("card-price");
const cardLink = document.getElementById("card-link");
const presetList = document.getElementById("preset-list");
const tiltSlider = document.getElementById("tilt-slider");
const tiltVal = document.getElementById("tilt-val");
const bookActionBtn = document.getElementById("book-action-btn");

let activeDest = DESTINATIONS[0];
let maxTilt = 18;

function setDestination(item) {
  activeDest = item;
  cardTitle.textContent = item.title;
  cardSub.textContent = item.subtitle;
  cardBadge.textContent = item.badge;
  cardPrice.textContent = item.price;
  cardLink.href = item.wikiUrl;
  cardImg.src = item.imgUrl;
  cardImg.alt = item.title;

  renderPresets();
}

function renderPresets() {
  presetList.innerHTML = "";
  DESTINATIONS.forEach(item => {
    const btn = document.createElement("button");
    const isActive = item.id === activeDest.id;
    btn.className = `w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
      isActive ? "border-sky-500/50 bg-sky-500/10 text-white font-medium" : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200"
    }`;
    btn.innerHTML = `
      <div>
        <div class="text-xs font-semibold text-white">${item.title}</div>
        <div class="text-[11px] text-slate-400">${item.subtitle}</div>
      </div>
      <span class="text-xs font-mono text-sky-400">${item.price}</span>
    `;
    btn.onclick = () => setDestination(item);
    presetList.appendChild(btn);
  });
}

card.addEventListener("mousemove", (e) => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;

  const rotateX = (y / (rect.height / 2)) * -maxTilt;
  const rotateY = (x / (rect.width / 2)) * maxTilt;

  card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  card.style.boxShadow = `${-rotateY * 1.5}px ${rotateX * 1.5}px 35px rgba(0, 0, 0, 0.6)`;
});

card.addEventListener("mouseleave", () => {
  card.style.transform = "rotateX(0deg) rotateY(0deg)";
  card.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.5)";
});

tiltSlider.addEventListener("input", (e) => {
  maxTilt = parseInt(e.target.value, 10);
  tiltVal.textContent = `${maxTilt}°`;
});

bookActionBtn.addEventListener("click", () => {
  alert(`Booking initiated for ${activeDest.title} (${activeDest.price})`);
});

document.addEventListener("DOMContentLoaded", () => {
  renderPresets();
  if (window.lucide) window.lucide.createIcons();
});
