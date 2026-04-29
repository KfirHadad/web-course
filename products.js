/* ============================================
   WICKED WAX — products.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ======== DOM References ======== */
    const grid             = document.getElementById('products-grid');
    const searchInput      = document.getElementById('search-input');
    const sortSelect       = document.getElementById('sort-select');
    const catBtns          = document.querySelectorAll('.cat-btn');
    const sidebarCatChecks = document.querySelectorAll('.sidebar-cat-check');
    const countNum         = document.getElementById('count-num');
    const noResults        = document.getElementById('no-results');
    const clearBtn         = document.getElementById('clear-filters-btn');
    const cartBtn          = document.querySelector('header button[aria-label="Cart"]');

    let activeCategories = new Set();

    /* ======== Wax Colour Image Map ======== */
    const waxColorImages = {
        'A Blanket of Snow':  { bag: 'Assets/wax bags/A_Blanket_of_Snow_bag.png',  full: 'Assets/wax 2/a_blanket_of_snow.jpg',  swatch: '#F0EDE8' },
        'Amber Skies':        { bag: 'Assets/wax bags/Amber_Skies_bag.png',         full: 'Assets/wax 2/amber_skies.png',         swatch: '#E8A640' },
        'Beneath the Sun':    { bag: 'Assets/wax bags/Beneath_the_Sun_bag.png',     full: 'Assets/wax 2/beneath_the_sun.png',     swatch: '#F2C84C' },
        'Black Cat':          { bag: 'Assets/wax bags/Black_Cat_bag.png',           full: 'Assets/wax 2/black_cat.png',           swatch: '#1C1C1E' },
        'Boring Barbie':      { bag: 'Assets/wax bags/Boring_Barbie_bag.png',       full: 'Assets/wax 2/boring_barbie.png',       swatch: '#E96BAF' },
        'Burning Red':        { bag: 'Assets/wax bags/Burning_Red_bag.png',         full: 'Assets/wax 2/burning_red.png',         swatch: '#BF3A2B' },
        'Clear Blue Water':   { bag: 'Assets/wax bags/Clear_Blue_Water_bag.png',    full: 'Assets/wax 2/clear_blue_water.png',    swatch: '#5BC4D8' },
        'Deep Blue':          { bag: 'Assets/wax bags/Deep_Blue_bag.png',           full: 'Assets/wax 2/deep_blue.png',           swatch: '#2C3E6B' },
        'Evergreen':          { bag: 'Assets/wax bags/Evergreen_bag.png',           full: 'Assets/wax 2/evergreen.png',           swatch: '#2D5A3D' },
        'Flamingo Pink':      { bag: 'Assets/wax bags/flamingo_pink_bag.png',       full: 'Assets/wax 2/flamingo_pink.png',       swatch: '#F78CB2' },
        'Glistening Grass':   { bag: 'Assets/wax bags/Glistening_Grass_bag.png',    full: 'Assets/wax 2/glistening_grass.png',    swatch: '#6BBF59' },
        'Indigo Eyes':        { bag: 'Assets/wax bags/Indigo_Eyes_bag.png',         full: 'Assets/wax 2/indigo_eyes.png',         swatch: '#4A3F7A' },
        'Key Lime Green':     { bag: 'Assets/wax bags/Key_Lime_Green_bag.png',      full: 'Assets/wax 2/key_lime_green.png',      swatch: '#8DC654' },
        'Knock on Wood':      { bag: 'Assets/wax bags/Knock_on_Wood_bag.png',       full: 'Assets/wax 2/knock_on_wood.png',       swatch: '#8B5A2B' },
        'Light Pink Sky':     { bag: 'Assets/wax bags/Light_Pink_Sky_bag.png',      full: 'Assets/wax 2/light_pink_sky.png',      swatch: '#F5C4CB' },
        'Lilach Short Skirt': { bag: 'Assets/wax bags/Lilach_Short_Skirt_bag.png',  full: 'Assets/wax 2/lilach_short_skirt.png',  swatch: '#A47BBF' },
        'Maroon':             { bag: 'Assets/wax bags/Maroon_bag.png',              full: 'Assets/wax 2/maroon.png',              swatch: '#7B2D2D' },
        'Opalite':            { bag: 'Assets/wax bags/Opalite_bag.png',             full: 'Assets/wax 2/opalite.png',             swatch: '#C8E8D8' },
        'Wintergreen Kiss':   { bag: 'Assets/wax bags/Wintergreen_Kiss_bag.png',    full: 'Assets/wax 2/wintergreen_kiss.png',    swatch: '#3D9B7A' },
    };

    /* ======== Products Data ======== */
    const productsData = {

        'soy-wax': {
            id: 'soy-wax', name: 'Premium Soy Wax', price: 40, bestSeller: true,
            category: 'wax', categoryLabel: 'Wax',
            img: 'Assets/wax bags/A_Blanket_of_Snow_bag.png',
            hoverImg: 'Assets/wax 2/a_blanket_of_snow.jpg',
            desc: '100% natural soy wax in 19 hand-picked shades. Clean burning, beginner-friendly and endlessly customizable.',
            detail: '1kg Bag',
            colors: [
                'A Blanket of Snow','Amber Skies','Beneath the Sun','Black Cat',
                'Boring Barbie','Burning Red','Clear Blue Water','Deep Blue',
                'Evergreen','Flamingo Pink','Glistening Grass','Indigo Eyes',
                'Key Lime Green','Knock on Wood','Light Pink Sky','Lilach Short Skirt',
                'Maroon','Opalite','Wintergreen Kiss',
            ],
        },

        'breakfast-at-midnight': {
            id: 'breakfast-at-midnight', name: 'Breakfast at Midnight', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Breakfast_At_Midnight.png',
            hoverImg: 'Assets/Scented oils back/Breakfast_at_midnight_back.png',
            desc: 'Syrup on the counter, coffee still brewing, and absolutely no plans for tomorrow. This is what being young and free smells like — sweet, warm, and just a little reckless. Light this one for the nights that feel infinite.',
            materials: ['Coffee', 'Maple', 'Warm Pastry', 'Vanilla'],
        },

        'burnt-toast': {
            id: 'burnt-toast', name: 'Burnt Toast', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Burnt_Toast.png',
            hoverImg: 'Assets/Scented oils back/burnt_toast_back.png',
            desc: 'The toast burnt again and neither of you noticed. That\'s what real love looks like — warm kitchens, unhurried mornings, and someone who makes the ordinary feel like everything. Light this one and stay a little longer.',
            materials: ['Toasted Bread', 'Caramel', 'Warm Butter', 'Hint of Smoke'],
        },

        'champagne-problems': {
            id: 'champagne-problems', name: 'Champagne Problems', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Champagne Problems.png',
            hoverImg: 'Assets/Scented oils back/champagne_problems_back.png',
            desc: 'Effervescent, a little bittersweet, and undeniably glamorous. This one opens like a celebration and lingers like a feeling you can\'t quite name. Pop it open and let the room decide how the night ends.',
            materials: ['Champagne', 'White Peach', 'Cassis Flower', 'Musk'],
        },

        'crimson-clover': {
            id: 'crimson-clover', name: 'Crimson Clover', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Crismson_Clover.png',
            hoverImg: 'Assets/Scented oils back/crimson_clover_back.png',
            desc: 'Bold, bruised, and blooming anyway. This is the scent of a love that went to war with itself and still chose to stay — wild at the edges, tender at the core, and more alive for having survived.',
            materials: ['Red Clover', 'Raspberry', 'Rose', 'Fruity Musk'],
        },

        'crystal-skies': {
            id: 'crystal-skies', name: 'Crystal Skies', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Crystal_Skies.png',
            hoverImg: 'Assets/Scented oils back/Crystal_skies_back.png',
            desc: 'Crisp, clear, and impossibly polished — like a smile that knows exactly what it\'s doing. This one opens bright and breezy, but stay a while. There\'s always more to the story.',
            materials: ['Ozone', 'White Cedar', 'Sea Salt', 'Light Musk'],
        },

        'early-spring-snow': {
            id: 'early-spring-snow', name: 'Early Spring Snow', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Early_Spring_Snow.png',
            hoverImg: 'Assets/Scented oils back/early_spring_snow_back.png',
            desc: 'Soft, quiet, and deceptively simple — the kind of thing that looks innocent but stays with you long after it\'s gone. Light this one and let them wonder why they can\'t stop thinking about it.',
            materials: ['Cold Air', 'White Tea', 'Lily of the Valley', 'Sheer Musk'],
        },

        'honey': {
            id: 'honey', name: 'Honey', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Honey.png',
            hoverImg: 'Assets/Scented oils back/honey_back.png',
            desc: 'The same word that used to sting now feels like the softest thing you\'ve ever heard. Warm, golden, and unhurried — this is what it smells like when you finally feel safe with someone.',
            materials: ['Raw Honey', 'Beeswax', 'Soft Florals', 'Warm Vanilla'],
        },

        'incense': {
            id: 'incense', name: 'Incense', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Incense.png',
            hoverImg: 'Assets/Scented oils back/incense_back.png',
            desc: 'It starts with incense on a vinyl shelf and ends with a feeling you can\'t quite shake. Deep, smoky, and intoxicating — the kind of scent that gets into everything and stays there long after you\'ve moved on.',
            materials: ['Frankincense', 'Oud', 'Sandalwood', 'Amber'],
        },

        'island-breeze': {
            id: 'island-breeze', name: 'Island Breeze', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Island_Breeze.png',
            hoverImg: 'Assets/Scented oils back/island_breeze.png',
            desc: 'Bright, juicy and just a little bit secret. This one walks in like it owns the place and smells like the best day you\'ve had all summer. No context needed.',
            materials: ['Coconut', 'Mango', 'Sea Salt', 'Tropical Flowers'],
        },

        'lavender-haze': {
            id: 'lavender-haze', name: 'Lavender Haze', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Lavender_Haze.png',
            hoverImg: 'Assets/Scented oils back/lavender_haze_back.png',
            desc: 'Soft, dreamy and completely intoxicating. The kind of scent you want to wrap yourself in and never leave. Light this one, ignore the world, and stay right where you are.',
            materials: ['Lavender', 'Vanilla', 'Soft Smoke', 'Tonka Bean'],
        },

        'mahogany-grain': {
            id: 'mahogany-grain', name: 'Mahogany Grain', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Mahogany_Grain.png',
            hoverImg: 'Assets/Scented oils back/mahogany_grain_back.png',
            desc: 'This is what power smells like when it walks into the room. Dark, polished and unapologetically expensive. The kind of scent that closes deals and keeps secrets.',
            materials: ['Mahogany', 'Sandalwood', 'Amber', 'Vetiver'],
        },

        'ocean-wave': {
            id: 'ocean-wave', name: 'Ocean Wave', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Ocean_Wave.png',
            hoverImg: 'Assets/Scented oils back/ocean_wave_back.png',
            desc: 'Wide open and quietly powerful. Like standing at the edge of the water with someone you\'d face any storm for. Fresh, boundless and completely certain.',
            materials: ['Sea Salt', 'Marine Ozone', 'Sea Foam', 'Driftwood'],
        },

        'old-cardigan': {
            id: 'old-cardigan', name: 'Old Cardigan', price: 45, bestSeller: true,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Old_Cardigan.png',
            hoverImg: 'Assets/Scented oils back/old_cardigan_back.png',
            desc: 'Worn in, lived in and impossible to throw away. This is the scent of something you keep coming back to without quite knowing why. Familiar, soft and permanently yours.',
            materials: ['Cedar', 'Sandalwood', 'Vanilla', 'Aged Cotton'],
        },

        'out-of-the-woods': {
            id: 'out-of-the-woods', name: 'Out Of The Woods', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Out_Of_The_Woods.png',
            hoverImg: 'Assets/Scented oils back/out_of_the_woods_back.png',
            desc: 'Wild, alive and a little unpredictable. This one smells like running through something you\'re not sure you\'ll make it out of and loving every second anyway. Fresh, sharp and endlessly hopeful.',
            materials: ['Pine', 'Cedar', 'Wet Grass', 'Morning Dew'],
        },

        'pastry': {
            id: 'pastry', name: 'Pastry', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Pastry.png',
            hoverImg: 'Assets/Scented oils back/pastry_back.png',
            desc: 'Sweet, warm and absolutely unhinged in the best way. The kind of scent you bake when you\'re nervous, excited and completely certain you\'re doing the right thing. Grab a fork and speak now.',
            materials: ['Vanilla', 'Butter', 'Warm Dough', 'Cane Sugar'],
        },

        'peppermint-candy': {
            id: 'peppermint-candy', name: 'Peppermint Candy', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Peppermint_Candy.png',
            hoverImg: 'Assets/Scented oils back/peppermint_candy_back.png',
            desc: 'Sweet, bright and picture perfect on the outside. This one smells like the life you almost chose and didn\'t. Crisp, clean and just a little bittersweet.',
            materials: ['Peppermint', 'Vanilla', 'Sugar', 'Cool Air'],
        },

        'popcorn': {
            id: 'popcorn', name: 'Popcorn', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Popcorn.png',
            hoverImg: 'Assets/Scented oils back/popcorn_back.png',
            desc: 'Light, fun and completely unbothered. This one doesn\'t take itself too seriously and honestly that\'s the whole point. Pop it, enjoy it and don\'t give it another thought.',
            materials: ['Buttered Popcorn', 'Caramel', 'Sea Salt', 'Vanilla'],
        },

        'pumpkin-patch': {
            id: 'pumpkin-patch', name: 'Pumpkin Patch', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Pumpkin_Patch.png',
            hoverImg: 'Assets/Scented oils back/pumpkin_patch_back.png',
            desc: 'Warm, golden and smelling like the best autumn day you ever had. Pumpkin, spice and everything that feels like being five years old with nowhere to be and someone who loves you completely.',
            materials: ['Pumpkin', 'Cinnamon', 'Nutmeg', 'Brown Sugar'],
        },

        'rose-garden': {
            id: 'rose-garden', name: 'Rose Garden', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Rose_Garden.png',
            hoverImg: 'Assets/Scented oils back/rose_garden_back.png',
            desc: 'Gorgeous, intoxicating and dangerously addictive. Lush blooms that open like a love story and linger like a warning. You knew exactly what you were getting into and you lit it anyway.',
            materials: ['Damascus Rose', 'Red Peony', 'Green Leaves', 'White Musk'],
        },

        'salt-air': {
            id: 'salt-air', name: 'Salt Air', price: 45, bestSeller: true,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Salt_Air.png',
            hoverImg: 'Assets/Scented oils back/salt_air_back.png',
            desc: 'Salt air, a sun warmed afternoon and a feeling you knew wasn\'t yours to keep. Fresh, open and quietly heartbreaking — like a whole summer compressed into one perfect breath.',
            materials: ['Sea Salt', 'Driftwood', 'Ocean', 'Light Citrus'],
        },

        'seven-bars-of-chocolate': {
            id: 'seven-bars-of-chocolate', name: 'Seven Bars of Chocolate', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Seven_Bars_of_Chocolate.png',
            hoverImg: 'Assets/Scented oils back/seven_bars_of_chocolate_back.png',
            desc: 'Dark, rich and completely excessive in the best possible way. The kind of scent you reach for when you\'re feeling everything all at once and absolutely zero apologies about it.',
            materials: ['Dark Chocolate', 'Cacao', 'Caramel', 'Vanilla'],
        },

        'sweeter-than-a-peach': {
            id: 'sweeter-than-a-peach', name: 'Sweeter Than a Peach', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Sweeter_Than_A_Peach.png',
            hoverImg: 'Assets/Scented oils back/sweeter_than_a_peach_back.png',
            desc: 'Soft, golden and dangerously innocent. Fresh as a compliment from someone who\'s seen it all and knows exactly how this story ends. Enjoy it while it lasts, peach.',
            materials: ['Peach', 'Apricot', 'Cream', 'Soft Vanilla'],
        },

        'whiskey-on-ice': {
            id: 'whiskey-on-ice', name: 'Whiskey On Ice', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Whiskey_On_Ice.png',
            hoverImg: 'Assets/Scented oils back/whiskey_on_ice_back.png',
            desc: 'Smooth, warm and completely disarming. One whiff and suddenly you can\'t think straight. This is what it smells like when someone walks into the room and ruins everything in the best possible way.',
            materials: ['Bourbon', 'Oak', 'Vanilla', 'Iced Air'],
        },

        'willow': {
            id: 'willow', name: 'Willow', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Willow.png',
            hoverImg: 'Assets/Scented oils back/willow_back.png',
            desc: 'Soft, a little mysterious and impossible to resist. This one wraps around you like something ancient and knowing. Light it and let whatever magic needs to happen, happen.',
            materials: ['White Willow', 'Rain', 'Green Leaves', 'Soft Musk'],
        },

        'wine-stained-dress': {
            id: 'wine-stained-dress', name: 'Wine Stained Dress', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Wine Stained Dress.png',
            hoverImg: 'Assets/Scented oils back/wine_stained_dress_back.png',
            desc: 'Rich, deep and tinged with something you\'re finally ready to let go of. This one smells like the last night before everything changed — and the quiet, unexpected freedom of the morning after.',
            materials: ['Red Wine', 'Dark Cherry', 'Amber', 'Wood'],
        },

        'wisteria': {
            id: 'wisteria', name: 'Wisteria', price: 45,
            category: 'fragrance-oils', categoryLabel: 'Fragrance Oil',
            img: 'Assets/Scented oils/Wisteria.png',
            hoverImg: 'Assets/Scented oils back/wisteria_back.png',
            desc: 'Dreamy, overgrown and hauntingly beautiful. This is the scent of wanting to disappear somewhere quiet with someone you love and never be found. Romantic in the most melancholy and literary way possible.',
            materials: ['Wisteria', 'Violet', 'White Wood', 'Soft Musk'],
        },

        /* ---- Candle Decor ---- */
        'crowns': {
            id: 'crowns', name: 'We All Got Crowns Decor', price: 35,
            category: 'candle-decor', categoryLabel: 'Candle Decor',
            img: 'Assets/candle decor/crowns_packed.png',
            hoverImg: 'Assets/candle decor/crowns_in_candle.png',
            extraImg: 'Assets/candle decor/crowns_satin.png',
            desc: 'Drop a crown in your candle and remind the room exactly who they\'re dealing with.',
        },

        'flowers': {
            id: 'flowers', name: 'Lovely Bouquet Decor', price: 25, bestSeller: true,
            category: 'candle-decor', categoryLabel: 'Candle Decor',
            img: 'Assets/candle decor/flowers_packed.png',
            hoverImg: 'Assets/candle decor/flowers_in_candle.png',
            extraImg: 'Assets/candle decor/flowers_satin.png',
            desc: 'Every showgirl deserves flowers. Press the Lovely Bouquet into the wax while it\'s still warm and let your candle take its final bow in style.',
        },

        'glitter': {
            id: 'glitter', name: 'Cloud of Sparkling Dust Decor', price: 15,
            category: 'candle-decor', categoryLabel: 'Candle Decor',
            img: 'Assets/candle decor/glitter_packed.png',
            hoverImg: 'Assets/candle decor/glitter_in_candle.png',
            desc: 'Desperate, glittering, completely unhinged. Dust your candle with this and let it be as extra as you feel right now. No further explanation needed.',
        },

        'mirrorball': {
            id: 'mirrorball', name: 'Mirrorball Decor', price: 35,
            category: 'candle-decor', categoryLabel: 'Candle Decor',
            img: 'Assets/candle decor/mirrorball_packed.png',
            hoverImg: 'Assets/candle decor/mirrorball_in_candle.png',
            extraImg: 'Assets/candle decor/mirrorball_satin.png',
            desc: 'Flexible. Gleaming. Ready to reflect whatever light you give it. These little disco gems turn any candle into the life of the party.',
        },

        'pearls': {
            id: 'pearls', name: 'Pearls of Wisdom Decor', price: 30,
            category: 'candle-decor', categoryLabel: 'Candle Decor',
            img: 'Assets/candle decor/pearls_packed.png',
            hoverImg: 'Assets/candle decor/pearls_in_candle.png',
            extraImg: 'Assets/candle decor/pearls_satin.png',
            desc: 'The curtain may close but the pearls stay on. Scatter them across your candle and make something that looks like it belongs backstage at the most glamorous show in town.',
        },

        'stars': {
            id: 'stars', name: 'Wishing on a Falling Star Decor', price: 25,
            category: 'candle-decor', categoryLabel: 'Candle Decor',
            img: 'Assets/candle decor/starts_packed.png',
            hoverImg: 'Assets/candle decor/stars_in_candle.png',
            extraImg: 'Assets/candle decor/stars_satin.png',
            desc: 'Bad signs are all good when you\'ve got this kind of luck. Scatter these across your wax and knock on wood — because some things are just too good not to celebrate.',
        },

        /* ---- Wicks ---- */
        'cotton-wick': {
            id: 'cotton-wick', name: 'Cotton Wick Kit', price: 40, bestSeller: true,
            category: 'wicks', categoryLabel: 'Wick',
            img: 'Assets/more product/cotton_wick.png',
            hoverImg: 'Assets/more product/cotton_wick_burning.png',
            extraImg: 'Assets/more product/cotton_wick_kit.png',
            extraImg2: 'Assets/more product/cotton_wick_notburning.png',
            desc: 'Every flame tells a story — and yours starts here.<br><br>Our pre-waxed cotton wicks are the quiet heart of every candle you\'ll ever make. Braided to burn slowly and cleanly, they hold their shape with grace and light up your creations with a soft, steady glow that feels almost like magic.<br><br>Each kit comes with everything you need to begin your candle-making ritual: 50 pre-tabbed cotton wicks, a set of wooden wick centering bars to keep everything perfectly in place while your wax sets, and adhesive dot stickers to anchor your wick to the bottom of any jar. No guesswork, no wobbling, no chaos — just you, your wax, and a little bit of intention.<br><br>Whether you\'re pouring your very first candle or your fiftieth, this kit makes the process feel exactly the way it should: effortless, lovely, and a little bit enchanted.',
            detail: '50 wicks per kit · Compatible with all jar sizes',
        },

        'wooden-wick': {
            id: 'wooden-wick', name: 'Wooden Wick Kit', price: 50,
            category: 'wicks', categoryLabel: 'Wick',
            img: 'Assets/more product/wooden_wick_standing.png',
            hoverImg: 'Assets/more product/wooden_wick_notburning.png',
            extraImg: 'Assets/more product/wooden_wick_kit.png',
            extraImg2: 'Assets/more product/wooden_wick_burning.png',
            desc: 'Close your eyes. Light a match. Listen.<br><br>That soft, gentle crackle — like a fireplace on a rainy evening, like a secret whispered by the woods — that\'s what a wooden wick brings to every candle you make. It\'s not just a wick. It\'s an atmosphere.<br><br>Our natural wooden wicks are cut from real wood and burn with a warm, wide flame that feels almost alive. They don\'t just light your candle — they give it a soul.<br><br>Each kit contains everything you need to bring that magic to life: 30 wooden wicks with metal sustainer clips already attached, plus adhesive dot stickers to fix them perfectly in place while you pour. Simple, beautiful, and ready for you.<br><br>Whether you\'re crafting a single jar for yourself or a whole collection as gifts, this kit turns the making into a moment worth savoring.',
            detail: '30 wicks per kit · Compatible with all jar sizes',
        },

        /* ---- Jars ---- */
        'clean-jar': {
            id: 'clean-jar', name: 'Clean Jar', price: 21,
            category: 'jars', categoryLabel: 'Jar',
            img: 'Assets/more product/jars/classic_jar_small.png',
            hoverImg: 'Assets/more product/jars/classic_jar_small_candle.png',
            desc: 'Clean lines, clear glass, and a quiet elegance that never goes out of style. This is the jar that lets your wax, your scent, and your creativity take center stage — no distractions, just light.',
            sizes: [
                { label: 'Small', capacity: '230g', price: 21, img: 'Assets/more product/jars/classic_jar_small.png', hoverImg: 'Assets/more product/jars/classic_jar_small_candle.png' },
                { label: 'Large', capacity: '420g', price: 31, img: 'Assets/more product/jars/classic_jar_big.png',   hoverImg: 'Assets/more product/jars/classic_jar_big_candle.png' },
            ],
        },

        'enchanted-jar': {
            id: 'enchanted-jar', name: 'Enchanted Jar', price: 29, bestSeller: true,
            category: 'jars', categoryLabel: 'Jar',
            img: 'Assets/more product/jars/vintage_jar_small.png',
            hoverImg: 'Assets/more product/jars/vintage_jar_small_candle.png',
            desc: 'Ridged, textured, and impossibly charming — this vintage-inspired jar catches the light in a way that makes every candle look like it belongs on a very old, very beautiful shelf. Comes with a fitted lid to seal in the magic between burns.',
            sizes: [
                { label: 'Small', capacity: '230g', price: 29, img: 'Assets/more product/jars/vintage_jar_small.png', hoverImg: 'Assets/more product/jars/vintage_jar_small_candle.png', extraImg: 'Assets/more product/jars/vintage_jar_small_lid.png' },
                { label: 'Large', capacity: '420g', price: 43, img: 'Assets/more product/jars/vintage_jar_big.png',   hoverImg: 'Assets/more product/jars/vintage_jar_big_candle.png',   extraImg: 'Assets/more product/jars/vintage_jar_big_lid.png' },
            ],
        },

        'aurora-jar': {
            id: 'aurora-jar', name: 'Aurora Jar', price: 35,
            category: 'jars', categoryLabel: 'Jar',
            img: 'Assets/more product/jars/crystal_jar_small.png',
            hoverImg: 'Assets/more product/jars/crystal_jar_small_candle.png',
            desc: 'Faceted like a cut crystal, this jar turns every flicker into a constellation. Watch the light scatter across your walls in soft prismatic patterns — dreamy, ethereal, and entirely its own kind of magic.',
            sizes: [
                { label: 'Small', capacity: '230g', price: 35, img: 'Assets/more product/jars/crystal_jar_small.png', hoverImg: 'Assets/more product/jars/crystal_jar_small_candle.png' },
                { label: 'Large', capacity: '420g', price: 52, img: 'Assets/more product/jars/crystal_jar_big.png',   hoverImg: 'Assets/more product/jars/crystal_jar_big_candle.png' },
            ],
        },

        'wick-trimmer': {
            id: 'wick-trimmer', name: 'Golden Wick Trimmer', price: 50, bestSeller: true,
            category: 'wicks', categoryLabel: 'Wick Accessory',
            img: 'Assets/more product/wick_trimmer.png',
            hoverImg: 'Assets/more product/wick_trimmer_candle.png',
            desc: 'Some things change the way you see everything else.<br><br>A steady flame. A quiet evening. The moment you realize that the small things — done with care, done with intention — are what make a life feel luminous.<br><br>This is that kind of thing.<br><br>Our Golden Wick Trimmer is polished to a warm, gleaming gold and angled perfectly to reach into any jar with grace. Its curved catcher collects the trimmed wick so nothing disturbs your wax, nothing clouds your flame. Just clean, bright, beautiful light — every single time you light up.<br><br>Keep it on your nightstand. Your windowsill. Somewhere you\'ll see it and remember that you deserve candles that burn right, and moments that glow.<br><br>Because you\'re not just making candles. You\'re making light.',
            detail: 'Trim to 5–6mm before each burn · Works with cotton and wooden wicks',
        },
    };

    /* ======== Render Product Cards ======== */
    function renderProductCards() {
        Object.values(productsData).forEach(p => {
            const article = document.createElement('article');
            article.className = 'product-card';
            article.dataset.category = p.category;
            article.dataset.price    = p.price;
            article.dataset.name     = p.name;

            const plainDesc = p.desc.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const shortDesc = plainDesc.length > 95
                ? plainDesc.slice(0, 95).trimEnd() + '…'
                : plainDesc;

            article.innerHTML = `
                ${p.bestSeller ? '<div class="best-seller-badge">★ Best Seller</div>' : ''}
                <div class="card-img-wrapper" onclick="openQuickView('${p.id}')">
                    <img src="${p.img}" class="default-img" alt="${p.name}">
                    <img src="${p.hoverImg || p.img}" class="hover-img" alt="${p.name}">
                    <div class="quick-view-overlay">View Product</div>
                </div>
                <div class="card-body">
                    <span class="product-category">${p.categoryLabel}</span>
                    <h3>${p.name}</h3>
                    <p class="product-desc">${shortDesc}</p>
                    <div class="card-footer">
                        <span class="product-price">₪${p.price}</span>
                        <button class="add-to-cart-btn" aria-label="Add ${p.name} to cart">Add to Cart</button>
                    </div>
                </div>`;
            grid.appendChild(article);
        });
    }

    if (grid) renderProductCards();

    const cards = grid ? Array.from(grid.querySelectorAll('.product-card')) : [];

    /* ======== Initialise ======== */
    updateCartBadge();
    if (grid) applyFilters();

    /* ======== Navigation ======== */
    document.getElementById('nav-shop-btn')?.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    document.getElementById('nav-build-btn')?.addEventListener('click', () => { showToast('🕯️ Candle builder coming soon!'); });
    document.getElementById('nav-about-btn')?.addEventListener('click', () => { window.location.href = 'about.html'; });
    document.getElementById('nav-contact-btn')?.addEventListener('click', () => { window.location.href = 'index.html#contact'; });

    cartBtn?.addEventListener('click', () => {
        const count = getCartCount();
        showToast(count > 0
            ? `🛒 You have ${count} item${count !== 1 ? 's' : ''} in your cart.`
            : '🛒 Your cart is empty.');
    });

    /* ======== Category buttons (top bar — single-select, syncs sidebar) ======== */
    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.category;
            activeCategories.clear();
            if (cat !== 'all') activeCategories.add(cat);
            sidebarCatChecks.forEach(cb => { cb.checked = activeCategories.has(cb.value); });
            applyFilters();
        });
    });

    /* ======== Sidebar category checkboxes (multi-select, syncs top bar) ======== */
    sidebarCatChecks.forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.checked) { activeCategories.add(cb.value); } else { activeCategories.delete(cb.value); }
            catBtns.forEach(b => b.classList.remove('active'));
            if (activeCategories.size === 0) {
                catBtns[0].classList.add('active');
            } else if (activeCategories.size === 1) {
                const [single] = activeCategories;
                catBtns.forEach(b => { if (b.dataset.category === single) b.classList.add('active'); });
            }
            applyFilters();
        });
    });

    /* ======== Search ======== */
    searchInput?.addEventListener('input', applyFilters);

    /* ======== Sort ======== */
    sortSelect?.addEventListener('change', applyFilters);

    /* ======== Clear filters ======== */
    clearBtn?.addEventListener('click', () => {
        searchInput.value = '';
        sortSelect.value = 'default';
        activeCategories.clear();
        sidebarCatChecks.forEach(cb => { cb.checked = false; });
        catBtns.forEach(b => b.classList.remove('active'));
        catBtns[0].classList.add('active');
        applyFilters();
    });

    /* ======== Add to Cart (grid) ======== */
    grid?.addEventListener('click', e => {
        const btn = e.target.closest('.add-to-cart-btn');
        if (!btn) return;
        const card  = btn.closest('.product-card');
        const name  = card.dataset.name;
        const price = card.dataset.price;

        btn.textContent = '✓ Added!';
        btn.classList.add('added');
        card.classList.add('card-pulse');
        setTimeout(() => card.classList.remove('card-pulse'), 400);

        addToCart({ name, price });
        updateCartBadge();
        showToast(`✅ "${name}" added to cart`);

        setTimeout(() => { btn.textContent = 'Add to Cart'; btn.classList.remove('added'); }, 1800);
    });

    /* ======== Filter / Sort ======== */
    function applyFilters() {
        if (!grid) return;
        const query = searchInput.value.toLowerCase().trim();

        let visible = cards.filter(card => {
            return card.dataset.name.toLowerCase().includes(query)
                && (activeCategories.size === 0 || activeCategories.has(card.dataset.category));
        });

        const sort = sortSelect.value;
        if (sort === 'price-asc')  visible.sort((a, b) => a.dataset.price - b.dataset.price);
        if (sort === 'price-desc') visible.sort((a, b) => b.dataset.price - a.dataset.price);
        if (sort === 'name-asc')   visible.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));

        cards.forEach(c => { c.style.display = 'none'; });
        visible.forEach(c => { c.style.display = ''; grid.appendChild(c); });

        countNum.textContent = visible.length;
        noResults.hidden = visible.length > 0;
    }

    /* ======== Cart helpers ======== */
    function getCart() {
        try { return JSON.parse(localStorage.getItem('ww_cart') || '[]'); } catch { return []; }
    }

    function getCartCount() {
        return getCart().reduce((s, i) => s + i.qty, 0);
    }

    function addToCart({ name, price }) {
        const cart     = getCart();
        const existing = cart.find(i => i.name === name);
        if (existing) { existing.qty += 1; } else { cart.push({ name, price: parseInt(price), qty: 1 }); }
        const total = cart.reduce((s, i) => s + i.qty, 0);
        localStorage.setItem('ww_cart', JSON.stringify(cart));
        localStorage.setItem('ww_cart_count', String(total));
    }

    function updateCartBadge() {
        const count = getCartCount();
        let badge = document.getElementById('cart-badge');
        if (!badge) { badge = document.createElement('span'); badge.id = 'cart-badge'; cartBtn?.appendChild(badge); }
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }

    /* ======== Toast ======== */
    function showToast(message) {
        let toast = document.getElementById('ww-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'ww-toast';
            document.body.appendChild(toast);
            const style = document.createElement('style');
            style.textContent = `
                #ww-toast { position:fixed; bottom:32px; left:50%; transform:translateX(-50%) translateY(20px);
                    background:#5D3364; color:#fff; font-family:'Poppins',sans-serif; font-size:15px;
                    padding:14px 28px; border-radius:50px; box-shadow:0 8px 30px rgba(93,51,100,.35);
                    opacity:0; transition:opacity .3s ease,transform .3s ease; z-index:9999; white-space:nowrap; }
                #ww-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
                .card-pulse { animation:pulse .4s ease; }
                @keyframes pulse { 0%{transform:scale(1)} 50%{transform:scale(1.04)} 100%{transform:scale(1)} }
                #cart-badge { position:absolute; top:-4px; right:-4px; background:#1A543E; color:#fff;
                    font-size:11px; font-weight:700; width:18px; height:18px; border-radius:50%;
                    display:flex; align-items:center; justify-content:center;
                    font-family:'Poppins',sans-serif; border:2px solid #5D3364; }`;
            document.head.appendChild(style);
        }
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
    }

    const badgeStyle = document.createElement('style');
    badgeStyle.textContent = `
        header button[aria-label="Cart"] { position:relative; }
        #cart-badge { position:absolute; top:-4px; right:-4px; background:#1A543E; color:#fff;
            font-size:11px; font-weight:700; width:18px; height:18px; border-radius:50%;
            display:none; align-items:center; justify-content:center;
            font-family:'Poppins',sans-serif; border:2px solid #5D3364; }`;
    document.head.appendChild(badgeStyle);

    /* ======== Quick View Modal ======== */
    const quickViewModal  = document.getElementById('quick-view-modal');
    const closeBtn        = document.querySelector('.close-modal-btn');
    const qvCategory      = document.getElementById('qv-category');
    const qvTitle         = document.getElementById('qv-title');
    const qvPrice         = document.getElementById('qv-price');
    const qvDesc          = document.getElementById('qv-desc');
    const qvMaterials     = document.getElementById('qv-materials');
    const qvDetail        = document.getElementById('qv-detail');
    const qvOptionsContainer = document.getElementById('qv-options');
    const qvOptionsLabel  = document.getElementById('qv-options-label');
    const qvColorChips    = document.getElementById('qv-color-chips');
    const qvAddToCart     = document.getElementById('qv-add-to-cart');
    const qvGalleryImg    = document.getElementById('qv-gallery-img');
    const galleryPrev     = document.querySelector('.gallery-prev');
    const galleryNext     = document.querySelector('.gallery-next');
    const galleryDots     = document.querySelectorAll('.gallery-dot');

    let currentQvProduct = null;
    let qvPhotoIndex     = 0;
    let qvGalleryImages  = ['', ''];
    let selectedColor    = '';
    let selectedSize     = null;

    function setGalleryPhoto(index) {
        qvPhotoIndex = index;
        qvGalleryImg.style.opacity = '0';
        setTimeout(() => { qvGalleryImg.src = qvGalleryImages[qvPhotoIndex]; qvGalleryImg.style.opacity = '1'; }, 160);
        galleryDots.forEach((dot, i) => dot.classList.toggle('active', i === qvPhotoIndex));
    }

    function selectColorChip(chip) {
        qvColorChips.querySelectorAll('.color-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedColor = chip.dataset.color;
        const cd = waxColorImages[selectedColor];
        if (cd) qvGalleryImages = [cd.bag, cd.full];
        setGalleryPhoto(0);
    }

    function selectSizeChip(chip) {
        qvColorChips.querySelectorAll('.color-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedSize = currentQvProduct.sizes.find(s => s.label === chip.dataset.size);
        if (!selectedSize) return;
        qvPrice.textContent = '₪' + selectedSize.price;
        if (selectedSize.extraImg) {
            qvGalleryImages = [selectedSize.img, selectedSize.hoverImg, selectedSize.extraImg];
            galleryDots[2].style.display = '';
            galleryDots[3].style.display = 'none';
        } else {
            qvGalleryImages = [selectedSize.img, selectedSize.hoverImg];
            galleryDots[2].style.display = 'none';
            galleryDots[3].style.display = 'none';
        }
        setGalleryPhoto(0);
    }

    window.openQuickView = function (productId) {
        const product = productsData[productId];
        if (!product) return;
        currentQvProduct = product;
        selectedColor    = '';
        selectedSize     = null;

        qvCategory.textContent = product.categoryLabel;
        qvTitle.textContent    = product.name;
        qvPrice.textContent    = '₪' + product.price;
        qvDesc.innerHTML       = product.desc;

        if (product.materials && product.materials.length > 0) {
            qvMaterials.style.display = '';
            qvMaterials.innerHTML = product.materials.map(m => `<span class="material-tag">${m}</span>`).join('');
        } else {
            qvMaterials.style.display = 'none';
        }

        qvDetail.style.display = product.detail ? 'inline-block' : 'none';
        if (product.detail) qvDetail.textContent = product.detail;

        if (product.colors && product.colors.length > 0) {
            galleryDots[2].style.display = 'none';
            galleryDots[3].style.display = 'none';
            qvOptionsContainer.hidden = false;
            qvOptionsLabel.textContent = 'Select Colour';
            qvColorChips.innerHTML = product.colors.map(c => {
                const cd = waxColorImages[c];
                return `<button class="color-chip" data-color="${c}"><span class="chip-swatch" style="background:${cd ? cd.swatch : '#ccc'}"></span>${c}</button>`;
            }).join('');
            const firstChip = qvColorChips.querySelector('.color-chip');
            if (firstChip) selectColorChip(firstChip);
        } else if (product.sizes && product.sizes.length > 0) {
            galleryDots[2].style.display = 'none';
            galleryDots[3].style.display = 'none';
            qvOptionsContainer.hidden = false;
            qvOptionsLabel.textContent = 'Select Size';
            qvColorChips.innerHTML = product.sizes.map(s =>
                `<button class="color-chip" data-size="${s.label}">${s.label} <span class="size-capacity">— ${s.capacity}</span></button>`
            ).join('');
            const firstChip = qvColorChips.querySelector('.color-chip');
            if (firstChip) selectSizeChip(firstChip);
        } else {
            qvOptionsContainer.hidden = true;
            if (product.extraImg2) {
                qvGalleryImages = [product.img, product.hoverImg || product.img, product.extraImg, product.extraImg2];
                galleryDots[2].style.display = '';
                galleryDots[3].style.display = '';
            } else if (product.extraImg) {
                qvGalleryImages = [product.img, product.hoverImg || product.img, product.extraImg];
                galleryDots[2].style.display = '';
                galleryDots[3].style.display = 'none';
            } else {
                qvGalleryImages = [product.img, product.hoverImg || product.img];
                galleryDots[2].style.display = 'none';
                galleryDots[3].style.display = 'none';
            }
            setGalleryPhoto(0);
        }

        quickViewModal.classList.remove('modal-hidden');
    };

    qvColorChips.addEventListener('click', e => {
        const chip = e.target.closest('.color-chip');
        if (!chip) return;
        if (chip.dataset.color) selectColorChip(chip);
        else if (chip.dataset.size) selectSizeChip(chip);
    });

    galleryPrev.addEventListener('click', () => setGalleryPhoto((qvPhotoIndex - 1 + qvGalleryImages.length) % qvGalleryImages.length));
    galleryNext.addEventListener('click', () => setGalleryPhoto((qvPhotoIndex + 1) % qvGalleryImages.length));
    galleryDots.forEach((dot, i) => dot.addEventListener('click', () => setGalleryPhoto(i)));

    function closeQuickView() { quickViewModal.classList.add('modal-hidden'); }

    closeBtn.addEventListener('click', closeQuickView);
    quickViewModal.addEventListener('click', e => { if (e.target === quickViewModal) closeQuickView(); });

    qvAddToCart.addEventListener('click', () => {
        if (!currentQvProduct) return;
        let finalName  = currentQvProduct.name;
        let finalPrice = currentQvProduct.price;
        if (selectedColor) finalName += ` (${selectedColor})`;
        if (selectedSize)  { finalName += ` (${selectedSize.label})`; finalPrice = selectedSize.price; }
        addToCart({ name: finalName, price: finalPrice });
        updateCartBadge();
        showToast(`✅ "${finalName}" added to cart`);
        closeQuickView();
    });
});
