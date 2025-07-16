import { loadAllWordData } from './data-loader.js';

let words = [];

function renderCheatSheet() {
  const type = document.getElementById('typeFilter').value;
  const letter = document.getElementById('letterFilter').value;
  const keyword = document.getElementById('searchInput').value.toLowerCase();
  const container = document.getElementById('cheatSheet');
  container.innerHTML = '';

  const filtered = words.filter(w =>
    (!type || w.type === type) &&
    (!letter || w.letter === letter) &&
    (w.word.toLowerCase().includes(keyword) || w.meaning.toLowerCase().includes(keyword))
  );

  filtered.forEach(w => {
    const card = document.createElement('div');
    card.className = 'col-md-4';
    card.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">${w.word} <span class="badge bg-secondary text-capitalize">${w.type}</span></h5>
          <p class="card-text">${w.meaning}</p>
          <p class="card-text text-muted"><em>${w.chinese.meaning}</em></p>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

loadAllWordData().then(data => {
  words = data;
  renderCheatSheet();
});

document.getElementById('typeFilter').addEventListener('change', renderCheatSheet);
document.getElementById('letterFilter').addEventListener('change', renderCheatSheet);
document.getElementById('searchInput').addEventListener('input', renderCheatSheet);
