// =========================================
// 1. DATA & STATE MANAGEMENT
// =========================================

// --- DATA SHAPE CEWEK ---
const femaleBodyTypes = [
    { id: 'rectangle', label: 'Rectangle', desc: 'Badan rata dari bahu sampai pinggul.', img: '../assets/images/magic/Body/rectangle.png' },
    { id: 'pear', label: 'Pear', desc: 'Pinggul lebih lebar dibanding bahu.', img: '../assets/images/magic/Body/pear.png' },
    { id: 'hourglass', label: 'Hourglass', desc: 'Bahu dan pinggul seimbang.', img: '../assets/images/magic/Body/hourglass.png' },
    { id: 'inverted-triangle', label: 'Inverted Triangle', desc: 'Bahu lebih lebar dari pinggul.', img: '../assets/images/magic/Body/inverted_triangle.png' },
    { id: 'apple', label: 'Apple', desc: 'Berisi di area perut dan dada.', img: '../assets/images/magic/Body/apple.png' }
];

// --- DATA SHAPE COWOK ---
const maleBodyTypes = [
    { id: 'rectangle', label: 'Rectangle (H)', desc: 'Bahu dan pinggang sejajar (Proporsional).', img: '../assets/images/magic/Body/male_rectangle.png' },
    { id: 'inverted-triangle', label: 'V-Shape', desc: 'Bahu lebar, pinggang ramping (Athletic).', img: '../assets/images/magic/Body/male_triangle.png' },
    { id: 'oval', label: 'Oval (O)', desc: 'Bagian tengah tubuh lebih berisi.', img: '../assets/images/magic/Body/male_oval.png' }
];


// Default List: Cewek dulu
let currentBodyList = femaleBodyTypes;

let userState = {
    gender: 'women', // Default Gender
    bodyIndex: 0,
    tone: 'medium',
    face: 'oval',
    height: 'average'
};

// --- URL API ---
// Mengarah ke Google Apps Script (Main.gs)
const API_URL = "https://script.google.com/macros/s/AKfycbxbPkvjyWrnKeiIr9unaPwWLgqrZv7AnWyP4roAgvMgpA6f_e8u6u1FZazoqgSurV0D/exec";
let allProducts = [];

// =========================================
// 2. DOM ELEMENTS (SAFE SELECTOR)
// =========================================
const elements = {
    // Input Section
    bodyLabel: document.getElementById('body-type-label'),
    bodyDesc: document.getElementById('body-desc'),
    bodyImg: document.getElementById('current-body-img'),
    generateBtn: document.getElementById('generate-btn'),

    // Wrapper
    magicStudio: document.getElementById('magic-studio'),
    resultSection: document.getElementById('recommendation-results'),

    // Output Containers
    oneSetContainer: document.querySelector('.look-items'),
    topContainer: document.getElementById('rec-tops-container'),
    bottomContainer: document.getElementById('rec-bottoms-container'),
    accContainer: document.getElementById('rec-acc-container'),
    shoesContainer: document.getElementById('rec-shoes-container'),
    skinAdvice: document.getElementById('skin-advice-text')
};

// =========================================
// 3. INPUT LOGIC (GENDER & SLIDER)
// =========================================

// --- LOGIC GANTI GENDER ---
function switchGender(gender) {
    userState.gender = gender;
    userState.bodyIndex = 0; // Reset ke gambar pertama

    // 1. Tukar Data List Body
    if (gender === 'men') {
        currentBodyList = maleBodyTypes;
    } else {
        currentBodyList = femaleBodyTypes;
    }

    // 2. Update Visual Tombol Gender (Highlight)
    const btns = document.querySelectorAll('.btn-gender');
    btns.forEach(btn => {
        if (btn.innerText.toLowerCase().includes(gender)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 3. Refresh Tampilan Slider Body
    updateBodyUI();
}

// --- LOGIC SLIDER GERAK ---
function changeBody(direction) {
    userState.bodyIndex += direction;

    // Looping Logic
    if (userState.bodyIndex < 0) userState.bodyIndex = currentBodyList.length - 1;
    if (userState.bodyIndex >= currentBodyList.length) userState.bodyIndex = 0;

    updateBodyUI();
}

// Helper: Update UI Slider (Gambar & Teks)
function updateBodyUI() {
    if (!elements.bodyImg) return;

    // Animasi Fade Out
    elements.bodyImg.style.opacity = '0';
    elements.bodyDesc.style.opacity = '0';
    elements.bodyLabel.style.opacity = '0';

    setTimeout(() => {
        const newData = currentBodyList[userState.bodyIndex];

        elements.bodyLabel.innerText = newData.label;
        elements.bodyDesc.innerText = newData.desc;
        elements.bodyImg.src = newData.img;

        // Animasi Fade In
        elements.bodyImg.style.opacity = '1';
        elements.bodyDesc.style.opacity = '1';
        elements.bodyLabel.style.opacity = '1';
    }, 300);
}

// --- LOGIC SELECTION LAINNYA ---
function updateSelectionUI(element, groupClass) {
    const siblings = element.parentElement.children;
    for (let sib of siblings) sib.classList.remove('selected');
    element.classList.add('selected');
}

function selectTone(el) {
    userState.tone = el.getAttribute('data-value');

    // Remove 'selected' dari semua tone-circle
    const allToneCircles = document.querySelectorAll('.tone-circle');
    allToneCircles.forEach(circle => circle.classList.remove('selected'));

    // Add 'selected' ke yang dipilih
    el.classList.add('selected');
}

function selectFace(el) {
    userState.face = el.getAttribute('data-value');
    updateSelectionUI(el, 'face-options');
}

function selectHeight(el) {
    userState.height = el.getAttribute('data-value');
    updateSelectionUI(el, 'height-options');
}

// =========================================
// 4. DATA FETCHING (UPDATED FOR ROUTING)
// =========================================

async function fetchProducts() {
    // Clear cache biar data baru masuk
    localStorage.removeItem('product_data');

    try {
        if (elements.generateBtn) elements.generateBtn.innerText = "Connecting to Database...";

        // 🔥 UPDATE PENTING: Pake parameter ?action=get_all_products
        // Biar backend tau kita minta SEMUA data (MagicService)
        const response = await fetch(API_URL + "?action=get_all_products");
        const data = await response.json();

        // Cek Validitas Data
        if (data.status === 'error' || !Array.isArray(data)) {
            console.error("DATA ERROR:", data);
            alert("Gagal memuat data produk. Cek Console.");
            allProducts = [];
            return;
        }

        allProducts = data;
        localStorage.setItem('product_data', JSON.stringify(data));

        if (elements.generateBtn) elements.generateBtn.innerText = "CLICK TO GENERATE YOUR STYLE";
        console.log(`✅ Berhasil load ${allProducts.length} produk!`);

    } catch (error) {
        console.error('❌ FETCH ERROR:', error);
        alert('Gagal ambil data. Cek koneksi internet.');
    }
}

// =========================================
// 5. RECOMMENDATION ENGINE (SMART FILTER)
// =========================================

if (elements.generateBtn) {
    elements.generateBtn.addEventListener('click', () => {
        // Cek data produk
        if (!allProducts || allProducts.length === 0) {
            alert("Data produk belum masuk. Coba refresh halaman.");
            fetchProducts();
            return;
        }

        // 1. SIAPKAN SEMUA PARAMETER TAG
        const currentBody = currentBodyList[userState.bodyIndex].id;
        const bodyTag = `${currentBody}-body`;
        const genderTag = userState.gender;
        const currentFace = userState.face;
        const faceTag = `${currentFace}-face`;

        // --- LOGIC HEIGHT MAPPING ---
        let heightTag = 'average-height';

        if (userState.height === 'tall' || userState.height === 'very_tall') {
            heightTag = 'tall-height';
        } else if (userState.height === 'mini') {
            heightTag = 'short-height';
        } else {
            heightTag = 'average-height';
        }

        // Logic Tone (4 Distinct Mappings)
        let toneTag = 'neutral-tone';

        if (userState.tone === 'light') {
            toneTag = 'cool-tone';
        } else if (userState.tone === 'medium') {
            toneTag = 'neutral-tone';
        } else if (userState.tone === 'tan') {
            toneTag = 'warm-tone';
        } else if (userState.tone === 'deep') {
            toneTag = 'deep-tone';
        }

        console.log(`🔎 Filter: Gender=${genderTag} | Body=${bodyTag} | Height=${heightTag} | Face=${faceTag}`);

        // 2. FILTERING ENGINE
        const recs = {
            tops: filterProducts('Top', toneTag, bodyTag, genderTag),
            bottoms: filterProducts('Bottom', 'neutral-tone', bodyTag, genderTag),
            outers: filterProducts('Outer', toneTag, 'all', genderTag),

            // Aksesoris pake Face Tag
            accs: filterProducts('Accessories', toneTag, faceTag, genderTag),

            // Set pake Body Tag
            sets: filterProducts('Set', toneTag, bodyTag, genderTag),

            // Sepatu pake Height Tag
            shoes: filterProducts('Shoes', toneTag, heightTag, genderTag)
        };

        console.log("Filtered Results:", recs);

        // 3. Update Visual Teks
        const currentBodyLabel = currentBodyList[userState.bodyIndex].label;
        const tagElement = document.querySelector('.look-tag span');
        if (tagElement) {
            tagElement.innerText = `✨ Best Match for ${currentBodyLabel}`;
        }

        // 4. Initialize Set Image Slider
        initializeSetSlider(recs.sets);

        // 5. RENDER KE HTML
        renderOneSet(recs.sets, recs.accs);
        renderGrid(elements.topContainer, recs.tops.concat(recs.outers));
        renderGrid(elements.bottomContainer, recs.bottoms);
        renderGrid(elements.accContainer, recs.accs);
        renderGrid(elements.shoesContainer, recs.shoes);

        // 6. Attach click handlers untuk preview image
        attachSetClickHandlers(recs.sets);

        if (elements.skinAdvice) {
            elements.skinAdvice.innerText = `Tone "${userState.tone}" cocok dengan warna ${toneTag.replace('-tone', '')}. Untuk tinggi "${userState.height}", kami pilihkan sepatu yang proporsional!`;
        }

        // 5. Scroll Effect
        elements.resultSection.style.display = 'block';
        slowScrollTo(elements.resultSection, 1500);
    });
}

// --- LOGIC FILTER UTAMA (WITH PRIORITY SCORING) ---
function filterProducts(category, toneTag, shapeTag, genderTag) {
    if (!Array.isArray(allProducts)) return [];

    // 1. Filter produk yang match
    const matched = allProducts.filter(p => {
        const tags = p.tags ? String(p.tags).toLowerCase() : "";
        const prodCat = p.category ? String(p.category).trim() : "";

        // 1. Cek Kategori
        if (prodCat !== category) return false;

        // 2. Cek Gender (STRICT MODE)
        let isGenderMatch = false;
        if (genderTag === 'men') {
            isGenderMatch = tags.includes('men') || tags.includes('unisex');
        } else {
            const isExplicitMen = tags.includes('men');
            isGenderMatch = tags.includes('women') || tags.includes('unisex') || !isExplicitMen;
        }

        // 3. Cek Tone
        const isToneMatch = tags.includes(toneTag) || tags.includes('neutral-tone') || tags.includes('all-tone');

        // 4. Cek Shape (Bisa Body / Face / Height)
        const isShapeMatch = shapeTag === 'all' ||
            tags.includes(shapeTag) ||
            tags.includes('all-body') ||
            tags.includes('all-face') ||
            tags.includes('all-height') ||
            tags.includes('all-shape');

        return isGenderMatch && isToneMatch && isShapeMatch;
    });

    // 2. Beri scoring berdasarkan spesifisitas tag (exact match > universal tag)
    const scored = matched.map(p => {
        const tags = p.tags ? String(p.tags).toLowerCase() : "";
        let score = 0;

        // +10 jika exact tone match (bukan all-tone atau neutral-tone fallback)
        if (tags.includes(toneTag)) score += 10;

        // +10 jika exact shape match (bukan all-body/all-face/all-height)
        if (tags.includes(shapeTag)) score += 10;

        // -5 untuk setiap universal tag (penalize generic products)
        if (tags.includes('all-tone')) score -= 5;
        if (tags.includes('all-body')) score -= 5;
        if (tags.includes('all-face')) score -= 5;
        if (tags.includes('all-height')) score -= 5;
        if (tags.includes('all-shape')) score -= 5;

        return { product: p, score: score };
    });

    // 3. Sort berdasarkan score (highest first)
    scored.sort((a, b) => b.score - a.score);

    // 4. Return produk aja (tanpa score)
    return scored.map(item => item.product);
}

// =========================================
// 6. SET IMAGE SLIDER
// =========================================

let currentSetIndex = 0;
let availableSets = [];

function initializeSetSlider(sets) {
    availableSets = sets;
    currentSetIndex = 0;

    const mainImage = document.getElementById('set-main-image');
    const prevBtn = document.getElementById('set-prev-btn');
    const nextBtn = document.getElementById('set-next-btn');
    const counter = document.getElementById('set-counter');

    // Jika tidak ada set, hide semua controls
    if (!sets || sets.length === 0) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (counter) counter.style.display = 'none';
        return;
    }

    // Set initial image
    if (mainImage) {
        mainImage.src = sets[0].image;
        mainImage.alt = sets[0].name;
    }

    // Show/hide controls based on available sets
    if (sets.length > 1) {
        if (prevBtn) prevBtn.style.display = 'flex';
        if (nextBtn) nextBtn.style.display = 'flex';
        if (counter) {
            counter.style.display = 'block';
            counter.querySelector('span').innerText = `1 / ${sets.length}`;
        }

        // Add event listeners
        prevBtn.onclick = () => navigateSetSlider(-1);
        nextBtn.onclick = () => navigateSetSlider(1);
    } else {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (counter) counter.style.display = 'none';
    }
}

function navigateSetSlider(direction) {
    if (availableSets.length === 0) return;

    // Update index with looping
    currentSetIndex += direction;
    if (currentSetIndex < 0) currentSetIndex = availableSets.length - 1;
    if (currentSetIndex >= availableSets.length) currentSetIndex = 0;

    // Update image with fade effect
    const mainImage = document.getElementById('set-main-image');
    if (mainImage) {
        mainImage.style.opacity = '0';

        setTimeout(() => {
            mainImage.src = availableSets[currentSetIndex].image;
            mainImage.alt = availableSets[currentSetIndex].name;
            mainImage.style.opacity = '1';
        }, 200);
    }

    // Update counter
    const counter = document.getElementById('set-counter');
    if (counter) {
        counter.querySelector('span').innerText = `${currentSetIndex + 1} / ${availableSets.length}`;
    }
}

// =========================================
// 7. RENDER FUNCTIONS
// =========================================

// --- HELPER: Shuffle Array (Fisher-Yates Algorithm) ---
function shuffleArray(array) {
    const shuffled = [...array]; // Copy array
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function renderOneSet(sets, accs) {
    if (!elements.oneSetContainer) return;
    elements.oneSetContainer.innerHTML = `<h3>The Breakdown</h3>`;

    // Jika tidak ada Set, tampilkan pesan
    if (sets.length === 0) {
        elements.oneSetContainer.innerHTML += `<p style="color:#888; font-size:0.9rem; padding:10px;">Belum ada Set yang pas untuk kombinasi ini :(</p>`;
        return;
    }

    // 1. Gunakan urutan dari filter (sudah sorted by priority)
    // TIDAK pakai shuffle agar best match tetap di atas

    // 2. Ambil 3-4 set pertama (atau semua jika kurang dari 4)
    const initialDisplay = 4;
    const displayedSets = sets.slice(0, initialDisplay);
    const remainingSets = sets.slice(initialDisplay);

    // 3. Render displayed sets
    displayedSets.forEach((set, index) => {
        const escapedProduct = JSON.stringify(set).replace(/"/g, '&quot;');
        const setHtml = `
            <div class="item-row" data-set-index="${index}" style="animation-delay: ${index * 0.1}s">
                <img src="${set.image}" alt="${set.name}" onerror="this.onerror=null; this.src='https://via.placeholder.com/100'">
                <div class="item-info">
                    <h4>${set.name}</h4>
                    <p>${index === 0 ? 'Best Match Look' : 'Alternative Look'}</p>
                    <span class="price">Rp ${formatPrice(set.price)}</span>
                </div>
                <button onclick='openProductPopup(${escapedProduct})' class="btn-shop">Lihat</button>
            </div>
        `;
        elements.oneSetContainer.innerHTML += setHtml;
    });

    // 4. Tambahkan container untuk hidden sets
    if (remainingSets.length > 0) {
        const hiddenContainer = `<div id="hidden-sets-container" style="display:none;"></div>`;
        elements.oneSetContainer.innerHTML += hiddenContainer;

        // Render hidden sets
        const hiddenSetsContainer = document.getElementById('hidden-sets-container');
        remainingSets.forEach((set, index) => {
            const escapedProduct = JSON.stringify(set).replace(/"/g, '&quot;');
            const setHtml = `
                <div class="item-row" style="animation-delay: ${(index + 4) * 0.1}s">
                    <img src="${set.image}" alt="${set.name}" onerror="this.onerror=null; this.src='https://via.placeholder.com/100'">
                    <div class="item-info">
                        <h4>${set.name}</h4>
                        <p>Alternative Look</p>
                        <span class="price">Rp ${formatPrice(set.price)}</span>
                    </div>
                    <button onclick='openProductPopup(${escapedProduct})' class="btn-shop">Lihat</button>
                </div>
            `;
            hiddenSetsContainer.innerHTML += setHtml;
        });

        // 5. Tambahkan tombol "Show More"
        const showMoreBtn = `
            <button id="show-more-sets-btn" style="
                width: 100%;
                padding: 15px;
                margin-top: 15px;
                background: linear-gradient(135deg, #FFAF02 0%, #FF8C00 100%);
                color: white;
                border: none;
                border-radius: 12px;
                font-family: 'Inter', sans-serif;
                font-weight: 600;
                font-size: 0.95rem;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(255, 175, 2, 0.3);
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(255, 175, 2, 0.4)';" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(255, 175, 2, 0.3)';">
                Tampilkan ${remainingSets.length} Pilihan Set Lainnya ▼
            </button>
        `;
        elements.oneSetContainer.innerHTML += showMoreBtn;

        // 6. Event listener untuk toggle
        setTimeout(() => {
            const btn = document.getElementById('show-more-sets-btn');
            const hiddenContainer = document.getElementById('hidden-sets-container');

            if (btn && hiddenContainer) {
                btn.addEventListener('click', function () {
                    if (hiddenContainer.style.display === 'none') {
                        hiddenContainer.style.display = 'block';
                        btn.innerHTML = 'Sembunyikan Pilihan Lainnya ▲';
                    } else {
                        hiddenContainer.style.display = 'none';
                        btn.innerHTML = `Tampilkan ${remainingSets.length} Pilihan Set Lainnya ▼`;
                    }
                });
            }
        }, 100);
    }

    // 7. Render main accessory (tetap hanya 1)
    const mainAcc = accs.length > 0 ? accs[0] : null;
    if (mainAcc) {
        const accHtml = `
            <div class="item-row" style="border-top: 2px dashed #E6C4A8; margin-top: 20px; padding-top: 20px; animation-delay: ${(displayedSets.length + (remainingSets.length > 0 ? remainingSets.length : 0)) * 0.1 + 0.2}s">
                <img src="${mainAcc.image}" alt="${mainAcc.name}" onerror="this.onerror=null; this.src='https://via.placeholder.com/100'">
                <div class="item-info">
                    <h4>${mainAcc.name}</h4>
                    <p>Accessories</p>
                    <span class="price">Rp ${formatPrice(mainAcc.price)}</span>
                </div>
                <a href="${mainAcc.shop_link}" target="_blank" class="btn-shop">Lihat</a>
            </div>
        `;
        elements.oneSetContainer.innerHTML += accHtml;
    }
}

// --- CLICK TO PREVIEW: Update main image saat klik item ---
function attachSetClickHandlers(sets) {
    // Delay sedikit untuk memastikan DOM sudah rendered
    setTimeout(() => {
        const itemRows = document.querySelectorAll('.item-row');

        itemRows.forEach((row, index) => {
            // Skip accessories (yang tidak punya data-set-index atau image dari sets)
            const setIndex = row.getAttribute('data-set-index');
            if (setIndex === null) return;

            const actualIndex = parseInt(setIndex);
            const clickedSet = sets[actualIndex];

            if (!clickedSet) return;

            // Add click handler
            row.style.cursor = 'pointer';
            row.addEventListener('click', function (e) {
                // Prevent jika klik button "Lihat"
                if (e.target.classList.contains('btn-shop')) return;

                // Update main image
                const mainImage = document.getElementById('set-main-image');
                if (mainImage) {
                    mainImage.style.opacity = '0';

                    setTimeout(() => {
                        mainImage.src = clickedSet.image;
                        mainImage.alt = clickedSet.name;
                        mainImage.style.opacity = '1';
                    }, 200);
                }

                // Visual feedback: highlight selected item
                itemRows.forEach(r => r.classList.remove('active-preview'));
                row.classList.add('active-preview');
            });
        });

        // Set first item as active by default
        if (itemRows.length > 0) {
            itemRows[0].classList.add('active-preview');
        }
    }, 150);
}


function renderGrid(container, products) {
    if (!container) return;
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 20px; color: #888;">Stok habis untuk kategori ini :(</p>';
        return;
    }

    const displayProducts = products.slice(0, 4);
    displayProducts.forEach(p => {
        const escapedProduct = JSON.stringify(p).replace(/"/g, '&quot;');
        const cardHTML = `
            <div class="product-card-simple" onclick='openProductPopup(${escapedProduct})'>
                <div class="img-wrapper">
                    <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null; this.src='https://via.placeholder.com/300'">
                </div>
                <div class="card-details">
                    <h4>${p.name}</h4>
                    <p class="category">${p.category}</p>
                    <div class="card-footer">
                        <span class="price">Rp ${formatPrice(p.price)}</span>
                        <button class="btn-arrow">→</button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

function formatPrice(num) {
    if (!num) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// =========================================
// 7. INITIALIZATION & HELPERS
// =========================================

window.addEventListener('DOMContentLoaded', () => {
    // Clear cache biar data baru masuk
    localStorage.removeItem('product_data');

    // Set UI Awal
    const current = currentBodyList[userState.bodyIndex];
    if (elements.bodyLabel) elements.bodyLabel.innerText = current.label;
    if (elements.bodyDesc) elements.bodyDesc.innerText = current.desc;

    fetchProducts();
});

// Cinematic Scroll Helper
function slowScrollTo(target, duration) {
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition - 80;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// =========================================
// 9. NAVBAR AUTO-HIDE (TRY MAGIC PAGE)
// =========================================

// Auto-hide navbar: muncul ketika mouse di POJOK KANAN ATAS saja
document.addEventListener('mousemove', function (e) {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const windowWidth = window.innerWidth;

    // Hanya trigger jika mouse di pojok kanan atas
    // Area: 200px dari kanan, 100px dari atas
    const isInRightCorner = e.clientX > (windowWidth - 200) && e.clientY < 100;

    if (isInRightCorner) {
        document.body.classList.add('navbar-visible');
    } else {
        // Jika mouse keluar dari area navbar, hide
        const navbarRect = navbar.getBoundingClientRect();
        const isHoveringNavbar = e.clientY < navbarRect.bottom;

        if (!isHoveringNavbar) {
            document.body.classList.remove('navbar-visible');
        }
    }
});

// Navbar hint juga bisa diklik untuk toggle navbar
const navbarHint = document.getElementById('navbar-hint');
if (navbarHint) {
    navbarHint.addEventListener('click', function () {
        document.body.classList.add('navbar-visible');
    });
}

// =========================================
// MORPHING NAVBAR ANIMATION (Page Load)
// =========================================
// Trigger animasi saat page baru dimuat
window.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');

    // Delay 500ms biar user sempat lihat navbar dulu
    setTimeout(() => {
        document.body.classList.add('navbar-morph');
    }, 500);

    // After animation ends (4.0s total: 0.5s delay + 3.5s duration)
    // Reset navbar to "hidden but full-size" state (Option B)
    setTimeout(() => {
        // Remove morph animation class
        document.body.classList.remove('navbar-morph');

        // Reset all inline styles from animation
        navbar.style.cssText = '';

        // Add post-morph hidden state
        navbar.classList.add('navbar-post-morph');
        navbar.classList.add('navbar-hidden'); // Start hidden!

        // Show orange indicator since navbar is now hidden
        const indicator = document.getElementById('navbar-indicator');
        if (indicator) {
            indicator.classList.add('indicator-visible');
        }

        // Enable hover detection only (no scroll behavior for Try Magic)
        navbarHoverEnabled = true;
        // scrollDetectionEnabled = true; // DISABLED: Only hover on Try Magic page
    }, 4200);
});

// =========================================
// NAVBAR HOVER DETECTION (Post-Morph)
// =========================================
let navbarHoverEnabled = false;
let navbarVisible = false;
let hideTimeout;

// Show navbar when mouse enters top edge area (top 60px)
document.addEventListener('mousemove', (e) => {
    if (!navbarHoverEnabled) return;

    const navbar = document.getElementById('navbar');
    const indicator = document.getElementById('navbar-indicator');
    if (!navbar) return;

    // Get navbar bounding rect to check if mouse is inside
    const navbarRect = navbar.getBoundingClientRect();
    const isMouseOverNavbar = navbarVisible &&
        e.clientX >= navbarRect.left &&
        e.clientX <= navbarRect.right &&
        e.clientY >= navbarRect.top &&
        e.clientY <= navbarRect.bottom;

    // Mouse in top edge zone (0-20px) OR mouse is over the navbar itself
    if (e.clientY <= 20 || isMouseOverNavbar) {
        // Clear any pending hide
        clearTimeout(hideTimeout);

        // Show navbar, hide indicator
        if (!navbarVisible) {
            navbar.classList.remove('navbar-hidden');
            navbar.classList.add('navbar-visible');
            if (indicator) indicator.classList.remove('indicator-visible');
            navbarVisible = true;
        }
    } else {
        // Mouse left both zones, delay hide
        if (navbarVisible) {
            hideTimeout = setTimeout(() => {
                navbar.classList.remove('navbar-visible');
                navbar.classList.add('navbar-hidden');
                if (indicator) indicator.classList.add('indicator-visible');
                navbarVisible = false;
            }, 300); // 300ms delay before hiding
        }
    }
});

// =========================================
// SCROLL BEHAVIOR (Post-Morph)
// =========================================
let lastScrollY = 0;
let ticking = false;
let scrollDetectionEnabled = false;

function updateNavbar() {
    if (!scrollDetectionEnabled) return;

    const navbar = document.getElementById('navbar');
    const indicator = document.getElementById('navbar-indicator');
    if (!navbar) return;

    const currentScrollY = window.scrollY;

    // Scroll Up → Show navbar, hide indicator
    if (currentScrollY < lastScrollY) {
        navbar.classList.remove('navbar-hidden');
        navbar.classList.add('navbar-visible');
        if (indicator) indicator.classList.remove('indicator-visible');
        navbarVisible = true;

        // Auto-hide after 2s if user stops scrolling
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            if (currentScrollY > 100) {
                navbar.classList.remove('navbar-visible');
                navbar.classList.add('navbar-hidden');
                if (indicator) indicator.classList.add('indicator-visible');
                navbarVisible = false;
            }
        }, 2000);
    }
    // Scroll Down → Hide navbar, show indicator
    else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        clearTimeout(hideTimeout);
        navbar.classList.remove('navbar-visible');
        navbar.classList.add('navbar-hidden');
        if (indicator) indicator.classList.add('indicator-visible');
        navbarVisible = false;
    }

    // At top of page → Always show navbar, hide indicator
    if (currentScrollY <= 20) {
        navbar.classList.remove('navbar-hidden');
        navbar.classList.add('navbar-visible');
        if (indicator) indicator.classList.remove('indicator-visible');
        navbarVisible = true;
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

