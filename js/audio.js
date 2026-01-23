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
        
        // Mobile detection and interaction tracking
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.userInteracted = false;
        
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
            try {
                this.audioContext = new AudioContextClass();
                
                // Create gain node for volume control
                this.gainNode = this.audioContext.createGain();
                this.gainNode.connect(this.audioContext.destination);
                this.gainNode.gain.value = this.volume;
                
                this.setupAudioElement();
            } catch (error) {
                console.warn('AudioContext not supported, using HTML5 audio only:', error);
            }
        }
        
        // Event listeners
        this.audioElement.addEventListener('ended', () => this.onTrackEnd());
        this.audioElement.addEventListener('error', (e) => this.onAudioError(e));
        
        // Resume audio context on user interaction
        this.setupInteractionListeners();
        
        // Setup mobile interaction overlay if needed
        if (this.isMobile && !this.userInteracted) {
            setTimeout(() => this.setupMobileInteraction(), 1000);
        }
    }
    
    setupInteractionListeners() {
        const resumeOnInteraction = () => {
            this.userInteracted = true;
            this.resumeAudioContext();
            
            // Start playing if we have a track waiting
            if (this.currentTrack && !this.isPlaying) {
                this.resume();
            }
            
            // Remove overlay if it exists
            const overlay = document.querySelector('.mobile-audio-overlay');
            if (overlay) {
                overlay.classList.add('hidden');
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                }, 300);
            }
        };
        
        // Multiple interaction types
        document.addEventListener('click', resumeOnInteraction);
        document.addEventListener('keydown', resumeOnInteraction);
        document.addEventListener('touchstart', resumeOnInteraction);
        
        // Also resume on play button click specifically
        const playButtons = document.querySelectorAll('#playPauseBtn, #cardPlayPause, .music-btn');
        playButtons.forEach(btn => {
            btn.addEventListener('click', resumeOnInteraction);
        });
    }
    
    setupMobileInteraction() {
        // Only show if not already interacted and on mobile
        if (this.userInteracted || !this.isMobile) return;
        
        // Check if overlay already exists
        if (document.querySelector('.mobile-audio-overlay')) return;
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-audio-overlay';
        overlay.innerHTML = `
            <div class="mobile-audio-prompt">
                <i class="fas fa-music"></i>
                <h3>Tap to Enable Audio</h3>
                <p>Mobile browsers require user interaction to play audio. Tap anywhere to enable music.</p>
                <button id="enableAudioBtn" class="btn-primary">
                    <i class="fas fa-play"></i>
                    <span>Enable Audio</span>
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Enable audio on button click
        document.getElementById('enableAudioBtn').addEventListener('click', () => {
            this.userInteracted = true;
            overlay.classList.add('hidden');
            
            // Resume audio context
            this.resumeAudioContext();
            
            // Start playing
            if (this.currentTrack) {
                this.resume();
            } else {
                this.playRandomTrack();
            }
        });
        
        // Also enable on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.userInteracted = true;
                overlay.classList.add('hidden');
                this.resumeAudioContext();
            }
        });
    }
    
    setupAudioElement() {
        if (!this.audioContext || !this.audioElement) return;
        
        // Create media element source
        try {
            this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
            this.sourceNode.connect(this.gainNode);
        } catch (error) {
            console.warn('Could not create media element source:', error);
        }
    }
    
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('AudioContext resumed successfully');
            }).catch(error => {
                console.warn('Error resuming AudioContext:', error);
            });
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
        
        // Check if mobile and no user interaction
        if (this.isMobile && !this.userInteracted) {
            console.log('Waiting for user interaction on mobile before playing:', trackUrl);
            this.currentTrack = trackUrl;
            this.audioElement.src = trackUrl;
            
            // Show mobile overlay if not already shown
            if (!document.querySelector('.mobile-audio-overlay')) {
                this.setupMobileInteraction();
            }
            
            return;
        }
        
        try {
            // Fade out current track if playing
            if (this.isPlaying) {
                await this.fadeOut();
            }
            
            // Set new track
            this.currentTrack = trackUrl;
            this.audioElement.src = trackUrl;
            
            // Load the new track
            this.audioElement.load();
            
            // Wait for canplaythrough
            await new Promise((resolve) => {
                const canPlayHandler = () => {
                    this.audioElement.removeEventListener('canplaythrough', canPlayHandler);
                    resolve();
                };
                this.audioElement.addEventListener('canplaythrough', canPlayHandler);
                
                // Fallback timeout
                setTimeout(resolve, 1000);
            });
            
            // Play with fade in
            if (fadeIn) {
                await this.fadeIn();
            } else {
                this.setVolumeDirect(this.volume);
                await this.audioElement.play();
                this.isPlaying = true;
            }
            
            // Dispatch custom event
            this.dispatchEvent('trackchange', { track: trackUrl });
            
            return true;
        } catch (error) {
            console.error('Error playing track:', error);
            this.dispatchEvent('error', { error });
            
            // If it's an autoplay error on mobile, setup interaction
            if (error.name === 'NotAllowedError' && this.isMobile) {
                this.setupMobileInteraction();
            }
            
            return false;
        }
    }
    
    // Fade in volume
    async fadeIn() {
        // For mobile without AudioContext
        if (!this.audioContext) {
            try {
                this.audioElement.volume = 0;
                await this.audioElement.play();
                this.isPlaying = true;
                
                // Simple fade in
                let volume = 0;
                const fadeInterval = setInterval(() => {
                    volume += 0.05;
                    this.audioElement.volume = Math.min(volume, this.volume);
                    
                    if (volume >= this.volume) {
                        clearInterval(fadeInterval);
                    }
                }, 50);
                
                return;
            } catch (error) {
                console.error('Error in simple fadeIn:', error);
                throw error;
            }
        }
        
        // With AudioContext
        try {
            this.gainNode.gain.value = 0;
            await this.audioElement.play();
            this.isPlaying = true;
            
            const currentTime = this.audioContext.currentTime;
            this.gainNode.gain.setValueAtTime(0, currentTime);
            this.gainNode.gain.linearRampToValueAtTime(
                this.volume,
                currentTime + this.fadeDuration / 1000
            );
        } catch (error) {
            console.error('Error in AudioContext fadeIn:', error);
            throw error;
        }
    }
    
    // Fade out volume
    async fadeOut() {
        if (!this.isPlaying) return;
        
        return new Promise((resolve) => {
            // Simple fade out for non-AudioContext
            if (!this.audioContext) {
                let volume = this.audioElement.volume;
                const fadeInterval = setInterval(() => {
                    volume -= 0.05;
                    this.audioElement.volume = Math.max(volume, 0);
                    
                    if (volume <= 0) {
                        clearInterval(fadeInterval);
                        this.audioElement.pause();
                        this.isPlaying = false;
                        resolve();
                    }
                }, 50);
                return;
            }
            
            // With AudioContext
            const currentTime = this.audioContext.currentTime;
            this.gainNode.gain.setValueAtTime(this.volume, currentTime);
            this.gainNode.gain.linearRampToValueAtTime(
                0,
                currentTime + this.fadeDuration / 1000
            );
            
            setTimeout(() => {
                this.audioElement.pause();
                this.isPlaying = false;
                resolve();
            }, this.fadeDuration);
        });
    }
    
    // Set volume directly (without animation)
    setVolumeDirect(value) {
        if (this.gainNode) {
            this.gainNode.gain.value = value;
        } else {
            this.audioElement.volume = value;
        }
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
        
        this.dispatchEvent('pause');
    }
    
    // Resume playback
    async resume() {
        if (this.isPlaying || !this.currentTrack) return;
        
        try {
            // Check for mobile interaction
            if (this.isMobile && !this.userInteracted) {
                this.setupMobileInteraction();
                return;
            }
            
            await this.audioElement.play();
            this.isPlaying = true;
            this.dispatchEvent('resume');
        } catch (error) {
            console.error('Error resuming playback:', error);
            
            // If it's an autoplay error on mobile
            if (error.name === 'NotAllowedError' && this.isMobile) {
                this.setupMobileInteraction();
            }
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
        
        // Auto-play next track after a delay
        setTimeout(() => {
            if (!this.isPlaying) {
                this.playRandomTrack();
            }
        }, 1000);
    }
    
    onAudioError(event) {
        console.error('Audio error:', event);
        this.dispatchEvent('error', { error: event });
        
        // Try next track on error after delay
        setTimeout(() => {
            if (!this.isPlaying) {
                this.playRandomTrack();
            }
        }, 2000);
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
    
    // Check if audio is supported
    isAudioSupported() {
        return !!this.audioElement.canPlayType;
    }
    
    // Get supported audio formats
    getSupportedFormats() {
        const formats = ['mp3', 'ogg', 'wav', 'aac'];
        const supported = [];
        
        formats.forEach(format => {
            const mimeType = `audio/${format}`;
            if (this.audioElement.canPlayType(mimeType) !== '') {
                supported.push(format);
            }
        });
        
        return supported;
    }
    
    // Clean up resources
    destroy() {
        this.stop();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        // Remove event listeners
        this.audioElement.removeEventListener('ended', this.onTrackEnd);
        this.audioElement.removeEventListener('error', this.onAudioError);
        
        // Clear all event listeners
        this.eventListeners = {};
    }
}

// Create global instance
const audioSystem = new AudioSystem();

// Initialize audio system when page loads
document.addEventListener('DOMContentLoaded', () => {
    audioSystem.loadVolume();
    
    // Check if we need to show mobile overlay
    if (audioSystem.isMobile && !audioSystem.userInteracted) {
        // Wait a bit then show overlay if still no interaction
        setTimeout(() => {
            if (!audioSystem.userInteracted && !document.querySelector('.mobile-audio-overlay')) {
                audioSystem.setupMobileInteraction();
            }
        }, 2000);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = audioSystem;
}