/* ============================================
   WICKED WAX — about.js
   About page interactivity
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ---- Navigation ---- */
    document.getElementById('nav-shop-btn')?.addEventListener('click', () => {
        window.location.href = 'products.html';
    });

    document.getElementById('nav-build-btn')?.addEventListener('click', () => {
        showToast('🕯️ Candle builder coming soon!');
    });

    document.getElementById('nav-contact-btn')?.addEventListener('click', () => {
        document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
    });

    /* ---- Cart badge ---- */
    const cartBtn = document.querySelector('header button[aria-label="Cart"]');
    updateCartBadge(cartBtn);

    cartBtn?.addEventListener('click', () => {
        const count = parseInt(localStorage.getItem('ww_cart_count') || '0', 10);
        showToast(count > 0
            ? `🛒 You have ${count} item${count !== 1 ? 's' : ''} in your cart.`
            : '🛒 Your cart is empty.');
    });

    window.addEventListener('storage', () => updateCartBadge(cartBtn));

    function updateCartBadge(btn) {
        if (!btn) return;
        const count = parseInt(localStorage.getItem('ww_cart_count') || '0', 10);
        let badge = btn.querySelector('#cart-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'cart-badge';
            btn.appendChild(badge);
        }
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }

    /* ---- Toast ---- */
    function showToast(message) {
        let toast = document.getElementById('ww-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'ww-toast';
            document.body.appendChild(toast);
            const style = document.createElement('style');
            style.textContent = `
                #ww-toast {
                    position: fixed; bottom: 32px; left: 50%;
                    transform: translateX(-50%) translateY(20px);
                    background: #5D3364; color: #fff;
                    font-family: 'Poppins', sans-serif; font-size: 15px;
                    padding: 14px 28px; border-radius: 50px;
                    box-shadow: 0 8px 30px rgba(93,51,100,0.35);
                    opacity: 0; transition: opacity 0.3s ease, transform 0.3s ease;
                    z-index: 9999; white-space: nowrap;
                }
                #ww-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
            `;
            document.head.appendChild(style);
        }
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
    }
});
