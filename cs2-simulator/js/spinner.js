/**
 * CS2 Case Opening Simulator - Spinner Animation System
 * Handles the case opening reel animation with realistic physics
 */

class SpinnerAnimation {
    constructor() {
        this.reel = null;
        this.isSpinning = false;
        this.animationId = null;
        this.items = [];
        this.itemWidth = 150;
        this.currentIndex = 0;
        this.targetIndex = 0;
        this.position = 0;
        this.velocity = 0;
        this.acceleration = 0;
        this.deceleration = 0.98;
        this.minVelocity = 0.1;
        
        // Animation timing
        this.startTime = 0;
        this.duration = 6000; // 6 seconds default
        this.fastModeDuration = 2000;
    }
    
    /**
     * Initialize spinner with case items
     * @param {Array} caseItems - Items from the case
     * @param {HTMLElement} reelElement - Reel DOM element
     */
    initialize(caseItems, reelElement) {
        this.reel = reelElement;
        this.items = this.generateReelItems(caseItems);
        this.renderReel();
    }
    
    /**
     * Generate reel items with weighted probabilities
     * @param {Array} caseItems - Original case items
     * @returns {Array} Generated reel items
     */
    generateReelItems(caseItems) {
        const reelItems = [];
        const totalItems = 100; // Generate 100 items for the reel
        
        // Create weighted pool based on rarities
        for (let i = 0; i < totalItems; i++) {
            const selectedItem = this.selectWeightedItem(caseItems);
            reelItems.push({
                ...selectedItem,
                float: generateFloat(),
                patternId: generatePatternId(),
                wearCondition: getWearCondition(generateFloat())
            });
        }
        
        return reelItems;
    }
    
    /**
     * Select item based on rarity weights
     * @param {Array} caseItems - Available items
     * @returns {object} Selected item
     */
    selectWeightedItem(caseItems) {
        // Determine rarity first
        const rarityKey = determineRarity();
        const rarityData = RARITIES[rarityKey];
        
        // Filter items by rarity
        const rarityItems = caseItems.filter(item => 
            item.rarity.toLowerCase() === rarityKey.toLowerCase()
        );
        
        // If no items of that rarity, use any item
        const availableItems = rarityItems.length > 0 ? rarityItems : caseItems;
        
        // Select random item from available
        return availableItems[Math.floor(Math.random() * availableItems.length)];
    }
    
    /**
     * Render the reel with items
     */
    renderReel() {
        if (!this.reel) return;
        
        this.reel.innerHTML = this.items.map((item, index) => `
            <div class="spinner-item" data-index="${index}">
                <div class="spinner-item-image" style="border-bottom: 3px solid ${getRarityColor(item.rarity)}">
                    ${item.image}
                </div>
                <div class="spinner-item-name">${item.name}</div>
                <div class="rarity-bar" style="background: ${getRarityColor(item.rarity)}"></div>
            </div>
        `).join('');
    }
    
    /**
     * Start spinning animation
     * @param {number} targetIndex - Index where reel should stop
     * @param {boolean} fastMode - Use fast mode
     * @returns {Promise<object>} Result item
     */
    async spin(targetIndex, fastMode = false) {
        return new Promise((resolve) => {
            if (this.isSpinning) return;
            
            this.isSpinning = true;
            this.targetIndex = targetIndex;
            this.startTime = performance.now();
            this.duration = fastMode ? this.fastModeDuration : this.duration;
            
            // Calculate total distance to travel
            // Add some randomness to landing position within the item
            const itemOffset = Math.floor(Math.random() * 100) - 50; // ±50px within item
            const totalDistance = (this.targetIndex * this.itemWidth) + (this.itemWidth / 2) + itemOffset;
            
            // Initial velocity calculation for smooth acceleration/deceleration
            const maxVelocity = totalDistance / (this.duration / 2);
            this.velocity = 0;
            this.position = 0;
            
            // Play initial sound
            audioManager.play('caseOpen');
            
            const animate = (currentTime) => {
                const elapsed = currentTime - this.startTime;
                const progress = Math.min(elapsed / this.duration, 1);
                
                // Ease out cubic for natural deceleration
                const easedProgress = easeOutCubic(progress);
                
                // Calculate current position
                this.position = totalDistance * easedProgress;
                
                // Update reel position
                this.reel.style.transform = `translateX(-${this.position}px)`;
                
                // Play tick sounds as items pass center
                const currentItemIndex = Math.floor(this.position / this.itemWidth);
                if (currentItemIndex > this.currentIndex && currentItemIndex <= this.targetIndex) {
                    if (currentItemIndex % 5 === 0) { // Play sound every 5 items for performance
                        audioManager.play('spin');
                    }
                    this.currentIndex = currentItemIndex;
                }
                
                // Continue animation or finish
                if (progress < 1) {
                    this.animationId = requestAnimationFrame(animate);
                } else {
                    this.finishSpin(resolve);
                }
            };
            
            this.animationId = requestAnimationFrame(animate);
        });
    }
    
    /**
     * Finish spinning and show result
     * @param {Function} resolve - Promise resolve function
     */
    finishSpin(resolve) {
        this.isSpinning = false;
        this.currentIndex = 0;
        
        // Play landing sound
        audioManager.play('land');
        
        // Get result item
        const resultItem = this.items[this.targetIndex];
        
        // Check for rare/gold items
        if (resultItem.rarity.toUpperCase() === 'GOLD') {
            audioManager.play('gold');
            createParticles('#ffd700', 100);
            screenShake(15, 1000);
        } else if (['COVERT', 'CLASSIFIED'].includes(resultItem.rarity.toUpperCase())) {
            audioManager.play('rare');
            createParticles(getRarityColor(resultItem.rarity), 30);
        }
        
        // Return result after brief delay
        setTimeout(() => {
            resolve(resultItem);
        }, 500);
    }
    
    /**
     * Stop animation immediately
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.isSpinning = false;
    }
    
    /**
     * Reset spinner to initial state
     */
    reset() {
        this.stop();
        this.position = 0;
        this.currentIndex = 0;
        if (this.reel) {
            this.reel.style.transform = 'translateX(0)';
        }
    }
    
    /**
     * Get item at specific index
     * @param {number} index - Item index
     * @returns {object} Item data
     */
    getItemAt(index) {
        return this.items[index] || null;
    }
    
    /**
     * Set animation duration
     * @param {number} duration - Duration in milliseconds
     */
    setDuration(duration) {
        this.duration = duration;
    }
}

// Create global instance
const spinner = new SpinnerAnimation();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SpinnerAnimation, spinner };
}
