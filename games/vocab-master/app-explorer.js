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
    (w.word.toLowerCase().includes(keyword))
  );

  filtered.forEach(w => {
    const card = document.createElement('div');
    card.className = 'col-md-4';
    card.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">${w.word} <span class="badge bg-secondary text-capitalize badge-sm">${w.type}</span></h5>
          <p class="card-text">${w.meaning}</p>
          <p class="card-text text-muted"><em>${w.chinese.meaning}</em></p>
        </div>
      </div>
    `;
    container.appendChild(card);

    // Modal trigger logic
    card.addEventListener('click', () => {
      const modalBody = document.getElementById('modalBody');

      modalBody.innerHTML = `
        <h4>${w.word} <span class="badge bg-secondary text-capitalize badge-sm">${w.type}</span></h4>
        <hr>
        <p><strong>Meaning:</strong> ${w.meaning}</p>
        <p><strong>Chinese:</strong> ${w.chinese.meaning}</p>
        <hr>
        <p><strong>English Example:</strong> ${w.example}</p>
        <p><strong>Chinese Example:</strong> ${w.chinese.example}</p>
      `;

      const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
      modal.show();
    });
  });
}

async function initExplorerPage() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
  }
  try {
    words = await loadAllWordData();
    renderCheatSheet();
  } catch (err) {
    console.error('Error loading data:', err);
    alert('Failed to load vocabulary data.');
  } finally {
    setTimeout(() => {
      const overlay = document.getElementById('loadingOverlay');
      if (overlay) {
        overlay.style.display = 'none';
        overlay.classList.remove('d-flex');
      } else {
        console.error('Overlay not found in DOM.');
      }
    }, 500);
  }
}

initExplorerPage();

document.getElementById('typeFilter').addEventListener('change', renderCheatSheet);
document.getElementById('letterFilter').addEventListener('change', renderCheatSheet);
document.getElementById('searchInput').addEventListener('input', renderCheatSheet);
