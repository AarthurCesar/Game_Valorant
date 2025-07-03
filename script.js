// Jogo da Memória Valorant com Menu, Personalização, Carta Coringa e Modal

const gameContainer = document.getElementById('game');
const attemptsSpan = document.getElementById('attempts');
const matchesSpan = document.getElementById('matches');
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
  "Killjoy": "sounds/killJoy.mpeg",
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
  "Vandal": "sounds/vandal.mp3",
  "Operator": "sounds/operator.mp3",
};

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let attempts = 0;
let matches = 0;

async function fetchAgents() {
  const res = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
  const data = await res.json();
  return data.data.filter(agent => agent.displayIcon != null);
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

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

  if (agent.displayName === 'Coringa') {
    img.classList.add('joker-img');
  } else {
    img.classList.add('agent-img');
  }

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
    
    // Toca o som correspondente ao tipo de Coringa
    const jokerSound = new Audio(agentVoices[jokerType]);
    jokerSound.play();

    if (jokerType === 'Classic') {
      revealRandomPairs(1);
    } else if (jokerType === 'Vandal') {
      revealRandomPairs(2);
    } else if (jokerType === 'Operator') {
      revealRandomPairs(4);
    }

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

  if (firstCard.dataset.agentName === secondCard.dataset.agentName) {
    matches++;
    matchesSpan.textContent = matches;

    const agentName = firstCard.dataset.agentName.trim();
    const audioSrc = agentVoices[agentName];

    if (audioSrc) {
      const audio = new Audio(audioSrc);
      audio.play();
    }

    firstCard.style.pointerEvents = 'none';
    secondCard.style.pointerEvents = 'none';

    resetBoard();
    checkVictory();
  } else {
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
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
    setTimeout(() => {
      showVictoryModal();
    }, 500);
  }
}

function showVictoryModal() {
  victoryModal.classList.remove('hidden');
  victoryModal.classList.add('show');
}

function hideVictoryModal() {
  victoryModal.classList.remove('show');
  victoryModal.classList.add('hidden');
}

async function startGame(cardCount) {
  selectedJoker = jokerTypes[Math.floor(Math.random() * jokerTypes.length)];
  jokerCard.jokerType = selectedJoker;

  if (selectedJoker === 'Classic') {
    jokerCard.displayIcon = 'coringa/classic.png';
  } else if (selectedJoker === 'Vandal') {
    jokerCard.displayIcon = 'coringa/Vandal.webp';
  } else if (selectedJoker === 'Operator') {
    jokerCard.displayIcon = 'coringa/Operator.webp';
  }

  const agents = await fetchAgents();

  let actualCardCount = cardCount;

  if (cardCount === 'all') {
    actualCardCount = agents.length * 2;
  }

  let selectedAgents = shuffleArray(agents).slice(0, actualCardCount / 2);

  cards = [...selectedAgents, ...selectedAgents];

  if (jokerEnabled) {
    cards.push(jokerCard);
  }

  shuffleArray(cards);

  gameContainer.innerHTML = '';
  cards.forEach(agent => {
    const card = createCard(agent);
    gameContainer.appendChild(card);
  });

  attempts = 0;
  matches = 0;
  attemptsSpan.textContent = attempts;
  matchesSpan.textContent = matches;

  // Mostra stats e controles do jogo
  stats.classList.remove('hidden');
  gameControls.classList.remove('hidden');
  
  // Oculta menus
  menu.classList.add('hidden');
  difficultyMenu.classList.add('hidden');
}

function revealRandomPairs(quantity) {
  let hiddenCards = Array.from(document.querySelectorAll('.card:not(.flipped)'));
  hiddenCards = hiddenCards.filter(c => c.dataset.agentName !== 'Coringa');

  const remainingPairs = {};
  hiddenCards.forEach(card => {
    const name = card.dataset.agentName;
    if (!remainingPairs[name]) {
      remainingPairs[name] = [];
    }
    remainingPairs[name].push(card);
  });

  const availablePairs = Object.keys(remainingPairs).filter(name => remainingPairs[name].length >= 2);
  shuffleArray(availablePairs);

  const pairsToReveal = availablePairs.slice(0, quantity);

  pairsToReveal.forEach(name => {
    remainingPairs[name][0].classList.add('flipped');
    remainingPairs[name][0].style.pointerEvents = 'none';

    remainingPairs[name][1].classList.add('flipped');
    remainingPairs[name][1].style.pointerEvents = 'none';

    matches++;
  });

  matchesSpan.textContent = matches;
  checkVictory();
}

// Menu Functions
function showMenu() {
  menu.classList.remove('hidden');
  difficultyMenu.classList.add('hidden');
  stats.classList.add('hidden');
  gameControls.classList.add('hidden');
  gameContainer.innerHTML = '';
  attempts = 0;
  matches = 0;
  attemptsSpan.textContent = attempts;
  matchesSpan.textContent = matches;
}

function showDifficultyMenu() {
  menu.classList.add('hidden');
  difficultyMenu.classList.remove('hidden');
  stats.classList.add('hidden');
  gameControls.classList.add('hidden');
  gameContainer.innerHTML = '';
  attempts = 0;
  matches = 0;
  attemptsSpan.textContent = attempts;
  matchesSpan.textContent = matches;
}

function handleDifficultySelection(cardCount) {
  jokerEnabled = jokerCheckbox.checked;

  if(cardCount === 'all'){
    startGame('all');
  } else {
    startGame(cardCount);
  }
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

// Event Listeners
startButton.addEventListener('click', () => {
  showDifficultyMenu();
});

backGameButton.addEventListener('click', () => {
  showMenu();
  hideVictoryModal();
});

resetGameButton.addEventListener('click', () => {
  const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
  
  if (selectedDifficulty === 'easy') handleDifficultySelection(4);
  else if (selectedDifficulty === 'medium') handleDifficultySelection(8);
  else if (selectedDifficulty === 'hard') handleDifficultySelection('all');
  else if (selectedDifficulty === 'personalized') handlePersonalizedSelection();
});

startDifficultyButton.addEventListener('click', () => {
  const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;

  if (selectedDifficulty === 'easy') handleDifficultySelection(4);
  else if (selectedDifficulty === 'medium') handleDifficultySelection(8);
  else if (selectedDifficulty === 'hard') handleDifficultySelection('all');
  else if (selectedDifficulty === 'personalized') handlePersonalizedSelection();
});

document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
  radio.addEventListener('change', handleDifficultyChange);
});

closeModalBtn.addEventListener('click', () => {
  hideVictoryModal();
  showMenu();
});