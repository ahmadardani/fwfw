let vocabularyData = [];
let currentIndex = 0;
let currentStep = 0;

async function loadVocabulary() {
    try {
        const response = await fetch('../data/n3_level1.json');
        vocabularyData = await response.json();
        updateCard();
    } catch (error) {
        console.error("Gagal memuat data:", error);
    }
}

function updateCard() {
    if (vocabularyData.length === 0) return;
    
    const item = vocabularyData[currentIndex];
    const mainDisplay = document.getElementById('cardContent');
    const subDisplay = document.getElementById('subContent');
    const counter = document.getElementById('cardCounter');

    const isMobile = window.innerWidth < 600;

    if (currentStep === 0) {
        mainDisplay.textContent = item.kanji;
        mainDisplay.style.fontSize = isMobile ? "50px" : "80px";
        subDisplay.textContent = "";
    } else if (currentStep === 1) {
        mainDisplay.textContent = item.kanji;
        mainDisplay.style.fontSize = isMobile ? "30px" : "40px";
        subDisplay.textContent = item.kana;
    } else {
        mainDisplay.textContent = item.kanji;
        mainDisplay.style.fontSize = isMobile ? "30px" : "40px";
        subDisplay.innerHTML = `${item.kana}<br><span style="color: #444; font-size: 0.9em;">${item.arti}</span>`;
    }

    counter.textContent = `${currentIndex + 1} / ${vocabularyData.length}`;
}

function nextStep() {
    currentStep = (currentStep + 1) % 3;
    updateCard();
}

function nextCard(event) {
    if(event) event.stopPropagation();
    currentIndex = (currentIndex + 1) % vocabularyData.length;
    currentStep = 0;
    updateCard();
}

function prevCard(event) {
    if(event) event.stopPropagation();
    currentIndex = (currentIndex - 1 + vocabularyData.length) % vocabularyData.length;
    currentStep = 0;
    updateCard();
}

window.addEventListener('resize', updateCard);
loadVocabulary();