/*********************************
 * GLOBAL VARIABLES & STATE
 *********************************/
let currentLevel = 0; // 0 = Start/Welcome; 1=Word; 2=Wheel; 3=Trivia; 4=Gift; 5=Image Puzzle; 6=Final
let playerName = "";
let totalScore = 0;
let friendHelpUsed = {1: false, 2: false, 3: false, 4: false, 5: false, 6: false};

/***** LEVEL 1: WORD PUZZLE VARIABLES *****/
const wordPuzzleConfig = {
  words: [
    { word: "LOVE", color: "#FF5E5E" },
    { word: "HEART", color: "#FF69B4" },
    { word: "HAPPY", color: "#FFD700" },
    { word: "BIRTHDAY", color: "#90EE90" },
    { word: "SMILE", color: "#87CEFA" }
  ],
  hints: [
    "The first letter of the missing word is the key.",
    "Look carefully at the grid!",
    "You can do it!"
  ]
};
let foundWords = new Set();
let currentHintIndex = 0;
let wordPuzzleScore = 0;
let puzzleTimer = 120; // seconds
let puzzleTimerInterval = null;
const gridRows = 8, gridCols = 8;

/***** LEVEL 2: WHEEL OF FORTUNE VARIABLES *****/
let spinCount = 0;
const maxSpins = 3;
const sillyPrizes = [
  "You change your Whatsapp profile pic to Saint.",
  "Write your mom a love letter.",
  "Buy your nephews and nieces pizza."
];
const mainSpinPrize = "You have won yourself A Bag taken directly from your wishlist.";

/***** LEVEL 3: TRIVIA VARIABLES *****/
const quizQuestions = [
  {
    question: "What is the name of your dog?",
    options: ["Gaia", "Spottie", "Saint", "Puppy"],
    answer: 0,
    hint: "It's as regal as she is."
  },
  {
    question: "What is her go-to coffee order?",
    options: ["Latte", "Espresso", "Cappuccino", "Mocha"],
    answer: 2,
    hint: "Creamy and dreamy."
  },
  {
    question: "If you weren't a CA, what would you have been?",
    options: ["Doctor", "Lawyer", "Environmental Scientist", "Economist"],
    answer: 2,
    hint: "Think life, ocean and animals."
  },
  {
    question: "What are your favourite flowers?",
    options: ["Lillies", "Roses", "Tulips", "Daisy"],
    answer: 2,
    hint: "Small, sweet, and delightful."
  },
  {
    question: "Which hobby does she love the most?",
    options: ["Dancing", "Reading", "Cooking", "Traveling"],
    answer: 1,
    hint: "She loves to move to the rhythm."
  },
  {
    question: "What is her favorite season?",
    options: ["Spring", "Summer", "Autumn", "Winter"],
    answer: 0,
    hint: "Blossoms and new beginnings."
  },
  {
    question: "Which genre of music does she adore?",
    options: ["Pop", "Jazz", "Rock", "Classical"],
    answer: 0,
    hint: "Upbeat and fun!"
  },
  {
    question: "What is her favorite movie genre?",
    options: ["Romance", "Comedy", "Action", "Drama"],
    answer: 1,
    hint: "Laughs and smiles."
  },
  {
    question: "Which pet would she choose?",
    options: ["Dog", "Cat", "Bird", "Rabbit"],
    answer: 0,
    hint: "Loyal and loving."
  },
  {
    question: "What is her secret talent?",
    options: ["Singing", "Dancing", "Cooking", "All of the above"],
    answer: 3,
    hint: "She's multi-talented!"
  }
];
let currentQuizIndex = 0;
let quizScore = 0;
const memeImages = [
  "https://via.placeholder.com/300x200?text=Meme+1",
  "https://via.placeholder.com/300x200?text=Meme+2",
  "https://via.placeholder.com/300x200?text=Meme+3",
  "https://via.placeholder.com/300x200?text=Meme+4",
  "https://via.placeholder.com/300x200?text=Meme+5"
];

/***** LEVEL 4: DEAL OR NO DEAL VARIABLES *****/
const totalBoxes = 15;
let remainingBoxes = totalBoxes;
let grandPrizeIndex; // Correct box index

/***** LEVEL 5: IMAGE PUZZLE VARIABLES *****/
// For simplicity, use a sliding puzzle with 9 pieces (0-8). The correct order is 0,1,...,8.
let imagePuzzlePieces = [];
const correctImageOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8];

/*********************************
 * GAME & LEVEL TRANSITIONS
 *********************************/
function enterQuest() {
  playerName = document.getElementById("playerName").value.trim();
  if (!playerName) {
    showPrizeModal("Please enter your name to begin!", false);
    return;
  }
  document.getElementById("welcomeName").textContent = playerName;
  goToWelcomePage();
  startBackgroundMusic();
}

function goToWelcomePage() {
  hideAllLevels();
  document.getElementById("welcomePage").classList.add("active");
  document.getElementById("progressTracker").style.display = "block";
  startBalloons();
  startConfetti();
}

function showVideoGallery() {
  hideAllLevels();
  document.getElementById("videoGallery").classList.add("active");
  // Allow video to play for some time before closing the modal or transitioning
}

function showPictureGallery() {
  hideAllLevels();
  document.getElementById("pictureGallery").classList.add("active");
}

function goBackToStart() {
  hideAllLevels();
  document.getElementById("startPage").classList.add("active");
  document.getElementById("progressTracker").style.display = "none";
}

function goToStartPage() {
  goBackToStart();
}

function hideAllLevels() {
  document.querySelectorAll(".level").forEach(lvl => lvl.classList.remove("active"));
}

function updateProgress(level) {
  const steps = document.querySelectorAll(".progress-step");
  steps.forEach((step, index) => {
    if (index < level) {
      step.classList.add("active");
    } else {
      step.classList.remove("active");
    }
  });
}

function transitionToLevel(level) {
  hideAllLevels();
  document.getElementById("level" + level).classList.add("active");
  currentLevel = level;
  updateProgress(level);
  friendHelpUsed[level] = false;
  
  // Clear any level-specific timers if needed
  if (level === 1) {
    currentHintIndex = 0;
    foundWords.clear();
    wordPuzzleScore = 0;
    document.getElementById("score").textContent = wordPuzzleScore;
    createWordGrid();
    startPuzzleTimer();
  } else if (level === 2) {
    spinCount = 0;
    document.getElementById("spinCount").textContent = spinCount;
    document.getElementById("prizeDisplay").textContent = "";
    startLevelTimer(2);
  } else if (level === 3) {
    currentQuizIndex = 0;
    quizScore = 0;
    document.getElementById("quizScore").textContent = quizScore;
    showQuiz();
    startLevelTimer(3);
  } else if (level === 4) {
    remainingBoxes = totalBoxes;
    document.getElementById("remainingBoxes").textContent = remainingBoxes;
    createDealBoxes();
    startLevelTimer(4);
  } else if (level === 5) {
    createImagePuzzle();
    startLevelTimer(5);
  } else if (level === 6) {
    document.getElementById("finalScore").textContent = totalScore;
    document.getElementById("prizesWon").textContent = spinCount; // Example metric
  }
  startBalloons();
  startConfetti();
}

/*********************************
 * LEVEL 1: WORD PUZZLE FUNCTIONS
 *********************************/
function createWordGrid() {
  const gridElement = document.getElementById("wordGrid");
  gridElement.innerHTML = "";
  const rows = gridRows, cols = gridCols;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(""));

  const placedLetters = [];
  wordPuzzleConfig.words.forEach((wordObj, wordIndex) => {
    const word = wordObj.word;
    const row = Math.floor(Math.random() * rows);
    const maxStart = cols - word.length;
    const colStart = Math.floor(Math.random() * (maxStart + 1));
    for (let i = 0; i < word.length; i++) {
      grid[row][colStart + i] = word[i];
      placedLetters.push({
        row,
        col: colStart + i,
        letter: word[i],
        wordIndex,
        color: wordObj.color
      });
    }
  });

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.className = "letter-cell";
      cell.textContent = grid[r][c];
      cell.dataset.row = r;
      cell.dataset.col = c;
      const placed = placedLetters.find(pl => pl.row === r && pl.col === c);
      if (placed) {
        cell.dataset.wordIndex = placed.wordIndex;
        cell.dataset.letter = placed.letter;
        cell.dataset.color = placed.color;
      }
      cell.addEventListener("click", () => toggleLetterSelection(cell));
      gridElement.appendChild(cell);
    }
  }
}

function toggleLetterSelection(cell) {
  if (cell.classList.contains("selected")) return;
  cell.classList.add("selected");
  if (cell.dataset.color) {
    cell.style.backgroundColor = cell.dataset.color;
    cell.style.color = "#fff";
  }
  if (cell.dataset.wordIndex !== undefined) {
    const wordIndex = cell.dataset.wordIndex;
    const group = document.querySelectorAll(`.letter-cell[data-word-index="${wordIndex}"]`);
    let allSelected = true;
    group.forEach(c => {
      if (!c.classList.contains("selected")) allSelected = false;
    });
    if (allSelected && !foundWords.has(wordIndex)) {
      foundWords.add(wordIndex);
      group.forEach(c => c.style.border = "2px solid #000");
      wordPuzzleScore += 200;
      totalScore += 200;
      document.getElementById("score").textContent = wordPuzzleScore;
      if (foundWords.size === wordPuzzleConfig.words.length) {
        clearInterval(puzzleTimerInterval);
        // When complete, show prize modal; clicking Next transitions to Level 2.
        showPrizeModal("You have won your self a bracelet, like the one on your wishlist. It's definitely the one on your wishlist!", true);
      }
    }
  }
}

function showHint() {
  if (currentHintIndex < wordPuzzleConfig.hints.length) {
    const missingIndex = wordPuzzleConfig.words.findIndex((w, idx) => !foundWords.has(idx));
    if (missingIndex !== -1) {
      const firstLetter = wordPuzzleConfig.words[missingIndex].word.charAt(0);
      const cell = document.querySelector(`.letter-cell[data-word-index="${missingIndex}"][data-letter="${firstLetter}"]`);
      if (cell) {
        cell.classList.add("highlighted");
        setTimeout(() => cell.classList.remove("highlighted"), 2000);
      }
    }
    showPrizeModal("Hint: " + wordPuzzleConfig.hints[currentHintIndex], false);
    currentHintIndex++;
    document.getElementById("hintCount").textContent = wordPuzzleConfig.hints.length - currentHintIndex;
    if (currentHintIndex === wordPuzzleConfig.hints.length) {
      document.getElementById("hintButton").disabled = true;
    }
  }
}

function startPuzzleTimer() {
  puzzleTimer = 120;
  document.getElementById("timer").textContent = formatTime(puzzleTimer);
  if (puzzleTimerInterval) clearInterval(puzzleTimerInterval);
  puzzleTimerInterval = setInterval(() => {
    puzzleTimer--;
    document.getElementById("timer").textContent = formatTime(puzzleTimer);
    if (puzzleTimer <= 0) {
      clearInterval(puzzleTimerInterval);
      showPrizeModal("Time's up! Moving to Level 2.", false);
      setTimeout(() => transitionToLevel(2), 2000);
    }
  }, 1000);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/*********************************
 * LEVEL 2: WHEEL OF FORTUNE FUNCTIONS
 *********************************/
function spinWheel() {
  if (spinCount >= maxSpins) return;
  spinCount++;
  document.getElementById("spinCount").textContent = spinCount;
  const spinButton = document.querySelector(".spin-button");
  spinButton.disabled = true;
  const wheel = document.getElementById("wheel");
  let prize;
  if (spinCount < maxSpins) {
    prize = sillyPrizes[Math.floor(Math.random() * sillyPrizes.length)];
  } else {
    prize = mainSpinPrize;
  }
  const randomDeg = 3600 + Math.floor(Math.random() * 360);
  wheel.style.transform = `rotate(${randomDeg}deg)`;
  setTimeout(() => {
    document.getElementById("prizeDisplay").textContent = "You won: " + prize;
    totalScore += spinCount < maxSpins ? 50 : 500;
    spinButton.disabled = false;
    if (spinCount >= maxSpins) {
      showPrizeModal(prize, true);
    }
  }, 4000);
}

/*********************************
 * LEVEL 3: BIRTHDAY TRIVIA FUNCTIONS
 *********************************/
function showQuiz() {
  const container = document.getElementById("quizContainer");
  if (!container) {
    console.error("Quiz container element not found!");
    return;
  }
  container.innerHTML = "";
  // If all questions are answered, show the Next button.
  if (currentQuizIndex >= quizQuestions.length) {
    // Reveal the Next button
    const nextBtn = document.getElementById("quizNextBtn");
    if (nextBtn) {
      nextBtn.style.display = "block";
      nextBtn.disabled = false;
    }
    showPrizeModal("Trivia Complete!", true);
    return;
  }
  // Hide the Next button while quiz is in progress
  const nextBtn = document.getElementById("quizNextBtn");
  if (nextBtn) nextBtn.style.display = "none";
  
  // Disable the Next button during the question
  if (nextBtn) nextBtn.disabled = true;
  
  const q = quizQuestions[currentQuizIndex];
  const questionEl = document.createElement("h2");
  questionEl.textContent = q.question;
  container.appendChild(questionEl);
  q.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.className = "btn quiz-option";
    btn.addEventListener("click", () => checkAnswer(index, btn));
    container.appendChild(btn);
  });
  // Add a hint button for trivia
  const hintBtn = document.createElement("button");
  hintBtn.textContent = "Show Hint";
  hintBtn.className = "btn";
  hintBtn.addEventListener("click", () => {
    showPrizeModal("Hint: " + q.hint, false);
    hintBtn.disabled = true;
  });
  container.appendChild(hintBtn);
  document.getElementById("currentQuestion").textContent = currentQuizIndex + 1;
}

function checkAnswer(selectedIndex, btnElement) {
  const q = quizQuestions[currentQuizIndex];
  if (selectedIndex === q.answer) {
    btnElement.classList.add("correct");
    quizScore += 100;
    totalScore += 100;
    document.getElementById("quizScore").textContent = quizScore;
    setTimeout(() => {
      currentQuizIndex++;
      if (currentQuizIndex < quizQuestions.length) {
        showQuiz();
      } else {
        // When all questions are answered, show the Next button
        const nextBtn = document.getElementById("quizNextBtn");
        if (nextBtn) {
          nextBtn.style.display = "block";
          nextBtn.disabled = false;
        }
        showPrizeModal("Trivia Complete!", true);
      }
    }, 2000);
  } else {
    btnElement.classList.add("incorrect");
    showPrizeModal("Incorrect. The correct answer is: " + q.options[q.answer], false);
    setTimeout(() => {
      currentQuizIndex++;
      if (currentQuizIndex < quizQuestions.length) {
        showQuiz();
      } else {
        const nextBtn = document.getElementById("quizNextBtn");
        if (nextBtn) {
          nextBtn.style.display = "block";
          nextBtn.disabled = false;
        }
        showPrizeModal("Trivia Complete!", true);
      }
    }, 3000);
  }
}

/*********************************
 * LEVEL 4: GIFT GAUNTLET FUNCTIONS
 *********************************/
function createDealBoxes() {
  const boxGrid = document.getElementById("dealBoxGrid");
  boxGrid.innerHTML = "";
  let boxCount = 0;
  for (let row = 1; row <= 5; row++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";
    for (let i = 0; i < row; i++) {
      if (boxCount >= totalBoxes) break;
      const box = document.createElement("div");
      box.className = "box";
      box.textContent = "Box " + (boxCount + 1);
      box.dataset.boxIndex = boxCount;
      box.addEventListener("click", () => handleBoxClick(boxCount, box));
      rowDiv.appendChild(box);
      boxCount++;
    }
    boxGrid.appendChild(rowDiv);
  }
  document.getElementById("remainingBoxes").textContent = totalBoxes;
  grandPrizeIndex = Math.floor(Math.random() * totalBoxes);
}

function handleBoxClick(index, boxElement) {
  if (index == grandPrizeIndex) {
    boxElement.classList.add("winner");
    boxElement.textContent = "Grand Prize!";
    totalScore += 500;
    showPrizeModal("Grand Prize!", true);
    setTimeout(() => showCelebratoryVideo(), 2000);
  } else {
    const offer = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
    document.getElementById("currentOffer").textContent = "M" + offer;
    showDealModal(offer, boxElement);
  }
}

function showDealModal(offer, boxElement) {
  const dealModal = document.getElementById("dealModal");
  document.getElementById("dealText").textContent = "Deal Offer: R" + offer + ". Accept?";
  dealModal.style.display = "flex";
  dealModal.dataset.offer = offer;
  dealModal.dataset.boxIndex = boxElement.dataset.boxIndex;
  boxElement.dataset.dealOffered = "true";
}

function acceptDeal() {
  const dealModal = document.getElementById("dealModal");
  const offer = parseInt(dealModal.dataset.offer);
  totalScore += offer;
  showPrizeModal("Deal accepted! You win R" + offer + "!", true);
  dealModal.style.display = "none";
  setTimeout(() => showCelebratoryVideo(), 2000);
}

function tryAgainDeal() {
  const dealModal = document.getElementById("dealModal");
  dealModal.style.display = "none";
  const boxIndex = dealModal.dataset.boxIndex;
  const box = document.querySelector(`.box[data-box-index="${boxIndex}"]`);
  if (box) {
    box.style.visibility = "hidden";
  }
  remainingBoxes--;
  document.getElementById("remainingBoxes").textContent = remainingBoxes;
  if (remainingBoxes <= 1) {
    totalScore += 500;
    showPrizeModal("Only one box left! It holds the Grand Prize!", true);
    setTimeout(() => showCelebratoryVideo(), 2000);
  }
}

/*********************************
 * LEVEL 5: IMAGE PUZZLE FUNCTIONS
 *********************************/
function createImagePuzzle() {
  const puzzleContainer = document.getElementById("imagePuzzle");
  puzzleContainer.innerHTML = "";
  // Initialize puzzle pieces (numbers 0 to 8)
  imagePuzzlePieces = [];
  for (let i = 0; i < 9; i++) {
    imagePuzzlePieces.push(i);
  }
  // Shuffle pieces randomly
  imagePuzzlePieces.sort(() => 0.5 - Math.random());
  for (let i = 0; i < 9; i++) {
    const piece = document.createElement("div");
    piece.className = "image-piece";
    piece.dataset.index = i;
    piece.dataset.value = imagePuzzlePieces[i];
    piece.textContent = imagePuzzlePieces[i] + 1;
    piece.addEventListener("click", imagePuzzleClick);
    puzzleContainer.appendChild(piece);
  }
}

let selectedPiece = null;
function imagePuzzleClick(e) {
  const piece = e.currentTarget;
  if (!selectedPiece) {
    selectedPiece = piece;
    piece.classList.add("selected");
  } else {
    const tempVal = selectedPiece.dataset.value;
    selectedPiece.dataset.value = piece.dataset.value;
    piece.dataset.value = tempVal;
    const tempText = selectedPiece.textContent;
    selectedPiece.textContent = piece.textContent;
    piece.textContent = tempText;
    selectedPiece.classList.remove("selected");
    selectedPiece = null;
    checkImagePuzzle();
  }
}

function checkImagePuzzle() {
  const pieces = document.querySelectorAll(".image-piece");
  let correct = true;
  pieces.forEach(piece => {
    if (parseInt(piece.dataset.value) !== parseInt(piece.dataset.index)) {
      correct = false;
    }
  });
  if (correct) {
    showPrizeModal("Image Puzzle Solved!", true);
  }
}

/*********************************
 * FRIEND HELP FUNCTIONS
 *********************************/
function askFriend() {
  if (friendHelpUsed[currentLevel]) {
    showPrizeModal("You have already asked a friend for this level!", false);
    return;
  }
  let message = "";
  switch (currentLevel) {
    case 1:
      message = "Your friend says: 'The words are: LOVE, HEART, HAPPY, BIRTHDAY, SMILE.'";
      break;
    case 2:
      message = "Your friend says: 'Spin wisely – the main prize is R5000!'"; 
      break;
    case 3:
      const currentQ = quizQuestions[currentQuizIndex] || {};
      message = "Your friend says: 'The correct answer is: " + (currentQ.options ? currentQ.options[currentQ.answer] : "") + ".'";
      break;
    case 4:
      message = "Your friend says: 'Keep trying! The grand prize is hidden among the boxes.'";
      break;
    case 5:
      message = "Your friend says: 'Arrange the pieces to reveal the complete image!'";
      break;
    case 6:
      message = "Your friend says: 'Happy Birthday Manyano! Enjoy your day!'";
      break;
    default:
      message = "Your friend sends warm wishes!";
  }
  friendHelpUsed[currentLevel] = true;
  document.getElementById("friendMessage").textContent = message;
  document.getElementById("friendModal").style.display = "flex";
}

function closeFriendModal() {
  document.getElementById("friendModal").style.display = "none";
}

/*********************************
 * PRIZE MODAL FUNCTIONS
 *********************************/
function showPrizeModal(text, autoClose = true) {
  const prizeModal = document.getElementById("prizeModal");
  document.getElementById("prizeTitle").textContent = text;
  prizeModal.style.display = "flex";
  if (autoClose) {
    setTimeout(() => {
      closePrizeModal();
    }, 4000);
  }
}

function closePrizeModal() {
  document.getElementById("prizeModal").style.display = "none";
  // Level transitions:
  if (currentLevel === 1) {
    transitionToLevel(2);
  } else if (currentLevel === 2) {
    transitionToLevel(3);
  } else if (currentLevel === 3) {
    // If trivia is complete, the Next button will be shown instead of auto transitioning
    if (currentQuizIndex >= quizQuestions.length) {
      document.getElementById("quizNextBtn").style.display = "block";
    }
  } else if (currentLevel === 4) {
    setTimeout(() => showCelebratoryVideo(), 1000);
  } else if (currentLevel === 5) {
    transitionToLevel(6);
  }
}

/*********************************
 * CELEBRATORY VIDEO FUNCTIONS
 *********************************/
function showCelebratoryVideo() {
  const videoModal = document.getElementById("videoModal");
  videoModal.style.display = "flex";
}

function closeVideoModal() {
  document.getElementById("videoModal").style.display = "none";
  transitionToLevel(6);
}

/*********************************
 * LEVEL TIMER FUNCTION
 *********************************/
function startLevelTimer(level) {
  let levelTime = 60; // 60-second timer per level
  const timerElement = document.getElementById("levelTimer");
  timerElement.textContent = `Time left: ${levelTime}s`;
  const levelTimerInterval = setInterval(() => {
    levelTime--;
    timerElement.textContent = `Time left: ${levelTime}s`;
    if (levelTime <= 0) {
      clearInterval(levelTimerInterval);
      showPrizeModal("Time's up! Continue or move to the next level?", false);
      // Show buttons to allow the user to continue or proceed
      document.getElementById("continueBtn").style.display = "block";
      document.getElementById("nextLevelBtn").style.display = "block";
    }
  }, 1000);
}

/*********************************
 * UTILITY FUNCTIONS (Balloons, Confetti, Audio)
 *********************************/
function startBalloons() {
  const balloonContainer = document.createElement("div");
  balloonContainer.className = "balloon-container";
  document.body.appendChild(balloonContainer);
  for (let i = 0; i < 20; i++) {
    const balloon = document.createElement("div");
    balloon.className = "balloon";
    balloon.style.left = Math.random() * window.innerWidth + "px";
    balloon.style.backgroundColor = randomColor();
    balloonContainer.appendChild(balloon);
    setTimeout(() => balloon.remove(), 5000);
  }
  setTimeout(() => balloonContainer.remove(), 5000);
}

function startConfetti() {
  const confettiContainer = document.createElement("div");
  confettiContainer.className = "confetti-container";
  document.body.appendChild(confettiContainer);
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * window.innerWidth + "px";
    confetti.style.backgroundColor = randomColor();
    confettiContainer.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4000);
  }
  setTimeout(() => confettiContainer.remove(), 4000);
}

function randomColor() {
  const colors = ["#FF5E5E", "#FF69B4", "#FFD700", "#90EE90", "#87CEFA", "#FFA07A"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function startBackgroundMusic() {
  const music = document.getElementById("backgroundMusic");
  music.volume = 0.5;
  music.play();
}

document.addEventListener("DOMContentLoaded", () => {
  // App starts on the Start Page.
});
