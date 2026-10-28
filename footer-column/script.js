/* 21st.dev — @mvp_Subha / footer-column (vanilla clone)
 *
 * A four-column footer with a glass newsletter card, brand block with social
 * icons, three link columns and the legal bar. The subscribe form validates
 * and acknowledges inline instead of navigating away. */

const LINKS = {
  Solutions: ["Business Automation", "Cloud Services", "Analytics", "Integrations", "Support"],
  Resources: ["Documentation", "Case Studies", "Blog", "Webinars", "Community"],
  Company: ["About Us", "Careers", "Contact", "Partners", "Press"],
};

const SOCIALS = {
  Instagram: `<rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>`,
  Twitter: `<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>`,
  LinkedIn: `<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle>`,
  YouTube: `<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
    <path d="m10 15 5-3-5-3z"></path>`,
};

/* ---------- link columns ---------- */
document.querySelectorAll("[data-links]").forEach((col) => {
  const heading = col.dataset.links;
  col.innerHTML = `<h4>${heading}</h4>
    <ul>${LINKS[heading].map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul>`;
});

/* ---------- socials ---------- */
const socialsEl = document.getElementById("socials");
Object.entries(SOCIALS).forEach(([name, path]) => {
  const a = document.createElement("a");
  a.href = "#";
  a.setAttribute("aria-label", name);
  a.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  a.addEventListener("click", (e) => {
    e.preventDefault();
    toast(`${name} profile`);
  });
  socialsEl.appendChild(a);
});

/* ---------- subscribe ---------- */
const toastEl = document.getElementById("toast");
let toastTimer = 0;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2200);
}

const form = document.getElementById("subForm");
const email = document.getElementById("email");
const button = form.querySelector("button");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = email.value.trim();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  if (!valid) {
    email.setAttribute("aria-invalid", "true");
    email.style.borderColor = "#dc2626";
    email.focus();
    toast("Enter a valid email address");
    email.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(-4px)" },
       { transform: "translateX(4px)" }, { transform: "translateX(0)" }],
      { duration: 240, easing: "ease-out" }
    );
    return;
  }

  email.removeAttribute("aria-invalid");
  email.style.borderColor = "";
  button.textContent = "Subscribed";
  button.disabled = true;
  toast(`Thanks — we'll write to ${value}`);
  setTimeout(() => {
    button.textContent = "Subscribe Now";
    button.disabled = false;
    email.value = "";
  }, 2400);
});

email.addEventListener("input", () => {
  email.removeAttribute("aria-invalid");
  email.style.borderColor = "";
});

/* theme from ?theme= or the OS */
const q = new URL(window.location.href).searchParams.get("theme");
const dark = q ? q === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.classList.toggle("dark", dark);
