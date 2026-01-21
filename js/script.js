// ==========================================
// 0. IMAGE PRE-CACHING (Service Worker)
// ==========================================

// Security warning in console
if (typeof console !== 'undefined') {
    const style = 'font-size: 28px; color: #ff0000; font-weight: bold; text-shadow: 2px 2px 4px #000;';
    const style2 = 'font-size: 18px; color: #ff6600; font-weight: bold;';
    const style3 = 'font-size: 14px; color: #666; font-style: italic;';
    console.log('%c⚠️ Eits, jangan nakal yaaa...', style);
    console.log('%cJangan paste kode apapun atau nanti... tau sendiri :D', style2);
    console.log('%c- Developer', style3);
    
    // Prevent console.log of sensitive objects
    const originalLog = console.log;
    console.log = function(...args) {
        // Filter out large arrays that might be product data
        const filtered = args.map(arg => {
            if (Array.isArray(arg) && arg.length > 0 && arg[0]?.id && arg[0]?.price) {
                return '[Product Data Hidden 🔒]';
            }
            return arg;
        });
        originalLog.apply(console, filtered);
    };
}

// Pre-cache critical images AFTER page load (non-blocking)
window.addEventListener('load', () => {
    // Tunggu imageCache dari image-cache.js tersedia
    if (typeof imageCache !== 'undefined') {
        // Delay pre-caching agar tidak mengganggu page load
        setTimeout(() => {
            const criticalImages = [
                'assets/images/home/Model.png',
                'assets/images/home/try magic.png'
            ];

            // Non-blocking - tidak pakai await
            imageCache.preloadThumbnails(criticalImages);
        }, 1000); // Cache after 1 second

        // Check cache size periodically (every 10 minutes)
        setInterval(() => {
            imageCache.clearIfOverLimit();
        }, 600000);
    }
});

// ==========================================
// 1. VISUAL EFFECT (SLIDER ONLY)
// ==========================================

// NOTE: Navbar scroll behavior is handled by navbar.js
// This file now focuses on homepage-specific features only

// Hero Slider Logic
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;
const slideInterval = 5000;

function nextSlide() {
    if (slides.length === 0) return;
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

if (slides.length > 0) {
    setInterval(nextSlide, slideInterval);
}

// ==========================================
// MAGIC SEARCH - TYPING ANIMATION
// ==========================================
const magicSearchInput = document.getElementById('magic-search');

if (magicSearchInput) {
    const placeholderTexts = [
        "Valentine 2025",
        "Summer Collection",
        "Minimalist Style",
        "Build Your Identity"
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeEffect() {
        const currentText = placeholderTexts[textIndex];

        if (isDeleting) {
            // Deleting: reduce charIndex first, then update display
            charIndex--;
            magicSearchInput.setAttribute('placeholder', currentText.substring(0, charIndex));
            typingSpeed = 50;
        } else {
            // Typing: update display, then increase charIndex
            magicSearchInput.setAttribute('placeholder', currentText.substring(0, charIndex));
            charIndex++;
            typingSpeed = 100;
        }

        // Keep cursor visible throughout
        if (!magicSearchInput.classList.contains('typing')) {
            magicSearchInput.classList.add('typing');
        }

        // When word is complete (charIndex reached text length)
        if (!isDeleting && charIndex > currentText.length) {
            typingSpeed = 2000; // Pause at end
            isDeleting = true;
            charIndex = currentText.length; // Reset to exact length
        }
        // When deletion is complete (charIndex reached 0)
        else if (isDeleting && charIndex <= 0) {
            isDeleting = false;
            charIndex = 0; // Ensure it's exactly 0
            textIndex = (textIndex + 1) % placeholderTexts.length;
            typingSpeed = 500; // Pause before next word
        }

        setTimeout(typeEffect, typingSpeed);
    }

    // Clear initial placeholder and start typing effect after search bar animation completes
    setTimeout(() => {
        magicSearchInput.setAttribute('placeholder', ''); // Clear any initial placeholder
        charIndex = 0; // Ensure we start from 0
        isDeleting = false; // Ensure we start typing
        magicSearchInput.classList.add('typing'); // Show cursor immediately
        typeEffect(); // Start typing
    }, 2500);
}
// ==========================================
// 2. DATA FETCHING (GOOGLE SHEETS)
// ==========================================
// ==========================================
// IMAGE LOADING HELPER WITH RETRY & CACHE
// ==========================================

// Cache untuk menyimpan URL gambar yang sudah berhasil load
const imageUrlCache = new Map();

// Fungsi untuk load image dengan retry mechanism
function loadImageWithRetry(imgElement, url, retries = 3, delay = 1000) {
    // Cek cache dulu
    if (imageUrlCache.has(url)) {
        imgElement.src = imageUrlCache.get(url);
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const attempt = (retriesLeft) => {
            const img = new Image();
            
            img.onload = () => {
                imgElement.src = url;
                imageUrlCache.set(url, url); // Simpan ke cache
                resolve();
            };
            
            img.onerror = () => {
                if (retriesLeft > 0) {
                    console.log(`Retry loading image (${retriesLeft} left): ${url}`);
                    setTimeout(() => attempt(retriesLeft - 1), delay);
                } else {
                    console.error(`Failed to load image after retries: ${url}`);
                    // Gunakan placeholder lokal
                    imgElement.src = 'assets/images/placeholder.svg';
                    reject(new Error('Image load failed'));
                }
            };
            
            img.src = url;
        };
        
        attempt(retries);
    });
}

// ==========================================
// 2. DATA FETCHING (NEW ARRIVAL - SETS ONLY)
// ==========================================

const API_URL = "https://script.google.com/macros/s/AKfycbxbPkvjyWrnKeiIr9unaPwWLgqrZv7AnWyP4roAgvMgpA6f_e8u6u1FZazoqgSurV0D/exec";

const katalogArea = document.getElementById('katalog-area');
const loadingIndicator = document.getElementById('loading-indicator');

async function loadNewArrivals() {
    try {
        // Backend (HomeService.gs) udah otomatis:
        // 1. Filter cuma 'Set'
        // 2. Sort by Date
        // 3. Potong cuma 3 biji
        const response = await fetch(API_URL + "?action=get_new_arrivals");
        const data = await response.json();

        console.log("Data New Sets:", data);

        // Cek Error dari Google Sheet
        if (data.status === 'error') {
            // Tampilkan pesan error ASLI dari backend biar ketahuan salahnya
            console.error("Backend Error:", data.message);
            showError(
                "⚠️ Gagal memuat produk terbaru",
                data.message || "Terjadi kesalahan pada server",
                true
            );
            return;
        }

        if (!Array.isArray(data)) {
            showError(
                "⚠️ Format data tidak valid",
                "Silakan coba beberapa saat lagi",
                true
            );
            return;
        }

        // Render Data (Gak perlu slice lagi karena backend udah kasih 3)
        renderGrid(data);

        if (loadingIndicator) loadingIndicator.style.display = 'none';

    } catch (error) {
        console.error("Fetch Error:", error);
        showError(
            "🔌 Koneksi terputus",
            "Periksa koneksi internet Anda dan coba lagi",
            true
        );
    }
}

// Render Grid with Stacked Logic for Mobile
function renderGrid(products) {
    katalogArea.innerHTML = '';

    if (products.length === 0) {
        katalogArea.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Belum ada koleksi Set terbaru.</p>';
        return;
    }

    // Container click handler for expanding stack on mobile
    katalogArea.onclick = function (e) {
        if (window.innerWidth <= 768) {
            // Check if already expanded
            if (!this.classList.contains('expanded')) {
                this.classList.add('expanded');
                // Prevent link clicks during expansion
                e.preventDefault();
                e.stopPropagation();
            }
        }
    };

    products.forEach((p, index) => {
        const priceFormatted = parseInt(p.price).toLocaleString('id-ID');
        const shopLink = p.shop_link || '#';

        // Generate secure ID
        const secureId = 'na_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 9);
        productStore.set(secureId, { ...p, shop_link: shopLink });

        const cardHTML = `
            <div class="product-card" style="--i: ${index}" data-shop="${shopLink}" onclick="handleCardClickSecure(event, this)">
                <img class="lazy-img" data-src="${p.image}" alt="${p.name}" src="assets/images/placeholder.svg">
                
                <div class="overlay">
                    <h3>${p.name}</h3>
                    <p>Full Set • IDR ${priceFormatted}</p>
                    
                    <a href="${shopLink}" target="_blank" class="btn-shopee" onclick="event.stopPropagation()">
                        SHOP LOOK
                    </a>
                </div>
            </div>
        `;
        katalogArea.innerHTML += cardHTML;
    });
    
    // Load images dengan delay untuk avoid rate limit
    const lazyImages = katalogArea.querySelectorAll('.lazy-img');
    lazyImages.forEach((img, index) => {
        setTimeout(() => {
            loadImageWithRetry(img, img.dataset.src);
        }, index * 200); // Delay 200ms per gambar
    });
}

// Handle card click separately to manage navigation vs expansion
function handleCardClickSecure(event, element) {
    const url = element.getAttribute('data-shop');
    const container = document.getElementById('katalog-area');
    if (window.innerWidth <= 768) {
        if (container.classList.contains('expanded')) {
            if (url && url !== '#') {
                window.open(url, '_blank');
            }
        } else {
            // If collapsed, the container click handler will trigger expansion
            // We just need to stop this click from navigating immediately
            event.preventDefault();
        }
    } else {
        // Desktop behavior - direct open
        if (url && url !== '#') {
            window.open(url, '_blank');
        }
    }
}

// Legacy function - kept for backwards compatibility
function handleCardClick(event, url) {
    const container = document.getElementById('katalog-area');
    if (window.innerWidth <= 768) {
        if (container.classList.contains('expanded')) {
            window.open(url, '_blank');
        } else {
            // If collapsed, the container click handler will trigger expansion
            // We just need to stop this click from navigating immediately
            event.preventDefault();
        }
    } else {
        // Desktop behavior - direct open
        window.open(url, '_blank');
    }
}

function showError(msg) {
    if (loadingIndicator) {
        loadingIndicator.innerHTML = `<span style="color:red;">⚠️ ${msg}</span>`;
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadNewArrivals();
});

// Jalankan fungsi
// =========================================
// 4. ULTIMATE MAGIC TRANSITION (FIXED)
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    const magicBtn = document.getElementById('magic-btn');
    const overlay = document.getElementById('magic-overlay');

    // Cek apakah tombol ditemukan (Buat Debugging)
    if (!magicBtn) {
        console.error("❌ Error: ID 'magic-btn' tidak ditemukan di HTML!");
        return;
    } else {
        console.log("✅ Magic Button Ready!");
    }

    magicBtn.addEventListener('click', function (e) {
        e.preventDefault();
        console.log("✨ Magic Clicked!");

        // 1. AKTIFKAN MODE BIOSKOP
        document.body.classList.add('magic-active');

        // 2. HITUNG POSISI TOMBOL DI LAYAR (VIEWPORT)
        const rect = magicBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // 3. LEDAKAN PARTIKEL
        for (let i = 0; i < 80; i++) {
            createMagicParticle(centerX, centerY);
        }

        // 4. PINDAH HALAMAN
        setTimeout(() => {
            window.location.href = magicBtn.getAttribute('href');
        }, 1200);
    });
});

function createMagicParticle(x, y) {
    const particle = document.createElement('div');
    particle.classList.add('magic-particle');
    document.body.appendChild(particle);

    // Matematika Ledakan
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 500 + 100; // Jarak ledakan lebih jauh

    // Tujuan akhir relatif terhadap posisi awal
    const moveX = Math.cos(angle) * velocity;
    const moveY = Math.sin(angle) * velocity;

    // Set Posisi Awal & Tujuan di CSS Variable
    // Kita set posisi awal di X,Y tombol
    particle.style.setProperty('--start-x', x + 'px');
    particle.style.setProperty('--start-y', y + 'px');

    // Posisi tujuan adalah Awal + Pergerakan
    particle.style.setProperty('--dest-x', (x + moveX) + 'px');
    particle.style.setProperty('--dest-y', (y + moveY) + 'px');

    // Warna Random
    const colors = ['#ff02eaff', '#FFFFFF', '#FFD700'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];

    // Jalankan Animasi
    particle.style.animation = `explode ${Math.random() * 0.8 + 0.4}s cubic-bezier(0.25, 1, 0.5, 1) forwards`;

    // Bersihkan memory
    setTimeout(() => {
        particle.remove();
    }, 1500);
}

// ==========================================
// 5. FULL CATALOG LOGIC (SEARCH & FILTER)
// ==========================================

const catalogGrid = document.getElementById('main-catalog-grid');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');

// Secure storage untuk product data - tidak exposed di HTML
// Use WeakMap for better security (cannot be iterated)
const productStore = (() => {
    const store = new Map();
    
    // Prevent direct access to store
    return {
        set: (key, value) => store.set(key, Object.freeze(value)),
        get: (key) => store.get(key),
        has: (key) => store.has(key),
        // Don't expose delete, clear, or iteration methods
    };
})();

// IIFE to hide catalog data from global scope
const CatalogManager = (() => {
    // Private variable - cannot be accessed from console
    let _catalogData = [];
    
    // Freeze and seal to prevent tampering
    const _freezeData = (data) => {
        data.forEach(item => Object.freeze(item));
        return Object.freeze(data);
    };
    
    return {
        setData: (data) => {
            _catalogData = _freezeData(data);
        },
        getData: () => {
            // Return defensive copy, not original
            return [..._catalogData];
        },
        filterData: (keyword, category) => {
            return _catalogData.filter(p => {
                const pName = p.name.toLowerCase();
                const pCat = p.category.toLowerCase();
                const matchSearch = pName.includes(keyword) || pCat.includes(keyword);
                let matchCategory = true;
                if (category !== 'all') {
                    matchCategory = pCat.includes(category);
                }
                return matchSearch && matchCategory;
            });
        }
    };
})();

async function loadCatalog() {
    try {
        // Panggil Action baru: get_catalog
        const response = await fetch(API_URL + "?action=get_catalog");
        const data = await response.json();

        if (data.status === 'error' || !Array.isArray(data)) {
            catalogGrid.innerHTML = '<p class="error-msg">Gagal memuat katalog.</p>';
            return;
        }

        // Store in secure manager (private scope)
        CatalogManager.setData(data);
        renderCatalog(CatalogManager.getData());

    } catch (error) {
        console.error(error);
        catalogGrid.innerHTML = '<p class="error-msg">Koneksi bermasalah.</p>';
    }
}
function renderCatalog(products) {
    catalogGrid.innerHTML = ''; // Bersihkan grid

    if (products.length === 0) {
        catalogGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#999; margin-top:30px;">Produk tidak ditemukan.</p>';
        return;
    }

    products.forEach((p, index) => {
        const priceFormatted = parseInt(p.price).toLocaleString('id-ID');
        const shopLink = p.shop_link || '#';

        // Generate secure ID untuk product
        const secureId = 'p_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 9);
        
        // Store product securely di Map (tidak exposed di HTML)
        productStore.set(secureId, p);

        // --- TEMPLATE AMAN (Hanya ID yang di-expose) ---
        const html = `
            <div class="card-final" data-pid="${secureId}" onclick="openProductPopupSecure(this, event)">
                <div class="img-box">
                    <img class="lazy-catalog-img" data-src="${p.image}" alt="${p.name}" src="assets/images/placeholder.svg">
                    <div class="card-actions">
                        <a href="${shopLink}" target="_blank" class="btn-card-action btn-shop" onclick="event.stopPropagation()">Shop</a>
                        <button type="button" class="btn-card-action btn-detail" onclick="event.stopPropagation(); openProductPopupSecure(this.closest('[data-pid]'), event)">Detail</button>
                    </div>
                </div>
                
                <div class="card-info">
                    <span class="category-badge">${p.category}</span>
                    <div class="info-row">
                        <h3 class="card-title">${p.name}</h3>
                        <div class="card-price">
                            <span class="currency">IDR</span>
                            <span class="value">${priceFormatted}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        catalogGrid.innerHTML += html;
    });
    
    // Load images dengan staggered delay
    const lazyImages = catalogGrid.querySelectorAll('.lazy-catalog-img');
    lazyImages.forEach((img, index) => {
        setTimeout(() => {
            loadImageWithRetry(img, img.dataset.src);
        }, index * 150); // Delay 150ms per gambar
    });
}

// --- LOGIC SEARCH & FILTER (GABUNGAN) ---
function filterHandler() {
    const keyword = searchInput.value.toLowerCase();
    const activeCategory = document.querySelector('.filter-btn.active').dataset.filter;

    // Use secure manager to filter
    const filtered = CatalogManager.filterData(keyword, activeCategory);

    renderCatalog(filtered);
}

// Event Listeners
if (searchInput) {
    searchInput.addEventListener('input', filterHandler); // Search live typing
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Pindah class active
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');

        // Jalankan filter
        filterHandler();
    });
});

// PANGGIL DI DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // loadNewArrivals(); // <-- Yang lama tetep ada
    loadCatalog();       // <-- Tambahan baru

    // =========================================
    // STICKY TOOLBAR - Only within Catalog Section
    // =========================================
    const toolbar = document.querySelector('.catalog-toolbar');
    const catalogSection = document.getElementById('full-catalog');

    if (toolbar && catalogSection) {
        // Create a sentinel element to detect when toolbar should stick
        const sentinel = document.createElement('div');
        sentinel.className = 'toolbar-sentinel';
        sentinel.style.cssText = 'position: absolute; top: 0; left: 0; width: 1px; height: 1px; pointer-events: none;';
        toolbar.parentElement.insertBefore(sentinel, toolbar);

        // Store original position
        let toolbarHeight = toolbar.offsetHeight;

        // Create placeholder to prevent content jump
        const placeholder = document.createElement('div');
        placeholder.className = 'toolbar-placeholder';
        placeholder.style.cssText = `display: none; height: ${toolbarHeight}px;`;
        toolbar.parentElement.insertBefore(placeholder, toolbar.nextSibling);

        // Use scroll event for more precise control
        function handleScroll() {
            const sentinelRect = sentinel.getBoundingClientRect();
            const catalogRect = catalogSection.getBoundingClientRect();
            const navbarVisible = document.body.classList.contains('is-navbar-visible');
            const topOffset = navbarVisible ? 60 : 0;

            // Check if we're within the catalog section
            // Toolbar should be sticky only when:
            // 1. Catalog section TOP has scrolled past viewport top (we've entered the section)
            // 2. Sentinel is above viewport top (meaning we scrolled past toolbar original position)
            // 3. Catalog section bottom is still below viewport (we haven't left the section)
            const catalogTopReached = catalogRect.top <= topOffset;
            const toolbarPassedTop = sentinelRect.top <= topOffset;
            const stillInCatalog = catalogRect.bottom > (toolbarHeight + topOffset + 100);

            const shouldBeSticky = catalogTopReached && toolbarPassedTop && stillInCatalog;

            if (shouldBeSticky) {
                if (!toolbar.classList.contains('is-stuck')) {
                    toolbar.classList.add('is-stuck');
                    placeholder.style.display = 'block';
                }
            } else {
                if (toolbar.classList.contains('is-stuck')) {
                    toolbar.classList.remove('is-stuck');
                    placeholder.style.display = 'none';
                }
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', () => {
            toolbarHeight = toolbar.offsetHeight;
            placeholder.style.height = `${toolbarHeight}px`;
        });

        // Initial check
        handleScroll();
    }
    
    // =========================================
    // FINAL SECURITY: Prevent global scope pollution
    // =========================================
    // Make window properties read-only
    if (typeof CatalogManager !== 'undefined') {
        Object.defineProperty(window, 'CatalogManager', {
            value: CatalogManager,
            writable: false,
            configurable: false
        });
    }
    
    if (typeof productStore !== 'undefined') {
        Object.defineProperty(window, 'productStore', {
            value: productStore,
            writable: false,
            configurable: false
        });
    }
    
    // Freeze critical objects
    if (window.productStore) {
        Object.freeze(window.productStore);
    }
});