/**
 * SmartRetail AI - Storefront E-commerce Controller
 * Implements customer shopping, branch availability, cart, checkout, tracking, and account
 */

class StoreApp {
  constructor() {
    this.cart = this.loadCart();
    this.activeCategory = 'All';
    this.activeSort = 'featured';
    this.searchQuery = '';
    this.selectedBranchFilter = 'All'; // Filter catalog stock by branch or global
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderCategories();
    this.renderCatalog();
    this.updateCartBadge();

    // Subscribe to state changes (e.g. if POS sells stock, storefront updates availability!)
    stateManager.subscribe('inventory', () => {
      this.renderCatalog();
    });
  }

  loadCart() {
    try {
      const saved = localStorage.getItem('smartretail_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveCart() {
    localStorage.setItem('smartretail_cart', JSON.stringify(this.cart));
    this.updateCartBadge();
  }

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('store-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderCatalog();
      });
    }

    // Sort select
    const sortSelect = document.getElementById('store-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.activeSort = e.target.value;
        this.renderCatalog();
      });
    }

    // Branch filter select
    const branchFilter = document.getElementById('store-branch-filter');
    if (branchFilter) {
      branchFilter.addEventListener('change', (e) => {
        this.selectedBranchFilter = e.target.value;
        this.renderCatalog();
      });
    }

    // Cart drawer toggle
    const cartBtn = document.getElementById('cart-toggle-btn');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartDrawer = document.getElementById('cart-drawer');

    const toggleCart = (open) => {
      if (open) {
        this.renderCartDrawer();
        cartOverlay.classList.add('active');
        cartDrawer.classList.add('active');
      } else {
        cartOverlay.classList.remove('active');
        cartDrawer.classList.remove('active');
      }
    };

    if (cartBtn) cartBtn.addEventListener('click', () => toggleCart(true));
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', () => toggleCart(false));
    if (cartOverlay) cartOverlay.addEventListener('click', () => toggleCart(false));

    // Checkout button
    const checkoutBtn = document.getElementById('proceed-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        toggleCart(false);
        this.openCheckoutModal();
      });
    }

    // Track order quick button
    const trackNavBtn = document.getElementById('nav-track-order');
    if (trackNavBtn) {
      trackNavBtn.addEventListener('click', () => this.openOrderTrackingModal());
    }

    // Customer account button
    const accountBtn = document.getElementById('nav-account');
    if (accountBtn) {
      accountBtn.addEventListener('click', () => this.openAccountModal());
    }
  }

  renderCategories() {
    const container = document.getElementById('categories-list');
    if (!container) return;

    const allProducts = stateManager.get('products') || [];
    const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)));
    const categories = ['All', ...uniqueCategories];

    container.innerHTML = categories.map(cat => `
      <li class="store-cat-link ${this.activeCategory === cat ? 'active' : ''}" data-cat="${cat}">
        ${cat}
      </li>
    `).join('');

    container.querySelectorAll('.store-cat-link').forEach(link => {
      link.addEventListener('click', (e) => {
        this.activeCategory = e.currentTarget.dataset.cat;
        this.renderCategories();
        this.renderCatalog();
      });
    });
  }

  renderCatalog() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    let products = stateManager.get('products') || [];

    // Filter by Category
    if (this.activeCategory !== 'All') {
      products = products.filter(p => p.category === this.activeCategory);
    }

    // Filter by Search Query
    if (this.searchQuery) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(this.searchQuery) ||
        p.brand.toLowerCase().includes(this.searchQuery) ||
        p.sku.toLowerCase().includes(this.searchQuery) ||
        p.category.toLowerCase().includes(this.searchQuery)
      );
    }

    // Sorting
    if (this.activeSort === 'price-low') {
      products.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (this.activeSort === 'price-high') {
      products.sort((a, b) => b.sellingPrice - a.sellingPrice);
    } else if (this.activeSort === 'rating') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    if (products.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">${Icons.get('box', '', 48)}</div>
          <h3 class="font-semibold text-lg">No accessories found</h3>
          <p class="text-sm text-muted">Try clearing search filters or selecting another category.</p>
        </div>
      `;
      return;
    }

    const branches = stateManager.get('branches') || [];

    grid.innerHTML = products.map(prod => {
      // Calculate available stock based on branch filter
      let availableStock = 0;
      let branchLabel = 'All Branches Total';

      if (this.selectedBranchFilter === 'All') {
        availableStock = inventoryService.getTotalAvailableStock(prod.sku);
      } else {
        availableStock = inventoryService.getAvailableStock(prod.sku, this.selectedBranchFilter);
        const b = branches.find(item => item.id === this.selectedBranchFilter);
        branchLabel = b ? b.name : this.selectedBranchFilter;
      }

      const stockBadge = availableStock > 5
        ? `<span class="badge badge-success"><span class="badge-dot"></span>In Stock (${availableStock})</span>`
        : availableStock > 0
        ? `<span class="badge badge-warning"><span class="badge-dot"></span>Low Stock (${availableStock})</span>`
        : `<span class="badge badge-danger"><span class="badge-dot"></span>Out of Stock</span>`;

      const khrAmount = Math.round(prod.sellingPrice * 4100).toLocaleString();

      return `
        <div class="product-card" data-sku="${prod.sku}">
          <div class="product-stock-tag">${stockBadge}</div>
          <div class="product-khqr-tag">${Icons.get('qr-code', '', 11)} KHQR</div>
          <div class="product-img-wrap">
            <img src="${prod.image}" alt="${prod.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=500&q=80'" />
          </div>
          <div class="product-info">
            <span class="product-brand">${prod.brand}</span>
            <h4 class="product-title" title="${prod.name}">${prod.name}</h4>
            <div class="product-rating-row">
              <span class="product-rating-stars">${Icons.get('star', '', 13)}</span>
              <span style="font-weight:600; color:var(--foreground);">${prod.rating || 4.8}</span>
              <span>(${prod.reviewsCount || 45})</span>
              <span style="margin-left:auto; font-size:11px;">SKU: ${prod.sku}</span>
            </div>
            <div class="product-meta">
              <div class="product-price-block">
                <span class="product-price">$${prod.sellingPrice.toFixed(2)}</span>
                <span class="product-khr-price">≈ ${khrAmount} ៛</span>
              </div>
              <span class="badge badge-secondary" style="font-size:11px;">${prod.warranty}</span>
            </div>
          </div>
          <div class="product-card-actions">
            <button class="btn btn-outline btn-sm quick-view-btn" data-sku="${prod.sku}">
              ${Icons.get('eye', '', 14)} View
            </button>
            <button class="btn btn-primary btn-sm add-cart-btn" data-sku="${prod.sku}" ${availableStock <= 0 ? 'disabled' : ''}>
              ${Icons.get('shopping-bag', '', 14)} Add
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach card event handlers
    grid.querySelectorAll('.quick-view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.openProductQuickView(e.currentTarget.dataset.sku));
    });

    grid.querySelectorAll('.add-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sku = e.currentTarget.dataset.sku;
        this.addToCart(sku, 1);
      });
    });
  }

  addToCart(sku, quantity = 1) {
    const products = stateManager.get('products') || [];
    const prod = products.find(p => p.sku === sku);
    if (!prod) return;

    const existing = this.cart.find(i => i.sku === sku);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({
        sku: prod.sku,
        name: prod.name,
        price: prod.sellingPrice,
        image: prod.image,
        brand: prod.brand,
        quantity: quantity
      });
    }

    this.saveCart();
    toast.success(`Added "${prod.name}" to cart!`);
    this.renderCartDrawer();
  }

  updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    const totalCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? 'flex' : 'none';
  }

  renderCartDrawer() {
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('proceed-checkout-btn');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${Icons.get('shopping-bag', '', 40)}</div>
          <p class="font-medium text-sm">Your shopping bag is empty.</p>
          <p class="text-xs text-muted" style="margin-top:4px;">Explore our chargers, cables, and audio accessories.</p>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = '$0.00';
      if (totalEl) totalEl.textContent = '$0.00';
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    container.innerHTML = this.cart.map(item => `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.image}" alt="${item.name}" />
        <div class="cart-item-info">
          <h5 style="font-size:0.85rem; font-weight:600; line-height:1.3; margin-bottom:4px;">${item.name}</h5>
          <div style="font-size:0.8rem; font-weight:700; color:#1e3a8a; margin-bottom:6px;">
            $${item.price.toFixed(2)}
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <div class="cart-qty-ctrl">
              <button class="cart-dec-btn" data-sku="${item.sku}">-</button>
              <span>${item.quantity}</span>
              <button class="cart-inc-btn" data-sku="${item.sku}">+</button>
            </div>
            <button class="btn btn-ghost btn-sm cart-del-btn" data-sku="${item.sku}" style="color:#ef4444; font-size:11px;">
              ${Icons.get('x', '', 14)} Remove
            </button>
          </div>
        </div>
      </div>
    `).join('');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (checkoutBtn) checkoutBtn.disabled = false;

    // Attach qty button listeners
    container.querySelectorAll('.cart-dec-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sku = e.currentTarget.dataset.sku;
        const item = this.cart.find(i => i.sku === sku);
        if (item) {
          if (item.quantity > 1) {
            item.quantity--;
          } else {
            this.cart = this.cart.filter(i => i.sku !== sku);
          }
          this.saveCart();
          this.renderCartDrawer();
        }
      });
    });

    container.querySelectorAll('.cart-inc-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sku = e.currentTarget.dataset.sku;
        const item = this.cart.find(i => i.sku === sku);
        if (item) {
          item.quantity++;
          this.saveCart();
          this.renderCartDrawer();
        }
      });
    });

    container.querySelectorAll('.cart-del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sku = e.currentTarget.dataset.sku;
        this.cart = this.cart.filter(i => i.sku !== sku);
        this.saveCart();
        this.renderCartDrawer();
      });
    });
  }

  openProductQuickView(sku) {
    const products = stateManager.get('products') || [];
    const prod = products.find(p => p.sku === sku);
    if (!prod) return;

    const branches = stateManager.get('branches') || [];
    const branchStockRows = branches.map(b => {
      const avail = inventoryService.getAvailableStock(sku, b.id);
      const badge = avail > 0
        ? `<span class="badge badge-success">${avail} Available</span>`
        : `<span class="badge badge-danger">Out of Stock</span>`;
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #f1f5f9; font-size:12px;">
          <span style="font-weight:500;">${b.name} (${b.id})</span>
          ${badge}
        </div>
      `;
    }).join('');

    const specsHtml = prod.specs ? Object.entries(prod.specs).map(([k, v]) => `
      <div style="display:flex; justify-content:space-between; font-size:12px; padding:4px 0;">
        <span style="color:#64748b;">${k}:</span>
        <span style="font-weight:500;">${v}</span>
      </div>
    `).join('') : '';

    const content = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
        <div style="background:#f8fafc; border-radius:12px; padding:20px; display:flex; align-items:center; justify-content:center;">
          <img src="${prod.image}" alt="${prod.name}" style="max-height:260px; object-fit:contain;" />
        </div>
        <div style="display:flex; flex-direction:column;">
          <span style="font-size:11px; font-weight:700; color:#2563eb; text-transform:uppercase;">${prod.brand} &bull; ${prod.category}</span>
          <h3 style="font-size:1.25rem; font-weight:700; margin:4px 0 8px;">${prod.name}</h3>
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
            <span style="font-size:1.5rem; font-weight:800; color:#0f172a;">$${prod.sellingPrice.toFixed(2)}</span>
            <span style="font-size:0.75rem; color:#64748b; background:#f1f5f9; padding:2px 8px; border-radius:999px;">${prod.warranty} Warranty</span>
          </div>
          <p style="font-size:13px; color:#475569; line-height:1.5; margin-bottom:16px;">${prod.description}</p>
          
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:16px;">
            <div style="font-size:11px; font-weight:700; color:#334155; margin-bottom:6px; text-transform:uppercase;">Branch Stock Availability:</div>
            ${branchStockRows}
          </div>

          <div style="display:flex; gap:10px; margin-top:auto;">
            <button class="btn btn-primary flex-1" id="qv-add-btn">
              ${Icons.get('shopping-cart', '', 16)} Add To Bag
            </button>
          </div>
        </div>
      </div>
    `;

    modal.open({
      title: `${prod.name}`,
      content: content,
      size: 'lg'
    });

    document.getElementById('qv-add-btn').addEventListener('click', () => {
      this.addToCart(prod.sku, 1);
      modal.close();
    });
  }

  openCheckoutModal() {
    if (this.cart.length === 0) {
      toast.warning('Cart is empty.');
      return;
    }

    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const branches = stateManager.get('branches') || [];
    const retailBranches = branches.filter(b => b.type === 'retail');

    const currentUser = authService.getCurrentUser();
    const defaultName = currentUser ? currentUser.name : '';
    const defaultPhone = currentUser ? currentUser.phone : '010-555-101';
    const defaultAddress = '#45 Street 214, Sangkat Boeung Raing, Khan Doun Penh, Phnom Penh';

    const branchOptions = retailBranches.map(b => `<option value="${b.id}">${b.name} (${b.address})</option>`).join('');

    const content = `
      <div style="display:grid; grid-template-columns:1.2fr 0.8fr; gap:20px;">
        <div>
          <div class="sim-alert">
            ${Icons.get('shield-check', '', 18)}
            <span><strong>SIMULATED CHECKOUT</strong>: No real money will be charged. Inventory will be realistically reserved in local state.</span>
          </div>

          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="chk-name" class="form-input" value="${defaultName}" placeholder="e.g. Sokha Vann" required />
          </div>

          <div class="form-group">
            <label class="form-label">Phone Number (Cambodia)</label>
            <input type="text" id="chk-phone" class="form-input" value="${defaultPhone}" placeholder="012-xxx-xxx" required />
          </div>

          <div class="form-group">
            <label class="form-label">Fulfillment Method</label>
            <div style="display:flex; gap:12px; margin-top:4px;">
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:13px; font-weight:600;">
                <input type="radio" name="chk-method" value="Delivery" checked id="radio-delivery" />
                🛵 Home Delivery (+$2.00)
              </label>
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:13px; font-weight:600;">
                <input type="radio" name="chk-method" value="Pickup" id="radio-pickup" />
                🏬 Store Pickup (Free)
              </label>
            </div>
          </div>

          <div class="form-group" id="delivery-address-group">
            <label class="form-label">Delivery Address in Cambodia</label>
            <textarea id="chk-address" class="form-textarea" rows="2">${defaultAddress}</textarea>
          </div>

          <div class="form-group hidden" id="branch-pickup-group">
            <label class="form-label">Select Pickup Branch</label>
            <select id="chk-pickup-branch" class="form-select">
              ${branchOptions}
            </select>
            <div class="form-hint" id="pickup-stock-check">Checking branch inventory...</div>
          </div>

          <div class="form-group">
            <label class="form-label">Payment Method</label>
            <select id="chk-payment" class="form-select">
              <option value="Bakong KHQR" selected>📱 Bakong KHQR (Recommended Mobile Banking)</option>
              <option value="Cash on Delivery">💵 Cash on Delivery / Store Pickup</option>
              <option value="Simulated Card Payment">💳 Credit / Debit Card (Simulated)</option>
            </select>
          </div>
        </div>

        <!-- Order Summary Column -->
        <div style="background:#f8fafc; border-radius:10px; border:1px solid #e2e8f0; padding:16px; display:flex; flex-direction:column;">
          <h4 style="font-size:0.95rem; font-weight:700; margin-bottom:12px; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
            Order Summary (${this.cart.length} items)
          </h4>
          <div style="max-height:180px; overflow-y:auto; display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
            ${this.cart.map(i => `
              <div style="display:flex; justify-content:space-between; font-size:12px;">
                <span>${i.quantity}x ${i.name}</span>
                <span style="font-weight:600;">$${(i.price * i.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <div style="border-top:1px dashed #cbd5e1; padding-top:8px; font-size:13px; display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; justify-content:space-between;">
              <span class="text-muted">Subtotal:</span>
              <span style="font-weight:600;">$${subtotal.toFixed(2)}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span class="text-muted">Delivery Fee:</span>
              <span id="chk-fee-disp" style="font-weight:600;">$2.00</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:1.1rem; font-weight:800; color:#1e3a8a; border-top:1px solid #e2e8f0; padding-top:8px; margin-top:4px;">
              <span>Total:</span>
              <span id="chk-total-disp">$${(subtotal + 2.00).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-secondary" onclick="modal.close()">Cancel</button>
      <button class="btn btn-primary" id="submit-checkout-btn">Confirm & Place Order</button>
    `;

    modal.open({
      title: 'Checkout & Branch Reservation',
      content,
      footer,
      size: 'lg'
    });

    // Handle method radio toggle
    const radioDelivery = document.getElementById('radio-delivery');
    const radioPickup = document.getElementById('radio-pickup');
    const delGroup = document.getElementById('delivery-address-group');
    const pickGroup = document.getElementById('branch-pickup-group');
    const feeDisp = document.getElementById('chk-fee-disp');
    const totalDisp = document.getElementById('chk-total-disp');

    const updateTotals = () => {
      const isDel = radioDelivery.checked;
      const fee = isDel ? 2.00 : 0.00;
      delGroup.classList.toggle('hidden', !isDel);
      pickGroup.classList.toggle('hidden', isDel);
      feeDisp.textContent = `$${fee.toFixed(2)}`;
      totalDisp.textContent = `$${(subtotal + fee).toFixed(2)}`;
    };

    radioDelivery.addEventListener('change', updateTotals);
    radioPickup.addEventListener('change', updateTotals);

    // Submit checkout
    document.getElementById('submit-checkout-btn').addEventListener('click', () => {
      const name = document.getElementById('chk-name').value.trim();
      const phone = document.getElementById('chk-phone').value.trim();
      if (!name || !phone) {
        toast.warning('Please enter customer name and phone number.');
        return;
      }

      const isDel = radioDelivery.checked;
      const method = isDel ? 'Delivery' : 'Pickup';
      const assignedBranch = isDel ? 'B001' : document.getElementById('chk-pickup-branch').value;
      const address = isDel ? document.getElementById('chk-address').value.trim() : `Store Pickup: ${assignedBranch}`;
      const fee = isDel ? 2.00 : 0.00;
      const paymentMethod = document.getElementById('chk-payment').value;

      try {
        const order = orderService.createOnlineOrder({
          customerId: currentUser ? currentUser.id : 'GUEST',
          customerName: name,
          phone,
          deliveryMethod: method,
          assignedBranch,
          deliveryAddress: address,
          items: this.cart,
          subtotal,
          deliveryFee: fee,
          paymentMethod
        });

        // Clear Cart
        this.cart = [];
        this.saveCart();
        modal.close();

        // If Bakong KHQR, transition immediately to dedicated interactive KHQR screen
        if (paymentMethod === 'Bakong KHQR') {
          this.openKHQROnlinePaymentModal(order);
          return;
        }

        // Otherwise show standard Cash/Card success confirmation dialog
        modal.open({
          title: 'Order Placed Successfully!',
          content: `
            <div style="text-align:center; padding:15px 0;">
              <div style="width:54px; height:54px; background:#ecfdf5; color:#10b981; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px;">
                ${Icons.get('check', '', 32)}
              </div>
              <h3 style="font-size:1.25rem; font-weight:800; color:#0f172a; margin-bottom:4px;">Order #${order.orderNumber}</h3>
              <p style="font-size:13px; color:#475569; max-width:380px; margin:0 auto 16px;">
                Stock is now securely <strong>reserved at branch ${assignedBranch}</strong>. Fulfillment staff has been alerted.
              </p>
              <div style="background:#f1f5f9; padding:12px; border-radius:8px; font-size:12px; text-align:left; max-width:380px; margin:0 auto;">
                <div><strong>Assigned Branch:</strong> ${order.branchName}</div>
                <div><strong>Total Amount:</strong> $${order.total.toFixed(2)}</div>
                <div><strong>Method:</strong> ${order.fulfillmentMethod}</div>
              </div>
            </div>
          `,
          footer: `
            <button class="btn btn-secondary" onclick="modal.close()">Keep Shopping</button>
            <button class="btn btn-primary" id="track-this-order-btn">Track Order</button>
          `
        });

        document.getElementById('track-this-order-btn').addEventListener('click', () => {
          modal.close();
          this.openOrderTrackingModal(order.orderNumber);
        });

      } catch (err) {
        toast.error(err.message);
      }
    });
  }

  // Dedicated Online Bakong KHQR Payment Screen
  openKHQROnlinePaymentModal(order) {
    const config = paymentService.getBranchMerchantConfig(order.assignedBranch);
    const totalUSD = order.total;
    const totalKHR = paymentService.convertToKHR(totalUSD);
    const txnRef = order.transactionRef || `TXN-KHQR-${Date.now().toString().slice(-6)}`;

    const khqrHtml = paymentService.generateKHQRVisualHTML({
      merchantName: config.merchantName,
      merchantCity: config.merchantCity,
      currency: 'USD',
      amount: totalUSD,
      usdAmount: totalUSD,
      khrAmount: totalKHR,
      transactionRef: txnRef,
      expirationSeconds: 180
    });

    const content = `
      <div>
        <div class="sim-alert">
          ${Icons.get('shield-check', '', 18)}
          <span><strong>BAKONG KHQR PAYMENT GATEWAY</strong>: Order <strong>#${order.orderNumber}</strong> is currently <em>Pending Payment</em>. Required stock is reserved.</span>
        </div>

        <!-- Currency Selector -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding:0 8px;">
          <span style="font-size:12px; font-weight:700; color:#475569;">Payable in Currency:</span>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-primary btn-sm" id="store-curr-usd-btn" style="padding:3px 10px; font-size:11px;">USD ($)</button>
            <button class="btn btn-secondary btn-sm" id="store-curr-khr-btn" style="padding:3px 10px; font-size:11px;">KHR (៛ 4,100)</button>
          </div>
        </div>

        <!-- Rendered KHQR Card -->
        ${khqrHtml}

        <!-- Demo Testing Actions Box -->
        <div class="khqr-demo-controls-box">
          <div class="khqr-demo-controls-title">
            <span>Prototype Payment Simulation</span>
            <span class="sim-pill">Test Actions</span>
          </div>
          <div style="display:grid; grid-template-columns:1.5fr 1fr 1fr; gap:8px;">
            <button class="btn btn-success btn-sm" id="btn-store-sim-success" style="font-weight:700;">
              ✓ Simulate Success
            </button>
            <button class="btn btn-danger btn-sm" id="btn-store-sim-fail">
              ✗ Simulate Fail
            </button>
            <button class="btn btn-secondary btn-sm" id="btn-store-sim-expire">
              ⏱ Simulate Expire
            </button>
          </div>
          <div style="font-size:10px; color:#64748b; margin-top:6px; text-align:center;">
            Simulate payment event sent back from mobile banking app to gateway.
          </div>
        </div>
      </div>
    `;

    modal.open({
      title: `Bakong KHQR Payment – Order #${order.orderNumber}`,
      content,
      footer: `
        <button class="btn btn-secondary" id="btn-store-cancel-payment">Cancel Order</button>
      `,
      size: 'md'
    });

    // Start 180s live countdown timer
    if (window.storeTimerInterval) clearInterval(window.storeTimerInterval);
    let secondsRemaining = 180;
    const timerText = document.getElementById('khqr-timer-text');

    window.storeTimerInterval = setInterval(() => {
      secondsRemaining--;
      if (secondsRemaining <= 0) {
        clearInterval(window.storeTimerInterval);
        if (timerText) timerText.innerHTML = '<span style="color:#ef4444; font-weight:800;">EXPIRED</span>';
        orderService.failOrExpireKHQRPayment(order.id, order.paymentId, true, 'Payment time expired');
      } else {
        const mins = String(Math.floor(secondsRemaining / 60)).padStart(2, '0');
        const secs = String(secondsRemaining % 60).padStart(2, '0');
        if (timerText) timerText.textContent = `${mins}:${secs}`;
      }
    }, 1000);

    // Currency toggle
    const btnUSD = document.getElementById('store-curr-usd-btn');
    const btnKHR = document.getElementById('store-curr-khr-btn');
    const amtMain = document.getElementById('khqr-amount-main');
    const amtSub = document.getElementById('khqr-amount-sub');

    if (btnUSD && btnKHR) {
      btnUSD.addEventListener('click', () => {
        btnUSD.className = 'btn btn-primary btn-sm';
        btnKHR.className = 'btn btn-secondary btn-sm';
        if (amtMain) amtMain.textContent = `$${totalUSD.toFixed(2)} USD`;
        if (amtSub) amtSub.textContent = `≈ ${totalKHR.toLocaleString()} KHR (Simulated Rate: 4,100)`;
      });

      btnKHR.addEventListener('click', () => {
        btnKHR.className = 'btn btn-primary btn-sm';
        btnUSD.className = 'btn btn-secondary btn-sm';
        if (amtMain) amtMain.textContent = `${totalKHR.toLocaleString()} KHR`;
        if (amtSub) amtSub.textContent = `≈ $${totalUSD.toFixed(2)} USD (Simulated Rate: 4,100)`;
      });
    }

    // Success action
    document.getElementById('btn-store-sim-success').addEventListener('click', () => {
      if (window.storeTimerInterval) clearInterval(window.storeTimerInterval);
      orderService.confirmKHQRPayment(order.id, order.paymentId);
      modal.close();

      // Show final success receipt
      modal.open({
        title: 'Payment Confirmed & Order Placed!',
        content: `
          <div style="text-align:center; padding:15px 0;">
            <div style="width:54px; height:54px; background:#ecfdf5; color:#10b981; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px;">
              ${Icons.get('check', '', 32)}
            </div>
            <h3 style="font-size:1.25rem; font-weight:800; color:#0f172a; margin-bottom:4px;">Order #${order.orderNumber}</h3>
            <p style="font-size:13px; color:#475569; max-width:380px; margin:0 auto 16px;">
              Your <strong>Bakong KHQR payment of $${totalUSD.toFixed(2)}</strong> (${totalKHR.toLocaleString()} KHR) is confirmed.
              Stock is reserved at <strong>${order.branchName}</strong> and ready for fulfillment.
            </p>
            <div style="background:#f1f5f9; padding:12px; border-radius:8px; font-size:12px; text-align:left; max-width:380px; margin:0 auto;">
              <div><strong>Payment Ref:</strong> <code>${txnRef}</code></div>
              <div><strong>Fulfillment Method:</strong> ${order.fulfillmentMethod}</div>
              <div><strong>Destination:</strong> ${order.deliveryAddress}</div>
            </div>
          </div>
        `,
        footer: `
          <button class="btn btn-secondary" onclick="modal.close()">Keep Shopping</button>
          <button class="btn btn-primary" id="track-paid-order-btn">Track Order</button>
        `
      });

      document.getElementById('track-paid-order-btn').addEventListener('click', () => {
        modal.close();
        this.openOrderTrackingModal(order.orderNumber);
      });
    });

    // Fail action
    document.getElementById('btn-store-sim-fail').addEventListener('click', () => {
      if (window.storeTimerInterval) clearInterval(window.storeTimerInterval);
      orderService.failOrExpireKHQRPayment(order.id, order.paymentId, false, 'Simulated customer cancellation in banking app');
      modal.close();
      toast.error('Payment was not completed. Stock reservation released.');
    });

    // Expire action
    document.getElementById('btn-store-sim-expire').addEventListener('click', () => {
      if (window.storeTimerInterval) clearInterval(window.storeTimerInterval);
      orderService.failOrExpireKHQRPayment(order.id, order.paymentId, true, 'Payment timed out');
      modal.close();
      toast.warning('Payment window expired. Stock reservation released.');
    });

    // Cancel order
    document.getElementById('btn-store-cancel-payment').addEventListener('click', () => {
      if (window.storeTimerInterval) clearInterval(window.storeTimerInterval);
      orderService.failOrExpireKHQRPayment(order.id, order.paymentId, false, 'Customer cancelled payment modal');
      modal.close();
      toast.info('Order checkout cancelled.');
    });
  }

  openOrderTrackingModal(initialOrderNum = 'ORD-2026-001') {
    const orders = stateManager.get('orders') || [];

    const content = `
      <div>
        <div style="display:flex; gap:10px; margin-bottom:20px;">
          <input type="text" id="track-search-input" class="form-input" value="${initialOrderNum}" placeholder="Enter Order # (e.g. ORD-2026-001)" />
          <button class="btn btn-primary" id="track-search-btn">${Icons.get('search', '', 14)} Track</button>
        </div>
        <div id="track-result-container"></div>
      </div>
    `;

    modal.open({
      title: 'Real-Time Order Tracking',
      content,
      size: 'lg'
    });

    const renderResult = (orderNum) => {
      const container = document.getElementById('track-result-container');
      const order = orders.find(o => o.orderNumber === orderNum || o.id === orderNum);

      if (!order) {
        container.innerHTML = `
          <div class="empty-state">
            <p>No order found matching "${orderNum}".</p>
          </div>
        `;
        return;
      }

      const steps = ['Order Placed', 'Confirmed', 'Picking', 'Ready for Pickup', 'Dispatched', 'Completed'];
      let currentIdx = steps.indexOf(order.status);
      if (currentIdx === -1) {
        if (order.status === 'Processing') currentIdx = 1;
        else if (order.status === 'Delivered') currentIdx = 5;
        else currentIdx = 2;
      }

      const timelineStepsHtml = steps.map((s, idx) => {
        let cls = '';
        if (idx < currentIdx) cls = 'completed';
        else if (idx === currentIdx) cls = 'active';

        return `
          <div class="timeline-step ${cls}">
            <div class="timeline-icon">${idx < currentIdx ? '✓' : idx + 1}</div>
            <div class="timeline-label">${s}</div>
          </div>
        `;
      }).join('');

      const itemsHtml = order.items.map(i => `
        <div style="display:flex; justify-content:space-between; font-size:12px; padding:4px 0;">
          <span>${i.quantity}x ${i.name}</span>
          <span style="font-weight:600;">$${(i.price * i.quantity).toFixed(2)}</span>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div>
              <h3 style="font-size:1.1rem; font-weight:800;">${order.orderNumber}</h3>
              <span class="text-muted" style="font-size:12px;">Placed on ${new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <span class="badge badge-primary" style="font-size:12px;">${order.status}</span>
          </div>

          <div class="timeline">
            ${timelineStepsHtml}
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:24px; padding-top:16px; border-top:1px solid #e2e8f0; font-size:12px;">
            <div>
              <div style="font-weight:700; color:#334155; margin-bottom:4px;">Delivery / Pickup Info:</div>
              <div><strong>Method:</strong> ${order.fulfillmentMethod}</div>
              <div><strong>Branch:</strong> ${order.branchName || order.assignedBranch}</div>
              <div><strong>Address:</strong> ${order.deliveryAddress || 'In-store'}</div>
            </div>
            <div>
              <div style="font-weight:700; color:#334155; margin-bottom:4px;">Products:</div>
              ${itemsHtml}
              <div style="border-top:1px solid #e2e8f0; margin-top:6px; padding-top:6px; font-weight:700; display:flex; justify-content:space-between;">
                <span>Total:</span>
                <span>$${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    };

    document.getElementById('track-search-btn').addEventListener('click', () => {
      const num = document.getElementById('track-search-input').value.trim();
      renderResult(num);
    });

    renderResult(initialOrderNum);
  }

  openAccountModal() {
    const currentUser = authService.getCurrentUser();
    const orders = stateManager.get('orders') || [];
    const userOrders = orders.filter(o => o.customerId === (currentUser ? currentUser.id : 'C001'));

    const content = `
      <div>
        <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid #e2e8f0;">
          <div style="width:50px; height:50px; border-radius:50%; background:#1e3a8a; color:white; display:flex; align-items:center; justify-content:center; font-size:1.25rem; font-weight:800;">
            ${currentUser ? currentUser.avatar : 'CU'}
          </div>
          <div>
            <h3 style="font-size:1.1rem; font-weight:700;">${currentUser ? currentUser.name : 'Demo Customer'}</h3>
            <span style="font-size:12px; color:#64748b;">${currentUser ? currentUser.email : 'customer@example.com'} &bull; ${currentUser ? currentUser.role : 'Customer'}</span>
          </div>
        </div>

        <h4 style="font-size:0.95rem; font-weight:700; margin-bottom:12px;">Order History</h4>
        <div style="max-height:240px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
          ${userOrders.length === 0 ? '<p class="text-sm text-muted">No prior orders placed yet.</p>' : userOrders.map(o => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; font-size:12px;">
              <div>
                <strong>${o.orderNumber}</strong> (${o.items.length} items) &bull; <span class="text-muted">${new Date(o.createdAt).toLocaleDateString()}</span>
                <div style="color:#64748b; font-size:11px;">${o.fulfillmentMethod} - ${o.assignedBranch}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-weight:700; color:#0f172a;">$${o.total.toFixed(2)}</div>
                <span class="badge badge-primary" style="font-size:10px;">${o.status}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    modal.open({
      title: 'Customer Profile & Account',
      content,
      size: 'md'
    });
  }
}

// Global bootstrap for storefront
let storeApp;
document.addEventListener('DOMContentLoaded', () => {
  storeApp = new StoreApp();
});

