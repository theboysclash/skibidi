/**
 * CS2 Case Opening Simulator - UI Manager
 * Handles all UI interactions and navigation
 */

class UIManager {
    constructor() {
        this.currentPage = 'home';
        this.selectedCase = null;
        
        this.initialize();
    }
    
    /**
     * Initialize UI components
     */
    initialize() {
        this.setupNavigation();
        this.setupCasesPage();
        this.setupOpenCasePage();
        this.setupInventoryPage();
        this.setupSettingsPage();
        this.setupVerificationPage();
        this.setupModals();
        this.renderCases();
    }
    
    /**
     * Setup navigation
     */
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                audioManager.play('click');
                const page = link.dataset.page;
                this.navigateTo(page);
            });
        });
        
        // Handle direct hash navigation
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1);
            if (hash && document.getElementById(hash)) {
                this.navigateTo(hash);
            }
        });
    }
    
    /**
     * Navigate to page
     * @param {string} pageId - Page ID
     */
    navigateTo(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
            
            // Update URL hash
            window.location.hash = pageId;
            
            // Update nav active state
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.toggle('active', link.dataset.page === pageId);
            });
            
            // Refresh charts on statistics page
            if (pageId === 'statistics') {
                statistics.updateCharts();
            }
            
            // Refresh achievements page
            if (pageId === 'achievements') {
                achievements.render();
            }
        }
    }
    
    /**
     * Setup cases page
     */
    setupCasesPage() {
        const caseSearch = document.getElementById('caseSearch');
        const caseFilter = document.getElementById('caseFilter');
        
        if (caseSearch) {
            caseSearch.addEventListener('input', debounce((e) => {
                this.renderCases(e.target.value);
            }, 300));
        }
        
        if (caseFilter) {
            // Populate filter options
            CASES.forEach(caseData => {
                const option = document.createElement('option');
                option.value = caseData.id;
                option.textContent = caseData.name;
                caseFilter.appendChild(option);
            });
            
            caseFilter.addEventListener('change', (e) => {
                this.renderCases(null, e.target.value);
            });
        }
    }
    
    /**
     * Render cases grid
     * @param {string} search - Search query
     * @param {string} filter - Filter by case ID
     */
    renderCases(search = '', filter = 'all') {
        const grid = document.getElementById('casesGrid');
        if (!grid) return;
        
        let filteredCases = CASES;
        
        // Apply search filter
        if (search) {
            filteredCases = filteredCases.filter(c => 
                c.name.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        // Apply category filter
        if (filter !== 'all') {
            filteredCases = filteredCases.filter(c => c.id === filter);
        }
        
        grid.innerHTML = filteredCases.map(caseData => `
            <div class="case-card" data-case="${caseData.id}" onclick="ui.selectCase('${caseData.id}')">
                <div class="case-image">${caseData.image}</div>
                <h3>${caseData.name}</h3>
                <p style="color: var(--text-secondary); margin: 0.5rem 0;">${caseData.description}</p>
                <p class="case-price">${formatCurrency(caseData.price)}</p>
            </div>
        `).join('');
    }
    
    /**
     * Select case for opening
     * @param {string} caseId - Case ID
     */
    selectCase(caseId) {
        audioManager.play('click');
        const caseData = CASES.find(c => c.id === caseId);
        if (!caseData) return;
        
        this.selectedCase = caseData;
        
        // Update open case page
        document.getElementById('openingCaseName').textContent = caseData.name;
        document.getElementById('openingCasePrice').textContent = formatCurrency(caseData.price);
        
        // Initialize spinner
        const reel = document.getElementById('spinnerReel');
        spinner.initialize(caseData.items, reel);
        
        // Navigate to open case page
        this.navigateTo('open-case');
    }
    
    /**
     * Setup open case page
     */
    setupOpenCasePage() {
        const btnOpenCase = document.getElementById('btnOpenCase');
        const btnOpenCaseNow = document.getElementById('btnOpenCaseNow');
        const qtyButtons = document.querySelectorAll('.btn-qty');
        
        if (btnOpenCase) {
            btnOpenCase.addEventListener('click', () => app.openCase());
        }
        
        if (btnOpenCaseNow) {
            btnOpenCaseNow.addEventListener('click', () => {
                if (CASES.length > 0) {
                    this.selectCase(CASES[0].id);
                }
            });
        }
        
        qtyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                qtyButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                app.setQuantity(parseInt(btn.dataset.qty));
            });
        });
    }
    
    /**
     * Setup inventory page
     */
    setupInventoryPage() {
        const inventorySearch = document.getElementById('inventorySearch');
        const inventorySort = document.getElementById('inventorySort');
        const btnSellSelected = document.getElementById('btnSellSelected');
        const btnSellAll = document.getElementById('btnSellAll');
        const btnExport = document.getElementById('btnExportInventory');
        const btnImport = document.getElementById('btnImportInventory');
        
        if (inventorySearch) {
            inventorySearch.addEventListener('input', debounce((e) => {
                inventory.setSearch(e.target.value);
            }, 300));
        }
        
        if (inventorySort) {
            inventorySort.addEventListener('change', (e) => {
                inventory.setSort(e.target.value);
            });
        }
        
        if (btnSellSelected) {
            btnSellSelected.addEventListener('click', () => {
                const selected = Array.from(inventory.selectedItems);
                if (selected.length === 0) {
                    showToast('No items selected', 'info');
                    return;
                }
                
                const total = inventory.sellItems(selected);
                app.addFunds(total);
                showToast(`Sold ${selected.length} items for ${formatCurrency(total)}`, 'success');
            });
        }
        
        if (btnSellAll) {
            btnSellAll.addEventListener('click', () => {
                if (inventory.items.length === 0) {
                    showToast('Inventory is empty', 'info');
                    return;
                }
                
                if (confirm('Are you sure you want to sell all items?')) {
                    const total = inventory.sellAll();
                    app.addFunds(total);
                    showToast(`Sold all items for ${formatCurrency(total)}`, 'success');
                }
            });
        }
        
        if (btnExport) {
            btnExport.addEventListener('click', () => {
                inventory.export();
            });
        }
        
        if (btnImport) {
            btnImport.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                    if (e.target.files[0]) {
                        inventory.import(e.target.files[0]);
                    }
                };
                input.click();
            });
        }
    }
    
    /**
     * Setup settings page
     */
    setupSettingsPage() {
        const masterVolume = document.getElementById('masterVolume');
        const muteAll = document.getElementById('muteAll');
        const themeSelect = document.getElementById('themeSelect');
        const reduceMotion = document.getElementById('reduceMotion');
        const btnResetData = document.getElementById('btnResetData');
        const btnClearInventory = document.getElementById('btnClearInventory');
        
        if (masterVolume) {
            masterVolume.addEventListener('input', (e) => {
                audioManager.setVolume(e.target.value);
            });
        }
        
        if (muteAll) {
            muteAll.addEventListener('change', (e) => {
                audioManager.setMuted(e.target.checked);
            });
        }
        
        if (themeSelect) {
            const savedTheme = loadFromStorage('theme', 'dark');
            themeSelect.value = savedTheme;
            document.documentElement.setAttribute('data-theme', savedTheme);
            
            themeSelect.addEventListener('change', (e) => {
                document.documentElement.setAttribute('data-theme', e.target.value);
                saveToStorage('theme', e.target.value);
            });
        }
        
        if (reduceMotion) {
            reduceMotion.addEventListener('change', (e) => {
                saveToStorage('reduceMotion', e.target.checked);
            });
        }
        
        if (btnResetData) {
            btnResetData.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset ALL data? This cannot be undone!')) {
                    clearStorage();
                    location.reload();
                }
            });
        }
        
        if (btnClearInventory) {
            btnClearInventory.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear your inventory?')) {
                    inventory.clear();
                    showToast('Inventory cleared', 'success');
                }
            });
        }
    }
    
    /**
     * Setup verification page
     */
    setupVerificationPage() {
        const btnGenerateClientSeed = document.getElementById('btnGenerateClientSeed');
        const btnVerify = document.getElementById('btnVerify');
        
        if (btnGenerateClientSeed) {
            btnGenerateClientSeed.addEventListener('click', () => {
                provablyFair.generateClientSeed();
                showToast('New client seed generated', 'success');
            });
        }
        
        if (btnVerify) {
            btnVerify.addEventListener('click', async () => {
                const serverSeed = document.getElementById('verifyServerSeed').value;
                const clientSeed = document.getElementById('verifyClientSeed').value;
                const nonce = parseInt(document.getElementById('verifyNonce').value);
                const resultDiv = document.getElementById('verificationResult');
                
                if (!serverSeed || !clientSeed || isNaN(nonce)) {
                    resultDiv.className = 'verification-result error';
                    resultDiv.textContent = 'Please fill in all fields';
                    return;
                }
                
                // Verify the roll
                const result = await ProvablyFairSystem.verifyRoll(serverSeed, clientSeed, nonce, 0);
                
                resultDiv.className = `verification-result ${result.valid ? 'success' : 'error'}`;
                resultDiv.innerHTML = `
                    <strong>${result.message}</strong><br>
                    Calculated Hash: ${result.calculatedHash}<br>
                    Calculated Result: ${result.calculatedResult}
                `;
            });
        }
    }
    
    /**
     * Setup modals
     */
    setupModals() {
        // Item modal
        const itemModal = document.getElementById('itemModal');
        const modalClose = document.getElementById('modalClose');
        const modalBtnSell = document.getElementById('modalBtnSell');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                itemModal.classList.remove('show');
            });
        }
        
        if (itemModal) {
            itemModal.addEventListener('click', (e) => {
                if (e.target === itemModal) {
                    itemModal.classList.remove('show');
                }
            });
        }
        
        if (modalBtnSell) {
            modalBtnSell.addEventListener('click', () => {
                const itemId = modalBtnSell.dataset.itemId;
                if (itemId) {
                    const item = inventory.getItem(itemId);
                    if (item) {
                        const value = inventory.sellItem(itemId);
                        app.addFunds(value);
                        itemModal.classList.remove('show');
                        showToast(`Sold for ${formatCurrency(value)}`, 'success');
                    }
                }
            });
        }
        
        // Deposit modal
        const depositModal = document.getElementById('depositModal');
        const depositModalClose = document.getElementById('depositModalClose');
        const btnDeposit = document.getElementById('btnDeposit');
        const btnCustomDeposit = document.getElementById('btnCustomDeposit');
        
        if (btnDeposit) {
            btnDeposit.addEventListener('click', () => {
                audioManager.play('click');
                depositModal.classList.add('show');
            });
        }
        
        if (depositModalClose) {
            depositModalClose.addEventListener('click', () => {
                depositModal.classList.remove('show');
            });
        }
        
        if (depositModal) {
            depositModal.addEventListener('click', (e) => {
                if (e.target === depositModal) {
                    depositModal.classList.remove('show');
                }
            });
        }
        
        // Deposit amount buttons
        document.querySelectorAll('.btn-deposit-amount').forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseFloat(btn.dataset.amount);
                app.addFunds(amount);
                depositModal.classList.remove('show');
                showToast(`Added ${formatCurrency(amount)}`, 'success');
            });
        });
        
        if (btnCustomDeposit) {
            btnCustomDeposit.addEventListener('click', () => {
                const input = document.getElementById('customDepositAmount');
                const amount = parseFloat(input.value);
                if (amount > 0) {
                    app.addFunds(amount);
                    depositModal.classList.remove('show');
                    showToast(`Added ${formatCurrency(amount)}`, 'success');
                    input.value = '';
                }
            });
        }
    }
    
    /**
     * Show item inspection modal
     * @param {string} itemId - Item ID
     */
    showItemModal(itemId) {
        const item = inventory.getItem(itemId);
        if (!item) return;
        
        const modal = document.getElementById('itemModal');
        const modalBtnSell = document.getElementById('modalBtnSell');
        
        document.getElementById('modalItemImage').textContent = item.image;
        document.getElementById('modalItemName').textContent = item.name;
        document.getElementById('modalItemRarity').textContent = item.rarity;
        document.getElementById('modalItemRarity').style.color = getRarityColor(item.rarity);
        document.getElementById('modalItemFloat').textContent = item.float.toFixed(6);
        document.getElementById('modalItemWear').textContent = item.wearCondition || getWearCondition(item.float);
        document.getElementById('modalItemPattern').textContent = item.patternId;
        document.getElementById('modalItemValue').textContent = formatCurrency(item.finalValue);
        document.getElementById('modalItemDate').textContent = formatDate(item.dateObtained);
        document.getElementById('modalItemCase').textContent = item.caseSource;
        
        modalBtnSell.dataset.itemId = itemId;
        
        modal.classList.add('show');
    }
    
    /**
     * Update wallet display
     * @param {number} amount - Wallet amount
     */
    updateWalletDisplay(amount) {
        const walletEl = document.getElementById('walletAmount');
        if (walletEl) {
            walletEl.textContent = formatCurrency(amount);
        }
    }
    
    /**
     * Add recent drop to feed
     * @param {object} item - Dropped item
     */
    addRecentDrop(item) {
        const feed = document.getElementById('dropsFeed');
        if (!feed) return;
        
        const dropEl = document.createElement('div');
        dropEl.className = `item-card ${getRarityClass(item.rarity)}`;
        dropEl.style.minWidth = '150px';
        dropEl.innerHTML = `
            <div class="item-card-image" style="border-bottom: 3px solid ${getRarityColor(item.rarity)}">
                ${item.image}
            </div>
            <div class="item-card-name" title="${item.name}">${item.name}</div>
            <div class="item-card-value">${formatCurrency(item.finalValue || item.baseValue)}</div>
        `;
        
        feed.insertBefore(dropEl, feed.firstChild);
        
        // Keep only last 20 drops
        while (feed.children.length > 20) {
            feed.removeChild(feed.lastChild);
        }
    }
}

// Create global instance
const ui = new UIManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIManager, ui };
}
