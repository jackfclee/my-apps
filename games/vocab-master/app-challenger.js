import { loadAllWordData } from './data-loader-with-cache.js';

let words = [];

function startQuiz() {
  const correct = words[Math.floor(Math.random() * words.length)];
  const options = new Set([correct.word]);
  while (options.size < Math.min(10, words.length)) {
    const rand = words[Math.floor(Math.random() * words.length)];
    options.add(rand.word);
  }
  const shuffled = Array.from(options).sort(() => Math.random() - 0.5);

  document.getElementById('quizQuestion').innerHTML = `📘 What word means: "${correct.meaning}"`;
  document.getElementById('quizQuestion').dataset.cn = correct.chinese?.meaning || '';
  document.getElementById('quizQuestion').dataset.showingCn = 'false';
  document.getElementById('quizQuestion').dataset.en = `📘 What word means: "${correct.meaning}"`;

  const optionsDiv = document.getElementById('quizOptions');
  optionsDiv.innerHTML = '';
  shuffled.forEach(word => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-primary col-md-2 m-1 vocab-option';
    btn.innerText = word;
    btn.setAttribute('data-cn', (words.find(w => w.word === word)?.chinese?.meaning) || '');
    btn.setAttribute('data-en', word);
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

async function initChallengerPage() {
  const overlay = document.getElementById('loadingOverlay');
  const loadingProgress = document.getElementById('loadingProgress');

  if (overlay) {
    overlay.style.display = 'flex';
  }

  try {
    words = await loadAllWordData(progress => {
      if (loadingProgress) {
        const percent = Math.round(progress * 100);
        loadingProgress.textContent = `Loading ${percent}%`;
      }
    });
    startQuiz();
  } catch (err) {
    console.error('Error loading data:', err);
    alert('Failed to load vocabulary data.');
  } finally {
    setTimeout(() => {
      if (overlay) {
        overlay.style.display = 'none';
      }
    }, 500);
  }
}

initChallengerPage();

document.getElementById('nextChallengeBtn').addEventListener('click', startQuiz);

document.getElementById('showChineseBtn').addEventListener('click', () => {
  const btn = document.getElementById('showChineseBtn');
  const question = document.getElementById('quizQuestion');
  const options = document.querySelectorAll('#quizOptions .vocab-option');
  const showing = question.dataset.showingCn === 'true';
  question.dataset.showingCn = (!showing).toString();
  btn.classList.toggle('btn-outline-secondary', showing);
  btn.classList.toggle('btn-outline-primary', !showing);

  if (!showing) {
    if (question.dataset.cn) {
      const base = question.innerText;
      question.innerHTML = `${base}<br/><small class="text-muted cn-translation">${question.dataset.cn}</small>`;
    }
    options.forEach(option => {
      if (option.dataset.cn) {
        const base = option.innerText;
        option.innerHTML = `${base}<br/><small class="text-muted cn-translation">${option.dataset.cn}</small>`;
      }
    });
  } else {
    // Remove translations by restoring original text
    if (question.dataset.cn) {
      question.innerHTML = question.dataset.en;
    }
    options.forEach(option => {
      option.innerText = option.dataset.en;
    });
  }
});
