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

// MC Game
function startQuiz() {
  const correct = words[Math.floor(Math.random() * words.length)];
  const options = new Set([correct.word]);
  while (options.size < Math.min(12, words.length)) {
    const rand = words[Math.floor(Math.random() * words.length)];
    options.add(rand.word);
  }
  const shuffled = Array.from(options).sort(() => Math.random() - 0.5);

  document.getElementById('quizQuestion').innerText = `📘 What word means: "${correct.meaning}"`;
  const optionsDiv = document.getElementById('quizOptions');
  optionsDiv.innerHTML = '';
  shuffled.forEach(word => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.innerText = word;
    btn.onclick = () => {
      btn.style.backgroundColor = (word === correct.word) ? 'lightgreen' : 'tomato';
    };
    optionsDiv.appendChild(btn);
  });
}
