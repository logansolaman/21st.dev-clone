/**
 * 1-to-1 Vanilla Port of 21st.dev's Radial Orbital Timeline
 * Original Author: @jatin-yadav05
 */

const timelineData = [
  {
    id: 1,
    title: "Planning",
    date: "Jan 2024",
    content: "Project planning and requirements gathering phase.",
    category: "Planning",
    icon: "calendar",
    relatedIds: [2],
    status: "completed",
    energy: 100,
  },
  {
    id: 2,
    title: "Design",
    date: "Feb 2024",
    content: "UI/UX design and system architecture.",
    category: "Design",
    icon: "file-text",
    relatedIds: [1, 3],
    status: "completed",
    energy: 90,
  },
  {
    id: 3,
    title: "Development",
    date: "Mar 2024",
    content: "Core features implementation and testing.",
    category: "Development",
    icon: "code",
    relatedIds: [2, 4],
    status: "in-progress",
    energy: 60,
  },
  {
    id: 4,
    title: "Testing",
    date: "Apr 2024",
    content: "User testing and bug fixes.",
    category: "Testing",
    icon: "user",
    relatedIds: [3, 5],
    status: "pending",
    energy: 30,
  },
  {
    id: 5,
    title: "Release",
    date: "May 2024",
    content: "Final deployment and release.",
    category: "Release",
    icon: "clock",
    relatedIds: [4],
    status: "pending",
    energy: 10,
  },
];

class ExactRadialTimeline {
  constructor(data) {
    this.data = data;
    this.activeId = null;
    this.rotationAngle = 0;
    this.isAutoOrbiting = true;
    this.orbitRadius = 200; // Original component uses radius of 200
    this.relatedMap = {};

    this.container = document.getElementById("radial-container");
    this.stage = document.getElementById("orbital-stage");
    this.mount = document.getElementById("nodes-mount");

    this.init();
  }

  init() {
    this.render();
    this.startLoop();
    this.attachEvents();
  }

  calculatePosition(index, total) {
    const angleDeg = ((index / total) * 360 + this.rotationAngle) % 360;
    const rad = (angleDeg * Math.PI) / 180;
    const x = this.orbitRadius * Math.cos(rad);
    const y = this.orbitRadius * Math.sin(rad);

    // Exact formula from 21st.dev Component.tsx
    const zIndex = Math.round(100 + 50 * Math.cos(rad));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(rad)) / 2)));

    return { x, y, angleDeg, zIndex, opacity };
  }

  getStatusBadgeClass(status) {
    switch (status) {
      case "completed":
        return "text-white bg-black border-white border";
      case "in-progress":
        return "text-black bg-white border-black border";
      case "pending":
      default:
        return "text-white bg-black/40 border-white/50 border";
    }
  }

  render() {
    this.mount.innerHTML = "";

    this.data.forEach((item, index) => {
      const pos = this.calculatePosition(index, this.data.length);
      const isActive = this.activeId === item.id;
      const isRelated = Boolean(this.relatedMap[item.id]);

      const nodeEl = document.createElement("div");
      nodeEl.className = "absolute transition-all duration-700 cursor-pointer";
      nodeEl.style.transform = `translate(${pos.x.toFixed(3)}px, ${pos.y.toFixed(3)}px)`;
      nodeEl.style.zIndex = isActive ? 200 : pos.zIndex;
      nodeEl.style.opacity = isActive ? 1 : pos.opacity;
      nodeEl.dataset.id = item.id;

      // Glow halo calculated from energy: width = energy * 0.5 + 40
      const haloDim = item.energy * 0.5 + 40;
      const haloOffset = -((haloDim - 40) / 2);

      nodeEl.innerHTML = `
        <!-- Radial energy halo -->
        <div class="absolute rounded-full -inset-1 ${isRelated ? "animate-pulse duration-1000" : ""}"
             style="background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%); width: ${haloDim}px; height: ${haloDim}px; left: ${haloOffset}px; top: ${haloOffset}px;">
        </div>

        <!-- Node Circle -->
        <div class="
          w-10 h-10 rounded-full flex items-center justify-center
          ${isActive ? "bg-white text-black" : isRelated ? "bg-white/50 text-black" : "bg-black text-white"}
          border-2 
          ${isActive ? "border-white shadow-lg shadow-white/30" : isRelated ? "border-white animate-pulse" : "border-white/40"}
          transition-all duration-300 transform
          ${isActive ? "scale-150" : ""}
        ">
          <i data-lucide="${item.icon}" style="width: 16px; height: 16px;"></i>
        </div>

        <!-- Node Title Label -->
        <div class="
          absolute top-12 whitespace-nowrap
          text-xs font-semibold tracking-wider
          transition-all duration-300
          ${isActive ? "text-white scale-125 font-bold" : "text-white/70"}
        ">
          ${item.title}
        </div>

        <!-- Active Card Overlay -->
        ${
          isActive
            ? `
          <div class="absolute top-20 left-1/2 -translate-x-1/2 w-64 bg-black/90 backdrop-blur-lg border border-white/30 rounded-lg shadow-xl shadow-white/10 p-4 overflow-visible text-white cursor-default"
               onclick="event.stopPropagation()">
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/50"></div>
            
            <div class="pb-2">
              <div class="flex justify-between items-center mb-1">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold uppercase ${this.getStatusBadgeClass(item.status)}">
                  ${item.status === "completed" ? "COMPLETE" : item.status === "in-progress" ? "IN PROGRESS" : "PENDING"}
                </span>
                <span class="text-xs font-mono text-white/50">${item.date}</span>
              </div>
              <h3 class="text-sm font-semibold tracking-tight mt-1 text-white">${item.title}</h3>
            </div>

            <div class="text-xs text-white/80">
              <p class="leading-relaxed">${item.content}</p>
              
              <div class="mt-4 pt-3 border-t border-white/10">
                <div class="flex justify-between items-center text-xs mb-1 text-white/70">
                  <span class="flex items-center gap-1">
                    <i data-lucide="zap" style="width: 10px; height: 10px;"></i>
                    Energy Level
                  </span>
                  <span class="font-mono text-white">${item.energy}%</span>
                </div>
                <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500" style="width: ${item.energy}%;"></div>
                </div>
              </div>
            </div>
          </div>
        `
            : ""
        }
      `;

      nodeEl.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleNode(item.id);
      });

      this.mount.appendChild(nodeEl);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  toggleNode(id) {
    if (this.activeId === id) {
      // Deselect
      this.activeId = null;
      this.isAutoOrbiting = true;
      this.relatedMap = {};
    } else {
      // Select
      this.activeId = id;
      this.isAutoOrbiting = false;
      const targetItem = this.data.find((d) => d.id === id);
      const related = targetItem ? targetItem.relatedIds || [] : [];
      this.relatedMap = {};
      related.forEach((relId) => {
        this.relatedMap[relId] = true;
      });

      // Align selected item to bottom (270deg) as in original
      const index = this.data.findIndex((d) => d.id === id);
      const baseAngle = (index / this.data.length) * 360;
      this.rotationAngle = (270 - baseAngle + 360) % 360;
    }
    this.render();
  }

  attachEvents() {
    this.container.addEventListener("click", () => {
      if (this.activeId !== null) {
        this.activeId = null;
        this.isAutoOrbiting = true;
        this.relatedMap = {};
        this.render();
      }
    });
  }

  startLoop() {
    setInterval(() => {
      if (this.isAutoOrbiting) {
        this.rotationAngle = Number(((this.rotationAngle + 0.3) % 360).toFixed(3));
        this.render();
      }
    }, 50);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ExactRadialTimeline(timelineData);
});
