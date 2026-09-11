/**
 * Enhanced Pricing Card Script
 * Dynamic perks matrix, annual discount computation, and instant CTA state update
 */

const TIERS_DATA = {
  plus: {
    name: "Plus",
    monthly: 12,
    yearly: 9.6,
    perks: [
      "1 Dedicated team member",
      "5 Active workspaces",
      "Standard community support",
      "Export to HTML/CSS/JS"
    ]
  },
  standard: {
    name: "Standard",
    monthly: 24,
    yearly: 19.2,
    perks: [
      "Up to 10 team seats",
      "Unlimited AI component renders",
      "Priority cloud GPU nodes",
      "Full design system exports",
      "24/7 Priority Discord support"
    ]
  },
  advanced: {
    name: "Advanced",
    monthly: 48,
    yearly: 38.4,
    perks: [
      "Unlimited seats & multi-tenancy",
      "Dedicated isolated inference clusters",
      "99.99% Uptime SLA guarantee",
      "Custom security & SSO integrations",
      "Direct engineer onboarding"
    ]
  }
};

let isYearly = false;
let activeTier = "standard";

const btnM = document.getElementById("btn-m");
const btnY = document.getElementById("btn-y");
const sliderM = document.getElementById("slider-m");
const sliderY = document.getElementById("slider-y");
const tierItems = document.querySelectorAll(".tier-item");
const perksTitle = document.getElementById("perks-title");
const perksList = document.getElementById("perks-list");
const checkoutBtn = document.getElementById("checkout-btn");

function renderUI() {
  tierItems.forEach(item => {
    const id = item.dataset.id;
    const tier = TIERS_DATA[id];
    const priceDisplay = item.querySelector(".price-display");
    const val = isYearly ? tier.yearly : tier.monthly;
    priceDisplay.textContent = `$${val.toFixed(isYearly ? 1 : 0)}`;

    const isSelected = id === activeTier;
    const inner = item.querySelector(".tier-inner");
    const dot = item.querySelector(".radio-dot");

    if (isSelected) {
      inner.className = "tier-inner p-4 rounded-2xl border-2 border-sky-500 bg-sky-500/10 transition-all duration-300 shadow-lg shadow-sky-500/10";
      dot.className = "radio-dot w-5 h-5 rounded-full border-2 border-sky-500 flex items-center justify-center";
      dot.innerHTML = '<div class="w-2.5 h-2.5 rounded-full bg-sky-400"></div>';
    } else {
      inner.className = "tier-inner p-4 rounded-2xl border border-slate-800 bg-slate-950/40 hover:border-slate-700 transition-all duration-300";
      dot.className = "radio-dot w-5 h-5 rounded-full border-2 border-slate-700 flex items-center justify-center";
      dot.innerHTML = '';
    }
  });

  // Update Perks list
  const current = TIERS_DATA[activeTier];
  perksTitle.textContent = `Included in ${current.name}:`;
  perksList.innerHTML = current.perks
    .map(p => `<li class="flex items-center gap-2"><i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i> <span>${p}</span></li>`)
    .join("");

  checkoutBtn.textContent = `Upgrade to ${current.name}`;

  if (window.lucide) window.lucide.createIcons();
}

btnM.addEventListener("click", () => {
  isYearly = false;
  sliderM.style.opacity = "1";
  sliderY.style.opacity = "0";
  btnM.classList.add("text-white");
  btnM.classList.remove("text-slate-400");
  btnY.classList.remove("text-white");
  btnY.classList.add("text-slate-400");
  renderUI();
});

btnY.addEventListener("click", () => {
  isYearly = true;
  sliderM.style.opacity = "0";
  sliderY.style.opacity = "1";
  btnY.classList.add("text-white");
  btnY.classList.remove("text-slate-400");
  btnM.classList.remove("text-white");
  btnM.classList.add("text-slate-400");
  renderUI();
});

tierItems.forEach(item => {
  item.addEventListener("click", () => {
    activeTier = item.dataset.id;
    renderUI();
  });
});

checkoutBtn.addEventListener("click", () => {
  const current = TIERS_DATA[activeTier];
  const price = isYearly ? current.yearly : current.monthly;
  alert(`Proceeding to checkout: ${current.name} Plan at $${price}/mo (${isYearly ? "Annual Prepay" : "Monthly"})`);
});

document.addEventListener("DOMContentLoaded", () => {
  renderUI();
  if (window.lucide) window.lucide.createIcons();
});
