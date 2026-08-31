/**
 * GiftGenius - products.js
 * Centralized MVP product catalog.
 *
 * This file is the source of truth for product information. The extra
 * metadata fields are intentionally simple so the next phase can build a
 * rule-based recommendation engine without changing the UI first.
 */

'use strict';

const PRODUCTS = [
  {
    id: 1,
    slug: "luxury-hamper-box",
    name: "Luxury Hamper Box",
    category: "Gift Sets",
    price: 499,
    originalPrice: 699,
    rating: 4.9,
    reviewCount: 182,
    starsDisplay: "&#9733;&#9733;&#9733;&#9733;&#9733;",
    image: "https://t4.ftcdn.net/jpg/05/32/64/27/240_F_532642742_3lStpC5P0U4FrndE82prkwm61F5OnQgj.jpg",
    alt: "Luxury gift hamper box with curated items",
    badge: { text: "Bestseller", className: "pbadge--bestseller" },
    tags: ["for-her", "for-him", "budget", "premium"],
    occasion: ["birthday", "anniversary", "festival", "thank-you"],
    forWhom: ["her", "him", "friend", "family", "colleague"],
    interests: ["gourmet", "self-care", "celebration", "surprise"],
    personality: ["thoughtful", "classic", "warm"],
    giftType: "curated-hamper",
    budgetTier: "budget",
    cultureTags: [],
    festivalTags: ["diwali", "raksha-bandhan"],
    description: "A ready-to-gift hamper with assorted treats and a premium presentation box.",
    recommendationReasons: [
      "Works well when you want a safe, polished gift for many occasions.",
      "Good fit for recipients who enjoy curated surprises."
    ]
  },
  {
    id: 2,
    slug: "engraved-timepiece",
    name: "Engraved Timepiece",
    category: "Accessories",
    price: 1299,
    originalPrice: 1699,
    rating: 4.8,
    reviewCount: 94,
    starsDisplay: "&#9733;&#9733;&#9733;&#9733;&#9733;",
    image: "https://etchcraftemporium.in/cdn/shop/files/ChatGPT_Image_Aug_14_2025_07_16_41_PM.png?v=1755179225&width=800",
    alt: "Elegant engraved timepiece watch gift",
    badge: { text: "New", className: "pbadge--new" },
    tags: ["for-him", "premium", "personalized"],
    occasion: ["birthday", "anniversary", "graduation", "promotion"],
    forWhom: ["him", "partner", "father", "colleague"],
    interests: ["accessories", "fashion", "personalized", "professional"],
    personality: ["elegant", "practical", "sentimental"],
    giftType: "personalized-accessory",
    budgetTier: "mid-range",
    cultureTags: [],
    festivalTags: [],
    description: "A refined watch that can carry a personal engraved message.",
    recommendationReasons: [
      "Strong choice for milestone occasions where a keepsake matters.",
      "Personalization makes the gift feel more intentional."
    ]
  },
  {
    id: 3,
    slug: "classic-rose-bouquet",
    name: "Classic Rose Bouquet",
    category: "Flowers",
    price: 599,
    originalPrice: 799,
    rating: 4.6,
    reviewCount: 310,
    starsDisplay: "&#9733;&#9733;&#9733;&#9733;&#9734;",
    image: "https://www.uflowershop.com/1294-large_default/valentine-s-day-classic-red-rose-bouquet.webp",
    alt: "Classic red rose bouquet for gifting",
    badge: { text: "Sale", className: "pbadge--sale" },
    tags: ["for-her", "budget"],
    occasion: ["valentine", "anniversary", "birthday", "apology"],
    forWhom: ["her", "partner", "mother", "friend"],
    interests: ["flowers", "romance", "decor", "classic-gifts"],
    personality: ["romantic", "classic", "expressive"],
    giftType: "fresh-flowers",
    budgetTier: "budget",
    cultureTags: [],
    festivalTags: [],
    description: "Fresh red roses arranged for romantic and heartfelt moments.",
    recommendationReasons: [
      "Best for emotional occasions where the message matters more than utility.",
      "A familiar gift that feels warm and expressive."
    ]
  },
  {
    id: 4,
    slug: "signature-perfume",
    name: "Signature Perfume",
    category: "Fragrance",
    price: 1199,
    originalPrice: 1499,
    rating: 4.9,
    reviewCount: 218,
    starsDisplay: "&#9733;&#9733;&#9733;&#9733;&#9733;",
    image: "https://images.stockcake.com/public/e/b/3/eb3d9618-4d24-4f60-bf9c-17168329eb84_large/elegant-perfume-bottle-stockcake.jpg",
    alt: "Elegant signature perfume bottle gift",
    badge: { text: "Top Rated", className: "pbadge--rated" },
    tags: ["for-her", "for-him", "premium"],
    occasion: ["birthday", "anniversary", "valentine", "festive-party"],
    forWhom: ["her", "him", "partner", "friend"],
    interests: ["fragrance", "fashion", "self-care", "luxury"],
    personality: ["stylish", "confident", "premium"],
    giftType: "fragrance",
    budgetTier: "mid-range",
    cultureTags: [],
    festivalTags: [],
    description: "A sophisticated fragrance for someone who enjoys polished personal style.",
    recommendationReasons: [
      "Matches recipients who enjoy fashion, grooming, and self-care.",
      "Feels premium without moving into an expensive luxury budget."
    ]
  },
  {
    id: 5,
    slug: "artisan-diya-set",
    name: "Artisan Diya Set",
    category: "Home Decor",
    price: 899,
    originalPrice: 1199,
    rating: 4.7,
    reviewCount: 76,
    starsDisplay: "&#9733;&#9733;&#9733;&#9733;&#9734;",
    image: "https://images.unsplash.com/photo-1605292356183-a77d0a9c9d1d?auto=format&fit=crop&w=900&q=80",
    alt: "Decorative artisan diya set for festive gifting",
    badge: { text: "Festival", className: "pbadge--sale" },
    tags: ["for-her", "for-him", "budget", "festival"],
    occasion: ["festival", "housewarming", "diwali"],
    forWhom: ["family", "mother", "father", "friend", "colleague"],
    interests: ["home-decor", "traditional", "festival", "handmade"],
    personality: ["traditional", "warm", "family-oriented"],
    giftType: "festival-decor",
    budgetTier: "budget",
    cultureTags: ["indian", "traditional", "handcrafted"],
    festivalTags: ["diwali"],
    description: "A decorative diya set suited for festive homes and traditional gifting.",
    recommendationReasons: [
      "Useful for festival gifting when the recipient values tradition.",
      "Adds a CultureConnect-friendly product to the catalog."
    ]
  },
  {
    id: 6,
    slug: "personalized-photo-frame",
    name: "Personalized Photo Frame",
    category: "Personalized",
    price: 799,
    originalPrice: 999,
    rating: 4.8,
    reviewCount: 128,
    starsDisplay: "&#9733;&#9733;&#9733;&#9733;&#9733;",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80",
    alt: "Personalized photo frame displayed on a shelf",
    badge: { text: "Personalized", className: "pbadge--new" },
    tags: ["for-her", "for-him", "budget", "personalized"],
    occasion: ["birthday", "anniversary", "farewell", "friendship"],
    forWhom: ["partner", "friend", "family", "mother", "father"],
    interests: ["memories", "personalized", "home-decor", "sentimental"],
    personality: ["sentimental", "thoughtful", "creative"],
    giftType: "personalized-keepsake",
    budgetTier: "budget",
    cultureTags: [],
    festivalTags: [],
    description: "A custom photo frame for preserving a shared memory.",
    recommendationReasons: [
      "Great when the relationship is personal and memory-driven.",
      "Affordable personalized option for birthdays and anniversaries."
    ]
  },
  {
    id: 7,
    slug: "premium-chocolate-box",
    name: "Premium Chocolate Box",
    category: "Gourmet",
    price: 1499,
    originalPrice: 1899,
    rating: 4.9,
    reviewCount: 156,
    starsDisplay: "&#9733;&#9733;&#9733;&#9733;&#9733;",
    image: "https://images.unsplash.com/photo-1549007953-2f2dc0b24019?auto=format&fit=crop&w=900&q=80",
    alt: "Premium assorted chocolate box",
    badge: { text: "Premium", className: "pbadge--rated" },
    tags: ["for-her", "for-him", "premium"],
    occasion: ["birthday", "anniversary", "thank-you", "festival"],
    forWhom: ["friend", "partner", "family", "colleague"],
    interests: ["gourmet", "chocolate", "food", "celebration"],
    personality: ["warm", "social", "indulgent"],
    giftType: "gourmet",
    budgetTier: "mid-range",
    cultureTags: [],
    festivalTags: ["diwali", "christmas"],
    description: "A premium assorted chocolate box for sweet celebrations.",
    recommendationReasons: [
      "Easy match for food lovers and celebratory gifting.",
      "Suitable for both personal and professional relationships."
    ]
  },
  {
    id: 8,
    slug: "desk-plant-set",
    name: "Desk Plant Set",
    category: "Plants",
    price: 699,
    originalPrice: 899,
    rating: 4.5,
    reviewCount: 83,
    starsDisplay: "&#9733;&#9733;&#9733;&#9733;&#9734;",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80",
    alt: "Small indoor desk plant in a ceramic pot",
    badge: { text: "Eco Pick", className: "pbadge--new" },
    tags: ["for-her", "for-him", "budget"],
    occasion: ["housewarming", "promotion", "thank-you", "birthday"],
    forWhom: ["friend", "colleague", "family", "teacher"],
    interests: ["plants", "home-decor", "wellness", "workspace"],
    personality: ["calm", "practical", "nature-loving"],
    giftType: "plant",
    budgetTier: "budget",
    cultureTags: [],
    festivalTags: [],
    description: "A compact indoor plant set for desks, shelves, and small spaces.",
    recommendationReasons: [
      "Good for recipients who like practical, calming gifts.",
      "Works well for colleagues, teachers, and housewarming occasions."
    ]
  }
];

function getProductSearchText(product) {
  return [
    product.name,
    product.category,
    product.description,
    product.giftType,
    product.budgetTier,
    ...product.tags,
    ...product.occasion,
    ...product.forWhom,
    ...product.interests,
    ...product.personality,
    ...product.cultureTags,
    ...product.festivalTags
  ].join(' ').toLowerCase();
}

/**
 * Builds one .pcard element from a product object.
 * The original class names and data attributes are preserved so existing
 * main.js modules keep working while the product model becomes richer.
 */
function buildProductCard(product) {
  const tagsAttr = product.tags.join(' ');

  return `
    <article class="pcard" role="listitem" data-name="${product.name.toLowerCase()}" data-category="${product.category.toLowerCase()}" data-tags="${tagsAttr}" data-price="${product.price}" data-rating="${product.rating}" data-search="${getProductSearchText(product)}">
      <div class="pcard-img">
        <span class="pbadge ${product.badge.className}">${product.badge.text}</span>
        <button class="wish-btn" aria-label="Add ${product.name} to wishlist" aria-pressed="false">&#9825;</button>
        <img src="${product.image}" alt="${product.alt}" loading="lazy">
        <button class="quickview-btn" data-id="${product.id}" aria-label="Quick view ${product.name}">Quick View</button>
      </div>
      <div class="pcard-body">
        <p class="pcard-cat">${product.category}</p>
        <h3 class="pcard-name">${product.name}</h3>
        <div class="pcard-rating" aria-label="Rating: ${product.rating} out of 5, ${product.reviewCount} reviews">
          <span class="stars" aria-hidden="true">${product.starsDisplay}</span>
          <span>${product.rating} (${product.reviewCount})</span>
        </div>
        <div class="pcard-foot">
          <div class="pcard-price">
            <span class="price-og"><span class="sr-only">Original price:</span>&#8377;${product.originalPrice.toLocaleString('en-IN')}</span>
            <span class="price-now"><span class="sr-only">Sale price:</span>&#8377;${product.price.toLocaleString('en-IN')}</span>
          </div>
          <button class="add-btn"
            data-name="${product.name}"
            data-price="${product.price}"
            data-img="${product.image}"
            aria-label="Add ${product.name} to cart">
            + Add
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Renders a list of products into #productGrid.
 * Must run before Wishlist.init(), AddToCart.init(), FilterPills.init(),
 * Sort.init(), QuickView.init(), and ScrollReveal.init().
 */
function renderProducts(list = PRODUCTS) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = list.map(buildProductCard).join('');
}
