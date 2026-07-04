if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('pageshow', () => {
    window.scrollTo(0, 0);
});

document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);

    const SHEKEL = '\u20AA';

    // Single source of truth for the builder. The summary, selected cards and cart item all read from this object.
    const state = {
        bundle: null,
        jar: null,
        wax: null,
        scent: null,
        wick: null,
    };

    const bundles = {
        small: { label: 'Small Bundle', price: 110, sizeLabel: 'Small' },
        large: { label: 'Large Bundle', price: 125, sizeLabel: 'Large' },
    };

    const jars = [
        {
            id: 'clean-jar',
            name: 'Clean Jar',
            images: {
                small: '/Assets/more product/jars/classic_jar_small.png',
                large: '/Assets/more product/jars/classic_jar_big.png',
            },
        },
        {
            id: 'enchanted-jar',
            name: 'Enchanted Jar',
            images: {
                small: '/Assets/more product/jars/vintage_jar_small.png',
                large: '/Assets/more product/jars/vintage_jar_big.png',
            },
        },
        {
            id: 'aurora-jar',
            name: 'Aurora Jar',
            images: {
                small: '/Assets/more product/jars/crystal_jar_small.png',
                large: '/Assets/more product/jars/crystal_jar_big.png',
            },
        },
    ];

    const waxColors = [
        { name: 'A Blanket of Snow', img: '/Assets/wax 2/a_blanket_of_snow.jpg' },
        { name: 'Amber Skies', img: '/Assets/wax 2/amber_skies.png' },
        { name: 'Beneath the Sun', img: '/Assets/wax 2/beneath_the_sun.png' },
        { name: 'Black Cat', img: '/Assets/wax 2/black_cat.png' },
        { name: 'Boring Barbie', img: '/Assets/wax 2/boring_barbie.png' },
        { name: 'Burning Red', img: '/Assets/wax 2/burning_red.png' },
        { name: 'Clear Blue Water', img: '/Assets/wax 2/clear_blue_water.png' },
        { name: 'Deep Blue', img: '/Assets/wax 2/deep_blue.png' },
        { name: 'Evergreen', img: '/Assets/wax 2/evergreen.png' },
        { name: 'Flamingo Pink', img: '/Assets/wax 2/flamingo_pink.png' },
        { name: 'Glistening Grass', img: '/Assets/wax 2/glistening_grass.png' },
        { name: 'Indigo Eyes', img: '/Assets/wax 2/indigo_eyes.png' },
        { name: 'Key Lime Green', img: '/Assets/wax 2/key_lime_green.png' },
        { name: 'Knock on Wood', img: '/Assets/wax 2/knock_on_wood.png' },
        { name: 'Light Pink Sky', img: '/Assets/wax 2/light_pink_sky.png' },
        { name: 'Lilach Short Skirt', img: '/Assets/wax 2/lilach_short_skirt.png' },
        { name: 'Maroon', img: '/Assets/wax 2/maroon.png' },
        { name: 'Opalite', img: '/Assets/wax 2/opalite.png' },
        { name: 'Wintergreen Kiss', img: '/Assets/wax 2/wintergreen_kiss.png' },
    ];

    const scents = [
        scent('breakfast-at-midnight', 'Breakfast at Midnight', '/Assets/Scented oils/Breakfast_At_Midnight.png', ['Coffee', 'Maple', 'Warm Pastry', 'Vanilla'], 'Syrup on the counter, coffee still brewing, and absolutely no plans for tomorrow. This is what being young and free smells like - sweet, warm, and just a little reckless. Light this one for the nights that feel infinite.'),
        scent('burnt-toast', 'Burnt Toast', '/Assets/Scented oils/Burnt_Toast.png', ['Toasted Bread', 'Caramel', 'Warm Butter', 'Hint of Smoke'], 'The toast burnt again and neither of you noticed. That is what real love looks like - warm kitchens, unhurried mornings, and someone who makes the ordinary feel like everything. Light this one and stay a little longer.'),
        scent('champagne-problems', 'Champagne Problems', '/Assets/Scented oils/Champagne Problems.png', ['Champagne', 'White Peach', 'Cassis Flower', 'Musk'], 'Effervescent, a little bittersweet, and undeniably glamorous. This one opens like a celebration and lingers like a feeling you cannot quite name. Pop it open and let the room decide how the night ends.'),
        scent('crimson-clover', 'Crimson Clover', '/Assets/Scented oils/Crismson_Clover.png', ['Red Clover', 'Raspberry', 'Rose', 'Fruity Musk'], 'Bold, bruised, and blooming anyway. This is the scent of a love that went to war with itself and still chose to stay - wild at the edges, tender at the core, and more alive for having survived.'),
        scent('crystal-skies', 'Crystal Skies', '/Assets/Scented oils/Crystal_Skies.png', ['Ozone', 'White Cedar', 'Sea Salt', 'Light Musk'], 'Crisp, clear, and impossibly polished - like a smile that knows exactly what it is doing. This one opens bright and breezy, but stay a while. There is always more to the story.'),
        scent('early-spring-snow', 'Early Spring Snow', '/Assets/Scented oils/Early_Spring_Snow.png', ['Cold Air', 'White Tea', 'Lily of the Valley', 'Sheer Musk'], 'Soft, quiet, and deceptively simple - the kind of thing that looks innocent but stays with you long after it is gone. Light this one and let them wonder why they cannot stop thinking about it.'),
        scent('honey', 'Honey', '/Assets/Scented oils/Honey.png', ['Raw Honey', 'Beeswax', 'Soft Florals', 'Warm Vanilla'], 'The same word that used to sting now feels like the softest thing you have ever heard. Warm, golden, and unhurried - this is what it smells like when you finally feel safe with someone.'),
        scent('incense', 'Incense', '/Assets/Scented oils/Incense.png', ['Frankincense', 'Oud', 'Sandalwood', 'Amber'], 'It starts with incense on a vinyl shelf and ends with a feeling you cannot quite shake. Deep, smoky, and intoxicating - the kind of scent that gets into everything and stays there long after you have moved on.'),
        scent('island-breeze', 'Island Breeze', '/Assets/Scented oils/Island_Breeze.png', ['Coconut', 'Mango', 'Sea Salt', 'Tropical Flowers'], 'Bright, juicy and just a little bit secret. This one walks in like it owns the place and smells like the best day you have had all summer. No context needed.'),
        scent('lavender-haze', 'Lavender Haze', '/Assets/Scented oils/Lavender_Haze.png', ['Lavender', 'Vanilla', 'Soft Smoke', 'Tonka Bean'], 'Soft, dreamy and completely intoxicating. The kind of scent you want to wrap yourself in and never leave. Light this one, ignore the world, and stay right where you are.'),
        scent('mahogany-grain', 'Mahogany Grain', '/Assets/Scented oils/Mahogany_Grain.png', ['Mahogany', 'Sandalwood', 'Amber', 'Vetiver'], 'This is what power smells like when it walks into the room. Dark, polished and unapologetically expensive. The kind of scent that closes deals and keeps secrets.'),
        scent('ocean-wave', 'Ocean Wave', '/Assets/Scented oils/Ocean_Wave.png', ['Sea Salt', 'Marine Ozone', 'Sea Foam', 'Driftwood'], 'Wide open and quietly powerful. Like standing at the edge of the water with someone you would face any storm for. Fresh, boundless and completely certain.'),
        scent('old-cardigan', 'Old Cardigan', '/Assets/Scented oils/Old_Cardigan.png', ['Cedar', 'Sandalwood', 'Vanilla', 'Aged Cotton'], 'Worn in, lived in and impossible to throw away. This is the scent of something you keep coming back to without quite knowing why. Familiar, soft and permanently yours.'),
        scent('out-of-the-woods', 'Out Of The Woods', '/Assets/Scented oils/Out_Of_The_Woods.png', ['Pine', 'Cedar', 'Wet Grass', 'Morning Dew'], 'Wild, alive and a little unpredictable. This one smells like running through something you are not sure you will make it out of and loving every second anyway. Fresh, sharp and endlessly hopeful.'),
        scent('pastry', 'Pastry', '/Assets/Scented oils/Pastry.png', ['Vanilla', 'Butter', 'Warm Dough', 'Cane Sugar'], 'Sweet, warm and absolutely unhinged in the best way. The kind of scent you bake when you are nervous, excited and completely certain you are doing the right thing. Grab a fork and speak now.'),
        scent('peppermint-candy', 'Peppermint Candy', '/Assets/Scented oils/Peppermint_Candy.png', ['Peppermint', 'Vanilla', 'Sugar', 'Cool Air'], 'Sweet, bright and picture perfect on the outside. This one smells like the life you almost chose and did not. Crisp, clean and just a little bittersweet.'),
        scent('popcorn', 'Popcorn', '/Assets/Scented oils/Popcorn.png', ['Buttered Popcorn', 'Caramel', 'Sea Salt', 'Vanilla'], 'Light, fun and completely unbothered. This one does not take itself too seriously and honestly that is the whole point. Pop it, enjoy it and do not give it another thought.'),
        scent('pumpkin-patch', 'Pumpkin Patch', '/Assets/Scented oils/Pumpkin_Patch.png', ['Pumpkin', 'Cinnamon', 'Nutmeg', 'Brown Sugar'], 'Warm, golden and smelling like the best autumn day you ever had. Pumpkin, spice and everything that feels like being five years old with nowhere to be and someone who loves you completely.'),
        scent('rose-garden', 'Rose Garden', '/Assets/Scented oils/Rose_Garden.png', ['Damascus Rose', 'Red Peony', 'Green Leaves', 'White Musk'], 'Gorgeous, intoxicating and dangerously addictive. Lush blooms that open like a love story and linger like a warning. You knew exactly what you were getting into and you lit it anyway.'),
        scent('salt-air', 'Salt Air', '/Assets/Scented oils/Salt_Air.png', ['Sea Salt', 'Driftwood', 'Ocean', 'Light Citrus'], 'Salt air, a sun warmed afternoon and a feeling you knew was not yours to keep. Fresh, open and quietly heartbreaking - like a whole summer compressed into one perfect breath.'),
        scent('seven-bars-of-chocolate', 'Seven Bars of Chocolate', '/Assets/Scented oils/Seven_Bars_of_Chocolate.png', ['Dark Chocolate', 'Cacao', 'Caramel', 'Vanilla'], 'Dark, rich and completely excessive in the best possible way. The kind of scent you reach for when you are feeling everything all at once and absolutely zero apologies about it.'),
        scent('sweeter-than-a-peach', 'Sweeter Than a Peach', '/Assets/Scented oils/Sweeter_Than_A_Peach.png', ['Peach', 'Apricot', 'Cream', 'Soft Vanilla'], 'Soft, golden and dangerously innocent. Fresh as a compliment from someone who has seen it all and knows exactly how this story ends. Enjoy it while it lasts, peach.'),
        scent('whiskey-on-ice', 'Whiskey On Ice', '/Assets/Scented oils/Whiskey_On_Ice.png', ['Bourbon', 'Oak', 'Vanilla', 'Iced Air'], 'Smooth, warm and completely disarming. One whiff and suddenly you cannot think straight. This is what it smells like when someone walks into the room and ruins everything in the best possible way.'),
        scent('willow', 'Willow', '/Assets/Scented oils/Willow.png', ['White Willow', 'Rain', 'Green Leaves', 'Soft Musk'], 'Soft, a little mysterious and impossible to resist. This one wraps around you like something ancient and knowing. Light it and let whatever magic needs to happen, happen.'),
        scent('wine-stained-dress', 'Wine Stained Dress', '/Assets/Scented oils/Wine Stained Dress.png', ['Red Wine', 'Dark Cherry', 'Amber', 'Wood'], 'Rich, deep and tinged with something you are finally ready to let go of. This one smells like the last night before everything changed - and the quiet, unexpected freedom of the morning after.'),
        scent('wisteria', 'Wisteria', '/Assets/Scented oils/Wisteria.png', ['Wisteria', 'Violet', 'White Wood', 'Soft Musk'], 'Dreamy, overgrown and hauntingly beautiful. This is the scent of wanting to disappear somewhere quiet with someone you love and never be found. Romantic in the most melancholy and literary way possible.'),
    ];

    const wicks = [
        { id: 'cotton-wick', name: 'Cotton Wicks', img: '/Assets/more product/cotton_wick.png', extra: 0 },
        { id: 'wooden-wick', name: 'Wooden Wicks', img: '/Assets/more product/wooden_wick_standing.png', extra: 5 },
    ];

    renderOptions();
    bindNavigation();
    bindBuilder();
    updateCartBadge();
    updateSummary();

    function scent(id, name, img, materials, desc) {
        return { id, name, img, materials, desc };
    }

    function renderOptions() {
        // Options are rendered from data arrays so the same selection logic can handle jars, wax, scents and wicks.
        document.getElementById('jar-options').innerHTML = jars.map(item => optionMarkup('jar', item, getJarImage(item))).join('');
        document.getElementById('wax-options').innerHTML = waxColors.map(item => optionMarkup('wax', item, item.img)).join('');
        document.getElementById('scent-options').innerHTML = scents.map(item => `
            <article class="option-card" data-type="scent" data-id="${item.id}" tabindex="0">
                <div class="scent-image-wrap">
                    <img src="${item.img}" alt="${item.name}">
                    <p class="mobile-scent-story-overlay">${item.desc}</p>
                    <button type="button" class="mobile-description-toggle">Read scent story</button>
                </div>
                <div class="option-card-body">
                    <h4>${item.name}</h4>
                    <div class="material-tags">${item.materials.map(material => `<span>${material}</span>`).join('')}</div>
                    <button type="button" class="description-toggle">Read scent story</button>
                    <p class="scent-description">${item.desc}</p>
                </div>
            </article>
        `).join('');
        document.getElementById('wick-options').innerHTML = wicks.map(item => `
            <article class="option-card" data-type="wick" data-id="${item.id}" tabindex="0">
                <img src="${item.img}" alt="${item.name}">
                <div class="option-card-body">
                    <h4>${item.name}</h4>
                    ${item.extra ? `<p class="wick-extra">+${SHEKEL}${item.extra}</p>` : ''}
                </div>
            </article>
        `).join('');
    }

    function optionMarkup(type, item, img) {
        return `
            <article class="option-card" data-type="${type}" data-id="${item.id || item.name}" tabindex="0">
                <img src="${img}" alt="${item.name}">
                <div class="option-card-body">
                    <h4>${item.name}</h4>
                </div>
            </article>
        `;
    }

    function bindNavigation() {
        document.getElementById('nav-shop-btn')?.addEventListener('click', () => {
            window.location.href = '../products/products.html';
        });
        document.getElementById('nav-build-btn')?.addEventListener('click', event => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        document.getElementById('nav-about-btn')?.addEventListener('click', () => {
            window.location.href = '../about/about.html';
        });
        document.getElementById('nav-contact-btn')?.addEventListener('click', () => {
            window.location.href = '../contact/contact.html';
        });
        document.querySelector('header button[aria-label="Cart"]')?.addEventListener('click', () => {
            window.location.href = '../cart/cart.html';
        });
    }

    function bindBuilder() {
        document.querySelectorAll('.bundle-card').forEach(button => {
            button.addEventListener('click', () => selectBundle(button.dataset.bundle));
        });

        document.querySelectorAll('.step-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const step = toggle.closest('.builder-step');
                toggleStep(step.dataset.step);
            });
        });

        document.querySelector('.builder-steps').addEventListener('click', event => {
            const detailsButton = event.target.closest('.description-toggle, .mobile-description-toggle');
            if (detailsButton) {
                event.stopPropagation();
                const card = detailsButton.closest('.option-card');
                card.classList.toggle('show-description');
                card.querySelectorAll('.description-toggle, .mobile-description-toggle').forEach(button => {
                    button.textContent = card.classList.contains('show-description') ? 'Hide scent story' : 'Read scent story';
                });
                return;
            }

            const card = event.target.closest('.option-card');
            if (card) selectOption(card.dataset.type, card.dataset.id);
        });

        document.querySelector('.builder-steps').addEventListener('keydown', event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            const card = event.target.closest('.option-card');
            if (!card) return;
            event.preventDefault();
            selectOption(card.dataset.type, card.dataset.id);
        });

        document.querySelectorAll('.next-step').forEach(button => {
            button.addEventListener('click', () => goNext(button));
        });

        document.getElementById('reset-builder').addEventListener('click', resetBuilder);
        document.getElementById('add-bundle-to-cart').addEventListener('click', addBundleToCart);
    }

    function selectBundle(bundleId) {
        state.bundle = bundles[bundleId];
        document.querySelectorAll('.bundle-card').forEach(button => {
            const selected = button.dataset.bundle === bundleId;
            button.classList.toggle('selected', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
        renderOptions();
        clearMessages();
        updateSelectedCards();
        updateSummary();
        setOpenStep('jar');
    }

    function selectOption(type, id) {
        if (!state.bundle) {
            showBuilderError('Choose a bundle size first.');
            return;
        }

        // Every section allows exactly one selected item, so replacing state[type] is enough to update the choice.
        const collection = { jar: jars, wax: waxColors, scent: scents, wick: wicks }[type];
        state[type] = collection.find(item => String(item.id || item.name) === String(id)) || null;
        clearMessages();
        updateSelectedCards();
        updateSummary();
        scrollToStepActions(type);
    }

    function goNext(button) {
        const currentStep = button.closest('.builder-step').dataset.step;
        if (!state[currentStep]) {
            document.getElementById(`${currentStep}-message`).textContent = 'Please choose a bundle option before continuing.';
            return;
        }
        clearMessages();
        const next = button.dataset.next;
        if (next === 'done') {
            setOpenStep(null);
            return;
        }
        transitionToStep(next);
    }

    function setOpenStep(stepName) {
        document.querySelectorAll('.builder-step').forEach(step => {
            const isOpen = step.dataset.step === stepName;
            step.classList.toggle('open', isOpen);
            step.querySelector('.step-toggle').setAttribute('aria-expanded', String(isOpen));
        });
    }

    function toggleStep(stepName) {
        const step = document.querySelector(`.builder-step[data-step="${stepName}"]`);
        if (!step) return;
        setOpenStep(step.classList.contains('open') ? null : stepName);
    }

    function transitionToStep(stepName) {
        if (!stepName) return;
        setOpenStep(stepName);
        window.setTimeout(() => {
            // Wait for the accordion animation before scrolling, otherwise the browser may scroll to the old layout.
            document.querySelector(`.builder-step[data-step="${stepName}"] .step-toggle`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }, 220);
    }

    function scrollToStepActions(stepName) {
        const actions = document.querySelector(`.builder-step[data-step="${stepName}"] .step-actions`);
        if (!actions) return;
        const scrollToActions = () => {
            actions.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        };
        window.requestAnimationFrame(() => window.setTimeout(scrollToActions, 160));
        window.setTimeout(scrollToActions, 460);
    }

    function updateSelectedCards() {
        document.querySelectorAll('.option-card').forEach(card => {
            const selected = state[card.dataset.type];
            card.classList.toggle('selected', Boolean(selected && String(selected.id || selected.name) === card.dataset.id));
        });
    }

    function updateSummary() {
        const total = calculateTotal();
        document.getElementById('summary-bundle').textContent = state.bundle ? state.bundle.label : 'Choose a bundle';
        document.getElementById('summary-jar').textContent = state.jar ? state.jar.name : 'Not chosen yet';
        document.getElementById('summary-wax').textContent = state.wax ? state.wax.name : 'Not chosen yet';
        document.getElementById('summary-scent').textContent = state.scent ? state.scent.name : 'Not chosen yet';
        document.getElementById('summary-wick').textContent = state.wick ? state.wick.name : 'Not chosen yet';
        document.getElementById('summary-total').textContent = `${SHEKEL}${total}`;
        document.getElementById('add-bundle-to-cart').disabled = !isComplete();
    }

    function calculateTotal() {
        return (state.bundle?.price || 0) + (state.wick?.extra || 0);
    }

    function isComplete() {
        return Boolean(state.bundle && state.jar && state.wax && state.scent && state.wick);
    }

    function resetBuilder() {
        state.bundle = null;
        state.jar = null;
        state.wax = null;
        state.scent = null;
        state.wick = null;
        document.querySelectorAll('.bundle-card').forEach(button => {
            button.classList.remove('selected');
            button.setAttribute('aria-pressed', 'false');
        });
        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.remove('selected', 'show-description');
        });
        document.querySelectorAll('.description-toggle, .mobile-description-toggle').forEach(button => {
            button.textContent = 'Read scent story';
        });
        clearMessages();
        updateSummary();
        setOpenStep(null);
        showToast('Choices reset.');
    }

    function addBundleToCart() {
        if (!isComplete()) {
            showBuilderError('Choose a bundle, jar, wax color, scent and wick before adding to cart.');
            return;
        }

        const cart = getCart();
        const image = getJarImage(state.jar);
        const name = `${state.bundle.label}: ${state.jar.name}, ${state.wax.name}, ${state.scent.name}, ${state.wick.name}`;
        const id = `bundle-${Date.now()}`;

        // Store bundleDetails separately so the cart can display clean choice badges instead of one long title.
        cart.push({
            id,
            name,
            price: calculateTotal(),
            image,
            qty: 1,
            type: 'candle-bundle',
            bundleDetails: {
                size: state.bundle.label,
                jar: state.jar.name,
                wax: state.wax.name,
                scent: state.scent.name,
                wick: state.wick.name,
            },
        });
        saveCart(cart);
        updateCartBadge();
        showToast('Candle bundle added to cart.');
        showCartChoicePopup();
    }

    function showCartChoicePopup() {
        const overlay = document.createElement('div');
        overlay.id = 'ww-cart-choice-overlay';
        overlay.innerHTML = `
            <div id="ww-cart-choice-dialog">
                <h2>Wicked choice, what's next?</h2>
                <div class="ww-cart-choice-actions">
                    <button type="button" class="ww-cart-choice-btn ww-cart-choice-cart">Go to cart</button>
                    <button type="button" class="ww-cart-choice-btn ww-cart-choice-products">Go to products</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        const closePopup = () => {
            document.body.style.overflow = '';
            overlay.remove();
            document.removeEventListener('keydown', handleKeydown);
        };

        const handleKeydown = event => {
            if (event.key === 'Escape') closePopup();
        };

        overlay.addEventListener('click', event => {
            if (event.target === overlay) closePopup();
        });

        overlay.querySelector('.ww-cart-choice-cart')?.addEventListener('click', () => {
            window.location.href = '../cart/cart.html';
        });
        overlay.querySelector('.ww-cart-choice-products')?.addEventListener('click', () => {
            window.location.href = '../products/products.html';
        });
        document.addEventListener('keydown', handleKeydown);
    }

    function getJarImage(jar) {
        const size = state.bundle?.sizeLabel.toLowerCase() || 'large';
        return jar.images[size] || jar.images.large;
    }

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('ww_cart') || '[]');
        } catch {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem('ww_cart', JSON.stringify(cart));
        localStorage.setItem('ww_cart_count', String(cart.reduce((sum, item) => sum + Number(item.qty || 1), 0)));
    }

    function updateCartBadge() {
        const cartBtn = document.querySelector('header button[aria-label="Cart"]');
        if (!cartBtn) return;
        const count = getCart().reduce((sum, item) => sum + Number(item.qty || 1), 0);
        let badge = cartBtn.querySelector('#cart-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'cart-badge';
            cartBtn.appendChild(badge);
        }
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }

    function showBuilderError(message) {
        const error = document.getElementById('builder-error');
        error.textContent = message;
        window.setTimeout(() => {
            if (error.textContent === message) error.textContent = '';
        }, 3000);
    }

    function clearMessages() {
        document.querySelectorAll('.step-message, .builder-error').forEach(message => {
            message.textContent = '';
        });
    }

    function showToast(message) {
        let toast = document.getElementById('ww-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'ww-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('show'), 2400);
    }
});
