/**
 * CS2 Case Opening Simulator - Audio System
 * Handles all sound effects and audio controls
 */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.5;
        this.muted = false;
        this.sounds = {};
        
        this.initialize();
    }
    
    /**
     * Initialize audio system
     */
    async initialize() {
        // Load settings
        const savedVolume = loadFromStorage('audioVolume', 50);
        const savedMuted = loadFromStorage('audioMuted', false);
        
        this.masterVolume = savedVolume / 100;
        this.muted = savedMuted;
        
        // Initialize Web Audio API context
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported, using fallback sounds');
        }
        
        this.updateUI();
    }
    
    /**
     * Set master volume
     * @param {number} volume - Volume level (0-100)
     */
    setVolume(volume) {
        this.masterVolume = clamp(volume / 100, 0, 1);
        saveToStorage('audioVolume', volume);
        this.updateUI();
    }
    
    /**
     * Toggle mute
     * @param {boolean} muted - Mute state
     */
    setMuted(muted) {
        this.muted = muted;
        saveToStorage('audioMuted', muted);
        this.updateUI();
    }
    
    /**
     * Update UI elements
     */
    updateUI() {
        const volumeSlider = document.getElementById('masterVolume');
        const volumeValue = document.getElementById('volumeValue');
        const muteCheckbox = document.getElementById('muteAll');
        
        if (volumeSlider) volumeSlider.value = this.masterVolume * 100;
        if (volumeValue) volumeValue.textContent = `${Math.round(this.masterVolume * 100)}%`;
        if (muteCheckbox) muteCheckbox.checked = this.muted;
    }
    
    /**
     * Play a sound effect
     * @param {string} type - Sound type
     */
    play(type) {
        if (this.muted || !this.audioContext) return;
        
        switch (type) {
            case 'caseOpen':
                this.playCaseOpenSound();
                break;
            case 'spin':
                this.playSpinSound();
                break;
            case 'land':
                this.playLandSound();
                break;
            case 'rare':
                this.playRareSound();
                break;
            case 'gold':
                this.playGoldSound();
                break;
            case 'click':
                this.playClickSound();
                break;
            case 'achievement':
                this.playAchievementSound();
                break;
        }
    }
    
    /**
     * Play case opening sound
     */
    playCaseOpenSound() {
        this.playSynthesizedSound({
            frequency: 200,
            duration: 0.3,
            type: 'square',
            volume: 0.3
        });
    }
    
    /**
     * Play spinning sound
     */
    playSpinSound() {
        this.playSynthesizedSound({
            frequency: 150,
            duration: 0.1,
            type: 'triangle',
            volume: 0.2
        });
    }
    
    /**
     * Play item landing sound
     */
    playLandSound() {
        this.playSynthesizedSound({
            frequency: 300,
            duration: 0.2,
            type: 'sine',
            volume: 0.4
        });
    }
    
    /**
     * Play rare item reveal sound
     */
    playRareSound() {
        this.playSynthesizedSound({
            frequency: 600,
            duration: 0.5,
            type: 'sine',
            volume: 0.5,
            slide: true
        });
    }
    
    /**
     * Play gold item special sound
     */
    playGoldSound() {
        // Play a fanfare-like sequence
        const now = this.audioContext.currentTime;
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playSynthesizedSound({
                    frequency: freq,
                    duration: 0.4,
                    type: 'triangle',
                    volume: 0.4
                });
            }, index * 100);
        });
    }
    
    /**
     * Play click sound
     */
    playClickSound() {
        this.playSynthesizedSound({
            frequency: 800,
            duration: 0.05,
            type: 'sine',
            volume: 0.15
        });
    }
    
    /**
     * Play achievement unlock sound
     */
    playAchievementSound() {
        const now = this.audioContext.currentTime;
        const frequencies = [440, 554, 659, 880]; // A major
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playSynthesizedSound({
                    frequency: freq,
                    duration: 0.3,
                    type: 'sine',
                    volume: 0.3
                });
            }, index * 80);
        });
    }
    
    /**
     * Play synthesized sound using Web Audio API
     * @param {object} params - Sound parameters
     */
    playSynthesizedSound(params) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = params.type || 'sine';
        oscillator.frequency.setValueAtTime(params.frequency, this.audioContext.currentTime);
        
        if (params.slide) {
            oscillator.frequency.exponentialRampToValueAtTime(
                params.frequency * 1.5,
                this.audioContext.currentTime + params.duration
            );
        }
        
        gainNode.gain.setValueAtTime(params.volume * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + params.duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + params.duration);
    }
    
    /**
     * Resume audio context (needed for some browsers)
     */
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// Create global instance
const audioManager = new AudioManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioManager, audioManager };
}
