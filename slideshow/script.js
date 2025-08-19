let lines = [];
let idx = 0;
let sizeMode = "fit"; // "fit" | "manual"
let manualPx = 72;

const slideInner = document.getElementById("slideInner");
const counter = document.getElementById("counter");
const statusEl = document.getElementById("status");
const sizeRange = document.getElementById("sizeRange");
const pxLabel = document.getElementById("pxLabel");
const manualControls = document.getElementById("manualControls");
const stageEl = document.querySelector(".stage");

// --- Load JSON (ingat: butuh http server, bukan file://) ---
fetch("manga.json")
  .then(r => r.json())
  .then(data => {
    lines = (data && Array.isArray(data.lines)) ? data.lines : [];
    if (!lines.length) throw new Error("JSON tidak punya array 'lines'.");
    idx = 0;
    render();
    statusEl.textContent = "";
  })
  .catch(err => {
    statusEl.textContent = "Gagal memuat manga.json: " + err.message +
      " • Jalankan lewat server lokal (contoh: `python -m http.server`).";
    // fallback contoh supaya halaman tetap tampil
    lines = ["（Fallback）manga.json belum termuat via http server."];
    idx = 0;
    render();
  });

// --- Render satu slide ---
function render() {
  if (!lines.length) return;
  slideInner.textContent = lines[idx];
  counter.textContent = `${idx + 1} / ${lines.length}`;
  if (sizeMode === "fit") fitWidth();
  else applyManualSize();
}

// --- Fit berdasarkan LEBAR saja (horizontal) ---
function fitWidth() {
  // Paksa satu baris agar benar-benar fit horizontal
  slideInner.style.whiteSpace = "nowrap";

  // Binary search ukuran font (px) yang terbesar tapi masih muat lebar stage
  let lo = 4;     // min px
  let hi = 1000;  // max px tebakan aman
  let targetW = stageEl.clientWidth;

  // Jika target width 0 (misal elemen belum terlayout), tunda sedikit
  if (targetW === 0) {
    requestAnimationFrame(fitWidth);
    return;
  }

  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    slideInner.style.fontSize = mid + "px";
    const w = slideInner.scrollWidth; // lebar konten aktual (bisa > clientWidth)
    if (w <= targetW) {
      lo = mid;    // masih muat, coba lebih besar
    } else {
      hi = mid - 1; // kebesaran, turunkan
    }
  }
  slideInner.style.fontSize = lo + "px";
}

// --- Manual size ---
function applyManualSize() {
  slideInner.style.whiteSpace = "pre-wrap"; // kembali bisa wrap
  slideInner.style.fontSize = manualPx + "px";
}

// --- Navigasi ---
document.getElementById("prevBtn").onclick = () => {
  if (idx > 0) { idx--; render(); }
};
document.getElementById("nextBtn").onclick = () => {
  if (idx < lines.length - 1) { idx++; render(); }
};

// --- Tombol lain ---
document.getElementById("fitNowBtn").onclick = () => {
  if (sizeMode === "fit") fitWidth();
};
document.getElementById("fullscreenBtn").onclick = () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
};

// --- Mode radio ---
document.querySelectorAll("input[name=sizeMode]").forEach(radio => {
  radio.addEventListener("change", e => {
    sizeMode = e.target.value;
    manualControls.style.display = (sizeMode === "manual") ? "inline-flex" : "none";
    render();
  });
});

// --- Slider manual ---
sizeRange.oninput = () => {
  manualPx = parseInt(sizeRange.value, 10);
  pxLabel.textContent = manualPx + "px";
  if (sizeMode === "manual") applyManualSize();
};
document.getElementById("minusBtn").onclick = () => {
  manualPx = Math.max(12, manualPx - 2);
  sizeRange.value = manualPx;
  pxLabel.textContent = manualPx + "px";
  applyManualSize();
};
document.getElementById("plusBtn").onclick = () => {
  manualPx = Math.min(300, manualPx + 2);
  sizeRange.value = manualPx;
  pxLabel.textContent = manualPx + "px";
  applyManualSize();
};

// --- Keyboard ---
document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") document.getElementById("nextBtn").click();
  if (e.key === "ArrowLeft") document.getElementById("prevBtn").click();
  if (e.key.toLowerCase() === "f") document.getElementById("fitNowBtn").click();
});

// --- Refit saat resize ---
window.addEventListener("resize", () => {
  if (sizeMode === "fit") fitWidth();
});
