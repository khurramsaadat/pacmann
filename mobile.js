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

// Create fullscreen button
const fullscreenButton = document.createElement('button');
fullscreenButton.className = 'fullscreen-button';
fullscreenButton.innerHTML = '📱 Play Fullscreen';
document.body.appendChild(fullscreenButton);

// Handle fullscreen changes
function toggleFullscreen() {
    const gameContainer = document.querySelector('.game-container');
    
    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (fullscreenAPI.enter) {
            fullscreenAPI.enter.call(gameContainer);
            gameContainer.classList.add('fullscreen');
            
            // Try to lock orientation
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(() => {
                    // Silently fail if orientation lock is not supported
                });
            }
        }
    } else {
        // Exit fullscreen
        if (fullscreenAPI.exit) {
            fullscreenAPI.exit.call(document);
            gameContainer.classList.remove('fullscreen');
        }
    }
}

// Update button visibility
function updateFullscreenButton() {
    fullscreenButton.style.display = document.fullscreenElement ? 'none' : 'block';
}

// Event listeners for fullscreen changes
document.addEventListener('fullscreenchange', updateFullscreenButton);
document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
document.addEventListener('mozfullscreenchange', updateFullscreenButton);
document.addEventListener('MSFullscreenChange', updateFullscreenButton);

// Handle fullscreen button click
fullscreenButton.addEventListener('click', toggleFullscreen);

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

// Initial button state
updateFullscreenButton();

// Hide fullscreen button on desktop
if (!('ontouchstart' in window)) {
    fullscreenButton.style.display = 'none';
}
