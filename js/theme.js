// Theme management system
class ThemeSystem {
    constructor() {
        this.currentTheme = 'dark';
        this.accentColor = null;
        this.isInitialized = false;
        this.transitionEnabled = false;
        
        // Define color palettes for themes
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
        
        // Load saved theme from localStorage
        this.loadTheme();
        
        // Apply initial theme
        this.applyTheme();
        
        // Add transition class after initial load
        setTimeout(() => {
            document.body.classList.add('theme-transition');
            this.transitionEnabled = true;
        }, 100);
        
        this.isInitialized = true;
    }
    
    // Load theme from localStorage
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
    
    // Save theme to localStorage
    saveTheme() {
        localStorage.setItem('theme', this.currentTheme);
        if (this.accentColor) {
            localStorage.setItem('accentColor', this.accentColor);
        }
    }
    
    // Apply theme to document
    applyTheme() {
        const theme = this.themes[this.currentTheme];
        
        // Apply base theme variables
        for (const [property, value] of Object.entries(theme)) {
            document.documentElement.style.setProperty(property, value);
        }
        
        // Apply accent colors
        this.applyAccentColors();
        
        // Update body class
        document.body.classList.remove('theme-dark', 'theme-light');
        document.body.classList.add(`theme-${this.currentTheme}`);
        
        // Dispatch theme change event
        this.dispatchEvent('themechange', { theme: this.currentTheme, accent: this.accentColor });
    }
    
    // Apply accent colors
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
    
    // Toggle between dark and light themes
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        this.saveTheme();
        
        // Update toggle button icon
        this.updateToggleButton();
        
        return this.currentTheme;
    }
    
    // Set specific theme
    setTheme(theme) {
        if (!this.themes[theme]) {
            console.error(`Invalid theme: ${theme}`);
            return false;
        }
        
        this.currentTheme = theme;
        this.applyTheme();
        this.saveTheme();
        this.updateToggleButton();
        
        return true;
    }
    
    // Set accent color
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
    
    // Reset to default accent
    resetAccentColor() {
        this.accentColor = null;
        this.applyAccentColors();
        localStorage.removeItem('accentColor');
    }
    
    // Update toggle button icon
    updateToggleButton() {
        const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
        
        toggleButtons.forEach(button => {
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    }
    
    // Validate color (hex, rgb, hsl, or named color)
    isValidColor(color) {
        if (!color) return false;
        
        // Test for hex color
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (hexRegex.test(color)) return true;
        
        // Test for rgb/rgba color
        const rgbRegex = /^rgb(a?)\((\s*\d+\s*,){2}\s*\d+\s*(,\s*\d+(\.\d+)?\s*)?\)$/;
        if (rgbRegex.test(color)) return true;
        
        // Test for hsl/hsla color
        const hslRegex = /^hsl(a?)\((\s*\d+\s*,){2}\s*\d+%\s*(,\s*\d+(\.\d+)?\s*)?\)$/;
        if (hslRegex.test(color)) return true;
        
        // Check for named colors
        const tempElement = document.createElement('div');
        tempElement.style.color = color;
        return tempElement.style.color !== '';
    }
    
    // Generate complementary color
    generateComplementaryColor(color) {
        if (!this.isValidColor(color)) return this.defaultAccents.secondary;
        
        // Simple complement generation for hex colors
        if (color.startsWith('#')) {
            let hex = color.slice(1);
            
            if (hex.length === 3) {
                hex = hex.split('').map(c => c + c).join('');
            }
            
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            
            // Calculate complement
            const compR = (255 - r).toString(16).padStart(2, '0');
            const compG = (255 - g).toString(16).padStart(2, '0');
            const compB = (255 - b).toString(16).padStart(2, '0');
            
            return `#${compR}${compG}${compB}`;
        }
        
        return this.defaultAccents.secondary;
    }
    
    // Get contrast color (for text on colored backgrounds)
    getContrastColor(color) {
        if (!this.isValidColor(color)) return '#ffffff';
        
        // Convert to RGB
        let r, g, b;
        
        if (color.startsWith('#')) {
            let hex = color.slice(1);
            
            if (hex.length === 3) {
                hex = hex.split('').map(c => c + c).join('');
            }
            
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
        } else {
            // For simplicity, return white for non-hex colors
            return '#ffffff';
        }
        
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        return luminance > 0.5 ? '#000000' : '#ffffff';
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
    
    // Get current theme info
    getThemeInfo() {
        return {
            theme: this.currentTheme,
            accentColor: this.accentColor,
            isDark: this.currentTheme === 'dark',
            isLight: this.currentTheme === 'light'
        };
    }
    
    // Initialize theme toggle buttons
    initThemeToggleButtons() {
        const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => this.toggleTheme());
        });
        
        this.updateToggleButton();
    }
}

// Create global instance
const themeSystem = new ThemeSystem();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    themeSystem.initThemeToggleButtons();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = themeSystem;
}