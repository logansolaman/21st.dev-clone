/**
 * 1-to-1 Vanilla Script for Animated Search Bar
 * Original by @aghasisahakyan1
 * Handles expanding width from pill into full search field + dropdown results
 */

const capsule = document.getElementById("search-capsule");
const collapsedLabel = document.getElementById("collapsed-label");
const searchInput = document.getElementById("search-input");
const closeBtn = document.getElementById("close-search");
const resultsDropdown = document.getElementById("results-dropdown");

let isExpanded = false;

function expand() {
  if (isExpanded) return;
  isExpanded = true;

  capsule.style.width = "280px";
  capsule.classList.remove("cursor-pointer");
  collapsedLabel.classList.add("hidden");

  searchInput.classList.remove("hidden");
  closeBtn.classList.remove("hidden");
  searchInput.focus();

  resultsDropdown.classList.remove("hidden");
  setTimeout(() => {
    resultsDropdown.classList.remove("opacity-0");
  }, 100);
}

function collapse() {
  if (!isExpanded) return;
  isExpanded = false;

  resultsDropdown.classList.add("opacity-0");
  setTimeout(() => {
    resultsDropdown.classList.add("hidden");
  }, 150);

  searchInput.classList.add("hidden");
  closeBtn.classList.add("hidden");
  collapsedLabel.classList.remove("hidden");

  capsule.style.width = "112px";
  capsule.classList.add("cursor-pointer");
  searchInput.value = "";
}

capsule.addEventListener("click", () => {
  if (!isExpanded) expand();
});

closeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  collapse();
});

document.addEventListener("click", (e) => {
  if (isExpanded && !capsule.contains(e.target) && !resultsDropdown.contains(e.target)) {
    collapse();
  }
});

document.addEventListener("keydown", (e) => {
  if (isExpanded && e.key === "Escape") {
    collapse();
  }
});
