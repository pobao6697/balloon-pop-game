const phrases = [
  '쟈끼이!!!',
  '잘 도착 했쯩?',
  '푹 쉬고 이쯩!!!!',
  '사랑해~~~!!',
  'i love you ~~~',
  '오늘도 고생 많아쯩!!'
];

const totalBalloons = 18;
const timeLimit = 20;
const comboTimeout = 1500;
const colors = ['#ff77b9', '#ff8c42', '#7dd3fc', '#ffd166', '#8ae98a', '#b892ff', '#ff6b6b', '#7cc0ff', '#ff9ad7'];

const startBtn = document.getElementById('startBtn');
const startScreen = document.getElementById('startScreen');
const hud = document.getElementById('hud');
const gameArea = document.getElementById('gameArea');
const timeLeftEl = document.getElementById('timeLeft');
const scoreEl = document.getElementById('score');
const floatingMessageEl = document.getElementById('floatingMessage');
const comboMessageEl = document.getElementById('comboMessage');
const finalMessageEl = document.getElementById('finalMessage');
const restartBtn = document.getElementById('restartBtn');

let remainingTime = timeLimit;
let score = 0;
let combo = 0;
let balloonsPopped = 0;
let timerId = null;
let gameFinished = false;
let audioCtx = null;
let musicInterval = null;
let comboTimer = null;

const balloonScores = [
  20, 25, 30, 35, 40, 45, 50, 55, 60,
  65, 70, 75, 80, 75, 70, 65, 60, 55
];

function ensureAudio() {
  if (!audioCtx) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    audioCtx = new AudioCtor();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  return audioCtx;
}

function playTone(frequency, duration = 0.18, volume = 0.08, type = 'triangle') {
  const ctx = ensureAudio();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

function playPopSound() {
  playTone(220, 0.12, 0.12, 'square');
  setTimeout(() => playTone(120, 0.16, 0.1, 'sawtooth'), 70);
}

function startBackgroundMusic() {
  const ctx = ensureAudio();
  if (!ctx || musicInterval) return;

  const melody = [392, 523.25, 659.25, 523.25, 587.33, 659.25, 783.99, 659.25];
  let step = 0;

  musicInterval = setInterval(() => {
    if (gameFinished) {
      clearInterval(musicInterval);
      musicInterval = null;
      return;
    }

    const note = melody[step % melody.length];
    playTone(note, 0.22, 0.045, 'triangle');
    step += 1;
  }, 430);
}

function showFloatingMessage() {
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  floatingMessageEl.textContent = phrase;
  floatingMessageEl.classList.remove('show');
  void floatingMessageEl.offsetWidth;
  floatingMessageEl.classList.add('show');
}

function updateComboDisplay() {
  if (combo > 0) {
    comboMessageEl.textContent = `COMBO x${combo}!`;
    comboMessageEl.classList.remove('hidden');
  } else {
    comboMessageEl.classList.add('hidden');
  }
}

function resetCombo() {
  combo = 0;
  updateComboDisplay();
}

function increaseCombo() {
  combo += 1;
  updateComboDisplay();

  if (comboTimer) clearTimeout(comboTimer);
  comboTimer = setTimeout(() => {
    resetCombo();
  }, comboTimeout);
}

function makeBalloon() {
  const balloon = document.createElement('button');
  balloon.type = 'button';
  balloon.className = 'balloon';
  balloon.setAttribute('aria-label', '풍선 터뜨리기');

  const size = 70 + Math.random() * 28;
  const x = Math.random() * Math.max(10, gameArea.clientWidth - size - 20);
  const y = Math.random() * Math.max(20, gameArea.clientHeight - size - 40);

  const color = colors[Math.floor(Math.random() * colors.length)];
  const balloonIndex = balloonsPopped;
  const balloonPoints = balloonScores[balloonIndex % balloonScores.length];

  balloon.style.width = `${size}px`;
  balloon.style.height = `${size + 20}px`;
  balloon.style.left = `${x}px`;
  balloon.style.top = `${y}px`;
  balloon.style.background = `radial-gradient(circle at 35% 25%, #ffffff 0%, #fefefe 12%, ${color} 36%, ${color} 72%, #d14d95 100%)`;
  balloon.style.setProperty('--wind-offset', `${Math.random() * 40 - 20}px`);
  balloon.style.setProperty('--float-duration', `${3.2 + Math.random() * 1.2}s`);
  balloon.style.setProperty('--string-wave', `${Math.random() * 6 - 3}px`);

  const handlePop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (gameFinished || balloon.classList.contains('burst')) return;

    ensureAudio();
    startBackgroundMusic();
    playPopSound();
    showFloatingMessage();

    balloon.classList.add('burst');
    balloonsPopped += 1;

    increaseCombo();

    let finalPoints = balloonPoints;
    if (combo > 1) {
      finalPoints = Math.floor(balloonPoints * (1 + combo * 0.1));
    }

    score += finalPoints;
    scoreEl.textContent = String(score);

    setTimeout(() => balloon.remove(), 320);

    if (balloonsPopped >= totalBalloons) {
      finishGame();
    }
  };

  balloon.addEventListener('click', handlePop);
  balloon.addEventListener('touchend', handlePop, { passive: false });
  balloon.addEventListener('pointerdown', handlePop);

  gameArea.appendChild(balloon);
}

function updateTimer() {
  remainingTime -= 1;
  timeLeftEl.textContent = String(Math.max(0, remainingTime));

  if (remainingTime <= 0) {
    clearInterval(timerId);
    gameFinished = true;
    finalMessageEl.innerHTML = '<div class="score-line">미 ' + score + '점</div>';
    finalMessageEl.classList.remove('hidden');
    restartBtn.classList.remove('hidden');
    gameArea.innerHTML = '';
    comboMessageEl.classList.add('hidden');
    if (musicInterval) {
      clearInterval(musicInterval);
      musicInterval = null;
    }
    if (comboTimer) {
      clearTimeout(comboTimer);
    }
  }
}

function finishGame() {
  if (gameFinished) return;

  clearInterval(timerId);
  gameFinished = true;
  gameArea.innerHTML = '';
  finalMessageEl.innerHTML = '<div class="score-line">미 ' + score + '점</div>';
  finalMessageEl.classList.remove('hidden');
  restartBtn.classList.remove('hidden');
  comboMessageEl.classList.add('hidden');

  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  if (comboTimer) {
    clearTimeout(comboTimer);
  }
}

function startGame() {
  startScreen.classList.add('hidden');
  hud.classList.remove('hidden');
  gameArea.classList.remove('hidden');

  gameArea.innerHTML = '';
  finalMessageEl.classList.add('hidden');
  restartBtn.classList.add('hidden');
  comboMessageEl.classList.add('hidden');
  remainingTime = timeLimit;
  score = 0;
  combo = 0;
  balloonsPopped = 0;
  gameFinished = false;
  timeLeftEl.textContent = String(remainingTime);
  scoreEl.textContent = String(score);
  updateComboDisplay();

  for (let i = 0; i < totalBalloons; i += 1) {
    makeBalloon();
  }

  if (timerId) clearInterval(timerId);
  timerId = setInterval(updateTimer, 1000);
}

startBtn.addEventListener('click', () => {
  ensureAudio();
  startGame();
});

startBtn.addEventListener('touchend', (event) => {
  event.preventDefault();
  ensureAudio();
  startGame();
}, { passive: false });

restartBtn.addEventListener('click', () => {
  startGame();
});

restartBtn.addEventListener('touchend', (event) => {
  event.preventDefault();
  startGame();
}, { passive: false });

window.addEventListener('pointerdown', () => {
  ensureAudio();
});
