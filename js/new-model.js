// ==========================================
// NEW MODEL PAGE LOGIC
// ==========================================

const API_URL = "https://script.google.com/macros/s/AKfycbxbPkvjyWrnKeiIr9unaPwWLgqrZv7AnWyP4roAgvMgpA6f_e8u6u1FZazoqgSurV0D/exec";
// Note: Using the same API URL as script.js. Ensure 'get_catalog' action is available.

// MOCK DATA (For testing without backend update)
const USE_MOCK_DATA = false; // Set to true for testing, false for production

const MOCK_PRODUCTS = [
    {
        name: "Romeo Red Shirt",
        category: "Set",
        price: 350000,
        events: "valentine, set",
        image: "https://i.ibb.co.com/6cCq7qhQ/image.png",
        shop_link: "#"
    },
    {
        name: "Date Night Blazer",
        category: "Set",
        price: 550000,
        events: "valentine, set",
        image: "https://i.ibb.co.com/xSQ8Y79t/image.png",
        shop_link: "#"
    },
    {
        name: "Casual Charmer Look",
        category: "Set",
        price: 380000,
        events: "valentine, set",
        image: "https://i.ibb.co.com/Vpbkyzpn/image.png",
        shop_link: "#"
    },
    {
        name: "Eternal Match Couple Set",
        category: "Set",
        price: 850000,
        events: "valentine, couple",
        image: "https://i.ibb.co.com/wrwG0CzX/image.png",
        shop_link: "#"
    },
    {
        name: "Soulmate Coord Set",
        category: "Set",
        price: 800000,
        events: "valentine, couple",
        image: "https://i.ibb.co.com/h1CzxwWx/image.png",
        shop_link: "#"
    },
    {
        name: "Ruby Chain Bag",
        category: "Accessories",
        price: 299000,
        events: "valentine, bag",
        image: "https://i.ibb.co.com/NnWN3bqj/image.png",
        shop_link: "#"
    }
];

// --- MAIN FUNCTIONS ---

// Helper: Check if any product in the event has a special badge
function detectEventBadges(products) {
    const badges = [];
    const allEvents = products.map(p => (p.events || '').toLowerCase()).join(',');

    if (allEvents.includes('new')) badges.push({ label: 'NEW', class: 'new' });
    if (allEvents.includes('hot')) badges.push({ label: 'HOT', class: 'hot' });
    if (allEvents.includes('best_seller') || allEvents.includes('bestseller')) badges.push({ label: 'BEST', class: 'best' });

    return badges;
}

// Helper: Generate badge HTML
function renderBadgesHTML(badges) {
    if (badges.length === 0) return '';

    // Only show max 2 badges to avoid clutter
    return badges.slice(0, 2).map((badge, index) => `
        <div class="evt-badge evt-badge-${badge.class}" style="top: ${15 + (index * 35)}px;">
            ${badge.label}
        </div>
    `).join('');
}

async function initNewModelPage() {
    console.log("Initializing New Model Page...");

    // 1. Fetch Data
    let products = [];
    if (USE_MOCK_DATA) {
        console.warn("Using MOCK DATA for New Model Page");
        products = MOCK_PRODUCTS;
    } else {
        try {
            const response = await fetch(API_URL + "?action=get_catalog");
            products = await response.json();
        } catch (error) {
            console.error("Failed to fetch products:", error);
            // Fallback to empty array or show error UI
        }
    }

    // 2. Load Registered Events
    // window.AESTATE_EVENTS is populated by the separate event scripts (e.g. valentine.js)
    const registeredEvents = window.AESTATE_EVENTS || [];

    if (registeredEvents.length === 0) {
        console.warn("No events registered. Make sure to include event scripts (e.g. js/events/valentine.js).");
    } else {
        // 3. Render Event Slider
        renderEventSlider(products, registeredEvents);
    }

    // 4. Render Just Landed (10 Sets from last 30 days)
    renderJustLanded(products);
}

// --- JUST LANDED: 10 Sets added in last 30 days ---
function renderJustLanded(allProducts) {
    const container = document.getElementById('just-landed-grid');
    if (!container) return;

    // Calculate cutoff date (30 days ago)
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - 30);

    // Filter: Only 'Set' category, added within last 30 days
    const recentSets = allProducts.filter(p => {
        // Check category is 'Set'
        const isSet = String(p.category).toLowerCase() === 'set';

        // Parse date_added (could be Date object or string)
        let dateAdded;
        if (p.date_added instanceof Date) {
            dateAdded = p.date_added;
        } else if (typeof p.date_added === 'string' && p.date_added) {
            // Try parsing various formats
            dateAdded = new Date(p.date_added);
        } else {
            dateAdded = new Date(0); // Very old date if unparseable
        }

        const isRecent = dateAdded >= cutoffDate;

        return isSet && isRecent;
    });

    // Sort by date_added (newest first)
    recentSets.sort((a, b) => {
        const dateA = new Date(a.date_added || 0);
        const dateB = new Date(b.date_added || 0);
        return dateB - dateA;
    });

    // Take only top 10
    const topTen = recentSets.slice(0, 10);

    // Clear loading state
    container.innerHTML = '';

    if (topTen.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888;">No new sets in the last 30 days.</p>';
        return;
    }

    // Render each product card with standardized card-final structure
    topTen.forEach(product => {
        // Check for badges in events field
        const events = (product.events || '').toLowerCase();
        let badgeHTML = '';
        if (events.includes('new')) {
            badgeHTML = '<div class="badge-status bg-new">NEW</div>';
        } else if (events.includes('hot')) {
            badgeHTML = '<div class="badge-status bg-hot">HOT</div>';
        } else if (events.includes('best_seller') || events.includes('bestseller')) {
            badgeHTML = '<div class="badge-status bg-new">BEST</div>';
        }

        // Format price
        const priceFormatted = parseInt(product.price).toLocaleString('id-ID');
        const shopLink = product.shop_link || '#';
        const escapedProduct = JSON.stringify(product).replace(/"/g, '&quot;');

        // Use standardized card-final structure (matching home page)
        const cardHTML = `
            <div class="card-final" onclick='openProductPopup(${escapedProduct}, event)'>
                <div class="img-box">
                    ${badgeHTML}
                    <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x400?text=No+Image'">
                    <div class="card-actions">
                        <a href="${shopLink}" target="_blank" class="btn-card-action btn-shop" onclick="event.stopPropagation()">Shop</a>
                        <button type="button" class="btn-card-action btn-detail" onclick="event.stopPropagation(); openProductPopup(${escapedProduct}, event)">Detail</button>
                    </div>
                </div>
                
                <div class="card-info">
                    <span class="category-badge">${product.category}</span>
                    <div class="info-row">
                        <h3 class="card-title">${product.name}</h3>
                        <div class="card-price">
                            <span class="currency">IDR</span>
                            <span class="value">${priceFormatted}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// Helper: Format price to IDR
function formatPrice(price) {
    if (!price) return 'IDR -';
    const num = parseInt(price);
    if (num >= 1000000) {
        return 'IDR ' + (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return 'IDR ' + (num / 1000).toFixed(0) + 'K';
    }
    return 'IDR ' + num;
}

// Store products globally for expand functionality
let globalProducts = [];

function renderEventSlider(allProducts, eventsConfig) {
    const container = document.getElementById('events-slider-track');
    if (!container) return;

    // Store globally for expand functionality
    globalProducts = allProducts;

    container.innerHTML = ''; // Clear loading state

    eventsConfig.forEach(config => {
        // Filter products for this event
        const eventProducts = allProducts.filter(p => {
            if (!p.events) return false;
            return p.events.toLowerCase().includes(config.id.toLowerCase());
        });

        if (eventProducts.length === 0) {
            console.log(`Skipping event '${config.id}': No products found.`);
            return;
        }

        // --- DETECT BADGES (NEW, HOT, BEST SELLER) ---
        const badges = detectEventBadges(eventProducts);
        const badgesHTML = renderBadgesHTML(badges);

        // --- RENDER CARD ---
        const mainImg = eventProducts[0].image;
        const sticker1 = eventProducts[1]?.image || null;
        const sticker2 = eventProducts[2]?.image || null;

        // Generate Sticker HTML if images exist
        let stickersHTML = '';
        if (sticker1) {
            stickersHTML += `
                <div class="evt-sticker s-1" style="--r: 5deg;">
                    <img src="${sticker1}" alt="Sticker 1">
                </div>
            `;
        }
        if (sticker2) {
            stickersHTML += `
                <div class="evt-sticker s-2" style="--r: -5deg;">
                    <img src="${sticker2}" alt="Sticker 2">
                </div>
            `;
        }

        // Create unique ID for this event card
        const eventCardId = `event-card-${config.id}`;
        const productGridId = `event-products-${config.id}`;

        const cardHTML = `
            <div class="event-card-container" id="${eventCardId}-container">
                <div class="event-card ${config.theme}" id="${eventCardId}">
                    <div class="evt-content">
                        <span class="evt-tag t-${config.tagColor}">${config.tag}</span>
                        <h3 class="evt-title">${config.title}</h3>
                        <p class="evt-desc">${config.desc}</p>
                        <button type="button" class="btn-pill ${config.btnClass} btn-expand-event" 
                                onclick="toggleEventProducts('${config.id}')" 
                                data-event-id="${config.id}">
                            <span class="btn-text">${config.btnText}</span>
                            <span class="btn-icon">▼</span>
                        </button>
                    </div>
                    <div class="evt-visual">
                        <img src="${mainImg}" class="main-img" alt="${config.title}">
                        ${stickersHTML}
                    </div>
                </div>
                
                <!-- Expandable Product Grid -->
                <div class="event-products-wrapper" id="${productGridId}" style="display: none;">
                    <div class="event-products-header">
                        <h4>Products for ${config.title.replace('<br>', ' ')}</h4>
                        <span class="product-count">${eventProducts.length} items</span>
                    </div>
                    <div class="event-products-grid">
                        <!-- Products will be rendered here -->
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// Toggle expand/collapse for event products
function toggleEventProducts(eventId) {
    const productGridWrapper = document.getElementById(`event-products-${eventId}`);
    const eventCard = document.getElementById(`event-card-${eventId}`);
    const button = document.querySelector(`[data-event-id="${eventId}"]`);

    if (!productGridWrapper || !eventCard) return;

    const isExpanded = productGridWrapper.style.display !== 'none';

    if (isExpanded) {
        // Collapse
        productGridWrapper.style.maxHeight = productGridWrapper.scrollHeight + 'px';
        requestAnimationFrame(() => {
            productGridWrapper.style.maxHeight = '0px';
        });
        setTimeout(() => {
            productGridWrapper.style.display = 'none';
        }, 400);

        eventCard.classList.remove('expanded');
        if (button) {
            button.querySelector('.btn-icon').textContent = '▼';
            button.querySelector('.btn-text').textContent = button.querySelector('.btn-text').textContent.replace('Hide', 'Shop');
        }
    } else {
        // Expand - first render products if not already done
        const grid = productGridWrapper.querySelector('.event-products-grid');
        if (grid && grid.children.length === 0) {
            renderEventProducts(eventId, grid);
        }

        productGridWrapper.style.display = 'block';
        productGridWrapper.style.maxHeight = '0px';
        requestAnimationFrame(() => {
            productGridWrapper.style.maxHeight = productGridWrapper.scrollHeight + 'px';
        });
        setTimeout(() => {
            productGridWrapper.style.maxHeight = 'none';
        }, 400);

        eventCard.classList.add('expanded');
        if (button) {
            button.querySelector('.btn-icon').textContent = '▲';
            button.querySelector('.btn-text').textContent = button.querySelector('.btn-text').textContent.replace('Shop', 'Hide');
        }

        // Smooth scroll to show products
        setTimeout(() => {
            productGridWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

// Render products for a specific event
function renderEventProducts(eventId, container) {
    const eventProducts = globalProducts.filter(p => {
        if (!p.events) return false;
        return p.events.toLowerCase().includes(eventId.toLowerCase());
    });

    if (eventProducts.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; padding: 40px;">No products found for this event.</p>';
        return;
    }

    eventProducts.forEach(product => {
        const events = (product.events || '').toLowerCase();
        let badgeHTML = '';
        if (events.includes('new')) {
            badgeHTML = '<div class="badge-status bg-new">NEW</div>';
        } else if (events.includes('hot')) {
            badgeHTML = '<div class="badge-status bg-hot">HOT</div>';
        } else if (events.includes('best_seller') || events.includes('bestseller')) {
            badgeHTML = '<div class="badge-status bg-new">BEST</div>';
        }

        const priceFormatted = parseInt(product.price).toLocaleString('id-ID');
        const shopLink = product.shop_link || '#';
        const escapedProduct = JSON.stringify(product).replace(/"/g, '&quot;');

        const cardHTML = `
            <div class="card-final" onclick='openProductPopup(${escapedProduct}, event)'>
                <div class="img-box">
                    ${badgeHTML}
                    <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x400?text=No+Image'">
                    <div class="card-actions">
                        <a href="${shopLink}" target="_blank" class="btn-card-action btn-shop" onclick="event.stopPropagation()">Shop</a>
                        <button type="button" class="btn-card-action btn-detail" onclick="event.stopPropagation(); openProductPopup(${escapedProduct}, event)">Detail</button>
                    </div>
                </div>
                
                <div class="card-info">
                    <span class="category-badge">${product.category}</span>
                    <div class="info-row">
                        <h3 class="card-title">${product.name}</h3>
                        <div class="card-price">
                            <span class="currency">IDR</span>
                            <span class="value">${priceFormatted}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// Start
document.addEventListener('DOMContentLoaded', initNewModelPage);
