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

const API_URL = 'https://script.google.com/macros/s/AKfycbwiO26llTJTaHC97avm3Cz9hVMdjpxU11UV-2bD5p6PIB7DCAaq7H_lsVe-U2N2TQg/exec'; 

async function ambilDataKatalog() {
    const container = document.getElementById('katalog-area');
    const loadingText = document.getElementById('loading-text'); // Text kecil di header (opsional)

    // 1. TAMPILKAN LOADING (SPINNER) SEBELUM FETCH
    // Kita inject HTML loader ke dalam container
    container.innerHTML = '<div class="loader"></div>';
    
    try {
        // Proses ambil data (ini yang butuh waktu lama)
        const response = await fetch(API_URL);
        const dataProduk = await response.json();
        
        console.log("Data Full:", dataProduk);

        // 2. AMBIL CUMA 3 PRODUK PERTAMA
        // .slice(0, 3) artinya potong dari index 0 sampai 3
        const topThree = dataProduk.slice(0, 3);

        renderKatalog(topThree);
        
    } catch (error) {
        console.error("Gagal ambil data:", error);
        container.innerHTML = '<p style="text-align:center; color:red;">Gagal memuat data. Cek koneksi.</p>';
        if(loadingText) loadingText.innerText = "Error";
    }
}

function renderKatalog(data) {
    const container = document.getElementById('katalog-area');
    const loadingText = document.getElementById('loading-text');
    
    // Hilangkan teks loading di header (jika ada)
    if(loadingText) loadingText.style.display = 'none';

    // 3. BERSIHKAN LOADING SPINNER DULU
    // Sebelum loop, kita kosongin container biar loader-nya ilang
    container.innerHTML = '';

    data.forEach(item => {
        // Format Rupiah
        let hargaFormat = "Hubungi Admin";
        if (item.harga) {
            hargaFormat = "Rp " + new Intl.NumberFormat('id-ID').format(item.harga);
        }

        const linkTujuan = item.link_shopee || '#';

        const htmlCard = `
            <div class="product-card" onclick="window.open('${linkTujuan}', '_blank')">
                <img src="${item.link_gambar}" alt="${item.nama_produk}">
                
                <div class="overlay">
                    <h3>${item.nama_produk}</h3>
                    <p>${hargaFormat}</p>
                    <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">${item.kategori}</p>
                    
                    <a href="${linkTujuan}" target="_blank" class="btn-shopee">
                        SHOP NOW
                    </a>
                </div>
            </div>
        `;
        
        container.innerHTML += htmlCard;
    });
}

// Jalankan fungsi
ambilDataKatalog();