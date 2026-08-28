/**
 * GiftGenius — main.js
 * Modular, event-driven, no inline handlers
 * Cart persisted via localStorage
 */

'use strict';

/* ═══════════════════════════════════
   CONSTANTS
═══════════════════════════════════ */
const FREE_SHIPPING_THRESHOLD = 999;
const TOAST_DURATION = 2600;

/* ═══════════════════════════════════
   UTILITIES
═══════════════════════════════════ */

/** Debounce — delay fn call until typing stops */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Simple fuzzy search — returns true if all chars in query appear in order in str */
function fuzzyMatch(str, query) {
  str = str.toLowerCase();
  query = query.toLowerCase().trim();
  if (!query) return true;
  let si = 0;
  for (let qi = 0; qi < query.length; qi++) {
    si = str.indexOf(query[qi], si);
    if (si === -1) return false;
    si++;
  }
  return true;
}
function fuzzyMatchFields(fields, query) {
  if (!query) return true;

  return fields.some(field => fuzzyMatch(field || '', query));
}

function cardMatchesQuery(card, query) {
  return fuzzyMatchFields(
    [
      card.dataset.name,
      card.dataset.category,
      card.dataset.tags
    ],
    query
  );
}

function cardMatchesFilter(card, filter) {
  if (filter === 'all') return true;

  if (filter === 'budget') {
    const price = parseInt(card.dataset.price, 10) || 0;
    return price < 999;
  }

  return (card.dataset.tags || '')
    .split(/\s+/)
    .includes(filter);
}

/** Safe innerHTML alternative using textContent */
function createTextEl(tag, text, cls) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  el.textContent = text;
  return el;
}

/** Create element with properties */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'style') node.style.cssText = v;
    else node.setAttribute(k, v);
  });
  children.forEach(c => {
    if (typeof c === 'string') node.appendChild(document.createTextNode(c));
    else if (c) node.appendChild(c);
  });
  return node;
}

/** Basic email format check — shared by Newsletter + ProfileLogin */
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
const ProductDisplay = (() => {
  let query = '';
  let filter = 'all';

  function setQuery(newQuery) {
    query = (newQuery || '').trim();
    apply();
  }

  function setFilter(newFilter) {
    filter = newFilter || 'all';
    apply();
  }

  function apply() {
    const cards = document.querySelectorAll('.pcard');
    let visible = 0;

    cards.forEach(card => {
      const searchMatches = cardMatchesQuery(card, query);
      const filterMatches = cardMatchesFilter(card, filter);

      const show = searchMatches && filterMatches;

      card.style.display = show ? '' : 'none';

      if (show) visible++;
    });

    updateSearchStatus(visible);
  }

  function updateSearchStatus(visible) {
    const status = document.getElementById('searchStatus');

    if (!status) return;

    status.textContent = query
      ? `${visible} product${visible !== 1 ? 's' : ''} found`
      : '';
  }

  return {
    setQuery,
    setFilter,
    apply
  };
})();
/* ═══════════════════════════════════
   TOAST
═══════════════════════════════════ */
const Toast = (() => {
  const toastEl = document.getElementById('toast');
  const msgEl   = document.getElementById('toastMsg');
  let timer;

  // Display a toast message, auto-hides after TOAST_DURATION ms
  function show(msg, type = 'success') {
    clearTimeout(timer);
    msgEl.textContent = msg;
    toastEl.className = `toast show toast--${type}`;
    timer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, TOAST_DURATION);
  }

  return { show };
})();

/* ═══════════════════════════════════
   THEME — dark / light toggle
═══════════════════════════════════ */
const Theme = (() => {
  const btn     = document.getElementById('themeToggle');
  const iconEl  = btn?.querySelector('.theme-icon');
  const STORAGE_KEY = 'gg-theme';

  // Apply + persist the chosen theme (dark/light)
  function applyTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (iconEl) iconEl.textContent = dark ? '☀️' : '🌙';
    btn?.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn?.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    try { localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light'); } catch (_) {}
  }

  // Restore saved theme (or OS preference) and wire up the toggle button
  function init() {
    const stored = (() => { try { return localStorage.getItem(STORAGE_KEY); } catch(_) { return null; } })();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(stored === 'dark' || (!stored && prefersDark));

    btn?.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyTheme(!isDark);
    });
  }

  return { init };
})();

/* ═══════════════════════════════════
   NAV — pill indicator
═══════════════════════════════════ */
const NavPill = (() => {
  // Position the active-link indicator pill and react to nav clicks
  function init() {
    const pill  = document.getElementById('navPill');
    if (!pill) return;
    const links = pill.querySelectorAll('a');

    // Slide the pill indicator under the given nav link
    function moveIndicator(linkEl) {
      const pr = pill.getBoundingClientRect();
      const er = linkEl.getBoundingClientRect();
      pill.style.setProperty('--pill-left',  (er.left - pr.left) + 'px');
      pill.style.setProperty('--pill-width', er.width + 'px');
    }

    const active = pill.querySelector('a.active');
    if (active) requestAnimationFrame(() => moveIndicator(active));

    links.forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        links.forEach(l => { l.classList.remove('active'); l.removeAttribute('aria-current'); });
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
        moveIndicator(a);
      });
    });
  }

  return { init };
})();

/* ═══════════════════════════════════
   MOBILE MENU — hamburger
═══════════════════════════════════ */
const MobileMenu = (() => {
  // Wire up the hamburger toggle, outside-click, and Escape-to-close
  function init() {
    const toggle = document.getElementById('menuToggle');
    const menu   = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const open = menu.hidden;
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!menu.hidden && !menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !menu.hidden) {
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  return { init };
})();

/* ═══════════════════════════════════
   CART
═══════════════════════════════════ */
const Cart = (() => {
  const STORAGE_KEY = 'gg-cart';

  // State — load from localStorage
  let state = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { items: [], count: 0, total: 0 };
    } catch (_) {
      return { items: [], count: 0, total: 0 };
    }
  })();

  // DOM refs
  const overlay  = document.getElementById('cartOverlay');
  const sidebar  = document.getElementById('cartSide');
  const body     = document.getElementById('cartBody');
  const footer   = document.getElementById('cartFt');
  const badge    = document.getElementById('cartCount');
  const icEl     = document.getElementById('cartItemCount');
  const totalEl  = document.getElementById('cartTotal');
  const progress = document.getElementById('cartProgressFill');

  // Persist cart state to localStorage
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  // Open the cart sidebar
  function open() {
    overlay.classList.add('open');
    sidebar.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    document.getElementById('cartClose')?.focus();
    document.body.style.overflow = 'hidden';
  }

  // Close the cart sidebar
  function close() {
    overlay.classList.remove('open');
    sidebar.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    document.getElementById('cartToggle')?.focus();
    document.body.style.overflow = '';
  }

  // Add a product to the cart (or bump qty if already present)
  function addItem(name, price, img) {
    price = parseInt(price);
    const existing = state.items.find(i => i.name === name);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      state.items.push({ name, price, img, qty: 1 });
    }
    state.count++;
    state.total += price;
    save();
    render();
    Toast.show(`${name} added to cart`);
  }

  // Remove a single line item from the cart
  function removeItem(index) {
    const item = state.items[index];
    if (!item) return;
    state.total -= item.price * (item.qty || 1);
    state.count -= (item.qty || 1);
    state.items.splice(index, 1);
    save();
    render();
  }

  // Build the DOM row for one cart line item
  function buildCartItem(item, index) {
    const wrapper = el('div', { class: 'cart-item' });

    const img = el('img', { class: 'ci-img', src: item.img, alt: item.name, loading: 'lazy' });

    const info = el('div', { class: 'ci-info' }, [
      el('p', { class: 'ci-name' }, [item.name]),
      el('p', { class: 'ci-price' }, [`₹${item.price.toLocaleString('en-IN')}${item.qty > 1 ? ` × ${item.qty}` : ''}`])
    ]);

    const del = el('button', { class: 'ci-del', 'aria-label': `Remove ${item.name} from cart` }, ['✕']);
    del.addEventListener('click', () => removeItem(index));

    wrapper.appendChild(img);
    wrapper.appendChild(info);
    wrapper.appendChild(del);
    return wrapper;
  }

  // Re-render the cart badge, progress bar, and item list from state
  function render() {
    // Badge
    badge.textContent = state.count;
    document.getElementById('cartToggle')?.setAttribute('aria-label', `Open cart, ${state.count} item${state.count !== 1 ? 's' : ''}`);

    // Item count label
    if (icEl) {
      icEl.textContent = state.items.length
        ? `(${state.items.length} item${state.items.length > 1 ? 's' : ''})`
        : '';
    }

    // Progress bar
    if (progress) {
      const pct = Math.min((state.total / FREE_SHIPPING_THRESHOLD) * 100, 100);
      progress.style.width = pct + '%';
    }

    // Empty state
    if (!state.items.length) {
      body.innerHTML = '';
      const emptyDiv = el('div', { class: 'cart-empty' }, [
        el('div', { class: 'ei', 'aria-hidden': 'true' }, ['🛒']),
        el('p', {}, ['Your cart is empty. Find the perfect gift above!'])
      ]);
      body.appendChild(emptyDiv);
      if (footer) footer.hidden = true;
      return;
    }

    // Shipping message
    body.innerHTML = '';
    const remaining = FREE_SHIPPING_THRESHOLD - state.total;
    const msgDiv = el('div', { class: remaining > 0 ? 'cart-msg cart-msg--ship' : 'cart-msg cart-msg--free' });
    if (remaining > 0) {
      msgDiv.appendChild(document.createTextNode('Add '));
      const strong = el('strong', {}, [`₹${remaining.toLocaleString('en-IN')}`]);
      msgDiv.appendChild(strong);
      msgDiv.appendChild(document.createTextNode(' more for free shipping 🎁'));
    } else {
      msgDiv.textContent = '🎉 You\'ve unlocked free shipping!';
    }
    body.appendChild(msgDiv);

    // Cart items
    state.items.forEach((item, i) => {
      body.appendChild(buildCartItem(item, i));
    });

    // Footer
    if (footer) {
      footer.hidden = false;
      if (totalEl) totalEl.textContent = '₹' + state.total.toLocaleString('en-IN');
    }
  }

  // Wire up open/close/keyboard handlers and do the first render
  function init() {
    // Open / close
    document.getElementById('cartToggle')?.addEventListener('click', open);
    document.getElementById('cartClose')?.addEventListener('click', close);
    overlay?.addEventListener('click', close);

    // Keyboard close
    sidebar?.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
    });

    // Focus trap in sidebar
    sidebar?.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const focusable = sidebar.querySelectorAll('button, [href], input, select, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    render();
  }

  return { init, addItem, render };
})();

/* ═══════════════════════════════════
   WISHLIST — persist to localStorage
═══════════════════════════════════ */
const Wishlist = (() => {
  const STORAGE_KEY = 'gg-wishlist';

  let wished = (() => {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []); }
    catch (_) { return new Set(); }
  })();

  // Persist wishlist names to localStorage
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...wished])); } catch (_) {}
  }

  // Add/remove a product from the wishlist and update the heart button
  function toggle(name, btn) {
    if (wished.has(name)) {
      wished.delete(name);
      btn.textContent = '🤍';
      btn.setAttribute('aria-pressed', 'false');
      Toast.show(`${name} removed from wishlist`);
    } else {
      wished.add(name);
      btn.textContent = '❤️';
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      Toast.show(`${name} added to wishlist ❤️`);
    }
    save();
  }

  // Restore wishlist button states and wire up click handlers
  function init() {
    document.querySelectorAll('.wish-btn').forEach(btn => {
      // Restore state
      const card = btn.closest('.pcard');
      const addBtn = card?.querySelector('.add-btn');
      const name = addBtn?.dataset.name;
      if (name && wished.has(name)) {
        btn.textContent = '❤️';
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      }

      btn.addEventListener('click', e => {
        e.stopPropagation();
        const addBtn = btn.closest('.pcard')?.querySelector('.add-btn');
        const productName = addBtn?.dataset.name || 'Item';
        toggle(productName, btn);
      });
    });
  }

  return { init };
})();

/* ═══════════════════════════════════
   ADD TO CART BUTTONS
═══════════════════════════════════ */
const AddToCart = (() => {
  // Toggle the add-button's loading state
  function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.textContent = loading ? '…' : '+ Add';
  }

  // Briefly show a confirmation state on the add-button
  function setAdded(btn) {
    btn.textContent = '✓ Added';
    btn.style.background = 'var(--gold)';
    btn.style.color = 'var(--ink)';
    setTimeout(() => {
      btn.textContent = '+ Add';
      btn.style.background = '';
      btn.style.color = '';
    }, 1800);
  }

  // Wire up Add to Cart buttons across all product cards
  function init() {
    document.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const { name, price, img } = btn.dataset;
        setLoading(btn, true);

        // Simulate async (real store would be an API call)
        setTimeout(() => {
          Cart.addItem(name, price, img);
          setLoading(btn, false);
          setAdded(btn);
        }, 200);
      });
    });
  }

  return { init };
})();

/* ═══════════════════════════════════
   SEARCH — fuzzy, debounced
═══════════════════════════════════ */
const Search = (() => {
  function init() {
    const input = document.getElementById('searchInput');

    if (!input) return;

    const handleSearch = debounce(() => {
      ProductDisplay.setQuery(input.value);
    }, 250);

    input.addEventListener('input', handleSearch);

    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        input.value = '';
        handleSearch();
      }
    });
  }

  return { init };
})();
/* ═══════════════════════════════════
   FILTER PILLS
═══════════════════════════════════ */
const FilterPills = (() => {
  function init() {
    const pills = document.querySelectorAll('.pill');

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-pressed', 'false');
        });

        pill.classList.add('active');
        pill.setAttribute('aria-pressed', 'true');

        ProductDisplay.setFilter(pill.dataset.filter);
      });
    });
  }

  return { init };
})();
/* ═══════════════════════════════════
   SORT
═══════════════════════════════════ */
const Sort = (() => {
  // Wire up the sort dropdown (price / rating)
  function init() {
    const select = document.getElementById('sortSelect');
    const grid   = document.getElementById('productGrid');
    if (!select || !grid) return;

    select.addEventListener('change', () => {
      const cards = [...grid.querySelectorAll('.pcard')];
      const val   = select.value;

      cards.sort((a, b) => {
        const pa = parseInt(a.dataset.price || 0);
        const pb = parseInt(b.dataset.price || 0);
        const ra = parseFloat(a.dataset.rating || 0);
        const rb = parseFloat(b.dataset.rating || 0);
        if (val === 'price-asc')  return pa - pb;
        if (val === 'price-desc') return pb - pa;
        if (val === 'rating')     return rb - ra;
        return 0; // default
      });

      cards.forEach(c => grid.appendChild(c));
    });
  }

  return { init };
})();

/* ═══════════════════════════════════
   QUICK VIEW MODAL
═══════════════════════════════════ */
const QuickView = (() => {
  const overlay   = document.getElementById('modalOverlay');
  const modal     = document.getElementById('quickviewModal');
  const closeBtn  = document.getElementById('modalClose');
  const content   = document.getElementById('modalContent');

  // Product data map (keyed by data-id on .quickview-btn)
  const products = {
    1: { name: 'Luxury Hamper Box', cat: 'Gift Sets', price: '₹499', og: '₹699', rating: '4.9 ★ (182)', img: 'https://t4.ftcdn.net/jpg/05/32/64/27/240_F_532642742_3lStpC5P0U4FrndE82prkwm61F5OnQgj.jpg', desc: 'A beautifully curated hamper packed with premium goodies — perfect for any celebration.' },
    2: { name: 'Engraved Timepiece', cat: 'Accessories', price: '₹1,299', og: '₹1,699', rating: '4.8 ★ (94)', img: 'https://etchcraftemporium.in/cdn/shop/files/ChatGPT_Image_Aug_14_2025_07_16_41_PM.png?v=1755179225&width=800', desc: 'A timeless watch with custom engraving — the gift that tells time and stories.' },
    3: { name: 'Classic Rose Bouquet', cat: 'Flowers', price: '₹599', og: '₹799', rating: '4.6 ★ (310)', img: 'https://www.uflowershop.com/1294-large_default/valentine-s-day-classic-red-rose-bouquet.webp', desc: 'Fresh red roses arranged by expert florists — delivered same day in Mumbai.' },
    4: { name: 'Signature Perfume', cat: 'Fragrance', price: '₹1,199', og: '₹1,499', rating: '4.9 ★ (218)', img: 'https://images.stockcake.com/public/e/b/3/eb3d9618-4d24-4f60-bf9c-17168329eb84_large/elegant-perfume-bottle-stockcake.jpg', desc: 'A sophisticated fragrance crafted to leave a lasting impression — luxury in a bottle.' },
  };

  // Build and open the quick-view modal for a given product id
  function openModal(id) {
    const p = products[id];
    if (!p || !content) return;

    // Build content safely (no innerHTML)
    content.innerHTML = '';
    const imgDiv   = el('div', { class: 'modal-img' }, [
      el('img', { src: p.img, alt: p.name, loading: 'lazy' })
    ]);
    const infoDiv  = el('div', { class: 'modal-info' }, [
      el('p', { class: 'modal-cat' }, [p.cat]),
      el('h3', { class: 'modal-name' }, [p.name]),
      el('p', { class: 'modal-rating' }, ['★ ' + p.rating]),
      el('div', { class: 'modal-price' }, [
        el('span', { class: 'price-og' }, [p.og]),
        document.createTextNode(p.price)
      ]),
      el('p', { class: 'modal-desc' }, [p.desc]),
    ]);

    // Numeric price extraction for Add to Cart
    const numericPrice = p.price.replace(/[^\d]/g, '');
    const addBtn = el('button', { class: 'btn-primary', style: 'width:100%' }, ['Add to Cart →']);
    addBtn.addEventListener('click', () => {
      Cart.addItem(p.name, numericPrice, p.img);
      closeModal();
    });
    infoDiv.appendChild(addBtn);

    content.appendChild(imgDiv);
    content.appendChild(infoDiv);

    overlay?.classList.add('open');
    overlay?.setAttribute('aria-hidden', 'false');
    modal?.classList.add('open');
    modal?.setAttribute('open', '');
    closeBtn?.focus();
    document.body.style.overflow = 'hidden';
  }

  // Close the quick-view modal
  function closeModal() {
    overlay?.classList.remove('open');
    overlay?.setAttribute('aria-hidden', 'true');
    modal?.classList.remove('open');
    modal?.removeAttribute('open');
    document.body.style.overflow = '';
  }

  // Wire up quick-view triggers and close events
  function init() {
    document.querySelectorAll('.quickview-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        openModal(btn.dataset.id);
      });
    });

    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal?.classList.contains('open')) closeModal();
    });
  }

  return { init };
})();

/* ═══════════════════════════════════
   NEWSLETTER
═══════════════════════════════════ */
const Newsletter = (() => {
  // Wire up the newsletter signup form
  function init() {
    const btn   = document.getElementById('nlSubmit');
    const input = document.getElementById('nlEmail');
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
      const val = input.value.trim();
      // Basic email validation
      if (isValidEmail(val)) {
        Toast.show('Subscribed! 🎉 Check your inbox.');
        input.value = '';
      } else {
        Toast.show('Please enter a valid email address.', 'error');
        input.focus();
      }
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') btn.click();
    });
  }

  return { init };
})();

/* ═══════════════════════════════════
   SCROLL REVEAL — Intersection Observer
═══════════════════════════════════ */
const ScrollReveal = (() => {
  // Reveal cards/sections as they scroll into view
  function init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.pcard, .tcard, .cat-card, .feat-item').forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  return { init };
})();

/* ═══════════════════════════════════
   KEYBOARD NAVIGATION
═══════════════════════════════════ */
const KeyboardNav = (() => {
  // Arrow-key navigation between product cards in the grid
  function init() {
    // Arrow key navigation in product grid
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    grid.addEventListener('keydown', e => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return;
      const cards  = [...grid.querySelectorAll('.pcard:not([style*="display: none"])')];
      const active = document.activeElement.closest('.pcard');
      if (!active) return;
      const idx   = cards.indexOf(active);
      const cols  = Math.round(grid.offsetWidth / active.offsetWidth);
      const delta = e.key === 'ArrowLeft'  ? -1
                  : e.key === 'ArrowRight' ?  1
                  : e.key === 'ArrowUp'    ? -cols
                  : cols;
      const next  = cards[idx + delta];
      if (next) {
        e.preventDefault();
        next.querySelector('button')?.focus();
      }
    });
  }

  return { init };
})();

/* ═══════════════════════════════════
   ENTRY ANIMATION — Gift Box
═══════════════════════════════════ */
const EntryAnimation = (() => {
  const STORAGE_KEY = 'gg-entry-shown';
  const CONFETTI_COLORS = ['#D4AF37','#6EC6CF','#FFA726','#fff','#4FB3BF','#FFD700','#a8f0f5','#ffd93d','#B8791A'];

  // Spawn confetti pieces inside the entry overlay
  function createConfetti() {
    const container = document.getElementById('confettiContainer');
    if (!container) return;
    for (let i = 0; i < 80; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.cssText = `
        left: ${Math.random() * 100}%;
        background: ${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation-duration: ${Math.random() * 2 + 2}s;
        animation-delay: ${Math.random() * 1.5}s;
        transform: rotate(${Math.random() * 360}deg);
      `;
      container.appendChild(piece);
    }
  }

  // Spawn a timed sequence of firework bursts
  function createFireworks() {
    const container = document.getElementById('fireworkContainer');
    if (!container) return;
    const positions = [
      { x: 20, y: 25 }, { x: 80, y: 20 }, { x: 15, y: 70 },
      { x: 85, y: 65 }, { x: 50, y: 15 }, { x: 50, y: 80 }
    ];
    positions.forEach((pos, i) => {
      setTimeout(() => {
        const burst = document.createElement('div');
        const size = Math.random() * 120 + 80;
        burst.className = 'firework-burst';
        burst.style.cssText = `
          left: ${pos.x}%;
          top: ${pos.y}%;
          width: ${size}px;
          height: ${size}px;
          margin: -${size/2}px;
          border: 3px solid ${CONFETTI_COLORS[i % CONFETTI_COLORS.length]};
          box-shadow: 0 0 20px ${CONFETTI_COLORS[i % CONFETTI_COLORS.length]};
          animation-duration: 0.9s;
          animation-delay: 0s;
        `;
        container.appendChild(burst);
        setTimeout(() => burst.remove(), 1000);
      }, i * 250);
    });
  }

  // Play the full gift-box opening sequence (lid, mascot, brand, fade-out)
  function openGift() {
    const scene   = document.getElementById('giftBoxScene');
    const brand   = document.getElementById('entryBrand');
    const overlay = document.getElementById('entryOverlay');
    const cartoon = document.getElementById('cartoonPopup');
    if (!scene) return;

    // 1. Lid opens
    scene.classList.add('opening');
    createConfetti();

    // 2. Cartoon pops out of box with "Hi!" bubble
    setTimeout(() => {
      if (cartoon) cartoon.classList.add('popped');
    }, 550);

    // 3. Brand text fades in + fireworks
    setTimeout(() => {
      if (brand) brand.classList.add('visible');
      createFireworks();
    }, 1000);

    // 4. Overlay fades out
    setTimeout(() => {
      if (overlay) overlay.classList.add('fade-out');
      setTimeout(() => {
        if (overlay) overlay.remove();
      }, 950);
    }, 3400);

    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
  }

  // Show the entry overlay once per session and wire up open triggers
  function init() {
    const overlay = document.getElementById('entryOverlay');
    if (!overlay) return;

    // Check session — only show once per session
    let alreadyShown = false;
    try { alreadyShown = !!sessionStorage.getItem(STORAGE_KEY); } catch (_) {}

    if (alreadyShown) {
      overlay.remove();
      return;
    }

    // Prevent page scroll while overlay is showing
    document.body.style.overflow = 'hidden';

    const giftScene = document.getElementById('giftBoxScene');

    // Click on gift box
    giftScene?.addEventListener('click', () => {
      document.body.style.overflow = '';
      openGift();
    });

    // Enter key triggers the animation
    document.addEventListener('keydown', function onEnter(e) {
      if (e.key === 'Enter') {
        document.removeEventListener('keydown', onEnter);
        document.body.style.overflow = '';
        openGift();
      }
    });

    // Also allow Space on the gift box button
    giftScene?.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        document.body.style.overflow = '';
        openGift();
      }
    });
  }

  return { init };
})();

/* ═══════════════════════════════════
   SEARCH SUGGESTIONS — Live dropdown
═══════════════════════════════════ */
const SearchSuggestions = (() => {
  // Static list of suggested search terms
  const suggestions = [
    'Perfume', 'Watch', 'Gift Box', 'Rose Bouquet', 'Hamper',
    'Engraved Gift', 'Luxury Set', 'Birthday Gift', 'Anniversary Gift',
    'Festival Hamper', 'Personalized Gift', 'Chocolate Box'
  ];

  // Wire up the live search-suggestions dropdown
  function init() {
    const input   = document.getElementById('searchInput');
    const dropdown = document.getElementById('searchSuggestions');
    if (!input || !dropdown) return;

    let highlighted = -1;

    // Render matching suggestions for the current query
    function renderSuggestions(query) {
      const q = query.toLowerCase().trim();
      if (!q) {
        closeSuggestions();
        return;
      }

      const matches = suggestions.filter(s => s.toLowerCase().includes(q));
      if (!matches.length) { closeSuggestions(); return; }

      dropdown.innerHTML = '';
      matches.slice(0, 6).forEach((text, idx) => {
        const item = document.createElement('div');
        item.className = 'search-suggestion-item';
        item.setAttribute('role', 'option');
        item.textContent = text;
        item.addEventListener('mousedown', e => {
          e.preventDefault();
          input.value = text;
          input.dispatchEvent(new Event('input'));
          closeSuggestions();
        });
        dropdown.appendChild(item);
      });

      dropdown.classList.add('open');
      highlighted = -1;
    }

    // Hide and reset the suggestions dropdown
    function closeSuggestions() {
      dropdown.classList.remove('open');
      highlighted = -1;
    }

    input.addEventListener('input', () => renderSuggestions(input.value));
    input.addEventListener('focus', () => { if (input.value) renderSuggestions(input.value); });
    input.addEventListener('blur', () => setTimeout(closeSuggestions, 150));

    // Arrow key navigation
    input.addEventListener('keydown', e => {
      const items = dropdown.querySelectorAll('.search-suggestion-item');
      if (!items.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlighted = Math.min(highlighted + 1, items.length - 1);
        items.forEach((it, i) => it.classList.toggle('highlighted', i === highlighted));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlighted = Math.max(highlighted - 1, -1);
        items.forEach((it, i) => it.classList.toggle('highlighted', i === highlighted));
      } else if (e.key === 'Enter' && highlighted >= 0) {
        e.preventDefault();
        input.value = items[highlighted].textContent;
        input.dispatchEvent(new Event('input'));
        closeSuggestions();
      }
    });
  }

  return { init };
})();

/* ═══════════════════════════════════
   WISHLIST NAV — heart icon sync
═══════════════════════════════════ */
const WishlistNav = (() => {
  // Sync the header wishlist icon + badge with localStorage
  function update() {
    const navIcon  = document.getElementById('wishlistNavIcon');
    const navBadge = document.getElementById('wishlistNavBadge');
    if (!navIcon || !navBadge) return;

    let count = 0;
    try {
      const raw = localStorage.getItem('gg-wishlist');
      const arr = raw ? JSON.parse(raw) : [];
      count = Array.isArray(arr) ? arr.length : 0;
    } catch (_) {}

    if (count > 0) {
      navIcon.textContent = '❤️';
      navBadge.textContent = count;
      navBadge.classList.add('visible');
    } else {
      navIcon.textContent = '🤍';
      navBadge.classList.remove('visible');
    }
  }

  // Initial sync plus live updates on wishlist changes
  function init() {
    update();
    // Watch for wishlist changes via storage events + MutationObserver trick
    window.addEventListener('storage', e => {
      if (e.key === 'gg-wishlist') update();
    });
    // Also poll lightly for same-tab changes (wish-btn clicks)
    document.addEventListener('click', e => {
      if (e.target.closest('.wish-btn')) {
        setTimeout(update, 50);
      }
    });
  }

  return { init };
})();

/* ═══════════════════════════════════
   PROFILE / LOGIN MODAL
═══════════════════════════════════ */
const ProfileLogin = (() => {
  // Build the login modal DOM and wire up its interactions
  function buildModal() {
    // Overlay
    const ov = document.createElement('div');
    ov.id = 'loginOverlay';
    ov.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(8px);
      z-index:9000;opacity:0;transition:opacity .3s;pointer-events:none;
      display:flex;align-items:center;justify-content:center;`;

    // Modal box
    const modal = document.createElement('div');
    modal.id = 'loginModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Login');
    modal.style.cssText = `
      background:var(--surface);border:1.5px solid var(--border-soft);border-radius:20px;
      padding:40px 36px;width:min(400px,90vw);max-height:90vh;overflow-y:auto;
      transform:scale(0.92) translateY(20px);transition:transform .35s cubic-bezier(.34,1.56,.64,1),opacity .3s;
      opacity:0;position:relative;box-shadow:0 30px 80px rgba(0,0,0,0.5);`;

    modal.innerHTML = `
      <button id="loginClose" aria-label="Close login" style="position:absolute;top:14px;right:14px;
        width:32px;height:32px;background:var(--cream-dark);border:1px solid var(--border-soft);
        border-radius:8px;font-size:14px;color:var(--warm-mid);cursor:pointer;
        display:flex;align-items:center;justify-content:center;transition:.25s">✕</button>
      <div style="text-align:center;margin-bottom:28px;">
        <div style="width:56px;height:56px;background:linear-gradient(135deg,var(--gold-light),var(--teal));
          border-radius:50%;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;
          font-size:26px;box-shadow:0 8px 24px rgba(110,198,207,0.4);">👤</div>
        <h2 style="font-family:var(--font-serif);font-size:26px;font-weight:600;letter-spacing:-0.02em;
          color:var(--text);margin-bottom:6px;">Welcome Back</h2>
        <p style="font-size:13.5px;color:var(--text-muted);font-weight:300;">Sign in to your GiftGenius account</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div>
          <label style="font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;
            text-transform:uppercase;color:var(--teal-dark);display:block;margin-bottom:7px;">Email</label>
          <input id="loginEmail" type="email" placeholder="you@example.com"
            style="width:100%;padding:12px 16px;background:var(--cream-dark);border:1.5px solid var(--border-soft);
            border-radius:8px;font-family:var(--font-sans);font-size:14px;color:var(--text);outline:none;
            transition:.25s;box-sizing:border-box;"
            onfocus="this.style.borderColor='var(--teal)';this.style.boxShadow='0 0 0 3px rgba(110,198,207,0.2)'"
            onblur="this.style.borderColor='';this.style.boxShadow=''">
        </div>
        <div>
          <label style="font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;
            text-transform:uppercase;color:var(--teal-dark);display:block;margin-bottom:7px;">Password</label>
          <input id="loginPassword" type="password" placeholder="••••••••"
            style="width:100%;padding:12px 16px;background:var(--cream-dark);border:1.5px solid var(--border-soft);
            border-radius:8px;font-family:var(--font-sans);font-size:14px;color:var(--text);outline:none;
            transition:.25s;box-sizing:border-box;"
            onfocus="this.style.borderColor='var(--teal)';this.style.boxShadow='0 0 0 3px rgba(110,198,207,0.2)'"
            onblur="this.style.borderColor='';this.style.boxShadow=''">
        </div>
        <button id="loginSubmit" style="background:linear-gradient(135deg,var(--ink),var(--charcoal));
          color:var(--cream);border:none;padding:14px;border-radius:8px;font-size:14.5px;font-weight:500;
          cursor:pointer;transition:.25s;letter-spacing:.01em;margin-top:4px;"
          onmouseover="this.style.background='linear-gradient(135deg,var(--teal-dark),var(--teal))';this.style.boxShadow='0 8px 24px rgba(110,198,207,0.35)'"
          onmouseout="this.style.background='linear-gradient(135deg,var(--ink),var(--charcoal))';this.style.boxShadow=''">
          Sign In →
        </button>
        <div style="text-align:center;">
          <a href="#" style="font-size:12.5px;color:var(--teal-dark);text-decoration:none;transition:.2s;"
            onmouseover="this.style.color='var(--teal)'" onmouseout="this.style.color='var(--teal-dark)'">
            Forgot password?</a>
        </div>
        <div style="border-top:1px solid var(--border-soft);padding-top:18px;text-align:center;">
          <p style="font-size:13px;color:var(--text-muted);">Don't have an account?
            <a href="#" style="color:var(--gold);font-weight:500;text-decoration:none;">Sign up free</a>
          </p>
        </div>
      </div>`;

    ov.appendChild(modal);
    document.body.appendChild(ov);

    // Open helper
    function open() {
      ov.style.opacity = '1';
      ov.style.pointerEvents = 'all';
      modal.style.opacity = '1';
      modal.style.transform = 'scale(1) translateY(0)';
      document.body.style.overflow = 'hidden';
      setTimeout(() => document.getElementById('loginEmail')?.focus(), 100);
    }

    function close() {
      ov.style.opacity = '0';
      ov.style.pointerEvents = 'none';
      modal.style.opacity = '0';
      modal.style.transform = 'scale(0.92) translateY(20px)';
      document.body.style.overflow = '';
    }

    // Close events
    document.getElementById('loginClose').addEventListener('click', close);
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && ov.style.opacity === '1') close(); });

    // Login submit
    document.getElementById('loginSubmit').addEventListener('click', () => {
      const email = document.getElementById('loginEmail').value.trim();
      const pass  = document.getElementById('loginPassword').value;
      if (!email || !pass) {
        Toast.show('Please fill in all fields.', 'error');
        return;
      }
      if (!isValidEmail(email)) {
        Toast.show('Please enter a valid email.', 'error');
        return;
      }
      Toast.show('Welcome to GiftGenius! 🎁');
      close();
    });

    // Enter key submit
    [document.getElementById('loginEmail'), document.getElementById('loginPassword')]
      .forEach(inp => inp?.addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('loginSubmit').click();
      }));

    return { open, close };
  }

  // Mount the login modal and bind it to the account icon button
  function init() {
    const profileModal = buildModal();

    // Attach to the account (👤) icon button
    document.querySelectorAll('.icon-btn').forEach(btn => {
      if (btn.textContent.trim() === '👤' || btn.title === 'Account') {
        btn.addEventListener('click', () => profileModal.open());
      }
    });
  }

  return { init };
})();
/* ═══════════════════════════════════
   APP INIT
═══════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();

  EntryAnimation.init();
  Theme.init();
  NavPill.init();
  MobileMenu.init();
  Cart.init();
  Wishlist.init();
  WishlistNav.init();
  AddToCart.init();
  Search.init();
  SearchSuggestions.init();
  FilterPills.init();
  Sort.init();
  QuickView.init();
  Newsletter.init();
  ScrollReveal.init();
  KeyboardNav.init();
  ProfileLogin.init();
});
