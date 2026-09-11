/**
 * Radial Orbital Timeline Component (Vanilla JS)
 * Enhanced HTML/CSS/JS clone of 21st.dev component by @jatin-yadav05
 */

const timelineData = [
  {
    id: 1,
    title: "Planning",
    date: "Jan 2024",
    content: "Project planning, feasibility analysis, and scope requirements gathering phase.",
    category: "Strategy",
    icon: "calendar",
    relatedIds: [2],
    status: "completed",
    energy: 100,
  },
  {
    id: 2,
    title: "Design",
    date: "Feb 2024",
    content: "UI/UX component systems, interaction tokens, and high-fidelity prototypes.",
    category: "Creative",
    icon: "file-text",
    relatedIds: [1, 3],
    status: "completed",
    energy: 90,
  },
  {
    id: 3,
    title: "Development",
    date: "Mar 2024",
    content: "Core engineering architecture, canvas rendering pipeline, and dynamic nodes.",
    category: "Engineering",
    icon: "code",
    relatedIds: [2, 4],
    status: "in-progress",
    energy: 60,
  },
  {
    id: 4,
    title: "Testing",
    date: "Apr 2024",
    content: "End-to-end integration, performance stress tests, and accessibility validation.",
    category: "Quality",
    icon: "user",
    relatedIds: [3, 5],
    status: "pending",
    energy: 30,
  },
  {
    id: 5,
    title: "Release",
    date: "May 2024",
    content: "Production deployment, global CDN propagation, and launch monitoring.",
    category: "DevOps",
    icon: "clock",
    relatedIds: [4],
    status: "pending",
    energy: 10,
  },
];

class RadialTimelineApp {
  constructor(data) {
    this.data = data;
    this.activeId = 3; // Default to Development (in-progress)
    this.isPaused = false;
    this.rotationAngle = 0;
    this.orbitRadius = 250;
    this.animationFrameId = null;

    // DOM Elements
    this.viewport = document.getElementById("orbital-viewport");
    this.canvas = document.getElementById("orbital-canvas");
    this.nodesContainer = document.getElementById("nodes-container");
    this.orbitTracksGroup = document.getElementById("orbit-tracks");
    this.relationLinesGroup = document.getElementById("relation-lines");
    this.railItems = document.getElementById("rail-items");

    // Center Pod Elements
    this.podKicker = document.getElementById("pod-kicker");
    this.podTitle = document.getElementById("pod-title");
    this.podDate = document.getElementById("pod-date");
    this.podStatus = document.getElementById("pod-status");
    this.podDesc = document.getElementById("pod-desc");
    this.podEnergyVal = document.getElementById("pod-energy-val");
    this.podEnergyFill = document.getElementById("pod-energy-fill");

    // Controls
    this.toggleMotionBtn = document.getElementById("toggle-motion-btn");
    this.resetBtn = document.getElementById("reset-btn");

    this.init();
  }

  init() {
    this.updateOrbitRadius();
    window.addEventListener("resize", () => {
      this.updateOrbitRadius();
      this.renderCanvas();
      this.updateNodePositions();
    });

    this.renderOrbitTracks();
    this.renderNodes();
    this.renderRail();
    this.attachEventListeners();
    this.selectNode(this.activeId);

    // Initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    this.startOrbitLoop();
  }

  updateOrbitRadius() {
    const isMobile = window.innerWidth <= 768;
    this.orbitRadius = isMobile ? 140 : 250;
  }

  renderOrbitTracks() {
    const cx = this.canvas.clientWidth / 2 || 340;
    const cy = this.canvas.clientHeight / 2 || 340;

    // Main orbit ring
    this.orbitTracksGroup.innerHTML = `
      <circle cx="50%" cy="50%" r="${this.orbitRadius}" class="orbit-circle active-track" />
      <circle cx="50%" cy="50%" r="${this.orbitRadius * 0.65}" class="orbit-circle" />
      <circle cx="50%" cy="50%" r="${this.orbitRadius * 1.25}" class="orbit-circle" />
    `;
  }

  renderNodes() {
    this.nodesContainer.innerHTML = "";
    const count = this.data.length;

    this.data.forEach((item, index) => {
      // Evenly distribute 360 deg
      const baseAngle = (index / count) * (2 * Math.PI) - Math.PI / 2;

      const wrapper = document.createElement("div");
      wrapper.className = "node-wrapper";
      wrapper.id = `node-wrapper-${item.id}`;
      wrapper.dataset.id = item.id;
      wrapper.dataset.baseAngle = baseAngle;

      wrapper.innerHTML = `
        <button class="node-btn" data-id="${item.id}" data-status="${item.status}" aria-label="Select milestone ${item.title}">
          <div class="node-icon-wrap">
            <i data-lucide="${item.icon}"></i>
          </div>
          <div class="node-info">
            <span class="node-name">${item.title}</span>
            <span class="node-sub">${item.date}</span>
          </div>
        </button>
      `;

      this.nodesContainer.appendChild(wrapper);
    });

    this.updateNodePositions();
  }

  renderRail() {
    this.railItems.innerHTML = "";
    this.data.forEach((item) => {
      const chip = document.createElement("button");
      chip.className = `rail-chip ${item.id === this.activeId ? "is-active" : ""}`;
      chip.dataset.id = item.id;
      chip.textContent = item.title;
      chip.addEventListener("click", () => this.selectNode(item.id));
      this.railItems.appendChild(chip);
    });
  }

  updateNodePositions() {
    const cx = this.viewport.clientWidth / 2;
    const cy = this.viewport.clientHeight / 2;
    const count = this.data.length;

    this.data.forEach((item, index) => {
      const wrapper = document.getElementById(`node-wrapper-${item.id}`);
      if (!wrapper) return;

      const baseAngle = parseFloat(wrapper.dataset.baseAngle);
      const currentAngle = baseAngle + (this.rotationAngle * Math.PI) / 180;

      const x = Math.cos(currentAngle) * this.orbitRadius;
      const y = Math.sin(currentAngle) * this.orbitRadius;

      wrapper.style.transform = `translate(${x}px, ${y}px)`;
      wrapper.dataset.posX = cx + x;
      wrapper.dataset.posY = cy + y;
    });

    this.renderRelations();
  }

  renderRelations() {
    let linesSvg = "";
    const activeItem = this.data.find((d) => d.id === this.activeId);

    this.data.forEach((item) => {
      const sourceWrapper = document.getElementById(`node-wrapper-${item.id}`);
      if (!sourceWrapper) return;

      const sx = parseFloat(sourceWrapper.dataset.posX);
      const sy = parseFloat(sourceWrapper.dataset.posY);

      (item.relatedIds || []).forEach((targetId) => {
        // Only draw in one direction to avoid duplication
        if (item.id < targetId) {
          const targetWrapper = document.getElementById(`node-wrapper-${targetId}`);
          if (!targetWrapper) return;

          const tx = parseFloat(targetWrapper.dataset.posX);
          const ty = parseFloat(targetWrapper.dataset.posY);

          const isConnectedToActive =
            activeItem && (activeItem.id === item.id || activeItem.id === targetId ||
            (activeItem.relatedIds && activeItem.relatedIds.includes(item.id) && activeItem.relatedIds.includes(targetId)));

          linesSvg += `
            <line
              x1="${sx}" y1="${sy}"
              x2="${tx}" y2="${ty}"
              class="relation-path ${isConnectedToActive ? "highlighted" : ""}"
            />
          `;
        }
      });
    });

    this.relationLinesGroup.innerHTML = linesSvg;
  }

  selectNode(id) {
    this.activeId = id;
    const item = this.data.find((d) => d.id === id);
    if (!item) return;

    // Update center pod
    this.podKicker.textContent = item.category || "MILESTONE";
    this.podTitle.textContent = item.title;
    this.podDate.textContent = item.date;
    this.podStatus.textContent = item.status.replace("-", " ");
    this.podStatus.setAttribute("data-status", item.status);
    this.podDesc.textContent = item.content;
    this.podEnergyVal.textContent = `${item.energy}%`;
    this.podEnergyFill.style.width = `${item.energy}%`;

    // Highlight button states
    document.querySelectorAll(".node-btn").forEach((btn) => {
      const btnId = parseInt(btn.dataset.id, 10);
      btn.classList.toggle("is-active", btnId === id);
      const isRelated = item.relatedIds && item.relatedIds.includes(btnId);
      btn.classList.toggle("is-related", Boolean(isRelated));
    });

    // Update bottom rail
    document.querySelectorAll(".rail-chip").forEach((chip) => {
      chip.classList.toggle("is-active", parseInt(chip.dataset.id, 10) === id);
    });

    this.renderRelations();
  }

  attachEventListeners() {
    this.nodesContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".node-btn");
      if (btn) {
        const id = parseInt(btn.dataset.id, 10);
        this.selectNode(id);
      }
    });

    this.toggleMotionBtn.addEventListener("click", () => {
      this.isPaused = !this.isPaused;
      document.body.classList.toggle("is-paused", this.isPaused);
      if (!this.isPaused) {
        this.startOrbitLoop();
      }
    });

    this.resetBtn.addEventListener("click", () => {
      this.rotationAngle = 0;
      this.selectNode(1);
      this.updateNodePositions();
    });

    // Pause on hover over center pod or nodes for accessibility/UX
    this.viewport.addEventListener("mouseenter", () => {
      this.isHovered = true;
    });
    this.viewport.addEventListener("mouseleave", () => {
      this.isHovered = false;
    });
  }

  startOrbitLoop() {
    const loop = () => {
      if (this.isPaused) return;

      if (!this.isHovered) {
        // Slow continuous orbit: ~0.08 degrees per frame
        this.rotationAngle = (this.rotationAngle + 0.08) % 360;
        this.updateNodePositions();
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame(loop);
  }
}

// Instantiate on DOM load
document.addEventListener("DOMContentLoaded", () => {
  window.radialTimeline = new RadialTimelineApp(timelineData);
});
