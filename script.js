// DOM elements
const screens = document.querySelectorAll('.screen'); // 0:start 1:choose 2:store 3:game
const chooseInsectBtns = document.querySelectorAll('.choose-insect-btn');
const startBtn = document.getElementById('start-btn');
const gameContainer = document.getElementById('game-container');
const timeEl = document.getElementById('time');
const scoreEl = document.getElementById('score');
const message = document.getElementById('message');
const restartBtn = document.getElementById('restart-btn');
const storeBtn = document.getElementById('store-btn');

const buySwatBtn = document.getElementById('buy-swat');
const swatStatus = document.getElementById('swat-status');
const continueBtn = document.getElementById('continue-to-game');

let seconds = 0;
let score = 0;
let selectedInsect = {};
let timeInterval;
let hasSwatter = false;

// Ensure DOM elements ready for localStorage UI setup
window.addEventListener('DOMContentLoaded', () => {
    // Load swatter from cache
    if (localStorage.getItem("hasSwatter") === "true") {
        hasSwatter = true;
        swatStatus.innerHTML = "Purchased!";
        buySwatBtn.disabled = true;
    }
    // Update score display in case it's non-zero from previous sessions (we start at 0)
    scoreEl.innerHTML = `Score: ${score}`;
});

// Start button -> move start screen up to the choose screen
startBtn.addEventListener('click', () => {
    screens[0].classList.add('up');
});

// Choose insect -> move from choose screen to store screen (user can buy upgrades here)
chooseInsectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const img = btn.querySelector('img');
        selectedInsect = {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt')
        };

        // Reveal store screen by adding .up to screen index 1 (moves to screen 2)
        screens[1].classList.add('up');
    });
});

// BUY swatter button logic
buySwatBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // avoid accidental continue
    if (score >= 15) {
        score -= 15;
        scoreEl.innerHTML = `Score: ${score}`;
        hasSwatter = true;

        // Save to cache so it survives restarts
        localStorage.setItem("hasSwatter", "true");

        swatStatus.innerHTML = "Purchased!";
        buySwatBtn.disabled = true;
    } else {
        swatStatus.innerHTML = "Not enough points!";
    }
});

// CONTINUE button logic - only advances to the game screen when user chooses to
continueBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    // Move from store to game (add .up to screen index 2)
    screens[2].classList.add('up');

    // Small delay for animation, then start
    setTimeout(() => {
        startGame();
        createInsect();
    }, 500);
});

// game container click listener -> AOE when swatter is owned
gameContainer.addEventListener('click', (e) => {
    // Only when clicking on the game screen area (not UI elements)
    // If swatter is owned, run AOE handler
    if (hasSwatter) {
        handleAOE(e);
    }
});

// Starting the game timer
function startGame() {
    clearInterval(timeInterval);
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

    // insect click behavior:
    // - If player DOESN'T have swatter: clicking insect directly standard catches it (stop propagation)
    // - If player DOES have swatter: allow event to bubble so container AOE handles hits
    insect.addEventListener('click', function (e) {
        if (!hasSwatter) {
            e.stopPropagation();
            standardCatch(this);
        }
        // if hasSwatter -> do nothing here so container's AOE handles it
    });

    gameContainer.appendChild(insect);
}

function getRandomLocation() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const x = Math.random() * (width - 200) + 100;
    const y = Math.random() * (height - 200) + 100;

    return { x, y };
}

function standardCatch(insectDiv) {
    increaseScore();
    insectDiv.classList.add('caught');
    setTimeout(() => insectDiv.remove(), 1500);
    addInsects();
}

function handleAOE(e) {
    const clickX = e.clientX;
    const clickY = e.clientY;

    let hitSomething = false;

    // AOE radius
    const radius = 200;

    // Check all insects, catch any inside radius
    document.querySelectorAll('.insect').forEach(insect => {
        const rect = insect.getBoundingClientRect();
        const ix = rect.left + rect.width / 2;
        const iy = rect.top + rect.height / 2;

        const distance = Math.hypot(ix - clickX, iy - clickY);

        if (distance < radius) {
            hitSomething = true;
            // If an insect is still in the DOM, standardCatch it.
            // standardCatch will call addInsects as well.
            standardCatch(insect);
        }
    });

    // If we hit at least one insect with AOE, add extra insects once (already done in standardCatch per insect).
    // (No extra action required here)
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
        storeBtn.style.display = 'block';
    }
}

// Restart logic - DO NOT clear swatter localStorage (persisted)
restartBtn.addEventListener('click', restartGame);

// "Go to Store" from Game -> back to Store (remove the .up that moved store->game)
storeBtn.addEventListener('click', () => {
    // Hide game-over UI
    message.classList.remove('visible');
    restartBtn.style.display = 'none';
    storeBtn.style.display = 'none';

    clearInterval(timeInterval);
    document.querySelectorAll('.insect').forEach(e => e.remove());

    // Move GAME (screen 3) up (so it leaves view)
    screens[3].classList.add('up');

    // Move STORE (screen 2) down (into view)
    screens[2].classList.remove('up');
});


// restartGame resets time/score and returns to start but keeps purchased items
function restartGame() {
    seconds = 0;
    score = 0;

    timeEl.innerHTML = "Time: 00:00";
    scoreEl.innerHTML = "Score: 0";
    message.classList.remove('visible');
    restartBtn.style.display = "none";
    storeBtn.style.display = "none";

    clearInterval(timeInterval);

    document.querySelectorAll('.insect').forEach(e => e.remove());

    // Reset screens to start (remove all .up)
    screens.forEach(screen => screen.classList.remove('up'));
}
