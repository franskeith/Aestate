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
    // 2. NAVBAR VISIBILITY (Hover-based for catalog section)
    // =========================================
    const isTryMagicPage = document.getElementById('magic-studio') !== null;
    const isFullCatalogPage = document.getElementById('full-catalog') !== null;

    // Helper to update body class for CSS toolbar coordination
    function setNavbarVisible(visible) {
        if (visible) {
            document.body.classList.add('is-navbar-visible');
        } else {
            document.body.classList.remove('is-navbar-visible');
        }
    }

    if (isFullCatalogPage) {
        // =========================================
        // HOVER-ONLY NAVBAR for Full Catalog section
        // =========================================
        let hideTimeout;

        // Initially hide navbar after scroll past hero
        function updateNavbarOnScroll() {
            if (window.scrollY > 100) {
                navbar.classList.add('navbar-hidden');
                navbar.classList.add('scrolled');
                setNavbarVisible(false);
            } else {
                navbar.classList.remove('navbar-hidden');
                navbar.classList.remove('scrolled');
                setNavbarVisible(true);
            }
        }

        window.addEventListener('scroll', () => {
            // Only auto-hide based on position, not direction
            // Navbar can still be shown via hover
            if (window.scrollY > 100 && !navbar.matches(':hover')) {
                navbar.classList.add('navbar-hidden');
                setNavbarVisible(false);
            } else if (window.scrollY <= 100) {
                navbar.classList.remove('navbar-hidden');
                navbar.classList.remove('scrolled');
                setNavbarVisible(true);
            }
        });

        // Show on hover (top edge detection)
        document.addEventListener('mousemove', (e) => {
            if (e.clientY <= 60) { // Top 60px of screen
                clearTimeout(hideTimeout);
                navbar.classList.remove('navbar-hidden');
                navbar.classList.add('scrolled');
                setNavbarVisible(true);
            }
        });

        // Hide when mouse leaves navbar area
        navbar.addEventListener('mouseleave', () => {
            if (window.scrollY > 100) {
                hideTimeout = setTimeout(() => {
                    navbar.classList.add('navbar-hidden');
                    setNavbarVisible(false);
                }, 300);
            }
        });

        // Keep visible while hovering navbar
        navbar.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
            navbar.classList.remove('navbar-hidden');
            setNavbarVisible(true);
        });

        // Initial state
        updateNavbarOnScroll();

    } else if (!isTryMagicPage) {
        // =========================================
        // DEFAULT SCROLL-BASED BEHAVIOR (Other pages)
        // =========================================
        let lastScrollY = 0;
        let ticking = false;

        function updateNavbar() {
            const currentScrollY = window.scrollY;

            // Scroll Down (hide navbar)
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                navbar.classList.add('navbar-hidden');
                navbar.classList.add('scrolled');
                setNavbarVisible(false);
            }
            // Scroll Up (show navbar)
            else if (currentScrollY < lastScrollY) {
                navbar.classList.remove('navbar-hidden');
                navbar.classList.add('scrolled');
                setNavbarVisible(true);
            }

            // At top of page
            if (currentScrollY <= 20) {
                navbar.classList.remove('scrolled');
                navbar.classList.remove('navbar-hidden');
                setNavbarVisible(true);
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

        // Initial state
        setNavbarVisible(true);
    }

    // Show navbar on hover when hidden (for non-catalog pages)
    if (!isFullCatalogPage) {
        navbar.addEventListener('mouseenter', () => {
            if (navbar.classList.contains('navbar-hidden')) {
                navbar.classList.remove('navbar-hidden');
                navbar.classList.add('navbar-peek');
                setNavbarVisible(true);
            }
        });

        navbar.addEventListener('mouseleave', () => {
            if (navbar.classList.contains('navbar-peek') && window.scrollY > 100) {
                navbar.classList.add('navbar-hidden');
                navbar.classList.remove('navbar-peek');
                setNavbarVisible(false);
            }
        });
    }

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

    // =========================================
    // 4. MOBILE MENU TOGGLE (Responsive)
    // =========================================
    function initMobileMenu() {
        // Cek apakah tombol menu sudah ada
        let menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');

        // Jika belum ada, buat dynamic (biar tidak perlu edit HTML manual di semua page)
        if (!menuToggle) {
            menuToggle = document.createElement('div');
            menuToggle.className = 'menu-toggle';
            menuToggle.innerHTML = `
                <span></span>
                <span></span>
                <span></span>
            `;
            // Append ke navbar, sebelum nav-links
            navbar.insertBefore(menuToggle, navLinks);
        }

        // Event Listener untuk Toggle
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
            menuToggle.classList.toggle('active');

            // Toggle body scroll agar tidak bisa scroll saat menu terbuka
            if (navLinks.classList.contains('mobile-active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu saat link diklik
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-active');
                menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    initMobileMenu();
});
