// Shared utility functions
class Utils {
    constructor() {
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;
    }

    // DOM helper functions
    $(selector) {
        return document.querySelector(selector);
    }

    $$(selector) {
        return document.querySelectorAll(selector);
    }

    createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    }

    // Debounce function for search input
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Format date
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Calculate age from date of birth
    calculateAge(dobString) {
        if (!dobString) return '';
        
        const dob = new Date(dobString);
        if (isNaN(dob.getTime())) return '';
        
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        
        return age;
    }

    // Validate URL parameters
    getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        
        for (const [key, value] of params) {
            result[key] = value.trim();
        }
        
        return result;
    }

    // Parse JSON with error handling
    safeParse(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Failed to parse JSON:', error);
            return null;
        }
    }

    // Generate random ID
    generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Create particles for background
    createParticles(container, count = 50) {
        if (!container) return;
        
        for (let i = 0; i < count; i++) {
            const particle = this.createElement('div', 'particle');
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.width = `${Math.random() * 4 + 2}px`;
            particle.style.height = particle.style.width;
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            particle.style.animationDelay = `${Math.random() * 20}s`;
            particle.style.animationDuration = `${Math.random() * 20 + 10}s`;
            
            // Random color based on theme
            const colors = ['#7f5af0', '#2cb67d', '#f44366', '#ffb86c', '#8a4fff'];
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            container.appendChild(particle);
        }
    }

    // Create loading skeleton
    createSkeleton(type = 'card', count = 1) {
        const skeletons = [];
        
        for (let i = 0; i < count; i++) {
            const skeleton = this.createElement('div', `skeleton skeleton-${type}`);
            skeletons.push(skeleton);
        }
        
        return count === 1 ? skeletons[0] : skeletons;
    }

    // Copy text to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Failed to copy:', error);
            
            // Fallback method
            const textArea = this.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (fallbackError) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    }

    // Show notification toast
    showToast(message, type = 'info', duration = 3000) {
        const toast = this.createElement('div', `toast toast-${type}`);
        toast.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            .toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 24px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                max-width: 400px;
            }
            .toast-info { background-color: #7f5af0; }
            .toast-success { background-color: #2cb67d; }
            .toast-warning { background-color: #ffb86c; color: #1a1a2e; }
            .toast-error { background-color: #f44366; }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Get contrast color (for text on colored backgrounds)
    getContrastColor(hexColor) {
        if (!hexColor) return '#ffffff';
        
        // Convert hex to RGB
        let r = 0, g = 0, b = 0;
        
        if (hexColor.length === 4) {
            r = parseInt(hexColor[1] + hexColor[1], 16);
            g = parseInt(hexColor[2] + hexColor[2], 16);
            b = parseInt(hexColor[3] + hexColor[3], 16);
        } else if (hexColor.length === 7) {
            r = parseInt(hexColor[1] + hexColor[2], 16);
            g = parseInt(hexColor[3] + hexColor[4], 16);
            b = parseInt(hexColor[5] + hexColor[6], 16);
        }
        
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Return black or white based on luminance
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    // Validate email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Deep clone object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // Merge objects
    mergeObjects(target, source) {
        for (const key in source) {
            if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key] || typeof target[key] !== 'object') {
                    target[key] = {};
                }
                this.mergeObjects(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }

    // Check if object is empty
    isEmpty(obj) {
        if (!obj) return true;
        return Object.keys(obj).length === 0;
    }

    // Sleep/wait function
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Generate gradient from color
    generateGradient(color) {
        if (!color) return 'linear-gradient(135deg, #7f5af0, #2cb67d)';
        
        // Convert hex to RGB
        let r = 0, g = 0, b = 0;
        
        if (color.length === 4) {
            r = parseInt(color[1] + color[1], 16);
            g = parseInt(color[2] + color[2], 16);
            b = parseInt(color[3] + color[3], 16);
        } else if (color.length === 7) {
            r = parseInt(color[1] + color[2], 16);
            g = parseInt(color[3] + color[4], 16);
            b = parseInt(color[5] + color[6], 16);
        }
        
        // Generate complementary color
        const compR = (r + 128) % 256;
        const compG = (g + 128) % 256;
        const compB = (b + 128) % 256;
        
        const compColor = `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`;
        
        return `linear-gradient(135deg, ${color}, ${compColor})`;
    }
}

// Create global instance
const utils = new Utils();
utils.init();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
}