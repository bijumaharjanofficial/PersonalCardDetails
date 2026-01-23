// Card detail page functionality
class CardPage {
  constructor() {
    this.utils = utils;
    this.themeSystem = themeSystem;
    this.dataSystem = dataSystem;
    this.audioSystem = audioSystem;

    // State
    this.currentCard = null;
    this.galleryImages = [];
    this.currentGalleryIndex = 0;

    // Elements
    this.lockedState = document.getElementById("lockedState");
    this.cardContent = document.getElementById("cardContent");
    this.cardGlow = document.getElementById("cardGlow");
    this.themeToggleBtn = document.getElementById("themeToggle");
    this.cardMusicElement = document.getElementById("cardMusic");
    this.cardPlayPauseBtn = document.getElementById("cardPlayPause");
    this.cardVolumeSlider = document.getElementById("cardVolume");
    this.cardTrackInfo = document.getElementById("cardTrackInfo");

    // Gallery elements
    this.gallerySection = document.getElementById("gallerySection");
    this.galleryTrack = document.getElementById("galleryTrack");
    this.galleryPrevBtn = document.getElementById("galleryPrev");
    this.galleryNextBtn = document.getElementById("galleryNext");
    this.galleryCurrent = document.getElementById("galleryCurrent");
    this.galleryTotal = document.getElementById("galleryTotal");

    this.init();
  }

  init() {
    // Initialize theme toggle
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener("click", () =>
        this.themeSystem.toggleTheme(),
      );
    }

    // Initialize audio controls
    this.initAudioControls();

    // Load and display card based on URL parameters
    this.loadCardFromURL();

    // Initialize gallery if needed
    this.initGallery();

    // Listen for data loaded event
    this.dataSystem.addEventListener("dataloaded", () =>
      this.loadCardFromURL(),
    );
  }

  initAudioControls() {
    if (this.cardPlayPauseBtn) {
      this.cardPlayPauseBtn.addEventListener("click", () =>
        this.toggleCardMusic(),
      );
    }

    if (this.cardVolumeSlider) {
      this.cardVolumeSlider.addEventListener("input", (e) => {
        const volume = parseInt(e.target.value) / 100;
        this.audioSystem.setVolume(volume);
      });
    }
  }

  loadCardFromURL() {
    const params = this.utils.getUrlParams();

    if (Object.keys(params).length === 0) {
      // No parameters, show locked state
      this.showLockedState();
      return;
    }

    // Try to find card by ID or name
    let card = null;

    if (params.id) {
      card = this.dataSystem.getCardById(params.id);
    } else if (params.name) {
      card = this.dataSystem.getCardByName(params.name);
    }

    if (card) {
      this.displayCard(card);
    } else {
      this.showLockedState();
    }
  }

  showLockedState() {
    if (this.lockedState) {
      this.lockedState.classList.remove("hidden");
    }

    if (this.cardContent) {
      this.cardContent.classList.add("hidden");
    }

    // Stop any card-specific music
    this.stopCardMusic();
  }

  async displayCard(card) {
    this.currentCard = card;

    // Hide locked state, show card content
    if (this.lockedState) {
      this.lockedState.classList.add("hidden");
    }

    if (this.cardContent) {
      this.cardContent.classList.remove("hidden");
    }

    // Set accent color from card's favorite color
    const accentColor = card.favorites?.color;
    if (accentColor && this.themeSystem.isValidColor(accentColor)) {
      this.themeSystem.setAccentColor(accentColor);
    }

    // Update glow effect
    if (this.cardGlow && accentColor) {
      this.cardGlow.style.background = `radial-gradient(circle at center, ${accentColor} 0%, transparent 70%)`;
    }

    // Render all card sections
    this.renderCoreIdentity(card);
    this.renderOfficialDetails(card);
    this.renderPersonalityTraits(card);
    this.renderLikesDislikes(card);
    this.renderFavorites(card);
    this.renderLifestyle(card);
    this.renderDigitalSocial(card);
    this.renderStoryMode(card);

    // Handle gallery
    this.setupGallery(card);

    // Handle card-specific music
    this.handleCardMusic(card);

    // Update footer info
    this.updateFooterInfo(card);

    // Animate card entrance
    this.animateCardEntrance();
  }

  renderCoreIdentity(card) {
    const identity = card.coreIdentity || {};

    // Update name
    if (identity.firstName) {
      document.getElementById("cardFirstName").textContent = identity.firstName;
    }

    if (identity.lastName) {
      document.getElementById("cardLastName").textContent =
        ` ${identity.lastName}`;
    }

    // Update nickname and username
    const nicknameEl = document.getElementById("cardNickname");
    if (identity.nickname) {
      nicknameEl.textContent = `"${identity.nickname}"`;
      nicknameEl.classList.remove("hidden");
    } else {
      nicknameEl.classList.add("hidden");
    }

    const usernameEl = document.getElementById("cardUsername");
    if (identity.username) {
      usernameEl.textContent = `@${identity.username}`;
      usernameEl.classList.remove("hidden");
    } else {
      usernameEl.classList.add("hidden");
    }

    // Update badges
    const typeBadge = document.getElementById("cardTypeBadge");
    const orgBadge = document.getElementById("cardOrgBadge");

    if (card.officialDetails?.cardType) {
      typeBadge.textContent = card.officialDetails.cardType;
      typeBadge.classList.remove("hidden");
    } else {
      typeBadge.classList.add("hidden");
    }

    if (card.officialDetails?.organization) {
      orgBadge.textContent = card.officialDetails.organization;
      orgBadge.classList.remove("hidden");
    } else {
      orgBadge.classList.add("hidden");
    }

    // Update details
    this.setDetailValue(
      "cardDob",
      identity.dateOfBirth ? this.utils.formatDate(identity.dateOfBirth) : "",
    );
    this.setDetailValue(
      "cardAge",
      identity.age ||
        (identity.dateOfBirth
          ? this.utils.calculateAge(identity.dateOfBirth)
          : ""),
    );
    this.setDetailValue("cardGender", identity.gender || "");
    this.setDetailValue("cardNationality", identity.nationality || "");
    this.setDetailValue("cardBloodGroup", identity.bloodGroup || "");

    // Update display picture
    const dpEl = document.getElementById("cardDp");
    if (card.media?.dp) {
      dpEl.src = card.media.dp;
      dpEl.alt = `${identity.firstName}'s display picture`;
    }
  }

  renderOfficialDetails(card) {
    const details = card.officialDetails || {};
    const container = document.getElementById("officialDetails");

    if (!container) return;

    container.innerHTML = "";

    const fields = [
      { key: "cardNumber", label: "Card Number", value: details.cardNumber },
      { key: "cardType", label: "Card Type", value: details.cardType },
      {
        key: "organization",
        label: "Organization",
        value: details.organization,
      },
      { key: "role", label: "Role", value: details.role },
      {
        key: "issueDate",
        label: "Issue Date",
        value: details.issueDate
          ? this.utils.formatDate(details.issueDate)
          : "",
      },
      {
        key: "expiryDate",
        label: "Expiry Date",
        value: details.expiryDate
          ? this.utils.formatDate(details.expiryDate)
          : "",
      },
    ];

    fields.forEach((field) => {
      if (field.value) {
        const item = this.utils.createElement("div", "official-item");
        item.innerHTML = `
                    <span class="official-label">${field.label}</span>
                    <span class="official-value">${field.value}</span>
                `;
        container.appendChild(item);
      }
    });
  }

  renderPersonalityTraits(card) {
    const traits = card.personalityTraits || {};
    const container = document.getElementById("personalityContent");

    if (!container) return;

    container.innerHTML = "";

    // Personality type
    if (traits.personalityType) {
      const typeItem = this.utils.createElement("div", "personality-item");
      typeItem.innerHTML = `
                <span class="personality-label">Personality Type</span>
                <div class="traits-list">
                    <span class="trait">${traits.personalityType}</span>
                </div>
            `;
      container.appendChild(typeItem);
    }

    // Strengths
    if (traits.strengths && traits.strengths.length > 0) {
      const strengthsItem = this.utils.createElement("div", "personality-item");
      strengthsItem.innerHTML = `
                <span class="personality-label">Strengths</span>
                <div class="traits-list">
                    ${traits.strengths.map((strength) => `<span class="trait strength">${strength}</span>`).join("")}
                </div>
            `;
      container.appendChild(strengthsItem);
    }

    // Weaknesses
    if (traits.weaknesses && traits.weaknesses.length > 0) {
      const weaknessesItem = this.utils.createElement(
        "div",
        "personality-item",
      );
      weaknessesItem.innerHTML = `
                <span class="personality-label">Weaknesses</span>
                <div class="traits-list">
                    ${traits.weaknesses.map((weakness) => `<span class="trait weakness">${weakness}</span>`).join("")}
                </div>
            `;
      container.appendChild(weaknessesItem);
    }

    // Habits
    if (traits.habits && traits.habits.length > 0) {
      const habitsItem = this.utils.createElement("div", "personality-item");
      habitsItem.innerHTML = `
                <span class="personality-label">Habits</span>
                <div class="traits-list">
                    ${traits.habits.map((habit) => `<span class="trait">${habit}</span>`).join("")}
                </div>
            `;
      container.appendChild(habitsItem);
    }

    // Pet peeves
    if (traits.petPeeves && traits.petPeeves.length > 0) {
      const peevesItem = this.utils.createElement("div", "personality-item");
      peevesItem.innerHTML = `
                <span class="personality-label">Pet Peeves</span>
                <div class="traits-list">
                    ${traits.petPeeves.map((peeve) => `<span class="trait">${peeve}</span>`).join("")}
                </div>
            `;
      container.appendChild(peevesItem);
    }
  }

  renderLikesDislikes(card) {
    const likesDislikes = card.likesDislikes || {};
    const container = document.getElementById("likesContent");

    if (!container) return;

    container.innerHTML = "";

    // Likes
    if (likesDislikes.likes && likesDislikes.likes.length > 0) {
      const likesGroup = this.utils.createElement("div", "likes-group");
      likesGroup.innerHTML = `
                <div class="likes-title likes">
                    <i class="fas fa-heart"></i>
                    <span>Likes</span>
                </div>
                <div class="likes-items">
                    ${likesDislikes.likes.map((like) => `<span class="like-item">${like}</span>`).join("")}
                </div>
            `;
      container.appendChild(likesGroup);
    }

    // Dislikes
    if (likesDislikes.dislikes && likesDislikes.dislikes.length > 0) {
      const dislikesGroup = this.utils.createElement("div", "dislikes-group");
      dislikesGroup.innerHTML = `
                <div class="likes-title dislikes">
                    <i class="fas fa-times-circle"></i>
                    <span>Dislikes</span>
                </div>
                <div class="likes-items">
                    ${likesDislikes.dislikes.map((dislike) => `<span class="dislike-item">${dislike}</span>`).join("")}
                </div>
            `;
      container.appendChild(dislikesGroup);
    }
  }

  renderFavorites(card) {
    const favorites = card.favorites || {};
    const container = document.getElementById("favoritesContent");

    if (!container) return;

    container.innerHTML = "";

    const favoriteFields = [
      {
        key: "musicGenre",
        label: "Music Genre",
        icon: "fas fa-music",
        value: favorites.musicGenre,
      },
      {
        key: "artist",
        label: "Artist",
        icon: "fas fa-user-music",
        value: favorites.artist,
      },
      {
        key: "songName",
        label: "Favorite Song",
        icon: "fas fa-play-circle",
        value: favorites.songName,
      },
      {
        key: "song",
        label: "Song File",
        icon: "fas fa-file-audio",
        value: favorites.song ? "✓ Has song file" : "",
      },
      {
        key: "anime",
        label: "Anime",
        icon: "fas fa-tv",
        value: favorites.anime,
      },
      {
        key: "animeCharacter",
        label: "Anime Character",
        icon: "fas fa-user-ninja",
        value: favorites.animeCharacter,
      },
      {
        key: "movieSeries",
        label: "Movie/Series",
        icon: "fas fa-film",
        value: favorites.movieSeries,
      },
      {
        key: "game",
        label: "Game",
        icon: "fas fa-gamepad",
        value: favorites.game,
      },
      {
        key: "food",
        label: "Food",
        icon: "fas fa-utensils",
        value: favorites.food,
      },
      {
        key: "drink",
        label: "Drink",
        icon: "fas fa-wine-glass-alt",
        value: favorites.drink,
      },
      {
        key: "color",
        label: "Color",
        icon: "fas fa-palette",
        value: favorites.color,
      },
      {
        key: "quote",
        label: "Quote",
        icon: "fas fa-quote-right",
        value: favorites.quote,
      },
    ];

    favoriteFields.forEach((field) => {
      if (field.value) {
        const item = this.utils.createElement("div", "favorite-item");

        let valueContent = field.value;

        // Special handling for color
        if (
          field.key === "color" &&
          this.themeSystem.isValidColor(field.value)
        ) {
          valueContent = `<div class="color-preview" style="background-color: ${field.value};"></div>`;
        }

        // Special handling for song file - show path
        if (field.key === "song" && favorites.song) {
          valueContent = `<small style="font-size: 0.8rem; opacity: 0.8;">${field.value}</small>`;
        }

        item.innerHTML = `
                <div class="favorite-icon">
                    <i class="${field.icon}"></i>
                </div>
                <span class="favorite-label">${field.label}</span>
                <div class="favorite-value">${valueContent}</div>
            `;

        container.appendChild(item);
      }
    });
  }

  renderLifestyle(card) {
    const lifestyle = card.lifestyle || {};
    const container = document.getElementById("lifestyleContent");

    if (!container) return;

    container.innerHTML = "";

    const lifestyleFields = [
      {
        key: "hobbies",
        label: "Hobbies",
        icon: "fas fa-paint-brush",
        value: lifestyle.hobbies ? lifestyle.hobbies.join(", ") : "",
      },
      {
        key: "skills",
        label: "Skills",
        icon: "fas fa-tools",
        value: lifestyle.skills ? lifestyle.skills.join(", ") : "",
      },
      {
        key: "dreamDestination",
        label: "Dream Destination",
        icon: "fas fa-globe-americas",
        value: lifestyle.dreamDestination,
      },
      {
        key: "biggestFear",
        label: "Biggest Fear",
        icon: "fas fa-ghost",
        value: lifestyle.biggestFear,
      },
      {
        key: "biggestMotivation",
        label: "Biggest Motivation",
        icon: "fas fa-rocket",
        value: lifestyle.biggestMotivation,
      },
    ];

    lifestyleFields.forEach((field) => {
      if (field.value) {
        const item = this.utils.createElement("div", "lifestyle-item");
        item.innerHTML = `
                    <div class="lifestyle-icon">
                        <i class="${field.icon}"></i>
                    </div>
                    <span class="lifestyle-label">${field.label}</span>
                    <div class="lifestyle-value">${field.value}</div>
                `;
        container.appendChild(item);
      }
    });
  }

  renderDigitalSocial(card) {
    const digital = card.digitalSocial || {};
    const container = document.getElementById("digitalContent");

    if (!container) return;

    container.innerHTML = "";

    if (digital.gamerTag) {
      const item = this.utils.createElement("div", "digital-item");
      item.innerHTML = `
                <i class="fas fa-gamepad digital-icon"></i>
                <span>Gamer Tag: ${digital.gamerTag}</span>
            `;
      container.appendChild(item);
    }

    if (digital.socialHandle) {
      const item = this.utils.createElement("div", "digital-item");
      item.innerHTML = `
                <i class="fas fa-hashtag digital-icon"></i>
                <span>Social: ${digital.socialHandle}</span>
            `;
      container.appendChild(item);
    }

    // Add any additional digital fields dynamically
    Object.keys(digital).forEach((key) => {
      if (key !== "gamerTag" && key !== "socialHandle" && digital[key]) {
        const item = this.utils.createElement("div", "digital-item");
        const formattedKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        item.innerHTML = `
                    <i class="fas fa-link digital-icon"></i>
                    <span>${formattedKey}: ${digital[key]}</span>
                `;
        container.appendChild(item);
      }
    });
  }

  renderStoryMode(card) {
    const story = card.storyMode || {};
    const container = document.getElementById("storyContent");

    if (!container) return;

    container.innerHTML = "";

    const storyFields = [
      { key: "lifeMotto", label: "Life Motto", value: story.lifeMotto },
      {
        key: "makesHappy",
        label: "What Makes Them Happy",
        value: story.makesHappy,
      },
      { key: "breaksThem", label: "What Breaks Them", value: story.breaksThem },
      {
        key: "protectAtAllCosts",
        label: "Protect At All Costs",
        value: story.protectAtAllCosts,
      },
      {
        key: "secretSoftSpot",
        label: "Secret Soft Spot",
        value: story.secretSoftSpot,
      },
    ];

    storyFields.forEach((field) => {
      if (field.value) {
        const item = this.utils.createElement("div", "story-item");
        item.innerHTML = `
                    <span class="story-label">${field.label}</span>
                    <div class="story-value">${field.value}</div>
                `;
        container.appendChild(item);
      }
    });
  }

  // In the CardPage class, update these methods:

  setupGallery(card) {
    const gallery = card.media?.gallery || [];

    if (gallery.length === 0) {
      if (this.gallerySection) {
        this.gallerySection.classList.add("hidden");
      }
      return;
    }

    // Show gallery section
    if (this.gallerySection) {
      this.gallerySection.classList.remove("hidden");
    }

    // Set gallery data
    this.galleryImages = gallery;
    this.currentGalleryIndex = 0;
    this.isSwiping = false;
    this.swipeStartX = 0;
    this.swipeEndX = 0;
    this.swipeThreshold = 50; // Minimum swipe distance

    // Render gallery
    this.renderGallery();

    // Setup event listeners
    this.setupGalleryEvents();
  }

  setupGalleryEvents() {
    // Remove existing listeners first to prevent duplicates
    if (this.galleryPrevBtn) {
      this.galleryPrevBtn.removeEventListener("click", this.boundPrevGallery);
      this.galleryPrevBtn.addEventListener("click", () =>
        this.prevGalleryImage(),
      );
    }

    if (this.galleryNextBtn) {
      this.galleryNextBtn.removeEventListener("click", this.boundNextGallery);
      this.galleryNextBtn.addEventListener("click", () =>
        this.nextGalleryImage(),
      );
    }

    // Add touch/swipe support
    this.setupTouchEvents();

    // Add keyboard navigation
    this.setupKeyboardNavigation();
  }

  setupTouchEvents() {
    if (!this.galleryTrack) return;

    // Clear existing listeners
    this.galleryTrack.removeEventListener("touchstart", this.boundTouchStart);
    this.galleryTrack.removeEventListener("touchmove", this.boundTouchMove);
    this.galleryTrack.removeEventListener("touchend", this.boundTouchEnd);

    // Bind methods
    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchMove = this.handleTouchMove.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);

    // Add new listeners
    this.galleryTrack.addEventListener("touchstart", this.boundTouchStart, {
      passive: true,
    });
    this.galleryTrack.addEventListener("touchmove", this.boundTouchMove, {
      passive: false,
    });
    this.galleryTrack.addEventListener("touchend", this.boundTouchEnd, {
      passive: true,
    });

    // Also support mouse events for desktop
    this.galleryTrack.addEventListener(
      "mousedown",
      this.handleMouseDown.bind(this),
    );
    this.galleryTrack.addEventListener(
      "mousemove",
      this.handleMouseMove.bind(this),
    );
    this.galleryTrack.addEventListener(
      "mouseup",
      this.handleMouseUp.bind(this),
    );
    this.galleryTrack.addEventListener(
      "mouseleave",
      this.handleMouseLeave.bind(this),
    );
  }

  handleTouchStart(e) {
    if (this.galleryImages.length <= 1) return;

    this.isSwiping = true;
    this.swipeStartX = e.touches[0].clientX;
    this.swipeEndX = this.swipeStartX;

    // Prevent default to avoid scrolling
    e.preventDefault();
  }

  handleTouchMove(e) {
    if (!this.isSwiping || this.galleryImages.length <= 1) return;

    this.swipeEndX = e.touches[0].clientX;
    const diff = this.swipeStartX - this.swipeEndX;

    // Only prevent default if we're actually swiping horizontally
    if (Math.abs(diff) > 10) {
      e.preventDefault();
    }
  }

  handleTouchEnd() {
    if (!this.isSwiping || this.galleryImages.length <= 1) return;

    const diff = this.swipeStartX - this.swipeEndX;
    const absDiff = Math.abs(diff);

    if (absDiff > this.swipeThreshold) {
      if (diff > 0) {
        this.nextGalleryImage();
      } else {
        this.prevGalleryImage();
      }
    }

    this.isSwiping = false;
  }

  handleMouseDown(e) {
    if (this.galleryImages.length <= 1) return;

    this.isSwiping = true;
    this.swipeStartX = e.clientX;
    this.swipeEndX = this.swipeStartX;

    e.preventDefault();
  }

  handleMouseMove(e) {
    if (!this.isSwiping || this.galleryImages.length <= 1) return;

    this.swipeEndX = e.clientX;
  }

  handleMouseUp() {
    if (!this.isSwiping || this.galleryImages.length <= 1) return;

    const diff = this.swipeStartX - this.swipeEndX;
    const absDiff = Math.abs(diff);

    if (absDiff > this.swipeThreshold) {
      if (diff > 0) {
        this.nextGalleryImage();
      } else {
        this.prevGalleryImage();
      }
    }

    this.isSwiping = false;
  }

  handleMouseLeave() {
    this.isSwiping = false;
  }

  setupKeyboardNavigation() {
    // Remove existing listener
    document.removeEventListener("keydown", this.boundKeyDown);

    // Add keyboard navigation
    this.boundKeyDown = this.handleKeyDown.bind(this);
    document.addEventListener("keydown", this.boundKeyDown);
  }

  handleKeyDown(e) {
    if (this.galleryImages.length <= 1) return;

    if (e.key === "ArrowLeft") {
      this.prevGalleryImage();
    } else if (e.key === "ArrowRight") {
      this.nextGalleryImage();
    }
  }

  renderGallery() {
    if (!this.galleryTrack) return;

    this.galleryTrack.innerHTML = "";

    // Apply transform with hardware acceleration
    this.galleryTrack.style.transform = `translate3d(-${this.currentGalleryIndex * 100}%, 0, 0)`;

    this.galleryImages.forEach((imageSrc, index) => {
      const slide = this.utils.createElement("div", "gallery-slide");

      // Create image wrapper
      const imgWrapper = this.utils.createElement("div", "gallery-img-wrapper");
      imgWrapper.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

      const img = new Image();
      img.className = "gallery-img";
      img.src = imageSrc;
      img.alt = `Gallery image ${index + 1}`;
      img.loading = "lazy";

      // Add error handling
      img.onerror = () => {
        console.error(`Failed to load gallery image: ${imageSrc}`);
        img.src =
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMjUyNTNBIi8+CjxwYXRoIGQ9Ik0zNSAzNUMzOC44NjYgMzEuMTMzOSA0NC44NjYgMzEuMTMzOSA0OC44NjYgMzVDNTIuODY2IDM4Ljg2NiA1Mi44NjYgNDQuODY2IDUwIDQ4QzQ3LjEzMzkgNTEuMTMzOSA0MS4xMzM5IDUxLjEzMzkgMzggNDhDMzQuODY2IDQ0Ljg2NiAzNC44NjYgMzguODY2IDM1IDM1WiIgZmlsbD0iIzcGNUEwRiIvPgo8cGF0aCBkPSJNNjUgNjVINzVWNzVINjVWNjVaIiBmaWxsPSIjN0Y1QTBGIi8+Cjwvc3ZnPg==";
        img.style.opacity = "0.5";
      };

      imgWrapper.appendChild(img);
      slide.appendChild(imgWrapper);
      this.galleryTrack.appendChild(slide);
    });

    // Update counter
    if (this.galleryCurrent && this.galleryTotal) {
      this.galleryCurrent.textContent = this.currentGalleryIndex + 1;
      this.galleryTotal.textContent = this.galleryImages.length;
    }

    // Update button states
    this.updateGalleryButtons();
  }

  prevGalleryImage() {
    if (this.galleryImages.length === 0) return;

    this.currentGalleryIndex =
      this.currentGalleryIndex === 0
        ? this.galleryImages.length - 1
        : this.currentGalleryIndex - 1;

    this.renderGallery();
  }

  nextGalleryImage() {
    if (this.galleryImages.length === 0) return;

    this.currentGalleryIndex =
      this.currentGalleryIndex === this.galleryImages.length - 1
        ? 0
        : this.currentGalleryIndex + 1;

    this.renderGallery();
  }

  updateGalleryButtons() {
    if (!this.galleryPrevBtn || !this.galleryNextBtn) return;

    // Visual feedback for button states (optional)
    if (this.galleryImages.length <= 1) {
      this.galleryPrevBtn.style.opacity = "0.5";
      this.galleryPrevBtn.style.cursor = "not-allowed";
      this.galleryNextBtn.style.opacity = "0.5";
      this.galleryNextBtn.style.cursor = "not-allowed";
    } else {
      this.galleryPrevBtn.style.opacity = "1";
      this.galleryPrevBtn.style.cursor = "pointer";
      this.galleryNextBtn.style.opacity = "1";
      this.galleryNextBtn.style.cursor = "pointer";
    }
  }

  handleSwipe(startX, endX) {
    const swipeThreshold = 50;
    const diff = startX - endX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.nextGalleryImage();
      } else {
        this.prevGalleryImage();
      }
    }
  }

  handleCardMusic(card) {
    const songUrl = card.favorites?.song;
    const songName = card.favorites?.songName;

    if (!songUrl) {
      // No card-specific song, keep playing ambient music
      this.cardTrackInfo.textContent = "No theme song";
      if (this.cardPlayPauseBtn) {
        this.cardPlayPauseBtn.disabled = true;
      }
      return;
    }

    // Stop ambient music and play card-specific song
    this.audioSystem.stop();

    // Set up card music
    this.cardMusicElement.src = songUrl;
    this.cardMusicElement.volume = 0;

    // Handle mobile interaction
    if (this.audioSystem.isMobile && !this.audioSystem.userInteracted) {
      // Show mobile prompt if not already interacted
      if (!document.querySelector(".mobile-audio-overlay")) {
        this.audioSystem.setupMobileInteraction();
      }
      return;
    }

    // Fade in card music
    this.fadeInCardMusic();

    // Update track info - use songName if available, otherwise use filename
    let displayName = songName;
    if (!displayName) {
      // Extract name from filename
      displayName = songUrl
        .split("/")
        .pop()
        .replace(".mp3", "")
        .replace("-theme", " Theme")
        .replace(/_/g, " ")
        .replace(/^\d+/, "") // Remove leading numbers
        .trim();

      // Capitalize first letter of each word
      displayName = displayName.replace(/\b\w/g, (l) => l.toUpperCase());
    }

    this.cardTrackInfo.textContent = `Playing: ${displayName}`;

    if (this.cardPlayPauseBtn) {
      this.cardPlayPauseBtn.disabled = false;
    }
  }

  async fadeInCardMusic() {
    try {
      await this.cardMusicElement.play();

      // Fade in volume
      let volume = 0;
      const fadeInterval = setInterval(() => {
        volume += 0.05;
        this.cardMusicElement.volume = Math.min(volume, 0.7);

        if (volume >= 0.7) {
          clearInterval(fadeInterval);
        }
      }, 100);
    } catch (error) {
      console.error("Error playing card music:", error);
    }
  }

  async fadeOutCardMusic() {
    return new Promise((resolve) => {
      let volume = this.cardMusicElement.volume;
      const fadeInterval = setInterval(() => {
        volume -= 0.05;
        this.cardMusicElement.volume = Math.max(volume, 0);

        if (volume <= 0) {
          clearInterval(fadeInterval);
          this.cardMusicElement.pause();
          resolve();
        }
      }, 100);
    });
  }

  toggleCardMusic() {
    if (this.cardMusicElement.paused) {
      this.cardMusicElement.play();
      if (this.cardPlayPauseBtn) {
        const icon = this.cardPlayPauseBtn.querySelector("i");
        if (icon) {
          icon.className = "fas fa-pause";
        }
      }
    } else {
      this.cardMusicElement.pause();
      if (this.cardPlayPauseBtn) {
        const icon = this.cardPlayPauseBtn.querySelector("i");
        if (icon) {
          icon.className = "fas fa-play";
        }
      }
    }
  }

  stopCardMusic() {
    if (!this.cardMusicElement.paused) {
      this.fadeOutCardMusic();
    }
  }

  updateFooterInfo(card) {
    document.getElementById("cardIdDisplay").textContent = `ID: ${card.id}`;

    if (card.officialDetails?.issueDate) {
      document.getElementById("cardIssueDate").textContent =
        `Issued: ${this.utils.formatDate(card.officialDetails.issueDate)}`;
    }
  }

  animateCardEntrance() {
    const cardWrapper = document.querySelector(".card-wrapper");
    if (cardWrapper) {
      cardWrapper.classList.add("card-entrance");
    }
  }

  setDetailValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      if (value) {
        element.textContent = value;
        element.parentElement.classList.remove("hidden");
      } else {
        element.parentElement.classList.add("hidden");
      }
    }
  }
}

// Initialize card page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new CardPage();
});
