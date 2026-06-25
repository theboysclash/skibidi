/**
 * CS2 Case Opening Simulator - Statistics System
 * Tracks and displays user statistics with charts
 */

class StatisticsManager {
    constructor() {
        this.stats = {
            casesOpened: 0,
            totalSpent: 0,
            totalEarned: 0,
            itemsObtained: 0,
            bestDrop: null,
            worstDrop: null,
            rarityCounts: {
                Consumer: 0,
                Industrial: 0,
                MilSpec: 0,
                Restricted: 0,
                Classified: 0,
                Covert: 0,
                Gold: 0
            }
        };
        
        this.rarityChart = null;
        this.valueChart = null;
        
        this.initialize();
    }
    
    /**
     * Initialize statistics from storage
     */
    initialize() {
        const savedStats = loadFromStorage('statistics', null);
        if (savedStats) {
            this.stats = { ...this.stats, ...savedStats };
        }
        this.updateUI();
    }
    
    /**
     * Record a case opening
     * @param {number} price - Case price
     */
    recordCaseOpening(price) {
        this.stats.casesOpened++;
        this.stats.totalSpent += price;
        this.save();
        this.updateUI();
    }
    
    /**
     * Record an item drop
     * @param {object} item - Dropped item
     */
    recordItemDrop(item) {
        this.stats.itemsObtained++;
        this.stats.totalEarned += item.finalValue || item.baseValue;
        
        // Update rarity count
        const rarityKey = item.rarity.replace('-', '');
        if (this.stats.rarityCounts[rarityKey] !== undefined) {
            this.stats.rarityCounts[rarityKey]++;
        }
        
        // Track best/worst drops
        const value = item.finalValue || item.baseValue;
        if (!this.stats.bestDrop || value > this.stats.bestDrop.value) {
            this.stats.bestDrop = {
                name: item.name,
                value: value,
                rarity: item.rarity,
                date: Date.now()
            };
        }
        
        if (!this.stats.worstDrop || value < this.stats.worstDrop.value) {
            this.stats.worstDrop = {
                name: item.name,
                value: value,
                rarity: item.rarity,
                date: Date.now()
            };
        }
        
        this.save();
        this.updateUI();
        this.updateCharts();
    }
    
    /**
     * Calculate ROI percentage
     * @returns {number} ROI percentage
     */
    getROI() {
        if (this.stats.totalSpent === 0) return 0;
        return ((this.stats.totalEarned - this.stats.totalSpent) / this.stats.totalSpent) * 100;
    }
    
    /**
     * Get average item value
     * @returns {number} Average value
     */
    getAverageValue() {
        if (this.stats.itemsObtained === 0) return 0;
        return this.stats.totalEarned / this.stats.itemsObtained;
    }
    
    /**
     * Save statistics to storage
     */
    save() {
        saveToStorage('statistics', this.stats);
    }
    
    /**
     * Update UI elements
     */
    updateUI() {
        // Home page stats
        const homeCases = document.getElementById('totalCasesOpened');
        const homeProfit = document.getElementById('totalProfit');
        const homeBest = document.getElementById('bestDrop');
        
        if (homeCases) homeCases.textContent = this.stats.casesOpened.toLocaleString();
        if (homeProfit) homeProfit.textContent = formatCurrency(this.stats.totalEarned - this.stats.totalSpent);
        if (homeBest) homeBest.textContent = this.stats.bestDrop ? `${this.stats.bestDrop.name} (${formatCurrency(this.stats.bestDrop.value)})` : 'N/A';
        
        // Statistics page
        const statCases = document.getElementById('statCasesOpened');
        const statSpent = document.getElementById('statTotalSpent');
        const statEarned = document.getElementById('statTotalEarned');
        const statROI = document.getElementById('statROI');
        const statAvg = document.getElementById('statAvgValue');
        const statInvValue = document.getElementById('statInventoryValue');
        
        if (statCases) statCases.textContent = this.stats.casesOpened.toLocaleString();
        if (statSpent) statSpent.textContent = formatCurrency(this.stats.totalSpent);
        if (statEarned) statEarned.textContent = formatCurrency(this.stats.totalEarned);
        if (statROI) {
            const roi = this.getROI();
            statROI.textContent = `${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%`;
            statROI.style.color = roi >= 0 ? '#4caf50' : '#f44336';
        }
        if (statAvg) statAvg.textContent = formatCurrency(this.getAverageValue());
        if (statInvValue) statInvValue.textContent = formatCurrency(inventory.getTotalValue());
    }
    
    /**
     * Initialize and update charts
     */
    updateCharts() {
        this.initRarityChart();
        this.initValueChart();
    }
    
    /**
     * Initialize rarity distribution chart
     */
    initRarityChart() {
        const ctx = document.getElementById('rarityChart');
        if (!ctx) return;
        
        const data = this.stats.rarityCounts;
        
        if (this.rarityChart) {
            this.rarityChart.destroy();
        }
        
        this.rarityChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: [
                        '#b0b0b0',  // Consumer
                        '#4b69ff',  // Industrial
                        '#4b69ff',  // Mil-Spec
                        '#8847ff',  // Restricted
                        '#d32ce6',  // Classified
                        '#eb4b4b',  // Covert
                        '#ffd700'   // Gold
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            padding: 15
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Initialize value distribution chart
     */
    initValueChart() {
        const ctx = document.getElementById('valueChart');
        if (!ctx) return;
        
        if (this.valueChart) {
            this.valueChart.destroy();
        }
        
        // Group items by value ranges
        const inventoryItems = inventory.items;
        const ranges = {
            '$0-10': 0,
            '$10-50': 0,
            '$50-100': 0,
            '$100-500': 0,
            '$500+': 0
        };
        
        inventoryItems.forEach(item => {
            const value = item.finalValue || 0;
            if (value < 10) ranges['$0-10']++;
            else if (value < 50) ranges['$10-50']++;
            else if (value < 100) ranges['$50-100']++;
            else if (value < 500) ranges['$100-500']++;
            else ranges['$500+']++;
        });
        
        this.valueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(ranges),
                datasets: [{
                    label: 'Items',
                    data: Object.values(ranges),
                    backgroundColor: 'rgba(255, 107, 53, 0.8)',
                    borderColor: 'rgba(255, 107, 53, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    /**
     * Reset all statistics
     */
    reset() {
        this.stats = {
            casesOpened: 0,
            totalSpent: 0,
            totalEarned: 0,
            itemsObtained: 0,
            bestDrop: null,
            worstDrop: null,
            rarityCounts: {
                Consumer: 0,
                Industrial: 0,
                MilSpec: 0,
                Restricted: 0,
                Classified: 0,
                Covert: 0,
                Gold: 0
            }
        };
        this.save();
        this.updateUI();
        this.updateCharts();
    }
    
    /**
     * Get statistics data
     * @returns {object} Statistics data
     */
    getData() {
        return { ...this.stats };
    }
}

// Create global instance
const statistics = new StatisticsManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StatisticsManager, statistics };
}
