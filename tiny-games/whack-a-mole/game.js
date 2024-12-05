const board = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");

let score = 0;
let gameInterval;
let activeMole = null;

function createBoard() {
    board.innerHTML = ""; // Clear any existing holes
    for (let i = 0; i < 9; i++) {
        const hole = document.createElement("div");
        hole.classList.add("hole");

        const mole = document.createElement("div");
        mole.classList.add("mole");

        // Add click listener to mole
        mole.addEventListener("click", () => {
            if (mole.classList.contains("active")) {
                score++;
                scoreDisplay.textContent = `Score: ${score}`;
                mole.classList.remove("active");
            }
        });

        hole.appendChild(mole);
        board.appendChild(hole);
    }
}

function getRandomHole() {
    const holes = document.querySelectorAll(".hole");
    const index = Math.floor(Math.random() * holes.length);
    return holes[index];
}

function popUpMole() {
    if (activeMole) {
        activeMole.classList.remove("active");
    }
    const hole = getRandomHole();
    const mole = hole.querySelector(".mole");
    mole.classList.add("active");
    activeMole = mole;
}

function startGame() {
    score = 0;
    scoreDisplay.textContent = "Score: 0";
    createBoard();
    clearInterval(gameInterval);
    gameInterval = setInterval(popUpMole, 1000);

    // End game after 30 seconds
    setTimeout(() => {
        clearInterval(gameInterval);
        alert(`Game over! Your score is ${score}`);
    }, 30000);
}

// Initialize the game board
createBoard();
