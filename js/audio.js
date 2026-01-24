// Audio management system - FIXED VERSION
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
    this.currentTrackName = "No track";

    // Mobile detection and interaction tracking
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.userInteracted = false;
    this.autoStartAttempted = false;
    this.interactionListenersAdded = false;

    // Get audio element
    this.audioElement = document.getElementById("backgroundMusic") || 
                       document.getElementById("cardMusic") || 
                       document.querySelector("audio") || 
                       document.createElement("audio");

    this.audioElement.crossOrigin = "anonymous";
    this.audioElement.loop = false;
    this.audioElement.preload = "auto";

    console.log("AudioSystem created. Mobile:", this.isMobile);
  }

  init() {
    console.log("AudioSystem initializing...");

    // Try to load saved interaction state
    const savedInteraction = localStorage.getItem("audioInteraction");
    if (savedInteraction === "true") {
      this.userInteracted = true;
      console.log("Loaded saved interaction state: true");
    }

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
        console.warn("AudioContext not supported, using HTML5 audio only:", error);
      }
    }

    // Event listeners for audio element
    this.audioElement.addEventListener("ended", () => this.onTrackEnd());
    this.audioElement.addEventListener("error", (e) => this.onAudioError(e));
    this.audioElement.addEventListener("canplaythrough", () => {
      console.log("Audio can play through");
    });

    // Setup interaction listeners - ONCE only
    if (!this.interactionListenersAdded) {
      this.setupInteractionListeners();
      this.interactionListenersAdded = true;
    }

    // Load saved volume
    this.loadVolume();

    // Try to start audio if we have interaction
    this.attemptAutoStart();

    console.log("AudioSystem initialized. Mobile:", this.isMobile, "Interacted:", this.userInteracted);
  }

  setupInteractionListeners() {
    console.log("Setting up interaction listeners...");

    const resumeOnInteraction = (event) => {
      console.log("User interaction detected:", event.type);

      if (!this.userInteracted) {
        this.userInteracted = true;
        localStorage.setItem("audioInteraction", "true");

        // Resume audio context if suspended
        this.resumeAudioContext();

        // Start playing if not already
        setTimeout(() => {
          if (!this.isPlaying && !this.currentTrack) {
            console.log("Starting music after interaction...");
            this.playRandomTrack();
          }
        }, 300);

        // Remove mobile overlay if it exists
        const overlay = document.querySelector(".mobile-audio-overlay");
        if (overlay) {
          overlay.classList.add("hidden");
          setTimeout(() => {
            if (overlay.parentNode) {
              overlay.parentNode.removeChild(overlay);
            }
          }, 300);
        }
      }
    };

    // Add event listeners for user interaction
    // Use capture phase to ensure we catch the events
    const options = { capture: true, passive: true };

    document.addEventListener("click", resumeOnInteraction, options);
    document.addEventListener("keydown", resumeOnInteraction, options);
    document.addEventListener("touchstart", resumeOnInteraction, options);
    document.addEventListener("mousedown", resumeOnInteraction, options);

    // Also listen to specific play buttons
    document.addEventListener("click", (e) => {
      if (e.target.closest("#playPauseBtn, #cardPlayPause, .music-btn")) {
        resumeOnInteraction(e);
      }
    }, options);
  }

  setupMobileInteraction() {
    // Only show if not already interacted and on mobile
    if (this.userInteracted || !this.isMobile) return;

    // Check if overlay already exists
    if (document.querySelector(".mobile-audio-overlay")) return;

    console.log("Setting up mobile interaction overlay...");

    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "mobile-audio-overlay";
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
    document.getElementById("enableAudioBtn").addEventListener("click", (e) => {
      console.log("Enable audio button clicked");
      e.stopPropagation();
      this.userInteracted = true;
      localStorage.setItem("audioInteraction", "true");
      overlay.classList.add("hidden");

      // Resume audio context
      this.resumeAudioContext();

      // Start playing
      setTimeout(() => {
        if (!this.isPlaying) {
          this.playRandomTrack();
        }
      }, 500);
    });

    // Also enable on overlay click
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        console.log("Overlay clicked");
        this.userInteracted = true;
        localStorage.setItem("audioInteraction", "true");
        overlay.classList.add("hidden");
        this.resumeAudioContext();
      }
    });
  }

  attemptAutoStart() {
    if (this.autoStartAttempted) return;
    this.autoStartAttempted = true;

    // Don't auto-start on mobile without interaction
    if (this.isMobile && !this.userInteracted) {
      console.log("Mobile device - waiting for user interaction");
      setTimeout(() => {
        if (!this.userInteracted && !document.querySelector(".mobile-audio-overlay")) {
          this.setupMobileInteraction();
        }
      }, 1000);
      return;
    }

    // On desktop or with interaction, try to start
    if (this.userInteracted && !this.isPlaying && !this.currentTrack) {
      console.log("Attempting auto-start...");
      setTimeout(() => {
        this.playRandomTrack();
      }, 1000);
    }
  }

  setupAudioElement() {
    if (!this.audioContext || !this.audioElement) return;

    // Create media element source
    try {
      this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
      this.sourceNode.connect(this.gainNode);
    } catch (error) {
      console.warn("Could not create media element source:", error);
    }
  }

  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume()
        .then(() => {
          console.log("AudioContext resumed successfully");
        })
        .catch((error) => {
          console.warn("Error resuming AudioContext:", error);
        });
    }
  }

  // Get random track from available music
  getRandomTrack() {
    const tracks = [
      { url: "assets/music/music1.mp3", name: "About You" },
      { url: "assets/music/music2.mp3", name: "Digital Dreams" },
      { url: "assets/music/music3.mp3", name: "Echoes of Memory" },
      { url: "assets/music/music4.mp3", name: "Neon Reflections" },
      { url: "assets/music/music5.mp3", name: "Silent Code" },
      { url: "assets/music/music6.mp3", name: "Data Stream" },
      { url: "assets/music/music7.mp3", name: "Virtual Horizon" },
      { url: "assets/music/music8.mp3", name: "Cyber Lullaby" },
      { url: "assets/music/music9.mp3", name: "Binary Waves" },
      { url: "assets/music/music10.mp3", name: "Digital Oasis" }
    ];

    // Filter out tracks from history to avoid repeats
    const availableTracks = tracks.filter(track => 
      !this.trackHistory.includes(track.url)
    );

    // If all tracks have been played recently, clear history
    if (availableTracks.length === 0) {
      this.trackHistory = [];
      availableTracks.push(...tracks);
    }

    // Select random track
    const randomIndex = Math.floor(Math.random() * availableTracks.length);
    const selectedTrack = availableTracks[randomIndex];

    // Add to history
    this.trackHistory.push(selectedTrack.url);
    if (this.trackHistory.length > this.maxHistory) {
      this.trackHistory.shift();
    }

    return selectedTrack;
  }

  // Play random track with fade in
  async playRandomTrack() {
    console.log("playRandomTrack called. User interacted:", this.userInteracted);

    // Check if mobile and no user interaction
    if (this.isMobile && !this.userInteracted) {
      console.log("Waiting for user interaction on mobile");
      const track = this.getRandomTrack();
      this.currentTrack = track.url;
      this.currentTrackName = track.name;
      this.audioElement.src = track.url;

      // Show mobile overlay if not already shown
      if (!document.querySelector(".mobile-audio-overlay")) {
        this.setupMobileInteraction();
      }

      return false;
    }

    // Ensure user has interacted
    if (!this.userInteracted) {
      console.log("No user interaction yet, cannot play");
      return false;
    }

    const track = this.getRandomTrack();
    return await this.playTrack(track.url, track.name, true);
  }

  // Play specific track with custom name
  async playTrack(trackUrl, trackName = null, fadeIn = true) {
    console.log("Playing track:", trackUrl, "with name:", trackName, "User interacted:", this.userInteracted);

    if (this.currentTrack === trackUrl && this.isPlaying) {
      console.log("Track already playing");
      return true;
    }

    // Check if mobile and no user interaction
    if (this.isMobile && !this.userInteracted) {
      console.log("Waiting for user interaction on mobile before playing:", trackUrl);
      this.currentTrack = trackUrl;
      this.currentTrackName = trackName || this.extractTrackName(trackUrl);
      this.audioElement.src = trackUrl;

      // Show mobile overlay if not already shown
      if (!document.querySelector(".mobile-audio-overlay")) {
        this.setupMobileInteraction();
      }

      return false;
    }

    // Ensure user has interacted
    if (!this.userInteracted) {
      console.log("No user interaction, cannot play track");
      this.currentTrack = trackUrl;
      this.currentTrackName = trackName || this.extractTrackName(trackUrl);
      this.audioElement.src = trackUrl;
      return false;
    }

    try {
      // Fade out current track if playing
      if (this.isPlaying) {
        await this.fadeOut();
      }

      // Set new track
      this.currentTrack = trackUrl;
      this.currentTrackName = trackName || this.extractTrackName(trackUrl);
      this.audioElement.src = trackUrl;

      // Load the new track
      this.audioElement.load();

      // Wait for canplaythrough with timeout
      const playPromise = new Promise((resolve, reject) => {
        const canPlayHandler = () => {
          this.audioElement.removeEventListener("canplaythrough", canPlayHandler);
          console.log("Track can play through:", trackUrl);
          resolve();
        };

        const errorHandler = () => {
          this.audioElement.removeEventListener("error", errorHandler);
          reject(new Error("Audio load error"));
        };

        this.audioElement.addEventListener("canplaythrough", canPlayHandler);
        this.audioElement.addEventListener("error", errorHandler);

        // Fallback timeout
        setTimeout(() => {
          this.audioElement.removeEventListener("canplaythrough", canPlayHandler);
          this.audioElement.removeEventListener("error", errorHandler);
          console.log("Track load timeout, attempting to play anyway");
          resolve();
        }, 2000);
      });

      await playPromise;

      // Play with fade in
      if (fadeIn) {
        await this.fadeIn();
      } else {
        this.setVolumeDirect(this.volume);
        await this.audioElement.play();
        this.isPlaying = true;
      }

      // Dispatch custom event
      this.dispatchEvent("trackchange", { 
        track: trackUrl, 
        name: this.currentTrackName 
      });

      console.log("Track playing successfully:", trackUrl, "Name:", this.currentTrackName);
      return true;
    } catch (error) {
      console.error("Error playing track:", error);
      this.dispatchEvent("error", { error });

      // If it's an autoplay error, setup interaction
      if (error.name === "NotAllowedError") {
        console.log("Autoplay prevented, waiting for interaction");
        if (this.isMobile) {
          this.setupMobileInteraction();
        }
      }

      return false;
    }
  }

  // Extract track name from URL
  extractTrackName(trackUrl) {
    if (!trackUrl) return "Unknown Track";
    
    const filename = trackUrl.split("/").pop().replace(".mp3", "");
    
    // Handle theme songs
    if (trackUrl.includes("-theme")) {
      return filename.replace("-theme", " Theme").replace(/_/g, " ");
    }
    
    // Handle ambient tracks
    if (filename.startsWith("music")) {
      const trackNum = filename.replace("music", "");
      const trackNames = {
        "1": "Atmospheric Journey",
        "2": "Digital Dreams",
        "3": "Echoes of Memory",
        "4": "Neon Reflections",
        "5": "Silent Code",
        "6": "Data Stream",
        "7": "Virtual Horizon",
        "8": "Cyber Lullaby",
        "9": "Binary Waves",
        "10": "Digital Oasis"
      };
      return trackNames[trackNum] || `Ambient Track ${trackNum}`;
    }
    
    // Default: format filename nicely
    return filename
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase());
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
        console.error("Error in simple fadeIn:", error);
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
      console.error("Error in AudioContext fadeIn:", error);
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
    this.currentTrackName = "No track";
    this.dispatchEvent("stop");
  }

  // Pause playback
  pause() {
    if (!this.isPlaying) return;

    this.audioElement.pause();
    this.isPlaying = false;
    this.dispatchEvent("pause");
  }

  // Resume playback
  async resume() {
    console.log("Resume called. isPlaying:", this.isPlaying, "hasTrack:", !!this.currentTrack);

    if (this.isPlaying || !this.currentTrack) return;

    try {
      // Check for mobile interaction
      if (this.isMobile && !this.userInteracted) {
        console.log("Mobile device needs interaction");
        this.setupMobileInteraction();
        return;
      }

      // Ensure user has interacted
      if (!this.userInteracted) {
        console.log("No user interaction, cannot resume");
        return;
      }

      await this.audioElement.play();
      this.isPlaying = true;
      this.dispatchEvent("resume");
      console.log("Playback resumed successfully");
    } catch (error) {
      console.error("Error resuming playback:", error);

      // If it's an autoplay error on mobile
      if (error.name === "NotAllowedError") {
        console.log("Autoplay prevented");
        if (this.isMobile) {
          this.setupMobileInteraction();
        }
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
    localStorage.setItem("audioVolume", this.volume.toString());

    this.dispatchEvent("volumechange", { volume: this.volume });
  }

  // Toggle mute
  toggleMute() {
    this.isMuted = !this.isMuted;

    if (this.gainNode) {
      this.gainNode.gain.value = this.isMuted ? 0 : this.volume;
    } else {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }

    this.dispatchEvent("mutechange", { muted: this.isMuted });

    return this.isMuted;
  }

  // Skip to next track
  async nextTrack() {
    await this.playRandomTrack();
  }

  // Get current track info
  getCurrentTrackInfo() {
    return {
      url: this.currentTrack,
      name: this.currentTrackName,
      isPlaying: this.isPlaying
    };
  }

  // Event handling
  onTrackEnd() {
    this.isPlaying = false;
    this.dispatchEvent("trackend", { 
      track: this.currentTrack,
      name: this.currentTrackName 
    });

    // Auto-play next track after a delay
    setTimeout(() => {
      if (!this.isPlaying && this.userInteracted) {
        this.playRandomTrack();
      }
    }, 1000);
  }

  onAudioError(event) {
    console.error("Audio error:", event);
    this.dispatchEvent("error", { error: event });

    // Try next track on error after delay
    setTimeout(() => {
      if (!this.isPlaying && this.userInteracted) {
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

    this.eventListeners[event].forEach((callback) => {
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
    const savedVolume = localStorage.getItem("audioVolume");
    if (savedVolume !== null) {
      this.setVolume(parseFloat(savedVolume));
    }
  }

  // Get formatted time
  formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  // Check if audio is supported
  isAudioSupported() {
    return !!this.audioElement.canPlayType;
  }

  // Clean up resources
  destroy() {
    this.stop();

    if (this.audioContext) {
      this.audioContext.close();
    }

    // Remove event listeners
    this.audioElement.removeEventListener("ended", this.onTrackEnd);
    this.audioElement.removeEventListener("error", this.onAudioError);

    // Clear all event listeners
    this.eventListeners = {};
  }
}

// Create global instance
const audioSystem = new AudioSystem();

// Initialize audio system when page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded - initializing audio system...");
  // Small delay to ensure everything is loaded
  setTimeout(() => {
    audioSystem.init();
  }, 500);
});

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = audioSystem;
}