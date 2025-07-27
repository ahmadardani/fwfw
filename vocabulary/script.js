let allWords = [];
let filteredWords = [];
let currentWord = {};
const mistakeCounts = {};
let questionMode = 'random';  // default
let currentIndex = 0;


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

    if (questionMode === 'ordered') {
        filteredWords.sort((a, b) => a.level.localeCompare(b.level));
    }

    currentIndex = 0;
    nextQuestion();
}


function nextQuestion() {
    document.getElementById("result").textContent = "";
    document.getElementById("answer").value = "";

    const questionNumber = document.getElementById("question-number");

    if (filteredWords.length === 0) {
        document.getElementById("indonesian-word").textContent = "— (tidak ada soal)";
        questionNumber.textContent = "";
        return;
    }

    if (questionMode === 'random') {
        currentWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
        questionNumber.textContent = ""; // kosongkan jika mode acak
    } else if (questionMode === 'ordered') {
        if (currentIndex >= filteredWords.length) {
            currentIndex = 0; // Mulai ulang jika sudah sampai akhir
        }
        currentWord = filteredWords[currentIndex];
        questionNumber.textContent = `Soal ${currentIndex + 1} / ${filteredWords.length}`;
        currentIndex++;
    }

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
        trackMistake(currentWord.indonesian);
    }

    updateMistakeSummary();
}

function trackMistake(word) {
    if (mistakeCounts[word]) {
        mistakeCounts[word]++;
    } else {
        mistakeCounts[word] = 1;
    }
}

function updateMistakeSummary() {
    const summary = Object.entries(mistakeCounts)
        .map(([word, count]) => `${word} : ${count}`)
        .join('\n');

    document.getElementById("mistake-summary").textContent = summary;
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

function setQuestionMode(mode) {
    questionMode = mode;
    currentIndex = 0;

    if (questionMode === 'ordered') {
        filteredWords.sort((a, b) => a.level.localeCompare(b.level));
    }

    nextQuestion();
}


window.onload = loadWords;
