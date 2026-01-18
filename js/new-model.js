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

    // Render each product card
    topTen.forEach(product => {
        // Check for badges in events field
        const events = (product.events || '').toLowerCase();
        let badgeHTML = '';
        if (events.includes('new')) {
            badgeHTML = '<div class="product-badge badge-new">NEW</div>';
        } else if (events.includes('hot')) {
            badgeHTML = '<div class="product-badge badge-hot">HOT</div>';
        } else if (events.includes('best_seller') || events.includes('bestseller')) {
            badgeHTML = '<div class="product-badge badge-best">BEST</div>';
        }

        // Format price
        const formattedPrice = formatPrice(product.price);

        const cardHTML = `
            <div class="product-card">
                <div class="p-img-box">
                    ${badgeHTML}
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
                    <div class="p-actions">
                        <a href="${product.shop_link || '#'}" target="_blank" class="action-btn">Shop</a>
                    </div>
                </div>
                <div class="p-info">
                    <span class="price">${formattedPrice}</span>
                    <span class="cat">${product.category}</span>
                    <h4>${product.name}</h4>
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

function renderEventSlider(allProducts, eventsConfig) {
    const container = document.getElementById('events-slider-track');
    if (!container) return;

    container.innerHTML = ''; // Clear loading state

    eventsConfig.forEach(config => {
        // Filter products for this event
        // Logic: Check if product.events string contains the config.id (e.g. "valentine")
        const eventProducts = allProducts.filter(p => {
            if (!p.events) return false;
            // Simple string check, can be improved with regex or split
            // "valentine, new" -> includes "valentine" ? Yes.
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
        // We pick:
        // - Main Image: From the 1st product found (or a specific cover if we had one)
        // - Stickers: From 2nd and 3rd products (if available)

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

        const cardHTML = `
            <div class="event-card ${config.theme}">
                ${badgesHTML}
                <div class="evt-content">
                    <span class="evt-tag t-${config.tagColor}">${config.tag}</span>
                    <h3 class="evt-title">${config.title}</h3>
                    <p class="evt-desc">${config.desc}</p>
                    <a href="${config.btnLink}" class="btn-pill ${config.btnClass}">${config.btnText}</a>
                </div>
                <div class="evt-visual">
                    <img src="${mainImg}" class="main-img" alt="${config.title}">
                    ${stickersHTML}
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// Start
document.addEventListener('DOMContentLoaded', initNewModelPage);
