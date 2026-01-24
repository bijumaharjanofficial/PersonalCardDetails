// Landing page functionality - FIXED VERSION
class LandingPage {
  constructor() {
    this.playPauseBtn = document.getElementById("playPauseBtn");
    this.nextTrackBtn = document.getElementById("nextTrackBtn");
    this.muteBtn = document.getElementById("muteBtn");
    this.volumeSlider = document.getElementById("volumeSlider");
    this.currentTrackElement = document.getElementById("currentTrack");
    this.themeToggleBtn = document.getElementById("themeToggle");
    this.particlesContainer = document.getElementById("particles");

    this.init();
  }

  init() {
    console.log("LandingPage initializing...");

    // Initialize particles
    this.initParticles();

    // Initialize animations
    this.initAnimations();

    // Initialize event listeners
    this.initEventListeners();

    // Start ambient music with delay
    setTimeout(() => {
      this.startAmbientMusic();
    }, 2000);
  }

  initParticles() {
    if (this.particlesContainer) {
      utils.createParticles(this.particlesContainer, 80);
    }
  }

  initAnimations() {
    // Animate title lines
    const titleLines = document.querySelectorAll(".title-line");
    titleLines.forEach((line, index) => {
      line.style.animationDelay = `${index * 0.2 + 0.1}s`;
    });

    // Animate features
    const features = document.querySelectorAll(".feature");
    features.forEach((feature, index) => {
      feature.style.animationDelay = `${index * 0.1 + 0.6}s`;
    });

    // Animate instructions
    const instructions = document.querySelectorAll(".instruction");
    instructions.forEach((instruction, index) => {
      instruction.style.animationDelay = `${index * 0.1 + 0.8}s`;
    });

    // Initialize card preview animation
    const previewCard = document.querySelector(".preview-card-inner");
    if (previewCard) {
      // Add mouse move tilt effect
      previewCard.addEventListener("mousemove", (e) => {
        const card = e.currentTarget;
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;

        const rotateY = (e.clientX - centerX) / 50;
        const rotateX = (centerY - e.clientY) / 50;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
      });

      previewCard.addEventListener("mouseleave", () => {
        previewCard.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateZ(0)";
      });
    }
  }

  initEventListeners() {
    // Audio controls
    this.initAudioControls();

    // Update track info periodically
    setInterval(() => this.updateCurrentTime(), 1000);

    // Handle page visibility change
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        // Pause audio when page is hidden
        audioSystem.pause();
      } else {
        // Resume audio when page is visible
        audioSystem.resume();
      }
    });
  }

  initAudioControls() {
    console.log("Initializing audio controls...");

    // Set up audio controls
    if (this.playPauseBtn) {
      this.playPauseBtn.addEventListener("click", () => this.togglePlayPause());
    }

    if (this.nextTrackBtn) {
      this.nextTrackBtn.addEventListener("click", () => this.nextTrack());
    }

    if (this.muteBtn) {
      this.muteBtn.addEventListener("click", () => this.toggleMute());
    }

    if (this.volumeSlider) {
      this.volumeSlider.addEventListener("input", (e) => this.changeVolume(e.target.value));
      
      // Set initial volume from audio system
      this.volumeSlider.value = Math.round(audioSystem.volume * 100);
    }

    // Update UI based on audio state
    audioSystem.addEventListener("trackchange", (data) => {
      console.log("Track changed:", data.track, "Name:", data.name);
      this.updateTrackInfo(data.track, data.name);
    });
    
    audioSystem.addEventListener("mutechange", (data) => this.updateMuteButton(data.muted));
    audioSystem.addEventListener("volumechange", (data) => this.updateVolumeSlider(data.volume));
    audioSystem.addEventListener("pause", () => this.updatePlayPauseButton());
    audioSystem.addEventListener("resume", () => this.updatePlayPauseButton());

    // Update initial UI state
    this.updatePlayPauseButton();
    this.updateMuteButton(audioSystem.isMuted);
    this.updateVolumeSlider(audioSystem.volume);
  }

  startAmbientMusic() {
    console.log("Starting ambient music...");
    
    // Check audio status
    const status = utils.checkAudioStatus();
    console.log("Audio status on start:", status);
    
    // If user has already interacted in this session or saved interaction, start music
    if (audioSystem.userInteracted && !audioSystem.isPlaying) {
      console.log("User has interacted, starting music...");
      setTimeout(() => {
        audioSystem.playRandomTrack();
      }, 1000);
    } else if (!audioSystem.userInteracted) {
      console.log("Waiting for user interaction...");
      // Setup for mobile if needed
      if (audioSystem.isMobile) {
        setTimeout(() => {
          if (!audioSystem.userInteracted) {
            audioSystem.setupMobileInteraction();
          }
        }, 1500);
      }
    }
  }

  togglePlayPause() {
    console.log("Toggle play/pause clicked");

    if (audioSystem.isPlaying) {
      audioSystem.pause();
    } else {
      audioSystem.resume();
    }

    this.updatePlayPauseButton();
  }

  nextTrack() {
    console.log("Next track clicked");
    audioSystem.nextTrack();
  }

  toggleMute() {
    const isMuted = audioSystem.toggleMute();
    this.updateMuteButton(isMuted);
  }

  changeVolume(value) {
    const volume = parseInt(value) / 100;
    audioSystem.setVolume(volume);
  }

  updatePlayPauseButton() {
    if (!this.playPauseBtn) return;

    const icon = this.playPauseBtn.querySelector("i");
    if (icon) {
      icon.className = audioSystem.isPlaying ? "fas fa-pause" : "fas fa-play";
    }
  }

  updateMuteButton(isMuted) {
    if (!this.muteBtn) return;

    const icon = this.muteBtn.querySelector("i");
    if (icon) {
      icon.className = isMuted ? "fas fa-volume-mute" : "fas fa-volume-up";
    }
  }

  updateVolumeSlider(volume) {
    if (!this.volumeSlider) return;

    this.volumeSlider.value = Math.round(volume * 100);
  }

  updateTrackInfo(trackUrl, trackName = null) {
    if (!this.currentTrackElement || !trackUrl) return;

    // Use the provided track name or extract from URL
    const displayName = trackName || audioSystem.extractTrackName(trackUrl);
    this.currentTrackElement.textContent = displayName;
  }

  updateCurrentTime() {
    // Could be used to show current time/duration if needed
  }
}

// Initialize landing page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing LandingPage...");
  new LandingPage();
});