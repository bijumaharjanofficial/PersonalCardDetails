// Search page functionality
class SearchPage {
  constructor() {
    // State
    this.allCards = [];
    this.filteredCards = [];
    this.currentFilter = "all";
    this.currentModalCard = null;
    this.currentModalIndex = 0;

    // Elements
    this.searchInput = document.getElementById("searchInput");
    this.cardsGrid = document.getElementById("cardsGrid");
    this.noResults = document.getElementById("noResults");
    this.resultsCount = document.getElementById("resultsCount");
    this.filterButtons = document.querySelectorAll(".filter-btn");

    // Modal elements
    this.cardModal = document.getElementById("cardModal");
    this.modalClose = document.getElementById("modalClose");
    this.modalContent = document.querySelector(".modal-content");
    this.prevCardBtn = document.getElementById("prevCard");
    this.nextCardBtn = document.getElementById("nextCard");

    this.init();
  }

  init() {
    // Load data and render cards
    this.loadData();

    // Initialize event listeners
    this.initEventListeners();

    // Initialize modal
    this.initModal();
  }

  loadData() {
    // Get cards from data system
    dataSystem.addEventListener("dataloaded", () => {
      this.allCards = dataSystem.getAllCards();
      this.filteredCards = [...this.allCards];
      this.renderCards();
      this.updateResultsCount();
    });

    // If data is already loaded
    if (dataSystem.cards.length > 0) {
      this.allCards = dataSystem.getAllCards();
      this.filteredCards = [...this.allCards];
      this.renderCards();
      this.updateResultsCount();
    }
  }

  initEventListeners() {
    // Search input with debounce
    if (this.searchInput) {
      const debouncedSearch = utils.debounce(() => this.handleSearch(), 300);
      this.searchInput.addEventListener("input", debouncedSearch);
    }

    // Filter buttons
    this.filterButtons.forEach((button) => {
      button.addEventListener("click", (e) => this.handleFilterClick(e));
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
  }

  handleKeyDown(e) {
    // Close modal with Escape key
    if (e.key === "Escape" && !this.cardModal.classList.contains("hidden")) {
      this.closeModal();
    }

    // Navigate modal with arrow keys
    if (!this.cardModal.classList.contains("hidden")) {
      if (e.key === "ArrowLeft") {
        this.showPreviousCard();
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        this.showNextCard();
        e.preventDefault();
      }
    }
  }

  initModal() {
    // Close modal button
    if (this.modalClose) {
      this.modalClose.addEventListener("click", () => this.closeModal());
    }

    // Modal overlay click to close
    const modalOverlay = document.querySelector(".modal-overlay");
    if (modalOverlay) {
      modalOverlay.addEventListener("click", () => this.closeModal());
    }

    // Navigation buttons
    if (this.prevCardBtn) {
      this.prevCardBtn.addEventListener("click", () => this.showPreviousCard());
    }

    if (this.nextCardBtn) {
      this.nextCardBtn.addEventListener("click", () => this.showNextCard());
    }
  }

  handleSearch() {
    const query = this.searchInput.value.trim();
    this.filteredCards = dataSystem.searchCards(query);
    this.applyCurrentFilter();
    this.renderCards();
    this.updateResultsCount();
  }

  handleFilterClick(event) {
    const filter = event.target.dataset.filter;

    // Update active filter
    this.filterButtons.forEach((button) => {
      button.classList.remove("active");
    });
    event.target.classList.add("active");

    this.currentFilter = filter;
    this.applyCurrentFilter();
    this.renderCards();
    this.updateResultsCount();
  }

  applyCurrentFilter() {
    switch (this.currentFilter) {
      case "has-gallery":
        this.filteredCards = this.filteredCards.filter(
          (card) => card.media?.gallery && card.media.gallery.length > 0,
        );
        break;

      case "has-song":
        this.filteredCards = this.filteredCards.filter(
          (card) => card.favorites?.song,
        );
        break;

      case "all":
      default:
        // No additional filtering needed
        break;
    }
  }

  renderCards() {
    if (!this.cardsGrid) return;

    this.cardsGrid.innerHTML = "";

    if (this.filteredCards.length === 0) {
      this.noResults.classList.remove("hidden");
      return;
    }

    this.noResults.classList.add("hidden");

    this.filteredCards.forEach((card, index) => {
      const cardElement = this.createCardElement(card, index);
      this.cardsGrid.appendChild(cardElement);
    });
  }

  createCardElement(card, index) {
    const identity = card.coreIdentity || {};
    const official = card.officialDetails || {};
    const favorites = card.favorites || {};

    const cardElement = utils.createElement("div", "card-item");
    cardElement.style.animationDelay = `${index * 0.05}s`;

    // Set accent color if available
    if (favorites.color && themeSystem.isValidColor(favorites.color)) {
      cardElement.style.setProperty("--card-accent-color", favorites.color);
    }

    // Card image
    const imgWrapper = utils.createElement("div", "card-img-wrapper");
    const img = utils.createElement("img", "card-img");
    img.src = card.media?.dp || "assets/images/placeholder.png";
    img.alt = `${identity.firstName}'s display picture`;
    img.loading = "lazy";

    // Error handling for image
    img.onerror = () => {
      img.src =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMjUyNTNBIi8+CjxwYXRoIGQ9Ik0zNSAzNUMzOC44NjYgMzEuMTMzOSA0NC44NjYgMzEuMTMzOSA0OC44NjYgMzVDNTIuODY2IDM4Ljg2NiA1Mi44NjYgNDQuODY2IDUwIDQ4QzQ3LjEzMzkgNTEuMTMzOSA0MS4xMzM5IDUxLjEzMzkgMzggNDhDMzQuODY2IDQ0Ljg2NiAzNC44NjYgMzguODY2IDM1IDM1WiIgZmlsbD0iIzcGNUEwRiIvPgo8cGF0aCBkPSJNNjUgNjVINzVWNzVINjVWNjVaIiBmaWxsPSIjN0Y1QTBGIi8+Cjwvc3ZnPg==";
      img.style.opacity = "0.5";
    };

    imgWrapper.appendChild(img);

    // Card info
    const info = utils.createElement("div", "card-info");

    // Name and badge
    const nameRow = utils.createElement("div", "card-name");
    const firstName = utils.createElement("span");
    firstName.textContent = identity.firstName || "Unknown";

    const badge = utils.createElement("span", "card-badge");
    if (official.cardType) {
      badge.textContent = official.cardType;
      badge.style.backgroundColor = favorites.color
        ? `${favorites.color}30`
        : "rgba(127, 90, 240, 0.2)";
      badge.style.color = favorites.color || "#7f5af0";
    }

    nameRow.appendChild(firstName);
    nameRow.appendChild(badge);

    // Nickname
    let nicknameRow = null;
    if (identity.nickname) {
      nicknameRow = utils.createElement("div", "card-nickname");
      nicknameRow.textContent = `"${identity.nickname}"`;
    }

    // Meta info
    const meta = utils.createElement("div", "card-meta");

    if (identity.username) {
      const username = utils.createElement("span", "card-username");
      username.textContent = `@${identity.username}`;
      meta.appendChild(username);
    }

    if (official.organization) {
      const org = utils.createElement("span", "card-org");
      org.textContent = official.organization;
      meta.appendChild(org);
    }

    // Stats
    const stats = utils.createElement("div", "card-stats");

    if (card.media?.gallery?.length > 0) {
      const galleryStat = utils.createElement("span", "card-stat");
      galleryStat.innerHTML = `<i class="fas fa-images"></i> ${card.media.gallery.length}`;
      stats.appendChild(galleryStat);
    }

    if (card.favorites?.song) {
      const songStat = utils.createElement("span", "card-stat");
      songStat.innerHTML = '<i class="fas fa-music"></i>';
      stats.appendChild(songStat);
    }

    // Action buttons
    const actions = utils.createElement("div", "card-actions");

    const viewBtn = utils.createElement("button", "action-btn primary");
    viewBtn.innerHTML = '<i class="fas fa-eye"></i> Quick View';
    viewBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.openCardModal(card);
    });

    const detailsBtn = utils.createElement("button", "action-btn secondary");
    detailsBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> Full Page';
    detailsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.location.href = `card.html?id=${card.id}`;
    });

    actions.appendChild(viewBtn);
    actions.appendChild(detailsBtn);

    // Assemble info
    info.appendChild(nameRow);
    if (nicknameRow) info.appendChild(nicknameRow);
    info.appendChild(meta);
    info.appendChild(stats);
    info.appendChild(actions);

    // Assemble card
    cardElement.appendChild(imgWrapper);
    cardElement.appendChild(info);

    // Add hover effect
    cardElement.addEventListener("mouseenter", () => {
      cardElement.style.transform = "translateY(-8px)";
      cardElement.style.boxShadow = "0 15px 40px rgba(0, 0, 0, 0.25)";
    });

    cardElement.addEventListener("mouseleave", () => {
      cardElement.style.transform = "translateY(0)";
      cardElement.style.boxShadow = "var(--card-shadow)";
    });

    // Add click to open modal
    cardElement.addEventListener("click", () => {
      this.openCardModal(card);
    });

    return cardElement;
  }

  updateResultsCount() {
    if (this.resultsCount) {
      this.resultsCount.textContent = this.filteredCards.length;
    }
  }

  openCardModal(card) {
    this.currentModalCard = card;
    this.currentModalIndex = this.filteredCards.findIndex(
      (c) => c.id === card.id,
    );

    // Render modal content
    this.renderModalContent(card);

    // Show modal
    this.cardModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    // Add open class for animation
    setTimeout(() => {
      this.cardModal.classList.add("open");
    }, 10);

    // Update navigation buttons state
    this.updateModalNavigation();
  }

  closeModal() {
    this.cardModal.classList.remove("open");

    setTimeout(() => {
      this.cardModal.classList.add("hidden");
      document.body.style.overflow = "";

      // Clear modal content
      if (this.modalContent) {
        this.modalContent.innerHTML = "";
      }
    }, 300);
  }

  renderModalContent(card) {
    if (!this.modalContent) return;

    const identity = card.coreIdentity || {};
    const official = card.officialDetails || {};
    const personality = card.personalityTraits || {};
    const favorites = card.favorites || {};
    const lifestyle = card.lifestyle || {};

    // Clear previous content
    this.modalContent.innerHTML = "";

    // Set accent color
    if (favorites.color && themeSystem.isValidColor(favorites.color)) {
      this.modalContent.style.setProperty(
        "--card-accent-color",
        favorites.color,
      );
    }

    // Create modal card layout
    const modalCard = utils.createElement("div", "modal-card");

    // Header with avatar and basic info
    const header = utils.createElement("div", "modal-header");

    // Avatar
    const avatarSection = utils.createElement("div", "modal-avatar-section");

    const avatarImg = utils.createElement("img", "modal-avatar-img");
    avatarImg.src = card.media?.dp || "assets/images/placeholder.png";
    avatarImg.alt = `${identity.firstName}'s display picture`;

    const avatarOverlay = utils.createElement("div", "modal-avatar-overlay");

    const avatarName = utils.createElement("h2", "modal-avatar-name");
    avatarName.textContent = identity.firstName || "Unknown";

    if (identity.lastName) {
      const lastName = utils.createElement("span", "modal-avatar-lastname");
      lastName.textContent = ` ${identity.lastName}`;
      avatarName.appendChild(lastName);
    }

    if (identity.nickname) {
      const nickname = utils.createElement("p", "modal-nickname");
      nickname.textContent = `"${identity.nickname}"`;
      avatarSection.appendChild(nickname);
    }

    if (identity.username) {
      const username = utils.createElement("p", "modal-username");
      username.textContent = `@${identity.username}`;
      avatarSection.appendChild(username);
    }

    avatarOverlay.appendChild(avatarName);
    avatarSection.appendChild(avatarImg);
    avatarSection.appendChild(avatarOverlay);
    header.appendChild(avatarSection);

    // Badges
    const badges = utils.createElement("div", "modal-badges");

    if (official.cardType) {
      const typeBadge = utils.createElement("span", "modal-badge type");
      typeBadge.textContent = official.cardType;
      badges.appendChild(typeBadge);
    }

    if (official.organization) {
      const orgBadge = utils.createElement("span", "modal-badge org");
      orgBadge.textContent = official.organization;
      badges.appendChild(orgBadge);
    }

    if (official.role) {
      const roleBadge = utils.createElement("span", "modal-badge role");
      roleBadge.textContent = official.role;
      badges.appendChild(roleBadge);
    }

    header.appendChild(badges);

    // Stats row
    const statsRow = utils.createElement("div", "modal-stats");

    const stats = [
      {
        icon: "fa-calendar",
        label: "Age",
        value:
          identity.age ||
          (identity.dateOfBirth
            ? utils.calculateAge(identity.dateOfBirth)
            : "N/A"),
      },
      {
        icon: "fa-venus-mars",
        label: "Gender",
        value: identity.gender || "N/A",
      },
      {
        icon: "fa-globe",
        label: "Nationality",
        value: identity.nationality || "N/A",
      },
      { icon: "fa-tint", label: "Blood", value: identity.bloodGroup || "N/A" },
    ];

    stats.forEach((stat) => {
      if (stat.value && stat.value !== "N/A") {
        const statItem = utils.createElement("div", "modal-stat");
        statItem.innerHTML = `
                    <i class="fas ${stat.icon}"></i>
                    <div class="modal-stat-content">
                        <span class="modal-stat-value">${stat.value}</span>
                        <span class="modal-stat-label">${stat.label}</span>
                    </div>
                `;
        statsRow.appendChild(statItem);
      }
    });

    header.appendChild(statsRow);

    // Main content sections
    const content = utils.createElement("div", "modal-content-sections");

    // Left column
    const leftColumn = utils.createElement("div", "modal-left-column");

    // Official Details
    if (official.cardNumber || official.issueDate || official.expiryDate) {
      const officialSection = utils.createElement("div", "modal-section");
      officialSection.innerHTML = `
                <h3><i class="fas fa-id-card"></i> Official Details</h3>
                <div class="modal-details-grid">
                    ${official.cardNumber ? `<div><span>Card Number</span><strong>${official.cardNumber}</strong></div>` : ""}
                    ${official.issueDate ? `<div><span>Issue Date</span><strong>${utils.formatDate(official.issueDate)}</strong></div>` : ""}
                    ${official.expiryDate ? `<div><span>Expiry Date</span><strong>${utils.formatDate(official.expiryDate)}</strong></div>` : ""}
                </div>
            `;
      leftColumn.appendChild(officialSection);
    }

    // Personality Traits
    if (
      personality.personalityType ||
      personality.strengths?.length > 0 ||
      personality.weaknesses?.length > 0
    ) {
      const personalitySection = utils.createElement("div", "modal-section");
      let personalityHTML = '<h3><i class="fas fa-brain"></i> Personality</h3>';

      if (personality.personalityType) {
        personalityHTML += `<div class="modal-tag-group">
                    <span class="modal-tag personality-type">${personality.personalityType}</span>
                </div>`;
      }

      if (personality.strengths?.length > 0) {
        personalityHTML += `<div class="modal-tag-group">
                    <span class="modal-section-label">Strengths</span>
                    <div class="modal-tags">
                        ${personality.strengths.map((strength) => `<span class="modal-tag strength">${strength}</span>`).join("")}
                    </div>
                </div>`;
      }

      if (personality.weaknesses?.length > 0) {
        personalityHTML += `<div class="modal-tag-group">
                    <span class="modal-section-label">Weaknesses</span>
                    <div class="modal-tags">
                        ${personality.weaknesses.map((weakness) => `<span class="modal-tag weakness">${weakness}</span>`).join("")}
                    </div>
                </div>`;
      }

      personalitySection.innerHTML = personalityHTML;
      leftColumn.appendChild(personalitySection);
    }

    // Right column
    const rightColumn = utils.createElement("div", "modal-right-column");

    // Favorites
    if (
      favorites.musicGenre ||
      favorites.artist ||
      favorites.anime ||
      favorites.color
    ) {
      const favoritesSection = utils.createElement("div", "modal-section");
      let favoritesHTML =
        '<h3><i class="fas fa-star"></i> Favorites</h3><div class="modal-favorites">';

      if (favorites.musicGenre) {
        favoritesHTML += `<div class="modal-favorite-item">
                    <i class="fas fa-music"></i>
                    <div>
                        <span>Music Genre</span>
                        <strong>${favorites.musicGenre}</strong>
                    </div>
                </div>`;
      }

      if (favorites.artist) {
        favoritesHTML += `<div class="modal-favorite-item">
                    <i class="fas fa-user-music"></i>
                    <div>
                        <span>Artist</span>
                        <strong>${favorites.artist}</strong>
                    </div>
                </div>`;
      }

      if (favorites.anime) {
        favoritesHTML += `<div class="modal-favorite-item">
                    <i class="fas fa-tv"></i>
                    <div>
                        <span>Anime</span>
                        <strong>${favorites.anime}</strong>
                    </div>
                </div>`;
      }

      if (favorites.color) {
        favoritesHTML += `<div class="modal-favorite-item">
                    <i class="fas fa-palette"></i>
                    <div>
                        <span>Color</span>
                        <strong>${favorites.color}</strong>
                        <div class="color-preview" style="background-color: ${favorites.color};"></div>
                    </div>
                </div>`;
      }

      favoritesHTML += "</div>";
      favoritesSection.innerHTML = favoritesHTML;
      rightColumn.appendChild(favoritesSection);
    }

    // Lifestyle
    if (lifestyle.hobbies?.length > 0 || lifestyle.skills?.length > 0) {
      const lifestyleSection = utils.createElement("div", "modal-section");
      let lifestyleHTML = '<h3><i class="fas fa-heart"></i> Lifestyle</h3>';

      if (lifestyle.hobbies?.length > 0) {
        lifestyleHTML += `<div class="modal-tag-group">
                    <span class="modal-section-label">Hobbies</span>
                    <div class="modal-tags">
                        ${lifestyle.hobbies.map((hobby) => `<span class="modal-tag">${hobby}</span>`).join("")}
                    </div>
                </div>`;
      }

      if (lifestyle.skills?.length > 0) {
        lifestyleHTML += `<div class="modal-tag-group">
                    <span class="modal-section-label">Skills</span>
                    <div class="modal-tags">
                        ${lifestyle.skills.map((skill) => `<span class="modal-tag skill">${skill}</span>`).join("")}
                    </div>
                </div>`;
      }

      lifestyleSection.innerHTML = lifestyleHTML;
      rightColumn.appendChild(lifestyleSection);
    }

    // Digital & Social
    const digital = card.digitalSocial || {};
    if (digital.gamerTag || digital.socialHandle) {
      const digitalSection = utils.createElement("div", "modal-section");
      let digitalHTML =
        '<h3><i class="fas fa-globe"></i> Digital Presence</h3><div class="modal-digital">';

      if (digital.gamerTag) {
        digitalHTML += `<div class="modal-digital-item">
                    <i class="fas fa-gamepad"></i>
                    <div>
                        <span>Gamer Tag</span>
                        <strong>${digital.gamerTag}</strong>
                    </div>
                </div>`;
      }

      if (digital.socialHandle) {
        digitalHTML += `<div class="modal-digital-item">
                    <i class="fas fa-hashtag"></i>
                    <div>
                        <span>Social</span>
                        <strong>${digital.socialHandle}</strong>
                    </div>
                </div>`;
      }

      digitalHTML += "</div>";
      digitalSection.innerHTML = digitalHTML;
      rightColumn.appendChild(digitalSection);
    }

    // Assemble content
    content.appendChild(leftColumn);
    content.appendChild(rightColumn);

    // Action buttons at bottom
    const actionButtons = utils.createElement("div", "modal-action-buttons");

    const fullPageBtn = utils.createElement(
      "button",
      "modal-action-btn primary",
    );
    fullPageBtn.innerHTML =
      '<i class="fas fa-external-link-alt"></i> Open Full Page';
    fullPageBtn.addEventListener("click", () => {
      window.location.href = `card.html?id=${card.id}`;
    });

    const closeBtn = utils.createElement(
      "button",
      "modal-action-btn secondary",
    );
    closeBtn.innerHTML = '<i class="fas fa-times"></i> Close';
    closeBtn.addEventListener("click", () => this.closeModal());

    actionButtons.appendChild(fullPageBtn);
    actionButtons.appendChild(closeBtn);

    // Assemble modal
    modalCard.appendChild(header);
    modalCard.appendChild(content);
    modalCard.appendChild(actionButtons);

    this.modalContent.appendChild(modalCard);
  }

  showPreviousCard() {
    if (this.filteredCards.length === 0) return;

    this.currentModalIndex =
      this.currentModalIndex === 0
        ? this.filteredCards.length - 1
        : this.currentModalIndex - 1;
    this.currentModalCard = this.filteredCards[this.currentModalIndex];
    this.renderModalContent(this.currentModalCard);
    this.updateModalNavigation();
  }

  showNextCard() {
    if (this.filteredCards.length === 0) return;

    this.currentModalIndex =
      this.currentModalIndex === this.filteredCards.length - 1
        ? 0
        : this.currentModalIndex + 1;
    this.currentModalCard = this.filteredCards[this.currentModalIndex];
    this.renderModalContent(this.currentModalCard);
    this.updateModalNavigation();
  }

  updateModalNavigation() {
    // Update button states based on current index
    if (this.prevCardBtn && this.nextCardBtn) {
      this.prevCardBtn.disabled = this.filteredCards.length <= 1;
      this.nextCardBtn.disabled = this.filteredCards.length <= 1;
    }
  }
}

// Initialize search page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new SearchPage();
});
