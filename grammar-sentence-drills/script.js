let drills = [];
let filteredDrills = [];
let currentIndex = 0;
let mode = "random";
let mistakes = [];
let waitingNext = false;

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

    document.getElementById("check-btn").addEventListener("click", checkAnswer);
    document.getElementById("next-btn").addEventListener("click", nextQuestion);

    document.getElementById("answer-input").addEventListener("keypress", e => {
        if (e.key === "Enter") {
            if (waitingNext) {
                nextQuestion();
                waitingNext = false;
            } else {
                checkAnswer();
            }
        }
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

function nextQuestion() {
    currentIndex++;
    showQuestion();
    waitingNext = false; // reset
}

function startQuiz() {
    const selectedGrammars = Array.from(document.querySelectorAll('input[name="grammar"]:checked')).map(cb => cb.value);

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
    document.getElementById("answer-input").value = "";
    document.getElementById("answer-input").style.display = "block";
    document.getElementById("result").textContent = "";
}

function showQuestion() {
    if (currentIndex >= filteredDrills.length) {
        document.getElementById("question").textContent = "Latihan selesai!";
        document.getElementById("question-counter").textContent =
            `${filteredDrills.length}/${filteredDrills.length}`;
        document.getElementById("answer-input").style.display = "none";
        document.getElementById("check-btn").style.display = "none";
        document.getElementById("next-btn").style.display = "none";
        return;
    }

    const q = filteredDrills[currentIndex];
    document.getElementById("question").innerHTML = q.sentence;
    document.getElementById("answer-input").value = "";
    document.getElementById("result").textContent = "";

    document.getElementById("answer-input").style.display = "block";
    document.getElementById("check-btn").style.display = "inline-block";
    document.getElementById("next-btn").style.display = "inline-block";

    document.getElementById("question-counter").textContent =
        `${currentIndex + 1}/${filteredDrills.length}`;

    waitingNext = false; // reset setiap soal baru
}

function checkAnswer() {
    if (filteredDrills.length === 0) return;

    const q = filteredDrills[currentIndex];
    const rawUser = document.getElementById("answer-input").value;

    const correct = isCorrectAnswer(rawUser, q.answer);

    if (correct) {
        document.getElementById("result").innerHTML =
            `<span style="color:#32CD32;">Benar!</span><br><br>(${q.translation})<br><small>Tekan Enter lagi untuk soal berikutnya.</small>`;
        waitingNext = true; // tunggu Enter kedua untuk lanjut
    } else {
        document.getElementById("result").innerHTML =
            `<span style="color:red;">Salah!</span><br><br>(${q.romaji ?? ""})`;
        if (!mistakes.includes(q)) mistakes.push(q);
        waitingNext = false; // tetap di soal ini
    }
}


function renderMistakes() {
    const list = document.getElementById("mistakes");
    list.innerHTML = "";
    if (mistakes.length === 0) {
        list.innerHTML = "<li>Belum ada kesalahan</li>";
    } else {
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

function normalizeForCompare(s) {
    if (s == null) return "";
    return String(s)
        .normalize("NFKC")          // normalisasi Unicode
        .replace(/\u2F00/g, "一")   // ⼀ (U+2F00 radical) → 一 (U+4E00 normal)
        .trim()
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // hapus zero-width
        .replace(/[\s\u3000\u00A0]/g, "")      // hapus spasi (termasuk ideographic)
        .replace(/[。、，,．.！!？\?「」『』（）\(\)｛｝［］【】〈〉《》・；;：:"“”'`´]/g, "")
        .toLowerCase();
}

function isCorrectAnswer(userRaw, correctRaw) {
    const user = normalizeForCompare(userRaw);

    // Bisa string tunggal atau array, atau dipisah dengan |
    const candidates = Array.isArray(correctRaw)
        ? correctRaw
        : String(correctRaw).split("|").map(s => s.trim());

    return candidates.some(ans => normalizeForCompare(ans) === user);
}