/**
 * GiftGenius — products.js
 * Centralized product data.
 * This is the ONLY place product info should live going forward.
 */

'use strict';

const PRODUCTS = [
  {
    id: 1,
    name: "Luxury Hamper Box",
    category: "Gift Sets",
    price: 499,
    originalPrice: 699,
    rating: 4.9,
    reviewCount: 182,
    starsDisplay: "★★★★★",
    image: "https://t4.ftcdn.net/jpg/05/32/64/27/240_F_532642742_3lStpC5P0U4FrndE82prkwm61F5OnQgj.jpg",
    alt: "Luxury gift hamper box with curated items",
    badge: { text: "Bestseller", className: "pbadge--bestseller" },
    tags: ["for-her", "for-him", "premium"],
    occasion: ["birthday", "anniversary", "festival"],
    forWhom: ["her", "him"]
  },
  {
    id: 2,
    name: "Engraved Timepiece",
    category: "Accessories",
    price: 1299,
    originalPrice: 1699,
    rating: 4.8,
    reviewCount: 94,
    starsDisplay: "★★★★★",
    image: "https://etchcraftemporium.in/cdn/shop/files/ChatGPT_Image_Aug_14_2025_07_16_41_PM.png?v=1755179225&width=800",
    alt: "Elegant engraved timepiece watch gift",
    badge: { text: "New", className: "pbadge--new" },
    tags: ["for-him", "premium", "personalized"],
    occasion: ["birthday", "anniversary", "graduation"],
    forWhom: ["him"]
  },
  {
    id: 3,
    name: "Classic Rose Bouquet",
    category: "Flowers",
    price: 599,
    originalPrice: 799,
    rating: 4.6,
    reviewCount: 310,
    starsDisplay: "★★★★☆",
    image: "https://www.uflowershop.com/1294-large_default/valentine-s-day-classic-red-rose-bouquet.webp",
    alt: "Classic red rose bouquet for gifting",
    badge: { text: "Sale", className: "pbadge--sale" },
    tags: ["for-her", "budget"],
    occasion: ["valentine", "anniversary"],
    forWhom: ["her"]
  },
  {
    id: 4,
    name: "Signature Perfume",
    category: "Fragrance",
    price: 1199,
    originalPrice: 1499,
    rating: 4.9,
    reviewCount: 218,
    starsDisplay: "★★★★★",
    image: "https://images.stockcake.com/public/e/b/3/eb3d9618-4d24-4f60-bf9c-17168329eb84_large/elegant-perfume-bottle-stockcake.jpg",
    alt: "Elegant signature perfume bottle gift",
    badge: { text: "Top Rated", className: "pbadge--rated" },
    tags: ["for-her", "for-him", "premium"],
    occasion: ["birthday", "valentine"],
    forWhom: ["her", "him"]
  }
];

/**
 * Builds one .pcard element from a product object.
 * Markup, classes, and data-attributes match the original
 * hard-coded cards exactly, so existing main.js modules
 * (Wishlist, AddToCart, FilterPills, Sort, QuickView) keep working unchanged.
 */
function buildProductCard(product) {
  const tagsAttr = product.tags.join(' ');

  return `
    <article class="pcard" role="listitem" data-name="${product.name.toLowerCase()}" data-category="${product.category.toLowerCase()}" data-tags="${tagsAttr}" data-price="${product.price}" data-rating="${product.rating}">
      <div class="pcard-img">
        <span class="pbadge ${product.badge.className}">${product.badge.text}</span>
        <button class="wish-btn" aria-label="Add ${product.name} to wishlist" aria-pressed="false">🤍</button>
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
            <span class="price-og"><span class="sr-only">Original price:</span>₹${product.originalPrice.toLocaleString('en-IN')}</span>
            <span class="price-now"><span class="sr-only">Sale price:</span>₹${product.price.toLocaleString('en-IN')}</span>
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
 * Must run BEFORE Wishlist.init(), AddToCart.init(), FilterPills.init(),
 * Sort.init(), and ScrollReveal.init() in main.js, since those query
 * the DOM for .pcard elements at init time.
 */
function renderProducts(list = PRODUCTS) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = list.map(buildProductCard).join('');
}
