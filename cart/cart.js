const CART_KEY = 'ww_cart';
const CART_COUNT_KEY = 'ww_cart_count';

const cartItemsContainer = document.getElementById('cart-items');
const cartCountText = document.getElementById('cart-count-text');
const cartEmptyState = document.getElementById('cart-empty');
const summarySubtotal = document.getElementById('summary-subtotal');
const discountRow = document.getElementById('discount-row');
const summaryDiscount = document.getElementById('summary-discount');
const summaryTotal = document.getElementById('summary-total');
const promoCodeInput = document.getElementById('promo-code');
const applyPromoButton = document.getElementById('apply-promo');
const promoMessage = document.getElementById('promo-message');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const closeModalButton = document.getElementById('close-modal');
const wizardTrack = document.getElementById('wizard-track');
const paymentError = document.getElementById('payment-error');
const checkoutResult = document.getElementById('checkout-result');

const step1Next = document.getElementById('step1-next');
const step2Back = document.getElementById('step2-back');
const step2Next = document.getElementById('step2-next');
const step3Back = document.getElementById('step3-back');
const confirmOrderButton = document.getElementById('confirm-order');

const formFields = {
    fullName: document.getElementById('full-name'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    phoneCountryCode: document.getElementById('phone-country-code'),
    address: document.getElementById('address'),
    city: document.getElementById('city'),
    postalCode: document.getElementById('postal-code'),
    cardNumber: document.getElementById('card-number'),
    expiryMonth: document.getElementById('expiry-month'),
    expiryYear: document.getElementById('expiry-year'),
    cvv: document.getElementById('cvv'),
};

let cartData = loadCartData();

const checkoutState = {
    activeStep: 1,
    discountRate: 0,
    promoCode: '',
};

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch {
        return [];
    }
}

function normalizeImagePath(imagePath = '') {
    if (!imagePath) return '../Assets/logo.jpeg';
    if (imagePath.startsWith('../')) return imagePath;
    if (imagePath.startsWith('Assets/')) return `../${imagePath}`;
    if (imagePath.startsWith('./Assets/')) return `../${imagePath.slice(2)}`;
    return imagePath;
}

function saveCart(cart) {
    const normalized = cart.map(item => ({
        ...item,
        price: Number(item.price) || 0,
        qty: Number(item.qty || item.quantity) || 1,
        image: normalizeImagePath(item.image || '../Assets/logo.jpeg'),
    }));
    localStorage.setItem(CART_KEY, JSON.stringify(normalized));
    localStorage.setItem(CART_COUNT_KEY, String(normalized.reduce((sum, item) => sum + item.qty, 0)));
    cartData = loadCartData();
}

function loadCartData() {
    const stored = getCart();
    return stored.map(item => {
        const bundleDetails = item.bundleDetails || parseBundleDetails(item.name);
        return {
            id: item.id || item.name,
            name: item.name,
            price: Number(item.price) || 0,
            quantity: Number(item.qty || item.quantity) || 1,
            image: normalizeImagePath(item.image || '../Assets/logo.jpeg'),
            type: item.type || (bundleDetails ? 'candle-bundle' : ''),
            bundleDetails,
        };
    });
}

function parseBundleDetails(name = '') {
    // Older bundle items may only have a long name string. This keeps them compatible with the newer badge UI.
    const match = name.match(/^(Small Bundle|Large Bundle):\s*(.+)$/);
    if (!match) return null;
    const parts = match[2].split(',').map(part => part.trim());
    if (parts.length < 4) return null;
    return {
        size: match[1],
        jar: parts[0],
        wax: parts[1],
        scent: parts[2],
        wick: parts.slice(3).join(', '),
    };
}

function formatCurrency(value) {
    return `₪${value.toFixed(2)}`;
}

function calculateTotals() {
    const subtotal = cartData.reduce((total, item) => total + item.price * item.quantity, 0);
    const discount = subtotal * checkoutState.discountRate;
    const total = subtotal - discount;
    return { subtotal, discount, total };
}

function renderSummary() {
    const totals = calculateTotals();
    summarySubtotal.textContent = formatCurrency(totals.subtotal);
    summaryDiscount.textContent = totals.discount > 0 ? `-${formatCurrency(totals.discount)}` : formatCurrency(0);
    discountRow.classList.toggle('hidden', totals.discount <= 0);
    summaryTotal.textContent = formatCurrency(totals.total);
}

function renderEmptyState() {
    const itemCount = cartData.length;
    cartCountText.textContent = itemCount === 1 ? '1 item in your cart' : `${itemCount} items in your cart`;
    if (!itemCount) {
        cartItemsContainer.classList.add('hidden');
        cartEmptyState.classList.remove('hidden');
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Add items to continue';
        summarySubtotal.textContent = formatCurrency(0);
        summaryDiscount.textContent = formatCurrency(0);
        summaryTotal.textContent = formatCurrency(0);
    } else {
        cartItemsContainer.classList.remove('hidden');
        cartEmptyState.classList.add('hidden');
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Proceed to Payment';
    }
}

function applyPromoCode() {
    const code = promoCodeInput.value.trim().toUpperCase();
    promoMessage.classList.remove('success', 'error');

    if (!code) {
        checkoutState.discountRate = 0;
        checkoutState.promoCode = '';
        promoMessage.textContent = 'Enter a discount code to apply it.';
        promoMessage.classList.add('error');
    } else if (code === 'TS13') {
        checkoutState.discountRate = 0.13;
        checkoutState.promoCode = code;
        promoMessage.textContent = 'TS13 applied: 13% off.';
        promoMessage.classList.add('success');
    } else if (code === 'WW10' || code === 'WELCOME10' || code === 'MAZAL_TOV_MAYA') {
        checkoutState.discountRate = 0.10;
        checkoutState.promoCode = code;
        promoMessage.textContent = `${code} applied: 10% off.`;
        promoMessage.classList.add('success');
    } else if (code === 'ITZIK100') {
        checkoutState.discountRate = 1.00;
        checkoutState.promoCode = code;
        promoMessage.textContent = `${code} means we should get 100 😜`;
        promoMessage.classList.add('success');
    } else {
        checkoutState.discountRate = 0;
        checkoutState.promoCode = '';
        promoMessage.textContent = 'That code is not valid.';
        promoMessage.classList.add('error');
    }

    renderSummary();
}

function renderCartItems() {
    cartItemsContainer.innerHTML = '';
    if (!cartData.length) {
        renderEmptyState();
        return;
    }

    cartData.forEach((item) => {
        const itemElement = document.createElement('article');
        itemElement.className = 'cart-item';
        itemElement.dataset.itemId = item.id;
        // Bundle items get a short title plus badges; regular products keep their normal product name.
        const isBundle = item.type === 'candle-bundle' && item.bundleDetails;
        const itemTitle = isBundle ? item.bundleDetails.size : item.name;
        const bundleBadges = isBundle ? renderBundleBadges(item.bundleDetails) : '';
        itemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-body">
                <div>
                    <h3 class="item-title">${itemTitle}</h3>
                    ${bundleBadges}
                    <div class="item-meta">
                        <span class="item-price">${formatCurrency(item.price)}</span>
                        <span>Quantity: ${item.quantity}</span>
                    </div>
                </div>
                <div class="item-controls">
                    <div class="qty-control">
                        <button type="button" class="qty-decrease" data-action="decrease" aria-label="Decrease quantity">−</button>
                        <span>${item.quantity}</span>
                        <button type="button" class="qty-increase" data-action="increase" aria-label="Increase quantity">+</button>
                    </div>
                    <button type="button" class="remove-item" data-action="remove" aria-label="Remove ${item.name}">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M3 6h18"></path>
                            <path d="M8 6V4h8v2"></path>
                            <path d="M19 6l-1 14H6L5 6"></path>
                            <path d="M10 11v5"></path>
                            <path d="M14 11v5"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        const quantityLabel = itemElement.querySelector('.item-meta span:last-child');
        const qtyDecrease = itemElement.querySelector('.qty-decrease');
        const qtyIncrease = itemElement.querySelector('.qty-increase');
        const removeButton = itemElement.querySelector('.remove-item');

        qtyDecrease.addEventListener('click', () => changeQuantity(item.id, -1));
        qtyIncrease.addEventListener('click', () => changeQuantity(item.id, 1));
        removeButton.addEventListener('click', () => removeItem(item.id));

        cartItemsContainer.appendChild(itemElement);
    });
    renderEmptyState();
    renderSummary();
}

function renderBundleBadges(details) {
    // These badges mirror the builder steps and make the custom bundle easy to scan in the cart.
    const badges = [
        details.jar,
        details.wax,
        `${details.scent} Scent`,
        details.wick,
    ].filter(Boolean);

    return `
        <div class="bundle-badges" aria-label="Bundle choices">
            ${badges.map(badge => `<span>${badge}</span>`).join('')}
        </div>
    `;
}

function changeQuantity(itemId, delta) {
    const item = cartData.find((cartItem) => cartItem.id === itemId);
    if (!item) return;
    if (delta === -1 && item.quantity === 1) {
        if (confirm('Remove this item from your cart?')) {
            removeItem(itemId);
        }
    } else {
        item.quantity = Math.max(1, item.quantity + delta);
        saveCart(cartData.map(({ id, name, price, image, quantity, type, bundleDetails }) => ({ id, name, price, image, qty: quantity, type, bundleDetails })));
        renderCartItems();
    }
}

function removeItem(itemId) {
    const index = cartData.findIndex((cartItem) => cartItem.id === itemId);
    if (index === -1) return;
    cartData.splice(index, 1);
    saveCart(cartData.map(({ id, name, price, image, quantity, type, bundleDetails }) => ({ id, name, price, image, qty: quantity, type, bundleDetails })));
    renderCartItems();
}

function openModal() {
    if (!cartData.length) return;
    checkoutModal.classList.remove('hidden');
    checkoutModal.setAttribute('aria-hidden', 'false');
    checkoutState.activeStep = 1;
    wizardTrack.style.display = '';
    wizardTrack.style.transform = 'translateX(0)';
    paymentError.textContent = '';
    checkoutResult.classList.add('hidden');
    closeModalButton.style.display = '';
    showStepButtons();
}

function closeModal() {
    checkoutModal.classList.add('hidden');
    checkoutModal.setAttribute('aria-hidden', 'true');
}

function showStepButtons() {
    document.getElementById('step1-next').style.display = checkoutState.activeStep === 1 ? 'inline-flex' : 'none';
    document.getElementById('step2-back').style.display = checkoutState.activeStep === 2 ? 'inline-flex' : 'none';
    document.getElementById('step2-next').style.display = checkoutState.activeStep === 2 ? 'inline-flex' : 'none';
    document.getElementById('step3-back').style.display = checkoutState.activeStep === 3 ? 'inline-flex' : 'none';
    document.getElementById('confirm-order').style.display = checkoutState.activeStep === 3 ? 'inline-flex' : 'none';
}

function validateCurrentStep() {
    paymentError.textContent = '';
    const requiredFields = [];

    if (checkoutState.activeStep === 1) {
        requiredFields.push(formFields.fullName, formFields.email, formFields.phoneCountryCode, formFields.phone);
    } else if (checkoutState.activeStep === 2) {
        requiredFields.push(formFields.address, formFields.city, formFields.postalCode);
    } else if (checkoutState.activeStep === 3) {
        requiredFields.push(formFields.cardNumber, formFields.expiryMonth, formFields.expiryYear, formFields.cvv);
    }

    for (const field of requiredFields) {
        if (!field.value.trim()) {
            paymentError.textContent = 'Please complete all required fields in this step.';
            field.focus();
            return false;
        }
    }

    // Step 1: Email validation
    if (checkoutState.activeStep === 1 && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formFields.email.value)) {
        paymentError.textContent = 'Please enter a valid email address.';
        formFields.email.focus();
        return false;
    }

    // Step 1: Phone validation (7-15 digits)
    if (checkoutState.activeStep === 1 && !/^[0-9]{7,15}$/.test(formFields.phone.value.replace(/\s+/g, ''))) {
        paymentError.textContent = 'Please enter a valid phone number (7-15 digits).';
        formFields.phone.focus();
        return false;
    }

    // Step 2: Postal code validation
    if (checkoutState.activeStep === 2 && !/^[0-9]{5,8}$/.test(formFields.postalCode.value)) {
        paymentError.textContent = 'Please enter a valid postal code (5-8 digits).';
        formFields.postalCode.focus();
        return false;
    }

    // Step 3: Credit card validation (exactly 16 digits)
    if (checkoutState.activeStep === 3 && !/^\d{16}$/.test(formFields.cardNumber.value.replace(/\s+/g, ''))) {
        paymentError.textContent = 'Credit card number must be exactly 16 digits.';
        formFields.cardNumber.focus();
        return false;
    }

    // Step 3: Expiration date validation (check against current date)
    if (checkoutState.activeStep === 3) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const selectedYear = parseInt(formFields.expiryYear.value);
        const selectedMonth = parseInt(formFields.expiryMonth.value);

        if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)) {
            paymentError.textContent = 'Card expiration date is in the past.';
            formFields.expiryMonth.focus();
            return false;
        }
    }

    // Step 3: CVV validation (3 or 4 digits)
    if (checkoutState.activeStep === 3 && !/^\d{3,4}$/.test(formFields.cvv.value)) {
        paymentError.textContent = 'CVV must be 3 or 4 digits.';
        formFields.cvv.focus();
        return false;
    }

    return true;
}

function goToStep(step) {
    if (step < 1 || step > 3) return;
    checkoutState.activeStep = step;
    wizardTrack.style.transform = `translateX(-${(step - 1) * 100}%)`;
    showStepButtons();
}

function simulateCheckout() {
    if (!validateCurrentStep()) return;
    paymentError.textContent = 'Processing your payment...';
    confirmOrderButton.disabled = true;
    step3Back.disabled = true;

    window.setTimeout(() => {
        confirmOrderButton.disabled = false;
        step3Back.disabled = false;
        const isSuccess = Math.random() >= 0.25;
        if (!isSuccess) {
            paymentError.textContent = 'Payment failed, please try again.';
            return;
        }

        paymentError.textContent = '';
        wizardTrack.style.display = 'none';
        checkoutResult.classList.remove('hidden');
        closeModalButton.style.display = 'none';
        
        // Clear cart on successful checkout
        cartData = [];
        localStorage.removeItem(CART_KEY);
        localStorage.removeItem(CART_COUNT_KEY);
        renderCartItems();
    }, 1400);
}

checkoutBtn.addEventListener('click', openModal);
closeModalButton.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
step1Next.addEventListener('click', () => {
    if (!validateCurrentStep()) return;
    goToStep(2);
});
step2Back.addEventListener('click', () => goToStep(1));
step2Next.addEventListener('click', () => {
    if (!validateCurrentStep()) return;
    goToStep(3);
});
step3Back.addEventListener('click', () => goToStep(2));
confirmOrderButton.addEventListener('click', () => {
    if (!validateCurrentStep()) return;
    simulateCheckout();
});

document.getElementById('nav-shop-btn')?.addEventListener('click', () => {
    window.location.href = '../products/products.html';
});

document.getElementById('nav-build-btn')?.addEventListener('click', () => {
    window.location.href = '../build/build.html';
});

document.getElementById('nav-about-btn')?.addEventListener('click', () => {
    window.location.href = '../about/about.html';
});

document.getElementById('nav-contact-btn')?.addEventListener('click', () => {
    window.location.href = '../contact/contact.html';
});

applyPromoButton.addEventListener('click', applyPromoCode);
promoCodeInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        applyPromoCode();
    }
});

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !checkoutModal.classList.contains('hidden')) {
        closeModal();
    }
});

window.addEventListener('storage', () => {
    cartData = loadCartData();
    renderCartItems();
});

renderCartItems();
