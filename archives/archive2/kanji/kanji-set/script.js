let kanjiData = [];
let showO = true;
let showK = true;
let showM = true;

async function loadKanji() {
  try {
    const response = await fetch("n5.json");
    const data = await response.json();
    kanjiData = data;
    populateFilterOptions(data);
    renderKanji(data);
  } catch (err) {
    console.error("Gagal memuat JSON:", err);
  }
}

function populateFilterOptions(data) {
  const filterSelect = document.getElementById("filterNo");
  const uniqueNumbers = [...new Set(data.map(item => item.no))].sort((a, b) => a - b);

  uniqueNumbers.forEach(num => {
    const opt = document.createElement("option");
    opt.value = num;
    opt.textContent = `No ${num}`;
    filterSelect.appendChild(opt);
  });

  filterSelect.addEventListener("change", updateView);
}

function updateView() {
  const filterValue = document.getElementById("filterNo").value;
  let filteredData = kanjiData;

  if (filterValue !== "all") {
    filteredData = kanjiData.filter(item => item.no == filterValue);
  }

  renderKanji(filteredData);
}

function renderKanji(data) {
  const grid = document.getElementById("kanji-grid");
  grid.innerHTML = "";

  data.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("kanji-card");

    let infoHTML = "";
    if (showO) infoHTML += `<p style="color: red;">${item.onyomi}</p>`;
    if (showK) infoHTML += `<p style="color: blue;">${item.kunyomi}</p>`;
    if (showM) infoHTML += `<p style="font-weight: bold;">${item.indonesia}</p>`;

    card.innerHTML = `
      <div class="kanji-symbol">${item.kanji}</div>
      <div class="kanji-info">${infoHTML}</div>
    `;

    grid.appendChild(card);
  });
}

// === Keyboard shortcut ===
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "SELECT") return; // jangan trigger saat pilih dropdown

  if (e.key.toLowerCase() === "o") {
    showO = !showO;
    updateView();
  } else if (e.key.toLowerCase() === "k") {
    showK = !showK;
    updateView();
  } else if (e.key.toLowerCase() === "m") {
    showM = !showM;
    updateView();
  }
});

document.addEventListener("DOMContentLoaded", loadKanji);
