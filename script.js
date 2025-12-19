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
const slideInterval = 4000; // 4 detik biar agak lamaan dikit bacanya

function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

setInterval(nextSlide, slideInterval);
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

        if(loadingIndicator) loadingIndicator.style.display = 'none';

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
                <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
                
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
    if(loadingIndicator) {
        loadingIndicator.innerHTML = `<span style="color:red;">⚠️ ${msg}</span>`;
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadNewArrivals();
});

// Jalankan fungsi
