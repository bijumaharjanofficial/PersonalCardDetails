// Theme management system
class ThemeSystem {
    constructor() {
        this.currentTheme = 'dark';
        this.accentColor = null;
        this.isInitialized = false;
        
        // Define color palettes
        this.themes = {
            dark: {
                '--bg-primary': '#0f0f1a',
                '--bg-secondary': '#1a1a2e',
                '--bg-tertiary': '#25253a',
                '--text-primary': '#f0f0f5',
                '--text-secondary': '#b0b0c0',
                '--text-tertiary': '#808099',
                '--border-color': '#2d2d4d',
                '--shadow-color': 'rgba(0, 0, 0, 0.3)',
                '--card-shadow': '0 10px 30px rgba(0, 0, 0, 0.2)',
            },
            light: {
                '--bg-primary': '#f8f9ff',
                '--bg-secondary': '#eef0ff',
                '--bg-tertiary': '#e0e4ff',
                '--text-primary': '#1a1a2e',
                '--text-secondary': '#4a4a6e',
                '--text-tertiary': '#6a6a8e',
                '--border-color': '#d0d4ff',
                '--shadow-color': 'rgba(0, 0, 30, 0.1)',
                '--card-shadow': '0 10px 30px rgba(0, 0, 30, 0.08)',
            }
        };
        
        // Default accent colors
        this.defaultAccents = {
            primary: '#7f5af0',
            secondary: '#2cb67d',
            danger: '#f44366',
            warning: '#ffb86c',
            info: '#8a4fff'
        };
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        console.log('ThemeSystem initializing...');
        
        // Load saved theme
        this.loadTheme();
        
        // Apply initial theme
        this.applyTheme();
        
        // Add transition after initial load
        setTimeout(() => {
            document.body.classList.add('theme-transition');
        }, 100);
        
        // Initialize theme toggle buttons
        this.initThemeToggleButtons();
        
        this.isInitialized = true;
        console.log('ThemeSystem initialized');
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const savedAccent = localStorage.getItem('accentColor');
        
        if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
            this.currentTheme = savedTheme;
        } else {
            // Detect system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.currentTheme = prefersDark ? 'dark' : 'light';
        }
        
        if (savedAccent) {
            this.accentColor = savedAccent;
        }
        
        // Update body class
        document.body.classList.remove('theme-dark', 'theme-light');
        document.body.classList.add(`theme-${this.currentTheme}`);
    }
    
    saveTheme() {
        localStorage.setItem('theme', this.currentTheme);
        if (this.accentColor) {
            localStorage.setItem('accentColor', this.accentColor);
        }
    }
    
    applyTheme() {
        const theme = this.themes[this.currentTheme];
        
        // Apply base theme variables
        Object.entries(theme).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value);
        });
        
        // Apply accent colors
        this.applyAccentColors();
        
        // Update body class
        document.body.classList.remove('theme-dark', 'theme-light');
        document.body.classList.add(`theme-${this.currentTheme}`);
        
        // Update toggle button icon
        this.updateToggleButton();
        
        // Dispatch event
        this.dispatchEvent('themechange', { 
            theme: this.currentTheme, 
            accent: this.accentColor 
        });
    }
    
    applyAccentColors() {
        const primary = this.accentColor || this.defaultAccents.primary;
        
        // Set CSS variables
        document.documentElement.style.setProperty('--accent-primary', primary);
        document.documentElement.style.setProperty('--accent-secondary', this.defaultAccents.secondary);
        document.documentElement.style.setProperty('--accent-danger', this.defaultAccents.danger);
        document.documentElement.style.setProperty('--accent-warning', this.defaultAccents.warning);
        document.documentElement.style.setProperty('--accent-info', this.defaultAccents.info);
        
        // Set dynamic accent color for cards
        if (this.accentColor) {
            document.documentElement.style.setProperty('--card-accent-color', this.accentColor);
            document.body.classList.add('accent-dynamic');
        } else {
            document.documentElement.style.setProperty('--card-accent-color', this.defaultAccents.primary);
            document.body.classList.remove('accent-dynamic');
        }
    }
    
    toggleTheme() {
        console.log('Toggling theme');
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        this.saveTheme();
        return this.currentTheme;
    }
    
    setTheme(theme) {
        if (!this.themes[theme]) {
            console.error(`Invalid theme: ${theme}`);
            return false;
        }
        
        this.currentTheme = theme;
        this.applyTheme();
        this.saveTheme();
        return true;
    }
    
    setAccentColor(color) {
        if (!this.isValidColor(color)) {
            console.error(`Invalid color: ${color}`);
            return false;
        }
        
        this.accentColor = color;
        this.applyAccentColors();
        this.saveTheme();
        return true;
    }
    
    resetAccentColor() {
        this.accentColor = null;
        this.applyAccentColors();
        localStorage.removeItem('accentColor');
    }
    
    updateToggleButton() {
        const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
        
        toggleButtons.forEach(button => {
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    }
    
    isValidColor(color) {
        if (!color) return false;
        
        // Test for hex color
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (hexRegex.test(color)) return true;
        
        // Test for rgb/rgba color
        const rgbRegex = /^rgba?\((\s*\d+\s*,){2}\s*\d+\s*(,\s*\d+(\.\d+)?\s*)?\)$/;
        if (rgbRegex.test(color)) return true;
        
        // Check for named colors
        const tempElement = document.createElement('div');
        tempElement.style.color = color;
        return tempElement.style.color !== '';
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
    
    getThemeInfo() {
        return {
            theme: this.currentTheme,
            accentColor: this.accentColor,
            isDark: this.currentTheme === 'dark',
            isLight: this.currentTheme === 'light'
        };
    }
    
    initThemeToggleButtons() {
        console.log('Initializing theme toggle buttons...');
        const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
        
        toggleButtons.forEach(button => {
            // Remove any existing listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add fresh listener
            newButton.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Theme button clicked');
                
                // Trigger audio interaction if needed
                if (window.audioSystem && !audioSystem.userInteracted) {
                    console.log('Theme button triggering audio interaction');
                    audioSystem.userInteracted = true;
                    localStorage.setItem('audioInteraction', 'true');
                    audioSystem.resumeAudioContext();
                    
                    // Start music after a delay
                    setTimeout(() => {
                        if (!audioSystem.isPlaying) {
                            audioSystem.playRandomTrack();
                        }
                    }, 500);
                }
                
                // Toggle theme
                this.toggleTheme();
            });
        });
        
        this.updateToggleButton();
    }
}

// Create global instance
const themeSystem = new ThemeSystem();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = themeSystem;
}