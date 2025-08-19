// Background music and sound effects manager
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.backgroundMusic = null;
        this.isMusicPlaying = false;
        this.musicVolume = 0.1;
        this.effectsVolume = 0.3;
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    createBackgroundMusic() {
        if (!this.audioContext) return;

        // Create oscillators for a more interesting melody
        const oscillators = [];
        const frequencies = [440, 554.37, 659.25]; // A4, C#5, E5
        
        frequencies.forEach(freq => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            
            gain.gain.setValueAtTime(this.musicVolume / frequencies.length, this.audioContext.currentTime);
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            oscillators.push({ oscillator: osc, gainNode: gain });
        });

        return oscillators;
    }

    toggleBackgroundMusic() {
        if (!this.audioContext) return;

        if (!this.backgroundMusic) {
            this.backgroundMusic = this.createBackgroundMusic();
            this.backgroundMusic.forEach(osc => osc.oscillator.start());
            this.isMusicPlaying = true;
        } else {
            this.backgroundMusic.forEach(osc => {
                if (this.isMusicPlaying) {
                    osc.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                } else {
                    osc.gainNode.gain.setValueAtTime(
                        this.musicVolume / this.backgroundMusic.length,
                        this.audioContext.currentTime
                    );
                }
            });
            this.isMusicPlaying = !this.isMusicPlaying;
        }
    }

    playSound(type) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        switch (type) {
            case 'dot':
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(this.effectsVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;

            case 'powerPellet':
                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                oscillator.type = 'square';
                gainNode.gain.setValueAtTime(this.effectsVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.3);
                break;

            case 'eatGhost':
                oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
                oscillator.type = 'triangle';
                gainNode.gain.setValueAtTime(this.effectsVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.5);
                break;

            case 'death':
                oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(this.effectsVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.0);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 1.0);
                break;

            case 'levelComplete':
                this.playLevelCompleteSound();
                break;
        }
    }

    playLevelCompleteSound() {
        if (!this.audioContext) return;

        const frequencies = [1000, 1200, 1400];
        let delay = 0;

        frequencies.forEach(freq => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + delay);
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(this.effectsVolume, this.audioContext.currentTime + delay);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + delay + 0.2);

            oscillator.start(this.audioContext.currentTime + delay);
            oscillator.stop(this.audioContext.currentTime + delay + 0.2);

            delay += 0.2;
        });
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic && this.isMusicPlaying) {
            this.backgroundMusic.forEach(osc => {
                osc.gainNode.gain.setValueAtTime(
                    this.musicVolume / this.backgroundMusic.length,
                    this.audioContext.currentTime
                );
            });
        }
    }

    setEffectsVolume(volume) {
        this.effectsVolume = Math.max(0, Math.min(1, volume));
    }
}

// Create global audio manager instance
const audioManager = new AudioManager();
