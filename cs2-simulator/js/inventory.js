/**
 * CS2 Case Opening Simulator - Inventory System
 * Manages user inventory with localStorage persistence
 */

class InventoryManager {
    constructor() {
        this.items = [];
        this.selectedItems = new Set();
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.sortBy = 'date-desc';
        this.searchQuery = '';
        
        this.initialize();
    }
    
    /**
     * Initialize inventory from storage
     */
    initialize() {
        const savedInventory = loadFromStorage('inventory', []);
        this.items = savedInventory;
        this.render();
    }
    
    /**
     * Add item to inventory
     * @param {object} item - Item to add
     * @returns {object} Added item with metadata
     */
    addItem(item) {
        const newItem = {
            ...item,
            id: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            float: generateFloat(),
            patternId: generatePatternId(),
            dateObtained: Date.now(),
            caseSource: item.collection || 'Unknown'
        };
        
        // Calculate final value based on float and pattern
        newItem.finalValue = this.calculateItemValue(newItem);
        
        this.items.unshift(newItem);
        this.save();
        this.render();
        
        return newItem;
    }
    
    /**
     * Calculate item value based on float and pattern
     * @param {object} item - Item data
     * @returns {number} Calculated value
     */
    calculateItemValue(item) {
        let value = item.baseValue;
        
        // Float multiplier (lower is better for most skins)
        if (item.float < 0.07) {
            value *= 1.5; // Factory New bonus
        } else if (item.float < 0.15) {
            value *= 1.2; // Minimal Wear bonus
        } else if (item.float > 0.45) {
            value *= 0.8; // Battle Scarred penalty
        }
        
        // Rare pattern bonus
        if (isRarePattern(item.patternId)) {
            value *= 2;
        }
        
        // Special pattern bonuses (Blue Gem style)
        if (item.patternId < 10) {
            value *= 5;
        }
        
        return parseFloat(value.toFixed(2));
    }
    
    /**
     * Remove item from inventory
     * @param {string} itemId - Item ID to remove
     * @returns {boolean} Success status
     */
    removeItem(itemId) {
        const index = this.items.findIndex(item => item.id === itemId);
        if (index !== -1) {
            this.items.splice(index, 1);
            this.selectedItems.delete(itemId);
            this.save();
            this.render();
            return true;
        }
        return false;
    }
    
    /**
     * Sell item
     * @param {string} itemId - Item ID to sell
     * @returns {number} Sale price
     */
    sellItem(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return 0;
        
        const salePrice = item.finalValue;
        this.removeItem(itemId);
        
        return salePrice;
    }
    
    /**
     * Sell multiple items
     * @param {Array} itemIds - Array of item IDs
     * @returns {number} Total sale price
     */
    sellItems(itemIds) {
        let total = 0;
        itemIds.forEach(id => {
            total += this.sellItem(id);
        });
        return total;
    }
    
    /**
     * Sell all items
     * @returns {number} Total sale price
     */
    sellAll() {
        const total = this.getTotalValue();
        this.items = [];
        this.selectedItems.clear();
        this.save();
        this.render();
        return total;
    }
    
    /**
     * Toggle item selection
     * @param {string} itemId - Item ID to toggle
     */
    toggleSelection(itemId) {
        if (this.selectedItems.has(itemId)) {
            this.selectedItems.delete(itemId);
        } else {
            this.selectedItems.add(itemId);
        }
        this.render();
    }
    
    /**
     * Clear selection
     */
    clearSelection() {
        this.selectedItems.clear();
        this.render();
    }
    
    /**
     * Get filtered and sorted items
     * @returns {Array} Filtered items
     */
    getFilteredItems() {
        let filtered = [...this.items];
        
        // Apply search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(query) ||
                item.rarity.toLowerCase().includes(query) ||
                item.caseSource.toLowerCase().includes(query)
            );
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.sortBy) {
                case 'date-desc':
                    return b.dateObtained - a.dateObtained;
                case 'date-asc':
                    return a.dateObtained - b.dateObtained;
                case 'value-desc':
                    return b.finalValue - a.finalValue;
                case 'value-asc':
                    return a.finalValue - b.finalValue;
                case 'rarity-desc':
                    return this.getRarityScore(b.rarity) - this.getRarityScore(a.rarity);
                default:
                    return 0;
            }
        });
        
        return filtered;
    }
    
    /**
     * Get rarity score for sorting
     * @param {string} rarity - Rarity name
     * @returns {number} Rarity score
     */
    getRarityScore(rarity) {
        const scores = {
            'Consumer': 1,
            'Industrial': 2,
            'Mil-Spec': 3,
            'Restricted': 4,
            'Classified': 5,
            'Covert': 6,
            'Gold': 7
        };
        return scores[rarity] || 0;
    }
    
    /**
     * Get paginated items
     * @returns {Array} Items for current page
     */
    getPaginatedItems() {
        const filtered = this.getFilteredItems();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return filtered.slice(start, end);
    }
    
    /**
     * Get total pages
     * @returns {number} Total pages
     */
    getTotalPages() {
        return Math.ceil(this.getFilteredItems().length / this.itemsPerPage);
    }
    
    /**
     * Get total inventory value
     * @returns {number} Total value
     */
    getTotalValue() {
        return this.items.reduce((sum, item) => sum + item.finalValue, 0);
    }
    
    /**
     * Get item count by rarity
     * @returns {object} Counts by rarity
     */
    getCountByRarity() {
        const counts = {};
        this.items.forEach(item => {
            counts[item.rarity] = (counts[item.rarity] || 0) + 1;
        });
        return counts;
    }
    
    /**
     * Save inventory to storage
     */
    save() {
        saveToStorage('inventory', this.items);
    }
    
    /**
     * Render inventory grid
     */
    render() {
        const grid = document.getElementById('inventoryGrid');
        if (!grid) return;
        
        const items = this.getPaginatedItems();
        
        if (items.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;">No items in inventory. Open some cases!</p>';
        } else {
            grid.innerHTML = items.map(item => `
                <div class="item-card ${this.selectedItems.has(item.id) ? 'selected' : ''} ${getRarityClass(item.rarity)}" 
                     data-id="${item.id}"
                     onclick="inventory.toggleSelection('${item.id}')">
                    <div class="item-card-image" style="border-bottom: 3px solid ${getRarityColor(item.rarity)}">
                        ${item.image}
                    </div>
                    <div class="item-card-name" title="${item.name}">${item.name}</div>
                    <div class="item-card-value">${formatCurrency(item.finalValue)}</div>
                    <div class="item-card-float">Float: ${item.float.toFixed(6)}</div>
                    <div class="item-card-float">${item.wearCondition || getWearCondition(item.float)}</div>
                </div>
            `).join('');
        }
        
        this.renderPagination();
    }
    
    /**
     * Render pagination controls
     */
    renderPagination() {
        const pagination = document.getElementById('inventoryPagination');
        if (!pagination) return;
        
        const totalPages = this.getTotalPages();
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // Previous button
        html += `<button class="btn-page" ${this.currentPage === 1 ? 'disabled' : ''} onclick="inventory.setPage(${this.currentPage - 1})">«</button>`;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += `<button class="btn-page ${i === this.currentPage ? 'active' : ''}" onclick="inventory.setPage(${i})">${i}</button>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<span style="padding: 0.5rem;">...</span>';
            }
        }
        
        // Next button
        html += `<button class="btn-page" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="inventory.setPage(${this.currentPage + 1})">»</button>`;
        
        pagination.innerHTML = html;
    }
    
    /**
     * Set current page
     * @param {number} page - Page number
     */
    setPage(page) {
        const totalPages = this.getTotalPages();
        this.currentPage = clamp(page, 1, totalPages);
        this.render();
    }
    
    /**
     * Set sort order
     * @param {string} sortBy - Sort field
     */
    setSort(sortBy) {
        this.sortBy = sortBy;
        this.currentPage = 1;
        this.render();
    }
    
    /**
     * Set search query
     * @param {string} query - Search query
     */
    setSearch(query) {
        this.searchQuery = query;
        this.currentPage = 1;
        this.render();
    }
    
    /**
     * Export inventory to JSON
     */
    export() {
        exportJSON({
            version: '1.0',
            exportDate: Date.now(),
            items: this.items
        }, 'cs2-inventory-export.json');
    }
    
    /**
     * Import inventory from JSON
     * @param {File} file - JSON file
     */
    async import(file) {
        try {
            const data = await importJSON(file);
            if (data.items && Array.isArray(data.items)) {
                this.items = [...data.items, ...this.items];
                this.save();
                this.render();
                showToast(`Imported ${data.items.length} items successfully!`, 'success');
            } else {
                throw new Error('Invalid inventory format');
            }
        } catch (error) {
            showToast('Error importing inventory: ' + error.message, 'error');
        }
    }
    
    /**
     * Clear all items
     */
    clear() {
        this.items = [];
        this.selectedItems.clear();
        this.save();
        this.render();
    }
    
    /**
     * Get item by ID
     * @param {string} itemId - Item ID
     * @returns {object|null} Item data
     */
    getItem(itemId) {
        return this.items.find(item => item.id === itemId) || null;
    }
}

// Create global instance
const inventory = new InventoryManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InventoryManager, inventory };
}
