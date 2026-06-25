/**
 * CS2 Case Opening Simulator - Provably Fair System
 * Implements cryptographic fairness verification
 */

class ProvablyFairSystem {
    constructor() {
        this.serverSeed = null;
        this.serverSeedHash = null;
        this.clientSeed = 'default-client-seed';
        this.nonce = 0;
        this.rollHistory = [];
        
        this.initialize();
    }
    
    /**
     * Initialize the provably fair system
     */
    async initialize() {
        // Load existing data or create new
        const savedData = loadFromStorage('provablyFairData');
        
        if (savedData) {
            this.serverSeed = savedData.serverSeed;
            this.serverSeedHash = savedData.serverSeedHash;
            this.clientSeed = savedData.clientSeed || 'default-client-seed';
            this.nonce = savedData.nonce || 0;
            this.rollHistory = savedData.rollHistory || [];
        } else {
            await this.generateServerSeed();
        }
        
        this.updateUI();
    }
    
    /**
     * Generate a new server seed and its hash
     */
    async generateServerSeed() {
        this.serverSeed = generateRandomString(64);
        this.serverSeedHash = await sha256(this.serverSeed);
        this.nonce = 0;
        
        this.save();
        this.updateUI();
        
        return this.serverSeedHash;
    }
    
    /**
     * Set client seed
     * @param {string} seed - Client seed
     */
    setClientSeed(seed) {
        this.clientSeed = seed;
        this.save();
        this.updateUI();
    }
    
    /**
     * Generate a new random client seed
     */
    generateClientSeed() {
        this.clientSeed = generateRandomString(32);
        this.save();
        this.updateUI();
        return this.clientSeed;
    }
    
    /**
     * Get the next roll result using provably fair algorithm
     * @param {number} max - Maximum value (exclusive)
     * @returns {Promise<number>} Roll result
     */
    async getNextRoll(max = 1) {
        if (!this.serverSeed) {
            await this.generateServerSeed();
        }
        
        // Create HMAC-like hash using concatenation
        const message = `${this.serverSeed}:${this.clientSeed}:${this.nonce}`;
        const hash = await sha256(message);
        
        // Convert first 8 hex chars to number
        const hashInt = parseInt(hash.substring(0, 8), 16);
        const result = hashInt % max;
        
        // Increment nonce for next roll
        this.nonce++;
        
        // Save state
        this.save();
        this.updateUI();
        
        return result;
    }
    
    /**
     * Get roll result for specific parameters (for verification)
     * @param {string} serverSeed - Server seed
     * @param {string} clientSeed - Client seed
     * @param {number} nonce - Nonce value
     * @param {number} max - Maximum value
     * @returns {Promise<number>} Roll result
     */
    static async getRollResult(serverSeed, clientSeed, nonce, max = 1) {
        const message = `${serverSeed}:${clientSeed}:${nonce}`;
        const hash = await sha256(message);
        const hashInt = parseInt(hash.substring(0, 8), 16);
        return hashInt % max;
    }
    
    /**
     * Verify a previous roll
     * @param {string} serverSeed - Server seed to verify
     * @param {string} clientSeed - Client seed used
     * @param {number} nonce - Nonce value
     * @param {number} expected - Expected result
     * @returns {Promise<object>} Verification result
     */
    static async verifyRoll(serverSeed, clientSeed, nonce, expected) {
        try {
            // Verify server seed hash matches
            const calculatedHash = await sha256(serverSeed);
            
            // Calculate expected roll
            const message = `${serverSeed}:${clientSeed}:${nonce}`;
            const hash = await sha256(message);
            const hashInt = parseInt(hash.substring(0, 8), 16);
            const result = hashInt % 1000000; // Using 1M as base for item selection
            
            const isValid = result === expected;
            
            return {
                valid: isValid,
                calculatedHash: calculatedHash,
                calculatedResult: result,
                message: isValid ? 'Roll verified successfully!' : 'Roll verification failed!'
            };
        } catch (error) {
            return {
                valid: false,
                message: 'Verification error: ' + error.message
            };
        }
    }
    
    /**
     * Record a roll in history
     * @param {object} rollData - Roll data to record
     */
    recordRoll(rollData) {
        this.rollHistory.unshift({
            ...rollData,
            serverSeedHash: this.serverSeedHash,
            clientSeed: this.clientSeed,
            nonce: this.nonce - 1,
            timestamp: Date.now()
        });
        
        // Keep only last 100 rolls
        if (this.rollHistory.length > 100) {
            this.rollHistory = this.rollHistory.slice(0, 100);
        }
        
        this.save();
    }
    
    /**
     * Reveal current server seed (starts new round)
     * @returns {string} Revealed server seed
     */
    async revealServerSeed() {
        const revealedSeed = this.serverSeed;
        await this.generateServerSeed();
        return revealedSeed;
    }
    
    /**
     * Save current state to localStorage
     */
    save() {
        saveToStorage('provablyFairData', {
            serverSeed: this.serverSeed,
            serverSeedHash: this.serverSeedHash,
            clientSeed: this.clientSeed,
            nonce: this.nonce,
            rollHistory: this.rollHistory
        });
    }
    
    /**
     * Update UI elements with current values
     */
    updateUI() {
        const hashElement = document.getElementById('serverSeedHash');
        const clientSeedElement = document.getElementById('clientSeed');
        const nonceElement = document.getElementById('currentNonce');
        
        if (hashElement) hashElement.value = this.serverSeedHash || '';
        if (clientSeedElement) clientSeedElement.value = this.clientSeed;
        if (nonceElement) nonceElement.value = this.nonce;
        
        this.updateRollHistoryUI();
    }
    
    /**
     * Update roll history display
     */
    updateRollHistoryUI() {
        const historyList = document.getElementById('rollHistoryList');
        if (!historyList) return;
        
        historyList.innerHTML = this.rollHistory.slice(0, 10).map(roll => `
            <div class="roll-history-item" style="
                padding: 0.5rem;
                margin: 0.5rem 0;
                background: var(--glass-bg);
                border-radius: 5px;
                border-left: 3px solid ${getRarityColor(roll.rarity)};
            ">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${roll.itemName}</span>
                    <span style="color: var(--text-secondary); font-size: 0.8rem;">
                        Nonce: ${roll.nonce}
                    </span>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
                    ${formatDate(roll.timestamp)}
                </div>
            </div>
        `).join('') || '<p style="color: var(--text-secondary);">No rolls yet</p>';
    }
    
    /**
     * Get roll history
     * @returns {Array} Roll history array
     */
    getRollHistory() {
        return this.rollHistory;
    }
    
    /**
     * Reset provably fair system
     */
    async reset() {
        this.rollHistory = [];
        await this.generateServerSeed();
        this.save();
        this.updateUI();
    }
}

// Create global instance
const provablyFair = new ProvablyFairSystem();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProvablyFairSystem, provablyFair };
}
