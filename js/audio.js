// Audio management system
class AudioSystem {
    constructor() {
        this.currentTrack = null;
        this.audioContext = null;
        this.gainNode = null;
        this.sourceNode = null;
        this.isPlaying = false;
        this.volume = 0.7;
        this.isMuted = false;
        this.fadeDuration = 1500; // ms
        this.trackHistory = [];
        this.maxHistory = 10;
        
        this.audioElement = document.getElementById('backgroundMusic') || 
                           document.getElementById('cardMusic') ||
                           document.createElement('audio');
        
        this.audioElement.crossOrigin = 'anonymous';
        this.audioElement.loop = false;
        
        this.init();
    }
    
    init() {
        // Create audio context if supported
        if (window.AudioContext || window.webkitAudioContext) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass();
            
            // Create gain node for volume control
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = this.volume;
            
            this.setupAudioElement();
        }
        
        // Event listeners
        this.audioElement.addEventListener('ended', () => this.onTrackEnd());
        this.audioElement.addEventListener('error', (e) => this.onAudioError(e));
        
        // Resume audio context on user interaction
        document.addEventListener('click', () => this.resumeAudioContext(), { once: true });
    }
    
    setupAudioElement() {
        if (!this.audioContext || !this.audioElement) return;
        
        // Create media element source
        this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
        this.sourceNode.connect(this.gainNode);
    }
    
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // Get random track from available music
    getRandomTrack() {
        const tracks = [];
        
        // Check for available tracks (music1.mp3 to music10.mp3)
        for (let i = 1; i <= 10; i++) {
            tracks.push(`assets/music/music${i}.mp3`);
        }
        
        // Filter out tracks from history to avoid repeats
        const availableTracks = tracks.filter(track => !this.trackHistory.includes(track));
        
        // If all tracks have been played recently, clear history
        if (availableTracks.length === 0) {
            this.trackHistory = [];
            availableTracks.push(...tracks);
        }
        
        // Select random track
        const randomIndex = Math.floor(Math.random() * availableTracks.length);
        const selectedTrack = availableTracks[randomIndex];
        
        // Add to history
        this.trackHistory.push(selectedTrack);
        if (this.trackHistory.length > this.maxHistory) {
            this.trackHistory.shift();
        }
        
        return selectedTrack;
    }
    
    // Play random track with fade in
    async playRandomTrack() {
        const track = this.getRandomTrack();
        await this.playTrack(track, true);
    }
    
    // Play specific track
    async playTrack(trackUrl, fadeIn = true) {
        if (this.currentTrack === trackUrl && this.isPlaying) return;
        
        try {
            // Fade out current track if playing
            if (this.isPlaying) {
                await this.fadeOut();
            }
            
            // Set new track
            this.currentTrack = trackUrl;
            this.audioElement.src = trackUrl;
            
            // Load the new track
            await this.audioElement.load();
            
            // Play with fade in
            if (fadeIn) {
                await this.fadeIn();
            } else {
                this.gainNode.gain.value = this.volume;
                await this.audioElement.play();
                this.isPlaying = true;
            }
            
            // Dispatch custom event
            this.dispatchEvent('trackchange', { track: trackUrl });
            
            return true;
        } catch (error) {
            console.error('Error playing track:', error);
            this.dispatchEvent('error', { error });
            return false;
        }
    }
    
    // Fade in volume
    async fadeIn() {
        if (!this.audioContext) {
            await this.audioElement.play();
            this.isPlaying = true;
            return;
        }
        
        this.gainNode.gain.value = 0;
        await this.audioElement.play();
        this.isPlaying = true;
        
        this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(
            this.volume,
            this.audioContext.currentTime + this.fadeDuration / 1000
        );
    }
    
    // Fade out volume
    async fadeOut() {
        if (!this.isPlaying || !this.audioContext) return;
        
        return new Promise((resolve) => {
            this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
            this.gainNode.gain.linearRampToValueAtTime(
                0,
                this.audioContext.currentTime + this.fadeDuration / 1000
            );
            
            setTimeout(() => {
                this.audioElement.pause();
                this.isPlaying = false;
                resolve();
            }, this.fadeDuration);
        });
    }
    
    // Stop playback
    async stop() {
        await this.fadeOut();
        this.currentTrack = null;
    }
    
    // Pause playback
    pause() {
        if (!this.isPlaying) return;
        
        this.audioElement.pause();
        this.isPlaying = false;
    }
    
    // Resume playback
    async resume() {
        if (this.isPlaying || !this.currentTrack) return;
        
        try {
            await this.audioElement.play();
            this.isPlaying = true;
        } catch (error) {
            console.error('Error resuming playback:', error);
        }
    }
    
    // Set volume (0-1)
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        
        if (this.gainNode) {
            this.gainNode.gain.value = this.volume;
        } else {
            this.audioElement.volume = this.volume;
        }
        
        // Save to localStorage
        localStorage.setItem('audioVolume', this.volume.toString());
        
        this.dispatchEvent('volumechange', { volume: this.volume });
    }
    
    // Toggle mute
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.gainNode) {
            this.gainNode.gain.value = this.isMuted ? 0 : this.volume;
        } else {
            this.audioElement.volume = this.isMuted ? 0 : this.volume;
        }
        
        this.dispatchEvent('mutechange', { muted: this.isMuted });
        
        return this.isMuted;
    }
    
    // Skip to next track
    async nextTrack() {
        await this.playRandomTrack();
    }
    
    // Event handling
    onTrackEnd() {
        this.isPlaying = false;
        this.dispatchEvent('trackend', { track: this.currentTrack });
        
        // Auto-play next track
        setTimeout(() => this.playRandomTrack(), 1000);
    }
    
    onAudioError(event) {
        console.error('Audio error:', event);
        this.dispatchEvent('error', { error: event });
        
        // Try next track on error
        setTimeout(() => this.playRandomTrack(), 2000);
    }
    
    // Event system
    eventListeners = {};
    
    addEventListener(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
    
    removeEventListener(event, callback) {
        if (!this.eventListeners[event]) return;
        
        const index = this.eventListeners[event].indexOf(callback);
        if (index > -1) {
            this.eventListeners[event].splice(index, 1);
        }
    }
    
    dispatchEvent(event, data) {
        if (!this.eventListeners[event]) return;
        
        this.eventListeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in ${event} listener:`, error);
            }
        });
    }
    
    // Get current time and duration
    getCurrentTime() {
        return this.audioElement.currentTime;
    }
    
    getDuration() {
        return this.audioElement.duration;
    }
    
    getProgress() {
        if (!this.audioElement.duration) return 0;
        return (this.audioElement.currentTime / this.audioElement.duration) * 100;
    }
    
    // Seek to specific time
    seekTo(time) {
        if (!this.audioElement.duration) return;
        
        const seekTime = Math.max(0, Math.min(time, this.audioElement.duration));
        this.audioElement.currentTime = seekTime;
    }
    
    // Load volume from localStorage
    loadVolume() {
        const savedVolume = localStorage.getItem('audioVolume');
        if (savedVolume !== null) {
            this.setVolume(parseFloat(savedVolume));
        }
    }
    
    // Get formatted time
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Create global instance
const audioSystem = new AudioSystem();

// Initialize audio system when page loads
document.addEventListener('DOMContentLoaded', () => {
    audioSystem.loadVolume();
    
    // Resume audio context on any user interaction
    const resumeOnInteraction = () => {
        audioSystem.resumeAudioContext();
        document.removeEventListener('click', resumeOnInteraction);
        document.removeEventListener('keydown', resumeOnInteraction);
        document.removeEventListener('touchstart', resumeOnInteraction);
    };
    
    document.addEventListener('click', resumeOnInteraction);
    document.addEventListener('keydown', resumeOnInteraction);
    document.addEventListener('touchstart', resumeOnInteraction);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = audioSystem;
}