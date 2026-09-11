/**
 * 1-to-1 Vanilla Script for 3D Card
 * Original by @kavikatiyar
 * Smooth mouse tilt calculation with 3D perspective & depth translation
 */

const card = document.getElementById("card-3d");
const bookBtn = document.getElementById("book-btn");

card.addEventListener("mousemove", (e) => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;

  // Exact rotation sensitivity
  const rotateX = (y / (rect.height / 2)) * -18;
  const rotateY = (x / (rect.width / 2)) * 18;

  card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  card.style.boxShadow = `${-rotateY * 1.5}px ${rotateX * 1.5}px 35px rgba(0, 0, 0, 0.6)`;
});

card.addEventListener("mouseleave", () => {
  card.style.transform = "rotateX(0deg) rotateY(0deg)";
  card.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.5)";
});

bookBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  alert("This action can be customized via the onActionClick prop.");
});
