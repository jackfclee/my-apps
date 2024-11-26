//-----a. Basic Canvas Setup-----

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 600;

// Constants
const GRID_SIZE = 50;

// Player setup
let player = {
  x: canvas.width / 2 - GRID_SIZE / 2,
  y: canvas.height - GRID_SIZE,
  width: GRID_SIZE,
  height: GRID_SIZE,
  color: 'green',
};

// Obstacles (cars)
let cars = [];
const carWidth = GRID_SIZE * 1.5;
const carHeight = GRID_SIZE * 0.8;
const carSpeed = 5;

// Initialize some cars
for (let i = 0; i < 5; i++) {
  cars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height / 2,
    width: carWidth,
    height: carHeight,
    speed: carSpeed + Math.random() * 3,
    color: 'red',
  });
}

//-----b. Draw and Update Functions-----

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawCars() {
  cars.forEach(car => {
    ctx.fillStyle = car.color;
    ctx.fillRect(car.x, car.y, car.width, car.height);
  });
}

function updateCars() {
  cars.forEach(car => {
    car.x += car.speed;
    if (car.x > canvas.width) {
      car.x = -car.width;
      car.y = Math.random() * canvas.height;
    }
  });
}

//-----c. Collision Detection -----

function checkCollision() {
  for (let car of cars) {
    if (
      player.x < car.x + car.width &&
      player.x + player.width > car.x &&
      player.y < car.y + car.height &&
      player.y + player.height > car.y
    ) {
      alert('Game Over!');
      resetGame();
    }
  }
}

function resetGame() {
  player.x = canvas.width / 2 - GRID_SIZE / 2;
  player.y = canvas.height - GRID_SIZE;
}

//-----d. Player Controls-----

window.addEventListener('keydown', event => {
  switch (event.key) {
    case 'ArrowUp':
      if (player.y > 0) player.y -= GRID_SIZE;
      break;
    case 'ArrowDown':
      if (player.y < canvas.height - player.height) player.y += GRID_SIZE;
      break;
    case 'ArrowLeft':
      if (player.x > 0) player.x -= GRID_SIZE;
      break;
    case 'ArrowRight':
      if (player.x < canvas.width - player.width) player.x += GRID_SIZE;
      break;
  }
});

//-----e. Game Loop-----

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
  drawPlayer();
  drawCars();
  updateCars();
  checkCollision();

  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
