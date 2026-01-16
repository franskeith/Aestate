document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('nav');

    // =========================================
    // 1. DEFAULT BACKGROUND (Konsisten di semua page)
    // =========================================
    // REMOVED: Inline styles conflict with navbar.css glassmorphism
    // Let CSS handle all styling to avoid flash/jump

    // if (!navbar.classList.contains('scrolled')) {
    //     navbar.style.background = 'rgba(255, 246, 233, 0.95)';
    //     navbar.style.backdropFilter = 'blur(10px)';
    //     navbar.style.webkitBackdropFilter = 'blur(10px)';
    //     navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    // }

    // =========================================
    // 2. AUTO-HIDE NAVBAR (Scroll Direction Detection)
    // Skip on Try Magic page (has its own hover-based behavior)
    // =========================================
    const isTryMagicPage = document.getElementById('magic-studio') !== null;

    if (!isTryMagicPage) {
        let lastScrollY = 0;
        let ticking = false;

        function updateNavbar() {
            const currentScrollY = window.scrollY;

            // Scroll Down (hide navbar)
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                navbar.classList.add('navbar-hidden');
                navbar.classList.add('scrolled');
            }
            // Scroll Up (show navbar)
            else if (currentScrollY < lastScrollY) {
                navbar.classList.remove('navbar-hidden');
                navbar.classList.add('scrolled');
            }

            // At top of page
            if (currentScrollY <= 20) {
                navbar.classList.remove('scrolled');
                navbar.classList.remove('navbar-hidden');
            }

            lastScrollY = currentScrollY;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        });
    }

    // Show navbar on hover when hidden
    navbar.addEventListener('mouseenter', () => {
        if (navbar.classList.contains('navbar-hidden')) {
            navbar.classList.remove('navbar-hidden');
            navbar.classList.add('navbar-peek');
        }
    });

    navbar.addEventListener('mouseleave', () => {
        if (navbar.classList.contains('navbar-peek') && window.scrollY > 100) {
            navbar.classList.add('navbar-hidden');
            navbar.classList.remove('navbar-peek');
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
