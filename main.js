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

/* ═══════════════════════════════════
   TOAST
═══════════════════════════════════ */
const Toast = (() => {
  const toastEl = document.getElementById('toast');
  const msgEl   = document.getElementById('toastMsg');
  let timer;

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

  function applyTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (iconEl) iconEl.textContent = dark ? '☀️' : '🌙';
    btn?.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn?.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    try { localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light'); } catch (_) {}
  }

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
  function init() {
    const pill  = document.getElementById('navPill');
    if (!pill) return;
    const links = pill.querySelectorAll('a');

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

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function open() {
    overlay.classList.add('open');
    sidebar.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    document.getElementById('cartClose')?.focus();
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('open');
    sidebar.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    document.getElementById('cartToggle')?.focus();
    document.body.style.overflow = '';
  }

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

  function removeItem(index) {
    const item = state.items[index];
    if (!item) return;
    state.total -= item.price * (item.qty || 1);
    state.count -= (item.qty || 1);
    state.items.splice(index, 1);
    save();
    render();
  }

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

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...wished])); } catch (_) {}
  }

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
  function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.textContent = loading ? '…' : '+ Add';
  }

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
    const input  = document.getElementById('searchInput');
    const status = document.getElementById('searchStatus');
    if (!input) return;

    const handleSearch = debounce(() => {
      const query = input.value.trim();
      const cards = document.querySelectorAll('.pcard');
      let visible = 0;

      cards.forEach(card => {
        const name = card.dataset.name || '';
        const match = fuzzyMatch(name, query);
        card.style.display = match ? '' : 'none';
        if (match) visible++;
      });

      // Announce results for screen readers
      if (status) {
        status.textContent = query
          ? `${visible} product${visible !== 1 ? 's' : ''} found`
          : '';
      }
    }, 250);

    input.addEventListener('input', handleSearch);

    // Clear on Escape
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
    const cards = document.querySelectorAll('.pcard');

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
        pill.classList.add('active');
        pill.setAttribute('aria-pressed', 'true');

        const filter = pill.dataset.filter;
        cards.forEach(card => {
          const show = filter === 'all' || (card.dataset.tags || '').includes(filter);
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  return { init };
})();

/* ═══════════════════════════════════
   SORT
═══════════════════════════════════ */
const Sort = (() => {
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

  function closeModal() {
    overlay?.classList.remove('open');
    overlay?.setAttribute('aria-hidden', 'true');
    modal?.classList.remove('open');
    modal?.removeAttribute('open');
    document.body.style.overflow = '';
  }

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
  function init() {
    const btn   = document.getElementById('nlSubmit');
    const input = document.getElementById('nlEmail');
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
      const val = input.value.trim();
      // Basic email validation
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
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
   APP INIT
═══════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  NavPill.init();
  MobileMenu.init();
  Cart.init();
  Wishlist.init();
  AddToCart.init();
  Search.init();
  FilterPills.init();
  Sort.init();
  QuickView.init();
  Newsletter.init();
  ScrollReveal.init();
  KeyboardNav.init();
});
