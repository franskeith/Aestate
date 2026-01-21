// =========================================
// SCROLL ANIMATIONS - Intersection Observer
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    // Configuration for Intersection Observer
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px 0px -50px 0px', // Trigger earlier - 50px before bottom of viewport
        threshold: 0.05 // Trigger when just 5% of element is visible
    };

    // Callback function when element intersects
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the visible class to trigger animation
                entry.target.classList.add('scroll-visible');

                // Stop observing this element (one-time animation)
                observer.unobserve(entry.target);
            }
        });
    };

    // Create the observer
    const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all elements with data-scroll attribute
    const animatedElements = document.querySelectorAll('[data-scroll]');

    animatedElements.forEach(element => {
        scrollObserver.observe(element);
    });

    // Log for debugging
    console.log(`Scroll animations initialized for ${animatedElements.length} elements`);
});
