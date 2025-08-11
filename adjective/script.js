let allWords = [];
let filteredWords = [];
let currentWord = {};
const mistakeCounts = {};
let questionMode = 'random';
let currentIndex = 0;
let isReviewMode = false;
let mistakeWords = [];
let isAnswerCorrect = false;

const adjectiveForms = [
    { key: 'present negative (plain)', label: 'Bentuk negatif sekarang (plain)' },
    { key: 'past (plain)', label: 'Bentuk lampau (plain)' },
    { key: 'past negative (plain)', label: 'Bentuk negatif lampau (plain)' }
];
let currentFormKey = adjectiveForms[0].key;

async function loadWords() {
    try {
        const response = await fetch('adjective_list.json');
        allWords = await response.json();
        generateTypeFilters();
        generateFormOptions();
        filterWords();
    } catch (error) {
        console.error('Gagal memuat adjective_list.json:', error);
    }
}

function generateTypeFilters() {
    const types = [...new Set(allWords.map(word => word.type))];
    const levelFilters = document.getElementById('level-filters');

    types.forEach(type => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = type;
        checkbox.checked = true;
        checkbox.addEventListener('change', filterWords);

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' ' + type + ' - adjektiva'));
        levelFilters.appendChild(label);
        levelFilters.appendChild(document.createElement('br'));
    });
}

function generateFormOptions() {
    const formDiv = document.getElementById('form-options');

    adjectiveForms.forEach(form => {
        const label = document.createElement('label');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'formMode';
        radio.value = form.key;
        radio.checked = (form.key === currentFormKey);
        radio.addEventListener('change', () => {
            currentFormKey = form.key;
            nextQuestion();
        });

        label.appendChild(radio);
        label.appendChild(document.createTextNode(' ' + form.label));
        formDiv.appendChild(label);
        formDiv.appendChild(document.createElement('br'));
    });
}

function filterWords() {
    const checkedTypes = Array.from(document.querySelectorAll('#level-filters input:checked'))
        .map(cb => cb.value);

    filteredWords = allWords.filter(word => checkedTypes.includes(word.type));

    if (questionMode === 'ordered') {
        filteredWords.sort((a, b) => a.hiragana.localeCompare(b.hiragana));
    }

    currentIndex = 0;
    nextQuestion();
}

function nextQuestion() {
    document.getElementById("result").textContent = "";
    document.getElementById("answer").value = "";
    let questionPool = isReviewMode ? mistakeWords : filteredWords;

    if (questionPool.length === 0) {
        document.getElementById("indonesian-word").textContent = "— (Tidak ada adjektiva yang dipilih!)";
        document.getElementById("kanji-word").textContent = "";
        return;
    }

    if (questionMode === 'random' && !isReviewMode) {
        currentWord = questionPool[Math.floor(Math.random() * questionPool.length)];
    } else {
        if (currentIndex >= questionPool.length) {
            currentIndex = 0;
            if (isReviewMode) {
                alert("Sesi ulangi kesalahan selesai.");
                isReviewMode = false;
                mistakeWords = [];
            }
        }
        currentWord = questionPool[currentIndex];
        currentIndex++;
    }

    document.getElementById("indonesian-word").textContent = currentWord.meaning;
    const showKanji = document.getElementById("toggle-kanji").checked;
    document.getElementById("kanji-word").textContent = showKanji && currentWord.kanji ? currentWord.kanji : "";
}

function checkAnswer() {
    const userAnswer = document.getElementById("answer").value.trim();
    const result = document.getElementById("result");
    const correctAnswer = currentWord[currentFormKey];

    if (userAnswer === correctAnswer) {
        result.textContent = "✅ Benar!";
        result.style.color = "green";
        isAnswerCorrect = true;
    } else {
        result.textContent = `❌ Salah. Jawaban benar: ${correctAnswer}`;
        result.style.color = "red";
        trackMistake(currentWord.meaning);
        isAnswerCorrect = false;
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

function startMistakeReview() {
    const mistakeKeys = Object.keys(mistakeCounts);
    if (mistakeKeys.length === 0) {
        alert("Tidak ada kesalahan yang tercatat.");
        return;
    }

    mistakeWords = mistakeKeys
        .map(word => allWords.find(w => w.meaning === word))
        .filter(Boolean);

    isReviewMode = true;
    currentIndex = 0;
    nextQuestion();
}

function toggleOptions() {
    const section = document.getElementById('options-section');
    if (section.style.display === 'none') {
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}


document.addEventListener("DOMContentLoaded", () => {
    loadWords();

    const answerInput = document.getElementById("answer");
    answerInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            if (!isAnswerCorrect) {
                checkAnswer();
            } else {
                nextQuestion();
                isAnswerCorrect = false;
            }
        }
    });
});

