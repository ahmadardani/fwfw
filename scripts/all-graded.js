const DATA_URL = '/reading/data/gradedfull.json';
const listEl = document.getElementById('sentenceList');
const searchInput = document.getElementById('searchInput');
const backBtn = document.getElementById('backBtn');
const fontBtn = document.getElementById('fontBtn');

let sentences = [];
let searchTimer = null;
let currentIndex = -1;
let useJapaneseFont = false;

const MAX_RENDER = 200;

/* =========================
   FETCH DATA
========================= */
fetch(DATA_URL)
  .then(res => res.json())
  .then(data => {
    sentences = data;
    renderList(sentences.slice(0, MAX_RENDER));
  })
  .catch(() => {
    listEl.innerHTML = '<p class="error">Failed to load data.</p>';
  });

/* =========================
   RENDER
========================= */
function renderList(data) {
  listEl.innerHTML = '';
  currentIndex = -1;

  if (!data.length) {
    listEl.innerHTML = '<p class="empty">No results found.</p>';
    return;
  }

  data.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'sentence-card';
    card.dataset.index = index;

    const header = document.createElement('div');
    header.className = 'sentence-header';

    const example = document.createElement('div');
    example.className = 'sentence-example';
    example.textContent = item.example;

    if (useJapaneseFont) {
      example.classList.add('jp-font');
    }

    const btn = document.createElement('button');
    btn.className = 'toggle-btn';
    btn.textContent = 'Show';

    const body = document.createElement('div');
    body.className = 'sentence-body';
    body.textContent = item.read_meaning;

    btn.addEventListener('click', () => {
      body.classList.toggle('show');
      btn.textContent = body.classList.contains('show') ? 'Hide' : 'Show';
    });

    header.appendChild(example);
    header.appendChild(btn);
    card.appendChild(header);
    card.appendChild(body);
    listEl.appendChild(card);
  });
}

/* =========================
   SEARCH (DEBOUNCE)
========================= */
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {
    const q = searchInput.value.trim().toLowerCase();

    if (!q) {
      renderList(sentences.slice(0, MAX_RENDER));
      return;
    }

    const filtered = sentences.filter(item =>
      item.example.toLowerCase().includes(q) ||
      item.read_meaning.toLowerCase().includes(q)
    );

    renderList(filtered.slice(0, MAX_RENDER));
  }, 300);
});

/* =========================
   BACK BUTTON
========================= */
backBtn.addEventListener('click', () => history.back());

/* =========================
   FONT TOGGLE
========================= */
function toggleFont() {
  useJapaneseFont = !useJapaneseFont;
  document.querySelectorAll('.sentence-example').forEach(el => {
    el.classList.toggle('jp-font', useJapaneseFont);
  });
}

fontBtn.addEventListener('click', toggleFont);

/* =========================
   KEYBOARD SHORTCUTS
========================= */
document.addEventListener('keydown', e => {
  const cards = document.querySelectorAll('.sentence-card');

  if (e.key === '/') {
    e.preventDefault();
    searchInput.focus();
  }

  if (e.key.toLowerCase() === 'u') {
    toggleFont();
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
    const btn = cards[currentIndex].querySelector('.toggle-btn');
    btn.click();
  }

  cards.forEach(c => c.classList.remove('active'));
  if (cards[currentIndex]) {
    cards[currentIndex].classList.add('active');
    cards[currentIndex].scrollIntoView({ block: 'nearest' });
  }
});
