import { loadAllWordData } from './data-loader.js';

let words = [];

function startQuiz() {
  const correct = words[Math.floor(Math.random() * words.length)];
  const options = new Set([correct.word]);
  while (options.size < Math.min(10, words.length)) {
    const rand = words[Math.floor(Math.random() * words.length)];
    options.add(rand.word);
  }
  const shuffled = Array.from(options).sort(() => Math.random() - 0.5);

  document.getElementById('quizQuestion').innerText = `📘 What word means: "${correct.meaning}"`;
  const optionsDiv = document.getElementById('quizOptions');
  optionsDiv.innerHTML = '';
  shuffled.forEach(word => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-primary col-md-2 m-1 vocab-option';
    btn.innerText = word;
    btn.onclick = () => {
      if (word === correct.word) {
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-success');
      } else {
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-danger');
      }
    };
    optionsDiv.appendChild(btn);
  });
}

loadAllWordData().then(data => {
  words = data;
  startQuiz();
});

document.getElementById('nextChallengeBtn').addEventListener('click', startQuiz);
