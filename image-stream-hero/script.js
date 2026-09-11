/**
 * 1-to-1 Vanilla Script for Image Stream Hero
 * Original component by @ruixen.ui
 * Generates continuous 3D mathematical spline corridor perspective keyframes
 */

const IMAGES = [
  { src: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/stock-images/767d99bb371a54d0d36751e8c757c91a.jpg", alt: "Mountain flow" },
  { src: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/gradients/hue-flow/hue-flow-01.png", alt: "Flowing hue gradient" },
  { src: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/stock-images/98f89cb9994f5c382ab964062c4039db.jpg", alt: "Figure with swirling cloud" },
  { src: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/gradients/moon/moon-grade-03.png", alt: "Moon-toned gradient" },
  { src: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/stock-images/ddcbee38be8b7274e19e132d7ab35b53.jpg", alt: "Hand gesture colorful bird" },
  { src: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/gradients/hero_gradient/hero-gradients-03.png", alt: "Layered hero gradient" },
  { src: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/gradients/hue-flow/hue-flow-02.png", alt: "Hue flow gradient" },
  { src: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/stock-images/611b8b8eb3ebc96937bc3949f57917f2.jpg", alt: "Geometric art" },
  { src: "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/gradients/moon/moon-grade-05.png", alt: "Deep moon gradient" }
];

// Exact math parameters from component bundle:
// Ey = { perspective: 30, cardWidth: 18, cardHeight: 25, cardRadius: 0.4, birthHeight: 2.6, exitHeight: 46, railBirth: -11, railExit: 44, fan: 3.3, turnBirth: 6, turnExit: 28, stops: 24 }
const PARAMS = {
  perspective: 30,
  cardWidth: 18,
  cardHeight: 25,
  cardRadius: 0.4,
  birthHeight: 2.6,
  exitHeight: 46,
  railBirth: -11,
  railExit: 44,
  fan: 3.3,
  turnBirth: 6,
  turnExit: 28,
  stops: 24,
  speed: 18,
  cardsCount: 9,
  axis: 55
};

function generateKeyframes(direction, animName, T) {
  const steps = [];
  for (let s = 0; s <= T.stops; s++) {
    const progress = s / T.stops;
    const scaleFactor = (T.birthHeight / T.cardHeight) * Math.pow(T.exitHeight / T.birthHeight, progress);
    const z = T.perspective * (1 - 1 / scaleFactor);
    const x = T.railExit - (T.railExit - T.railBirth) * Math.pow(1 - progress, T.fan);
    const rotY = T.turnBirth + (T.turnExit - T.turnBirth) * progress;

    steps.push(
      `${(progress * 100).toFixed(2)}% { transform: translate3d(${(direction * x).toFixed(2)}cqw, 0, ${z.toFixed(2)}cqw) rotateY(${(-direction * rotY).toFixed(2)}deg); }`
    );
  }
  return `@keyframes ${animName} { ${steps.join(" ")} }`;
}

function initStream() {
  const styleEl = document.getElementById("stream-keyframes");
  const railEl = document.getElementById("stream-cards-rail");

  const rName = "stream-anim-right";
  const lName = "stream-anim-left";

  const css = `
    ${generateKeyframes(1, rName, PARAMS)}
    ${generateKeyframes(-1, lName, PARAMS)}
    @media (prefers-reduced-motion: reduce) {
      .stream-card-item { animation-play-state: paused !important; }
    }
  `;
  styleEl.textContent = css;

  let cardsHtml = "";
  const sides = [
    { dir: 1, name: rName },
    { dir: -1, name: lName }
  ];

  sides.forEach(side => {
    for (let i = 0; i < PARAMS.cardsCount; i++) {
      const img = IMAGES[i % IMAGES.length];
      const delay = -(i * PARAMS.speed) / PARAMS.cardsCount;

      cardsHtml += `
        <div class="stream-card-item absolute overflow-hidden pointer-events-none"
             style="
               left: 50%;
               top: ${PARAMS.axis}%;
               width: ${PARAMS.cardWidth}cqw;
               height: ${PARAMS.cardHeight}cqw;
               margin-left: ${-PARAMS.cardWidth / 2}cqw;
               margin-top: ${-PARAMS.cardHeight / 2}cqw;
               border-radius: ${PARAMS.cardRadius}cqw;
               animation: ${side.name} ${PARAMS.speed}s linear infinite;
               animation-delay: ${delay}s;
               backface-visibility: hidden;
               box-shadow: 0 10px 30px rgba(0,0,0,0.5);
             ">
          <img src="${img.src}" alt="${img.alt}" class="w-full h-full object-cover" loading="lazy" decoding="async" draggable="false" />
        </div>
      `;
    }
  });

  railEl.innerHTML = cardsHtml;
}

document.addEventListener("DOMContentLoaded", initStream);
