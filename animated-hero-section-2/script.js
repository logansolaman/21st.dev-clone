/**
 * Animated Globe Hero - Ravi Katiyar (1:1 Clone)
 */

const ANIMATED_WORDS = ["map builder", "data platform", "geospatial tool"];

class WordRotator {
  constructor(container, words) {
    this.container = container;
    this.words = words;
    this.currentIndex = 0;
    this.currentSpan = null;

    this.render();
    this.startTimer();
  }

  render() {
    this.container.innerHTML = "";
    this.currentSpan = document.createElement("span");
    this.currentSpan.className =
      "word-slide absolute inset-0 text-primary whitespace-nowrap flex items-center justify-center";
    this.currentSpan.textContent = this.words[this.currentIndex];
    this.currentSpan.style.transform = "translateY(0%)";
    this.currentSpan.style.opacity = "1";
    this.container.appendChild(this.currentSpan);
  }

  next() {
    const nextIndex = (this.currentIndex + 1) % this.words.length;
    const nextWord = this.words[nextIndex];

    const nextSpan = document.createElement("span");
    nextSpan.className =
      "word-slide absolute inset-0 text-primary whitespace-nowrap flex items-center justify-center";
    nextSpan.textContent = nextWord;
    nextSpan.style.transform = "translateY(100%)";
    nextSpan.style.opacity = "0";

    this.container.appendChild(nextSpan);

    // Trigger transition
    requestAnimationFrame(() => {
      this.currentSpan.style.transform = "translateY(-100%)";
      this.currentSpan.style.opacity = "0";

      nextSpan.style.transform = "translateY(0%)";
      nextSpan.style.opacity = "1";

      setTimeout(() => {
        if (this.currentSpan && this.currentSpan.parentNode) {
          this.currentSpan.parentNode.removeChild(this.currentSpan);
        }
        this.currentSpan = nextSpan;
        this.currentIndex = nextIndex;
      }, 700);
    });
  }

  startTimer() {
    setInterval(() => {
      this.next();
    }, 3000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const rotatorContainer = document.getElementById("word-rotator");
  if (rotatorContainer) {
    new WordRotator(rotatorContainer, ANIMATED_WORDS);
  }

  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
    });
  }
});
