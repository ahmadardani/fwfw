let vocabularyData = [];
let currentIndex = 0;
let isShowingMeaning = false;

async function loadData() {
    try {
        const response = await fetch('../data/n3_level1.json');
        vocabularyData = await response.json();
        updateDisplay();
    } catch (error) {
        console.error("Error:", error);
    }
}

function updateDisplay() {
    if (vocabularyData.length === 0) return;
    const item = vocabularyData[currentIndex];
    const cardMain = document.getElementById('cardMain');
    const cardSub = document.getElementById('cardSub');
    const counter = document.getElementById('cardCounter');
    const isMobile = window.innerWidth < 600;

    if (!isShowingMeaning) {
        cardMain.textContent = item.kanji;
        cardMain.style.fontSize = isMobile ? "50px" : "80px";
        cardSub.textContent = "";
    } else {
        cardMain.textContent = item.kanji;
        cardMain.style.fontSize = isMobile ? "30px" : "40px";
        cardSub.textContent = item.arti;
    }
    counter.textContent = `${currentIndex + 1} / ${vocabularyData.length}`;
}

function checkAnswer() {
    const input = document.getElementById('answerInput');
    const feedback = document.getElementById('feedback');
    const userAnswer = input.value.trim();
    const correctAnswer = vocabularyData[currentIndex].kana;

    if (userAnswer === correctAnswer) {
        feedback.textContent = "Benar! ✨";
        feedback.className = "feedback correct";
        input.className = "correct-input";
    } else {
        feedback.textContent = "Salah, coba lagi!";
        feedback.className = "feedback wrong";
        input.className = "wrong-input";
    }
}

function toggleDisplay() {
    isShowingMeaning = !isShowingMeaning;
    updateDisplay();
}

function nextCard() {
    currentIndex = (currentIndex + 1) % vocabularyData.length;
    resetQuizState();
}

function prevCard() {
    currentIndex = (currentIndex - 1 + vocabularyData.length) % vocabularyData.length;
    resetQuizState();
}

function resetQuizState() {
    isShowingMeaning = false;
    const input = document.getElementById('answerInput');
    const feedback = document.getElementById('feedback');
    input.value = "";
    input.className = "";
    feedback.textContent = "";
    feedback.className = "feedback";
    updateDisplay();
}

document.getElementById('checkBtn').addEventListener('click', checkAnswer);
document.getElementById('answerInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
});

window.addEventListener('resize', updateDisplay);
loadData();