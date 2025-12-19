// =========================================
// 1. DATA & STATE MANAGEMENT
// =========================================

// --- DATA SHAPE CEWEK ---
const femaleBodyTypes = [
    { id: 'rectangle', label: 'Rectangle', desc: 'Badan rata dari bahu sampai pinggul.', img: 'assets/TryMagicPage/Body/rectangle.png' },
    { id: 'pear', label: 'Pear', desc: 'Pinggul lebih lebar dibanding bahu.', img: 'assets/TryMagicPage/Body/pear.png' },
    { id: 'hourglass', label: 'Hourglass', desc: 'Bahu dan pinggul seimbang.', img: 'assets/TryMagicPage/Body/hourglass.png' },
    { id: 'inverted_triangle', label: 'Inverted Triangle', desc: 'Bahu lebih lebar dari pinggul.', img: 'assets/TryMagicPage/Body/inverted_triangle.png' },
    { id: 'apple', label: 'Apple', desc: 'Berisi di area perut dan dada.', img: 'assets/TryMagicPage/Body/apple.png' }
];

// --- DATA SHAPE COWOK ---
const maleBodyTypes = [
    { id: 'rectangle', label: 'Rectangle (H)', desc: 'Bahu dan pinggang sejajar (Proporsional).', img: 'assets/TryMagicPage/Body/male_rectangle.png' },
    { id: 'inverted_triangle', label: 'V-Shape', desc: 'Bahu lebar, pinggang ramping (Athletic).', img: 'assets/TryMagicPage/Body/male_triangle.png' },
    { id: 'oval', label: 'Oval (O)', desc: 'Bagian tengah tubuh lebih berisi.', img: 'assets/TryMagicPage/Body/male_oval.png' }
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
        if(btn.innerText.toLowerCase().includes(gender)) {
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
    if(!elements.bodyImg) return;

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
    updateSelectionUI(el, 'tone-options');
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
        if(elements.generateBtn) elements.generateBtn.innerText = "Connecting to Database..."; 
        
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
        
        if(elements.generateBtn) elements.generateBtn.innerText = "CLICK TO GENERATE YOUR STYLE"; 
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
        
        // Logic Tone
        let toneTag = 'neutral-tone';
        if (userState.tone === 'light') toneTag = 'cool-tone';
        else toneTag = 'warm-tone'; 

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
        
        // Ganti Foto Gede
        const bigImageElement = document.querySelector('.look-visual img');
        if (bigImageElement && recs.sets.length > 0) {
            bigImageElement.src = recs.sets[0].image; 
        }

        // 4. RENDER KE HTML
        renderOneSet(recs.sets, recs.accs);
        renderGrid(elements.topContainer, recs.tops.concat(recs.outers));
        renderGrid(elements.bottomContainer, recs.bottoms);
        renderGrid(elements.accContainer, recs.accs);
        renderGrid(elements.shoesContainer, recs.shoes);

        if(elements.skinAdvice) {
            elements.skinAdvice.innerText = `Tone "${userState.tone}" cocok dengan warna ${toneTag.replace('-tone', '')}. Untuk tinggi "${userState.height}", kami pilihkan sepatu yang proporsional!`;
        }

        // 5. Scroll Effect
        elements.resultSection.style.display = 'block';
        slowScrollTo(elements.resultSection, 1500);
    });
}

// --- LOGIC FILTER UTAMA (UNIVERSAL SHAPE) ---
function filterProducts(category, toneTag, shapeTag, genderTag) {
    if (!Array.isArray(allProducts)) return []; 

    return allProducts.filter(p => {
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
}

// =========================================
// 6. RENDER FUNCTIONS
// =========================================

function renderOneSet(sets, accs) {
    if (!elements.oneSetContainer) return;
    elements.oneSetContainer.innerHTML = `<h3>The Breakdown</h3>`;

    const mainSet = sets.length > 0 ? sets[0] : null;
    const mainAcc = accs.length > 0 ? accs[0] : null;

    if (mainSet) {
        const setHtml = `
            <div class="item-row">
                <img src="${mainSet.image}" alt="${mainSet.name}" onerror="this.src='https://via.placeholder.com/100'">
                <div class="item-info">
                    <h4>${mainSet.name}</h4>
                    <p>Best Match Look</p>
                    <span class="price">Rp ${formatPrice(mainSet.price)}</span>
                </div>
                <a href="${mainSet.shop_link}" target="_blank" class="btn-shop">Lihat</a>
            </div>
        `;
        elements.oneSetContainer.innerHTML += setHtml;
    } else {
        elements.oneSetContainer.innerHTML += `<p style="color:#888; font-size:0.9rem; padding:10px;">Belum ada Set yang pas untuk kombinasi ini :(</p>`;
    }

    if (mainAcc) {
        const accHtml = `
            <div class="item-row">
                <img src="${mainAcc.image}" alt="${mainAcc.name}" onerror="this.src='https://via.placeholder.com/100'">
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

function renderGrid(container, products) {
    if (!container) return;
    container.innerHTML = ''; 
    
    if (products.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 20px; color: #888;">Stok habis untuk kategori ini :(</p>';
        return;
    }

    const displayProducts = products.slice(0, 4);
    displayProducts.forEach(p => {
        const cardHTML = `
            <div class="product-card-simple" onclick="window.open('${p.shop_link}', '_blank')">
                <div class="img-wrapper">
                    <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300'">
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
    if(elements.bodyLabel) elements.bodyLabel.innerText = current.label;
    if(elements.bodyDesc) elements.bodyDesc.innerText = current.desc;
    
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