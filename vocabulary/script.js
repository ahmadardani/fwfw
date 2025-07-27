let allWords = [];
let filteredWords = [];
let currentWord = {};

async function loadWords() {
    try {
        const response = await fetch('wordlist.json');
        allWords = await response.json();

        generateLevelFilters();
        filterWords();
        nextQuestion();
    } catch (error) {
        console.error('Gagal memuat wordlist.json:', error);
    }
}

function generateLevelFilters() {
    const levels = [...new Set(allWords.map(word => word.level))];
    const levelFilters = document.getElementById('level-filters');

    levels.forEach(level => {
        const label = document.createElement('label');
        label.style.marginRight = '10px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = level;
        checkbox.checked = true;
        checkbox.addEventListener('change', filterWords);

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' ' + level));

        levelFilters.appendChild(label);
    });
}

function filterWords() {
    const checkedLevels = Array.from(document.querySelectorAll('#level-filters input:checked'))
        .map(cb => cb.value);

    filteredWords = allWords.filter(word => checkedLevels.includes(word.level));

    nextQuestion();
}

function nextQuestion() {
    document.getElementById("result").textContent = "";
    document.getElementById("answer").value = "";

    if (filteredWords.length === 0) {
        document.getElementById("indonesian-word").textContent = "— (tidak ada soal)";
        return;
    }

    currentWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
    document.getElementById("indonesian-word").textContent = currentWord.indonesian;
}

function checkAnswer() {
    const userAnswer = document.getElementById("answer").value.trim();
    const result = document.getElementById("result");

    if (userAnswer === currentWord.japanese) {
        result.textContent = "✅ Benar!";
        result.style.color = "green";
    } else {
        result.textContent = `❌ Salah. Jawaban benar: ${currentWord.japanese}`;
        result.style.color = "red";
    }
}

function toggleLevelFilters() {
    const filterDiv = document.getElementById("level-filters");
    const toggleButton = document.getElementById("toggle-filters");

    if (filterDiv.style.display === "none") {
        filterDiv.style.display = "block";
        toggleButton.textContent = "Sembunyikan Pilihan Level";
    } else {
        filterDiv.style.display = "none";
        toggleButton.textContent = "Tampilkan Pilihan Level";
    }
}

window.onload = loadWords;
