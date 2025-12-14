const DATA_URL = 'data/gradedfull.json';
const listEl = document.getElementById('sentenceList');
const searchInput = document.getElementById('searchInput');

let sentences = [];
let searchTimer = null;

const MAX_RENDER = 200; // ⬅️ BATAS AMAN (anti lag)

// Fetch data
fetch(DATA_URL)
  .then(res => res.json())
  .then(data => {
    sentences = data;
    renderList(sentences.slice(0, MAX_RENDER));
  })
  .catch(() => {
    listEl.innerHTML = '<p class="error">Failed to load data.</p>';
  });

// Render function
function renderList(data) {
  listEl.innerHTML = '';

  if (data.length === 0) {
    listEl.innerHTML = '<p class="empty">No results found.</p>';
    return;
  }

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'sentence-card';

    const header = document.createElement('div');
    header.className = 'sentence-header';

    const text = document.createElement('div');
    text.className = 'sentence-text';
    text.textContent = item.example;

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

    header.appendChild(text);
    header.appendChild(btn);

    card.appendChild(header);
    card.appendChild(body);

    listEl.appendChild(card);
  });
}

// SEARCH dengan DEBOUNCE
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {
    const q = searchInput.value.trim().toLowerCase();

    if (q === '') {
      renderList(sentences.slice(0, MAX_RENDER));
      return;
    }

    const filtered = sentences.filter(item =>
      item.example.toLowerCase().includes(q) ||
      item.kanji.toLowerCase().includes(q) ||
      item.read_meaning.toLowerCase().includes(q)
    );

    renderList(filtered.slice(0, MAX_RENDER));
  }, 300); // ⬅️ debounce 300ms
});
