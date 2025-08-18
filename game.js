// Game constants
const CELL_SIZE = 32;
const MAZE_WIDTH = 25;
const MAZE_HEIGHT = 21;

// Game elements
const WALL = 1;
const DOT = 2;
const POWER_PELLET = 3;
const EMPTY = 0;
const PACMAN = 4;
const GHOST = 5;

// Game state
let gameState = 'start'; // 'start', 'playing', 'paused', 'gameOver'
let score = 0;
let lives = 3;
let level = 1;
let dotsRemaining = 0;
let powerPelletTimer = 0;
let powerPelletActive = false;
let gameSpeed = 150; // milliseconds between moves
let lastMoveTime = 0;

// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Audio context for sound effects
let audioContext;
let sounds = {};

// Particle system
let particles = [];

// Maze layout (1 = wall, 2 = dot, 3 = power pellet, 0 = empty)
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,3,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,1,1,1,1,0,1,0,1,1,1,1,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,0,1,1,0,0,0,0,0,1,1,0,1,2,1,1,1,1,1],
    [0,0,0,0,0,2,0,0,1,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0],
    [1,1,1,1,1,2,1,0,1,0,0,0,0,0,0,0,1,0,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,0,1,1,1,1,1,1,1,1,1,0,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,0,0,0,0,0,0,0,0,0,0,0,1,2,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,2,1],
    [1,3,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,3,1],
    [1,1,1,2,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,2,1,1,1],
    [1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Game objects
let pacman = {
    x: 12,
    y: 15,
    direction: 0, // 0: right, 1: down, 2: left, 3: up
    nextDirection: 0,
    animFrame: 0,
    mouthOpen: true
};

let ghosts = [
    { x: 12, y: 9, direction: 0, color: '#ff0000', mode: 'scatter', target: {x: 23, y: 1} },
    { x: 11, y: 9, direction: 2, color: '#ffb8ff', mode: 'scatter', target: {x: 1, y: 1} },
    { x: 13, y: 9, direction: 0, color: '#00ffff', mode: 'scatter', target: {x: 23, y: 19} },
    { x: 12, y: 10, direction: 3, color: '#ffb852', mode: 'scatter', target: {x: 1, y: 19} }
];

// Direction vectors
const directions = [
    { x: 1, y: 0 },  // right
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
    { x: 0, y: -1 }  // up
];

// Initialize audio
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

// Create sound effect
function createSound(frequency, duration, type = 'sine') {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Play sound effects
function playSound(soundType) {
    switch (soundType) {
        case 'dot':
            createSound(800, 0.1);
            break;
        case 'powerPellet':
            createSound(400, 0.3);
            break;
        case 'eatGhost':
            createSound(600, 0.5);
            break;
        case 'death':
            createSound(200, 1.0, 'sawtooth');
            break;
        case 'levelComplete':
            createSound(1000, 0.2);
            setTimeout(() => createSound(1200, 0.2), 200);
            setTimeout(() => createSound(1400, 0.2), 400);
            break;
    }
}

// Particle class
class Particle {
    constructor(x, y, color, velocity) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = velocity;
        this.life = 1.0;
        this.decay = 0.02;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.life -= this.decay;
        this.velocity.x *= 0.98;
        this.velocity.y *= 0.98;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

// Create particles
function createParticles(x, y, color, count = 5) {
    for (let i = 0; i < count; i++) {
        const velocity = {
            x: (Math.random() - 0.5) * 4,
            y: (Math.random() - 0.5) * 4
        };
        particles.push(new Particle(x, y, color, velocity));
    }
}

// Update particles
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
}

// Draw particles
function drawParticles() {
    particles.forEach(particle => particle.draw());
}

// Scale canvas for different screen sizes
function scaleCanvas() {
    const container = document.querySelector('.game-container');
    const containerWidth = container.clientWidth;
    const containerHeight = window.innerHeight - 100; // Leave space for UI

    const canvasAspectRatio = canvas.width / canvas.height;
    const containerAspectRatio = containerWidth / containerHeight;

    let scale;
    if (containerAspectRatio > canvasAspectRatio) {
        scale = containerHeight / canvas.height;
    } else {
        scale = containerWidth / canvas.width;
    }

    scale = Math.min(scale, 1); // Don't scale up beyond original size

    canvas.style.width = (canvas.width * scale) + 'px';
    canvas.style.height = (canvas.height * scale) + 'px';
}

// Initialize game
function initGame() {
    // Count dots
    dotsRemaining = 0;
    for (let y = 0; y < MAZE_HEIGHT; y++) {
        for (let x = 0; x < MAZE_WIDTH; x++) {
            if (maze[y][x] === DOT || maze[y][x] === POWER_PELLET) {
                dotsRemaining++;
            }
        }
    }

    // Reset game state
    score = 0;
    lives = 3;
    level = 1;
    gameState = 'start';
    powerPelletActive = false;
    powerPelletTimer = 0;
    gameSpeed = 150;
    particles = [];

    // Reset pacman position
    pacman.x = 12;
    pacman.y = 15;
    pacman.direction = 0;
    pacman.nextDirection = 0;

    // Scale canvas for screen size
    scaleCanvas();

    updateUI();
}

// Update UI elements
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
    document.getElementById('finalScore').textContent = score;
}

// Start game
function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    gameState = 'playing';
    gameLoop();
}

// Restart game
function restartGame() {
    document.getElementById('gameOverScreen').style.display = 'none';
    initGame();
    startGame();
}

// Resume game
function resumeGame() {
    document.getElementById('pauseScreen').style.display = 'none';
    gameState = 'playing';
}

// Check if position is valid (not a wall)
function isValidPosition(x, y) {
    if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) {
        return false;
    }
    return maze[y][x] !== WALL;
}

// Draw maze
function drawMaze() {
    ctx.fillStyle = '#0000ff';
    ctx.strokeStyle = '#0000ff';
    ctx.lineWidth = 2;
    
    for (let y = 0; y < MAZE_HEIGHT; y++) {
        for (let x = 0; x < MAZE_WIDTH; x++) {
            const cellX = x * CELL_SIZE;
            const cellY = y * CELL_SIZE;
            
            switch (maze[y][x]) {
                case WALL:
                    ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
                    break;
                case DOT:
                    ctx.fillStyle = '#ffff00';
                    ctx.beginPath();
                    ctx.arc(cellX + CELL_SIZE/2, cellY + CELL_SIZE/2, 3, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case POWER_PELLET:
                    ctx.fillStyle = '#ffff00';
                    ctx.beginPath();
                    ctx.arc(cellX + CELL_SIZE/2, cellY + CELL_SIZE/2, 8, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
        }
    }
}

// Draw ghosts
function drawGhosts() {
    ghosts.forEach(ghost => {
        const x = ghost.x * CELL_SIZE + CELL_SIZE / 2;
        const y = ghost.y * CELL_SIZE + CELL_SIZE / 2;
        const radius = CELL_SIZE / 2 - 3;

        // Ghost body
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        ctx.arc(x, y - 2, radius, Math.PI, 0);
        ctx.rect(x - radius, y - 2, radius * 2, radius + 2);
        ctx.fill();

        // Ghost bottom wavy part
        ctx.beginPath();
        ctx.moveTo(x - radius, y + radius);
        for (let i = 0; i < 4; i++) {
            const waveX = x - radius + (i * radius / 2);
            const waveY = y + radius + (i % 2 === 0 ? -3 : 0);
            ctx.lineTo(waveX, waveY);
        }
        ctx.lineTo(x + radius, y + radius);
        ctx.lineTo(x + radius, y - 2);
        ctx.fill();

        // Ghost eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - 6, y - 6, 4, 0, Math.PI * 2);
        ctx.arc(x + 6, y - 6, 4, 0, Math.PI * 2);
        ctx.fill();

        // Eye pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        const pupilOffsetX = ghost.direction === 0 ? 2 : ghost.direction === 2 ? -2 : 0;
        const pupilOffsetY = ghost.direction === 1 ? 2 : ghost.direction === 3 ? -2 : 0;
        ctx.arc(x - 6 + pupilOffsetX, y - 6 + pupilOffsetY, 2, 0, Math.PI * 2);
        ctx.arc(x + 6 + pupilOffsetX, y - 6 + pupilOffsetY, 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Calculate distance between two points
function getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Get valid directions for a ghost at given position
function getValidDirections(x, y, currentDirection) {
    const validDirs = [];
    const oppositeDir = (currentDirection + 2) % 4;

    for (let i = 0; i < 4; i++) {
        if (i === oppositeDir) continue; // Don't reverse unless necessary

        const dir = directions[i];
        const newX = x + dir.x;
        const newY = y + dir.y;

        if (isValidPosition(newX, newY)) {
            validDirs.push(i);
        }
    }

    return validDirs;
}

// Move ghosts with AI
function moveGhosts() {
    ghosts.forEach(ghost => {
        const validDirs = getValidDirections(ghost.x, ghost.y, ghost.direction);

        if (validDirs.length === 0) {
            // Reverse if no valid directions
            ghost.direction = (ghost.direction + 2) % 4;
        } else if (validDirs.length === 1) {
            // Only one choice
            ghost.direction = validDirs[0];
        } else {
            // Choose direction based on AI mode
            let targetX, targetY;

            switch (ghost.mode) {
                case 'chase':
                    targetX = pacman.x;
                    targetY = pacman.y;
                    break;
                case 'scatter':
                    targetX = ghost.target.x;
                    targetY = ghost.target.y;
                    break;
                case 'frightened':
                    // Random movement when frightened
                    ghost.direction = validDirs[Math.floor(Math.random() * validDirs.length)];
                    break;
            }

            if (ghost.mode !== 'frightened') {
                // Find direction that gets closest to target
                let bestDir = ghost.direction;
                let bestDistance = Infinity;

                validDirs.forEach(dir => {
                    const dirVector = directions[dir];
                    const newX = ghost.x + dirVector.x;
                    const newY = ghost.y + dirVector.y;
                    const distance = getDistance(newX, newY, targetX, targetY);

                    if (distance < bestDistance) {
                        bestDistance = distance;
                        bestDir = dir;
                    }
                });

                ghost.direction = bestDir;
            }
        }

        // Move ghost
        const dir = directions[ghost.direction];
        const newX = ghost.x + dir.x;
        const newY = ghost.y + dir.y;

        if (isValidPosition(newX, newY)) {
            ghost.x = newX;
            ghost.y = newY;

            // Handle tunnel
            if (ghost.x < 0) ghost.x = MAZE_WIDTH - 1;
            if (ghost.x >= MAZE_WIDTH) ghost.x = 0;
        }
    });
}

// Activate power pellet effect
function activatePowerPellet() {
    powerPelletActive = true;
    powerPelletTimer = 300; // 5 seconds at 60fps

    // Make all ghosts frightened
    ghosts.forEach(ghost => {
        if (ghost.mode !== 'eaten') {
            ghost.mode = 'frightened';
            ghost.color = '#0000ff'; // Blue when frightened
            // Reverse direction
            ghost.direction = (ghost.direction + 2) % 4;
        }
    });
}

// Update power pellet timer
function updatePowerPellet() {
    if (powerPelletActive) {
        powerPelletTimer--;

        // Flash ghosts when power pellet is about to end
        if (powerPelletTimer < 60 && powerPelletTimer % 10 < 5) {
            ghosts.forEach(ghost => {
                if (ghost.mode === 'frightened') {
                    ghost.color = '#ffffff';
                }
            });
        } else if (powerPelletTimer > 0) {
            ghosts.forEach(ghost => {
                if (ghost.mode === 'frightened') {
                    ghost.color = '#0000ff';
                }
            });
        }

        if (powerPelletTimer <= 0) {
            powerPelletActive = false;
            // Reset ghost colors and modes
            ghosts[0].color = '#ff0000'; ghosts[0].mode = 'chase';
            ghosts[1].color = '#ffb8ff'; ghosts[1].mode = 'chase';
            ghosts[2].color = '#00ffff'; ghosts[2].mode = 'chase';
            ghosts[3].color = '#ffb852'; ghosts[3].mode = 'chase';
        }
    }
}

// Reset level
function resetLevel() {
    // Restore maze dots and power pellets
    const originalMaze = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,3,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,3,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,2,1],
        [1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1],
        [1,1,1,1,1,2,1,1,1,1,1,0,1,0,1,1,1,1,1,2,1,1,1,1,1],
        [0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
        [1,1,1,1,1,2,1,0,1,1,0,0,0,0,0,1,1,0,1,2,1,1,1,1,1],
        [0,0,0,0,0,2,0,0,1,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0],
        [1,1,1,1,1,2,1,0,1,0,0,0,0,0,0,0,1,0,1,2,1,1,1,1,1],
        [0,0,0,0,1,2,1,0,1,1,1,1,1,1,1,1,1,0,1,2,1,0,0,0,0],
        [1,1,1,1,1,2,1,0,0,0,0,0,0,0,0,0,0,0,1,2,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,2,1],
        [1,3,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,3,1],
        [1,1,1,2,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,2,1,1,1],
        [1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    // Copy original maze back
    for (let y = 0; y < MAZE_HEIGHT; y++) {
        for (let x = 0; x < MAZE_WIDTH; x++) {
            maze[y][x] = originalMaze[y][x];
        }
    }

    // Count dots again
    dotsRemaining = 0;
    for (let y = 0; y < MAZE_HEIGHT; y++) {
        for (let x = 0; x < MAZE_WIDTH; x++) {
            if (maze[y][x] === DOT || maze[y][x] === POWER_PELLET) {
                dotsRemaining++;
            }
        }
    }

    // Reset positions
    pacman.x = 12;
    pacman.y = 15;
    pacman.direction = 0;
    pacman.nextDirection = 0;

    ghosts[0].x = 12; ghosts[0].y = 9;
    ghosts[1].x = 11; ghosts[1].y = 9;
    ghosts[2].x = 13; ghosts[2].y = 9;
    ghosts[3].x = 12; ghosts[3].y = 10;

    // Increase game speed
    gameSpeed = Math.max(50, gameSpeed - 10);
}

// Check collision between Pacman and ghosts
function checkCollisions() {
    ghosts.forEach((ghost) => {
        if (ghost.x === pacman.x && ghost.y === pacman.y) {
            if (ghost.mode === 'frightened') {
                // Eat ghost
                score += 200;
                playSound('eatGhost');
                createParticles(ghost.x * CELL_SIZE + CELL_SIZE/2, ghost.y * CELL_SIZE + CELL_SIZE/2, ghost.color, 10);
                // Reset ghost to center
                ghost.x = 12;
                ghost.y = 9;
                ghost.mode = 'scatter';
            } else {
                // Pacman dies
                lives--;
                playSound('death');
                createParticles(pacman.x * CELL_SIZE + CELL_SIZE/2, pacman.y * CELL_SIZE + CELL_SIZE/2, '#ffff00', 15);
                if (lives > 0) {
                    // Reset positions after a delay
                    setTimeout(() => {
                        pacman.x = 12;
                        pacman.y = 15;
                        pacman.direction = 0;
                        pacman.nextDirection = 0;

                        // Reset ghosts
                        ghosts[0].x = 12; ghosts[0].y = 9;
                        ghosts[1].x = 11; ghosts[1].y = 9;
                        ghosts[2].x = 13; ghosts[2].y = 9;
                        ghosts[3].x = 12; ghosts[3].y = 10;
                    }, 1000);
                }
            }
        }
    });
}

// Draw Pacman
function drawPacman() {
    const x = pacman.x * CELL_SIZE + CELL_SIZE / 2;
    const y = pacman.y * CELL_SIZE + CELL_SIZE / 2;
    const radius = CELL_SIZE / 2 - 3;

    ctx.fillStyle = '#ffff00';
    ctx.beginPath();

    if (pacman.mouthOpen) {
        // Draw Pacman with mouth open
        const mouthAngle = Math.PI / 3; // 60 degrees
        const startAngle = pacman.direction * Math.PI / 2 - mouthAngle / 2;
        const endAngle = pacman.direction * Math.PI / 2 + mouthAngle / 2;

        ctx.arc(x, y, radius, endAngle, startAngle);
        ctx.lineTo(x, y);
    } else {
        // Draw full circle when mouth closed
        ctx.arc(x, y, radius, 0, Math.PI * 2);
    }

    ctx.fill();
}

// Move Pacman
function movePacman() {
    // Try to change direction if requested
    const nextDir = directions[pacman.nextDirection];
    const nextX = pacman.x + nextDir.x;
    const nextY = pacman.y + nextDir.y;

    if (isValidPosition(nextX, nextY)) {
        pacman.direction = pacman.nextDirection;
    }

    // Move in current direction
    const dir = directions[pacman.direction];
    const newX = pacman.x + dir.x;
    const newY = pacman.y + dir.y;

    if (isValidPosition(newX, newY)) {
        pacman.x = newX;
        pacman.y = newY;

        // Handle tunnel (wrap around)
        if (pacman.x < 0) pacman.x = MAZE_WIDTH - 1;
        if (pacman.x >= MAZE_WIDTH) pacman.x = 0;

        // Collect dots and power pellets
        if (maze[pacman.y][pacman.x] === DOT) {
            maze[pacman.y][pacman.x] = EMPTY;
            score += 10;
            dotsRemaining--;
            playSound('dot');
            createParticles(pacman.x * CELL_SIZE + CELL_SIZE/2, pacman.y * CELL_SIZE + CELL_SIZE/2, '#ffff00', 3);
        } else if (maze[pacman.y][pacman.x] === POWER_PELLET) {
            maze[pacman.y][pacman.x] = EMPTY;
            score += 50;
            dotsRemaining--;
            playSound('powerPellet');
            createParticles(pacman.x * CELL_SIZE + CELL_SIZE/2, pacman.y * CELL_SIZE + CELL_SIZE/2, '#ffff00', 8);
            activatePowerPellet();
        }

        // Animate mouth
        pacman.animFrame++;
        if (pacman.animFrame % 8 === 0) {
            pacman.mouthOpen = !pacman.mouthOpen;
        }
    }
}

// Handle keyboard input
function handleInput() {
    document.addEventListener('keydown', (e) => {
        if (gameState !== 'playing' && gameState !== 'paused') return;

        switch (e.key) {
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (gameState === 'playing') pacman.nextDirection = 0;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (gameState === 'playing') pacman.nextDirection = 1;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (gameState === 'playing') pacman.nextDirection = 2;
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (gameState === 'playing') pacman.nextDirection = 3;
                break;
            case ' ':
                e.preventDefault();
                if (gameState === 'playing') {
                    gameState = 'paused';
                    document.getElementById('pauseScreen').style.display = 'block';
                } else if (gameState === 'paused') {
                    gameState = 'playing';
                    document.getElementById('pauseScreen').style.display = 'none';
                }
                break;
        }
    });

    // Touch controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (gameState !== 'playing') return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        const minSwipeDistance = 30;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaX) > minSwipeDistance) {
                pacman.nextDirection = deltaX > 0 ? 0 : 2; // Right or Left
            }
        } else {
            // Vertical swipe
            if (Math.abs(deltaY) > minSwipeDistance) {
                pacman.nextDirection = deltaY > 0 ? 1 : 3; // Down or Up
            }
        }
    });

    // Prevent scrolling on touch
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
    });
}

// Game loop
function gameLoop(currentTime) {
    if (gameState === 'playing') {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update game logic based on timing
        if (currentTime - lastMoveTime > gameSpeed) {
            movePacman();
            moveGhosts();
            checkCollisions();
            updatePowerPellet();
            lastMoveTime = currentTime;
        }

        // Update particles
        updateParticles();

        // Draw everything
        drawMaze();
        drawPacman();
        drawGhosts();
        drawParticles();

        // Update UI
        updateUI();

        // Check win condition
        if (dotsRemaining === 0) {
            level++;
            playSound('levelComplete');
            resetLevel();
        }

        // Check game over
        if (lives <= 0) {
            gameState = 'gameOver';
            document.getElementById('gameOverScreen').style.display = 'block';
            return;
        }
    }

    requestAnimationFrame(gameLoop);
}

// Initialize the game when page loads
window.addEventListener('load', () => {
    initAudio();
    initGame();
    handleInput();
});

// Handle window resize
window.addEventListener('resize', () => {
    scaleCanvas();
});

// Prevent context menu on right click
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
