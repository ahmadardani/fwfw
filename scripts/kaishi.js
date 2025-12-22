const DATA_URL = '/reading/data/kaishi.json';

const listEl = document.getElementById('sentenceList');
const searchInput = document.getElementById('searchInput');
const noSelect = document.getElementById('noSelect');
const backBtn = document.getElementById('backBtn');
const fontBtn = document.getElementById('fontBtn');

let sentences = [];
let useJapaneseFont = false;
let currentIndex = -1;

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
   POPULATE NO
========================= */
function populateNo() {
  const uniqueNo = [...new Set(sentences.map(s => s.no))].sort((a, b) => a - b);

  uniqueNo.forEach(no => {
    const opt = document.createElement('option');
    opt.value = no;
    opt.textContent = `Lesson ${no}`;
    noSelect.appendChild(opt);
  });
}

/* =========================
   RENDER
========================= */
function renderList(data) {
  listEl.innerHTML = '';

  if (!data.length) {
    listEl.innerHTML = '<p class="empty">No results found.</p>';
    return;
  }

  data.slice(0, MAX_RENDER).forEach(item => {
    const card = document.createElement('div');
    card.className = 'sentence-card';

    const header = document.createElement('div');
    header.className = 'sentence-header';

    const example = document.createElement('div');
    example.className = 'sentence-example';
    example.textContent = item.sentence;

    if (useJapaneseFont) example.classList.add('jp-font');

    const btn = document.createElement('button');
    btn.className = 'toggle-btn';
    btn.textContent = 'Show';

    const body = document.createElement('div');
    body.className = 'sentence-body';
    body.innerHTML = `
      <div>${item.hiragana}</div>
      <div>${item.translation}</div>
    `;

    btn.onclick = () => {
      body.classList.toggle('show');
      btn.textContent = body.classList.contains('show') ? 'Hide' : 'Show';
    };

    header.append(example, btn);
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

  if (no !== 'all') {
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
   EVENTS
========================= */
searchInput.addEventListener('input', renderFiltered);
noSelect.addEventListener('change', renderFiltered);
backBtn.onclick = () => history.back();

fontBtn.onclick = () => {
  useJapaneseFont = !useJapaneseFont;
  document.querySelectorAll('.sentence-example')
    .forEach(el => el.classList.toggle('jp-font', useJapaneseFont));
};

document.addEventListener('keydown', e => {
  const cards = document.querySelectorAll('.sentence-card');

  /* Focus search */
  if (e.key === '/') {
    e.preventDefault();
    searchInput.focus();
  }

  /* Toggle font */
  if (e.key.toLowerCase() === 'u') {
    useJapaneseFont = !useJapaneseFont;
    document.querySelectorAll('.sentence-example')
      .forEach(el => el.classList.toggle('jp-font', useJapaneseFont));
  }

  /* Lesson shortcut 1–9 */
  if (/^[0-9]$/.test(e.key)) {
    const key = e.key === '0' ? 'all' : e.key;

    if (key === 'all' || [...noSelect.options].some(o => o.value === key)) {
      noSelect.value = key;
      renderFiltered();
    }
  }

  /* Navigation */
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    currentIndex = Math.min(currentIndex + 1, cards.length - 1);
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    currentIndex = Math.max(currentIndex - 1, 0);
  }

  /* Toggle sentence */
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

