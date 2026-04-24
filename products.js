/* ============================================
   WICKED WAX — products.js
   Shop page: search, filters, sort, cart
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ======== DOM References ======== */
    const grid        = document.getElementById('products-grid');
    const cards       = Array.from(grid.querySelectorAll('.product-card'));
    const searchInput = document.getElementById('search-input');
    const priceSlider = document.getElementById('price-slider');
    const priceDisplay= document.getElementById('price-display');
    const sortSelect  = document.getElementById('sort-select');
    const catBtns     = document.querySelectorAll('.cat-btn');
    const typeChecks  = document.querySelectorAll('.filter-check input[type="checkbox"]');
    const countNum    = document.getElementById('count-num');
    const noResults   = document.getElementById('no-results');
    const clearBtn    = document.getElementById('clear-filters-btn');
    const cartBtn     = document.querySelector('header button[aria-label="Cart"]');

    /* ======== State ======== */
    let activeCategory = 'all';

    /* ======== Initialise ======== */
    updateCartBadge();
    applyFilters();          // initial render respects any defaults

    /* ======== Navigation ======== */
    document.getElementById('nav-home-btn')?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    document.getElementById('nav-shop-btn')?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('nav-build-btn')?.addEventListener('click', () => {
        showToast('🕯️ Candle builder coming soon!');
    });

    document.getElementById('nav-about-btn')?.addEventListener('click', () => {
        window.location.href = 'index.html#about';
    });

    document.getElementById('nav-contact-btn')?.addEventListener('click', () => {
        window.location.href = 'index.html#contact';
    });

    document.querySelector('header button[aria-label="Home"]')?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    cartBtn?.addEventListener('click', () => {
        const count = getCartCount();
        showToast(count > 0
            ? `🛒 You have ${count} item${count !== 1 ? 's' : ''} in your cart.`
            : '🛒 Your cart is empty.');
    });

    /* ======== Category buttons ======== */
    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.category;
            applyFilters();
        });
    });

    /* ======== Search ======== */
    searchInput.addEventListener('input', applyFilters);

    /* ======== Price Slider ======== */
    priceSlider.addEventListener('input', () => {
        // update gradient fill dynamically
        const pct = ((priceSlider.value - priceSlider.min) / (priceSlider.max - priceSlider.min)) * 100;
        priceSlider.style.background =
            `linear-gradient(to right, #B08AC3 ${pct}%, #e0d4ed ${pct}%)`;
        priceDisplay.textContent = '₪' + priceSlider.value;
        applyFilters();
    });

    /* ======== Type checkboxes ======== */
    typeChecks.forEach(cb => cb.addEventListener('change', applyFilters));

    /* ======== Sort ======== */
    sortSelect.addEventListener('change', applyFilters);

    /* ======== Clear filters ======== */
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        priceSlider.value = 200;
        priceSlider.style.background = 'linear-gradient(to right, #B08AC3 100%, #e0d4ed 100%)';
        priceDisplay.textContent = '₪200';
        typeChecks.forEach(cb => cb.checked = true);
        sortSelect.value = 'default';
        catBtns.forEach(b => b.classList.remove('active'));
        catBtns[0].classList.add('active');
        activeCategory = 'all';
        applyFilters();
    });

    /* ======== Add to Cart ======== */
    grid.addEventListener('click', e => {
        const btn = e.target.closest('.add-to-cart-btn');
        if (!btn) return;

        const card = btn.closest('.product-card');
        const name  = card.dataset.name;
        const price = card.dataset.price;

        // Visual feedback
        btn.textContent = '✓ Added!';
        btn.classList.add('added');

        // Animate the card
        card.classList.add('card-pulse');
        setTimeout(() => card.classList.remove('card-pulse'), 400);

        // Persist to localStorage
        addToCart({ name, price });

        // Update badge
        updateCartBadge();

        // Toast
        showToast(`✅ "${name}" added to cart`);

        setTimeout(() => {
            btn.textContent = 'Add to Cart';
            btn.classList.remove('added');
        }, 1800);
    });

    /* ======== Core filter / sort function ======== */
    function applyFilters() {
        const query      = searchInput.value.toLowerCase().trim();
        const maxPrice   = parseInt(priceSlider.value);
        const allowedTypes = Array.from(typeChecks)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        let visible = cards.filter(card => {
            const name    = card.dataset.name.toLowerCase();
            const cat     = card.dataset.category;
            const price   = parseInt(card.dataset.price);
            const type    = card.dataset.type;

            const matchSearch = name.includes(query);
            const matchCat    = activeCategory === 'all' || cat === activeCategory;
            const matchPrice  = price <= maxPrice;
            // blend matches if any type is checked
            const matchType   = allowedTypes.includes(type) ||
                                (type === 'blend' && allowedTypes.length > 0);

            return matchSearch && matchCat && matchPrice && matchType;
        });

        // Sort
        const sort = sortSelect.value;
        if (sort === 'price-asc')  visible.sort((a, b) => a.dataset.price - b.dataset.price);
        if (sort === 'price-desc') visible.sort((a, b) => b.dataset.price - a.dataset.price);
        if (sort === 'name-asc')   visible.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));

        // Hide all, then show & re-order visible ones
        cards.forEach(c => { c.hidden = true; });
        visible.forEach(c => {
            c.hidden = false;
            grid.appendChild(c);   // re-order in DOM
        });

        countNum.textContent = visible.length;
        noResults.hidden = visible.length > 0;
    }

    /* ======== Cart helpers (localStorage) ======== */
    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('ww_cart') || '[]');
        } catch { return []; }
    }

    function getCartCount() {
        return getCart().reduce((sum, item) => sum + item.qty, 0);
    }

    function addToCart({ name, price }) {
        const cart = getCart();
        const existing = cart.find(i => i.name === name);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ name, price: parseInt(price), qty: 1 });
        }
        localStorage.setItem('ww_cart', JSON.stringify(cart));
        localStorage.setItem('ww_cart_count', String(getCartCount() + (existing ? 0 : 1)));
        // recount properly
        const total = cart.reduce((s, i) => s + i.qty, 0);
        localStorage.setItem('ww_cart_count', String(total));
    }

    function updateCartBadge() {
        const count = getCartCount();
        let badge = document.getElementById('cart-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'cart-badge';
            cartBtn?.appendChild(badge);
        }
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }

    /* ======== Toast notification ======== */
    function showToast(message) {
        let toast = document.getElementById('ww-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'ww-toast';
            document.body.appendChild(toast);

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
                .card-pulse {
                    animation: pulse 0.4s ease;
                }
                @keyframes pulse {
                    0%   { transform: scale(1); }
                    50%  { transform: scale(1.04); }
                    100% { transform: scale(1); }
                }
                #cart-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: #1A543E;
                    color: #fff;
                    font-size: 11px;
                    font-weight: 700;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Poppins', sans-serif;
                    border: 2px solid #5D3364;
                }
            `;
            document.head.appendChild(style);
        }

        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
    }

    /* ======== Cart badge styles (injected once) ======== */
    const badgeStyle = document.createElement('style');
    badgeStyle.textContent = `
        header button[aria-label="Cart"] {
            position: relative;
        }
        #cart-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background: #1A543E;
            color: #fff;
            font-size: 11px;
            font-weight: 700;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: none;
            align-items: center;
            justify-content: center;
            font-family: 'Poppins', sans-serif;
            border: 2px solid #5D3364;
        }
    `;
    document.head.appendChild(badgeStyle);
});
