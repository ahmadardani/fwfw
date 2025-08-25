// script.js (ganti seluruh file dengan ini)
let words = [];
let filteredWords = [];
let currentIndex = 0;         // pointer untuk soal berikutnya (dipakai pada mode 'ordered')
let displayedIndex = -1;      // index kata yang sedang ditampilkan di filteredWords
let questionMode = "random";
let mistakes = [];            // array kata (object) yang salah
let mistakesSet = new Set();  // untuk mencegah duplikat (key unik per kata)
let mistakeDetails = {};     // menyimpan detail jawaban user untuk ringkasan

// tombol elemen (akan di-set setelah DOM ready)
const checkBtn = () => document.getElementById('check-btn');
const nextBtn = () => document.getElementById('next-btn');

fetch('adjective-list.json')
    .then(res => res.json())
    .then(data => {
        words = data;
        createTypeFilters();
        filterWords();
    })
    .catch(err => {
        console.error('Gagal load adjective-list.json:', err);
        alert('Gagal memuat data kata. Cek console untuk detail.');
    });

function createTypeFilters() {
    const container = document.getElementById('level-filters');
    container.innerHTML = '';
    const types = [...new Set(words.map(w => w.type))];

    types.forEach(type => {
        let labelText = '';
        if (type === 'i') labelText = 'Adjektiva i';
        else if (type === 'na') labelText = 'Adjektiva na';
        else if (type === 'i but na') labelText = 'Adjektiva i but na';
        else labelText = type;

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = type;
        input.checked = true;

        input.addEventListener('change', (e) => {
            // jangan izinkan semua di-uncheck
            const checkedNow = [...container.querySelectorAll('input[type="checkbox"]:checked')];
            if (checkedNow.length === 0) {
                e.target.checked = true;
                alert('Pilih minimal satu jenis adjektiva.');
                return;
            }
            filterWords();
        });

        const label = document.createElement('label');
        label.style.display = 'block';
        label.appendChild(input);
        label.append(' ' + labelText);
        container.appendChild(label);
    });

    // mode radio (acak / urut)
    document.querySelectorAll('input[name="mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            questionMode = e.target.value;
            // reset pointer saat ganti mode supaya predictable
            currentIndex = 0;
            displayedIndex = -1;
            filterWords();
        });
    });
}

function filterWords() {
    const checkedTypes = [...document.querySelectorAll('#level-filters input[type="checkbox"]:checked')].map(cb => cb.value);
    filteredWords = words.filter(w => checkedTypes.includes(w.type));
    currentIndex = 0;
    displayedIndex = -1;

    const checkButton = checkBtn();
    const nextButton = nextBtn();
    const counterEl = document.getElementById('question-counter');

    if (!filteredWords || filteredWords.length === 0) {
        // bersihkan UI
        document.getElementById('kanji-word').textContent = '';
        document.getElementById('indonesian-word').textContent = '';
        document.getElementById('answer').value = '';
        document.getElementById('result').textContent = '';
        counterEl.style.display = 'none';
        if (checkButton) checkButton.disabled = true;
        if (nextButton) nextButton.disabled = true;
        return;
    } else {
        if (checkButton) checkButton.disabled = false;
        if (nextButton) nextButton.disabled = false;
    }

    // mulai soal pertama otomatis
    nextQuestion();
}

function nextQuestion() {
    const selectedFormEl = document.querySelector('#form-options input[name="form"]:checked');
    if (!selectedFormEl) {
        alert("Pilih satu bentuk yang diuji.");
        return;
    }

    if (!filteredWords || filteredWords.length === 0) return;

    const counterEl = document.getElementById('question-counter');
    counterEl.style.display = (questionMode === 'ordered') ? 'block' : 'none';

    if (questionMode === 'random') {
        displayedIndex = Math.floor(Math.random() * filteredWords.length);
    } else {
        if (currentIndex >= filteredWords.length) {
            alert("Soal urut selesai!");
            currentIndex = 0;
        }
        displayedIndex = currentIndex;
        currentIndex++; // siapkan pointer untuk soal berikutnya
    }

    const word = filteredWords[displayedIndex];
    // sembunyikan kanji sampai user cek jawaban
    document.getElementById('kanji-word').textContent = '';
    document.getElementById('indonesian-word').textContent = word.meaning || '';
    document.getElementById('answer').value = '';
    document.getElementById('result').textContent = '';

    if (questionMode === 'ordered') {
        counterEl.textContent = `Soal ${displayedIndex + 1} / ${filteredWords.length}`;
    }
}

function checkAnswer() {
    if (!filteredWords || filteredWords.length === 0) {
        alert('Tidak ada soal. Pilih minimal satu jenis adjektiva.');
        return;
    }

    if (displayedIndex === -1) {
        alert('Soal belum dimulai. Tekan "Soal Berikutnya" untuk mulai.');
        return;
    }

    const selectedFormEl = document.querySelector('#form-options input[name="form"]:checked');
    if (!selectedFormEl) {
        alert('Pilih bentuk yang diuji.');
        return;
    }
    const selectedForm = selectedFormEl.value;

    const word = filteredWords[displayedIndex];
    if (!word) {
        alert('Terjadi kesalahan: kata tidak ditemukan.');
        return;
    }

    // mapping form ke field JSON (pastikan key di JSON sesuai)
    const forms = {
        vocab: word.hiragana,
        "neg-present": word["present negative (plain)"],
        past: word["past (plain)"],
        "neg-past": word["past negative (plain)"],
        copula: word["copula da (only na)"]
    };

    const userAnswer = document.getElementById('answer').value.trim();

    // support jawaban alternatif yg dipisah dengan " / "
    const rawCorrect = forms[selectedForm] || '';
    const correctList = rawCorrect ? rawCorrect.split(/\s*\/\s*/) : [];
    const correct = correctList.length > 0 && correctList.includes(userAnswer);

    // tampilkan kanji hanya setelah cek jawaban (jika opsi aktif dan ada kanji)
    if (document.getElementById('toggle-kanji').checked && word && word.kanji) {
        document.getElementById('kanji-word').textContent = word.kanji;
    } else {
        document.getElementById('kanji-word').textContent = '';
    }

    if (correct) {
        document.getElementById('result').textContent = "Benar!";
        document.getElementById('result').style.color = "green";
    } else {
        const showCorrect = rawCorrect || '(tidak tersedia)';
        document.getElementById('result').textContent = "Salah! Jawaban: " + showCorrect;
        document.getElementById('result').style.color = "red";

        // simpan ke array mistakes tanpa duplikat
        const uid = `${word.kanji || ''}||${word.hiragana || ''}||${word.meaning || ''}`;
        if (!mistakesSet.has(uid)) {
            mistakesSet.add(uid);
            mistakes.push(word);
            mistakeDetails[uid] = {
                form: selectedForm,
                userAnswer,
                correctAnswer: rawCorrect
            };
            updateMistakeSummary();
        }
    }
}

function updateMistakeSummary() {
    const el = document.getElementById('mistake-summary');
    if (!el) return;

    if (!mistakes || mistakes.length === 0) {
        el.textContent = '(tidak ada kesalahan)';
        return;
    }

    // Hitung frekuensi berdasarkan hiragana
    const counts = {};
    mistakes.forEach(w => {
        const key = w.hiragana || '(kosong)';
        counts[key] = (counts[key] || 0) + 1;
    });

    // Format output
    let out = '';
    Object.entries(counts).forEach(([word, count]) => {
        out += `${word} : ${count}\n`;
    });

    el.textContent = out.trim();
}

function toggleOptions() {
    const section = document.getElementById('options-section');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

function startMistakeReview() {
    if (!mistakes || mistakes.length === 0) {
        alert("Tidak ada kesalahan untuk diulang.");
        return;
    }
    // gunakan salinan agar tidak mengubah original mistakes
    filteredWords = mistakes.slice();
    currentIndex = 0;
    displayedIndex = -1;

    // enable tombol kalau sempat disabled
    if (checkBtn()) checkBtn().disabled = false;
    if (nextBtn()) nextBtn().disabled = false;

    nextQuestion();
}

function toggleMistakeSection() {
    const section = document.getElementById('mistake-section');
    if (section.style.display === 'none') {
        section.style.display = 'block';
        document.getElementById('show-mistakes-btn').textContent = 'Sembunyikan Kesalahan';
    } else {
        section.style.display = 'none';
        document.getElementById('show-mistakes-btn').textContent = 'Tampilkan Kesalahan';
    }
}
