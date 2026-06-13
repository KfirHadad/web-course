/* ============================================
   WICKED WAX - contact.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    const success = document.getElementById('contact-success');
    const cartBtn = document.querySelector('header button[aria-label="Cart"]');

    document.getElementById('nav-shop-btn')?.addEventListener('click', () => {
        window.location.href = '../products/products.html';
    });

    document.getElementById('nav-build-btn')?.addEventListener('click', () => {
        window.location.href = '../build/build.html';
    });

    document.getElementById('nav-about-btn')?.addEventListener('click', () => {
        window.location.href = '../about/about.html';
    });

    document.getElementById('nav-contact-btn')?.addEventListener('click', event => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    cartBtn?.addEventListener('click', () => {
        window.location.href = '../cart/cart.html';
    });

    updateCartBadge();
    window.addEventListener('storage', updateCartBadge);

    form?.addEventListener('submit', event => {
        event.preventDefault();
        const isValid = validateForm();

        if (isValid) {
            showSuccessPopup();
        }
    });

    form?.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('input', () => validateField(field));
    });

    function validateForm() {
        const fields = [
            document.getElementById('contact-name'),
            document.getElementById('contact-email'),
            document.getElementById('contact-subject'),
            document.getElementById('contact-message'),
        ];

        return fields.map(validateField).every(Boolean);
    }

    function validateField(field) {
        if (!field) return true;

        let message = '';
        const value = field.value.trim();

        if (field.required && !value) {
            message = field.id === 'contact-message' ? 'Please write a message.' : 'This field is required.';
        } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            message = 'Please enter a valid email address.';
        } else if (field.id === 'contact-message' && value && value.length < 10) {
            message = 'Message must be at least 10 characters.';
        }

        const wrapper = field.closest('.form-field');
        const error = wrapper?.querySelector('.field-error');

        wrapper?.classList.toggle('has-error', Boolean(message));
        field.setAttribute('aria-invalid', message ? 'true' : 'false');
        if (error) error.textContent = message;

        return !message;
    }

    function updateCartBadge() {
        if (!cartBtn) return;
        const count = parseInt(localStorage.getItem('ww_cart_count') || '0', 10);
        let badge = cartBtn.querySelector('#cart-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'cart-badge';
            cartBtn.appendChild(badge);
        }
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }

    function showSuccessPopup() {
        const overlay = document.createElement('div');
        overlay.id = 'ww-success-overlay';
        overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.55); display:flex; align-items:center; justify-content:center; padding:24px; z-index:9999;';

        const dialog = document.createElement('div');
        dialog.id = 'ww-success-dialog';
        dialog.style.cssText = 'background:#fff; border-radius:24px; max-width:420px; width:100%; padding:32px 28px; box-shadow:0 24px 60px rgba(0,0,0,0.18); text-align:center; font-family:\'Poppins\', sans-serif;';
        dialog.innerHTML = `
            <p class="success-title" style="font-size:1.75rem"; font-weight:700; margin:0 0 14px; color:#222;">Thanks! We'll get back to you soon.</p>
            <p style="margin:0 0 24px; color:#555; line-height:1.6; font-size:0.8rem;">Your message is glowing in our inbox.</p>
            <button type="button" id="ww-success-ok" style="background:#5D3364; color:#fff; border:none; border-radius:999px; padding:14px 32px; font-size:1rem; cursor:pointer;">OK</button>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const okButton = document.getElementById('ww-success-ok');
        okButton?.addEventListener('click', () => {
            window.location.href = '../index.html';
        });

        okButton?.focus();
        overlay.addEventListener('click', event => {
            if (event.target === overlay) {
                window.location.href = '../index.html';
            }
        });
        document.addEventListener('keydown', function handleKeydown(event) {
            if (event.key === 'Escape') {
                window.location.href = '../index.html';
                document.removeEventListener('keydown', handleKeydown);
            }
        });
    }

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
        toast._timer = setTimeout(() => toast.classList.remove('show'), 2400);
    }
});
