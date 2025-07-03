// Jogo da Memória com Carta Coringa (Completo)

const gameContainer = document.getElementById('game');
const attemptsSpan = document.getElementById('attempts');
const matchesSpan = document.getElementById('matches');

const startSound = document.getElementById('startSound');
const matchSound = document.getElementById('matchSound');
const startButton = document.getElementById('startButton');

const jokerTypes = ['Classic', 'Vandal', 'Operator'];
let selectedJoker = jokerTypes[Math.floor(Math.random() * jokerTypes.length)];

let jokerCard = {
  displayName: 'Coringa',
  displayIcon: '', // Definido no startGame
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
  "Waylay": "sounds/Waylay.mpeg"
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

async function fetchWeapons() {
  const res = await fetch('https://valorant-api.com/v1/weapons');
  const data = await res.json();
  return data.data.map(weapon => ({
    name: weapon.displayName,
    icon: weapon.displayIcon
  }));
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
    img.classList.add('joker-img'); // classe exclusiva para coringa (armas)
  } else {
    img.classList.add('agent-img'); // classe para agentes
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
    } else {
      matchSound.play();
    }

    firstCard.style.pointerEvents = 'none';
    secondCard.style.pointerEvents = 'none';

    resetBoard();

    if (matches === cards.length / 2) {
      setTimeout(() => alert('Parabéns! Você encontrou todos os pares!'), 500);
    }
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

async function startGame() {
  startSound.currentTime = 0;
  startSound.play();

  selectedJoker = jokerTypes[Math.floor(Math.random() * jokerTypes.length)];

  const weapons = await fetchWeapons();
  const classic = weapons.find(w => w.name === 'Classic');
  const vandal = weapons.find(w => w.name === 'Vandal');
  const operator = weapons.find(w => w.name === 'Operator');

  if (selectedJoker === 'Classic' && classic) {
    jokerCard.displayIcon = classic.icon;
  } else if (selectedJoker === 'Vandal' && vandal) {
    jokerCard.displayIcon = vandal.icon;
  } else if (selectedJoker === 'Operator' && operator) {
    jokerCard.displayIcon = operator.icon;
  }

  jokerCard.jokerType = selectedJoker;

  const agents = await fetchAgents();
  const selectedAgents = shuffleArray(agents);

  cards = [...selectedAgents, ...selectedAgents];
  cards.push(jokerCard);
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

  if (matches === cards.length / 2) {
    setTimeout(() => alert('Parabéns! Você encontrou todos os pares!'), 500);
  }
}

startButton.addEventListener('click', () => {
  startGame();
});
