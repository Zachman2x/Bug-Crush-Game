const screens = document.querySelectorAll('.screen');
const chooseInsectBtns = document.querySelectorAll('.choose-insect-btn');
const startBtn = document.getElementById('start-btn');
const gameContainer = document.getElementById('game-container');
const timeEl = document.getElementById('time');
const scoreEl = document.getElementById('score');
const message = document.getElementById('message');
const restartBtn = document.getElementById('restart-btn');

let seconds = 0;
let score = 0;
let selectedInsect = {};
let timeInterval;

startBtn.addEventListener('click', () => {
    screens[0].classList.add('up');
});

chooseInsectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const img = btn.querySelector('img');
        selectedInsect = {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt')
        };

        screens[1].classList.add('up');

        setTimeout(() => {
            startGame();
            createInsect();
        }, 800);
    });
});

function startGame() {
    timeInterval = setInterval(increaseTime, 1000);
}

function increaseTime() {
    let m = Math.floor(seconds / 60);
    let s = seconds % 60;

    m = m < 10 ? `0${m}` : m;
    s = s < 10 ? `0${s}` : s;

    timeEl.innerHTML = `Time: ${m}:${s}`;
    seconds++;
}

function createInsect() {
    const insect = document.createElement('div');
    insect.classList.add('insect');

    const { x, y } = getRandomLocation();
    insect.style.top = `${y}px`;
    insect.style.left = `${x}px`;

    insect.innerHTML = `
        <img src="${selectedInsect.src}" 
             alt="${selectedInsect.alt}" 
             style="transform: rotate(${Math.random() * 360}deg)" />
    `;

    insect.addEventListener('click', catchInsect);
    gameContainer.appendChild(insect);
}

function getRandomLocation() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const x = Math.random() * (width - 200) + 100;
    const y = Math.random() * (height - 200) + 100;

    return { x, y };
}

function catchInsect() {
    increaseScore();
    this.classList.add('caught');

    setTimeout(() => this.remove(), 1500);
    addInsects();
}

function addInsects() {
    setTimeout(createInsect, 700);
    setTimeout(createInsect, 1200);
}

function increaseScore() {
    score++;
    scoreEl.innerHTML = `Score: ${score}`;

    if (score > 19) {
        message.classList.add('visible');
        restartBtn.style.display = 'block';
    }
}


restartBtn.addEventListener('click', restartGame);

function restartGame() {
    // Reset variables
    seconds = 0;
    score = 0;

    timeEl.innerHTML = "Time: 00:00";
    scoreEl.innerHTML = "Score: 0";
    message.classList.remove('visible');
    restartBtn.style.display = "none";

    // Stop timer
    clearInterval(timeInterval);

    // Remove all insects
    document.querySelectorAll('.insect').forEach(e => e.remove());

    // Reset screen positions
    screens.forEach(screen => screen.classList.remove('up'));
}