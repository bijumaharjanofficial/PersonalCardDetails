// Search page functionality
class SearchPage {
    constructor() {
        // State
        this.allCards = [];
        this.filteredCards = [];
        this.currentFilter = "all";
        this.currentModalCard = null;
        this.currentModalIndex = 0;
        this.modalGalleryImages = [];
        this.currentModalGalleryIndex = 0;
        this.isModalSwiping = false;
        this.modalSwipeStartX = 0;
        this.modalSwipeEndX = 0;
        
        // Elements
        this.searchInput = document.getElementById("searchInput");
        this.cardsGrid = document.getElementById("cardsGrid");
        this.noResults = document.getElementById("noResults");
        this.resultsCount = document.getElementById("resultsCount");
        this.filterButtons = document.querySelectorAll(".filter-btn");
        this.themeToggleBtn = document.getElementById("themeToggle");
        
        // Modal elements
        this.cardModal = document.getElementById("cardModal");
        this.modalClose = document.getElementById("modalClose");
        this.modalContent = document.querySelector(".modal-content");
        this.prevCardBtn = document.getElementById("prevCard");
        this.nextCardBtn = document.getElementById("nextCard");
        this.modalGallery = document.getElementById("modalGallery");
        this.modalGalleryTrack = document.getElementById("modalGalleryTrack");
        this.modalGalleryPrev = document.getElementById("modalGalleryPrev");
        this.modalGalleryNext = document.getElementById("modalGalleryNext");
        this.modalGalleryCurrent = document.getElementById("modalGalleryCurrent");
        this.modalGalleryTotal = document.getElementById("modalGalleryTotal");
        
        // Bind methods
        this.handleModalTouchStart = this.handleModalTouchStart.bind(this);
        this.handleModalTouchMove = this.handleModalTouchMove.bind(this);
        this.handleModalTouchEnd = this.handleModalTouchEnd.bind(this);
        this.handleModalMouseDown = this.handleModalMouseDown.bind(this);
        this.handleModalMouseMove = this.handleModalMouseMove.bind(this);
        this.handleModalMouseUp = this.handleModalMouseUp.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        
        this.init();
    }
    
    init() {
        // Initialize theme toggle
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener("click", () => themeSystem.toggleTheme());
        }
        
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
        document.addEventListener("keydown", this.handleKeyDown);
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
        
        // Gallery navigation
        if (this.modalGalleryPrev) {
            this.modalGalleryPrev.addEventListener("click", () => this.prevModalGalleryImage());
        }
        
        if (this.modalGalleryNext) {
            this.modalGalleryNext.addEventListener("click", () => this.nextModalGalleryImage());
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
                    (card) => card.media?.gallery && card.media.gallery.length > 0
                );
                break;
                
            case "has-song":
                this.filteredCards = this.filteredCards.filter(
                    (card) => card.favorites?.song
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
        
        // Add hover effect
        img.addEventListener("mouseenter", () => {
            img.style.transform = "scale(1.05)";
        });
        
        img.addEventListener("mouseleave", () => {
            img.style.transform = "scale(1)";
        });
        
        imgWrapper.appendChild(img);
        
        // Card info
        const info = utils.createElement("div", "card-info");
        
        // Name and nickname
        const nameRow = utils.createElement("div", "card-name");
        const firstName = utils.createElement("span");
        firstName.textContent = identity.firstName || "Unknown";
        
        const badge = utils.createElement("span", "card-badge");
        if (official.cardType) {
            badge.textContent = official.cardType;
            badge.style.backgroundColor = favorites.color ? `${favorites.color}30` : "rgba(127, 90, 240, 0.2)";
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
        
        // Action buttons
        const actions = utils.createElement("div", "card-actions");
        
        const viewBtn = utils.createElement("button", "action-btn");
        viewBtn.innerHTML = '<i class="fas fa-eye"></i> View';
        viewBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.openCardModal(card);
        });
        
        const detailsBtn = utils.createElement("button", "action-btn");
        detailsBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> Page';
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
        info.appendChild(actions);
        
        // Assemble card
        cardElement.appendChild(imgWrapper);
        cardElement.appendChild(info);
        
        // Add double click to open modal
        cardElement.addEventListener("dblclick", () => {
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
        this.currentModalIndex = this.filteredCards.findIndex((c) => c.id === card.id);
        
        // Render modal content
        this.renderModalContent(card);
        
        // Show modal
        this.cardModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        
        // Update navigation buttons state
        this.updateModalNavigation();
    }
    
    closeModal() {
        this.cardModal.classList.add("hidden");
        document.body.style.overflow = "";
        
        // Clear modal content
        if (this.modalContent) {
            this.modalContent.innerHTML = "";
        }
        
        // Hide gallery
        if (this.modalGallery) {
            this.modalGallery.classList.add("hidden");
        }
        
        // Remove modal gallery event listeners
        this.removeModalGalleryEventListeners();
    }
    
    renderModalContent(card) {
        if (!this.modalContent) return;
        
        const identity = card.coreIdentity || {};
        const official = card.officialDetails || {};
        
        // Create modal card layout
        const modalCard = utils.createElement("div", "modal-card");
        
        // Avatar section
        const avatarSection = utils.createElement("div", "modal-avatar");
        
        const avatarImg = utils.createElement("img", "modal-avatar-img");
        avatarImg.src = card.media?.dp || "assets/images/placeholder.png";
        avatarImg.alt = `${identity.firstName}'s display picture`;
        
        const avatarName = utils.createElement("h3", "modal-avatar-name");
        avatarName.textContent = identity.firstName || "Unknown";
        
        if (identity.lastName) {
            avatarName.textContent += ` ${identity.lastName}`;
        }
        
        if (identity.nickname) {
            const nickname = utils.createElement("p", "modal-nickname");
            nickname.textContent = `"${identity.nickname}"`;
            avatarSection.appendChild(nickname);
        }
        
        avatarSection.appendChild(avatarImg);
        avatarSection.appendChild(avatarName);
        
        // Basic info section
        const infoSection = utils.createElement("div", "modal-basic-info");
        
        const infoFields = [
            { label: "Username", value: identity.username ? `@${identity.username}` : "" },
            { label: "Card Type", value: official.cardType },
            { label: "Organization", value: official.organization },
            { label: "Role", value: official.role },
            { label: "Gender", value: identity.gender },
            { label: "Nationality", value: identity.nationality },
            { label: "Age", value: identity.age || (identity.dateOfBirth ? utils.calculateAge(identity.dateOfBirth) : "") },
            { label: "Personality", value: card.personalityTraits?.personalityType },
        ];
        
        infoFields.forEach((field) => {
            if (field.value) {
                const row = utils.createElement("div", "modal-info-row");
                
                const label = utils.createElement("span", "modal-info-label");
                label.textContent = field.label;
                
                const value = utils.createElement("span", "modal-info-value");
                value.textContent = field.value;
                
                row.appendChild(label);
                row.appendChild(value);
                infoSection.appendChild(row);
            }
        });
        
        // Assemble modal card
        modalCard.appendChild(avatarSection);
        modalCard.appendChild(infoSection);
        
        this.modalContent.appendChild(modalCard);
        
        // Setup gallery if available
        this.setupModalGallery(card);
    }
    
    setupModalGallery(card) {
        const gallery = card.media?.gallery || [];
        
        if (gallery.length === 0) {
            if (this.modalGallery) {
                this.modalGallery.classList.add("hidden");
            }
            return;
        }
        
        // Show gallery
        if (this.modalGallery) {
            this.modalGallery.classList.remove("hidden");
        }
        
        // Set gallery data
        this.modalGalleryImages = gallery;
        this.currentModalGalleryIndex = 0;
        
        // Render gallery
        this.renderModalGallery();
        
        // Setup event listeners
        this.setupModalGalleryEvents();
    }
    
    renderModalGallery() {
        if (!this.modalGalleryTrack) return;
        
        this.modalGalleryTrack.innerHTML = "";
        
        // Create slides
        this.modalGalleryImages.forEach((imageSrc, index) => {
            const slide = utils.createElement("div", "gallery-slide");
            
            const img = new Image();
            img.className = "gallery-img";
            img.src = imageSrc;
            img.alt = `Gallery image ${index + 1}`;
            img.loading = "lazy";
            
            // Error handling
            img.onerror = () => {
                console.error(`Failed to load modal gallery image: ${imageSrc}`);
                img.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMjUyNTNBIi8+CjxwYXRoIGQ9Ik0zNSAzNUMzOC44NjYgMzEuMTMzOSA0NC44NjYgMzEuMTMzOSA0OC44NjYgMzVDNTIuODY2IDM4Ljg2NiA1Mi44NjYgNDQuODY2IDUwIDQ4QzQ3LjEzMzkgNTEuMTMzOSA0MS4xMzM5IDUxLjEzMzkgMzggNDhDMzQuODY2IDQ0Ljg2NiAzNC44NjYgMzguODY2IDM1IDM1WiIgZmlsbD0iIzcGNUEwRiIvPgo8cGF0aCBkPSJNNjUgNjVINzVWNzVINjVWNjVaIiBmaWxsPSIjN0Y1QTBGIi8+Cjwvc3ZnPg==";
                img.style.opacity = "0.5";
            };
            
            slide.appendChild(img);
            this.modalGalleryTrack.appendChild(slide);
        });
        
        // Update transform
        this.updateModalGalleryTransform();
        
        // Update counter
        this.updateModalGalleryCounter();
    }
    
    updateModalGalleryTransform() {
        if (!this.modalGalleryTrack) return;
        
        const slideWidth = 100; // percentage
        const translateX = -(this.currentModalGalleryIndex * slideWidth);
        this.modalGalleryTrack.style.transform = `translateX(${translateX}%)`;
    }
    
    updateModalGalleryCounter() {
        if (this.modalGalleryCurrent && this.modalGalleryTotal) {
            this.modalGalleryCurrent.textContent = this.currentModalGalleryIndex + 1;
            this.modalGalleryTotal.textContent = this.modalGalleryImages.length;
        }
    }
    
    setupModalGalleryEvents() {
        // Remove existing listeners
        this.removeModalGalleryEventListeners();
        
        // Add touch events
        if (this.modalGalleryTrack) {
            this.modalGalleryTrack.addEventListener("touchstart", this.handleModalTouchStart, { passive: true });
            this.modalGalleryTrack.addEventListener("touchmove", this.handleModalTouchMove, { passive: false });
            this.modalGalleryTrack.addEventListener("touchend", this.handleModalTouchEnd, { passive: true });
            
            // Add mouse events for desktop
            this.modalGalleryTrack.addEventListener("mousedown", this.handleModalMouseDown);
            this.modalGalleryTrack.addEventListener("mousemove", this.handleModalMouseMove);
            this.modalGalleryTrack.addEventListener("mouseup", this.handleModalMouseUp);
        }
    }
    
    removeModalGalleryEventListeners() {
        if (this.modalGalleryTrack) {
            this.modalGalleryTrack.removeEventListener("touchstart", this.handleModalTouchStart);
            this.modalGalleryTrack.removeEventListener("touchmove", this.handleModalTouchMove);
            this.modalGalleryTrack.removeEventListener("touchend", this.handleModalTouchEnd);
            this.modalGalleryTrack.removeEventListener("mousedown", this.handleModalMouseDown);
            this.modalGalleryTrack.removeEventListener("mousemove", this.handleModalMouseMove);
            this.modalGalleryTrack.removeEventListener("mouseup", this.handleModalMouseUp);
        }
    }
    
    handleModalTouchStart(e) {
        if (this.modalGalleryImages.length <= 1) return;
        
        this.isModalSwiping = true;
        this.modalSwipeStartX = e.touches[0].clientX;
        this.modalSwipeEndX = this.modalSwipeStartX;
    }
    
    handleModalTouchMove(e) {
        if (!this.isModalSwiping || this.modalGalleryImages.length <= 1) return;
        
        e.preventDefault();
        this.modalSwipeEndX = e.touches[0].clientX;
    }
    
    handleModalTouchEnd() {
        if (!this.isModalSwiping || this.modalGalleryImages.length <= 1) return;
        
        const diff = this.modalSwipeStartX - this.modalSwipeEndX;
        const absDiff = Math.abs(diff);
        const threshold = 50;
        
        if (absDiff > threshold) {
            if (diff > 0) {
                this.nextModalGalleryImage();
            } else {
                this.prevModalGalleryImage();
            }
        }
        
        this.isModalSwiping = false;
    }
    
    handleModalMouseDown(e) {
        if (this.modalGalleryImages.length <= 1) return;
        
        this.isModalSwiping = true;
        this.modalSwipeStartX = e.clientX;
        this.modalSwipeEndX = this.modalSwipeStartX;
        e.preventDefault();
    }
    
    handleModalMouseMove(e) {
        if (!this.isModalSwiping || this.modalGalleryImages.length <= 1) return;
        
        this.modalSwipeEndX = e.clientX;
        e.preventDefault();
    }
    
    handleModalMouseUp() {
        if (!this.isModalSwiping || this.modalGalleryImages.length <= 1) return;
        
        const diff = this.modalSwipeStartX - this.modalSwipeEndX;
        const absDiff = Math.abs(diff);
        const threshold = 50;
        
        if (absDiff > threshold) {
            if (diff > 0) {
                this.nextModalGalleryImage();
            } else {
                this.prevModalGalleryImage();
            }
        }
        
        this.isModalSwiping = false;
    }
    
    prevModalGalleryImage() {
        if (this.modalGalleryImages.length === 0) return;
        
        this.currentModalGalleryIndex = this.currentModalGalleryIndex === 0 ? this.modalGalleryImages.length - 1 : this.currentModalGalleryIndex - 1;
        this.updateModalGalleryTransform();
        this.updateModalGalleryCounter();
    }
    
    nextModalGalleryImage() {
        if (this.modalGalleryImages.length === 0) return;
        
        this.currentModalGalleryIndex = this.currentModalGalleryIndex === this.modalGalleryImages.length - 1 ? 0 : this.currentModalGalleryIndex + 1;
        this.updateModalGalleryTransform();
        this.updateModalGalleryCounter();
    }
    
    showPreviousCard() {
        if (this.filteredCards.length === 0) return;
        
        this.currentModalIndex = this.currentModalIndex === 0 ? this.filteredCards.length - 1 : this.currentModalIndex - 1;
        this.currentModalCard = this.filteredCards[this.currentModalIndex];
        this.renderModalContent(this.currentModalCard);
        this.updateModalNavigation();
    }
    
    showNextCard() {
        if (this.filteredCards.length === 0) return;
        
        this.currentModalIndex = this.currentModalIndex === this.filteredCards.length - 1 ? 0 : this.currentModalIndex + 1;
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