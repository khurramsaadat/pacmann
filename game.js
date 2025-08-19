// Your existing game.js code...

// Update the handleInput function to better handle mobile touch events
function handleInput() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let lastTouchEnd = 0;

    // Handle keyboard controls
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case ' ':
                e.preventDefault();
                if (gameState === 'start') {
                    startGame();
                }
                break;
            case 'Escape':
                e.preventDefault();
                if (gameState === 'playing') {
                    gameState = 'paused';
                    document.getElementById('pauseScreen').style.display = 'block';
                }
                break;
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
        }
    });

    // Prevent double tap zoom
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    });

    // Handle touch events
    document.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = Date.now();

        // Handle game start
        if (gameState === 'start') {
            startGame();
            e.preventDefault();
            return;
        }

        // Handle pause with two-finger tap
        if (e.touches.length === 2 && gameState === 'playing') {
            gameState = 'paused';
            document.getElementById('pauseScreen').style.display = 'block';
            e.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (document.fullscreenElement || gameState === 'playing') {
            e.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        if (gameState !== 'playing') return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        const touchDuration = Date.now() - touchStartTime;

        // Only process quick swipes
        if (touchDuration <= 300) {
            const swipeThreshold = 30;
            const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

            if (isHorizontalSwipe && Math.abs(deltaX) > swipeThreshold) {
                pacman.nextDirection = deltaX > 0 ? 0 : 2; // Right or Left
                e.preventDefault();
            } else if (!isHorizontalSwipe && Math.abs(deltaY) > swipeThreshold) {
                pacman.nextDirection = deltaY > 0 ? 1 : 3; // Down or Up
                e.preventDefault();
            }
        }
    }, { passive: false });
}

// Rest of your existing game.js code...