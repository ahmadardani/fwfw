let allData = [];
let viewList = [];
let current = 0;
let mistakes = [];
let filterMode = 'all';
let selectedNo = '1';
let isFuriganaVisible = false;

const els = {
  sentenceArea: document.getElementById('sentence-area'),
  translationArea: document.getElementById('translation-area'),
  btnFurigana: document.getElementById('btn-furigana'),
  btnTranslation: document.getElementById('btn-translation'),
  btnWrong: document.getElementById('btn-wrong'),
  btnRight: document.getElementById('btn-right'),
  btnToggleMode: document.getElementById('btn-toggle-mode'),
  modeOptions: document.getElementById('mode-options'),
  downloadMistakes: document.getElementById('download-mistakes'),
  uploadMistakes: document.getElementById('upload-mistakes'),
  btnUploadMistakes: document.getElementById('btn-upload-mistakes'),
  selectNo: document.getElementById('select-no'),
  selectFilter: document.getElementById('select-filter'),
  counter: document.getElementById('counter'),
  kanjiDisplay: document.getElementById('kanji-display'),
  chkFurigana: document.getElementById('chk-furigana'),
  chkTranslation: document.getElementById('chk-translation'),
};

// Validasi elemen DOM
Object.values(els).forEach((el, index) => {
  if (!el) console.error(`Element at index ${index} is not found in DOM`);
});

function loadMistakes() {
  try {
    const stored = localStorage.getItem('mistakes');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error loading mistakes:', e);
    return [];
  }
}

async function loadData() {
  try {
    const resp = await fetch('kaishi.json');
    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    allData = await resp.json();
    if (!Array.isArray(allData) || allData.length === 0) {
      throw new Error('Data from kaishi.json is empty or invalid');
    }
  } catch (e) {
    console.error('Error loading data from kaishi.json:', e);
    allData = [];
    if (els.sentenceArea) els.sentenceArea.textContent = 'Gagal memuat data dari kaishi.json';
    if (els.counter) els.counter.textContent = '0 / 0';
    if (els.translationArea) {
          els.translationArea.textContent = data.translation;
          els.translationArea.style.display = els.chkTranslation.checked ? 'block' : 'none';
        }
    return;
  }
  populateNoOptions();
  applyFilterAndReset();
}

function populateNoOptions() {
  const nos = [...new Set(allData.map(x => String(x.no)))].sort((a, b) => Number(a) - Number(b));
  if (els.selectNo) {
    els.selectNo.innerHTML = '';
    nos.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n;
      els.selectNo.appendChild(opt);
    });
    els.selectNo.value = selectedNo;
  }
}

function applyFilterAndReset() {
  selectedNo = els.selectNo?.value || selectedNo;
  filterMode = els.selectFilter?.value || filterMode;

  viewList = allData
    .map((v, i) => ({ v, i }))
    .filter(({ v }) => String(v.no) === String(selectedNo))
    .filter(({ v }) => filterMode === 'all' || mistakes.some(m => m.sentence === v.sentence))
    .map(({ i }) => i);

  if (viewList.length === 0) {
    if (els.sentenceArea) els.sentenceArea.textContent = 'Tidak ada data.';
    if (els.counter) els.counter.textContent = '0 / 0';
    if (els.translationArea) els.translationArea.style.display = 'none';
    if (els.kanjiDisplay) els.kanjiDisplay.textContent = '';
    return;
  }

  current = 0;
  renderCurrent();
}

function renderCurrent() {
  if (!viewList.length || !allData[viewList[current]]) return;

  const data = allData[viewList[current]];
  if (els.sentenceArea) els.sentenceArea.textContent = data.sentence;

  if (els.translationArea) {
    els.translationArea.textContent = data.translation;
    els.translationArea.style.display = els.chkTranslation.checked ? 'block' : 'none';
  }

  if (els.kanjiDisplay) {
    els.kanjiDisplay.textContent = data.furigana || '';
    els.kanjiDisplay.style.display = els.chkFurigana.checked ? 'block' : 'none';
  }

  if (els.counter) els.counter.textContent = `${current + 1} / ${viewList.length}`;
}


function toggleFurigana() {
  isFuriganaVisible = !isFuriganaVisible;
  if (els.kanjiDisplay) {
    els.kanjiDisplay.style.display = isFuriganaVisible ? 'block' : 'none';
    els.btnFurigana.textContent = isFuriganaVisible ? 'Sembunyikan Furigana' : 'Tampilkan Furigana';
  }
}

function toggleTranslation() {
  if (els.translationArea) {
    els.translationArea.style.display =
      els.translationArea.style.display === 'none' ? 'block' : 'none';
    els.btnTranslation.textContent =
      els.translationArea.style.display === 'none' ? 'Tampilkan Arti' : 'Sembunyikan Arti';
  }
}

function markWrong() {
  if (!viewList.length || !allData[viewList[current]]) return;
  const data = allData[viewList[current]];
  if (!mistakes.some(m => m.sentence === data.sentence)) {
    mistakes.push(data);
    localStorage.setItem('mistakes', JSON.stringify(mistakes));
  }
  nextCard();
}

function markRight() {
  nextCard();
}

function nextCard() {
  current = (current + 1) % viewList.length;
  renderCurrent();
}

function toggleModeOptions() {
  if (els.modeOptions) {
    els.modeOptions.style.display =
      els.modeOptions.style.display === 'none' ? 'block' : 'none';
    els.btnToggleMode.textContent =
      els.modeOptions.style.display === 'none' ? 'Tampilkan Mode' : 'Sembunyikan Mode';
  }
}

function downloadMistakesFile() {
  const blob = new Blob([JSON.stringify(mistakes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mistakes.json';
  a.click();
  URL.revokeObjectURL(url);
}

function uploadMistakesFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const uploadedMistakes = JSON.parse(e.target.result);
      if (Array.isArray(uploadedMistakes)) {
        mistakes = uploadedMistakes;
        localStorage.setItem('mistakes', JSON.stringify(mistakes));
        applyFilterAndReset();
      } else {
        console.error('Uploaded file is not a valid array');
      }
    } catch (e) {
      console.error('Error parsing uploaded file:', e);
    }
  };
  reader.readAsText(file);
}

function setupEventListeners() {
  if (els.selectNo) els.selectNo.addEventListener('change', applyFilterAndReset);
  if (els.selectFilter) els.selectFilter.addEventListener('change', applyFilterAndReset);
  if (els.btnWrong) els.btnWrong.addEventListener('click', markWrong);
  if (els.btnRight) els.btnRight.addEventListener('click', markRight);
  if (els.btnToggleMode) els.btnToggleMode.addEventListener('click', toggleModeOptions);
  if (els.downloadMistakes) els.downloadMistakes.addEventListener('click', downloadMistakesFile);
  if (els.btnUploadMistakes)
    els.btnUploadMistakes.addEventListener('click', () => els.uploadMistakes.click());
  if (els.uploadMistakes) els.uploadMistakes.addEventListener('change', uploadMistakesFile);
}

function setupDisplayMode() {
  const radios = document.querySelectorAll('input[name="display-mode"]');
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        if (radio.value === 'vertical') {
          document.querySelector('.container').classList.add('vertical');
        } else {
          document.querySelector('.container').classList.remove('vertical');
        }
      }
    });
  });
}

function applyCheckboxView() {
  if (els.kanjiDisplay) {
    els.kanjiDisplay.style.display = els.chkFurigana.checked ? 'block' : 'none';
  }
  if (els.translationArea) {
    els.translationArea.style.display = els.chkTranslation.checked ? 'block' : 'none';
  }
}

function setupCheckboxView() {
  if (els.chkFurigana) els.chkFurigana.addEventListener('change', applyCheckboxView);
  if (els.chkTranslation) els.chkTranslation.addEventListener('change', applyCheckboxView);
}


// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
  mistakes = loadMistakes();
  if (els.modeOptions) els.modeOptions.style.display = 'none'; // Sembunyikan mode options awalnya
  setupEventListeners();
  setupDisplayMode();
  setupCheckboxView();
  loadData();
});