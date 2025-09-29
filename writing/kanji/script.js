const data = [
  { "indonesian": "Meja", "japanese": "つくえ", "kanji": "机", "length": 1 },
  { "indonesian": "Bahasa", "japanese": "ご", "kanji": "語", "length": 1 },
  { "indonesian": "Apa", "japanese": "なん", "kanji": "何", "length": 1 },
  { "indonesian": "Sekolah", "japanese": "がっこう", "kanji": "学校", "length": 2 },
  { "indonesian": "Universitas", "japanese": "だいがく", "kanji": "大学", "length": 2 }
];

let currentIndex = 0;
let filteredData = [];
let currentMode = "acak";
let currentLength = 1;

function loadSettings() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const length = parseInt(document.querySelector('input[name="length"]:checked').value);

  currentMode = mode;
  currentLength = length;

  filteredData = data.filter(item => item.length === currentLength);

  if (currentMode === "acak") {
    shuffleArray(filteredData);
  }
  currentIndex = 0;
  showCard();
}

function showCard() {
  if (filteredData.length === 0) {
    document.getElementById("indonesian").innerText = "Tidak ada data.";
    document.getElementById("japanese").innerText = "";
    document.getElementById("kanji").innerText = "";
    return;
  }

  const card = filteredData[currentIndex];
  document.getElementById("indonesian").innerText = card.indonesian;
  document.getElementById("japanese").innerText = card.japanese;
  document.getElementById("kanji").style.display = "none";
  document.getElementById("kanji").innerText = card.kanji;
}

function showKanji() {
  document.getElementById("kanji").style.display = "block";
}

function nextCard() {
  currentIndex++;
  if (currentIndex >= filteredData.length) {
    if (currentMode === "acak") shuffleArray(filteredData);
    currentIndex = 0;
  }
  showCard();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

document.querySelectorAll('input[name="mode"]').forEach(el => {
  el.addEventListener('change', loadSettings);
});
document.querySelectorAll('input[name="length"]').forEach(el => {
  el.addEventListener('change', loadSettings);
});

loadSettings(); // initial
