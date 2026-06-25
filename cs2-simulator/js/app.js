/**
 * CS2 Case Opening Simulator - Main Application
 * Initializes and coordinates all systems
 */

class CS2CaseSimulator {
    constructor() {
        this.wallet = 100; // Starting balance
        this.openQuantity = 1;
        this.isOpening = false;
        this.autoOpenInterval = null;
        
        this.initialize();
    }
    
    /**
     * Initialize the application
     */
    async initialize() {
        // Load saved wallet
        const savedWallet = loadFromStorage('wallet', 100);
        this.wallet = savedWallet;
        
        // Update UI
        ui.updateWalletDisplay(this.wallet);
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onReady());
        } else {
            this.onReady();
        }
    }
    
    /**
     * Called when DOM is ready
     */
    onReady() {
        console.log('CS2 Case Simulator initialized');
        
        // Resume audio context on first user interaction
        document.addEventListener('click', () => {
            audioManager.resume();
        }, { once: true });
        
        // Check achievements periodically
        setInterval(() => {
            achievements.checkAll();
        }, 5000);
        
        // Handle keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Space to open case (when on open-case page)
            if (e.code === 'Space' && ui.currentPage === 'open-case' && !this.isOpening) {
                e.preventDefault();
                this.openCase();
            }
            
            // Escape to close modals
            if (e.code === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('show');
                });
            }
        });
    }
    
    /**
     * Add funds to wallet
     * @param {number} amount - Amount to add
     */
    addFunds(amount) {
        this.wallet += amount;
        saveToStorage('wallet', this.wallet);
        ui.updateWalletDisplay(this.wallet);
    }
    
    /**
     * Deduct funds from wallet
     * @param {number} amount - Amount to deduct
     * @returns {boolean} Success status
     */
    deductFunds(amount) {
        if (this.wallet >= amount) {
            this.wallet -= amount;
            saveToStorage('wallet', this.wallet);
            ui.updateWalletDisplay(this.wallet);
            return true;
        }
        return false;
    }
    
    /**
     * Set open quantity
     * @param {number} qty - Quantity (1, 5, or 10)
     */
    setQuantity(qty) {
        this.openQuantity = clamp(qty, 1, 10);
    }
    
    /**
     * Open a case
     */
    async openCase() {
        if (this.isOpening || !ui.selectedCase) return;
        
        const caseData = ui.selectedCase;
        const totalCost = caseData.price * this.openQuantity;
        
        // Check funds
        if (!this.deductFunds(totalCost)) {
            showToast('Insufficient funds! Please deposit more.', 'error');
            return;
        }
        
        this.isOpening = true;
        const btnOpen = document.getElementById('btnOpenCase');
        if (btnOpen) btnOpen.disabled = true;
        
        // Record statistics
        statistics.recordCaseOpening(totalCost);
        
        // Open multiple cases based on quantity
        for (let i = 0; i < this.openQuantity; i++) {
            await this.openSingleCase(caseData);
        }
        
        this.isOpening = false;
        if (btnOpen) btnOpen.disabled = false;
        
        // Check achievements after opening
        achievements.checkAll();
        
        // Auto-open mode
        const autoOpenMode = document.getElementById('autoOpenMode');
        if (autoOpenMode && autoOpenMode.checked) {
            this.startAutoOpen();
        }
    }
    
    /**
     * Open a single case
     * @param {object} caseData - Case data
     */
    async openSingleCase(caseData) {
        const fastMode = document.getElementById('fastOpenMode')?.checked || false;
        
        // Determine result using provably fair system
        const rollResult = await provablyFair.getNextRoll(1000000);
        
        // Select item based on roll
        const selectedItem = this.selectItemFromRoll(caseData.items, rollResult);
        
        // Generate full item data
        const item = {
            ...selectedItem,
            float: generateFloat(),
            patternId: generatePatternId(),
            wearCondition: getWearCondition(generateFloat())
        };
        
        // Calculate final value
        item.finalValue = inventory.calculateItemValue(item);
        
        // Spin the reel
        spinner.reset();
        
        // Find target index (place winning item at a random position in the reel)
        const targetIndex = Math.floor(Math.random() * 30) + 50; // Between 50-80
        
        // Temporarily modify reel to include winning item at target position
        spinner.items[targetIndex] = item;
        spinner.renderReel();
        
        // Start animation
        const result = await spinner.spin(targetIndex, fastMode);
        
        // Add to inventory
        const addedItem = inventory.addItem(result);
        
        // Record in statistics
        statistics.recordItemDrop(addedItem);
        
        // Record in provably fair history
        provablyFair.recordRoll({
            itemName: result.name,
            rarity: result.rarity,
            value: addedItem.finalValue
        });
        
        // Show result
        this.showResult(addedItem);
        
        // Add to recent drops
        ui.addRecentDrop(addedItem);
        
        // Update wallet display
        ui.updateWalletDisplay(this.wallet);
    }
    
    /**
     * Select item based on roll result
     * @param {Array} items - Available items
     * @param {number} roll - Roll result
     * @returns {object} Selected item
     */
    selectItemFromRoll(items, roll) {
        // First determine rarity based on probabilities
        const rarityKey = determineRarity();
        
        // Filter items by determined rarity
        let rarityItems = items.filter(item => 
            item.rarity.toLowerCase() === rarityKey.toLowerCase()
        );
        
        // If no items of that rarity, use all items
        if (rarityItems.length === 0) {
            rarityItems = items;
        }
        
        // Select random item from filtered list
        return rarityItems[Math.floor(Math.random() * rarityItems.length)];
    }
    
    /**
     * Show result card
     * @param {object} item - Result item
     */
    showResult(item) {
        const resultCard = document.getElementById('resultCard');
        const resultDisplay = document.getElementById('resultDisplay');
        
        if (!resultCard) return;
        
        resultCard.className = `item-card result-card ${getRarityClass(item.rarity)}`;
        if (item.rarity.toUpperCase() === 'GOLD') {
            resultCard.classList.add('gold-reveal');
        }
        
        resultCard.innerHTML = `
            <div class="item-card-image" style="border-bottom: 4px solid ${getRarityColor(item.rarity)}">
                ${item.image}
            </div>
            <div class="item-card-name">${item.name}</div>
            <div class="item-card-value">${formatCurrency(item.finalValue)}</div>
            <div class="item-card-float">Float: ${item.float.toFixed(6)}</div>
            <div class="item-card-float">${item.wearCondition}</div>
        `;
        
        resultCard.classList.add('show');
        
        // Allow clicking to inspect
        resultCard.onclick = () => {
            const newItem = inventory.items.find(i => i.id.includes(item.id));
            if (newItem) {
                ui.showItemModal(newItem.id);
            }
        };
    }
    
    /**
     * Start auto-open mode
     */
    startAutoOpen() {
        if (this.autoOpenInterval) return;
        
        this.autoOpenInterval = setInterval(() => {
            if (this.wallet >= ui.selectedCase?.price) {
                this.openCase();
            } else {
                this.stopAutoOpen();
                showToast('Auto-open stopped: Insufficient funds', 'info');
            }
        }, 8000);
    }
    
    /**
     * Stop auto-open mode
     */
    stopAutoOpen() {
        if (this.autoOpenInterval) {
            clearInterval(this.autoOpenInterval);
            this.autoOpenInterval = null;
            
            const autoOpenMode = document.getElementById('autoOpenMode');
            if (autoOpenMode) autoOpenMode.checked = false;
        }
    }
}

// Create global instance
const app = new CS2CaseSimulator();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CS2CaseSimulator, app };
}
