/**
 * Aura Beauty Luxury E-Commerce - Main Client Engine
 * Handles interactive cart state, shipping progress, drawer, gallery switcher, and order tracking.
 */

(function () {
  'use strict';

  const getAsset = (key, fallback) => {
    return (window.AURA_ASSETS && window.AURA_ASSETS[key]) || fallback;
  };

  // Default seed products
  const PRODUCTS = [
    {
      id: "elixir-01",
      handle: "luminous-dew-elixir",
      title: "Luminous Dew Elixir",
      category: "Revitalizing Concentrate",
      price: 68.00,
      image: getAsset('serum', '/assets/serum.png'),
      badge: "Best Seller",
      rating: 4.9,
      reviews: 142,
      volume: "30ml / 1.0 fl oz",
      benefit: "Multi-Active Botanical Face Serum & Illuminating Treatment."
    },
    {
      id: "cream-02",
      handle: "whipped-barrier-cream",
      title: "Whipped Barrier Cream",
      category: "Restorative Moisture",
      price: 62.00,
      image: getAsset('barrierCream', '/assets/barrier-cream.png'),
      badge: "Award Winner",
      rating: 4.8,
      reviews: 98,
      volume: "50ml / 1.7 oz",
      benefit: "Lipid-replenishing ceramides and soothing botanical squalane."
    },
    {
      id: "oil-03",
      handle: "petal-rose-lip-oil",
      title: "Petal Rose Lip Oil",
      category: "Sensory Treatment",
      price: 34.00,
      image: getAsset('lipOil', '/assets/lip-oil.png'),
      badge: "New Arrival",
      rating: 4.9,
      reviews: 64,
      volume: "7ml / 0.24 fl oz",
      benefit: "Sheer peptide tint infused with cold-pressed damask rose extract."
    },
    {
      id: "nectar-04",
      handle: "botanical-radiance-nectar",
      title: "Botanical Radiance Nectar",
      category: "Overnight Renewal",
      price: 74.00,
      image: getAsset('serum', '/assets/serum.png'),
      badge: "Clean Formula",
      rating: 5.0,
      reviews: 82,
      volume: "30ml / 1.0 fl oz",
      benefit: "Micro-algae extracts and restorative bakuchiol for luminous morning glow."
    }
  ];

  const SHIPPING_THRESHOLD = 117.00;

  // Cart State Manager backed by localStorage
  window.AuraCart = {
    items: [],

    init() {
      const saved = localStorage.getItem('aura_cart_items');
      if (saved) {
        try {
          this.items = JSON.parse(saved);
        } catch (e) {
          this.items = [];
        }
      }
      if (!this.items || this.items.length === 0) {
        // Initial state matching the design mock (2 items, subtotal $100)
        this.items = [
          {
            id: "elixir-01",
            title: "Luminous Dew Elixir",
            category: "Revitalizing Concentrate",
            price: 68.00,
            quantity: 1,
            image: getAsset('serum', '/assets/serum.png'),
            volume: "30ml / 1.0 fl oz"
          },
          {
            id: "oil-03",
            title: "Petal Rose Lip Oil",
            category: "Sensory Treatment",
            price: 32.00,
            quantity: 1,
            image: getAsset('lipOil', '/assets/lip-oil.png'),
            volume: "7ml / 0.24 fl oz"
          }
        ];
        this.save();
      }
      this.updateUI();
    },

    save() {
      localStorage.setItem('aura_cart_items', JSON.stringify(this.items));
      this.updateUI();
    },

    addItem(product, qty = 1) {
      const existing = this.items.find(i => i.id === product.id);
      if (existing) {
        existing.quantity += qty;
      } else {
        this.items.push({
          id: product.id,
          title: product.title,
          category: product.category || "Luxury Skincare",
          price: product.price,
          quantity: qty,
          image: product.image,
          volume: product.volume || "Standard Size"
        });
      }
      this.save();
      this.openDrawer();
    },

    updateQuantity(productId, delta) {
      const item = this.items.find(i => i.id === productId);
      if (!item) return;
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeItem(productId);
        return;
      }
      this.save();
    },

    removeItem(productId) {
      this.items = this.items.filter(i => i.id !== productId);
      this.save();
    },

    getSubtotal() {
      return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    getCount() {
      return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },

    updateUI() {
      const count = this.getCount();
      const subtotal = this.getSubtotal();
      const remaining = Math.max(0, SHIPPING_THRESHOLD - subtotal);
      const percentage = Math.min(100, Math.round((subtotal / SHIPPING_THRESHOLD) * 100));

      // Update badge counts
      document.querySelectorAll('.cart-count-badge').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'flex' : 'none';
      });

      // Update Shipping Progress
      document.querySelectorAll('#shipping-progress, .progress-fill').forEach(el => {
        el.style.width = percentage + '%';
      });

      document.querySelectorAll('.shipping-remaining-text').forEach(el => {
        if (remaining <= 0) {
          el.innerHTML = '<strong style="color: var(--color-success)">Unlocked! You qualify for complimentary shipping & deluxe miniature sample!</strong>';
        } else {
          el.innerHTML = `Add <span style="font-weight: 600; color: var(--color-text-primary);">$${remaining.toFixed(2)}</span> more to unlock complimentary carbon-neutral shipping & a deluxe 5ml botanical sample.`;
        }
      });

      document.querySelectorAll('.shipping-percent-text').forEach(el => {
        el.textContent = `${percentage}% Reached`;
      });

      document.querySelectorAll('.cart-subtotal-text').forEach(el => {
        el.textContent = `$${subtotal.toFixed(2)}`;
      });

      document.querySelectorAll('.cart-total-text').forEach(el => {
        el.textContent = `$${subtotal.toFixed(2)}`;
      });

      // Render Drawer Items if drawer exists
      const drawerList = document.querySelector('.cart-drawer-items');
      if (drawerList) {
        if (this.items.length === 0) {
          drawerList.innerHTML = `
            <div style="text-align: center; padding: 2rem 1rem; color: var(--color-text-secondary);">
              <span class="material-symbols-outlined" style="font-size: 36px; margin-bottom: 0.5rem; opacity: 0.5;">shopping_bag</span>
              <p style="font-family: var(--font-serif); font-size: 1.1rem; color: var(--color-text-primary);">Your ritual bag is empty</p>
              <p style="font-size: 0.85rem; margin-top: 0.5rem;">Explore our curated botanical elixirs.</p>
              <a href="/collection" class="btn-primary" style="margin-top: 1rem; width: 100%; border-radius: var(--radius-full);">Discover Collection</a>
            </div>
          `;
        } else {
          drawerList.innerHTML = this.items.map(item => `
            <div style="display: flex; gap: 1rem; padding: 0.85rem 0; border-bottom: 1px solid var(--color-border); align-items: center;">
              <img src="${item.image}" alt="${item.title}" style="width: 64px; height: 72px; object-fit: cover; border-radius: var(--radius-md); background: var(--color-surface-container);">
              <div style="flex: 1; min-width: 0;">
                <p style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-secondary); margin-bottom: 2px;">${item.category}</p>
                <h4 style="font-family: var(--font-serif); font-size: 0.95rem; font-weight: 500; color: var(--color-text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.title}</h4>
                <p style="font-weight: 600; font-size: 0.85rem; margin-top: 4px;">$${item.price.toFixed(2)}</p>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 6px;">
                  <div style="display: inline-flex; align-items: center; border: 1px solid var(--color-border); border-radius: var(--radius-full); background: var(--color-surface-low);">
                    <button onclick="window.AuraCart.updateQuantity('${item.id}', -1)" style="padding: 2px 8px; font-weight: bold;">−</button>
                    <span style="font-size: 0.75rem; padding: 0 4px; font-weight: 600;">${item.quantity}</span>
                    <button onclick="window.AuraCart.updateQuantity('${item.id}', 1)" style="padding: 2px 8px; font-weight: bold;">+</button>
                  </div>
                  <button onclick="window.AuraCart.removeItem('${item.id}')" style="font-size: 0.75rem; color: var(--color-text-muted); text-decoration: underline; margin-left: auto;">Remove</button>
                </div>
              </div>
            </div>
          `).join('');
        }
      }

      // Render Cart Page Items if table/container exists
      const cartPageList = document.querySelector('.cart-page-items');
      if (cartPageList) {
        if (this.items.length === 0) {
          cartPageList.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem; background: var(--color-surface-card); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
              <span class="material-symbols-outlined" style="font-size: 48px; color: var(--color-secondary); margin-bottom: 0.75rem;">spa</span>
              <h2 style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--color-text-primary); margin-bottom: 0.5rem;">Your Ritual Bag is Empty</h2>
              <p style="color: var(--color-text-secondary); max-width: 400px; margin: 0 auto 1.5rem;">Cultivate your daily glow with our bio-compatible botanical formulations.</p>
              <a href="/collection" class="btn-primary btn-pill">Explore the Collection</a>
            </div>
          `;
        } else {
          cartPageList.innerHTML = this.items.map(item => `
            <div class="cart-item-card" style="display: flex; gap: 1.25rem; padding: 1.25rem; background: var(--color-surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); margin-bottom: 1rem; position: relative;">
              <img src="${item.image}" alt="${item.title}" style="width: 90px; height: 105px; object-fit: cover; border-radius: var(--radius-md); background: var(--color-surface-container);">
              <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                      <span style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-secondary); font-weight: 600;">${item.category}</span>
                      <h3 style="font-family: var(--font-serif); font-size: 1.15rem; color: var(--color-text-primary); margin-top: 2px;">${item.title}</h3>
                      <p style="font-size: 0.8rem; color: var(--color-text-secondary);">${item.volume}</p>
                    </div>
                    <button onclick="window.AuraCart.removeItem('${item.id}')" aria-label="Remove item" style="color: var(--color-text-muted); padding: 4px;">
                      <span class="material-symbols-outlined" style="font-size: 18px;">close</span>
                    </button>
                  </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem;">
                  <div style="display: inline-flex; align-items: center; border: 1px solid var(--color-border); border-radius: var(--radius-full); background: var(--color-surface-low); padding: 2px 6px;">
                    <button onclick="window.AuraCart.updateQuantity('${item.id}', -1)" style="padding: 2px 8px; font-size: 14px; font-weight: bold;">−</button>
                    <span style="font-size: 0.85rem; padding: 0 8px; font-weight: 600;">${item.quantity}</span>
                    <button onclick="window.AuraCart.updateQuantity('${item.id}', 1)" style="padding: 2px 8px; font-size: 14px; font-weight: bold;">+</button>
                  </div>
                  <span style="font-family: var(--font-serif); font-size: 1.1rem; font-weight: 600; color: var(--color-text-primary);">$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          `).join('');
        }
      }
    },

    openDrawer() {
      const overlay = document.querySelector('.cart-drawer-overlay');
      if (overlay) overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    },

    closeDrawer() {
      const overlay = document.querySelector('.cart-drawer-overlay');
      if (overlay) overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  // Product Gallery Switcher
  window.switchProductSlide = function (index) {
    const mainImg = document.getElementById('main-product-image');
    const dots = document.querySelectorAll('.gallery-dot');
    const thumbs = document.querySelectorAll('.thumb-btn');

    const images = [
      getAsset('serum', '/assets/serum.png'),
      getAsset('lipOil', '/assets/lip-oil.png'),
      getAsset('portrait', '/assets/portrait.png')
    ];

    if (mainImg && images[index]) {
      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = images[index];
        mainImg.style.opacity = '1';
      }, 150);
    }

    dots.forEach((d, i) => {
      d.style.backgroundColor = (i === index) ? 'var(--color-text-primary)' : 'var(--color-border)';
    });

    thumbs.forEach((t, i) => {
      if (i === index) {
        t.style.opacity = '1';
        t.style.borderColor = 'var(--color-text-primary)';
      } else {
        t.style.opacity = '0.6';
        t.style.borderColor = 'transparent';
      }
    });
  };

  // Accordion Toggle
  window.toggleAccordion = function (btn) {
    const item = btn.closest('.accordion-item');
    if (!item) return;
    const wasActive = item.classList.contains('active');
    
    // Optional: close other accordions in the same group
    const parent = item.parentElement;
    parent.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));

    if (!wasActive) {
      item.classList.add('active');
    }
  };

  // Order Tracking Lookup
  window.trackOrder = function (event) {
    if (event) event.preventDefault();
    const orderInput = document.getElementById('tracking-order-input');
    const resultBox = document.getElementById('tracking-result');
    if (!orderInput || !resultBox) return;

    const val = orderInput.value.trim().toUpperCase() || "#AURA-8492";

    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <div style="background: var(--color-surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 1.5rem; margin-top: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid var(--color-border); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
          <div>
            <span class="badge-award">In Transit • On Schedule</span>
            <h3 style="font-family: var(--font-serif); font-size: 1.25rem; margin-top: 0.5rem; color: var(--color-text-primary);">Order ${val}</h3>
            <p style="font-size: 0.8rem; color: var(--color-text-secondary);">Carrier: Carbon-Neutral Botanical Courier (Tracking #BC-9928174)</p>
          </div>
          <span style="font-weight: 600; color: var(--color-text-primary); font-size: 0.9rem;">Estimated Delivery: Tomorrow by 4:00 PM</span>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 1rem; position: relative; padding-left: 1.5rem;">
          <div style="position: absolute; left: 6px; top: 10px; bottom: 10px; width: 2px; background: var(--color-blush-accent);"></div>
          
          <div style="position: relative;">
            <div style="position: absolute; left: -1.5rem; top: 2px; width: 14px; height: 14px; border-radius: 50%; background: var(--color-secondary);"></div>
            <p style="font-weight: 600; font-size: 0.875rem; color: var(--color-text-primary);">Out for Local Delivery</p>
            <p style="font-size: 0.75rem; color: var(--color-text-secondary);">Courier vehicle dispatched with temperature-controlled packaging • 8:45 AM</p>
          </div>

          <div style="position: relative;">
            <div style="position: absolute; left: -1.5rem; top: 2px; width: 14px; height: 14px; border-radius: 50%; background: var(--color-secondary);"></div>
            <p style="font-weight: 600; font-size: 0.875rem; color: var(--color-text-primary);">Arrived at Regional Distribution Hub</p>
            <p style="font-size: 0.75rem; color: var(--color-text-secondary);">Clean cosmetics facility sorting complete • Yesterday, 6:15 PM</p>
          </div>

          <div style="position: relative;">
            <div style="position: absolute; left: -1.5rem; top: 2px; width: 14px; height: 14px; border-radius: 50%; background: var(--color-secondary);"></div>
            <p style="font-weight: 600; font-size: 0.875rem; color: var(--color-text-primary);">Handcrafted &amp; Packaged with Care</p>
            <p style="font-size: 0.75rem; color: var(--color-text-secondary);">Recycled cashmere silk paper and seed-infused outer box • Sep 22, 11:20 AM</p>
          </div>
        </div>
      </div>
    `;
  };

  // Quick Add Trigger Helper
  window.quickAddProduct = function (productId) {
    const p = PRODUCTS.find(prod => prod.id === productId) || PRODUCTS[0];
    window.AuraCart.addItem(p, 1);
  };

  // Safe View Router for Multi-Section Seamless Navigation
  const VALID_VIEWS = ['home', 'collection', 'product', 'cart', 'checkout', 'faq', 'blog', 'about', 'contact', 'tracking'];

  window.switchView = function (viewName, pushState = true) {
    if (!viewName || !VALID_VIEWS.includes(viewName)) {
      viewName = 'home';
    }

    const allSections = document.querySelectorAll('[data-view-section]');
    if (allSections.length > 0) {
      allSections.forEach(sec => {
        const parent = sec.closest('.shopify-section') || sec;
        if (sec.getAttribute('data-view-section') === viewName) {
          parent.style.display = 'block';
        } else {
          parent.style.display = 'none';
        }
      });
    }

    // Update active highlight in quick demo bar and header navigation
    document.querySelectorAll('[data-view]').forEach(link => {
      if (link.getAttribute('data-view') === viewName) {
        link.classList.add('active');
        link.style.opacity = '1';
        link.style.fontWeight = '700';
      } else {
        link.classList.remove('active');
        link.style.fontWeight = 'normal';
      }
    });

    if (pushState && window.location.hash !== '#' + viewName) {
      try {
        window.history.pushState({ view: viewName }, '', '#' + viewName);
      } catch (e) {
        // Fallback for sandboxed preview iframe
        window.location.hash = viewName;
      }
    }

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh dynamic widgets if switching to tracking or cart
    if (viewName === 'tracking' && window.trackOrder) {
      setTimeout(() => window.trackOrder(), 60);
    }
    if (viewName === 'cart' && window.AuraCart) {
      window.AuraCart.updateUI();
    }
  };

  // Initialize upon DOM load
  document.addEventListener('DOMContentLoaded', () => {
    window.AuraCart.init();

    // Attach drawer triggers
    document.querySelectorAll('[data-action="open-cart"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.AuraCart.openDrawer();
      });
    });

    document.querySelectorAll('[data-action="close-cart"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.AuraCart.closeDrawer();
      });
    });

    // Initialize View Router safely (no reloads, no infinite redirects)
    let initialView = 'home';
    const hash = (window.location.hash || '').replace('#', '').toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');

    if (VALID_VIEWS.includes(hash)) {
      initialView = hash;
    } else if (viewParam && VALID_VIEWS.includes(viewParam)) {
      initialView = viewParam;
    }

    window.switchView(initialView, false);

    // Listen to hash changes (back/forward browser navigation)
    window.addEventListener('hashchange', () => {
      const h = (window.location.hash || '').replace('#', '').toLowerCase();
      if (VALID_VIEWS.includes(h)) {
        window.switchView(h, false);
      }
    });

    // Global click listener for view switching
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-view], a[href^="#"]');
      if (target) {
        const view = target.getAttribute('data-view') || (target.getAttribute('href') && target.getAttribute('href').replace('#', ''));
        if (view && VALID_VIEWS.includes(view)) {
          e.preventDefault();
          window.switchView(view);
        }
      }
    });
  });

})();
