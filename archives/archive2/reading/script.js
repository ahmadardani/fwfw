let data = [];

// Ambil data.json
fetch("data.json")
  .then(res => res.json())
  .then(json => data = json);

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchArea = document.getElementById("search-area");
const listArea = document.getElementById("list-area");
const resultArea = document.getElementById("result-area");
const backBtn = document.getElementById("back-btn");
const kanjiTitle = document.getElementById("kanji-title");
const sentencesDiv = document.getElementById("sentences");
const menuSearch = document.getElementById("menu-search");
const menuList = document.getElementById("menu-list");
const kanjiOptions = document.getElementById("kanji-options");

// Switch menu
menuSearch.addEventListener("click", () => {
  searchArea.classList.remove("hidden");
  listArea.classList.add("hidden");
  resultArea.classList.add("hidden");
});

menuList.addEventListener("click", () => {
  listArea.classList.remove("hidden");
  searchArea.classList.add("hidden");
  resultArea.classList.add("hidden");
  kanjiOptions.innerHTML = "";
});

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

// Klik tombol list (misalnya N4-1)
document.querySelectorAll(".list-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const kanjis = btn.getAttribute("data-kanji").split("");
    kanjiOptions.innerHTML = "<h3>Pilih Kanji:</h3>";

    kanjis.forEach(k => {
      const kbtn = document.createElement("button");
      kbtn.textContent = k;
      kbtn.classList.add("kanji-btn");
      kbtn.addEventListener("click", () => {
        const results = data.filter(item => item.kanji === k);
        if (results.length > 0) {
          showResults(k, results);
        } else {
          alert(`Data untuk kanji ${k} tidak ditemukan`);
        }
      });
      kanjiOptions.appendChild(kbtn);
    });
  });
});

// Tampilkan hasil
function showResults(kanji, results) {
  searchArea.classList.add("hidden");
  listArea.classList.add("hidden");
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
    let existing = extraDiv.querySelector(`.${type}`);

    if (existing) {
      // kalau sudah ada → hapus
      existing.remove();
      btn.textContent = type === "translation" 
        ? "Show Translation" 
        : "Show Reading Help";
    } else {
      // kalau belum ada → tampilkan
      const p = document.createElement("p");
      p.classList.add(type);
      if (type === "translation") {
        p.innerHTML = `<b>Translation:</b> ${item.translation}`;
        btn.textContent = "Hide Translation";
      } else if (type === "reading") {
        p.innerHTML = `<b>Reading Help:</b> ${item["reading help"]}`;
        btn.textContent = "Hide Reading Help";
      }
      extraDiv.appendChild(p);
    }
  });
});

  });
}
