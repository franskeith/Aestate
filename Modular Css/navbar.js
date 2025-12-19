document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('nav');
    
    // =========================================
    // 1. SCROLL EFFECT (Glassmorphism)
    // =========================================
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) { 
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // =========================================
    // 2. ACTIVE LINK HIGHLIGHT (DETEKTIF URL)
    // =========================================
    function setActiveLink() {
        // Ambil nama file dari URL sekarang (misal: 'try-magic.html')
        // Kalau kosong (root), kita anggap 'index.html'
        let currentPath = window.location.pathname.split("/").pop();
        if (currentPath === '') currentPath = 'index.html';

        const navLinks = document.querySelectorAll('.nav-links a');

        navLinks.forEach(link => {
            // Ambil tujuan link (misal: href="try-magic.html")
            const linkHref = link.getAttribute('href');

            // Hapus kelas active dari semua link dulu biar bersih
            link.classList.remove('active');

            // Cek Kesamaan
            // Jika nama file di browser SAMA dengan tujuan link -> AKTIFKAN
            if (currentPath === linkHref) {
                link.classList.add('active');
            }
        });
    }

    // Jalankan fungsi saat halaman dimuat
    setActiveLink();
});