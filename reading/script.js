let kanjiData = [];

fetch("data.json")
  .then(res => res.json())
  .then(data => {
    kanjiData = data;
  });

function searchKanji() {
  const keyword = document.getElementById("searchInput").value.trim();
  const resultsDiv = document.getElementById("results");
  const detailDiv = document.getElementById("kanjiDetail");
  resultsDiv.innerHTML = "";
  detailDiv.innerHTML = "";

  if (!keyword) {
    resultsDiv.innerHTML = "<p>Please enter a kanji.</p>";
    return;
  }

  const filtered = kanjiData.filter(item => item.kanji.includes(keyword));
  if (filtered.length === 0) {
    resultsDiv.innerHTML = "<p>No results found.</p>";
    return;
  }

  filtered.forEach((item, index) => {
    const box = document.createElement("div");
    box.className = "kanji-box";
    box.innerHTML = `
      <div class="kanji-char">${item.kanji}</div>
      <button onclick="showDetail(${kanjiData.indexOf(item)})">View</button>
    `;
    resultsDiv.appendChild(box);
  });
}

function showDetail(index) {
  const item = kanjiData[index];
  const detailDiv = document.getElementById("kanjiDetail");
  detailDiv.innerHTML = `
    <div class="kanji-big">${item.kanji}</div>
  `;

  // buat sentence box
  const sentenceBox = document.createElement("div");
  sentenceBox.className = "sentence-box";
  sentenceBox.innerHTML = `
    <div class="sentence-text">${item.sentence}</div>
    <button class="toggle-btn" onclick="toggleContent(this, 'translation')">Show Translation</button>
    <button class="toggle-btn" onclick="toggleContent(this, 'reading')">Show Reading</button>
    <div id="translation" class="hidden"><b>Translation:</b> ${item.translation}</div>
    <div id="reading" class="hidden"><b>Reading:</b> ${item['reading help']}</div>
  `;
  detailDiv.appendChild(sentenceBox);
}

function toggleContent(btn, type) {
  const target = btn.parentElement.querySelector(`#${type}`);
  if (target.classList.contains("hidden")) {
    target.classList.remove("hidden");
    btn.textContent = `Hide ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  } else {
    target.classList.add("hidden");
    btn.textContent = `Show ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  }
}
