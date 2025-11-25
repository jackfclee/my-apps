class MathsNinja {
  constructor() {
    // State
    this.settings = {
      mode: "normal", // normal (MC), advanced (input)
      count: 10,
      timerType: "stopwatch", // stopwatch, countdown
    };

    // Load settings from localStorage
    const savedSettings = localStorage.getItem("mathsNinjaSettings");
    if (savedSettings) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }

    this.gameState = {
      currentQuestion: 0,
      score: 0,
      questions: [],
      startTime: 0,
      timerInterval: null,
      timeElapsed: 0,
      timeRemaining: 0,
      totalTimeLimit: 0,
      isGameOver: false,
      isPaused: false,
      pauseCount: 0,
    };

    this.history = JSON.parse(localStorage.getItem("mathsNinjaHistory")) || [];

    // DOM Elements
    this.screens = {
      menu: document.getElementById("menu-screen"),
      game: document.getElementById("game-screen"),
      results: document.getElementById("results-screen"),
      history: document.getElementById("history-screen"),
    };

    this.modals = {
      pause: document.getElementById("pause-modal"),
    };

    this.elements = {
      modeSelect: document.getElementById("mode-select"),
      countSelect: document.getElementById("count-select"),
      timerSelect: document.getElementById("timer-select"),
      startBtn: document.getElementById("start-btn"),
      historyBtn: document.getElementById("history-btn"),
      equationDisplay: document.getElementById("equation-display"),
      inputArea: document.getElementById("input-area"),
      progressBar: document.getElementById("progress-bar"),
      questionCounter: document.getElementById("question-counter"),
      timerDisplay: document.getElementById("timer-display"),
      finalScore: document.getElementById("final-score"),
      finalTime: document.getElementById("final-time"),
      playAgainBtn: document.getElementById("play-again-btn"),
      menuBtn: document.getElementById("menu-btn"),
      historyList: document.getElementById("history-list"),
      closeHistoryBtn: document.getElementById("close-history-btn"),
      clearHistoryBtn: document.getElementById("clear-history-btn"),
      pauseBtn: document.getElementById("pause-btn"),
      exitBtn: document.getElementById("exit-btn"),
      resumeBtn: document.getElementById("resume-btn"),
      quitBtn: document.getElementById("quit-btn"),
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.updateSettingsUI();
    this.renderHistory();
  }

  updateSettingsUI() {
    // Update Mode
    this.updateToggleGroupUI(this.elements.modeSelect, this.settings.mode);
    // Update Count
    this.updateToggleGroupUI(this.elements.countSelect, this.settings.count);
    // Update Timer Type
    this.updateToggleGroupUI(this.elements.timerSelect, this.settings.timerType);
  }

  updateToggleGroupUI(element, value) {
    element.querySelectorAll(".toggle-btn").forEach((btn) => {
      if (btn.dataset.value == value) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  bindEvents() {
    // Settings Toggles
    this.bindToggleGroup(this.elements.modeSelect, "mode");
    this.bindToggleGroup(this.elements.countSelect, "count");
    this.bindToggleGroup(this.elements.timerSelect, "timerType");

    // Navigation
    this.elements.startBtn.addEventListener("click", () => this.startGame());
    this.elements.historyBtn.addEventListener("click", () => this.showScreen("history"));
    this.elements.closeHistoryBtn.addEventListener("click", () => this.showScreen("menu"));
    this.elements.playAgainBtn.addEventListener("click", () => this.startGame());
    this.elements.menuBtn.addEventListener("click", () => this.showScreen("menu"));
    this.elements.clearHistoryBtn.addEventListener("click", () => this.clearHistory());

    // Pause/Exit
    this.elements.pauseBtn.addEventListener("click", () => this.togglePause());
    this.elements.exitBtn.addEventListener("click", () => this.confirmExit());
    this.elements.resumeBtn.addEventListener("click", () => this.togglePause());
    this.elements.quitBtn.addEventListener("click", () => this.quitGame());
  }

  bindToggleGroup(element, settingKey) {
    element.addEventListener("click", (e) => {
      if (e.target.classList.contains("toggle-btn")) {
        // Update UI
        element.querySelectorAll(".toggle-btn").forEach((btn) => btn.classList.remove("active"));
        e.target.classList.add("active");

        // Update State
        let value = e.target.dataset.value;
        if (settingKey === "count") value = parseInt(value);
        this.settings[settingKey] = value;

        // Save settings
        localStorage.setItem("mathsNinjaSettings", JSON.stringify(this.settings));
      }
    });
  }

  showScreen(screenName) {
    Object.values(this.screens).forEach((screen) => {
      screen.classList.remove("active");
      screen.classList.add("hidden");
    });

    const targetScreen = this.screens[screenName];
    targetScreen.classList.remove("hidden");
    // Small delay to allow display:block to apply before opacity transition
    setTimeout(() => {
      targetScreen.classList.add("active");
    }, 10);
  }

  startGame() {
    this.generateQuestions();
    this.gameState.currentQuestion = 0;
    this.gameState.score = 0;
    this.gameState.isGameOver = false;
    this.gameState.timeElapsed = 0;
    this.gameState.isPaused = false;
    this.gameState.pauseCount = 0;

    this.showScreen("game");
    this.startTimer();
    this.renderQuestion();
  }

  generateQuestions() {
    this.gameState.questions = [];
    for (let i = 0; i < this.settings.count; i++) {
      this.gameState.questions.push(this.createQuestion());
    }
  }

  createQuestion() {
    const operators = ["+", "-", "*", "/"];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2, answer;

    switch (operator) {
      case "+":
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 + num2;
        break;
      case "-":
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * num1); // Ensure positive result
        answer = num1 - num2;
        break;
      case "*":
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 * num2;
        break;
      case "/":
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * answer; // Ensure clean division
        break;
    }

    return {
      text: `${num1} ${operator.replace("*", "×").replace("/", "÷")} ${num2}`,
      answer: answer,
    };
  }

  startTimer(isResume = false) {
    if (this.gameState.timerInterval) clearInterval(this.gameState.timerInterval);

    if (!isResume) {
      this.gameState.startTime = Date.now();

      // Setup for countdown
      if (this.settings.timerType === "countdown") {
        // Give 5 seconds per question? Or 10? Let's go with 10s per question for now.
        // 10 q = 100s, 50 q = 500s.
        const secondsPerQuestion = 10;
        this.gameState.totalTimeLimit = this.settings.count * secondsPerQuestion;
        this.gameState.timeRemaining = this.gameState.totalTimeLimit;
      }
    }

    this.gameState.timerInterval = setInterval(() => {
      const now = Date.now();

      if (this.settings.timerType === "stopwatch") {
        this.gameState.timeElapsed = Math.floor((now - this.gameState.startTime) / 1000);
        this.updateTimerDisplay();
      } else {
        const elapsed = Math.floor((now - this.gameState.startTime) / 1000);
        this.gameState.timeRemaining = this.gameState.totalTimeLimit - elapsed;

        if (this.gameState.timeRemaining <= 0) {
          this.gameState.timeRemaining = 0;
          this.updateTimerDisplay();
          this.endGame();
        } else {
          this.updateTimerDisplay();
        }
      }
    }, 1000);

    // Initial display update
    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    let timeToDisplay = 0;

    if (this.settings.timerType === "stopwatch") {
      timeToDisplay = this.gameState.timeElapsed;
    } else {
      timeToDisplay = this.gameState.timeRemaining;
    }

    const minutes = Math.floor(timeToDisplay / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timeToDisplay % 60).toString().padStart(2, "0");
    this.elements.timerDisplay.textContent = `${minutes}:${seconds}`;
  }

  renderQuestion() {
    if (this.gameState.currentQuestion >= this.settings.count) {
      this.endGame();
      return;
    }

    const q = this.gameState.questions[this.gameState.currentQuestion];
    this.elements.equationDisplay.textContent = `${q.text} = ?`;
    this.elements.questionCounter.textContent = `${this.gameState.currentQuestion + 1} / ${this.settings.count}`;

    const progress = (this.gameState.currentQuestion / this.settings.count) * 100;
    this.elements.progressBar.style.width = `${progress}%`;

    this.renderInputMethod(q);
  }

  renderInputMethod(question) {
    this.elements.inputArea.innerHTML = "";

    if (this.settings.mode === "normal") {
      // Multiple Choice
      const options = this.generateOptions(question.answer);
      const container = document.createElement("div");
      container.className = "mc-options";

      options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.className = "mc-btn";
        btn.textContent = opt;
        btn.onclick = () => this.handleAnswer(opt, question.answer);
        container.appendChild(btn);
      });

      this.elements.inputArea.appendChild(container);
    } else {
      // Numpad Input
      const container = document.createElement("div");
      container.className = "numpad-container";

      const display = document.createElement("div");
      display.className = "answer-display";
      display.id = "current-input";

      const grid = document.createElement("div");
      grid.className = "numpad-grid";

      [1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0, "OK"].forEach((key) => {
        const btn = document.createElement("button");
        btn.className = "num-btn";
        btn.textContent = key;
        if (key === "C") btn.onclick = () => this.updateInput("clear");
        else if (key === "OK") btn.onclick = () => this.submitInput(question.answer);
        else btn.onclick = () => this.updateInput(key);
        grid.appendChild(btn);
      });

      container.appendChild(display);
      container.appendChild(grid);
      this.elements.inputArea.appendChild(container);
    }
  }

  generateOptions(correctAnswer) {
    const options = new Set([correctAnswer]);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 10) - 5; // Random offset -5 to +5
      const val = correctAnswer + offset;
      if (val >= 0 && val !== correctAnswer) options.add(val);
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
  }

  handleAnswer(userAnswer, correctAnswer) {
    if (this.gameState.isGameOver || this.gameState.isPaused) return;

    const isCorrect = parseInt(userAnswer) === correctAnswer;
    if (isCorrect) this.gameState.score++;

    // Visual feedback could go here

    this.gameState.currentQuestion++;
    this.renderQuestion();
  }

  updateInput(val) {
    const display = document.getElementById("current-input");
    if (val === "clear") {
      display.textContent = "";
    } else {
      if (display.textContent.length < 4) {
        display.textContent += val;
      }
    }
  }

  submitInput(correctAnswer) {
    const display = document.getElementById("current-input");
    const val = display.textContent;
    if (val === "") return;

    this.handleAnswer(val, correctAnswer);
  }

  endGame(status = "Completed") {
    this.gameState.isGameOver = true;
    clearInterval(this.gameState.timerInterval);

    // Save history
    const gameRecord = {
      date: new Date().toLocaleString(),
      score: this.gameState.score,
      total: this.settings.count,
      time: this.elements.timerDisplay.textContent,
      mode: this.settings.mode,
      timerType: this.settings.timerType,
      status: status,
      pauses: this.gameState.pauseCount,
    };

    this.history.unshift(gameRecord);
    localStorage.setItem("mathsNinjaHistory", JSON.stringify(this.history));

    // Update Results Screen
    this.elements.finalScore.textContent = `${this.gameState.score}/${this.settings.count}`;
    this.elements.finalTime.textContent = this.elements.timerDisplay.textContent;

    this.renderHistory();
    this.showScreen("results");
  }

  renderHistory() {
    this.elements.historyList.innerHTML = "";

    if (this.history.length === 0) {
      this.elements.historyList.innerHTML = '<div class="empty-state">No games played yet.</div>';
      return;
    }

    this.history.forEach((record) => {
      const item = document.createElement("div");
      item.className = "history-item";

      let statusBadge = "";
      if (record.status && record.status !== "Completed") {
        statusBadge = `<span style="color: var(--danger); font-size: 0.8rem; margin-left: 5px;">(${record.status})</span>`;
      }

      let pauseInfo = "";
      if (record.pauses > 0) {
        pauseInfo = `<span style="color: var(--text-dim); font-size: 0.8rem;"> • ${record.pauses} pause${record.pauses > 1 ? "s" : ""}</span>`;
      }

      item.innerHTML = `
                <div class="history-info">
                    <span class="history-mode">${record.mode.toUpperCase()} (${(record.timerType || "stopwatch").toUpperCase()}) • ${record.time}${pauseInfo}</span>
                    <span class="history-date">${record.date}${statusBadge}</span>
                </div>
                <div class="history-score">${record.score}/${record.total}</div>
            `;
      this.elements.historyList.appendChild(item);
    });
  }

  togglePause() {
    if (this.gameState.isGameOver) return;

    this.gameState.isPaused = !this.gameState.isPaused;

    if (this.gameState.isPaused) {
      clearInterval(this.gameState.timerInterval);
      this.gameState.pauseCount++;
      this.modals.pause.classList.remove("hidden");
    } else {
      this.modals.pause.classList.add("hidden");
      // Resume timer
      // Need to adjust startTime to account for pause duration
      // But since we track elapsed/remaining directly in interval,
      // we just need to restart the interval logic.
      // However, our interval logic relies on Date.now() - startTime.
      // So we MUST adjust startTime.

      // Actually, a simpler way for stopwatch is to just increment elapsed in interval
      // without relying on startTime for total delta.
      // But for accuracy, delta is better.

      // Let's switch to a simpler tick-based timer to make pausing easier
      // OR adjust startTime.
      // Let's adjust startTime.
      // When pausing, we stop. When resuming, we set new startTime such that
      // (now - newStartTime) = previouslyElapsed.
      // => newStartTime = now - previouslyElapsed * 1000.

      const now = Date.now();
      if (this.settings.timerType === "stopwatch") {
        this.gameState.startTime = now - this.gameState.timeElapsed * 1000;
      } else {
        // For countdown, we have timeRemaining.
        // We want (totalTimeLimit - (now - newStartTime)/1000) = timeRemaining
        // => (now - newStartTime)/1000 = totalTimeLimit - timeRemaining
        // => now - newStartTime = (totalTimeLimit - timeRemaining) * 1000
        // => newStartTime = now - (totalTimeLimit - timeRemaining) * 1000
        this.gameState.startTime = now - (this.gameState.totalTimeLimit - this.gameState.timeRemaining) * 1000;
      }

      this.startTimer(true); // true = resume
    }
  }

  confirmExit() {
    if (confirm('Are you sure you want to exit? Progress will be saved as "Exited".')) {
      this.quitGame();
    }
  }

  quitGame() {
    this.modals.pause.classList.add("hidden");
    this.endGame("Exited");
  }

  // Modified startTimer to handle resume
  startTimer(isResume = false) {
    if (this.gameState.timerInterval) clearInterval(this.gameState.timerInterval);

    if (!isResume) {
      this.gameState.startTime = Date.now();

      if (this.settings.timerType === "countdown") {
        const secondsPerQuestion = 10;
        this.gameState.totalTimeLimit = this.settings.count * secondsPerQuestion;
        this.gameState.timeRemaining = this.gameState.totalTimeLimit;
      }
    }

    this.gameState.timerInterval = setInterval(() => {
      const now = Date.now();

      if (this.settings.timerType === "stopwatch") {
        this.gameState.timeElapsed = Math.floor((now - this.gameState.startTime) / 1000);
        this.updateTimerDisplay();
      } else {
        const elapsed = Math.floor((now - this.gameState.startTime) / 1000);
        this.gameState.timeRemaining = this.gameState.totalTimeLimit - elapsed;

        if (this.gameState.timeRemaining <= 0) {
          this.gameState.timeRemaining = 0;
          this.updateTimerDisplay();
          this.endGame();
        } else {
          this.updateTimerDisplay();
        }
      }
    }, 1000);

    this.updateTimerDisplay();
  }

  clearHistory() {
    if (confirm("Are you sure you want to clear all history?")) {
      this.history = [];
      localStorage.removeItem("mathsNinjaHistory");
      this.renderHistory();
    }
  }
}

// Initialize game
document.addEventListener("DOMContentLoaded", () => {
  new MathsNinja();
});
