/**
 * CS2 Case Opening Simulator - Achievements System
 * Tracks and displays user achievements
 */

class AchievementsManager {
    constructor() {
        this.achievements = [
            {
                id: 'first_case',
                title: 'First Steps',
                description: 'Open your first case',
                icon: '🎁',
                unlocked: false,
                condition: () => statistics.stats.casesOpened >= 1
            },
            {
                id: 'hundred_cases',
                title: 'Century',
                description: 'Open 100 cases',
                icon: '💯',
                unlocked: false,
                condition: () => statistics.stats.casesOpened >= 100
            },
            {
                id: 'five_hundred_cases',
                title: 'Dedicated',
                description: 'Open 500 cases',
                icon: '🔥',
                unlocked: false,
                condition: () => statistics.stats.casesOpened >= 500
            },
            {
                id: 'thousand_cases',
                title: 'Legend',
                description: 'Open 1000 cases',
                icon: '👑',
                unlocked: false,
                condition: () => statistics.stats.casesOpened >= 1000
            },
            {
                id: 'first_covert',
                title: 'Red Alert',
                description: 'Get your first Covert item',
                icon: '🔴',
                unlocked: false,
                condition: () => statistics.stats.rarityCounts.Covert >= 1
            },
            {
                id: 'first_gold',
                title: 'Golden Touch',
                description: 'Get your first Gold item',
                icon: '⭐',
                unlocked: false,
                condition: () => statistics.stats.rarityCounts.Gold >= 1
            },
            {
                id: 'profit_1000',
                title: 'Profitable',
                description: 'Achieve $1,000 in profit',
                icon: '💰',
                unlocked: false,
                condition: () => (statistics.stats.totalEarned - statistics.stats.totalSpent) >= 1000
            },
            {
                id: 'inventory_value',
                title: 'Collector',
                description: 'Have $1,000 worth of inventory',
                icon: '📦',
                unlocked: false,
                condition: () => inventory.getTotalValue() >= 1000
            },
            {
                id: 'lucky_streak',
                title: 'Lucky Streak',
                description: 'Get 3 rare items in a row',
                icon: '🍀',
                unlocked: false,
                condition: () => false // Special tracking needed
            },
            {
                id: 'millionaire',
                title: 'Millionaire',
                description: 'Have $1,000,000 wallet balance',
                icon: '💎',
                unlocked: false,
                condition: () => app.wallet >= 1000000
            }
        ];
        
        this.initialize();
    }
    
    /**
     * Initialize achievements from storage
     */
    initialize() {
        const savedAchievements = loadFromStorage('achievements', []);
        
        if (savedAchievements.length > 0) {
            // Merge saved state with achievement definitions
            savedAchievements.forEach(saved => {
                const achievement = this.achievements.find(a => a.id === saved.id);
                if (achievement) {
                    achievement.unlocked = saved.unlocked;
                }
            });
        }
        
        this.checkAll();
        this.render();
    }
    
    /**
     * Check all achievements
     */
    checkAll() {
        let newUnlocks = [];
        
        this.achievements.forEach(achievement => {
            if (!achievement.unlocked && achievement.condition()) {
                achievement.unlocked = true;
                newUnlocks.push(achievement);
            }
        });
        
        if (newUnlocks.length > 0) {
            this.save();
            this.render();
            newUnlocks.forEach(a => this.showNotification(a));
        }
    }
    
    /**
     * Show achievement notification
     * @param {object} achievement - Unlocked achievement
     */
    showNotification(achievement) {
        const notification = document.getElementById('achievementNotification');
        const title = document.getElementById('achievementTitle');
        const description = document.getElementById('achievementDescription');
        
        if (notification && title && description) {
            title.textContent = `🏆 ${achievement.title}`;
            description.textContent = achievement.description;
            notification.classList.add('show');
            
            audioManager.play('achievement');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 4000);
        }
    }
    
    /**
     * Save achievements to storage
     */
    save() {
        const data = this.achievements.map(a => ({
            id: a.id,
            unlocked: a.unlocked
        }));
        saveToStorage('achievements', data);
    }
    
    /**
     * Render achievements grid
     */
    render() {
        const grid = document.getElementById('achievementsGrid');
        if (!grid) return;
        
        grid.innerHTML = this.achievements.map(achievement => `
            <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                    <p style="font-size: 0.8rem; margin-top: 0.5rem; color: ${achievement.unlocked ? '#ffd700' : 'var(--text-secondary)'}">
                        ${achievement.unlocked ? '✓ Unlocked' : '🔒 Locked'}
                    </p>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Get achievement by ID
     * @param {string} id - Achievement ID
     * @returns {object|null} Achievement data
     */
    getAchievement(id) {
        return this.achievements.find(a => a.id === id) || null;
    }
    
    /**
     * Get unlocked count
     * @returns {number} Number of unlocked achievements
     */
    getUnlockedCount() {
        return this.achievements.filter(a => a.unlocked).length;
    }
    
    /**
     * Get total count
     * @returns {number} Total achievements
     */
    getTotalCount() {
        return this.achievements.length;
    }
    
    /**
     * Reset all achievements
     */
    reset() {
        this.achievements.forEach(a => a.unlocked = false);
        this.save();
        this.render();
    }
}

// Create global instance
const achievements = new AchievementsManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AchievementsManager, achievements };
}
