// Shared utility functions
class Utils {
    constructor() {
        this.initialized = false;
        this.mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.performance = window.performance && window.performance.now ? window.performance : Date;
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;
        
        // Initialize any required polyfills
        this.initPolyfills();
    }

    // Initialize polyfills for older browsers
    initPolyfills() {
        // requestAnimationFrame polyfill
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = (callback) => {
                return setTimeout(callback, 1000 / 60);
            };
        }
        
        // cancelAnimationFrame polyfill
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = (id) => {
                clearTimeout(id);
            };
        }
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
        if (content) {
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else {
                element.appendChild(content);
            }
        }
        return element;
    }

    // Debounce function for search input
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const context = this;
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
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
    isInViewport(element, threshold = 0) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        return (
            rect.top <= windowHeight * (1 - threshold) &&
            rect.left <= windowWidth &&
            rect.bottom >= 0 &&
            rect.right >= 0
        );
    }

    // Create particles for background
    createParticles(container, count = 50) {
        if (!container) return;
        
        // Reduce count on mobile for performance
        if (this.mobile) {
            count = Math.floor(count / 2);
        }
        
        for (let i = 0; i < count; i++) {
            const particle = this.createElement('div', 'particle');
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            // Smaller particles on mobile
            const size = this.mobile ? Math.random() * 3 + 1 : Math.random() * 4 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            particle.style.animationDelay = `${Math.random() * 20}s`;
            particle.style.animationDuration = `${Math.random() * 20 + 10}s`;
            
            // Random color based on theme
            const colors = ['#7f5af0', '#2cb67d', '#f44366', '#ffb86c', '#8a4fff'];
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Disable animations on mobile for performance
            if (this.mobile) {
                particle.style.animation = 'none';
            }
            
            container.appendChild(particle);
        }
    }

    // Create loading skeleton
    createSkeleton(type = 'card', count = 1) {
        const skeletons = [];
        
        for (let i = 0; i < count; i++) {
            const skeleton = this.createElement('div', `skeleton skeleton-${type}`);
            
            // Different skeleton types
            switch (type) {
                case 'card':
                    skeleton.style.height = '200px';
                    break;
                case 'text':
                    skeleton.style.height = '16px';
                    skeleton.style.width = '80%';
                    break;
                case 'circle':
                    skeleton.style.height = '100px';
                    skeleton.style.width = '100px';
                    skeleton.style.borderRadius = '50%';
                    break;
                case 'avatar':
                    skeleton.style.height = '80px';
                    skeleton.style.width = '80px';
                    skeleton.style.borderRadius = '50%';
                    break;
            }
            
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
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
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
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
        
        const toast = this.createElement('div', `toast toast-${type}`);
        toast.textContent = message;
        toast.style.cssText = `
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
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        
        // Type-specific styles
        const typeStyles = {
            info: 'background-color: #7f5af0;',
            success: 'background-color: #2cb67d;',
            warning: 'background-color: #ffb86c; color: #1a1a2e;',
            error: 'background-color: #f44366;'
        };
        
        toast.style.cssText += typeStyles[type] || typeStyles.info;
        
        document.body.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
        
        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        });
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
        } else {
            return '#ffffff';
        }
        
        // Calculate luminance (perceived brightness)
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
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.reduce((arr, item, i) => {
            arr[i] = this.deepClone(item);
            return arr;
        }, []);
        if (typeof obj === 'object') {
            return Object.keys(obj).reduce((newObj, key) => {
                newObj[key] = this.deepClone(obj[key]);
                return newObj;
            }, {});
        }
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
        } else {
            return 'linear-gradient(135deg, #7f5af0, #2cb67d)';
        }
        
        // Generate complementary color (rotate hue by 180 degrees)
        // Convert RGB to HSL
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        // Rotate hue by 180 degrees
        h = (h + 0.5) % 1;
        
        // Convert back to RGB
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        const compR = Math.round(r * 255);
        const compG = Math.round(g * 255);
        const compB = Math.round(b * 255);
        
        const compColor = `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`;
        
        return `linear-gradient(135deg, ${color}, ${compColor})`;
    }

    // Get device information
    getDeviceInfo() {
        return {
            mobile: this.mobile,
            touchDevice: this.touchDevice,
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            pixelRatio: window.devicePixelRatio || 1,
            orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
        };
    }

    // Detect browser capabilities
    getBrowserCapabilities() {
        return {
            localStorage: !!window.localStorage,
            sessionStorage: !!window.sessionStorage,
            serviceWorker: 'serviceWorker' in navigator,
            webGL: (() => {
                try {
                    return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('webgl');
                } catch (e) {
                    return false;
                }
            })(),
            webAudio: !!window.AudioContext || !!window.webkitAudioContext,
            webSpeech: 'speechSynthesis' in window,
            notifications: 'Notification' in window,
            geolocation: 'geolocation' in navigator
        };
    }

    // Measure performance
    startTimer(label = 'default') {
        this.timers = this.timers || {};
        this.timers[label] = this.performance.now();
    }

    stopTimer(label = 'default') {
        if (!this.timers || !this.timers[label]) {
            console.warn(`Timer "${label}" was not started`);
            return null;
        }
        
        const duration = this.performance.now() - this.timers[label];
        delete this.timers[label];
        return duration;
    }

    // Image loading helper
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    // Lazy load images
    lazyLoadImages(selector = 'img[data-src]') {
        const images = document.querySelectorAll(selector);
        
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            images.forEach(img => {
                const src = img.getAttribute('data-src');
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                }
            });
            return;
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        images.forEach(img => observer.observe(img));
    }

    // Prefetch resources
    prefetchResources(urls) {
        if (!Array.isArray(urls)) urls = [urls];
        
        urls.forEach(url => {
            const link = this.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            link.as = this.getResourceType(url);
            document.head.appendChild(link);
        });
    }

    getResourceType(url) {
        const extension = url.split('.').pop().toLowerCase();
        const types = {
            css: 'style',
            js: 'script',
            json: 'fetch',
            png: 'image',
            jpg: 'image',
            jpeg: 'image',
            gif: 'image',
            svg: 'image',
            webp: 'image',
            mp3: 'audio',
            wav: 'audio',
            ogg: 'audio',
            mp4: 'video',
            webm: 'video'
        };
        
        return types[extension] || 'fetch';
    }

    // Scroll to element smoothly
    scrollToElement(selector, offset = 0, behavior = 'smooth') {
        const element = typeof selector === 'string' ? this.$(selector) : selector;
        if (!element) return;
        
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: behavior
        });
    }

    // Add CSS to head
    addCSS(css) {
        const style = this.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
        return style;
    }

    // Remove CSS from head
    removeCSS(styleElement) {
        if (styleElement && styleElement.parentNode) {
            styleElement.parentNode.removeChild(styleElement);
        }
    }

    // Get query string parameter
    getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Set query string parameter
    setQueryParam(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    }

    // Remove query string parameter
    removeQueryParam(name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.pushState({}, '', url);
    }

    // Check if online
    isOnline() {
        return navigator.onLine;
    }

    // Add online/offline event listeners
    onNetworkChange(callback) {
        window.addEventListener('online', () => callback(true));
        window.addEventListener('offline', () => callback(false));
    }

    // Format number with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Capitalize first letter
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Truncate text with ellipsis
    truncate(text, length = 100) {
        if (text.length <= length) return text;
        return text.substr(0, length) + '...';
    }
}

// Create global instance
const utils = new Utils();
utils.init();

// Initialize lazy loading on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    utils.lazyLoadImages();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
}