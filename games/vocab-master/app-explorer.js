let words = [];

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    words = data.words;
    renderCheatSheet();
  });

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
    card.className = 'word-card';
    card.innerHTML = `<strong>${w.word}</strong> (${w.type})<br>${w.meaning}<br><i>${w.chinese.meaning}</i>`;
    container.appendChild(card);
  });
}

document.getElementById('typeFilter').addEventListener('change', renderCheatSheet);
document.getElementById('letterFilter').addEventListener('change', renderCheatSheet);
document.getElementById('searchInput').addEventListener('input', renderCheatSheet);
