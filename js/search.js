// Search page functionality
class SearchPage {
    constructor() {
        this.utils = utils;
        this.themeSystem = themeSystem;
        this.dataSystem = dataSystem;
        
        // State
        this.allCards = [];
        this.filteredCards = [];
        this.currentFilter = 'all';
        this.currentModalCard = null;
        this.currentModalIndex = 0;
        this.modalGalleryImages = [];
        this.currentModalGalleryIndex = 0;
        
        // Elements
        this.searchInput = document.getElementById('searchInput');
        this.cardsGrid = document.getElementById('cardsGrid');
        this.noResults = document.getElementById('noResults');
        this.resultsCount = document.getElementById('resultsCount');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.themeToggleBtn = document.getElementById('themeToggle');
        
        // Modal elements
        this.cardModal = document.getElementById('cardModal');
        this.modalClose = document.getElementById('modalClose');
        this.modalContent = document.querySelector('.modal-content');
        this.prevCardBtn = document.getElementById('prevCard');
        this.nextCardBtn = document.getElementById('nextCard');
        this.modalGallery = document.getElementById('modalGallery');
        this.modalGalleryTrack = document.getElementById('modalGalleryTrack');
        this.modalGalleryPrev = document.getElementById('modalGalleryPrev');
        this.modalGalleryNext = document.getElementById('modalGalleryNext');
        this.modalGalleryCurrent = document.getElementById('modalGalleryCurrent');
        this.modalGalleryTotal = document.getElementById('modalGalleryTotal');
        
        this.init();
    }
    
    init() {
        // Initialize theme toggle
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.themeSystem.toggleTheme());
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
        this.dataSystem.addEventListener('dataloaded', () => {
            this.allCards = this.dataSystem.getAllCards();
            this.filteredCards = [...this.allCards];
            this.renderCards();
            this.updateResultsCount();
        });
        
        // If data is already loaded
        if (this.dataSystem.cards.length > 0) {
            this.allCards = this.dataSystem.getAllCards();
            this.filteredCards = [...this.allCards];
            this.renderCards();
            this.updateResultsCount();
        }
    }
    
    initEventListeners() {
        // Search input with debounce
        if (this.searchInput) {
            const debouncedSearch = this.utils.debounce(() => this.handleSearch(), 300);
            this.searchInput.addEventListener('input', debouncedSearch);
        }
        
        // Filter buttons
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilterClick(e));
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Close modal with Escape key
            if (e.key === 'Escape' && !this.cardModal.classList.contains('hidden')) {
                this.closeModal();
            }
            
            // Navigate modal with arrow keys
            if (!this.cardModal.classList.contains('hidden')) {
                if (e.key === 'ArrowLeft') {
                    this.showPreviousCard();
                } else if (e.key === 'ArrowRight') {
                    this.showNextCard();
                }
            }
        });
    }
    
    initModal() {
        // Close modal button
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => this.closeModal());
        }
        
        // Modal overlay click to close
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => this.closeModal());
        }
        
        // Navigation buttons
        if (this.prevCardBtn) {
            this.prevCardBtn.addEventListener('click', () => this.showPreviousCard());
        }
        
        if (this.nextCardBtn) {
            this.nextCardBtn.addEventListener('click', () => this.showNextCard());
        }
        
        // Gallery navigation
        if (this.modalGalleryPrev) {
            this.modalGalleryPrev.addEventListener('click', () => this.prevModalGalleryImage());
        }
        
        if (this.modalGalleryNext) {
            this.modalGalleryNext.addEventListener('click', () => this.nextModalGalleryImage());
        }
    }
    
    handleSearch() {
        const query = this.searchInput.value.trim();
        this.filteredCards = this.dataSystem.searchCards(query);
        this.applyCurrentFilter();
        this.renderCards();
        this.updateResultsCount();
    }
    
    handleFilterClick(event) {
        const filter = event.target.dataset.filter;
        
        // Update active filter
        this.filterButtons.forEach(button => {
            button.classList.remove('active');
        });
        event.target.classList.add('active');
        
        this.currentFilter = filter;
        this.applyCurrentFilter();
        this.renderCards();
        this.updateResultsCount();
    }
    
    applyCurrentFilter() {
        switch (this.currentFilter) {
            case 'has-gallery':
                this.filteredCards = this.filteredCards.filter(card => 
                    card.media?.gallery && card.media.gallery.length > 0
                );
                break;
                
            case 'has-song':
                this.filteredCards = this.filteredCards.filter(card => 
                    card.favorites?.song
                );
                break;
                
            case 'all':
            default:
                // No additional filtering needed
                break;
        }
    }
    
    renderCards() {
        if (!this.cardsGrid) return;
        
        this.cardsGrid.innerHTML = '';
        
        if (this.filteredCards.length === 0) {
            this.noResults.classList.remove('hidden');
            return;
        }
        
        this.noResults.classList.add('hidden');
        
        this.filteredCards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            this.cardsGrid.appendChild(cardElement);
        });
    }
    
    createCardElement(card, index) {
        const identity = card.coreIdentity || {};
        const official = card.officialDetails || {};
        const favorites = card.favorites || {};
        
        const cardElement = this.utils.createElement('div', 'card-item');
        cardElement.style.animationDelay = `${index * 0.05}s`;
        
        // Set accent color if available
        if (favorites.color && this.themeSystem.isValidColor(favorites.color)) {
            cardElement.style.setProperty('--card-accent-color', favorites.color);
        }
        
        // Card image
        const imgWrapper = this.utils.createElement('div', 'card-img-wrapper');
        const img = this.utils.createElement('img', 'card-img');
        img.src = card.media?.dp || 'assets/images/placeholder.png';
        img.alt = `${identity.firstName}'s display picture`;
        
        // Add hover effect
        img.addEventListener('mouseenter', () => {
            img.style.transform = 'scale(1.05)';
        });
        
        img.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1)';
        });
        
        imgWrapper.appendChild(img);
        
        // Card info
        const info = this.utils.createElement('div', 'card-info');
        
        // Name and nickname
        const nameRow = this.utils.createElement('div', 'card-name');
        const firstName = this.utils.createElement('span');
        firstName.textContent = identity.firstName || 'Unknown';
        
        const badge = this.utils.createElement('span', 'card-badge');
        if (official.cardType) {
            badge.textContent = official.cardType;
            badge.style.backgroundColor = favorites.color ? 
                `${favorites.color}30` : 'rgba(127, 90, 240, 0.2)';
            badge.style.color = favorites.color || '#7f5af0';
        }
        
        nameRow.appendChild(firstName);
        nameRow.appendChild(badge);
        
        // Nickname
        let nicknameRow = null;
        if (identity.nickname) {
            nicknameRow = this.utils.createElement('div', 'card-nickname');
            nicknameRow.textContent = `"${identity.nickname}"`;
        }
        
        // Meta info
        const meta = this.utils.createElement('div', 'card-meta');
        
        if (identity.username) {
            const username = this.utils.createElement('span', 'card-username');
            username.textContent = `@${identity.username}`;
            meta.appendChild(username);
        }
        
        if (official.organization) {
            const org = this.utils.createElement('span', 'card-org');
            org.textContent = official.organization;
            meta.appendChild(org);
        }
        
        // Action buttons
        const actions = this.utils.createElement('div', 'card-actions');
        
        const viewBtn = this.utils.createElement('button', 'action-btn');
        viewBtn.innerHTML = '<i class="fas fa-eye"></i> View';
        viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openCardModal(card);
        });
        
        const detailsBtn = this.utils.createElement('button', 'action-btn');
        detailsBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> Page';
        detailsBtn.addEventListener('click', (e) => {
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
        
        // Add click event to open modal (double click)
        let clickCount = 0;
        cardElement.addEventListener('click', () => {
            clickCount++;
            
            if (clickCount === 1) {
                setTimeout(() => {
                    if (clickCount === 1) {
                        // Single click - do nothing or add highlight
                        cardElement.classList.toggle('selected');
                    }
                    clickCount = 0;
                }, 300);
            } else if (clickCount === 2) {
                // Double click - open modal
                this.openCardModal(card);
                clickCount = 0;
            }
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
        this.currentModalIndex = this.filteredCards.findIndex(c => c.id === card.id);
        
        // Render modal content
        this.renderModalContent(card);
        
        // Show modal
        this.cardModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Update navigation buttons state
        this.updateModalNavigation();
    }
    
    closeModal() {
        this.cardModal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Clear modal content
        if (this.modalContent) {
            this.modalContent.innerHTML = '';
        }
        
        // Hide gallery
        if (this.modalGallery) {
            this.modalGallery.classList.add('hidden');
        }
    }
    
    renderModalContent(card) {
        if (!this.modalContent) return;
        
        const identity = card.coreIdentity || {};
        const official = card.officialDetails || {};
        
        // Create modal card layout
        const modalCard = this.utils.createElement('div', 'modal-card');
        
        // Avatar section
        const avatarSection = this.utils.createElement('div', 'modal-avatar');
        
        const avatarImg = this.utils.createElement('img', 'modal-avatar-img');
        avatarImg.src = card.media?.dp || 'assets/images/placeholder.png';
        avatarImg.alt = `${identity.firstName}'s display picture`;
        
        const avatarName = this.utils.createElement('h3', 'modal-avatar-name');
        avatarName.textContent = identity.firstName || 'Unknown';
        
        if (identity.lastName) {
            avatarName.textContent += ` ${identity.lastName}`;
        }
        
        if (identity.nickname) {
            const nickname = this.utils.createElement('p', 'modal-nickname');
            nickname.textContent = `"${identity.nickname}"`;
            avatarSection.appendChild(nickname);
        }
        
        avatarSection.appendChild(avatarImg);
        avatarSection.appendChild(avatarName);
        
        // Basic info section
        const infoSection = this.utils.createElement('div', 'modal-basic-info');
        
        const infoFields = [
            { label: 'Username', value: identity.username ? `@${identity.username}` : '' },
            { label: 'Card Type', value: official.cardType },
            { label: 'Organization', value: official.organization },
            { label: 'Role', value: official.role },
            { label: 'Gender', value: identity.gender },
            { label: 'Nationality', value: identity.nationality },
            { label: 'Age', value: identity.age || (identity.dateOfBirth ? 
                this.utils.calculateAge(identity.dateOfBirth) : '') },
            { label: 'Personality', value: card.personalityTraits?.personalityType }
        ];
        
        infoFields.forEach(field => {
            if (field.value) {
                const row = this.utils.createElement('div', 'modal-info-row');
                
                const label = this.utils.createElement('span', 'modal-info-label');
                label.textContent = field.label;
                
                const value = this.utils.createElement('span', 'modal-info-value');
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
                this.modalGallery.classList.add('hidden');
            }
            return;
        }
        
        // Show gallery
        if (this.modalGallery) {
            this.modalGallery.classList.remove('hidden');
        }
        
        // Set gallery data
        this.modalGalleryImages = gallery;
        this.currentModalGalleryIndex = 0;
        
        // Render gallery
        this.renderModalGallery();
    }
    
    renderModalGallery() {
        if (!this.modalGalleryTrack) return;
        
        this.modalGalleryTrack.innerHTML = '';
        this.modalGalleryTrack.style.transform = `translateX(-${this.currentModalGalleryIndex * 100}%)`;
        
        this.modalGalleryImages.forEach((imageSrc, index) => {
            const slide = this.utils.createElement('div', 'gallery-slide');
            const img = this.utils.createElement('img', 'gallery-img');
            img.src = imageSrc;
            img.alt = `Gallery image ${index + 1}`;
            
            slide.appendChild(img);
            this.modalGalleryTrack.appendChild(slide);
        });
        
        // Update counter
        if (this.modalGalleryCurrent && this.modalGalleryTotal) {
            this.modalGalleryCurrent.textContent = this.currentModalGalleryIndex + 1;
            this.modalGalleryTotal.textContent = this.modalGalleryImages.length;
        }
    }
    
    prevModalGalleryImage() {
        if (this.modalGalleryImages.length === 0) return;
        
        this.currentModalGalleryIndex = this.currentModalGalleryIndex === 0 ? 
            this.modalGalleryImages.length - 1 : 
            this.currentModalGalleryIndex - 1;
        
        this.renderModalGallery();
    }
    
    nextModalGalleryImage() {
        if (this.modalGalleryImages.length === 0) return;
        
        this.currentModalGalleryIndex = this.currentModalGalleryIndex === this.modalGalleryImages.length - 1 ? 
            0 : 
            this.currentModalGalleryIndex + 1;
        
        this.renderModalGallery();
    }
    
    showPreviousCard() {
        if (this.filteredCards.length === 0) return;
        
        this.currentModalIndex = this.currentModalIndex === 0 ? 
            this.filteredCards.length - 1 : 
            this.currentModalIndex - 1;
        
        this.currentModalCard = this.filteredCards[this.currentModalIndex];
        this.renderModalContent(this.currentModalCard);
        this.updateModalNavigation();
    }
    
    showNextCard() {
        if (this.filteredCards.length === 0) return;
        
        this.currentModalIndex = this.currentModalIndex === this.filteredCards.length - 1 ? 
            0 : 
            this.currentModalIndex + 1;
        
        this.currentModalCard = this.filteredCards[this.currentModalIndex];
        this.renderModalContent(this.currentModalCard);
        this.updateModalNavigation();
    }
    
    updateModalNavigation() {
        // Update navigation button states based on current index
        // Could add visual indicators for first/last card
    }
}

// Initialize search page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SearchPage();
});