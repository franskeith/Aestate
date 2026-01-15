document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('nav');

    // =========================================
    // 1. DEFAULT BACKGROUND (Konsisten di semua page)
    // =========================================
    // Beri background default agar navbar konsisten
    if (!navbar.classList.contains('scrolled')) {
        navbar.style.background = 'rgba(255, 246, 233, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
        navbar.style.webkitBackdropFilter = 'blur(10px)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    }

    // =========================================
    // 2. SCROLL EFFECT (Glassmorphism)
    // =========================================
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
            // Kembalikan ke background default
            navbar.style.background = 'rgba(255, 246, 233, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
            navbar.style.webkitBackdropFilter = 'blur(10px)';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        }
    });

    // =========================================
    // 3. ACTIVE LINK HIGHLIGHT (FIXED)
    // =========================================
    function setActiveLink() {
        // Ambil full path dari URL
        let currentPath = window.location.pathname;

        // Normalize path untuk index.html
        if (currentPath.endsWith('/') || currentPath === '') {
            currentPath = '/index.html';
        }

        const navLinks = document.querySelectorAll('.nav-links a');

        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');

            // Hapus kelas active dari semua link
            link.classList.remove('active');

            // Logic matching yang lebih robust
            // Cek apakah href cocok dengan current path
            if (currentPath.includes(linkHref) ||
                (linkHref === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('index.html'))) ||
                (linkHref.startsWith('pages/') && currentPath.includes(linkHref.replace('pages/', ''))) ||
                (linkHref.startsWith('../index.html') && (currentPath.endsWith('/') || currentPath.endsWith('index.html')))) {
                link.classList.add('active');
            }
        });
    }

    // Jalankan fungsi saat halaman dimuat
    setActiveLink();
});
