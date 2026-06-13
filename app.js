if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('pageshow', () => {
    window.scrollTo(0, 0);
});

/* ============================================
   WICKED WAX — index.js
   Home page interactivity
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);

    /* ---- Navigation buttons ---- */
    const navShopBtn = document.getElementById('nav-shop-btn');
    const navBuildBtn = document.getElementById('nav-build-btn');
    const navAboutBtn = document.getElementById('nav-about-btn');
    const navContactBtn = document.getElementById('nav-contact-btn');
    const logoBtn = document.querySelector('header button[aria-label="Home"]');
    const cartBtn = document.querySelector('header button[aria-label="Cart"]');

    /* ---- Cart badge ---- */
    updateCartBadge();

    // Shop → products page
    navShopBtn?.addEventListener('click', () => {
        window.location.href = 'products/products.html';
    });

    navBuildBtn?.addEventListener('click', () => {
        window.location.href = 'build/build.html';
    });

    // About → dedicated about page
    navAboutBtn?.addEventListener('click', () => {
        window.location.href = 'about/about.html';
    });

    // Contact → smooth-scroll to footer
    navContactBtn?.addEventListener('click', () => {
        window.location.href = 'contact/contact.html';
    });

    // Logo → back to top
    logoBtn?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Cart → navigate to the cart page
    cartBtn?.addEventListener('click', () => {
        window.location.href = 'cart/cart.html';
    });

    /* ---- CTA button ---- */
    document.getElementById('start-building-btn')?.addEventListener('click', () => {
        window.location.href = 'build/build.html';
    });

    /* ---- Best Sellers carousel ---- */
    const bestSellersData = [
        { id: 'soy-wax',       name: 'Premium Soy Wax',     price: 40, categoryLabel: 'Wax',            img: 'Assets/wax bags/A_Blanket_of_Snow_bag.png',     hoverImg: 'Assets/wax 2/a_blanket_of_snow.jpg',              desc: '100% natural soy wax in 19 hand-picked shades. Clean burning, beginner-friendly and endlessly customizable.' },
        { id: 'old-cardigan',  name: 'Old Cardigan',        price: 45, categoryLabel: 'Fragrance Oil',  img: 'Assets/Scented oils/Old_Cardigan.png',           hoverImg: 'Assets/Scented oils back/old_cardigan_back.png',  desc: 'Worn in, lived in and impossible to throw away. This is the scent of something you keep coming back to without quite knowing why. Familiar, soft and permanently yours.' },
        { id: 'salt-air',      name: 'Salt Air',            price: 45, categoryLabel: 'Fragrance Oil',  img: 'Assets/Scented oils/Salt_Air.png',               hoverImg: 'Assets/Scented oils back/salt_air_back.png',      desc: 'Salt air, a sun warmed afternoon and a feeling you knew wasn\'t yours to keep. Fresh, open and quietly heartbreaking — like a whole summer compressed into one perfect breath.' },
        { id: 'cotton-wick',   name: 'Cotton Wick Kit',     price: 40, categoryLabel: 'Wick',           img: 'Assets/more product/cotton_wick.png',            hoverImg: 'Assets/more product/cotton_wick_burning.png',     desc: 'Every flame tells a story — and yours starts here.<br><br>Our pre-waxed cotton wicks are the quiet heart of every candle you\'ll ever make. Braided to burn slowly and cleanly, they hold their shape with grace and light up your creations with a soft, steady glow that feels almost like magic.' },
        { id: 'flowers',       name: 'Lovely Bouquet Decor',price: 25, categoryLabel: 'Candle Decor',   img: 'Assets/candle decor/flowers_packed.png',         hoverImg: 'Assets/candle decor/flowers_in_candle.png',       desc: 'Every showgirl deserves flowers. Press the Lovely Bouquet into the wax while it\'s still warm and let your candle take its final bow in style.' },
        { id: 'enchanted-jar', name: 'Enchanted Jar',       price: 29, categoryLabel: 'Jar',            img: 'Assets/more product/jars/vintage_jar_small.png', hoverImg: 'Assets/more product/jars/vintage_jar_small_candle.png', desc: 'Ridged, textured, and impossibly charming — this vintage-inspired jar catches the light in a way that makes every candle look like it belongs on a very old, very beautiful shelf. Comes with a fitted lid to seal in the magic between burns.' },
        { id: 'wick-trimmer',  name: 'Golden Wick Trimmer', price: 50, categoryLabel: 'Wick Accessory', img: 'Assets/more product/wick_trimmer.png',           hoverImg: 'Assets/more product/wick_trimmer_candle.png',     desc: 'Some things change the way you see everything else.<br><br>A steady flame. A quiet evening. The moment you realize that the small things — done with care, done with intention — are what make a life feel luminous.' },
    ];

    function getProductPreview(desc, maxLength = 88) {
        const plainText = desc.replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim();
        return plainText.length > maxLength ? `${plainText.slice(0, maxLength).trim()}...` : plainText;
    }

    function renderBestSellers() {
        const container = document.getElementById('main-imgs');
        if (!container) return;
        container.innerHTML = '';
        container.className = 'bs-carousel-container';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'bs-arrow bs-prev';
        prevBtn.setAttribute('aria-label', 'Previous');
        prevBtn.innerHTML = '&#8249;';

        const track = document.createElement('div');
        track.className = 'bs-track';

        const nextBtn = document.createElement('button');
        nextBtn.className = 'bs-arrow bs-next';
        nextBtn.setAttribute('aria-label', 'Next');
        nextBtn.innerHTML = '&#8250;';

        bestSellersData.forEach(p => {
            const card = document.createElement('article');
            card.className = 'product-card bs-card';
            card.innerHTML = `
                <div class="best-seller-badge">★ Best Seller</div>
                <div class="card-img-wrapper" onclick="openQuickView('${p.id}')">
                    <img src="${p.img}" class="default-img" alt="${p.name}">
                    <img src="${p.hoverImg}" class="hover-img" alt="${p.name}">
                    <div class="quick-view-overlay">View Product</div>
                </div>
                <div class="card-body">
                    <span class="product-category">${p.categoryLabel}</span>
                    <h3>${p.name}</h3>
                    <p class="product-desc">${getProductPreview(p.desc)}</p>
                    <div class="card-footer">
                        <span class="product-price">₪${p.price}</span>
                        <button class="add-to-cart-btn bs-add-btn">Add to Cart</button>
                    </div>
                </div>`;
            card.querySelector('.bs-add-btn').addEventListener('click', e => {
                e.stopPropagation();
                const btn = e.currentTarget;
                addToCartHome({ name: p.name, price: p.price });
                btn.textContent = '✓ Added!';
                btn.classList.add('added');
                setTimeout(() => { btn.textContent = 'Add to Cart'; btn.classList.remove('added'); }, 1800);
                showToast(`✅ "${p.name}" added to cart`);
                updateCartBadge();
            });
            track.appendChild(card);
        });

        container.appendChild(prevBtn);
        container.appendChild(track);
        container.appendChild(nextBtn);

        prevBtn.addEventListener('click', () => scrollBestSellers(track, -1));
        nextBtn.addEventListener('click', () => scrollBestSellers(track, 1));
    }

    renderBestSellers();

    function scrollBestSellers(track, direction) {
        const cards = Array.from(track.querySelectorAll('.bs-card'));
        if (!cards.length) return;

        const trackStyle = window.getComputedStyle(track);
        const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
        const gap = parseFloat(trackStyle.columnGap || trackStyle.gap) || 0;
        // Move by one full card plus its gap, then clamp to the start/end when a full step is not available.
        const step = cards[0].getBoundingClientRect().width + gap;
        const current = track.scrollLeft;
        const target = Math.max(0, Math.min(maxScroll, current + (step * direction)));

        track.scrollTo({ left: target, behavior: 'smooth' });
    }

    /* ---- Touch/Swipe support for carousel ---- */
    const track = document.querySelector('.bs-track');
    if (track) {
        let startX = 0;
        let endX = 0;
        
        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });
        
        track.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const diff = startX - endX;
            const threshold = 50;
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    // Swiped left, scroll right
                    scrollBestSellers(track, 1);
                } else {
                    // Swiped right, scroll left
                    scrollBestSellers(track, -1);
                }
            }
        }
    }

    function addToCartHome({ name, price }) {
        try {
            const cart = JSON.parse(localStorage.getItem('ww_cart') || '[]');
            const existing = cart.find(i => i.name === name);
            if (existing) { existing.qty += 1; } else { cart.push({ name, price, qty: 1 }); }
            const total = cart.reduce((s, i) => s + i.qty, 0);
            localStorage.setItem('ww_cart', JSON.stringify(cart));
            localStorage.setItem('ww_cart_count', String(total));
        } catch {}
    }

    /* ---- Active nav highlight on scroll ---- */
    const sections = [
        { el: document.getElementById('main-cta'), btn: null },
        { el: document.getElementById('main-bs'), btn: navShopBtn },
        { el: document.querySelector('.about'), btn: navAboutBtn },
        { el: document.querySelector('footer'), btn: navContactBtn },
    ];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // clear active on all nav buttons
                document.querySelectorAll('header button, header .nav-link').forEach(b => b.classList.remove('nav-active'));
                // find matching btn and mark active
                const match = sections.find(s => s.el === entry.target);
                if (match?.btn) match.btn.classList.add('nav-active');
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(s => { if (s.el) observer.observe(s.el); });

    /* ---- Cart count helper (shared via localStorage) ---- */
    function getCartCount() {
        return parseInt(localStorage.getItem('ww_cart_count') || '0', 10);
    }

    function updateCartBadge() {
        const count = getCartCount();
        let badge = document.getElementById('cart-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'cart-badge';
            cartBtn?.style && cartBtn.appendChild(badge);
        }
        const cartBtnEl = document.querySelector('header button[aria-label="Cart"]');
        if (!cartBtnEl) return;
        let existingBadge = cartBtnEl.querySelector('#cart-badge');
        if (!existingBadge) {
            existingBadge = document.createElement('span');
            existingBadge.id = 'cart-badge';
            cartBtnEl.appendChild(existingBadge);
        }
        existingBadge.textContent = count;
        existingBadge.style.display = count > 0 ? 'flex' : 'none';
    }

    /* ---- Toast notification ---- */
    function showToast(message) {
        let toast = document.getElementById('ww-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'ww-toast';
            document.body.appendChild(toast);
            // Inject toast styles once
            const style = document.createElement('style');
            style.textContent = `
                #ww-toast {
                    position: fixed;
                    bottom: 32px;
                    left: 50%;
                    transform: translateX(-50%) translateY(20px);
                    background: #5D3364;
                    color: #fff;
                    font-family: 'Poppins', sans-serif;
                    font-size: 15px;
                    padding: 14px 28px;
                    border-radius: 50px;
                    box-shadow: 0 8px 30px rgba(93,51,100,0.35);
                    opacity: 0;
                    transition: opacity 0.3s ease, transform 0.3s ease;
                    z-index: 9999;
                    white-space: nowrap;
                }
                #ww-toast.show {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            `;
            document.head.appendChild(style);
        }
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
    }

    /* ---- Listen for cart updates from products page ---- */
    window.addEventListener('storage', () => updateCartBadge());
});
