const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load sound effects
const jumpSound = new Audio('wing.ogg'); // Replace with your jump sound file
const gameOverSound = new Audio('die.ogg'); // Replace with your game over sound file

// Set canvas to fullscreen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => {
    resizeCanvas();
    if (!gameStarted) {
        cinnamoroll.y = canvas.height / 2;
        draw(); // redraw on resize when not playing
    }
});

const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const tutorialScreen = document.getElementById('tutorialScreen');
const tutorialBtn = document.getElementById('tutorialBtn');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreEl = document.getElementById('finalScore');
const refreshBtn = document.getElementById('refreshBtn');
const exitBtn = document.getElementById('exitBtn');

// Game variables
const cinnamoroll = { x: 80, y: window.innerHeight / 2, width: 60, height: 45 };
let pipes = [];
const pipeWidth = 60;
const gap = 150; // Pipe gap
const pipeSpeed = 2.5;
const gravity = 0.5;
const jumpStrength = -10;
let velocityY = 0;
let score = 0;
let gameOver = false;
let gameStarted = false;
let skipTutorial = false; // Flag to skip tutorial after restart from game over
let animationFrameId;

// Load images
const cinnamorollImage = new Image();
const backgroundImage = new Image();

cinnamorollImage.src = 'icon cinnamoroll.png'; // Replace with your image path
backgroundImage.src = 'backgroundimk.jpeg'; // Replace with your image path

// Wait for images loaded to allow start screen display
let imagesLoaded = 0;
const totalImages = 2;
cinnamorollImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        showStartScreen();
    }
};
backgroundImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        showStartScreen();
    }
};

function showStartScreen() {
    // Show start screen only if images loaded and no gameplay active
    if (!gameStarted) {
        startScreen.style.display = 'block';
    }
}

function resetGame() {
    cinnamoroll.y = canvas.height / 2;
    velocityY = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    gameStarted = false;
    gameOverScreen.style.display = 'none';
}

function spawnPipe() {
    const maxPipeTopHeight = canvas.height - gap - 150;
    const topHeight = Math.floor(Math.random() * (maxPipeTopHeight - 50 + 1)) + 50;
    const bottomY = topHeight + gap;
    const bottomHeight = canvas.height - bottomY - 100;
    pipes.push({
        x: canvas.width,
        topY: 0,
        topHeight: topHeight,
        bottomY: bottomY,
        bottomHeight: bottomHeight,
        passed: false,
    });
}

function drawBackground() {
    // Move background with pipes
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawCinnamoroll() {
    ctx.drawImage(cinnamorollImage, cinnamoroll.x, cinnamoroll.y, cinnamoroll.width, cinnamoroll.height);
}

function drawPipes() {
    ctx.fillStyle = 'lightblue'; // Customize pipe color
    pipes.forEach(pipe => {
        drawPipe(pipe.x, pipe.topY, pipeWidth, pipe.topHeight, true);
        drawPipe(pipe.x, pipe.bottomY, pipeWidth, pipe.bottomHeight, false);
    });
}

function drawPipe(x, y, width, height, isTop) {
    ctx.fillRect(x, y, width, height);
}

function drawGround() {
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 10);
}

function checkCollision() {
    if (cinnamoroll.y + cinnamoroll.height > canvas.height - 100 || cinnamoroll.y < 0) {
        return true;
    }
    for (let pipe of pipes) {
        if (cinnamoroll.x + cinnamoroll.width > pipe.x && cinnamoroll.x < pipe.x + pipeWidth) {
            if (cinnamoroll.y < pipe.topHeight) return true;
            if (cinnamoroll.y + cinnamoroll.height > pipe.bottomY) return true;
        }
    }
    return false;
}

function update() {
    if (gameOver) {
        cancelAnimationFrame(animationFrameId);
        return;
    }

    if (gameStarted) {
        velocityY += gravity;
        cinnamoroll.y += velocityY;

        for (let i = 0; i < pipes.length; i++) {
            pipes[i].x -= pipeSpeed;

            if (!pipes[i].passed && pipes[i].x + pipeWidth < cinnamoroll.x) {
                pipes[i].passed = true;
                score++;
            }

            if (pipes[i].x + pipeWidth < 0) {
                pipes.splice(i, 1);
                i--;
            }
        }

        if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
            spawnPipe();
        }
    }

    if (checkCollision()) {
        gameOver = true;
        finalScoreEl.textContent = score;
        gameOverSound.play(); // Play game over sound
        gameOverScreen.style.display = 'block';
    }

    draw();
    animationFrameId = requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawPipes();
    drawGround();
    drawCinnamoroll();

    if (gameStarted) { // Show score only during the game
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 7;
        ctx.fillText(score, canvas.width / 2, 60);
        ctx.shadowBlur = 0;
    }
}

function jump() {
    if (gameOver) return;
    if (!gameStarted) {
        gameStarted = true;
        tutorialScreen.style.display = 'none';
    }
    velocityY = jumpStrength;
    jumpSound.play(); // Play jump sound
}

document.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        jump();
    }
});

canvas.addEventListener('click', () => {
    jump();
});

startBtn.addEventListener('click', () => {
    startScreen.style.display = 'none';
    if (skipTutorial) {
        resetGame();
        update();
    } else {
        tutorialScreen.style.display = 'block';
    }
});

tutorialBtn.addEventListener('click', () => {
    tutorialScreen.style.display = 'none';
    resetGame();
    update();
});

refreshBtn.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    skipTutorial = true; // Skip tutorial on next start
    resetGame(); // Reset game state
    update(); // Start the game immediately
});

exitBtn.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    skipTutorial = false;
    startScreen.style.display = 'block'; // Show start screen when exiting
});
