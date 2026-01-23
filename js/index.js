// Landing page functionality
class LandingPage {
    constructor() {
        this.audioSystem = audioSystem;
        this.utils = utils;
        this.themeSystem = themeSystem;
        
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.nextTrackBtn = document.getElementById('nextTrackBtn');
        this.muteBtn = document.getElementById('muteBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.currentTrackElement = document.getElementById('currentTrack');
        this.themeToggleBtn = document.getElementById('themeToggle');
        this.particlesContainer = document.getElementById('particles');
        
        this.init();
    }
    
    init() {
        // Initialize audio
        this.initAudio();
        
        // Initialize theme
        this.initTheme();
        
        // Initialize particles
        this.initParticles();
        
        // Initialize animations
        this.initAnimations();
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Start ambient music
        this.startAmbientMusic();
    }
    
    initAudio() {
        // Set up audio controls
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }
        
        if (this.nextTrackBtn) {
            this.nextTrackBtn.addEventListener('click', () => this.nextTrack());
        }
        
        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => this.toggleMute());
        }
        
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => this.changeVolume(e.target.value));
        }
        
        // Update UI based on audio state
        this.audioSystem.addEventListener('trackchange', (data) => this.updateTrackInfo(data.track));
        this.audioSystem.addEventListener('mutechange', (data) => this.updateMuteButton(data.muted));
        this.audioSystem.addEventListener('volumechange', (data) => this.updateVolumeSlider(data.volume));
        
        // Update initial UI state
        this.updatePlayPauseButton();
        this.updateMuteButton(this.audioSystem.isMuted);
        this.updateVolumeSlider(this.audioSystem.volume);
    }
    
    initTheme() {
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.themeSystem.toggleTheme());
        }
    }
    
    initParticles() {
        if (this.particlesContainer) {
            this.utils.createParticles(this.particlesContainer, 80);
        }
    }
    
    initAnimations() {
        // Animate title lines
        const titleLines = document.querySelectorAll('.title-line');
        titleLines.forEach((line, index) => {
            line.style.animationDelay = `${index * 0.2 + 0.1}s`;
        });
        
        // Animate features
        const features = document.querySelectorAll('.feature');
        features.forEach((feature, index) => {
            feature.style.animationDelay = `${index * 0.1 + 0.6}s`;
        });
        
        // Animate instructions
        const instructions = document.querySelectorAll('.instruction');
        instructions.forEach((instruction, index) => {
            instruction.style.animationDelay = `${index * 0.1 + 0.8}s`;
        });
        
        // Initialize card preview animation
        const previewCard = document.querySelector('.preview-card-inner');
        if (previewCard) {
            // Add mouse move tilt effect
            previewCard.addEventListener('mousemove', (e) => {
                const card = e.currentTarget;
                const cardRect = card.getBoundingClientRect();
                const centerX = cardRect.left + cardRect.width / 2;
                const centerY = cardRect.top + cardRect.height / 2;
                
                const rotateY = (e.clientX - centerX) / 50;
                const rotateX = (centerY - e.clientY) / 50;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
            });
            
            previewCard.addEventListener('mouseleave', () => {
                previewCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            });
        }
    }
    
    initEventListeners() {
        // Update track info periodically
        setInterval(() => this.updateCurrentTime(), 1000);
        
        // Handle page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause audio when page is hidden
                this.audioSystem.pause();
            } else {
                // Resume audio when page is visible
                this.audioSystem.resume();
            }
        });
    }
    
    startAmbientMusic() {
        // Start playing random tracks
        setTimeout(() => {
            this.audioSystem.playRandomTrack();
        }, 1000);
    }
    
    togglePlayPause() {
        if (this.audioSystem.isPlaying) {
            this.audioSystem.pause();
        } else {
            this.audioSystem.resume();
        }
        
        this.updatePlayPauseButton();
    }
    
    nextTrack() {
        this.audioSystem.nextTrack();
    }
    
    toggleMute() {
        const isMuted = this.audioSystem.toggleMute();
        this.updateMuteButton(isMuted);
    }
    
    changeVolume(value) {
        const volume = parseInt(value) / 100;
        this.audioSystem.setVolume(volume);
    }
    
    updatePlayPauseButton() {
        if (!this.playPauseBtn) return;
        
        const icon = this.playPauseBtn.querySelector('i');
        if (icon) {
            icon.className = this.audioSystem.isPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
    }
    
    updateMuteButton(isMuted) {
        if (!this.muteBtn) return;
        
        const icon = this.muteBtn.querySelector('i');
        if (icon) {
            icon.className = isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
        }
    }
    
    updateVolumeSlider(volume) {
        if (!this.volumeSlider) return;
        
        this.volumeSlider.value = Math.round(volume * 100);
    }
    
    updateTrackInfo(trackUrl) {
        if (!this.currentTrackElement || !trackUrl) return;
        
        // Extract track name from URL
        const trackName = trackUrl.split('/').pop().replace('.mp3', '').replace('music', 'Ambient Track ');
        this.currentTrackElement.textContent = trackName;
    }
    
    updateCurrentTime() {
        // Could be used to show current time/duration if needed
    }
}

// Initialize landing page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LandingPage();
});