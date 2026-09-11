/**
 * useImageUpload Hook & Demo - Origin UI (1:1 Clone)
 */

class ImageUploadController {
  constructor() {
    this.fileInput = document.getElementById("file-input");
    this.dropzone = document.getElementById("dropzone");
    this.previewArea = document.getElementById("preview-area");
    this.previewImg = document.getElementById("preview-img");
    this.fileNameEl = document.getElementById("file-name");

    this.btnReupload = document.getElementById("btn-reupload");
    this.btnRemove = document.getElementById("btn-remove");
    this.btnRemoveInline = document.getElementById("btn-remove-inline");

    this.previewUrl = null;
    this.fileName = null;

    this.bindEvents();
  }

  handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;

    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.fileName = file.name;
    this.previewUrl = URL.createObjectURL(file);

    this.previewImg.src = this.previewUrl;
    this.fileNameEl.textContent = this.fileName;

    this.dropzone.classList.add("hidden");
    this.previewArea.classList.remove("hidden");

    console.log("Uploaded image URL:", this.previewUrl);
  }

  remove() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = null;
    this.fileName = null;
    this.previewImg.src = "";
    this.fileInput.value = "";

    this.previewArea.classList.add("hidden");
    this.dropzone.classList.remove("hidden");
  }

  bindEvents() {
    // Click dropzone to open native dialog
    this.dropzone.addEventListener("click", () => {
      this.fileInput.click();
    });

    this.btnReupload.addEventListener("click", () => {
      this.fileInput.click();
    });

    this.btnRemove.addEventListener("click", () => {
      this.remove();
    });

    this.btnRemoveInline.addEventListener("click", () => {
      this.remove();
    });

    // File change
    this.fileInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (file) {
        this.handleFile(file);
      }
    });

    // Drag and drop
    const prevent = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    this.dropzone.addEventListener("dragover", prevent);
    this.dropzone.addEventListener("dragenter", (e) => {
      prevent(e);
      this.dropzone.classList.add("border-primary/50", "bg-primary/5");
    });
    this.dropzone.addEventListener("dragleave", (e) => {
      prevent(e);
      this.dropzone.classList.remove("border-primary/50", "bg-primary/5");
    });
    this.dropzone.addEventListener("drop", (e) => {
      prevent(e);
      this.dropzone.classList.remove("border-primary/50", "bg-primary/5");
      const file = e.dataTransfer.files?.[0];
      if (file) {
        this.handleFile(file);
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ImageUploadController();

  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
    });
  }
});
