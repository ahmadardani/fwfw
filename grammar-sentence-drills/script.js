let drills = [];
let filteredDrills = [];
let currentIndex = 0;
let mode = "random";
let mistakes = [];

// Load JSON
fetch("grammar-sentence-drills.json")
    .then(res => res.json())
    .then(data => {
        drills = data;
        renderGrammarOptions();
        initEventListeners();
        showNoGrammarMessage();
    });

function renderGrammarOptions() {
    const container = document.getElementById("grammar-options");
    const grammars = [...new Set(drills.map(d => d.grammar))];
    container.innerHTML = "<p>Pilih Grammar:</p>";
    grammars.forEach(g => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="checkbox" name="grammar" value="${g}"> ${g}`;
        container.appendChild(label);
        container.appendChild(document.createTextNode(" "));
    });
}

function initEventListeners() {
    document.querySelectorAll('input[name="grammar"]').forEach(cb => {
        cb.addEventListener("change", startQuiz);
    });

    document.querySelectorAll('input[name="mode"]').forEach(radio => {
        radio.addEventListener("change", () => {
            mode = document.querySelector('input[name="mode"]:checked').value;
            startQuiz();
        });
    });

    document.getElementById("submit-btn").addEventListener("click", checkAnswer);
    document.getElementById("answer-input").addEventListener("keypress", e => {
        if (e.key === "Enter") checkAnswer();
    });

    document.getElementById("mistake-btn").addEventListener("click", () => {
        const listDiv = document.getElementById("mistake-list");
        listDiv.style.display = (listDiv.style.display === "none") ? "block" : "none";
        renderMistakes();
    });

    document.getElementById("retry-mistakes-btn").addEventListener("click", retryFromMistakes);

    document.getElementById("toggle-settings-btn").addEventListener("click", () => {
        const settingsDiv = document.getElementById("settings");
        if (settingsDiv.style.display === "none") {
            settingsDiv.style.display = "block";
            document.getElementById("toggle-settings-btn").textContent = "Sembunyikan Mode Soal";
        } else {
            settingsDiv.style.display = "none";
            document.getElementById("toggle-settings-btn").textContent = "Tampilkan Mode Soal";
        }
    });
}

function startQuiz() {
    const selectedGrammars = Array.from(document.querySelectorAll('input[name="grammar"]:checked')).map(cb => cb.value);

    // Quiz area selalu terlihat
    document.getElementById("quiz-area").style.display = "block";

    if (selectedGrammars.length === 0) {
        filteredDrills = [];
        document.getElementById("question-counter").textContent = "";
        document.getElementById("question").textContent = "Tidak ada Grammar yang dipilih";
        document.getElementById("answer-input").value = "";
        document.getElementById("result").textContent = "";
        return;
    }

    filteredDrills = drills.filter(d => selectedGrammars.includes(d.grammar));

    if (mode === "random") {
        shuffleArray(filteredDrills);
    }

    currentIndex = 0;
    mistakes = [];
    document.getElementById("mistake-list").style.display = "none";

    showQuestion();
}


function showNoGrammarMessage() {
    document.getElementById("question").textContent = "Tidak ada Grammar yang dipilih";
    document.getElementById("question-counter").textContent = "0/0";
    document.getElementById("answer-input").value = ""; // Tetap ada, cuma dikosongkan
    document.getElementById("answer-input").style.display = "block"; // Pastikan terlihat
    document.getElementById("submit-btn").style.display = "block"; // Pastikan terlihat
    document.getElementById("result").textContent = "";
}


function showQuestion() {
    if (currentIndex >= filteredDrills.length) {
        document.getElementById("question").textContent = "Latihan selesai!";
        document.getElementById("question-counter").textContent = `${filteredDrills.length}/${filteredDrills.length}`;
        document.getElementById("answer-input").style.display = "none";
        document.getElementById("submit-btn").style.display = "none";
        return;
    }

    const q = filteredDrills[currentIndex];
    document.getElementById("question").innerHTML = q.sentence;
    document.getElementById("answer-input").value = "";
    document.getElementById("result").textContent = "";
    document.getElementById("answer-input").style.display = "block";
    document.getElementById("submit-btn").style.display = "block";
    document.getElementById("question-counter").textContent = `${currentIndex + 1}/${filteredDrills.length}`;
}

function checkAnswer() {
    if (filteredDrills.length === 0) return;

    const userAnswer = document.getElementById("answer-input").value.trim();
    const q = filteredDrills[currentIndex];

    if (userAnswer === q.answer) {
        document.getElementById("result").innerHTML = `✅ Benar!<br>(${q.translation})`;
        currentIndex++;
        showQuestion();
    } else {
        document.getElementById("result").innerHTML = `❌ Salah! Coba lagi.<br>(${q.translation})`;
        if (!mistakes.includes(q)) mistakes.push(q);
    }
}

function renderMistakes() {
    const list = document.getElementById("mistakes");
    list.innerHTML = "";
    if (mistakes.length === 0) {
        list.innerHTML = "<li>Belum ada kesalahan</li>";
    }
    else {
        mistakes.forEach(m => {
            const li = document.createElement("li");
            li.innerHTML = `${m.sentence} → ${m.answer} (${m.translation})`;
            list.appendChild(li);
        });
    }
}

function retryFromMistakes() {
    if (mistakes.length === 0) return;
    filteredDrills = [...mistakes];
    if (mode === "random") shuffleArray(filteredDrills);
    currentIndex = 0;
    mistakes = [];
    document.getElementById("mistake-list").style.display = "none";
    showQuestion();
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
