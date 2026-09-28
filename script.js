const gameArea = document.getElementById('gameArea');
const timeLeftEl = document.getElementById('timeLeft');
const balloonLeftEl = document.getElementById('balloonLeft');
const messageEl = document.getElementById('message');

const totalBalloons = 9;
const timeLimit = 10;
let remainingTime = timeLimit;
let balloonsPopped = 0;
let timerId = null;
let gameFinished = false;

function createBalloon() {
  const balloon = document.createElement('button');
  balloon.className = 'balloon';
  balloon.type = 'button';
  balloon.setAttribute('aria-label', '풍선 터뜨리기');

  const maxX = Math.max(0, gameArea.clientWidth - 90);
  const maxY = Math.max(0, gameArea.clientHeight - 120);
  balloon.style.left = `${Math.random() * maxX}px`;
  balloon.style.top = `${Math.random() * maxY}px`;

  balloon.addEventListener('click', () => {
    if (gameFinished || balloon.classList.contains('burst')) return;

    balloon.classList.add('burst');
    balloonsPopped += 1;
    balloonLeftEl.textContent = String(totalBalloons - balloonsPopped);
    setTimeout(() => balloon.remove(), 150);

    if (balloonsPopped === totalBalloons) {
      gameFinished = true;
      clearInterval(timerId);
      messageEl.classList.remove('hidden');
      gameArea.innerHTML = '';
    }
  });

  gameArea.appendChild(balloon);
}

function updateTimer() {
  remainingTime -= 1;
  timeLeftEl.textContent = String(remainingTime);

  if (remainingTime <= 0) {
    gameFinished = true;
    clearInterval(timerId);
    gameArea.innerHTML = '';
    messageEl.textContent = '시간 초과!';
    messageEl.classList.remove('hidden');
  }
}

function startGame() {
  gameArea.innerHTML = '';
  messageEl.textContent = '오빠 사랑해';
  messageEl.classList.add('hidden');
  remainingTime = timeLimit;
  balloonsPopped = 0;
  gameFinished = false;
  timeLeftEl.textContent = String(remainingTime);
  balloonLeftEl.textContent = String(totalBalloons);

  for (let i = 0; i < totalBalloons; i += 1) createBalloon();

  clearInterval(timerId);
  timerId = setInterval(updateTimer, 1000);
}

startGame();
