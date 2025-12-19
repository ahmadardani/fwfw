let sentences = [];
let currentQuizQueue = [];
let currentSentence = null;
let currentChunks = [];

// Variabel untuk Jawaban
let userAnswer = []; 
let clickedButtonsStack = []; 

// State Navigasi & Progress
let appState = 'MENU'; 
let navIndex = 0; 
let totalQuestions = 0;
let questionCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  fetch('../practice/data/sentence.json')
    .then(response => response.json())
    .then(data => {
      sentences = data;
      renderGrammarMenu();
      setupKeyboardControl();
    })
    .catch(err => console.error("Gagal memuat JSON:", err));
});

function renderGrammarMenu() {
  const grammarSet = new Set(sentences.map(s => s.Grammar));
  const container = document.getElementById('grammar-buttons');
  container.innerHTML = '';

  grammarSet.forEach((grammar, index) => {
    const btn = document.createElement('button');
    btn.className = 'grammar-btn';
    btn.innerText = grammar;
    btn.onclick = () => startQuiz(grammar);
    btn.dataset.index = index; 
    container.appendChild(btn);
  });

  appState = 'MENU';
  navIndex = 0;
  updateFocus(); 
}

function startQuiz(grammar) {
  // Filter tanpa acak (urut sesuai JSON)
  currentQuizQueue = sentences.filter(s => s.Grammar === grammar);
  
  totalQuestions = currentQuizQueue.length;
  questionCount = 0; 
  
  document.getElementById('grammar-select').classList.add('hidden');
  document.getElementById('quiz').classList.remove('hidden');

  appState = 'QUIZ';
  nextQuestion();
}

function nextQuestion() {
  if (currentQuizQueue.length === 0) {
    alert("Kuis Selesai! Kembali ke menu.");
    location.reload();
    return;
  }

  questionCount++; 
  updateProgressDisplay();

  // Ambil soal paling atas (Shift = ambil pertama lalu hapus dari antrian)
  currentSentence = currentQuizQueue.shift();

  userAnswer = [];
  clickedButtonsStack = []; 
  
  document.getElementById('romaji').innerText = currentSentence.Romaji;
  document.getElementById('answer').innerText = "___";
  document.getElementById('result').innerText = "";
  document.getElementById('result').className = "result";

  // Acak posisi tombol kata
  currentChunks = [...currentSentence.Chunks].sort(() => Math.random() - 0.5);
  renderChunkButtons();
}

function updateProgressDisplay() {
  const progressDiv = document.getElementById('progress');
  progressDiv.innerText = `Soal ${questionCount} / ${totalQuestions}`;
}

function renderChunkButtons() {
  const btnContainer = document.getElementById('buttons');
  btnContainer.innerHTML = '';

  currentChunks.forEach((chunk, index) => {
    const btn = document.createElement('button');
    btn.innerText = chunk;
    btn.dataset.chunk = chunk;
    btn.onclick = () => handleChunkClick(chunk, btn);
    btnContainer.appendChild(btn);
  });

  navIndex = 0;
  updateFocus();
}

function handleChunkClick(chunk, btnElement) {
  userAnswer.push(chunk);
  clickedButtonsStack.push(btnElement);

  // --- PERUBAHAN DI SINI ---
  // Cukup tambahkan class, jangan set style.visibility di JS
  // Class .clicked di CSS sekarang isinya "display: none"
  btnElement.classList.add('clicked'); 

  updateAnswerBox();
  checkAnswer();
  
  // Update fokus keyboard ke tombol yang "mendekat" (mengisi posisi)
  findNextFocusable();
}

function undoLastAnswer() {
  if (clickedButtonsStack.length === 0) return;

  const lastBtn = clickedButtonsStack.pop();
  
  // --- PERUBAHAN DI SINI ---
  // Hapus class clicked, tombol akan muncul kembali dan geser tombol lain
  lastBtn.classList.remove('clicked');

  userAnswer.pop();
  updateAnswerBox();
  
  // Kembalikan fokus ke tombol yang baru muncul
  navIndex = Array.from(document.querySelectorAll('#buttons button')).indexOf(lastBtn);
  updateFocus();
}

function updateAnswerBox() {
  const box = document.getElementById('answer');
  box.innerText = userAnswer.length > 0 ? userAnswer.join(' ') : "___";
}

function checkAnswer() {
  const correct = currentSentence.Chunks.join('');
  const current = userAnswer.join('');

  if (current === correct) {
    document.getElementById('result').innerText = "BENAR! \n" + currentSentence.Japanese + "\n" + currentSentence.English;
    document.getElementById('result').classList.add('correct');
    
    setTimeout(() => {
        nextQuestion();
    }, 2000);
  } else if (userAnswer.length === currentSentence.Chunks.length) {
    document.getElementById('result').innerText = "SALAH. Coba lagi (Gunakan Backspace).";
    document.getElementById('result').classList.add('wrong');
  }
}

// --- CONTROLS ---
function setupKeyboardControl() {
  document.addEventListener('keydown', (e) => {
    
    if (e.key === 'Backspace') {
      if (appState === 'QUIZ') {
        undoLastAnswer();
        return; 
      }
    }

    if (appState === 'MENU') {
      const buttons = document.querySelectorAll('.grammar-btn');
      if (buttons.length === 0) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        navIndex = (navIndex + 1) % buttons.length;
        updateFocus();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        navIndex = (navIndex - 1 + buttons.length) % buttons.length;
        updateFocus();
      } else if (e.key === 'Enter') {
        buttons[navIndex].click();
      }
    } 
    else if (appState === 'QUIZ') {
      // Ambil hanya tombol yang TIDAK ada class 'clicked' (yang visible)
      const buttons = Array.from(document.querySelectorAll('#buttons button:not(.clicked)'));
      if (buttons.length === 0) return;

      let currentFocusBtn = document.querySelector('.focused');
      
      // Validasi fokus
      if (!currentFocusBtn || currentFocusBtn.classList.contains('clicked')) {
          navIndex = 0;
      } else {
          navIndex = buttons.indexOf(currentFocusBtn);
      }
      if (navIndex === -1) navIndex = 0;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        let nextIndex = (navIndex + 1) % buttons.length;
        changeFocusTo(buttons[nextIndex]);
      } 
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        let prevIndex = (navIndex - 1 + buttons.length) % buttons.length;
        changeFocusTo(buttons[prevIndex]);
      } 
      else if (e.key === 'Enter') {
        if (buttons[navIndex]) buttons[navIndex].click();
      }
    }
  });
}

function updateFocus() {
  document.querySelectorAll('.focused').forEach(el => el.classList.remove('focused'));

  if (appState === 'MENU') {
    const buttons = document.querySelectorAll('.grammar-btn');
    if (buttons[navIndex]) buttons[navIndex].classList.add('focused');
  } 
  else if (appState === 'QUIZ') {
    const buttons = document.querySelectorAll('#buttons button:not(.clicked)');
    if (buttons.length > 0) {
        if (navIndex >= buttons.length) navIndex = 0;
        buttons[navIndex].classList.add('focused');
    }
  }
}

function changeFocusTo(element) {
    document.querySelectorAll('.focused').forEach(el => el.classList.remove('focused'));
    element.classList.add('focused');
}

function findNextFocusable() {
    setTimeout(() => {
        const available = document.querySelectorAll('#buttons button:not(.clicked)');
        if (available.length > 0) {
            changeFocusTo(available[0]);
        }
    }, 50);
}