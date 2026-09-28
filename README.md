const gameArea = document.getElementById('gameArea');
const timeLeftEl = document.getElementById('timeLeft');
const balloonLeftEl = document.getElementById('balloonLeft');
const messageEl = document.getElementById('message');

const totalBalloons = 9;
const timeLimit = 10;
let remainingTime = timeLimit;
let balloonsPopped = 0;
let timerId = null;

function createBalloon() {
  const balloon = document.createElement('button');
  balloon.className = 'balloon';
  balloon.type = 'button';
  balloon.setAttribute('aria-label', '풍선 터뜨리기');

  const x = Math.random() * (gameArea.clientWidth - 90);
  const y = Math.random() * (gameArea.clientHeight - 120);

  balloon.style.left = `${x}px`;
  balloon.style.top = `${y}px`;

  balloon.addEventListener('click', () => {
    if (balloon.classList.contains('burst')) return;

    balloon.classList.add('burst');
    balloonsPopped += 1;
    balloonLeftEl.textContent = String(totalBalloons - balloonsPopped);

    setTimeout(() => balloon.remove(), 150);

    if (balloonsPopped === totalBalloons) {
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
    clearInterval(timerId);
    gameArea.querySelectorAll('.balloon').forEach((balloon) => balloon.remove());
    messageEl.textContent = '시간 초과!';
    messageEl.classList.remove('hidden');
  }
}

function startGame() {
  gameArea.innerHTML = '';
  messageEl.classList.add('hidden');
  messageEl.textContent = '오빠 사랑해';
  remainingTime = timeLimit;
  balloonsPopped = 0;
  timeLeftEl.textContent = String(remainingTime);
  balloonLeftEl.textContent = String(totalBalloons);

  for (let i = 0; i < totalBalloons; i += 1) {
    createBalloon();
  }

  clearInterval(timerId);
  timerId = setInterval(updateTimer, 1000);
}

startGame();
window.addEventListener('resize', () => {
  if (gameArea.querySelectorAll('.balloon').length > 0) {
    gameArea.querySelectorAll('.balloon').forEach((balloon) => {
      const left = parseFloat(balloon.style.left || '0');
      const top = parseFloat(balloon.style.top || '0');

      balloon.style.left = `${Math.min(left, gameArea.clientWidth - 90)}px`;
      balloon.style.top = `${Math.min(top, gameArea.clientHeight - 120)}px`;
    });
  }
});


