// Fullscreen API support
const fullscreenAPI = {
    enter: document.documentElement.requestFullscreen ||
           document.documentElement.webkitRequestFullscreen ||
           document.documentElement.mozRequestFullScreen ||
           document.documentElement.msRequestFullscreen,
    exit: document.exitFullscreen ||
          document.webkitExitFullscreen ||
          document.mozCancelFullScreen ||
          document.msExitFullscreen,
    element: document.fullscreenElement ||
             document.webkitFullscreenElement ||
             document.mozFullScreenElement ||
             document.msFullscreenElement,
    enabled: document.fullscreenEnabled ||
             document.webkitFullscreenEnabled ||
             document.mozFullScreenEnabled ||
             document.msFullscreenEnabled
};

// Get the fullscreen buttons
const fullscreenButton = document.querySelector('.fullscreen-button');
const exitFullscreenButton = document.querySelector('.exit-fullscreen-button');

// Make sure the buttons exist and are visible on mobile
if (fullscreenButton && exitFullscreenButton && 'ontouchstart' in window) {
    fullscreenButton.style.display = 'flex';
    exitFullscreenButton.style.display = 'none';
    
    // Add click handlers for fullscreen buttons
    fullscreenButton.addEventListener('click', toggleFullscreen);
    exitFullscreenButton.addEventListener('click', toggleFullscreen);

    // Add fullscreen change event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
}

// Handle fullscreen state changes
function handleFullscreenChange() {
    const gameContainer = document.querySelector('.game-container');
    const isFullscreen = document.fullscreenElement || 
                        document.webkitFullscreenElement || 
                        document.mozFullScreenElement || 
                        document.msFullscreenElement;

    if (isFullscreen) {
        gameContainer.classList.add('fullscreen');
        fullscreenButton.style.display = 'none';
        exitFullscreenButton.style.display = 'flex';
    } else {
        gameContainer.classList.remove('fullscreen');
        fullscreenButton.style.display = 'flex';
        exitFullscreenButton.style.display = 'none';
    }
}

// Handle fullscreen changes
async function toggleFullscreen() {
    const gameContainer = document.querySelector('.game-container');
    
    try {
        const isFullscreen = document.fullscreenElement || 
                            document.webkitFullscreenElement || 
                            document.mozFullScreenElement || 
                            document.msFullscreenElement;

        if (!isFullscreen) {
            // Enter fullscreen
            if (gameContainer.requestFullscreen) {
                await gameContainer.requestFullscreen();
            } else if (gameContainer.webkitRequestFullscreen) {
                await gameContainer.webkitRequestFullscreen();
            } else if (gameContainer.mozRequestFullScreen) {
                await gameContainer.mozRequestFullScreen();
            } else if (gameContainer.msRequestFullscreen) {
                await gameContainer.msRequestFullscreen();
            }
            
            // Try to lock orientation
            if (screen.orientation && screen.orientation.lock) {
                try {
                    await screen.orientation.lock('landscape');
                } catch (e) {
                    console.log('Orientation lock not supported');
                }
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                await document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                await document.msExitFullscreen();
            }
        }
    } catch (err) {
        console.log('Fullscreen API error:', err);
    }
}

// Remove old update function as it's replaced by handleFullscreenChange

// Prevent default touch behaviors in fullscreen

// Prevent default touch behaviors in fullscreen
document.addEventListener('touchmove', (e) => {
    if (document.fullscreenElement) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchend', (e) => {
    if (document.fullscreenElement) {
        e.preventDefault();
    }
}, { passive: false });

// Swipe gesture handling
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let touchCount = 0;

document.addEventListener('touchstart', (e) => {
    touchCount = e.touches.length;
    if (touchCount === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    } else if (touchCount === 2) {
        // Two-finger tap for pause
        if (typeof togglePause === 'function') {
            togglePause();
        }
    }
});

document.addEventListener('touchmove', (e) => {
    if (touchCount === 1) {
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
    }
});

document.addEventListener('touchend', (e) => {
    if (touchCount === 1) {
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        const minSwipeDistance = 30; // Minimum distance for swipe

        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) {
                    // Right swipe
                    if (typeof handleKeyPress === 'function') {
                        handleKeyPress({ key: 'ArrowRight' });
                    }
                } else {
                    // Left swipe
                    if (typeof handleKeyPress === 'function') {
                        handleKeyPress({ key: 'ArrowLeft' });
                    }
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(diffY) > minSwipeDistance) {
                if (diffY > 0) {
                    // Down swipe
                    if (typeof handleKeyPress === 'function') {
                        handleKeyPress({ key: 'ArrowDown' });
                    }
                } else {
                    // Up swipe
                    if (typeof handleKeyPress === 'function') {
                        handleKeyPress({ key: 'ArrowUp' });
                    }
                }
            }
        }
    }
    touchCount = 0;
});

// Single tap to start
document.addEventListener('touchend', (e) => {
    if (e.touches.length === 0 && touchCount === 1) {
        if (typeof startGame === 'function' && !gameStarted) {
            startGame();
        }
    }
});

// Initial button state
handleFullscreenChange();
