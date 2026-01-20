// ============================================
// PRODUCT DETAIL POP-UP - UNIVERSAL COMPONENT
// ============================================

// Dummy fallback content
const DUMMY_CONTENT = {
    description: "Outfit yang baik akan menampilkan kepercayaan diri yang baik. Pilihan fashion yang tepat dapat menonjolkan kelebihan bentuk tubuhmu dan memberikan kesan yang lebih proporsional. Setiap detail dari pakaian ini dirancang untuk memberikan keseimbangan visual yang sempurna.",
    material: "Premium quality fabric",
    size_notes: "Ukuran tersedia sesuai ketersediaan di toko"
};

// Store scroll position
let savedScrollPosition = 0;

/**
 * Open product detail pop-up
 * @param {Object} product - Product data object
 * @param {Event} [event] - Optional click event to prevent default behavior
 */
function openProductPopup(product, event) {
    // Prevent default behavior (e.g., anchor scroll to top)
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (!product) return;

    const popup = document.getElementById('product-popup');
    if (!popup) {
        console.error('Product popup element not found');
        return;
    }

    // Prevent body scroll using class
    savedScrollPosition = window.scrollY; // Save current scroll
    document.body.classList.add('no-scroll');
    document.body.style.top = `-${savedScrollPosition}px`; // Optional: for fixed body technique if needed


    // Populate image
    const image = document.getElementById('popup-product-image');
    if (image) {
        image.src = product.image || 'https://via.placeholder.com/500x600?text=No+Image';
        image.alt = product.name || 'Product';
        // Prevent infinite loop if placeholder fails
        image.onerror = function () {
            this.onerror = null; // Prevent infinite loop
            this.src = 'https://via.placeholder.com/500x600?text=No+Image';
        };
    }

    // Populate category
    const category = popup.querySelector('.popup-category');
    if (category) {
        category.textContent = product.category || 'Product';
    }

    // Populate title
    const title = popup.querySelector('.popup-title');
    if (title) {
        title.textContent = product.name || 'Unnamed Product';
    }

    // Populate price
    const price = popup.querySelector('.popup-price');
    if (price) {
        price.textContent = product.price ? `Rp ${formatPrice(product.price)}` : 'Price not available';
    }

    // Populate description (with fallback)
    const description = popup.querySelector('.popup-description');
    if (description) {
        description.textContent = product.description || DUMMY_CONTENT.description;
    }

    // Populate tags (parse and display)
    const tagList = popup.querySelector('.tag-list');
    if (tagList) {
        tagList.innerHTML = ''; // Clear previous tags
        const tags = parseTags(product.tags);

        if (tags.length > 0) {
            tags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'tag-item';
                tagEl.textContent = tag;
                tagList.appendChild(tagEl);
            });
        } else {
            tagList.innerHTML = '<span class="tag-item">Universal</span>';
        }
    }

    // Populate size notes
    const sizeEl = popup.querySelector('.popup-size');
    if (sizeEl) {
        sizeEl.textContent = product.size_notes || DUMMY_CONTENT.size_notes;
    }

    // Populate material
    const materialEl = popup.querySelector('.popup-material');
    if (materialEl) {
        materialEl.textContent = product.material || DUMMY_CONTENT.material;
    }

    // Set shop link
    const shopLink = document.getElementById('popup-shop-link');
    if (shopLink) {
        shopLink.href = product.shop_link || '#';
    }

    // Show popup
    popup.classList.add('active');
}

/**
 * Close product detail pop-up
 */
function closeProductPopup() {
    const popup = document.getElementById('product-popup');
    if (!popup) return;

    // Remove active class
    popup.classList.remove('active');

    // Restore body scroll
    document.body.classList.remove('no-scroll');
    document.body.style.top = '';

    // Restore scroll position immediately
    window.scrollTo(0, savedScrollPosition);

}

/**
 * Parse tags from product.tags string
 * Extract tone and body type tags for display
 * @param {string} tagsString - Comma-separated tags
 * @returns {Array} - Array of readable tag names
 */
function parseTags(tagsString) {
    if (!tagsString) return [];

    const tags = tagsString.toLowerCase().split(',').map(t => t.trim());
    const displayTags = [];

    // Tone tags
    if (tags.includes('cool-tone')) displayTags.push('Cool Tone');
    else if (tags.includes('warm-tone')) displayTags.push('Warm Tone');
    else if (tags.includes('neutral-tone')) displayTags.push('Neutral Tone');
    else if (tags.includes('deep-tone')) displayTags.push('Deep Tone');

    // Body type tags
    if (tags.includes('rectangle-body')) displayTags.push('Rectangle');
    else if (tags.includes('pear-body')) displayTags.push('Pear');
    else if (tags.includes('hourglass-body')) displayTags.push('Hourglass');
    else if (tags.includes('inverted-triangle-body')) displayTags.push('Inverted Triangle');
    else if (tags.includes('apple-body')) displayTags.push('Apple');
    else if (tags.includes('oval-body')) displayTags.push('Oval');

    // Face shape tags
    if (tags.includes('oval-face')) displayTags.push('Oval Face');
    else if (tags.includes('round-face')) displayTags.push('Round Face');
    else if (tags.includes('square-face')) displayTags.push('Square Face');
    else if (tags.includes('heart-face')) displayTags.push('Heart Face');

    // Universal tags
    if (tags.includes('all-tone') || tags.includes('all-body') || tags.includes('all-shape')) {
        if (displayTags.length === 0) displayTags.push('Universal Fit');
    }

    return displayTags;
}

/**
 * Format price to Indonesian format (X.XXX)
 * @param {number} price 
 * @returns {string}
 */
function formatPrice(price) {
    if (typeof price === 'number') {
        return price.toLocaleString('id-ID');
    }
    return String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    const popup = document.getElementById('product-popup');
    if (!popup) return;

    // Close button
    const closeBtn = popup.querySelector('.popup-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            closeProductPopup();
        });
    }

    // Click overlay to close
    popup.addEventListener('click', function (e) {
        if (e.target === popup) {
            e.preventDefault();
            e.stopPropagation();
            closeProductPopup();
        }
    });

    // ESC key to close
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && popup.classList.contains('active')) {
            e.preventDefault();
            closeProductPopup();
        }
    });

    // Prevent Visit Store link from scrolling when href="#"
    const shopLink = document.getElementById('popup-shop-link');
    if (shopLink) {
        shopLink.addEventListener('click', function (e) {
            if (this.href.endsWith('#') || this.href === '#') {
                e.preventDefault();
            }
        });
    }

    // Global: Prevent scroll for any .btn-shop anchor links with href="#"
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a.btn-shop');
        if (link) {
            const href = link.getAttribute('href');
            if (!href || href === '#' || href === 'javascript:void(0)') {
                e.preventDefault();
            }
        }
    });
});
