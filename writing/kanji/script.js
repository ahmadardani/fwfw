let cards = [];
let currentIndex = 0;
let mode = "acak";   // default acak
let lengths = [];    // dari JSON
let selectedLength = 1;

const indonesianEl = document.getElementById("indonesian");
const japaneseEl = document.getElementById("japanese");
const kanjiEl = document.getElementById("kanji");
const counterEl = document.getElementById("counter");

async function loadData() {
  try {
    const response = await fetch("kanji.json");
    cards = await response.json();

    // Ambil semua nilai length unik dari JSON
    lengths = [...new Set(cards.map(c => c.length))].sort((a, b) => a - b);

    // Render pilihan length otomatis
    const lengthOptions = document.getElementById("length-options");
    lengthOptions.innerHTML = "<strong>Length:</strong> ";
    lengths.forEach((len, idx) => {
      const checked = idx === 0 ? "checked" : "";
      lengthOptions.innerHTML += `
        <label>
          <input type="radio" name="length" value="${len}" ${checked}> ${len}
        </label>
      `;
    });

    // Listener untuk mode dan length
    document.querySelectorAll("input[name='mode']").forEach(r => {
      r.addEventListener("change", e => {
        mode = e.target.value;
        resetCards();
      });
    });

    document.querySelectorAll("input[name='length']").forEach(r => {
      r.addEventListener("change", e => {
        selectedLength = parseInt(e.target.value);
        resetCards();
      });
    });

    resetCards();
  } catch (err) {
    console.error("Gagal load JSON:", err);
  }
}

function resetCards() {
  // filter berdasarkan length
  let filtered = cards.filter(c => c.length === selectedLength);

  if (mode === "acak") {
    filtered = shuffle(filtered);
  }

  cardsFiltered = filtered;
  currentIndex = 0;
  showCard();
}

function showCard() {
  if (cardsFiltered.length === 0) {
    indonesianEl.textContent = "Tidak ada data.";
    japaneseEl.textContent = "";
    kanjiEl.style.display = "none";
    counterEl.textContent = "0/0";
    return;
  }

  const card = cardsFiltered[currentIndex];
  indonesianEl.textContent = card.indonesian;
  japaneseEl.textContent = card.japanese;
  kanjiEl.textContent = card.kanji;
  kanjiEl.style.display = "none"; // reset

  counterEl.textContent = `${currentIndex + 1}/${cardsFiltered.length}`;
}

document.getElementById("showKanji").addEventListener("click", () => {
  kanjiEl.style.display = "block";
});

document.getElementById("next").addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % cardsFiltered.length;
  showCard();
});

document.getElementById("toggleMode").addEventListener("click", () => {
  const modeOptions = document.getElementById("mode-options");
  const lengthOptions = document.getElementById("length-options");

  const isVisible = modeOptions.style.display === "block";
  modeOptions.style.display = isVisible ? "none" : "block";
  lengthOptions.style.display = isVisible ? "none" : "block";
});

function shuffle(array) {
  let a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

loadData();
