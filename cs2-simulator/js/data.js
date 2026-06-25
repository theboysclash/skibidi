/**
 * CS2 Case Opening Simulator - Data Module
 * Contains all case definitions, items, and configuration
 */

// Rarity definitions with probabilities and colors
const RARITIES = {
    CONSUMER: { 
        id: 'consumer', 
        name: 'Consumer Grade', 
        probability: 0.7992, 
        color: '#b0b0b0',
        multiplier: 0.5
    },
    INDUSTRIAL: { 
        id: 'industrial', 
        name: 'Industrial Grade', 
        probability: 0.1598, 
        color: '#4b69ff',
        multiplier: 1
    },
    MILSPEC: { 
        id: 'milspec', 
        name: 'Mil-Spec', 
        probability: 0.0320, 
        color: '#4b69ff',
        multiplier: 2
    },
    RESTRICTED: { 
        id: 'restricted', 
        name: 'Restricted', 
        probability: 0.0064, 
        color: '#8847ff',
        multiplier: 5
    },
    CLASSIFIED: { 
        id: 'classified', 
        name: 'Classified', 
        probability: 0.0026, 
        color: '#d32ce6',
        multiplier: 10
    },
    COVERT: { 
        id: 'covert', 
        name: 'Covert', 
        probability: 0.0010, 
        color: '#eb4b4b',
        multiplier: 50
    },
    GOLD: { 
        id: 'gold', 
        name: 'Special Item', 
        probability: 0.0002, 
        color: '#ffd700',
        multiplier: 200
    }
};

// Wear condition thresholds
const WEAR_CONDITIONS = [
    { name: 'Factory New', min: 0.00, max: 0.07 },
    { name: 'Minimal Wear', min: 0.07, max: 0.15 },
    { name: 'Field-Tested', min: 0.15, max: 0.38 },
    { name: 'Well-Worn', min: 0.38, max: 0.45 },
    { name: 'Battle-Scarred', min: 0.45, max: 1.00 }
];

// Weapon types for generating item names
const WEAPON_TYPES = [
    'AK-47', 'M4A4', 'M4A1-S', 'AWP', 'USP-S', 'Glock-18',
    'Desert Eagle', 'P250', 'Five-SeveN', 'Tec-9',
    'MP9', 'MAC-10', 'UMP-45', 'PP-Bizon',
    'XM1014', 'MAG-7', 'Nova', 'Sawed-Off',
    'FAMAS', 'Galil AR', 'SSG 08', 'SCAR-20',
    'Negev', 'M249', 'CZ75-Auto', 'R8 Revolver',
    'Knife', 'Gloves'
];

// Skin name prefixes for generation
const SKIN_PREFIXES = [
    'Redline', 'Asiimov', 'Hyper Beast', 'Dragon Lore',
    'Fade', 'Doppler', 'Marble Fade', 'Tiger Tooth',
    'Blue Laminate', 'Red Laminate', 'Ultraviolet',
    'Case Hardened', 'Slaughter', 'Night', 'Boreal Forest',
    'Forest DDPAT', 'Scorched', 'Stained', 'Rust Coat',
    'Crimson Web', 'Gamma Doppler', 'Lore', 'Black Laminate',
    'Aquamarine Revenge', 'Bloodsport', 'Neo-Noir', 'Printstream',
    'Chantico\'s Fire', 'Volcanic', 'Fire Serpent', 'Wraith King',
    'Gold Arabesque', 'Sweet Tooth', 'Momentum', 'Phantom',
    'Nitro', 'Corticera', 'Pulse', 'Elite Build',
    'Sand Dune', 'Urban Masked', 'Colony', 'Blue Steel'
];

// Case definitions
const CASES = [
    {
        id: 'phoenix',
        name: 'Phoenix Case',
        price: 2.49,
        image: '🔥',
        description: 'The Phoenix Collection',
        items: generateCaseItems('Phoenix', 30)
    },
    {
        id: 'breakout',
        name: 'Breakout Case',
        price: 1.99,
        image: '💥',
        description: 'The Breakout Collection',
        items: generateCaseItems('Breakout', 25)
    },
    {
        id: 'huntsman',
        name: 'Huntsman Case',
        price: 1.49,
        image: '🏹',
        description: 'The Huntsman Collection',
        items: generateCaseItems('Huntsman', 28)
    },
    {
        id: 'chroma',
        name: 'Chroma Case',
        price: 0.99,
        image: '🌈',
        description: 'The Chroma Collection',
        items: generateCaseItems('Chroma', 32)
    },
    {
        id: 'shadow',
        name: 'Shadow Case',
        price: 1.29,
        image: '👤',
        description: 'The Shadow Collection',
        items: generateCaseItems('Shadow', 26)
    },
    {
        id: 'revolution',
        name: 'Revolution Case',
        price: 2.99,
        image: '⚡',
        description: 'The Revolution Collection',
        items: generateCaseItems('Revolution', 35)
    },
    {
        id: 'dreams',
        name: 'Dreams & Nightmares Case',
        price: 3.49,
        image: '🌙',
        description: 'Dreams and Nightmares',
        items: generateCaseItems('Dreams', 40)
    },
    {
        id: 'reckoning',
        name: 'Recoil Case',
        price: 1.79,
        image: '🎯',
        description: 'The Recoil Collection',
        items: generateCaseItems('Recoil', 27)
    }
];

/**
 * Generate items for a case
 * @param {string} collectionName - Name of the collection
 * @param {number} itemCount - Number of items to generate
 * @returns {Array} Array of generated items
 */
function generateCaseItems(collectionName, itemCount) {
    const items = [];
    
    for (let i = 0; i < itemCount; i++) {
        // Determine rarity based on probability distribution
        const rarity = determineRarity();
        const weapon = WEAPON_TYPES[Math.floor(Math.random() * WEAPON_TYPES.length)];
        const skinName = SKIN_PREFIXES[Math.floor(Math.random() * SKIN_PREFIXES.length)];
        
        // Calculate base value based on rarity
        let baseValue = Math.random() * 10 + 1;
        baseValue *= RARITIES[rarity].multiplier;
        
        // Add some randomness to value
        baseValue *= (0.8 + Math.random() * 0.4);
        
        items.push({
            id: `${collectionName.toLowerCase()}-${i}`,
            name: `${weapon} | ${skinName}`,
            rarity: rarity.charAt(0) + rarity.slice(1).toLowerCase(),
            image: getWeaponEmoji(weapon),
            baseValue: parseFloat(baseValue.toFixed(2)),
            collection: collectionName
        });
    }
    
    // Ensure at least one high-tier item exists in each case
    if (!items.some(item => ['COVERT', 'GOLD'].includes(item.rarity.toUpperCase()))) {
        const lastItem = items[items.length - 1];
        lastItem.rarity = 'Covert';
        lastItem.baseValue = Math.max(lastItem.baseValue, 100);
    }
    
    return items;
}

/**
 * Determine rarity based on probability weights
 * @returns {string} Rarity name
 */
function determineRarity(customProbabilities = null) {
    const probs = customProbabilities || {
        CONSUMER: RARITIES.CONSUMER.probability,
        INDUSTRIAL: RARITIES.INDUSTRIAL.probability,
        MILSPEC: RARITIES.MILSPEC.probability,
        RESTRICTED: RARITIES.RESTRICTED.probability,
        CLASSIFIED: RARITIES.CLASSIFIED.probability,
        COVERT: RARITIES.COVERT.probability,
        GOLD: RARITIES.GOLD.probability
    };
    
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [rarity, probability] of Object.entries(probs)) {
        cumulative += probability;
        if (rand <= cumulative) {
            return rarity;
        }
    }
    
    return 'CONSUMER';
}

/**
 * Get emoji representation for weapon type
 * @param {string} weapon - Weapon name
 * @returns {string} Emoji
 */
function getWeaponEmoji(weapon) {
    if (weapon.includes('AK-47')) return '🔫';
    if (weapon.includes('M4')) return '🎯';
    if (weapon.includes('AWP')) return '🎪';
    if (weapon.includes('Knife')) return '🔪';
    if (weapon.includes('Gloves')) return '🧤';
    if (weapon.includes('Pistol') || weapon.includes('USP') || weapon.includes('Glock') || weapon.includes('Desert')) return '🔫';
    if (weapon.includes('SMG') || weapon.includes('MP') || weapon.includes('MAC')) return '💨';
    if (weapon.includes('Shotgun')) return '💥';
    if (weapon.includes('Rifle')) return '🎯';
    return '📦';
}

/**
 * Get wear condition from float value
 * @param {number} float - Float value (0-1)
 * @returns {string} Wear condition name
 */
function getWearCondition(float) {
    for (const condition of WEAR_CONDITIONS) {
        if (float >= condition.min && float < condition.max) {
            return condition.name;
        }
    }
    return 'Battle-Scarred';
}

/**
 * Generate a random float value
 * @returns {number} Float value between 0 and 1
 */
function generateFloat() {
    return parseFloat((Math.random()).toFixed(6));
}

/**
 * Generate pattern ID
 * @returns {number} Pattern ID between 0 and 999
 */
function generatePatternId() {
    return Math.floor(Math.random() * 1000);
}

/**
 * Check if pattern is rare (e.g., Blue Gem style)
 * @param {number} patternId - Pattern ID
 * @returns {boolean} Whether pattern is rare
 */
function isRarePattern(patternId) {
    // Top 5% patterns are considered rare
    return patternId < 50 || patternId > 950;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RARITIES,
        WEAR_CONDITIONS,
        CASES,
        WEAPON_TYPES,
        SKIN_PREFIXES,
        determineRarity,
        getWearCondition,
        generateFloat,
        generatePatternId,
        isRarePattern,
        getWeaponEmoji,
        generateCaseItems
    };
}
