// ==========================================
// 1. VISUAL EFFECT (NAVBAR & SLIDER)
// ==========================================

const navbar = document.getElementById('navbar');

// Navbar Blur Effect saat Scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

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
            showError("Error: " + data.message);
            return;
        }

        if (!Array.isArray(data)) {
            showError("Format data salah (Bukan Array).");
            return;
        }

        // Render Data (Gak perlu slice lagi karena backend udah kasih 3)
        renderGrid(data);

        if (loadingIndicator) loadingIndicator.style.display = 'none';

    } catch (error) {
        console.error("Fetch Error:", error);
        showError("Koneksi bermasalah.");
    }
}

function renderGrid(products) {
    katalogArea.innerHTML = '';

    if (products.length === 0) {
        katalogArea.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Belum ada koleksi Set terbaru.</p>';
        return;
    }

    products.forEach(p => {
        const priceFormatted = parseInt(p.price).toLocaleString('id-ID');
        const shopLink = p.shop_link || '#';

        const cardHTML = `
            <div class="product-card" onclick="window.open('${shopLink}', '_blank')">
                <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null; this.src='https://via.placeholder.com/300?text=No+Image'">
                
                <div class="overlay">
                    <h3>${p.name}</h3>
                    <p>Full Set • IDR ${priceFormatted}</p>
                    
                    <a href="${shopLink}" target="_blank" class="btn-shopee">
                        SHOP LOOK
                    </a>
                </div>
            </div>
        `;
        katalogArea.innerHTML += cardHTML;
    });
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

        // --- TEMPLATE BARU (E-COMMERCE STYLE) ---
        // Perhatikan class-nya sekarang "catalog-card" bukan "product-card"
        // Biar CSS-nya kepisah sama New Arrival
        const html = `
            <div class="catalog-card" onclick="window.open('${shopLink}', '_blank')">
                <div class="img-wrapper">
                    <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null; this.src='https://via.placeholder.com/300'">
                </div>
                
                <div class="card-info">
                    <p class="category">${p.category}</p>
                    <h3>${p.name}</h3>
                    <p class="price">IDR ${priceFormatted}</p>
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
});