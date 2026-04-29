/* ============================================
   WICKED WAX — index.js
   Home page interactivity
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

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
        window.location.href = 'products.html';
    });

    // Build a Candle → placeholder (future page)
    navBuildBtn?.addEventListener('click', () => {
        showToast('🕯️ Candle builder coming soon!');
    });

    // About → dedicated about page
    navAboutBtn?.addEventListener('click', () => {
        window.location.href = 'about.html';
    });

    // Contact → smooth-scroll to footer
    navContactBtn?.addEventListener('click', () => {
        document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Logo → back to top
    logoBtn?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Cart → show mini toast with cart count
    cartBtn?.addEventListener('click', () => {
        const count = getCartCount();
        showToast(count > 0
            ? `🛒 You have ${count} item${count !== 1 ? 's' : ''} in your cart.`
            : '🛒 Your cart is empty.');
    });

    /* ---- CTA button ---- */
    document.getElementById('start-building-btn')?.addEventListener('click', () => {
        showToast('🕯️ Candle builder coming soon!');
    });

    /* ---- Best Sellers carousel ---- */
    const bestSellersData = [
        { id: 'soy-wax',      name: 'Premium Soy Wax',     price: 40, categoryLabel: 'Wax',           img: 'Assets/wax bags/A_Blanket_of_Snow_bag.png',     hoverImg: 'Assets/wax 2/a_blanket_of_snow.jpg' },
        { id: 'old-cardigan', name: 'Old Cardigan',         price: 45, categoryLabel: 'Fragrance Oil', img: 'Assets/Scented oils/Old_Cardigan.png',           hoverImg: 'Assets/Scented oils back/old_cardigan_back.png' },
        { id: 'salt-air',     name: 'Salt Air',             price: 45, categoryLabel: 'Fragrance Oil', img: 'Assets/Scented oils/Salt_Air.png',               hoverImg: 'Assets/Scented oils back/salt_air_back.png' },
        { id: 'cotton-wick',  name: 'Cotton Wick Kit',      price: 40, categoryLabel: 'Wick',          img: 'Assets/more product/cotton_wick.png',            hoverImg: 'Assets/more product/cotton_wick_burning.png' },
        { id: 'flowers',      name: 'Lovely Bouquet Decor', price: 25, categoryLabel: 'Candle Decor',  img: 'Assets/candle decor/flowers_packed.png',         hoverImg: 'Assets/candle decor/flowers_in_candle.png' },
        { id: 'enchanted-jar',name: 'Enchanted Jar',        price: 29, categoryLabel: 'Jar',           img: 'Assets/more product/jars/vintage_jar_small.png', hoverImg: 'Assets/more product/jars/vintage_jar_small_candle.png' },
        { id: 'wick-trimmer', name: 'Golden Wick Trimmer',  price: 50, categoryLabel: 'Wick Accessory',img: 'Assets/more product/wick_trimmer.png',           hoverImg: 'Assets/more product/wick_trimmer_candle.png' },
    ];

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

        const scrollAmt = 244;
        prevBtn.addEventListener('click', () => track.scrollBy({ left: -scrollAmt, behavior: 'smooth' }));
        nextBtn.addEventListener('click', () => track.scrollBy({ left:  scrollAmt, behavior: 'smooth' }));
    }

    renderBestSellers();

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
                document.querySelectorAll('header button').forEach(b => b.classList.remove('nav-active'));
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
