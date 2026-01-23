// Data management system for carddata.json
class DataSystem {
  constructor() {
    this.cards = [];
    this.isLoading = false;
    this.dataUrl = "data/carddata.json";
    this.cacheKey = "identity-cards-cache";
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes

    this.init();
  }

  init() {
    // Try to load from cache first
    this.loadFromCache();
  }

  async loadData() {
    if (this.isLoading) {
      return new Promise((resolve) => {
        const checkLoading = setInterval(() => {
          if (!this.isLoading) {
            clearInterval(checkLoading);
            resolve(this.cards);
          }
        }, 100);
      });
    }

    this.isLoading = true;

    try {
      const response = await fetch(this.dataUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.cards = data.cards || [];

      // Cache the data
      this.saveToCache(data);

      // Dispatch event
      this.dispatchEvent("dataloaded", { cards: this.cards });

      return this.cards;
    } catch (error) {
      console.error("Error loading card data:", error);

      // Try to load from cache as fallback
      if (this.cards.length === 0) {
        this.loadFromCache();
      }

      this.dispatchEvent("dataerror", { error });

      return this.cards;
    } finally {
      this.isLoading = false;
    }
  }

  saveToCache(data) {
    try {
      const cacheData = {
        data: data,
        timestamp: Date.now(),
      };

      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  }

  loadFromCache() {
    try {
      const cacheString = localStorage.getItem(this.cacheKey);

      if (!cacheString) return false;

      const cacheData = JSON.parse(cacheString);
      const now = Date.now();

      // Check if cache is expired
      if (now - cacheData.timestamp > this.cacheExpiry) {
        localStorage.removeItem(this.cacheKey);
        return false;
      }

      this.cards = cacheData.data.cards || [];

      // Dispatch event
      this.dispatchEvent("dataloadedfromcache", { cards: this.cards });

      return true;
    } catch (error) {
      console.error("Error loading from cache:", error);
      return false;
    }
  }

  getAllCards() {
    return this.cards;
  }

  getCardById(id) {
    if (!id) return null;

    return this.cards.find(
      (card) =>
        card.id === id ||
        card.coreIdentity?.username === id ||
        card.coreIdentity?.firstName?.toLowerCase() === id.toLowerCase() ||
        card.coreIdentity?.lastName?.toLowerCase() === id.toLowerCase() ||
        card.coreIdentity?.nickname?.toLowerCase() === id.toLowerCase(),
    );
  }

  getCardByName(name) {
    if (!name) return null;

    const nameLower = name.toLowerCase();

    return this.cards.find((card) => {
      const firstName = card.coreIdentity?.firstName?.toLowerCase() || "";
      const lastName = card.coreIdentity?.lastName?.toLowerCase() || "";
      const nickname = card.coreIdentity?.nickname?.toLowerCase() || "";
      const username = card.coreIdentity?.username?.toLowerCase() || "";

      return (
        firstName.includes(nameLower) ||
        lastName.includes(nameLower) ||
        nickname.includes(nameLower) ||
        username.includes(nameLower) ||
        `${firstName} ${lastName}`.includes(nameLower)
      );
    });
  }

  searchCards(query) {
    if (!query || query.trim() === "") {
      return this.cards;
    }

    const queryLower = query.toLowerCase().trim();

    return this.cards.filter((card) => {
      // Search in core identity
      const firstName = card.coreIdentity?.firstName?.toLowerCase() || "";
      const lastName = card.coreIdentity?.lastName?.toLowerCase() || "";
      const nickname = card.coreIdentity?.nickname?.toLowerCase() || "";
      const username = card.coreIdentity?.username?.toLowerCase() || "";

      // Search in official details
      const cardNumber = card.officialDetails?.cardNumber?.toLowerCase() || "";
      const cardType = card.officialDetails?.cardType?.toLowerCase() || "";
      const organization =
        card.officialDetails?.organization?.toLowerCase() || "";
      const role = card.officialDetails?.role?.toLowerCase() || "";

      // Search in personality
      const personalityType =
        card.personalityTraits?.personalityType?.toLowerCase() || "";

      // Search in favorites
      const musicGenre = card.favorites?.musicGenre?.toLowerCase() || "";
      const artist = card.favorites?.artist?.toLowerCase() || "";
      const anime = card.favorites?.anime?.toLowerCase() || "";

      // Check if any field contains the query
      return (
        firstName.includes(queryLower) ||
        lastName.includes(queryLower) ||
        nickname.includes(queryLower) ||
        username.includes(queryLower) ||
        cardNumber.includes(queryLower) ||
        cardType.includes(queryLower) ||
        organization.includes(queryLower) ||
        role.includes(queryLower) ||
        personalityType.includes(queryLower) ||
        musicGenre.includes(queryLower) ||
        artist.includes(queryLower) ||
        anime.includes(queryLower) ||
        card.id?.toLowerCase().includes(queryLower)
      );
    });
  }

  filterCards(criteria) {
    return this.cards.filter((card) => {
      // Check each criterion
      for (const [key, value] of Object.entries(criteria)) {
        if (value === undefined || value === null) continue;

        switch (key) {
          case "hasGallery":
            if (
              value &&
              (!card.media?.gallery || card.media.gallery.length === 0)
            ) {
              return false;
            }
            if (
              !value &&
              card.media?.gallery &&
              card.media.gallery.length > 0
            ) {
              return false;
            }
            break;

          case "hasSong":
            if (value && !card.favorites?.song) {
              return false;
            }
            if (!value && card.favorites?.song) {
              return false;
            }
            break;

          case "cardType":
            if (
              card.officialDetails?.cardType?.toLowerCase() !==
              value.toLowerCase()
            ) {
              return false;
            }
            break;

          case "organization":
            if (
              card.officialDetails?.organization?.toLowerCase() !==
              value.toLowerCase()
            ) {
              return false;
            }
            break;

          default:
            // Check if the property exists and matches
            const keys = key.split(".");
            let current = card;

            for (const k of keys) {
              if (current[k] === undefined) {
                current = null;
                break;
              }
              current = current[k];
            }

            if (
              current === null ||
              current.toString().toLowerCase() !==
                value.toString().toLowerCase()
            ) {
              return false;
            }
        }
      }

      return true;
    });
  }

  getCardIndex(id) {
    return this.cards.findIndex((card) => card.id === id);
  }

  getNextCard(currentId) {
    const currentIndex = this.getCardIndex(currentId);

    if (currentIndex === -1 || currentIndex === this.cards.length - 1) {
      return this.cards[0] || null;
    }

    return this.cards[currentIndex + 1];
  }

  getPreviousCard(currentId) {
    const currentIndex = this.getCardIndex(currentId);

    if (currentIndex === -1 || currentIndex === 0) {
      return this.cards[this.cards.length - 1] || null;
    }

    return this.cards[currentIndex - 1];
  }

  getRandomCard() {
    if (this.cards.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * this.cards.length);
    return this.cards[randomIndex];
  }

  getCardsCount() {
    return this.cards.length;
  }

  getCardsByOrganization(organization) {
    return this.cards.filter(
      (card) =>
        card.officialDetails?.organization?.toLowerCase() ===
        organization.toLowerCase(),
    );
  }

  getCardsByType(cardType) {
    return this.cards.filter(
      (card) =>
        card.officialDetails?.cardType?.toLowerCase() ===
        cardType.toLowerCase(),
    );
  }

  getUniqueOrganizations() {
    const organizations = new Set();

    this.cards.forEach((card) => {
      if (card.officialDetails?.organization) {
        organizations.add(card.officialDetails.organization);
      }
    });

    return Array.from(organizations);
  }

  getUniqueCardTypes() {
    const cardTypes = new Set();

    this.cards.forEach((card) => {
      if (card.officialDetails?.cardType) {
        cardTypes.add(card.officialDetails.cardType);
      }
    });

    return Array.from(cardTypes);
  }

  validateCard(card) {
    if (!card || typeof card !== "object") {
      return { isValid: false, errors: ["Card is not an object"] };
    }

    const errors = [];

    // Check required fields
    if (!card.id) {
      errors.push("Missing required field: id");
    }

    if (!card.coreIdentity || typeof card.coreIdentity !== "object") {
      errors.push("Missing required field: coreIdentity");
    } else {
      if (!card.coreIdentity.firstName) {
        errors.push("Missing required field: coreIdentity.firstName");
      }
    }

    // Check media field
    if (!card.media || typeof card.media !== "object") {
      errors.push("Missing required field: media");
    } else {
      if (!card.media.dp) {
        errors.push("Missing required field: media.dp");
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  addCard(card) {
    const validation = this.validateCard(card);

    if (!validation.isValid) {
      console.error("Invalid card:", validation.errors);
      return { success: false, errors: validation.errors };
    }

    // Check if card with same ID already exists
    if (this.getCardById(card.id)) {
      return { success: false, errors: ["Card with this ID already exists"] };
    }

    this.cards.push(card);

    // Update cache
    this.saveToCache({ cards: this.cards });

    // Dispatch event
    this.dispatchEvent("cardadded", { card });

    return { success: true, card };
  }

  updateCard(id, updates) {
    const cardIndex = this.getCardIndex(id);

    if (cardIndex === -1) {
      return { success: false, errors: ["Card not found"] };
    }

    // Merge updates with existing card
    this.cards[cardIndex] = { ...this.cards[cardIndex], ...updates };

    // Update cache
    this.saveToCache({ cards: this.cards });

    // Dispatch event
    this.dispatchEvent("cardupdated", { card: this.cards[cardIndex] });

    return { success: true, card: this.cards[cardIndex] };
  }

  removeCard(id) {
    const cardIndex = this.getCardIndex(id);

    if (cardIndex === -1) {
      return { success: false, errors: ["Card not found"] };
    }

    const removedCard = this.cards.splice(cardIndex, 1)[0];

    // Update cache
    this.saveToCache({ cards: this.cards });

    // Dispatch event
    this.dispatchEvent("cardremoved", { card: removedCard });

    return { success: true, card: removedCard };
  }

  getStatistics() {
    const stats = {
      totalCards: this.cards.length,
      cardsWithGallery: this.cards.filter(
        (card) => card.media?.gallery?.length > 0,
      ).length,
      cardsWithSong: this.cards.filter((card) => card.favorites?.song).length,
      cardsWithStory: this.cards.filter((card) => card.storyMode).length,
      uniqueOrganizations: this.getUniqueOrganizations().length,
      uniqueCardTypes: this.getUniqueCardTypes().length,
      genderDistribution: {},
      nationalityDistribution: {},
    };

    // Calculate gender distribution
    this.cards.forEach((card) => {
      const gender = card.coreIdentity?.gender || "Unknown";
      stats.genderDistribution[gender] =
        (stats.genderDistribution[gender] || 0) + 1;
    });

    // Calculate nationality distribution
    this.cards.forEach((card) => {
      const nationality = card.coreIdentity?.nationality || "Unknown";
      stats.nationalityDistribution[nationality] =
        (stats.nationalityDistribution[nationality] || 0) + 1;
    });

    return stats;
  }

  exportData() {
    return JSON.stringify({ cards: this.cards }, null, 2);
  }

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      if (!data.cards || !Array.isArray(data.cards)) {
        throw new Error("Invalid data format");
      }

      // Validate each card
      const invalidCards = [];
      const validCards = [];

      data.cards.forEach((card, index) => {
        const validation = this.validateCard(card);

        if (validation.isValid) {
          validCards.push(card);
        } else {
          invalidCards.push({ index, errors: validation.errors });
        }
      });

      if (invalidCards.length > 0) {
        console.warn("Some cards failed validation:", invalidCards);
      }

      this.cards = validCards;

      // Update cache
      this.saveToCache({ cards: this.cards });

      // Dispatch event
      this.dispatchEvent("dataimported", {
        total: data.cards.length,
        valid: validCards.length,
        invalid: invalidCards.length,
        invalidCards: invalidCards,
      });

      return {
        success: true,
        total: data.cards.length,
        valid: validCards.length,
        invalid: invalidCards.length,
        invalidCards: invalidCards,
      };
    } catch (error) {
      console.error("Error importing data:", error);
      return { success: false, error: error.message };
    }
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
}

// Create global instance
const dataSystem = new DataSystem();

// Load data when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  dataSystem.loadData();
});

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = dataSystem;
}
