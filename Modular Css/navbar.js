document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('nav');
    
    // Logic Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) { // Lebih sensitif (20px aja udah berubah)
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Optional: Highlight Menu Otomatis
    // Biar navbar tau dia lagi di halaman mana dan nambahin class 'active' sendiri
    const currentPath = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        // Hapus active lama
        link.classList.remove('active'); 
        
        // Ambil href dari link (misal: index.html)
        const href = link.getAttribute('href');
        
        // Cek kecocokan
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
});