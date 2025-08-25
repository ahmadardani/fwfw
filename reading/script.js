let data = [];

// Ambil data.json
fetch("data.json")
  .then(res => res.json())
  .then(json => data = json);

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchArea = document.getElementById("search-area");
const resultArea = document.getElementById("result-area");
const backBtn = document.getElementById("back-btn");
const kanjiTitle = document.getElementById("kanji-title");
const sentencesDiv = document.getElementById("sentences");

// Search button
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (!query) return;

  const results = data.filter(item => item.kanji === query);

  if (results.length > 0) {
    showResults(query, results);
  } else {
    alert("Kanji tidak ditemukan!");
  }
});

// Back button
backBtn.addEventListener("click", () => {
  resultArea.classList.add("hidden");
  searchArea.classList.remove("hidden");
  sentencesDiv.innerHTML = "";
  searchInput.value = "";
});

// Tampilkan hasil
function showResults(kanji, results) {
  searchArea.classList.add("hidden");
  resultArea.classList.remove("hidden");
  kanjiTitle.textContent = `Hasil untuk: ${kanji}`;
  sentencesDiv.innerHTML = "";

  results.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("sentence-card");

    card.innerHTML = `
      <p><b>Kalimat:</b> ${item.sentence}</p>
      <button class="toggle-btn" data-type="translation">Show Translation</button>
      <button class="toggle-btn" data-type="reading">Show Reading Help</button>
      <div id="extra-${index}"></div>
    `;

    sentencesDiv.appendChild(card);

    // Event toggle
    const buttons = card.querySelectorAll(".toggle-btn");
    const extraDiv = card.querySelector(`#extra-${index}`);

    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const type = btn.getAttribute("data-type");
        if (type === "translation") {
          extraDiv.innerHTML = `<p><b>Translation:</b> ${item.translation}</p>`;
        } else if (type === "reading") {
          extraDiv.innerHTML = `<p><b>Reading Help:</b> ${item["reading help"]}</p>`;
        }
      });
    });
  });
}
