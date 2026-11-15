/**
 * SmartRetail AI - Branch Point of Sale (POS) Application Controller
 * Optimized for cashiers with instant barcode lookup, live branch stock checks,
 * cash/card/Bakong KHQR simulation, and thermal receipt printing.
 */

class POSApp {
  constructor() {
    this.cart = [];
    this.activeCategory = 'All';
    this.searchQuery = '';
    this.appliedDiscount = 0.00;
    this.selectedCustomerId = 'WALK-IN';
    this.branchId = authService.getAssignedBranch() || 'B001';
    this.init();
  }

  init() {
    this.bindHeaderInfo();
    this.bindEvents();
    this.renderCategoryChips();
    this.renderProducts();
    this.renderCart();

    // Subscribe to stock changes (if e.g. online order reserved stock or manager adjusted)
    stateManager.subscribe('inventory', () => {
      this.renderProducts();
    });
  }

  bindHeaderInfo() {
    const user = authService.getCurrentUser() || { name: 'Sopheak Lim', role: 'Cashier' };
    const branches = stateManager.get('branches') || [];
    const bObj = branches.find(b => b.id === this.branchId) || { name: 'Phnom Penh Central' };

    const cashierEl = document.getElementById('pos-cashier-name');
    const branchEl = document.getElementById('pos-branch-name');
    const clockEl = document.getElementById('pos-clock');

    if (cashierEl) cashierEl.textContent = user.name;
    if (branchEl) branchEl.textContent = `${bObj.name} (${this.branchId})`;

    if (clockEl) {
      const updateClock = () => {
        clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      };
      updateClock();
      setInterval(updateClock, 1000);
    }
  }

  bindEvents() {
    // Search / Barcode scanner input
    const searchInput = document.getElementById('pos-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderProducts();
      });

      // Rapid barcode enter
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = searchInput.value.trim().toUpperCase();
          const products = stateManager.get('products') || [];
          const match = products.find(p => p.sku === val || p.barcode === val);
          if (match) {
            this.addToCart(match.sku);
            searchInput.value = '';
            this.searchQuery = '';
            this.renderProducts();
          }
        }
      });
    }

    // Customer select
    const custSelect = document.getElementById('pos-customer-select');
    if (custSelect) {
      const customers = stateManager.get('customers') || [];
      let options = `<option value="WALK-IN">Walk-in Customer</option>`;
      customers.forEach(c => {
        options += `<option value="${c.id}">${c.name} (${c.phone})</option>`;
      });
      custSelect.innerHTML = options;
      custSelect.addEventListener('change', (e) => {
        this.selectedCustomerId = e.target.value;
      });
    }

    // Clear cart button
    const clearBtn = document.getElementById('pos-clear-cart-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (this.cart.length > 0) {
          modal.confirm({
            title: 'Clear Active Cart?',
            message: 'Are you sure you want to discard the current sale?',
            confirmText: 'Clear Sale',
            isDanger: true,
            onConfirm: () => {
              this.cart = [];
              this.appliedDiscount = 0.00;
              this.renderCart();
              toast.info('Cart cleared.');
            }
          });
        }
      });
    }

    // Apply discount button
    const discountBtn = document.getElementById('pos-discount-btn');
    if (discountBtn) {
      discountBtn.addEventListener('click', () => this.openDiscountModal());
    }

    // Direct KHQR Tender button
    const quickKhqrBtn = document.getElementById('pos-quick-khqr-btn');
    if (quickKhqrBtn) {
      quickKhqrBtn.addEventListener('click', () => this.openCheckoutModal('khqr'));
    }

    // Direct Cash Tender button
    const quickCashBtn = document.getElementById('pos-quick-cash-btn');
    if (quickCashBtn) {
      quickCashBtn.addEventListener('click', () => this.openCheckoutModal('cash'));
    }

    // Checkout button (General Payment Station)
    const checkoutBtn = document.getElementById('pos-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this.openCheckoutModal('khqr'));
    }

    // Sales history button
    const historyBtn = document.getElementById('pos-history-btn');
    if (historyBtn) {
      historyBtn.addEventListener('click', () => this.openSalesHistoryModal());
    }
  }

  renderCategoryChips() {
    const container = document.getElementById('pos-cat-chips');
    if (!container) return;

    const allProducts = stateManager.get('products') || [];
    const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)));
    const categories = ['All', ...uniqueCategories];

    container.innerHTML = categories.map(cat => `
      <div class="pos-cat-chip ${this.activeCategory === cat ? 'active' : ''}" data-cat="${cat}">
        ${cat}
      </div>
    `).join('');

    container.querySelectorAll('.pos-cat-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        this.activeCategory = e.currentTarget.dataset.cat;
        this.renderCategoryChips();
        this.renderProducts();
      });
    });
  }

  renderProducts() {
    const grid = document.getElementById('pos-products-grid');
    if (!grid) return;

    let products = stateManager.get('products') || [];

    if (this.activeCategory !== 'All') {
      products = products.filter(p => p.category === this.activeCategory);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q))
      );
    }

    if (products.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; color: var(--muted-foreground);">
          <div style="margin-bottom: 8px;">${Icons.get('box', '', 36)}</div>
          <div style="font-weight: 600; font-size: 14px;">No products found</div>
          <div style="font-size: 12px;">Try clearing search or selecting a different category.</div>
        </div>
      `;
      return;
    }

    grid.innerHTML = products.map(prod => {
      const avail = inventoryService.getAvailableStock(prod.sku, this.branchId);
      const isOut = avail <= 0;
      const khrVal = Math.round(prod.sellingPrice * 4100).toLocaleString();

      return `
        <div class="pos-product-card ${isOut ? 'out-of-stock' : ''}" data-sku="${prod.sku}" title="Tap to add ${prod.name}">
          <div class="pos-card-header">
            <span class="pos-brand-pill">${prod.brand}</span>
            <span class="badge ${isOut ? 'badge-danger' : avail <= 4 ? 'badge-warning' : 'badge-success'} pos-stock-badge">
              ${isOut ? 'Out' : avail + ' left'}
            </span>
          </div>
          <div class="pos-img-container">
            <img class="pos-product-img" src="${prod.image}" alt="${prod.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=500&q=80'" />
          </div>
          <div class="pos-product-name" title="${prod.name}">${prod.name}</div>
          <div class="pos-product-sku"><code>${prod.sku}</code></div>
          <div class="pos-product-footer">
            <div class="pos-price-group">
              <div class="pos-product-price">$${prod.sellingPrice.toFixed(2)}</div>
              <div class="pos-product-khr">≈ ${khrVal} ៛</div>
            </div>
            <button class="pos-add-icon-btn" aria-label="Add to cart" tabindex="-1">
              ${Icons.get('plus', '', 14)}
            </button>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.pos-product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const sku = e.currentTarget.dataset.sku;
        this.addToCart(sku);
      });
    });
  }

  addToCart(sku) {
    const products = stateManager.get('products') || [];
    const prod = products.find(p => p.sku === sku);
    if (!prod) return;

    const avail = inventoryService.getAvailableStock(sku, this.branchId);
    if (avail <= 0) {
      toast.error(`"${prod.name}" is out of stock at this branch.`);
      return;
    }

    const existing = this.cart.find(i => i.sku === sku);
    if (existing) {
      if (existing.quantity >= avail) {
        toast.warning(`Cannot add more: Only ${avail} units available in branch inventory.`);
        return;
      }
      existing.quantity++;
    } else {
      this.cart.push({
        sku: prod.sku,
        name: prod.name,
        price: prod.sellingPrice,
        quantity: 1
      });
    }

    this.renderCart();
  }

  renderCart() {
    const container = document.getElementById('pos-ticket-items');
    const subtotalEl = document.getElementById('pos-subtotal');
    const discountEl = document.getElementById('pos-discount');
    const totalEl = document.getElementById('pos-total');
    const totalKhrEl = document.getElementById('pos-total-khr');
    const countEl = document.getElementById('pos-ticket-count');
    const checkoutBtn = document.getElementById('pos-checkout-btn');
    const quickKhqrBtn = document.getElementById('pos-quick-khqr-btn');
    const quickCashBtn = document.getElementById('pos-quick-cash-btn');

    if (!container) return;

    const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (countEl) countEl.textContent = `${itemCount} items`;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding:40px 0;">
          <p class="font-medium text-sm">Sale ticket is empty</p>
          <p class="text-xs text-muted">Tap products or scan barcode to add</p>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = '$0.00';
      if (discountEl) discountEl.textContent = '$0.00';
      if (totalEl) totalEl.textContent = '$0.00';
      if (totalKhrEl) totalKhrEl.textContent = '0 ៛';
      if (checkoutBtn) checkoutBtn.disabled = true;
      if (quickKhqrBtn) quickKhqrBtn.disabled = true;
      if (quickCashBtn) quickCashBtn.disabled = true;
      return;
    }

    const subtotal = this.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const total = Math.max(0, subtotal - this.appliedDiscount);
    const totalKHR = paymentService.convertToKHR(total);

    container.innerHTML = this.cart.map(item => `
      <div class="pos-ticket-row">
        <div class="pos-ticket-row-info">
          <div class="pos-ticket-row-title">${item.name}</div>
          <div class="pos-ticket-row-sub">$${item.price.toFixed(2)} &bull; SKU: ${item.sku}</div>
        </div>
        <div class="pos-qty-controls">
          <button class="pos-qty-btn pos-dec-btn" data-sku="${item.sku}">-</button>
          <span class="pos-qty-val">${item.quantity}</span>
          <button class="pos-qty-btn pos-inc-btn" data-sku="${item.sku}">+</button>
        </div>
        <div class="pos-ticket-row-total">$${(item.price * item.quantity).toFixed(2)}</div>
        <button class="btn btn-ghost btn-sm pos-del-btn" data-sku="${item.sku}" style="color:#ef4444; padding:4px;">
          ${Icons.get('x', '', 14)}
        </button>
      </div>
    `).join('');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (discountEl) discountEl.textContent = `-$${this.appliedDiscount.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    if (totalKhrEl) totalKhrEl.textContent = `${totalKHR.toLocaleString()} ៛`;
    if (checkoutBtn) checkoutBtn.disabled = false;
    if (quickKhqrBtn) quickKhqrBtn.disabled = false;
    if (quickCashBtn) quickCashBtn.disabled = false;

    // Item actions
    container.querySelectorAll('.pos-dec-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sku = e.currentTarget.dataset.sku;
        const item = this.cart.find(i => i.sku === sku);
        if (item) {
          if (item.quantity > 1) item.quantity--;
          else this.cart = this.cart.filter(i => i.sku !== sku);
          this.renderCart();
        }
      });
    });

    container.querySelectorAll('.pos-inc-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sku = e.currentTarget.dataset.sku;
        const item = this.cart.find(i => i.sku === sku);
        const avail = inventoryService.getAvailableStock(sku, this.branchId);
        if (item) {
          if (item.quantity >= avail) {
            toast.warning(`Cannot add more: Only ${avail} units available in branch inventory.`);
            return;
          }
          item.quantity++;
          this.renderCart();
        }
      });
    });

    container.querySelectorAll('.pos-del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sku = e.currentTarget.dataset.sku;
        this.cart = this.cart.filter(i => i.sku !== sku);
        this.renderCart();
      });
    });
  }

  openDiscountModal() {
    const subtotal = this.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    const content = `
      <div>
        <div class="form-group">
          <label class="form-label">Discount Amount ($ USD)</label>
          <input type="number" id="pos-disc-input" class="form-input" value="${this.appliedDiscount}" min="0" max="${subtotal}" step="0.5" />
        </div>
        <div style="display:flex; gap:8px; margin-top:10px;">
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('pos-disc-input').value = '2.00'">$2.00 Off</button>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('pos-disc-input').value = '5.00'">$5.00 Off</button>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('pos-disc-input').value = '${(subtotal * 0.1).toFixed(2)}'">10% Off</button>
        </div>
      </div>
    `;

    modal.open({
      title: 'Apply Sale Discount',
      content,
      footer: `
        <button class="btn btn-secondary" onclick="modal.close()">Cancel</button>
        <button class="btn btn-primary" id="apply-disc-confirm">Apply</button>
      `
    });

    document.getElementById('apply-disc-confirm').addEventListener('click', () => {
      const val = parseFloat(document.getElementById('pos-disc-input').value) || 0;
      this.appliedDiscount = Math.min(val, subtotal);
      modal.close();
      this.renderCart();
      toast.success(`Discount of $${this.appliedDiscount.toFixed(2)} applied!`);
    });
  }

  openCheckoutModal(initialMethod = 'khqr') {
    if (this.cart.length === 0) return;

    const subtotal = this.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const totalUSD = Math.max(0, subtotal - this.appliedDiscount);
    const totalKHR = paymentService.convertToKHR(totalUSD);

    const config = paymentService.getBranchMerchantConfig(this.branchId);
    let currentCurrency = 'USD';
    let currentMethod = initialMethod === 'cash' ? 'Cash' : (initialMethod === 'card' ? 'Card (Simulated)' : 'Bakong KHQR');
    const txnRef = `TXN-KHQR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

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

    const isKhqr = currentMethod === 'Bakong KHQR';
    const isCash = currentMethod === 'Cash';
    const isCard = currentMethod === 'Card (Simulated)';

    const content = `
      <div>
        <!-- Payable Summary Header Banner -->
        <div style="background:linear-gradient(135deg, #09090b 0%, #0f172a 100%); color:white; padding:16px 20px; border-radius:14px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; border:1px solid #18181b;">
          <div>
            <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.05em; color:#94a3b8; font-weight:700;">Payable Amount</div>
            <div style="font-size:1.85rem; font-weight:800; color:#ffffff; font-variant-numeric:tabular-nums; line-height:1.1;">$${totalUSD.toFixed(2)} <span style="font-size:13px; font-weight:600; color:#93c5fd;">USD</span></div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.05em; color:#94a3b8; font-weight:700;">Cambodia Riel (≈)</div>
            <div style="font-size:1.35rem; font-weight:800; color:#38bdf8; font-variant-numeric:tabular-nums; line-height:1.1;">${totalKHR.toLocaleString()} <span style="font-size:12px; font-weight:600;">៛</span></div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">Rate: 1 USD = 4,100 KHR</div>
          </div>
        </div>

        <!-- Payment Method Selection Grid -->
        <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:var(--muted-foreground); margin-bottom:8px;">
          Choose Payment Method:
        </div>
        <div class="payment-selector-grid" id="pos-pay-selector">
          <div class="payment-method-card khqr-card ${isKhqr ? 'selected' : ''}" data-method="khqr">
            <div class="payment-method-icon" style="background:#fff1f2; color:#be123c; border-color:#fecdd3;">
              ${Icons.get('qr-code', '', 20)}
            </div>
            <div class="payment-method-title">Bakong KHQR</div>
            <div class="payment-method-sub">Scan via Banking App</div>
            <span class="badge badge-danger" style="margin-top:6px; font-size:9px; background:#fff1f2; color:#be123c; border-color:#fecdd3;">Recommended</span>
          </div>

          <div class="payment-method-card cash-card ${isCash ? 'selected' : ''}" data-method="cash">
            <div class="payment-method-icon" style="background:#ecfdf5; color:#10b981; border-color:#a7f3d0;">
              💵
            </div>
            <div class="payment-method-title">Cash Register</div>
            <div class="payment-method-sub">USD & KHR Bills</div>
            <span class="badge badge-success" style="margin-top:6px; font-size:9px; background:#ecfdf5; color:#065f46; border-color:#a7f3d0;">Instant Change</span>
          </div>

          <div class="payment-method-card ${isCard ? 'selected' : ''}" data-method="card">
            <div class="payment-method-icon" style="background:#eff6ff; color:#2563eb; border-color:#bfdbfe;">
              ${Icons.get('credit-card', '', 20)}
            </div>
            <div class="payment-method-title">Card Terminal</div>
            <div class="payment-method-sub">Debit / Credit Swipe</div>
            <span class="badge badge-secondary" style="margin-top:6px; font-size:9px;">Simulated</span>
          </div>
        </div>

        <!-- Tab Pane 1: Bakong KHQR -->
        <div id="tab-pane-khqr" class="${isKhqr ? '' : 'hidden'}">
          <!-- Currency Toggle -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding:0 4px;">
            <span style="font-size:12px; font-weight:700; color:var(--muted-foreground);">KHQR Currency Display:</span>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-primary btn-sm" id="pos-curr-usd-btn" style="padding:3px 10px; font-size:11px;">USD ($)</button>
              <button class="btn btn-secondary btn-sm" id="pos-curr-khr-btn" style="padding:3px 10px; font-size:11px;">KHR (៛ 4,100)</button>
            </div>
          </div>

          <!-- KHQR Card Rendered -->
          <div id="pos-khqr-visual-container">
            ${khqrHtml}
          </div>

          <!-- Demo Simulation Actions Box -->
          <div class="khqr-demo-controls-box">
            <div class="khqr-demo-controls-title">
              <span>Demo Testing Actions (Simulated)</span>
              <span class="sim-pill">Simulated KHQR</span>
            </div>
            <div style="display:grid; grid-template-columns:1.5fr 1fr 1fr; gap:8px;">
              <button class="btn btn-success btn-sm" id="btn-sim-khqr-success" style="font-weight:700;">
                ✓ Simulate Success
              </button>
              <button class="btn btn-danger btn-sm" id="btn-sim-khqr-fail">
                ✗ Simulate Fail
              </button>
              <button class="btn btn-secondary btn-sm" id="btn-sim-khqr-expire">
                ⏱ Simulate Expire
              </button>
            </div>
            <div style="font-size:10px; color:var(--muted-foreground); margin-top:6px; text-align:center;">
              Simulate customer scanning & confirming payment in ABA Mobile, Wing, or Bakong.
            </div>
          </div>
        </div>

        <!-- Tab Pane 2: Cash Payment -->
        <div id="tab-pane-cash" class="${isCash ? '' : 'hidden'}">
          <div class="form-group" style="margin-top:10px;">
            <label class="form-label">
              <span>Cash Tendered ($ USD Amount)</span>
              <span style="color:#10b981; font-weight:700;" id="tender-khr-preview">≈ ${totalKHR.toLocaleString()} ៛</span>
            </label>
            <input type="number" id="pos-tendered-input" class="form-input" style="font-size:1.25rem; font-weight:700; font-variant-numeric:tabular-nums;" value="${totalUSD.toFixed(2)}" min="${totalUSD}" step="1" />
          </div>

          <!-- Quick USD Bills -->
          <div style="font-size:11px; font-weight:600; color:var(--muted-foreground); margin-bottom:6px;">
            Quick US Dollar Bills:
          </div>
          <div class="quick-bills-grid">
            <button class="bill-chip" onclick="document.getElementById('pos-tendered-input').value = '${totalUSD.toFixed(2)}'; updateChange();">Exact ($${totalUSD.toFixed(2)})</button>
            <button class="bill-chip" onclick="document.getElementById('pos-tendered-input').value = '5.00'; updateChange();">$5</button>
            <button class="bill-chip" onclick="document.getElementById('pos-tendered-input').value = '10.00'; updateChange();">$10</button>
            <button class="bill-chip" onclick="document.getElementById('pos-tendered-input').value = '20.00'; updateChange();">$20</button>
            <button class="bill-chip" onclick="document.getElementById('pos-tendered-input').value = '50.00'; updateChange();">$50</button>
            <button class="bill-chip" onclick="document.getElementById('pos-tendered-input').value = '100.00'; updateChange();">$100</button>
          </div>

          <!-- Quick Cambodian Riel Bills -->
          <div style="font-size:11px; font-weight:600; color:#166534; margin-bottom:6px;">
            Quick Cambodian Riel Bills (Converted at 4,100):
          </div>
          <div class="quick-bills-grid">
            <button class="bill-chip bill-chip-khr" onclick="document.getElementById('pos-tendered-input').value = (20000 / 4100).toFixed(2); updateChange();">20,000 ៛ ($4.88)</button>
            <button class="bill-chip bill-chip-khr" onclick="document.getElementById('pos-tendered-input').value = (50000 / 4100).toFixed(2); updateChange();">50,000 ៛ ($12.20)</button>
            <button class="bill-chip bill-chip-khr" onclick="document.getElementById('pos-tendered-input').value = (100000 / 4100).toFixed(2); updateChange();">100,000 ៛ ($24.39)</button>
            <button class="bill-chip bill-chip-khr" onclick="document.getElementById('pos-tendered-input').value = (200000 / 4100).toFixed(2); updateChange();">200,000 ៛ ($48.78)</button>
          </div>

          <!-- Change Return Dual-Currency Display Box -->
          <div class="change-return-box">
            <div>
              <div style="font-weight:700; font-size:13px; color:var(--foreground);">Change to Return:</div>
              <div style="font-size:11px; color:var(--muted-foreground);">Due to customer</div>
            </div>
            <div>
              <div class="change-return-val" id="pos-change-disp">$0.00 USD</div>
              <div class="change-return-sub" id="pos-change-khr">≈ 0 ៛ KHR</div>
            </div>
          </div>

          <div style="margin-top:16px;">
            <button class="btn btn-success btn-lg w-full justify-center" id="btn-complete-cash-sale" style="font-size:14px; font-weight:700; box-shadow:0 4px 14px rgba(16, 185, 129, 0.35);">
              ✓ Confirm Cash Received & Print Receipt
            </button>
          </div>
        </div>

        <!-- Tab Pane 3: Card Swipe -->
        <div id="tab-pane-card" class="${isCard ? '' : 'hidden'}" style="text-align:center; padding:24px 0;">
          <div style="color:#2563eb; margin-bottom:12px;">${Icons.get('credit-card', '', 48)}</div>
          <h4 style="font-size:15px; font-weight:700; color:var(--foreground);">Simulated POS Terminal Connected</h4>
          <p class="text-xs text-muted" style="margin-bottom:20px; max-width:340px; margin-left:auto; margin-right:auto;">
            Ready to authorize contactless chip/debit card swipe for $${totalUSD.toFixed(2)} (${totalKHR.toLocaleString()} KHR).
          </p>
          <button class="btn btn-primary btn-lg" id="btn-complete-card-sale" style="font-weight:700;">
            ✓ Authorize Card Swipe & Print
          </button>
        </div>
      </div>
    `;

    modal.open({
      title: 'Branch Register – Tender Payment',
      content,
      footer: `
        <button class="btn btn-secondary" onclick="modal.close(); if (window.posTimerInterval) clearInterval(window.posTimerInterval);">Cancel</button>
      `,
      size: 'md'
    });

    // Start 180s live countdown timer
    if (window.posTimerInterval) clearInterval(window.posTimerInterval);
    let secondsRemaining = 180;
    const timerText = document.getElementById('khqr-timer-text');

    window.posTimerInterval = setInterval(() => {
      secondsRemaining--;
      if (secondsRemaining <= 0) {
        clearInterval(window.posTimerInterval);
        if (timerText) timerText.innerHTML = '<span style="color:#ef4444; font-weight:800;">EXPIRED</span>';
      } else {
        const mins = String(Math.floor(secondsRemaining / 60)).padStart(2, '0');
        const secs = String(secondsRemaining % 60).padStart(2, '0');
        if (timerText) timerText.textContent = `${mins}:${secs}`;
      }
    }, 1000);

    // Currency toggle buttons
    const btnUSD = document.getElementById('pos-curr-usd-btn');
    const btnKHR = document.getElementById('pos-curr-khr-btn');
    const amtMain = document.getElementById('khqr-amount-main');
    const amtSub = document.getElementById('khqr-amount-sub');

    if (btnUSD && btnKHR) {
      btnUSD.addEventListener('click', () => {
        currentCurrency = 'USD';
        btnUSD.className = 'btn btn-primary btn-sm';
        btnKHR.className = 'btn btn-secondary btn-sm';
        if (amtMain) amtMain.textContent = `$${totalUSD.toFixed(2)} USD`;
        if (amtSub) amtSub.textContent = `≈ ${totalKHR.toLocaleString()} KHR (Simulated Rate: 4,100)`;
      });

      btnKHR.addEventListener('click', () => {
        currentCurrency = 'KHR';
        btnKHR.className = 'btn btn-primary btn-sm';
        btnUSD.className = 'btn btn-secondary btn-sm';
        if (amtMain) amtMain.textContent = `${totalKHR.toLocaleString()} KHR`;
        if (amtSub) amtSub.textContent = `≈ $${totalUSD.toFixed(2)} USD (Simulated Rate: 4,100)`;
      });
    }

    // Payment method selector switching
    const methodCards = document.querySelectorAll('#pos-pay-selector .payment-method-card');
    methodCards.forEach(card => {
      card.addEventListener('click', (e) => {
        methodCards.forEach(item => item.classList.remove('selected'));
        const target = e.currentTarget;
        target.classList.add('selected');
        const method = target.dataset.method;

        const paneKhqr = document.getElementById('tab-pane-khqr');
        const paneCash = document.getElementById('tab-pane-cash');
        const paneCard = document.getElementById('tab-pane-card');

        if (paneKhqr) paneKhqr.classList.toggle('hidden', method !== 'khqr');
        if (paneCash) paneCash.classList.toggle('hidden', method !== 'cash');
        if (paneCard) paneCard.classList.toggle('hidden', method !== 'card');

        if (method === 'khqr') currentMethod = 'Bakong KHQR';
        else if (method === 'cash') currentMethod = 'Cash';
        else currentMethod = 'Card (Simulated)';
      });
    });

    const tenderedInput = document.getElementById('pos-tendered-input');
    const changeDisp = document.getElementById('pos-change-disp');
    const changeKhrDisp = document.getElementById('pos-change-khr');

    window.updateChange = () => {
      const tendered = parseFloat(tenderedInput ? tenderedInput.value : 0) || 0;
      const change = Math.max(0, tendered - totalUSD);
      const changeKHR = Math.round(change * 4100);
      if (changeDisp) changeDisp.textContent = `$${change.toFixed(2)} USD`;
      if (changeKhrDisp) changeKhrDisp.textContent = `≈ ${changeKHR.toLocaleString()} ៛ KHR`;
      const tenderKhrPreview = document.getElementById('tender-khr-preview');
      if (tenderKhrPreview) tenderKhrPreview.textContent = `≈ ${(Math.round(tendered * 4100)).toLocaleString()} ៛`;
    };
    if (tenderedInput) tenderedInput.addEventListener('input', window.updateChange);

    const executeSale = (method, tendered = null) => {
      if (window.posTimerInterval) clearInterval(window.posTimerInterval);
      const user = authService.getCurrentUser() || { name: 'Sopheak Lim', id: 'USR-005' };
      const customers = stateManager.get('customers') || [];
      const custObj = customers.find(c => c.id === this.selectedCustomerId);

      try {
        const sale = salesService.createSale({
          branchId: this.branchId,
          cashierName: user.name,
          cashierId: user.id,
          customerId: this.selectedCustomerId,
          customerName: custObj ? custObj.name : 'Walk-in Customer',
          items: this.cart,
          discount: this.appliedDiscount,
          paymentMethod: method,
          tenderedAmount: tendered || totalUSD
        });

        this.cart = [];
        this.appliedDiscount = 0.00;
        this.renderCart();
        modal.close();

        toast.success(`Payment verified via ${method}! Receipt generated.`);
        this.openReceiptModal(sale);

      } catch (err) {
        toast.error(err.message);
      }
    };

    // KHQR Simulation Buttons
    document.getElementById('btn-sim-khqr-success').addEventListener('click', () => {
      executeSale('Bakong KHQR');
    });

    document.getElementById('btn-sim-khqr-fail').addEventListener('click', () => {
      toast.error('Simulated Failure: Customer declined transaction in mobile banking app.');
      if (timerText) timerText.innerHTML = '<span style="color:#ef4444; font-weight:800;">FAILED</span>';
    });

    document.getElementById('btn-sim-khqr-expire').addEventListener('click', () => {
      if (window.posTimerInterval) clearInterval(window.posTimerInterval);
      toast.warning('Simulated Expiration: Payment window expired without verification.');
      if (timerText) timerText.innerHTML = '<span style="color:#ef4444; font-weight:800;">EXPIRED</span>';
    });

    // Cash & Card confirm
    document.getElementById('btn-complete-cash-sale').addEventListener('click', () => {
      const tendered = parseFloat(tenderedInput.value) || totalUSD;
      executeSale('Cash', tendered);
    });

    document.getElementById('btn-complete-card-sale').addEventListener('click', () => {
      executeSale('Card (Simulated)');
    });
  }

  openReceiptModal(sale) {
    const branches = stateManager.get('branches') || [];
    const bObj = branches.find(b => b.id === sale.assignedBranch) || { name: 'Phnom Penh Central', address: 'Preah Monivong Blvd, Phnom Penh', phone: '023-991-001' };

    const itemsHtml = sale.items.map(i => `
      <tr>
        <td>${i.name}<br/><span style="font-size:10px; color:#555;">${i.sku}</span></td>
        <td style="text-align:center;">${i.quantity}</td>
        <td style="text-align:right;">$${i.price.toFixed(2)}</td>
        <td style="text-align:right;">$${i.total.toFixed(2)}</td>
      </tr>
    `).join('');

    const content = `
      <div>
        <div class="thermal-receipt" id="printable-thermal-receipt">
          <div class="receipt-header">
            <h2 style="font-size:14px; font-weight:800; letter-spacing:1px; margin:0;">SMARTRETAIL AI</h2>
            <div style="font-size:10px;">${bObj.name}</div>
            <div style="font-size:9px; color:#444;">${bObj.address}</div>
            <div style="font-size:9px; color:#444;">Tel: ${bObj.phone}</div>
            <div style="font-size:9px; margin-top:4px;">VAT TIN: K009-90281923</div>
          </div>

          <div style="font-size:11px; margin-bottom:6px;">
            <div><strong>Receipt #:</strong> ${sale.orderNumber}</div>
            <div><strong>Date:</strong> ${new Date(sale.createdAt).toLocaleString()}</div>
            <div><strong>Cashier:</strong> ${sale.cashier}</div>
            <div><strong>Customer:</strong> ${sale.customerName}</div>
          </div>

          <table class="receipt-items">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Price</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="receipt-totals">
            <div class="receipt-row">
              <span>Subtotal:</span>
              <span>$${sale.subtotal.toFixed(2)}</span>
            </div>
            ${sale.discount > 0 ? `
              <div class="receipt-row">
                <span>Discount:</span>
                <span>-$${sale.discount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="receipt-row" style="font-weight:800; font-size:13px; border-top:1px solid #111; padding-top:4px; margin-top:4px;">
              <span>TOTAL (USD):</span>
              <span>$${sale.total.toFixed(2)}</span>
            </div>
            <div class="receipt-row" style="font-size:10px; color:#555;">
              <span>TOTAL (KHR):</span>
              <span>${Math.round(sale.total * 4100).toLocaleString()} ៛</span>
            </div>
            <div class="receipt-row" style="font-size:10px; margin-top:4px;">
              <span>Payment (${sale.paymentMethod}):</span>
              <span>$${sale.tenderedAmount.toFixed(2)}</span>
            </div>
            ${sale.transactionRef ? `
              <div class="receipt-row" style="font-size:9px; color:#444;">
                <span>KHQR Ref:</span>
                <span>${sale.transactionRef}</span>
              </div>
            ` : ''}
            <div class="receipt-row" style="font-size:10px;">
              <span>Change Returned:</span>
              <span>$${sale.changeAmount.toFixed(2)}</span>
            </div>
          </div>

          <div class="receipt-footer">
            <div>*** THANK YOU FOR SHOPPING WITH US ***</div>
            <div style="font-size:9px; color:#666; margin-top:3px;">Goods sold are covered under SmartRetail AI Warranty. Keep receipt for claims.</div>
            <div style="font-size:9px; margin-top:4px;">Powered by SmartRetail AI v2.0</div>
          </div>
        </div>
      </div>
    `;

    modal.open({
      title: 'POS Customer Receipt',
      content,
      footer: `
        <button class="btn btn-secondary" onclick="modal.close()">Done</button>
        <button class="btn btn-primary" id="btn-print-receipt">
          ${Icons.get('printer', '', 16)} Print Thermal Receipt
        </button>
      `,
      size: 'sm'
    });

    document.getElementById('btn-print-receipt').addEventListener('click', () => {
      window.print();
    });
  }

  openSalesHistoryModal() {
    const history = salesService.getSalesHistory(this.branchId);

    const content = `
      <div style="max-height:380px; overflow-y:auto;">
        ${history.length === 0 ? '<p class="text-sm text-muted">No sales recorded today.</p>' : `
          <table class="table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Time</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${history.map(s => `
                <tr>
                  <td><strong>${s.orderNumber}</strong></td>
                  <td>${new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>${s.customerName}</td>
                  <td><strong>$${s.total.toFixed(2)}</strong></td>
                  <td><span class="badge badge-secondary">${s.paymentMethod}</span></td>
                  <td>
                    <button class="btn btn-outline btn-sm view-receipt-btn" data-id="${s.id}">
                      Reprint
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    `;

    modal.open({
      title: `Branch Sales Register: ${this.branchId}`,
      content,
      size: 'lg'
    });

    document.querySelectorAll('.view-receipt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sale = history.find(s => s.id === e.currentTarget.dataset.id);
        if (sale) {
          modal.close();
          this.openReceiptModal(sale);
        }
      });
    });
  }
}

// Global bootstrap for POS App
let posApp;
document.addEventListener('DOMContentLoaded', () => {
  posApp = new POSApp();
});

