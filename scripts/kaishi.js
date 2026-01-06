const DATA_URL = '/reading/data/kaishi.json';

const listEl = document.getElementById('sentenceList');
const searchInput = document.getElementById('searchInput');
const noSelect = document.getElementById('noSelect');
const backBtn = document.getElementById('backBtn');
const fontBtn = document.getElementById('fontBtn');
const modeBtn = document.getElementById('modeBtn');

// New UI Elements
const optionsBtn = document.getElementById('optionsBtn');
const optionsSubmenu = document.getElementById('optionsSubmenu');
const chooseMistakeBtn = document.getElementById('chooseMistakeBtn');
const uploadMistakeBtn = document.getElementById('uploadMistakeBtn');
const saveMistakeBtn = document.getElementById('saveMistakeBtn');

let sentences = [];
let mistakeData = JSON.parse(localStorage.getItem('kaishi_mistakes')) || [];
let useJapaneseFont = false;
let useHiraganaMode = false;
let currentIndex = -1;

// Selection State
let isSelectionMode = false;
let selectedIndices = new Set(); // Menyimpan teks unik kalimat yang dipilih

const MAX_RENDER = 150;

/* =========================
   FETCH DATA
========================= */
fetch(DATA_URL)
  .then(res => res.json())
  .then(data => {
    sentences = data;
    populateNo();
    renderFiltered();
  })
  .catch(() => {
    listEl.innerHTML = '<p class="empty">Failed to load data.</p>';
  });

/* =========================
   POPULATE DROPDOWN
========================= */
function populateNo() {
  // Reset dan tambahkan "All Lessons"
  noSelect.innerHTML = '<option value="all">All Lessons</option>';

  const uniqueNo = [...new Set(sentences.map(s => s.no))].sort((a, b) => a - b);
  uniqueNo.forEach(no => {
    const opt = document.createElement('option');
    opt.value = no;
    opt.textContent = `Lesson ${no}`;
    noSelect.appendChild(opt);
  });

  // Tambahkan Sesi Mistake jika ada data yang tersimpan
  if (mistakeData.length > 0) {
    const opt = document.createElement('option');
    opt.value = 'mistakes';
    opt.textContent = 'Mistake Session';
    noSelect.appendChild(opt);
  }
}

/* =========================
   RENDER LIST
========================= */
function renderList(data) {
  listEl.innerHTML = '';

  if (!data.length) {
    listEl.innerHTML = '<p class="empty">No results found.</p>';
    return;
  }

  data.slice(0, MAX_RENDER).forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'sentence-card';
    
    // Status visual jika kartu dipilih
    if (isSelectionMode && selectedIndices.has(item.sentence)) {
      card.classList.add('selected');
    }

    const header = document.createElement('div');
    header.className = 'sentence-header';

    const num = document.createElement('span');
    num.className = 'sentence-num';
    num.textContent = `${index + 1}.`;

    const example = document.createElement('div');
    example.className = 'sentence-example';
    example.textContent = useHiraganaMode ? item.hiragana : item.sentence;
    if (useJapaneseFont) example.classList.add('jp-font');

    const btn = document.createElement('button');
    btn.className = 'toggle-btn';
    btn.textContent = 'Show';

    const body = document.createElement('div');
    body.className = 'sentence-body';
    const hiddenText = useHiraganaMode ? item.sentence : item.hiragana;
    body.innerHTML = `<div>${hiddenText}</div><div>${item.translation}</div>`;

    // LOGIK KLIK KARTU
    card.onclick = () => {
      if (isSelectionMode) {
        if (selectedIndices.has(item.sentence)) {
          selectedIndices.delete(item.sentence);
          card.classList.remove('selected');
        } else {
          selectedIndices.add(item.sentence);
          card.classList.add('selected');
        }
      }
    };

    btn.onclick = (e) => {
      e.stopPropagation(); // Mencegah card.onclick terpicu
      body.classList.toggle('show');
      btn.textContent = body.classList.contains('show') ? 'Hide' : 'Show';
    };

    header.append(num, example, btn);
    card.append(header, body);
    listEl.appendChild(card);
  });
}

/* =========================
   FILTER LOGIC
========================= */
function renderFiltered() {
  const q = searchInput.value.trim().toLowerCase();
  const no = noSelect.value;

  let filtered = sentences;

  // Jika Sesi Mistake dipilih
  if (no === 'mistakes') {
    filtered = mistakeData;
  } else if (no !== 'all') {
    filtered = filtered.filter(s => String(s.no) === no);
  }

  if (q) {
    filtered = filtered.filter(s =>
      s.sentence.includes(q) ||
      s.hiragana.includes(q) ||
      s.translation.toLowerCase().includes(q)
    );
  }

  renderList(filtered);
}

/* =========================
   NEW FEATURE EVENTS
========================= */

// Toggle Dropdown Options
optionsBtn.onclick = (e) => {
  e.stopPropagation();
  optionsSubmenu.classList.toggle('hidden');
};

// Tutup submenu jika klik di mana saja
document.addEventListener('click', () => optionsSubmenu.classList.add('hidden'));

// Mode Pilih (Choose Mistake)
chooseMistakeBtn.onclick = () => {
  isSelectionMode = !isSelectionMode;
  if (isSelectionMode) {
    chooseMistakeBtn.textContent = "Cancel Selection";
    listEl.classList.add('selection-mode');
    saveMistakeBtn.classList.remove('hidden');
    selectedIndices.clear();
  } else {
    chooseMistakeBtn.textContent = "Choose Mistake";
    listEl.classList.remove('selection-mode');
    saveMistakeBtn.classList.add('hidden');
  }
  renderFiltered();
};

// Simpan Mistake
saveMistakeBtn.onclick = () => {
  const toSave = sentences.filter(s => selectedIndices.has(s.sentence));
  
  if (toSave.length === 0) {
    alert("Please select some sentences first!");
    return;
  }

  // Simpan ke memori browser
  mistakeData = toSave;
  localStorage.setItem('kaishi_mistakes', JSON.stringify(mistakeData));
  
  // Selesaikan mode pilih
  isSelectionMode = false;
  listEl.classList.remove('selection-mode');
  saveMistakeBtn.classList.add('hidden');
  chooseMistakeBtn.textContent = "Choose Mistake";
  
  alert("Mistakes saved to your session!");
  populateNo(); // Refresh dropdown
  renderFiltered();
};

// Upload/Lihat Mistake
uploadMistakeBtn.onclick = () => {
  if (mistakeData.length === 0) {
    alert("No mistakes saved yet.");
    return;
  }
  noSelect.value = 'mistakes';
  renderFiltered();
};

/* =========================
   ORIGINAL EVENTS
========================= */
searchInput.addEventListener('input', renderFiltered);
noSelect.addEventListener('change', renderFiltered);
backBtn.onclick = () => history.back();

fontBtn.onclick = () => {
  useJapaneseFont = !useJapaneseFont;
  renderFiltered();
};

modeBtn.onclick = () => {
  useHiraganaMode = !useHiraganaMode;
  modeBtn.textContent = useHiraganaMode ? 'Sentence Mode (S)' : 'Hiragana Mode (S)';
  renderFiltered();
};

/* KEYBOARD NAVIGATION */
document.addEventListener('keydown', e => {
  const cards = document.querySelectorAll('.sentence-card');

  if (e.key === '/') { e.preventDefault(); searchInput.focus(); }
  if (e.key.toLowerCase() === 'u') fontBtn.click();
  if (e.key.toLowerCase() === 's') modeBtn.click();

  if (/^[0-9]$/.test(e.key)) {
    const key = e.key === '0' ? 'all' : e.key;
    if (key === 'all' || [...noSelect.options].some(o => o.value === key)) {
      noSelect.value = key;
      renderFiltered();
    }
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    currentIndex = Math.min(currentIndex + 1, cards.length - 1);
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    currentIndex = Math.max(currentIndex - 1, 0);
  }

  if (e.key === 'Enter' && currentIndex >= 0) {
    if (isSelectionMode) {
      cards[currentIndex].click();
    } else {
      const btn = cards[currentIndex].querySelector('.toggle-btn');
      btn.click();
    }
  }

  cards.forEach(c => c.classList.remove('active'));
  if (cards[currentIndex]) {
    cards[currentIndex].classList.add('active');
    cards[currentIndex].scrollIntoView({ block: 'nearest' });
  }
});