let words = [];

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    words = data.words;
  });

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
