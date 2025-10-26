async function loadKanji() {
  try {
    const response = await fetch("n5.json");
    const data = await response.json();

    const grid = document.getElementById("kanji-grid");
    grid.innerHTML = "";

    data.forEach(item => {
      const card = document.createElement("div");
      card.classList.add("kanji-card");

      card.innerHTML = `
        <div class="kanji-symbol">${item.kanji}</div>
        <div class="kanji-info">
          <p><strong>Onyomi:</strong> ${item.onyomi}</p>
          <p><strong>Kunyomi:</strong> ${item.kunyomi}</p>
          <p><strong>Arti:</strong> ${item.indonesia}</p>
        </div>
      `;

      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Gagal memuat JSON:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadKanji);
