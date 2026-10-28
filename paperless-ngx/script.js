/* 21st.dev — community/apps/paperless-ngx (vanilla clone)
 *
 * The app detail page: breadcrumb, identity block with the star count and
 * licence, a framed capture of the real UI with a Source overlay, then the
 * About prose, a spec sheet and the tag cloud. Copy command actually copies
 * the run command. */

const TAGS = [
  "Personal apps", "Files and sync", "ai", "angular", "archiving", "django",
  "dms", "document-management", "document-management-system", "llm",
  "machine-learning", "ocr", "optical-character-recognition", "pdf",
];

const COMMAND =
  "docker run -d -p 8000:8000 -v paperless:/usr/src/paperless/data " +
  "ghcr.io/paperless-ngx/paperless-ngx:latest";

/* ---------- tags ---------- */
const chipHost = document.getElementById("chips");
TAGS.forEach((t) => {
  const a = document.createElement("a");
  a.className = "chip";
  a.href = "#";
  a.textContent = t;
  a.addEventListener("click", (e) => { e.preventDefault(); toast(`Tag: ${t}`); });
  chipHost.appendChild(a);
});

/* ---------- copy command ---------- */
const toastEl = document.getElementById("toast");
let toastTimer = 0;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2000);
}

const copyBtn = document.getElementById("copyCmd");
const hint = document.getElementById("cmdHint");

copyBtn.addEventListener("click", async () => {
  hint.classList.add("is-on");
  try {
    await navigator.clipboard.writeText(COMMAND);
    toast("Command copied");
  } catch (_) {
    // file:// has no clipboard permission; fall back to a selection + execCommand
    const ta = document.createElement("textarea");
    ta.value = COMMAND;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (_) {}
    document.body.removeChild(ta);
    toast(ok ? "Command copied" : "Press ⌘C — command selected");
  }
});

/* every # link is a placeholder on this clone */
document.querySelectorAll('a[href="#"]').forEach((a) => {
  if (a.classList.contains("chip")) return;
  a.addEventListener("click", (e) => e.preventDefault());
});
