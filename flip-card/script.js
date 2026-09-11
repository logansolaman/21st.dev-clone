/**
 * Flip Card - Animate UI 1:1 Implementation
 */

const flipCardData = {
  name: 'Animate UI',
  username: 'animate_ui',
  image: 'https://pbs.twimg.com/profile_images/1950218390741618688/72447Y7e_400x400.jpg',
  bio: 'A fully animated, open-source component distribution built with React, TypeScript, Tailwind CSS, and Motion.',
  stats: { following: 200, followers: 2900, posts: 120 },
  socialLinks: {
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    twitter: 'https://twitter.com',
  },
};

class FlipCard {
  constructor(cardEl, data) {
    this.cardEl = cardEl;
    this.frontEl = cardEl.querySelector("#card-front");
    this.backEl = cardEl.querySelector("#card-back");
    this.data = data;
    this.isFlipped = false;
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    this.bindEvents();
  }

  setFlipped(flipped) {
    this.isFlipped = flipped;
    if (this.isFlipped) {
      this.frontEl.style.transform = "rotateY(-180deg)";
      this.backEl.style.transform = "rotateY(0deg)";
    } else {
      this.frontEl.style.transform = "rotateY(0deg)";
      this.backEl.style.transform = "rotateY(180deg)";
    }
  }

  bindEvents() {
    this.cardEl.addEventListener("click", () => {
      if (this.isTouchDevice) {
        this.setFlipped(!this.isFlipped);
      }
    });

    this.cardEl.addEventListener("mouseenter", () => {
      if (!this.isTouchDevice) {
        this.setFlipped(true);
      }
    });

    this.cardEl.addEventListener("mouseleave", () => {
      if (!this.isTouchDevice) {
        this.setFlipped(false);
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const cardEl = document.getElementById("flip-card");
  if (cardEl) {
    new FlipCard(cardEl, flipCardData);
  }

  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
    });
  }
});
