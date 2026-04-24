/* ============================================
   WICKED WAX — index.js
   Home page interactivity
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ---- Cart badge ---- */
    updateCartBadge();

    /* ---- Navigation buttons ---- */
    const navShopBtn    = document.getElementById('nav-shop-btn');
    const navBuildBtn   = document.getElementById('nav-build-btn');
    const navAboutBtn   = document.getElementById('nav-about-btn');
    const navContactBtn = document.getElementById('nav-contact-btn');
    const logoBtn       = document.querySelector('header button[aria-label="Home"]');
    const cartBtn       = document.querySelector('header button[aria-label="Cart"]');

    // Shop → products page
    navShopBtn?.addEventListener('click', () => {
        window.location.href = 'products.html';
    });

    // Build a Candle → placeholder (future page)
    navBuildBtn?.addEventListener('click', () => {
        showToast('🕯️ Candle builder coming soon!');
    });

    // About → smooth-scroll to about section
    navAboutBtn?.addEventListener('click', () => {
        document.querySelector('.about')?.scrollIntoView({ behavior: 'smooth' });
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

    /* ---- CTA buttons ---- */
    const startBuildingBtn  = document.getElementById('start-building-btn');
    const shopMaterialBtn   = document.getElementById('shop-material-btn');

    startBuildingBtn?.addEventListener('click', () => {
        showToast('🕯️ Candle builder coming soon!');
    });

    shopMaterialBtn?.addEventListener('click', () => {
        window.location.href = 'products.html';
    });

    /* ---- Active nav highlight on scroll ---- */
    const sections = [
        { el: document.getElementById('main-cta'),   btn: null },
        { el: document.getElementById('main-bs'),    btn: navShopBtn },
        { el: document.querySelector('.about'),      btn: navAboutBtn },
        { el: document.querySelector('footer'),      btn: navContactBtn },
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
