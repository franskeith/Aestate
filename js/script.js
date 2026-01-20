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

        const cardHTML = `
            <div class="product-card" style="--i: ${index}" onclick="handleCardClick(event, '${shopLink}')">
                <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null; this.src='https://via.placeholder.com/300?text=No+Image'">
                
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
}

// Handle card click separately to manage navigation vs expansion
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

// Simpan data mentah disini biar bisa di-filter tanpa fetch ulang
let allCatalogData = [];

async function loadCatalog() {
    try {
        // Panggil Action baru: get_catalog
        const response = await fetch(API_URL + "?action=get_catalog");
        const data = await response.json();

        if (data.status === 'error' || !Array.isArray(data)) {
            catalogGrid.innerHTML = '<p class="error-msg">Gagal memuat katalog.</p>';
            return;
        }

        allCatalogData = data; // Simpan ke memori
        renderCatalog(allCatalogData); // Tampilkan semua di awal

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

    products.forEach(p => {
        const priceFormatted = parseInt(p.price).toLocaleString('id-ID');
        const shopLink = p.shop_link || '#';

        // Escape product object for onclick
        const escapedProduct = JSON.stringify(p).replace(/"/g, '&quot;');

        // --- TEMPLATE BARU (Pop Up Title & Brown Price SC) ---
        // Menggunakan style .card-final sesuai request user
        const html = `
            <div class="card-final" onclick='openProductPopup(${escapedProduct}, event)'>
                <div class="img-box">
                    <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null; this.src='https://via.placeholder.com/300'">
                    <div class="card-actions">
                        <a href="${shopLink}" target="_blank" class="btn-card-action btn-shop" onclick="event.stopPropagation()">Shop</a>
                        <button type="button" class="btn-card-action btn-detail" onclick="event.stopPropagation(); openProductPopup(${escapedProduct}, event)">Detail</button>
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
}

// --- LOGIC SEARCH & FILTER (GABUNGAN) ---
function filterHandler() {
    const keyword = searchInput.value.toLowerCase();
    const activeCategory = document.querySelector('.filter-btn.active').dataset.filter;

    // Filter Array di Javascript (Cepet banget)
    const filtered = allCatalogData.filter(p => {
        const pName = p.name.toLowerCase();
        const pCat = p.category.toLowerCase();

        // 1. Cek Keyword Search
        const matchSearch = pName.includes(keyword) || pCat.includes(keyword);

        // 2. Cek Kategori Tab
        let matchCategory = true;
        if (activeCategory !== 'all') {
            matchCategory = pCat.includes(activeCategory); // misal 'top' ada di 'tank top'
        }

        return matchSearch && matchCategory;
    });

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
});