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

// Load JSON
fetch("manga.json")
  .then(r => r.json())
  .then(data => {
    lines = data.lines;
    idx = 0;
    render();
  })
  .catch(err => {
    statusEl.textContent = "Error loading manga.json: " + err;
  });

function render() {
  if (!lines.length) return;
  slideInner.textContent = lines[idx];
  counter.textContent = `${idx+1} / ${lines.length}`;
  if (sizeMode === "fit") fitText();
  else applyManualSize();
}

function fitText() {
  slideInner.style.fontSize = "10px";
  const stage = slideInner.parentElement;
  let size = 10;
  while (stage.clientWidth > slideInner.scrollWidth &&
         stage.clientHeight > slideInner.scrollHeight) {
    size++;
    slideInner.style.fontSize = size + "px";
  }
  slideInner.style.fontSize = (size-1) + "px";
}

function applyManualSize() {
  slideInner.style.fontSize = manualPx + "px";
}

document.getElementById("prevBtn").onclick = () => {
  if (idx > 0) { idx--; render(); }
};
document.getElementById("nextBtn").onclick = () => {
  if (idx < lines.length-1) { idx++; render(); }
};
document.getElementById("fitNowBtn").onclick = () => {
  if (sizeMode === "fit") fitText();
};
document.getElementById("fullscreenBtn").onclick = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

// Radio buttons
document.querySelectorAll("input[name=sizeMode]").forEach(radio => {
  radio.addEventListener("change", e => {
    sizeMode = e.target.value;
    manualControls.style.display = (sizeMode === "manual") ? "inline-block" : "none";
    render();
  });
});

// Range control
sizeRange.oninput = () => {
  manualPx = parseInt(sizeRange.value, 10);
  pxLabel.textContent = manualPx + "px";
  if (sizeMode === "manual") applyManualSize();
};
document.getElementById("minusBtn").onclick = () => {
  manualPx = Math.max(12, manualPx-2);
  sizeRange.value = manualPx;
  pxLabel.textContent = manualPx + "px";
  applyManualSize();
};
document.getElementById("plusBtn").onclick = () => {
  manualPx = Math.min(300, manualPx+2);
  sizeRange.value = manualPx;
  pxLabel.textContent = manualPx + "px";
  applyManualSize();
};

// Keyboard shortcuts
document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") document.getElementById("nextBtn").click();
  if (e.key === "ArrowLeft") document.getElementById("prevBtn").click();
  if (e.key.toLowerCase() === "f") document.getElementById("fitNowBtn").click();
});

window.addEventListener("resize", () => {
  if (sizeMode === "fit") fitText();
});
