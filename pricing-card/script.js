/**
 * 1-to-1 Vanilla Script for Pricing Card
 * Original by @0xUrvish
 * Manages monthly/yearly price transitions and radio selection
 */

const PRICES = {
  plus: { monthly: 12, yearly: 9.6 },
  standard: { monthly: 24, yearly: 19.2 },
  advanced: { monthly: 48, yearly: 38.4 }
};

let isYearly = false;
let selectedTier = "standard";

const btnMonthly = document.getElementById("btn-monthly");
const btnYearly = document.getElementById("btn-yearly");
const sliderMonthly = document.getElementById("slider-monthly");
const sliderYearly = document.getElementById("slider-yearly");
const tierCards = document.querySelectorAll(".tier-card");
const ctaBtn = document.getElementById("cta-btn");

function updatePricing() {
  tierCards.forEach(card => {
    const id = card.dataset.id;
    const priceEl = card.querySelector(".price-val");
    const val = isYearly ? PRICES[id].yearly : PRICES[id].monthly;
    priceEl.textContent = `$${val.toFixed(isYearly ? 1 : 0)}`;

    const isSelected = id === selectedTier;
    const inner = card.querySelector(".card-inner");
    const radio = card.querySelector(".radio-circle");

    if (isSelected) {
      inner.className = "card-inner relative rounded-xl bg-neutral-900/90 border-2 border-white transition-all duration-300 p-5 shadow-lg shadow-white/5";
      radio.className = "radio-circle w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all duration-300";
      radio.innerHTML = '<div class="w-3.5 h-3.5 rounded-full bg-white"></div>';
    } else {
      inner.className = "card-inner relative rounded-xl bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 p-5";
      radio.className = "radio-circle w-6 h-6 rounded-full border-2 border-neutral-700 flex items-center justify-center transition-all duration-300";
      radio.innerHTML = "";
    }
  });

  const capital = selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1);
  ctaBtn.textContent = `Continue with ${capital}`;
}

btnMonthly.addEventListener("click", () => {
  isYearly = false;
  sliderMonthly.style.opacity = "1";
  sliderYearly.style.opacity = "0";
  btnMonthly.classList.add("text-white");
  btnMonthly.classList.remove("text-neutral-400");
  btnYearly.classList.remove("text-white");
  btnYearly.classList.add("text-neutral-400");
  updatePricing();
});

btnYearly.addEventListener("click", () => {
  isYearly = true;
  sliderMonthly.style.opacity = "0";
  sliderYearly.style.opacity = "1";
  btnYearly.classList.add("text-white");
  btnYearly.classList.remove("text-neutral-400");
  btnMonthly.classList.remove("text-white");
  btnMonthly.classList.add("text-neutral-400");
  updatePricing();
});

tierCards.forEach(card => {
  card.addEventListener("click", () => {
    selectedTier = card.dataset.id;
    updatePricing();
  });
});

ctaBtn.addEventListener("click", () => {
  alert(`Plan selected: ${selectedTier.toUpperCase()} (${isYearly ? "Yearly Billing" : "Monthly Billing"})`);
});
