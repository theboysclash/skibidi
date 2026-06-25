# CS2 Case Opening Simulator

A complete, web-based Counter-Strike 2 case opening simulator that replicates the look, feel, animations, and probability system of real CS2 case openings.

## Features

### Core Systems
- **Realistic Case Opening** - Smooth 60 FPS spinner animations with weighted probabilities
- **Provably Fair System** - SHA-256 based cryptographic fairness verification
- **Skin Float System** - Realistic float values (0.000000 - 1.000000) with wear conditions
- **Pattern System** - Pattern IDs with rare pattern detection (Blue Gem style)
- **Complete Inventory** - Grid layout with search, sort, pagination, and item inspection

### Rarity System
- Consumer Grade (Gray) - 79.92%
- Industrial Grade (Light Blue) - 15.98%
- Mil-Spec (Blue) - 3.20%
- Restricted (Purple) - 0.64%
- Classified (Pink) - 0.26%
- Covert (Red) - 0.10%
- Special Item (Gold) - 0.02%

### Economy
- Virtual wallet with deposit simulator
- Buy cases and sell items
- Profit/loss tracking with ROI calculation
- Statistics dashboard with charts

### Visual Effects
- Gold item reveal with particles and screen shake
- Red item dramatic reveal effects
- Smooth modal animations
- Glassmorphism UI design
- Multiple themes (Dark, Light, Blue Steel)

### Audio System
- Synthesized sound effects using Web Audio API
- Case opening, spinning, landing sounds
- Rare and gold item reveal sounds
- Volume control and mute options

### Advanced Features
- Multiple case opening (1x, 5x, 10x)
- Fast-open mode
- Auto-open mode
- Keyboard shortcuts (Space to open, Escape to close modals)
- Export/import inventory to JSON
- Achievement system with notifications
- Recent drops feed
- Daily rewards ready

## File Structure

```
cs2-simulator/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Complete stylesheet
├── js/
│   ├── data.js         # Case definitions, rarities, utilities
│   ├── utils.js        # General helper functions
│   ├── provably-fair.js # Cryptographic fairness system
│   ├── audio.js        # Sound effects manager
│   ├── spinner.js      # Reel animation system
│   ├── inventory.js    # Inventory management
│   ├── statistics.js   # Stats tracking and charts
│   ├── achievements.js # Achievement system
│   ├── ui.js           # UI interactions and navigation
│   └── app.js          # Main application coordinator
└── README.md           # This file
```

## Installation & Setup

### Quick Start
1. Open `index.html` in any modern web browser
2. No server required - runs entirely client-side
3. Data is stored in localStorage

### Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- localStorage support

### Optional: Local Server
For best performance, serve with a local development server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

## Usage Guide

### Opening Cases
1. Click "Cases" in navigation or "Open Case Now" on home page
2. Select a case from the grid
3. Choose quantity (1x, 5x, 10x)
4. Toggle Fast Mode or Auto Mode if desired
5. Click "OPEN CASE" or press Spacebar

### Managing Inventory
1. Go to "Inventory" page
2. Click items to select for selling
3. Use "Sell Selected" or "Sell All" buttons
4. Search and sort items as needed
5. Click any item to inspect details

### Provably Fair Verification
1. Navigate to "Verification" page
2. View current server seed hash, client seed, and nonce
3. Generate new client seed if desired
4. Verify previous rolls by entering revealed seeds

### Settings
- Adjust master volume
- Toggle mute
- Switch themes (Dark/Light/Blue Steel)
- Reset all data if needed

## Key Systems Explained

### Weighted Rarity Generation
The system uses cumulative probability distribution:
```javascript
const rand = Math.random();
let cumulative = 0;
for (const [rarity, probability] of Object.entries(probs)) {
    cumulative += probability;
    if (rand <= cumulative) return rarity;
}
```

### Provably Fair Algorithm
1. Server seed (hidden) + Client seed (user-editable) + Nonce (incrementing)
2. Combined and hashed with SHA-256
3. First 8 hex characters converted to number
4. Modulo operation determines result
5. Users can verify any roll with revealed seeds

### Float Value System
```javascript
0.00 - 0.07  → Factory New
0.07 - 0.15  → Minimal Wear
0.15 - 0.38  → Field-Tested
0.38 - 0.45  → Well-Worn
0.45 - 1.00  → Battle-Scarred
```

### Animation Architecture
- Uses `requestAnimationFrame()` for smooth 60 FPS
- Ease-out cubic function for natural deceleration
- Position calculated as: `totalDistance * easeOutCubic(progress)`
- Center marker alignment with random offset within item

## Customization

### Adding New Cases
Edit `js/data.js` and add to the CASES array:
```javascript
{
    id: 'my-case',
    name: 'My Custom Case',
    price: 2.99,
    image: '🎁',
    description: 'Custom collection',
    items: generateCaseItems('Custom', 30)
}
```

### Modifying Probabilities
Edit the RARITIES object in `js/data.js`:
```javascript
CONSUMER: {
    probability: 0.7992,  // Adjust as needed
    multiplier: 0.5,
    color: '#b0b0b0'
}
```

### Changing Themes
CSS variables in `styles.css` control theming:
```css
:root {
    --bg-primary: #1a1a2e;
    --accent-orange: #ff6b35;
    /* ... */
}
```

## Performance Optimizations

- Lazy loading of images
- Efficient DOM updates
- Debounced search inputs
- Throttled event handlers
- requestAnimationFrame for animations
- Minimal memory footprint
- localStorage for persistence

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 80+ | ✓ Full |
| Firefox | 75+ | ✓ Full |
| Safari | 13+ | ✓ Full |
| Edge | 80+ | ✓ Full |
| Mobile | Modern | ✓ Responsive |

## Legal Disclaimer

This is a fan-made simulator and is **NOT affiliated with Valve Corporation**. All game assets, names, and trademarks are property of their respective owners. This simulator uses original placeholder artwork and does not contain any copyrighted Valve assets.

## Credits

Built with:
- Vanilla JavaScript (ES6+)
- CSS3 with custom properties
- Chart.js for statistics
- Web Audio API for sounds
- Crypto Subtle API for hashing

## License

MIT License - Free to use and modify for personal and educational purposes.

---

Enjoy opening cases! 🎁🔫
