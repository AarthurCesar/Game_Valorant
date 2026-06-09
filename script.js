// Jogo da Memória Valorant

const gameContainer = document.getElementById('game');
const attemptsSpan = document.getElementById('attempts');
const matchesSpan = document.getElementById('matches');
const timerEl = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const menu = document.getElementById('menu');
const difficultyMenu = document.getElementById('difficultyMenu');
const personalizedInput = document.getElementById('personalizedInput');
const personalizedOptions = document.getElementById('personalizedOptions');
const jokerCheckbox = document.getElementById('jokerCheckbox');
const stats = document.getElementById('stats');
const gameControls = document.getElementById('gameControls');
const backGameButton = document.getElementById('backGameButton');
const resetGameButton = document.getElementById('resetGameButton');
const victoryModal = document.getElementById('victoryModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const startDifficultyButton = document.getElementById('startDifficultyButton');
const loadingOverlay = document.getElementById('loadingOverlay');
const finalAttemptsEl = document.getElementById('finalAttempts');
const finalTimeEl = document.getElementById('finalTime');

let jokerEnabled = false;
const jokerTypes = ['Classic', 'Vandal', 'Operator'];
let selectedJoker = jokerTypes[Math.floor(Math.random() * jokerTypes.length)];
let jokerCard = {
  displayName: 'Coringa',
  displayIcon: '',
  jokerType: selectedJoker
};

const agentVoices = {
  "Brimstone": "sounds/Brim.mpeg",
  "Viper": "sounds/Viper.mpeg",
  "Omen": "sounds/Omen.mpeg",
  "Killjoy": "sounds/KillJoy.mpeg",
  "Cypher": "sounds/Cypher.mpeg",
  "Sova": "sounds/Sova.mpeg",
  "Sage": "sounds/Sage.mpeg",
  "Phoenix": "sounds/Phoenix.mpeg",
  "Jett": "sounds/Jett.mpeg",
  "Reyna": "sounds/Reyna.mpeg",
  "Raze": "sounds/Raze.mpeg",
  "Breach": "sounds/Breach.mpeg",
  "Skye": "sounds/Skye.mpeg",
  "Yoru": "sounds/Yoru.mpeg",
  "Astra": "sounds/Astra.mpeg",
  "KAY/O": "sounds/Kayo.mpeg",
  "Chamber": "sounds/Chamber.mpeg",
  "Neon": "sounds/Neon.mpeg",
  "Fade": "sounds/Fade.mpeg",
  "Harbor": "sounds/Harbor.mpeg",
  "Gekko": "sounds/Gekko.mpeg",
  "Deadlock": "sounds/Deadlock.mpeg",
  "Iso": "sounds/Iso.mpeg",
  "Clove": "sounds/Clove.mpeg",
  "Vyse": "sounds/Vyse.mpeg",
  "Tejo": "sounds/Tejo.mpeg",
  "Waylay": "sounds/Waylay.mpeg",
  "Classic": "sounds/classic.mp3",
  "Vandal": "sounds/Vandal.mp3",
  "Operator": "sounds/Operator.mp3",
};

const FALLBACK_SOUND = "sounds/start.mpeg";

function getAgentSound(name) {
  return agentVoices[name] ?? FALLBACK_SOUND;
}

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let attempts = 0;
let matches = 0;

// ===== TIMER =====
let timerInterval = null;
let timerSeconds = 0;

function startTimer() {
  timerSeconds = 0;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimerDisplay() {
  stopTimer();
  timerSeconds = 0;
  if (timerEl) timerEl.textContent = '00:00';
}

function updateTimerDisplay() {
  const mins = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
  const secs = (timerSeconds % 60).toString().padStart(2, '0');
  if (timerEl) timerEl.textContent = `${mins}:${secs}`;
}

function getFormattedTime() {
  const mins = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
  const secs = (timerSeconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// ===== ANIMAÇÃO DE STAT =====
function bumpStat(el) {
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
  el.addEventListener('animationend', () => el.classList.remove('bump'), { once: true });
}

// ===== FETCH =====
async function fetchAgents() {
  const res = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
  const data = await res.json();
  const agents = data.data.filter(agent => agent.displayIcon != null);

  return agents;
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// ===== CRIAR CARTA =====
function createCard(agent) {
  const card = document.createElement('div');
  card.classList.add('card');

  const cardInner = document.createElement('div');
  cardInner.classList.add('card-inner');

  const cardFront = document.createElement('div');
  cardFront.classList.add('card-front');

  const cardBack = document.createElement('div');
  cardBack.classList.add('card-back');

  const img = document.createElement('img');
  img.src = agent.displayIcon;
  img.classList.add(agent.displayName === 'Coringa' ? 'joker-img' : 'agent-img');

  cardBack.appendChild(img);
  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  card.appendChild(cardInner);

  card.dataset.agentName = agent.displayName;

  if (agent.displayName === 'Coringa') {
    card.dataset.jokerType = agent.jokerType;
  }

  card.addEventListener('click', () => flipCard(card));
  return card;
}

// ===== VIRAR CARTA =====
function flipCard(card) {
  if (lockBoard) return;
  if (card === firstCard) return;

  card.classList.add('flipped');

  if (card.dataset.agentName === 'Coringa') {
    if (firstCard) {
      firstCard.classList.remove('flipped');
      firstCard = null;
    }

    const jokerType = card.dataset.jokerType;
    const jokerSound = new Audio(getAgentSound(jokerType));
    jokerSound.play();

    if (jokerType === 'Classic') revealRandomPairs(1);
    else if (jokerType === 'Vandal') revealRandomPairs(2);
    else if (jokerType === 'Operator') revealRandomPairs(4);

    card.style.pointerEvents = 'none';
    lockBoard = false;
    return;
  }

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lockBoard = true;

  attempts++;
  attemptsSpan.textContent = attempts;
  bumpStat(attemptsSpan);

  if (firstCard.dataset.agentName === secondCard.dataset.agentName) {
    matches++;
    matchesSpan.textContent = matches;
    bumpStat(matchesSpan);

    new Audio(getAgentSound(firstCard.dataset.agentName.trim())).play();

    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.style.pointerEvents = 'none';
    secondCard.style.pointerEvents = 'none';

    resetBoard();
    checkVictory();
  } else {
    const f = firstCard;
    const s = secondCard;

    setTimeout(() => {
      f.classList.add('mismatch');
      s.classList.add('mismatch');
    }, 50);

    setTimeout(() => {
      f.classList.remove('flipped', 'mismatch');
      s.classList.remove('flipped', 'mismatch');
      resetBoard();
    }, 1000);
  }
}

function resetBoard() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function checkVictory() {
  const totalPairs = Math.floor((cards.length - (jokerEnabled ? 1 : 0)) / 2);
  if (matches === totalPairs) {
    setTimeout(() => showVictoryModal(), 600);
  }
}

function showVictoryModal() {
  stopTimer();
  if (finalAttemptsEl) finalAttemptsEl.textContent = attempts;
  if (finalTimeEl) finalTimeEl.textContent = getFormattedTime();
  victoryModal.classList.remove('hidden');
}

function hideVictoryModal() {
  victoryModal.classList.add('hidden');
}

// ===== INICIAR JOGO =====
async function startGame(cardCount) {
  loadingOverlay.classList.remove('hidden');

  selectedJoker = jokerTypes[Math.floor(Math.random() * jokerTypes.length)];
  jokerCard.jokerType = selectedJoker;

  if (selectedJoker === 'Classic') jokerCard.displayIcon = 'coringa/classic.png';
  else if (selectedJoker === 'Vandal') jokerCard.displayIcon = 'coringa/Vandal.webp';
  else if (selectedJoker === 'Operator') jokerCard.displayIcon = 'coringa/Operator.webp';

  const agents = await fetchAgents();

  let actualCardCount = cardCount === 'all' ? agents.length * 2 : cardCount;
  let selectedAgents = shuffleArray(agents).slice(0, actualCardCount / 2);

  cards = [...selectedAgents, ...selectedAgents];
  if (jokerEnabled) cards.push(jokerCard);
  shuffleArray(cards);

  gameContainer.innerHTML = '';
  cards.forEach(agent => gameContainer.appendChild(createCard(agent)));

  attempts = 0;
  matches = 0;
  attemptsSpan.textContent = '0';
  matchesSpan.textContent = '0';
  resetTimerDisplay();

  stats.classList.remove('hidden');
  gameControls.classList.remove('hidden');
  menu.classList.add('hidden');
  difficultyMenu.classList.add('hidden');

  loadingOverlay.classList.add('hidden');
  startTimer();
}

// ===== REVELAR PARES (CORINGA) =====
function revealRandomPairs(quantity) {
  let hiddenCards = Array.from(document.querySelectorAll('.card:not(.flipped)'));
  hiddenCards = hiddenCards.filter(c => c.dataset.agentName !== 'Coringa');

  const remainingPairs = {};
  hiddenCards.forEach(card => {
    const name = card.dataset.agentName;
    if (!remainingPairs[name]) remainingPairs[name] = [];
    remainingPairs[name].push(card);
  });

  const availablePairs = Object.keys(remainingPairs).filter(name => remainingPairs[name].length >= 2);
  shuffleArray(availablePairs);

  availablePairs.slice(0, quantity).forEach(name => {
    const [a, b] = remainingPairs[name];
    a.classList.add('flipped', 'matched');
    a.style.pointerEvents = 'none';
    b.classList.add('flipped', 'matched');
    b.style.pointerEvents = 'none';
    matches++;
  });

  matchesSpan.textContent = matches;
  bumpStat(matchesSpan);
  checkVictory();
}

// ===== FUNÇÕES DE MENU =====
function showMenu() {
  menu.classList.remove('hidden');
  difficultyMenu.classList.add('hidden');
  stats.classList.add('hidden');
  gameControls.classList.add('hidden');
  gameContainer.innerHTML = '';
  attempts = 0;
  matches = 0;
  attemptsSpan.textContent = '0';
  matchesSpan.textContent = '0';
  resetTimerDisplay();
}

function showDifficultyMenu() {
  menu.classList.add('hidden');
  difficultyMenu.classList.remove('hidden');
  stats.classList.add('hidden');
  gameControls.classList.add('hidden');
  gameContainer.innerHTML = '';
  attempts = 0;
  matches = 0;
  attemptsSpan.textContent = '0';
  matchesSpan.textContent = '0';
  resetTimerDisplay();
}

function handleDifficultySelection(cardCount) {
  jokerEnabled = jokerCheckbox.checked;
  startGame(cardCount === 'all' ? 'all' : cardCount);
}

function handlePersonalizedSelection() {
  const inputVal = parseInt(personalizedInput.value);
  if (isNaN(inputVal) || inputVal < 4 || inputVal > 54) {
    alert('Por favor, insira um valor entre 4 e 54.');
    return;
  }
  handleDifficultySelection(inputVal);
}

function handleDifficultyChange(event) {
  if (event.target.value === 'personalized') {
    personalizedOptions.classList.remove('hidden');
  } else {
    personalizedOptions.classList.add('hidden');
  }
}

function getDifficultyAction() {
  const selected = document.querySelector('input[name="difficulty"]:checked').value;
  if (selected === 'easy') handleDifficultySelection(4);
  else if (selected === 'medium') handleDifficultySelection(8);
  else if (selected === 'hard') handleDifficultySelection('all');
  else if (selected === 'personalized') handlePersonalizedSelection();
}

// ===== EVENT LISTENERS =====
startButton.addEventListener('click', showDifficultyMenu);

backGameButton.addEventListener('click', () => {
  stopTimer();
  showMenu();
  hideVictoryModal();
});

resetGameButton.addEventListener('click', () => {
  stopTimer();
  getDifficultyAction();
});

startDifficultyButton.addEventListener('click', getDifficultyAction);

document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
  radio.addEventListener('change', handleDifficultyChange);
});

closeModalBtn.addEventListener('click', () => {
  hideVictoryModal();
  showMenu();
});
