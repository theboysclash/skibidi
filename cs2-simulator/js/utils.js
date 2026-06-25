/**
 * CS2 Case Opening Simulator - Utility Functions
 * General purpose helper functions
 */

/**
 * Format a number as currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * Format a date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Generate a random string of specified length
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
function generateRandomString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Calculate SHA-256 hash of a string
 * @param {string} message - String to hash
 * @returns {Promise<string>} Hash as hex string
 */
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get CSS class name for rarity
 * @param {string} rarity - Rarity name
 * @returns {string} CSS class name
 */
function getRarityClass(rarity) {
    const rarityLower = rarity.toLowerCase();
    if (rarityLower.includes('consumer')) return 'rarity-consumer';
    if (rarityLower.includes('industrial')) return 'rarity-industrial';
    if (rarityLower.includes('milspec')) return 'rarity-milspec';
    if (rarityLower.includes('restricted')) return 'rarity-restricted';
    if (rarityLower.includes('classified')) return 'rarity-classified';
    if (rarityLower.includes('covert')) return 'rarity-covert';
    if (rarityLower.includes('gold')) return 'rarity-gold';
    return 'rarity-consumer';
}

/**
 * Get color for rarity
 * @param {string} rarity - Rarity name
 * @returns {string} Color hex code
 */
function getRarityColor(rarity) {
    const rarityUpper = rarity.toUpperCase();
    if (RARITIES[rarityUpper]) {
        return RARITIES[rarityUpper].color;
    }
    return '#b0b0b0';
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Ease out cubic function for smooth animations
 * @param {number} t - Time (0-1)
 * @returns {number} Eased value
 */
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

/**
 * Ease in out function for smooth animations
 * @param {number} t - Time (0-1)
 * @returns {number} Eased value
 */
function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
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

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Save data to localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 * @returns {boolean} Success status
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

/**
 * Load data from localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Loaded data or default value
 */
function loadFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return defaultValue;
    }
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

/**
 * Clear all localStorage
 * @returns {boolean} Success status
 */
function clearStorage() {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
}

/**
 * Download data as JSON file
 * @param {object} data - Data to export
 * @param {string} filename - Filename for download
 */
function exportJSON(data, filename = 'export.json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Read JSON file from input
 * @param {File} file - File to read
 * @returns {Promise<object>} Parsed JSON data
 */
function importJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                resolve(data);
            } catch (error) {
                reject(new Error('Invalid JSON file'));
            }
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(file);
    });
}

/**
 * Create particle effect
 * @param {string} color - Particle color
 * @param {number} count - Number of particles
 */
function createParticles(color = '#ffd700', count = 50) {
    const container = document.createElement('div');
    container.className = 'particle-container';
    document.body.appendChild(container);
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.background = color;
        particle.style.animationDelay = Math.random() * 2 + 's';
        particle.style.width = (Math.random() * 10 + 5) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
    
    // Remove after animation
    setTimeout(() => {
        document.body.removeChild(container);
    }, 5000);
}

/**
 * Trigger screen shake effect
 * @param {number} intensity - Shake intensity
 * @param {number} duration - Duration in ms
 */
function screenShake(intensity = 10, duration = 500) {
    document.body.style.animation = `shake ${duration}ms ease-in-out`;
    document.body.style.transform = `translate(${intensity}px, ${intensity}px)`;
    
    setTimeout(() => {
        document.body.style.animation = '';
        document.body.style.transform = '';
    }, duration);
}

// Add shake animation to stylesheet
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
`;
document.head.appendChild(shakeStyle);

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Notification type (success, error, info)
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 2rem;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: 5px;
        z-index: 10001;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Add toast animations
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(toastStyle);

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        return false;
    }
}

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCurrency,
        formatDate,
        generateRandomString,
        sha256,
        getRarityClass,
        getRarityColor,
        clamp,
        lerp,
        easeOutCubic,
        easeInOut,
        debounce,
        throttle,
        saveToStorage,
        loadFromStorage,
        removeFromStorage,
        clearStorage,
        exportJSON,
        importJSON,
        createParticles,
        screenShake,
        showToast,
        copyToClipboard
    };
}
