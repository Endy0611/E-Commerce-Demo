/**
 * SmartRetail AI - Enterprise Management Dashboard Application Controller
 * Handles 15 business submodules, role-based views, live Chart.js charts, and workflows
 */

class AdminApp {
  constructor() {
    this.currentModule = 'dashboard';
    this.selectedBranchFilter = authService.getAssignedBranch() || 'All';
    this.charts = {};
    this.init();
  }

  init() {
    this.bindNavigation();
    this.renderHeaderUser();
    this.renderBranchSelector();
    this.renderModule(this.currentModule);
    this.bindAIWidget();
    this.bindNotifications();

    // Re-render when central state changes
    stateManager.subscribe(() => {
      this.renderNotificationBadge();
      // If currently on dashboard or active module, refresh live tables
      if (this.currentModule === 'dashboard') {
        this.renderDashboardKPIs();
        this.renderRecentTransactions();
        this.updateCharts();
      } else if (this.currentModule === 'inventory') {
        this.renderInventoryTable();
      } else if (this.currentModule === 'orders') {
        this.renderOrdersTable();
      } else if (this.currentModule === 'transfers') {
        this.renderTransfersTable();
      } else if (this.currentModule === 'purchasing') {
        this.renderPurchaseOrdersTable();
      } else if (this.currentModule === 'payments') {
        this.renderPaymentsTable();
      }
    });
  }

  bindNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const targetModule = e.currentTarget.dataset.module;
        if (!targetModule) return;

        navItems.forEach(n => n.classList.remove('active'));
        e.currentTarget.classList.add('active');

        this.currentModule = targetModule;
        this.renderModule(targetModule);
      });
    });
  }

  renderHeaderUser() {
    const user = authService.getCurrentUser();
    const nameEl = document.getElementById('admin-user-name');
    const roleEl = document.getElementById('admin-user-role');
    const avatarEl = document.getElementById('admin-user-avatar');

    if (nameEl && user) nameEl.textContent = user.name;
    if (roleEl && user) roleEl.textContent = `${user.role} ${user.branch !== 'All' ? `(${user.branch})` : ''}`;
    if (avatarEl && user) avatarEl.textContent = user.avatar;
  }

  renderBranchSelector() {
    const select = document.getElementById('admin-branch-select');
    if (!select) return;

    const assigned = authService.getAssignedBranch();
    const branches = stateManager.get('branches') || [];

    if (assigned) {
      // Scoped branch manager: lock selector to assigned branch
      this.selectedBranchFilter = assigned;
      const bObj = branches.find(b => b.id === assigned);
      select.innerHTML = `<option value="${assigned}" selected>${bObj ? bObj.name : assigned}</option>`;
      select.disabled = true;
    } else {
      select.disabled = false;
      let options = `<option value="All" ${this.selectedBranchFilter === 'All' ? 'selected' : ''}>All Branches (Global)</option>`;
      branches.forEach(b => {
        options += `<option value="${b.id}" ${this.selectedBranchFilter === b.id ? 'selected' : ''}>${b.name} (${b.id})</option>`;
      });
      select.innerHTML = options;

      select.addEventListener('change', (e) => {
        this.selectedBranchFilter = e.target.value;
        this.renderModule(this.currentModule);
      });
    }
  }

  renderModule(moduleName) {
    const titleEl = document.getElementById('admin-page-title');
    const contentEl = document.getElementById('admin-content-area');
    if (!contentEl) return;

    const moduleTitles = {
      'dashboard': 'Executive Overview & Business KPIs',
      'branches': 'Branch & Warehouse Locations',
      'products': 'Global Product Catalog Management',
      'inventory': 'Multi-Branch Inventory & Stock Status',
      'movements': 'Inventory Movement Audit Trail',
      'transfers': 'Inter-Branch Stock Transfer Management',
      'purchasing': 'Suppliers & Purchase Orders (Procurement)',
      'orders': 'Online Orders & Branch Pickups',
      'fulfillment': 'Warehouse & Store Order Fulfillment',
      'payments': 'Payments Management & Bakong KHQR Gateway',
      'returns': 'Customer Returns, Refunds & Warranty RMA',
      'customers': 'Customer Directory (CRM)',
      'promotions': 'Promotions, Discounts & Coupons',
      'employees': 'Employee Directory & Role Access',
      'reports': 'Reports & Analytics Export'
    };

    if (titleEl) titleEl.textContent = moduleTitles[moduleName] || 'Management Module';

    switch (moduleName) {
      case 'dashboard':
        this.renderDashboardModule(contentEl);
        break;
      case 'branches':
        this.renderBranchesModule(contentEl);
        break;
      case 'products':
        this.renderProductsModule(contentEl);
        break;
      case 'inventory':
        this.renderInventoryModule(contentEl);
        break;
      case 'movements':
        this.renderMovementsModule(contentEl);
        break;
      case 'transfers':
        this.renderTransfersModule(contentEl);
        break;
      case 'purchasing':
        this.renderPurchasingModule(contentEl);
        break;
      case 'orders':
        this.renderOrdersModule(contentEl);
        break;
      case 'fulfillment':
        this.renderFulfillmentModule(contentEl);
        break;
      case 'payments':
        this.renderPaymentsModule(contentEl);
        break;
      case 'returns':
        this.renderReturnsModule(contentEl);
        break;
      case 'customers':
        this.renderCustomersModule(contentEl);
        break;
      case 'promotions':
        this.renderPromotionsModule(contentEl);
        break;
      case 'employees':
        this.renderEmployeesModule(contentEl);
        break;
      case 'reports':
        this.renderReportsModule(contentEl);
        break;
      default:
        this.renderDashboardModule(contentEl);
    }
  }

  // =========================================================================
  // 1. DASHBOARD MODULE
  // =========================================================================
  renderDashboardModule(container) {
    container.innerHTML = `
      <!-- KPI Cards Grid -->
      <div class="kpi-grid" id="dashboard-kpis-container">
        <!-- Injected dynamically -->
      </div>

      <!-- Analytics Charts Grid -->
      <div class="analytics-grid">
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <h4 class="card-title">Sales Revenue by Branch</h4>
              <span class="card-subtitle">Real-time aggregate across physical stores & central orders</span>
            </div>
          </div>
          <div class="chart-card-body">
            <canvas id="chart-revenue-branch"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <h4 class="card-title">Sales by Category</h4>
              <span class="card-subtitle">Volume breakdown</span>
            </div>
          </div>
          <div class="chart-card-body">
            <canvas id="chart-sales-category"></canvas>
          </div>
        </div>
      </div>

      <!-- Recent Transactions & Alerts Grid -->
      <div style="display:grid; grid-template-columns:2fr 1fr; gap:24px;">
        <div class="card">
          <div class="card-header">
            <div>
              <h4 class="card-title">Recent Transactions (POS & Online)</h4>
              <span class="card-subtitle">Synchronized live transaction log</span>
            </div>
            <button class="btn btn-outline btn-sm" onclick="adminApp.renderModule('orders')">View All</button>
          </div>
          <div class="table-container" style="border:none; border-radius:0;">
            <table class="table" id="recent-transactions-table">
              <thead>
                <tr>
                  <th>Order / Receipt #</th>
                  <th>Channel</th>
                  <th>Customer</th>
                  <th>Branch</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="recent-transactions-tbody">
                <!-- Dynamically loaded -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- Low Stock Alerts Widget -->
        <div class="card">
          <div class="card-header">
            <div>
              <h4 class="card-title">Stock Shortage Alerts</h4>
              <span class="card-subtitle">Items at or below reorder limit</span>
            </div>
            <button class="btn btn-outline btn-sm" onclick="adminApp.renderModule('transfers')">Transfer Stock</button>
          </div>
          <div class="card-body" style="padding:12px; max-height:360px; overflow-y:auto;" id="dashboard-low-stock-list">
            <!-- Dynamically loaded -->
          </div>
        </div>
      </div>
    `;

    this.renderDashboardKPIs();
    this.renderRecentTransactions();
    this.renderLowStockWidget();
    this.initDashboardCharts();
  }

  generateSparkline(points, width = 280, height = 44, color = '#2563eb', gradId = 'kpi-rev-spark') {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = (max - min) || 1;
    const pad = 4;
    const h = height - pad * 2;
    const step = width / (points.length - 1);

    const pts = points.map((val, i) => [
      i * step,
      height - pad - ((val - min) / range) * h
    ]);

    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const cur = pts[i];
      const cpx = (prev[0] + cur[0]) / 2;
      d += ` C ${cpx} ${prev[1]}, ${cpx} ${cur[1]}, ${cur[0]} ${cur[1]}`;
    }
    const area = `${d} L ${width} ${height} L 0 ${height} Z`;

    return `
      <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:${height}px; overflow:visible;" preserveAspectRatio="none">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.25" />
            <stop offset="100%" stop-color="${color}" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <path d="${area}" fill="url(#${gradId})" />
        <path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="4" fill="${color}" stroke="#ffffff" stroke-width="2" />
      </svg>
    `;
  }

  renderDashboardKPIs() {
    const kpiContainer = document.getElementById('dashboard-kpis-container');
    if (!kpiContainer) return;

    const bFilter = this.selectedBranchFilter === 'All' ? null : this.selectedBranchFilter;
    const kpis = reportService.getKPISummary(bFilter);
    const revenueKHR = Math.round(kpis.revenue * 4100).toLocaleString();

    // 1. Channel Revenue Breakdown
    const orders = stateManager.get('orders') || [];
    const validOrders = orders.filter(o => !bFilter || o.assignedBranch === bFilter);
    const posOrders = validOrders.filter(o => o.channel === 'POS');
    const onlineOrders = validOrders.filter(o => o.channel !== 'POS');
    const posRev = posOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const onlineRev = onlineOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalRevAll = (posRev + onlineRev) || 1;
    const posPct = Math.round((posRev / totalRevAll) * 100);
    const onlinePct = Math.round((onlineRev / totalRevAll) * 100);

    // 2. Valuation calculation
    const valuation = inventoryService.getValuation ? inventoryService.getValuation(bFilter) : { totalValue: kpis.revenue * 2.5, totalItems: 480 };

    // 3. Digital payment ratios (Bakong KHQR vs Cash vs Card)
    const payments = stateManager.get('payments') || [];
    const filteredPayments = payments.filter(p => !bFilter || p.branchId === bFilter);
    const khqrTotal = filteredPayments.filter(p => p.paymentMethod && p.paymentMethod.includes('KHQR')).reduce((s, p) => s + (p.usdAmount || p.amount || 0), 0);
    const cashTotal = filteredPayments.filter(p => p.paymentMethod && p.paymentMethod.includes('Cash')).reduce((s, p) => s + (p.usdAmount || p.amount || 0), 0);
    const cardTotal = filteredPayments.filter(p => p.paymentMethod && p.paymentMethod.includes('Card')).reduce((s, p) => s + (p.usdAmount || p.amount || 0), 0);
    const totalPay = (khqrTotal + cashTotal + cardTotal) || 1;
    const khqrPct = Math.round((khqrTotal / totalPay) * 100) || 74;
    const cashPct = Math.round((cashTotal / totalPay) * 100) || 20;
    const cardPct = Math.max(0, 100 - khqrPct - cashPct);

    // 4. Low stock items
    const lowStockItems = inventoryService.getLowStockItems ? inventoryService.getLowStockItems(bFilter) : [];

    // 5. Dynamic 7-day sparkline trajectory based on live revenue
    const rev = kpis.revenue || 1200;
    const sparkPoints = [
      Math.round(rev * 0.42),
      Math.round(rev * 0.58),
      Math.round(rev * 0.51),
      Math.round(rev * 0.74),
      Math.round(rev * 0.69),
      Math.round(rev * 0.88),
      Math.round(rev)
    ];
    const revenueSparkline = this.generateSparkline(sparkPoints, 280, 46, '#2563eb', 'kpi-rev-spark');

    kpiContainer.innerHTML = `
      <!-- 1. Hero Revenue Card (Bento Span 5) -->
      <div class="stat-card kpi-col-5">
        <div class="stat-card-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="stat-card-title">Net Revenue (All Channels)</span>
            <span class="kpi-pulse-live"><span class="kpi-pulse-dot"></span> Live Sync</span>
          </div>
          <div class="stat-card-icon" style="background:#eff6ff; color:#2563eb; border-color:#dbeafe;">
            ${Icons.get('credit-card', '', 18)}
          </div>
        </div>

        <div class="stat-card-value" style="font-size:2.35rem; color:#0f172a;">
          $${kpis.revenue.toFixed(2)} <span style="font-size:14px; font-weight:700; color:#3b82f6;">USD</span>
        </div>

        <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
          <span class="kpi-metric-badge" style="background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe; font-weight:700;">
            ≈ ${revenueKHR} ៛ KHR
          </span>
          <span style="font-size:11px; color:#64748b;">(NBC Simulated: 4,100)</span>
          <span class="trend-pill-up" style="margin-left:auto;">&uarr; +18.4%</span>
        </div>

        <!-- Embedded SVG Area Sparkline -->
        <div style="margin:4px 0 10px;">
          ${revenueSparkline}
        </div>

        <div class="stat-card-footer" style="padding-top:10px;">
          <div style="display:flex; align-items:center; gap:12px; font-size:11px;">
            <span><strong>POS In-Store:</strong> $${posRev.toFixed(0)} (${posPct}%)</span>
            <span>&bull;</span>
            <span><strong>E-Commerce:</strong> $${onlineRev.toFixed(0)} (${onlinePct}%)</span>
          </div>
        </div>
      </div>

      <!-- 2. Gross Margin & Unit Profitability (Bento Span 3) -->
      <div class="stat-card kpi-col-3">
        <div class="stat-card-header">
          <span class="stat-card-title">Gross Profit & Margin</span>
          <div class="stat-card-icon" style="background:#ecfdf5; color:#10b981; border-color:#a7f3d0;">
            ${Icons.get('bar-chart', '', 18)}
          </div>
        </div>

        <div class="stat-card-value" style="color:#059669;">
          $${kpis.grossProfit.toFixed(2)}
        </div>
        <div class="stat-card-sub">Net Margin: <strong>${kpis.profitMargin}%</strong></div>

        <!-- Progress Bar for Profit Margin -->
        <div class="kpi-progress-track">
          <div class="kpi-progress-fill" style="width:${Math.min(100, Math.max(10, parseFloat(kpis.profitMargin) * 2))}%; background:linear-gradient(90deg, #10b981, #059669);"></div>
        </div>

        <div class="stat-card-footer">
          <span class="trend-pill-up">&uarr; +2.4% vs target</span>
          <span style="font-size:11px; color:#64748b;">FIFO Cost Basis</span>
        </div>
      </div>

      <!-- 3. Active Order Pipeline & Fulfillment (Bento Span 4) -->
      <div class="stat-card kpi-col-4">
        <div class="stat-card-header">
          <span class="stat-card-title">Order Fulfillment Velocity</span>
          <div class="stat-card-icon" style="background:#f0f9ff; color:#0284c7; border-color:#bae6fd;">
            ${Icons.get('shopping-bag', '', 18)}
          </div>
        </div>

        <div class="stat-card-value">
          ${kpis.totalOrders} <span style="font-size:13px; font-weight:600; color:#64748b;">Orders</span>
        </div>

        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px;">
          <span class="badge badge-primary" style="font-size:10px;">
            ${kpis.pendingOrders} in Picking & Transit
          </span>
          <span class="badge badge-success" style="font-size:10px;">
            ${validOrders.filter(o => o.status === 'Delivered' || o.status === 'Completed').length} Completed
          </span>
        </div>

        <div class="kpi-progress-track">
          <div class="kpi-progress-fill" style="width:78%; background:#0284c7;"></div>
        </div>

        <div class="stat-card-footer">
          <span style="font-size:11px; color:#475569;">Avg Dispatch: <strong>22 mins</strong></span>
          <a href="javascript:void(0)" onclick="adminApp.renderModule('fulfillment')" style="color:#2563eb; font-weight:600; text-decoration:none; font-size:11px;">Station &rarr;</a>
        </div>
      </div>

      <!-- 4. Network Inventory Asset Valuation (Bento Span 4) -->
      <div class="stat-card kpi-col-4">
        <div class="stat-card-header">
          <span class="stat-card-title">Network Inventory Assets</span>
          <div class="stat-card-icon" style="background:#f8fafc; color:#475569; border-color:#e2e8f0;">
            ${Icons.get('box', '', 18)}
          </div>
        </div>

        <div class="stat-card-value" style="font-size:1.85rem;">
          $${valuation.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div class="stat-card-sub">
          <strong>${valuation.totalItems}</strong> Physical Units Across Branches
        </div>

        <!-- Stacked Multi-Branch Distribution Bar -->
        <div class="kpi-progress-track" title="Branch Stock Distribution">
          <div class="kpi-stacked-seg" style="width:32%; background:#2563eb;" title="Phnom Penh Central: 32%"></div>
          <div class="kpi-stacked-seg" style="width:24%; background:#38bdf8;" title="Toul Kork: 24%"></div>
          <div class="kpi-stacked-seg" style="width:18%; background:#10b981;" title="Sen Sok: 18%"></div>
          <div class="kpi-stacked-seg" style="width:14%; background:#f59e0b;" title="Siem Reap: 14%"></div>
          <div class="kpi-stacked-seg" style="width:12%; background:#94a3b8;" title="Warehouse: 12%"></div>
        </div>

        <div class="stat-card-footer">
          <span class="kpi-metric-badge">5 Locations Audited</span>
          <a href="javascript:void(0)" onclick="adminApp.renderModule('inventory')" style="color:#2563eb; font-weight:600; text-decoration:none; font-size:11px;">Inventory &rarr;</a>
        </div>
      </div>

      <!-- 5. Stock Shortage Radar (Bento Span 4) -->
      <div class="stat-card kpi-col-4">
        <div class="stat-card-header">
          <span class="stat-card-title">Stock Shortage Radar</span>
          <div class="stat-card-icon" style="background:#fffbeb; color:#d97706; border-color:#fde68a;">
            ${Icons.get('alert-triangle', '', 18)}
          </div>
        </div>

        <div class="stat-card-value" style="color:${kpis.lowStockCount > 0 ? '#d97706' : '#10b981'};">
          ${kpis.lowStockCount} <span style="font-size:13px; font-weight:600; color:#64748b;">SKUs At Risk</span>
        </div>

        <div class="stat-card-sub">
          ${kpis.lowStockCount > 0 ? 'Units are &le; reorder safety threshold' : 'All branch stocks healthy'}
        </div>

        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px;">
          ${lowStockItems.slice(0, 2).map(i => `
            <span class="badge badge-warning" style="font-size:10px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              ${i.sku} (${i.totalAvailable} left)
            </span>
          `).join('') || '<span class="badge badge-success" style="font-size:10px;">Safe Buffer Maintained</span>'}
        </div>

        <div class="stat-card-footer">
          <span class="${kpis.lowStockCount > 0 ? 'trend-pill-warn' : 'trend-pill-up'}">
            ${kpis.lowStockCount > 0 ? 'Replenish Required' : 'Optimal'}
          </span>
          <button class="btn btn-outline btn-sm" onclick="adminApp.renderModule('transfers')" style="padding:2px 8px; font-size:10px; font-weight:700;">
            ⚡ Quick Transfer
          </button>
        </div>
      </div>

      <!-- 6. Cambodia Digital Payments & Bakong Adoption (Bento Span 4) -->
      <div class="stat-card kpi-col-4">
        <div class="stat-card-header">
          <span class="stat-card-title">Bakong KHQR Penetration</span>
          <div class="stat-card-icon" style="background:#fff1f2; color:#be123c; border-color:#fecdd3;">
            ${Icons.get('qr-code', '', 18)}
          </div>
        </div>

        <div class="stat-card-value" style="color:#be123c;">
          ${khqrPct}% <span style="font-size:13px; font-weight:600; color:#64748b;">Digital Ratio</span>
        </div>

        <div class="stat-card-sub">
          <strong>$${khqrTotal.toFixed(0)}</strong> KHQR &bull; <strong>$${cashTotal.toFixed(0)}</strong> Cash &bull; <strong>$${cardTotal.toFixed(0)}</strong> Card
        </div>

        <!-- Stacked Payment Channel Gauge -->
        <div class="kpi-progress-track" title="Payment Mix: Crimson=Bakong KHQR, Green=Cash, Blue=Card">
          <div class="kpi-stacked-seg" style="width:${khqrPct}%; background:#be123c;" title="Bakong KHQR: ${khqrPct}%"></div>
          <div class="kpi-stacked-seg" style="width:${cashPct}%; background:#10b981;" title="Cash: ${cashPct}%"></div>
          <div class="kpi-stacked-seg" style="width:${cardPct}%; background:#2563eb;" title="Card: ${cardPct}%"></div>
        </div>

        <div class="stat-card-footer">
          <span class="kpi-metric-badge" style="color:#be123c; border-color:#fecdd3;">🇰🇭 NBC Bakong Online</span>
          <a href="javascript:void(0)" onclick="adminApp.renderModule('payments')" style="color:#2563eb; font-weight:600; text-decoration:none; font-size:11px;">Ledger &rarr;</a>
        </div>
      </div>
    `;
  }

  renderRecentTransactions() {
    const tbody = document.getElementById('recent-transactions-tbody');
    if (!tbody) return;

    const bFilter = this.selectedBranchFilter === 'All' ? null : this.selectedBranchFilter;
    const orders = stateManager.get('orders') || [];
    const filtered = orders.filter(o => !bFilter || o.assignedBranch === bFilter).slice(0, 6);

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:24px;">No transactions recorded.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(o => `
      <tr>
        <td><strong>${o.orderNumber}</strong></td>
        <td><span class="badge ${o.channel === 'POS' ? 'badge-secondary' : 'badge-primary'}">${o.channel}</span></td>
        <td>${o.customerName}</td>
        <td>${o.branchName || o.assignedBranch}</td>
        <td><strong>$${o.total.toFixed(2)}</strong></td>
        <td><span class="badge badge-${o.status === 'Completed' ? 'success' : o.status === 'Cancelled' ? 'danger' : 'info'}">${o.status}</span></td>
      </tr>
    `).join('');
  }

  renderLowStockWidget() {
    const container = document.getElementById('dashboard-low-stock-list');
    if (!container) return;

    const bFilter = this.selectedBranchFilter === 'All' ? null : this.selectedBranchFilter;
    const lowStock = inventoryService.getLowStockItems(bFilter);

    if (lowStock.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:20px 0; color:#10b981;">
          ${Icons.get('check', '', 32)}
          <p style="font-size:13px; font-weight:600; margin-top:6px;">All branches sufficiently stocked.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = lowStock.slice(0, 5).map(item => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:8px; font-size:12px;">
        <div>
          <div style="font-weight:700; color:#0f172a;">${item.product.name}</div>
          <div style="color:#64748b;">${item.branchName} (${item.sku})</div>
        </div>
        <div style="text-align:right;">
          <span class="badge ${item.available === 0 ? 'badge-danger' : 'badge-warning'}">
            ${item.available} Available
          </span>
          <div style="font-size:10px; color:#94a3b8; margin-top:2px;">Reorder at ${item.reorderLevel}</div>
        </div>
      </div>
    `).join('');
  }

  initDashboardCharts() {
    if (typeof Chart === 'undefined') return;

    // 1. Revenue by Branch Bar Chart
    const ctxBranch = document.getElementById('chart-revenue-branch');
    if (ctxBranch) {
      const branchData = reportService.getRevenueByBranch();
      if (this.charts.revenueBranch) this.charts.revenueBranch.destroy();

      this.charts.revenueBranch = new Chart(ctxBranch, {
        type: 'bar',
        data: {
          labels: branchData.map(b => b.name),
          datasets: [{
            label: 'Revenue ($ USD)',
            data: branchData.map(b => b.revenue),
            backgroundColor: ['#2563eb', '#0d9488', '#0284c7', '#3b82f6'],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // 2. Sales by Category Doughnut Chart
    const ctxCat = document.getElementById('chart-sales-category');
    if (ctxCat) {
      const bFilter = this.selectedBranchFilter === 'All' ? null : this.selectedBranchFilter;
      const catData = reportService.getSalesByCategory(bFilter);
      if (this.charts.salesCategory) this.charts.salesCategory.destroy();

      this.charts.salesCategory = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
          labels: catData.map(c => c.category),
          datasets: [{
            data: catData.map(c => c.amount),
            backgroundColor: ['#2563eb', '#0d9488', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
        }
      });
    }
  }

  updateCharts() {
    if (this.charts.revenueBranch) {
      const branchData = reportService.getRevenueByBranch();
      this.charts.revenueBranch.data.labels = branchData.map(b => b.name);
      this.charts.revenueBranch.data.datasets[0].data = branchData.map(b => b.revenue);
      this.charts.revenueBranch.update();
    }

    if (this.charts.salesCategory) {
      const bFilter = this.selectedBranchFilter === 'All' ? null : this.selectedBranchFilter;
      const catData = reportService.getSalesByCategory(bFilter);
      this.charts.salesCategory.data.labels = catData.map(c => c.category);
      this.charts.salesCategory.data.datasets[0].data = catData.map(c => c.amount);
      this.charts.salesCategory.update();
    }
  }

  // =========================================================================
  // 2. BRANCHES MODULE
  // =========================================================================
  renderBranchesModule(container) {
    const branches = stateManager.get('branches') || [];

    container.innerHTML = `
      <div class="action-filter-bar">
        <div>
          <h3 class="card-title">Multi-Branch Network</h3>
          <span class="card-subtitle">5 Locations: 4 Retail Branches + 1 Central Warehouse</span>
        </div>
        <button class="btn btn-primary" id="add-branch-btn">
          ${Icons.get('map-pin', '', 14)} Add New Branch
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4">
        ${branches.map(b => {
          const invVal = inventoryService.getValuation(b.id);
          const kpis = reportService.getKPISummary(b.id);

          return `
            <div class="card">
              <div class="card-header">
                <div>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <h4 class="card-title">${b.name}</h4>
                    <span class="badge ${b.type === 'warehouse' ? 'badge-primary' : 'badge-teal'}">${b.type}</span>
                  </div>
                  <span class="card-subtitle">ID: ${b.id} &bull; Manager: ${b.manager}</span>
                </div>
                <span class="badge badge-success">${b.status}</span>
              </div>
              <div class="card-body" style="font-size:13px; display:flex; flex-direction:column; gap:8px;">
                <div><strong>Address:</strong> ${b.address}</div>
                <div><strong>Contact:</strong> ${b.phone} &bull; ${b.email}</div>
                <div><strong>Hours:</strong> ${b.openingHours || '08:00 - 20:00'}</div>
                
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:8px; padding-top:12px; border-top:1px solid #e2e8f0; text-align:center;">
                  <div style="background:#f8fafc; padding:8px; border-radius:6px;">
                    <div style="font-size:10px; color:#64748b; text-transform:uppercase;">On-Hand Stock</div>
                    <div style="font-weight:700; font-size:14px;">${invVal.totalItems} units</div>
                  </div>
                  <div style="background:#f8fafc; padding:8px; border-radius:6px;">
                    <div style="font-size:10px; color:#64748b; text-transform:uppercase;">Stock Valuation</div>
                    <div style="font-weight:700; font-size:14px;">$${invVal.totalValue.toFixed(2)}</div>
                  </div>
                  <div style="background:#f8fafc; padding:8px; border-radius:6px;">
                    <div style="font-size:10px; color:#64748b; text-transform:uppercase;">Branch Revenue</div>
                    <div style="font-weight:700; font-size:14px; color:#2563eb;">$${kpis.revenue.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    document.getElementById('add-branch-btn').addEventListener('click', () => {
      toast.info('Simulated Branch Creation: Pre-configured with standard Cambodian branches.');
    });
  }

  // =========================================================================
  // 3. PRODUCTS MODULE
  // =========================================================================
  renderProductsModule(container) {
    const products = stateManager.get('products') || [];

    container.innerHTML = `
      <div class="action-filter-bar">
        <div class="filter-group">
          <input type="text" id="prod-filter-search" class="form-input" placeholder="Search by name, SKU, brand..." style="width:280px;" />
          <select id="prod-filter-cat" class="form-select" style="width:180px;">
            <option value="All">All Categories</option>
            <option value="Chargers">Chargers</option>
            <option value="Cables">Cables</option>
            <option value="Headphones">Headphones</option>
            <option value="Computer Accessories">Computer Accessories</option>
            <option value="Power Banks">Power Banks</option>
            <option value="Phone Cases">Phone Cases</option>
          </select>
        </div>
        <button class="btn btn-primary" id="btn-create-product">
          ${Icons.get('box', '', 14)} Add New Product
        </button>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Brand & Category</th>
              <th>Selling Price</th>
              <th>Cost Price</th>
              <th>Margin</th>
              <th>Warranty</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="products-table-tbody">
            ${products.map(p => {
              const margin = (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(0);
              return `
                <tr>
                  <td><img src="${p.image}" style="width:36px; height:36px; object-fit:contain; border-radius:4px; background:#f8fafc;" /></td>
                  <td><strong>${p.sku}</strong></td>
                  <td><div style="font-weight:600;">${p.name}</div></td>
                  <td>${p.brand} &bull; <span class="text-muted">${p.category}</span></td>
                  <td><strong>$${p.sellingPrice.toFixed(2)}</strong></td>
                  <td>$${p.costPrice.toFixed(2)}</td>
                  <td><span class="badge badge-success">${margin}%</span></td>
                  <td>${p.warranty}</td>
                  <td><span class="badge badge-success">${p.status}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('btn-create-product').addEventListener('click', () => {
      this.openCreateProductModal();
    });
  }

  openCreateProductModal() {
    const content = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
        <div class="form-group">
          <label class="form-label">SKU</label>
          <input type="text" id="np-sku" class="form-input" placeholder="e.g. ANK-65W" required />
        </div>
        <div class="form-group">
          <label class="form-label">Barcode</label>
          <input type="text" id="np-barcode" class="form-input" placeholder="880928371099" />
        </div>
        <div class="form-group" style="grid-column:1 / -1;">
          <label class="form-label">Product Name</label>
          <input type="text" id="np-name" class="form-input" placeholder="Anker Nano II 65W GaN Fast Charger" required />
        </div>
        <div class="form-group">
          <label class="form-label">Brand</label>
          <input type="text" id="np-brand" class="form-input" placeholder="Anker" />
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select id="np-category" class="form-select">
            <option value="Chargers">Chargers</option>
            <option value="Cables">Cables</option>
            <option value="Headphones">Headphones</option>
            <option value="Computer Accessories">Computer Accessories</option>
            <option value="Power Banks">Power Banks</option>
            <option value="Phone Cases">Phone Cases</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Selling Price ($)</label>
          <input type="number" id="np-price" class="form-input" step="0.5" placeholder="35.00" />
        </div>
        <div class="form-group">
          <label class="form-label">Cost Price ($)</label>
          <input type="number" id="np-cost" class="form-input" step="0.5" placeholder="22.00" />
        </div>
      </div>
    `;

    modal.open({
      title: 'Create Global Product Catalog Entry',
      content,
      footer: `
        <button class="btn btn-secondary" onclick="modal.close()">Cancel</button>
        <button class="btn btn-primary" id="save-new-prod-btn">Create Product</button>
      `
    });

    document.getElementById('save-new-prod-btn').addEventListener('click', () => {
      const sku = document.getElementById('np-sku').value.trim();
      const name = document.getElementById('np-name').value.trim();
      const price = parseFloat(document.getElementById('np-price').value) || 20.00;
      const cost = parseFloat(document.getElementById('np-cost').value) || 12.00;

      if (!sku || !name) {
        toast.warning('SKU and Name are required.');
        return;
      }

      const products = stateManager.get('products') || [];
      const newProd = {
        id: `PROD-${Date.now().toString().slice(-4)}`,
        sku,
        name,
        brand: document.getElementById('np-brand').value.trim() || 'Generic',
        category: document.getElementById('np-category').value,
        sellingPrice: price,
        costPrice: cost,
        warranty: '12 months',
        reorderLevel: 6,
        status: 'Active',
        rating: 5.0,
        reviewsCount: 1,
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80',
        description: `${name} high quality electronics accessory.`
      };

      products.push(newProd);
      stateManager.set('products', products);

      // Initialize zero stock across all branches
      const inv = stateManager.get('inventory') || {};
      inv[sku] = {
        'B001': { onHand: 10, reserved: 0, damaged: 0 },
        'B002': { onHand: 5, reserved: 0, damaged: 0 },
        'B003': { onHand: 5, reserved: 0, damaged: 0 },
        'B004': { onHand: 5, reserved: 0, damaged: 0 },
        'WH001': { onHand: 20, reserved: 0, damaged: 0 }
      };
      stateManager.set('inventory', inv);

      modal.close();
      toast.success(`Product ${sku} created and catalog updated!`);
      this.renderProductsModule(document.getElementById('admin-content-area'));
    });
  }

  // =========================================================================
  // 4. INVENTORY MANAGEMENT MODULE
  // =========================================================================
  renderInventoryModule(container) {
    container.innerHTML = `
      <div class="action-filter-bar">
        <div class="filter-group">
          <input type="text" id="inv-search" class="form-input" placeholder="Search inventory by SKU or product..." style="width:260px;" />
          <select id="inv-branch-filter" class="form-select" style="width:200px;">
            <option value="All">All Branches</option>
            <option value="B001">B001 - Phnom Penh Central</option>
            <option value="B002">B002 - Toul Kork</option>
            <option value="B003">B003 - Sen Sok</option>
            <option value="B004">B004 - Siem Reap</option>
            <option value="WH001">WH001 - Central Warehouse</option>
          </select>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary" onclick="reportService.exportCSV('inventory')">
            ${Icons.get('download', '', 14)} Export CSV
          </button>
          <button class="btn btn-primary" id="btn-adjust-stock">
            ${Icons.get('repeat', '', 14)} Audit Adjustment
          </button>
        </div>
      </div>

      <div class="sim-alert">
        <strong>Formula</strong>: Available = On Hand - Reserved - Damaged. Reserved items reflect unfulfilled online orders. Damaged items are isolated from customer availability.
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Branch</th>
              <th>On-Hand</th>
              <th>Reserved</th>
              <th>Damaged</th>
              <th>Available</th>
              <th>Reorder Limit</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="inventory-table-tbody">
            <!-- Dynamically populated -->
          </tbody>
        </table>
      </div>
    `;

    this.renderInventoryTable();

    document.getElementById('inv-branch-filter').addEventListener('change', (e) => {
      this.renderInventoryTable(e.target.value);
    });

    document.getElementById('inv-search').addEventListener('input', (e) => {
      this.renderInventoryTable(document.getElementById('inv-branch-filter').value, e.target.value);
    });

    document.getElementById('btn-adjust-stock').addEventListener('click', () => {
      this.openStockAdjustmentModal();
    });
  }

  renderInventoryTable(targetBranch = 'All', search = '') {
    const tbody = document.getElementById('inventory-table-tbody');
    if (!tbody) return;

    const products = stateManager.get('products') || [];
    const branches = stateManager.get('branches') || [];
    let rows = [];

    products.forEach(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) {
        return;
      }

      branches.forEach(b => {
        if (targetBranch !== 'All' && b.id !== targetBranch) return;

        const rec = inventoryService.getStockRecord(p.sku, b.id);
        const statusBadge = rec.available === 0
          ? `<span class="badge badge-danger">Out of Stock</span>`
          : rec.available <= (p.reorderLevel || 5)
          ? `<span class="badge badge-warning">Low Stock</span>`
          : `<span class="badge badge-success">In Stock</span>`;

        rows.push(`
          <tr>
            <td><strong>${p.sku}</strong></td>
            <td>${p.name}</td>
            <td><span class="badge badge-secondary">${b.name} (${b.id})</span></td>
            <td><strong>${rec.onHand}</strong></td>
            <td style="color:${rec.reserved > 0 ? '#d97706' : '#64748b'};">${rec.reserved}</td>
            <td style="color:${rec.damaged > 0 ? '#ef4444' : '#64748b'};">${rec.damaged}</td>
            <td><span style="font-size:14px; font-weight:800; color:#0f172a;">${rec.available}</span></td>
            <td>${p.reorderLevel || 8}</td>
            <td>${statusBadge}</td>
            <td>
              <button class="btn btn-outline btn-sm quick-adj-btn" data-sku="${p.sku}" data-branch="${b.id}" data-name="${p.name}">
                Adjust
              </button>
            </td>
          </tr>
        `);
      });
    });

    tbody.innerHTML = rows.join('');

    tbody.querySelectorAll('.quick-adj-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sku = e.currentTarget.dataset.sku;
        const branch = e.currentTarget.dataset.branch;
        const name = e.currentTarget.dataset.name;
        this.openStockAdjustmentModal(sku, branch, name);
      });
    });
  }

  openStockAdjustmentModal(sku = '', branchId = 'B001', prodName = '') {
    const products = stateManager.get('products') || [];
    const branches = stateManager.get('branches') || [];

    const productOptions = products.map(p => `
      <option value="${p.sku}" ${p.sku === sku ? 'selected' : ''}>${p.name} (${p.sku})</option>
    `).join('');

    const branchOptions = branches.map(b => `
      <option value="${b.id}" ${b.id === branchId ? 'selected' : ''}>${b.name} (${b.id})</option>
    `).join('');

    const content = `
      <div>
        <div class="form-group">
          <label class="form-label">Select Product</label>
          <select id="adj-sku" class="form-select">${productOptions}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Select Branch</label>
          <select id="adj-branch" class="form-select">${branchOptions}</select>
        </div>
        <div class="form-group">
          <label class="form-label">New Physical On-Hand Count</label>
          <input type="number" id="adj-count" class="form-input" value="15" min="0" required />
        </div>
        <div class="form-group">
          <label class="form-label">Reason for Stock Adjustment</label>
          <select id="adj-reason" class="form-select">
            <option value="Cycle Count Physical Audit">Cycle Count Physical Audit</option>
            <option value="Shrinkage / Missing Items">Shrinkage / Missing Items</option>
            <option value="Damaged Stock Written Off">Damaged Stock Written Off</option>
            <option value="Found Unrecorded Floor Stock">Found Unrecorded Floor Stock</option>
          </select>
        </div>
      </div>
    `;

    modal.open({
      title: 'Physical Inventory Count Adjustment',
      content,
      footer: `
        <button class="btn btn-secondary" onclick="modal.close()">Cancel</button>
        <button class="btn btn-primary" id="confirm-adjust-btn">Commit Adjustment</button>
      `
    });

    document.getElementById('confirm-adjust-btn').addEventListener('click', () => {
      const selectedSku = document.getElementById('adj-sku').value;
      const selectedBranch = document.getElementById('adj-branch').value;
      const count = parseInt(document.getElementById('adj-count').value);
      const reason = document.getElementById('adj-reason').value;

      if (isNaN(count) || count < 0) {
        toast.error('Please enter a valid count.');
        return;
      }

      inventoryService.adjustStock(
        selectedSku,
        selectedBranch,
        count,
        reason,
        authService.getCurrentUser() ? authService.getCurrentUser().name : 'Staff'
      );

      modal.close();
      toast.success(`Inventory updated for ${selectedSku} at ${selectedBranch}. Audit log entry recorded.`);
      this.renderInventoryTable(document.getElementById('inv-branch-filter').value);
    });
  }

  // =========================================================================
  // 5. STOCK MOVEMENTS MODULE
  // =========================================================================
  renderMovementsModule(container) {
    const movements = stateManager.get('stockMovements') || [];

    container.innerHTML = `
      <div class="action-filter-bar">
        <div>
          <h3 class="card-title">Stock Movement Audit Trail</h3>
          <span class="card-subtitle">Complete ledger of all inbound, outbound, reservations, and adjustments</span>
        </div>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>SKU</th>
              <th>Product</th>
              <th>Branch</th>
              <th>Type</th>
              <th>Change</th>
              <th>Balance</th>
              <th>Reference #</th>
              <th>Reason & Notes</th>
              <th>Actor</th>
            </tr>
          </thead>
          <tbody>
            ${movements.map(m => `
              <tr>
                <td style="font-size:11px; color:#64748b;">${new Date(m.timestamp).toLocaleString()}</td>
                <td><strong>${m.sku}</strong></td>
                <td>${m.productName}</td>
                <td><span class="badge badge-secondary">${m.branchId}</span></td>
                <td><span class="badge badge-primary">${m.type}</span></td>
                <td style="font-weight:700; color:${m.quantityChange > 0 ? '#10b981' : m.quantityChange < 0 ? '#ef4444' : '#64748b'};">
                  ${m.quantityChange > 0 ? '+' : ''}${m.quantityChange}
                </td>
                <td><strong>${m.balanceAfter}</strong></td>
                <td><code>${m.reference || 'N/A'}</code></td>
                <td style="font-size:12px;">${m.reason}</td>
                <td><span class="text-muted" style="font-size:11px;">${m.actor}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // =========================================================================
  // 6. STOCK TRANSFERS MODULE
  // =========================================================================
  renderTransfersModule(container) {
    container.innerHTML = `
      <div class="action-filter-bar">
        <div>
          <h3 class="card-title">Inter-Branch Stock Transfers</h3>
          <span class="card-subtitle">Move goods between Toul Kork, Sen Sok, Phnom Penh Central, and Warehouse</span>
        </div>
        <button class="btn btn-primary" id="btn-create-transfer">
          ${Icons.get('repeat', '', 14)} New Transfer Request
        </button>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Transfer #</th>
              <th>Source</th>
              <th>Destination</th>
              <th>Items & Qty</th>
              <th>Reason</th>
              <th>Requested By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="transfers-table-tbody">
            <!-- Injected dynamically -->
          </tbody>
        </table>
      </div>
    `;

    this.renderTransfersTable();

    document.getElementById('btn-create-transfer').addEventListener('click', () => {
      this.openCreateTransferModal();
    });
  }

  renderTransfersTable() {
    const tbody = document.getElementById('transfers-table-tbody');
    if (!tbody) return;

    const bFilter = this.selectedBranchFilter === 'All' ? null : this.selectedBranchFilter;
    const transfers = transferService.getTransfers(bFilter);

    if (transfers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding:24px;">No transfers found.</td></tr>`;
      return;
    }

    tbody.innerHTML = transfers.map(t => {
      let actionBtns = '';

      if (t.status === 'Pending Approval') {
        actionBtns = `
          <button class="btn btn-primary btn-sm trf-approve-btn" data-id="${t.id}">Approve</button>
        `;
      } else if (t.status === 'Approved') {
        actionBtns = `
          <button class="btn btn-teal btn-sm trf-dispatch-btn" data-id="${t.id}">Dispatch (In-Transit)</button>
        `;
      } else if (t.status === 'In Transit') {
        actionBtns = `
          <button class="btn btn-success btn-sm trf-receive-btn" data-id="${t.id}">Confirm Receiving</button>
        `;
      } else {
        actionBtns = `<span class="badge badge-success">Completed</span>`;
      }

      const itemsSummary = t.items.map(i => `${i.requestedQty}x ${i.name}`).join(', ');

      return `
        <tr>
          <td><strong>${t.transferNumber}</strong></td>
          <td><span class="badge badge-secondary">${t.sourceBranch}</span></td>
          <td><span class="badge badge-secondary">${t.destinationBranch}</span></td>
          <td>${itemsSummary}</td>
          <td style="font-size:12px; max-width:220px;">${t.reason}</td>
          <td><span class="text-muted">${t.requestedBy}</span></td>
          <td>
            <span class="badge badge-${t.status === 'Completed' ? 'success' : t.status === 'In Transit' ? 'info' : t.status === 'Approved' ? 'teal' : 'warning'}">
              ${t.status}
            </span>
          </td>
          <td>${actionBtns}</td>
        </tr>
      `;
    }).join('');

    // Attach workflow buttons
    tbody.querySelectorAll('.trf-approve-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        transferService.approveTransfer(e.currentTarget.dataset.id, authService.getCurrentUser().name);
        toast.success('Transfer approved!');
        this.renderTransfersTable();
      });
    });

    tbody.querySelectorAll('.trf-dispatch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        transferService.dispatchTransfer(e.currentTarget.dataset.id, authService.getCurrentUser().name);
        toast.success('Goods marked dispatched and deducted from source branch!');
        this.renderTransfersTable();
      });
    });

    tbody.querySelectorAll('.trf-receive-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const trf = transfers.find(t => t.id === id);
        if (trf) {
          transferService.receiveTransfer(id, trf.items.map(i => ({ sku: i.sku, receivedQty: i.dispatchedQty, damagedQty: 0 })));
          toast.success('Transfer received! Destination branch on-hand stock increased.');
          this.renderTransfersTable();
        }
      });
    });
  }

  openCreateTransferModal(prefillSku = '', prefillSource = 'B002', prefillDest = 'B003', prefillQty = 8) {
    const products = stateManager.get('products') || [];
    const branches = stateManager.get('branches') || [];

    const content = `
      <div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div class="form-group">
            <label class="form-label">Source Branch (Stock Origin)</label>
            <select id="trf-src" class="form-select">
              ${branches.map(b => `<option value="${b.id}" ${b.id === prefillSource ? 'selected' : ''}>${b.name} (${b.id})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Destination Branch (Receiving)</label>
            <select id="trf-dst" class="form-select">
              ${branches.map(b => `<option value="${b.id}" ${b.id === prefillDest ? 'selected' : ''}>${b.name} (${b.id})</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Product to Transfer</label>
          <select id="trf-prod" class="form-select">
            ${products.map(p => `<option value="${p.sku}" ${p.sku === prefillSku ? 'selected' : ''}>${p.name} (${p.sku})</option>`).join('')}
          </select>
          <div class="form-hint" id="trf-source-avail-hint">Checking source stock...</div>
        </div>

        <div class="form-group">
          <label class="form-label">Transfer Quantity</label>
          <input type="number" id="trf-qty" class="form-input" value="${prefillQty}" min="1" required />
        </div>

        <div class="form-group">
          <label class="form-label">Transfer Reason</label>
          <textarea id="trf-reason" class="form-textarea" rows="2" placeholder="e.g. Stock shortage at destination; surplus available at source.">Stock replenishment to meet anticipated weekend demand.</textarea>
        </div>
      </div>
    `;

    modal.open({
      title: 'Create Stock Transfer Request',
      content,
      footer: `
        <button class="btn btn-secondary" onclick="modal.close()">Cancel</button>
        <button class="btn btn-primary" id="submit-trf-btn">Submit Transfer Request</button>
      `
    });

    const updateStockHint = () => {
      const src = document.getElementById('trf-src').value;
      const sku = document.getElementById('trf-prod').value;
      const avail = inventoryService.getAvailableStock(sku, src);
      document.getElementById('trf-source-avail-hint').textContent = `Available stock at source: ${avail} units.`;
    };

    document.getElementById('trf-src').addEventListener('change', updateStockHint);
    document.getElementById('trf-prod').addEventListener('change', updateStockHint);
    updateStockHint();

    document.getElementById('submit-trf-btn').addEventListener('click', () => {
      const src = document.getElementById('trf-src').value;
      const dst = document.getElementById('trf-dst').value;
      const sku = document.getElementById('trf-prod').value;
      const qty = parseInt(document.getElementById('trf-qty').value);
      const reason = document.getElementById('trf-reason').value.trim();

      const prod = products.find(p => p.sku === sku);

      try {
        transferService.createTransfer({
          sourceBranch: src,
          destinationBranch: dst,
          items: [{ sku, name: prod ? prod.name : sku, requestedQty: qty }],
          reason,
          requestedBy: authService.getCurrentUser() ? authService.getCurrentUser().name : 'Manager'
        });

        modal.close();
        toast.success('Stock transfer request submitted!');
        this.renderTransfersTable();
      } catch (err) {
        toast.error(err.message);
      }
    });
  }

  // =========================================================================
  // 7. PURCHASING & SUPPLIERS MODULE
  // =========================================================================
  renderPurchasingModule(container) {
    container.innerHTML = `
      <div class="action-filter-bar">
        <div>
          <h3 class="card-title">Procurement & Purchase Orders</h3>
          <span class="card-subtitle">Crucial Rule: PO creation does NOT increase inventory. Only confirmed goods receiving increases stock.</span>
        </div>
        <button class="btn btn-primary" id="btn-create-po">
          ${Icons.get('truck', '', 14)} Create Purchase Order
        </button>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>PO #</th>
              <th>Supplier</th>
              <th>Destination</th>
              <th>Expected Date</th>
              <th>Items & Qty</th>
              <th>Total Cost</th>
              <th>Status</th>
              <th>Workflow Action</th>
            </tr>
          </thead>
          <tbody id="po-table-tbody">
            <!-- Dynamically populated -->
          </tbody>
        </table>
      </div>
    `;

    this.renderPurchaseOrdersTable();

    document.getElementById('btn-create-po').addEventListener('click', () => {
      this.openCreatePOModal();
    });
  }

  renderPurchaseOrdersTable() {
    const tbody = document.getElementById('po-table-tbody');
    if (!tbody) return;

    const pos = purchaseService.getPurchaseOrders();

    tbody.innerHTML = pos.map(p => {
      let actionBtn = '';

      if (p.status === 'Pending Approval') {
        actionBtn = `<button class="btn btn-primary btn-sm po-approve-btn" data-id="${p.id}">Approve PO</button>`;
      } else if (p.status === 'Approved') {
        actionBtn = `<button class="btn btn-success btn-sm po-receive-btn" data-id="${p.id}">Receive Goods</button>`;
      } else {
        actionBtn = `<span class="badge badge-success">Received & Verified</span>`;
      }

      const itemsSummary = p.items.map(i => `${i.quantity}x ${i.name}`).join(', ');

      return `
        <tr>
          <td><strong>${p.poNumber}</strong></td>
          <td>${p.supplier}</td>
          <td><span class="badge badge-secondary">${p.destinationBranch}</span></td>
          <td>${p.expectedDate}</td>
          <td style="font-size:12px; max-width:260px;">${itemsSummary}</td>
          <td><strong>$${p.totalAmount.toFixed(2)}</strong></td>
          <td>
            <span class="badge badge-${p.status === 'Received' ? 'success' : p.status === 'Approved' ? 'teal' : 'warning'}">
              ${p.status}
            </span>
          </td>
          <td>${actionBtn}</td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.po-approve-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        purchaseService.approvePurchaseOrder(e.currentTarget.dataset.id, authService.getCurrentUser().name);
        toast.success('PO Approved!');
        this.renderPurchaseOrdersTable();
      });
    });

    tbody.querySelectorAll('.po-receive-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.openPOReceivingModal(e.currentTarget.dataset.id);
      });
    });
  }

  openCreatePOModal() {
    const products = stateManager.get('products') || [];

    const content = `
      <div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div class="form-group">
            <label class="form-label">Supplier Name</label>
            <input type="text" id="po-supplier" class="form-input" value="Tech Distribution Co., Ltd." required />
          </div>
          <div class="form-group">
            <label class="form-label">Destination Facility</label>
            <select id="po-dest" class="form-select">
              <option value="WH001">Central Warehouse (WH001)</option>
              <option value="B001">Phnom Penh Central (B001)</option>
              <option value="B002">Toul Kork (B002)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Product to Order</label>
          <select id="po-sku" class="form-select">
            ${products.map(p => `<option value="${p.sku}" data-cost="${p.costPrice}">${p.name} ($${p.costPrice.toFixed(2)} cost)</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Order Quantity</label>
          <input type="number" id="po-qty" class="form-input" value="40" min="5" required />
        </div>

        <div class="sim-alert">
          <strong>Important</strong>: Submitting will place the PO into <em>Pending Approval</em>. Warehouse stock will NOT increase until goods are physically inspected and accepted.
        </div>
      </div>
    `;

    modal.open({
      title: 'Create Supplier Purchase Order',
      content,
      footer: `
        <button class="btn btn-secondary" onclick="modal.close()">Cancel</button>
        <button class="btn btn-primary" id="submit-po-btn">Submit Purchase Order</button>
      `
    });

    document.getElementById('submit-po-btn').addEventListener('click', () => {
      const supplier = document.getElementById('po-supplier').value.trim();
      const dest = document.getElementById('po-dest').value;
      const skuSelect = document.getElementById('po-sku');
      const sku = skuSelect.value;
      const prod = products.find(p => p.sku === sku);
      const qty = parseInt(document.getElementById('po-qty').value);

      purchaseService.createPurchaseOrder({
        supplier,
        destinationBranch: dest,
        items: [{ sku, name: prod ? prod.name : sku, unitCost: prod ? prod.costPrice : 10.00, quantity: qty }],
        createdBy: authService.getCurrentUser() ? authService.getCurrentUser().name : 'Procurement Staff'
      });

      modal.close();
      toast.success('Purchase order created! Awaiting Head Office approval.');
      this.renderPurchaseOrdersTable();
    });
  }

  openPOReceivingModal(poId) {
    const pos = purchaseService.getPurchaseOrders();
    const po = pos.find(p => p.id === poId);
    if (!po) return;

    const itemsRows = po.items.map(item => `
      <div style="border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:12px; background:#f8fafc;">
        <div style="font-weight:700; font-size:13px; margin-bottom:6px;">${item.name} (${item.sku})</div>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
          <div>
            <label class="form-label">Expected Qty</label>
            <input type="text" class="form-input" value="${item.quantity}" disabled />
          </div>
          <div>
            <label class="form-label" style="color:#059669;">Accepted (Good Stock)</label>
            <input type="number" class="form-input po-accepted-qty" data-sku="${item.sku}" value="${item.quantity}" min="0" max="${item.quantity}" />
          </div>
          <div>
            <label class="form-label" style="color:#dc2626;">Damaged / Broken</label>
            <input type="number" class="form-input po-damaged-qty" data-sku="${item.sku}" value="0" min="0" />
          </div>
        </div>
      </div>
    `).join('');

    const content = `
      <div>
        <p style="font-size:13px; color:#475569; margin-bottom:14px;">
          Record physical goods receiving for <strong>${po.poNumber}</strong> at <strong>${po.destinationBranch}</strong>. Only accepted items will enter active available inventory.
        </p>
        ${itemsRows}
      </div>
    `;

    modal.open({
      title: `Goods Receiving & Quality Inspection: ${po.poNumber}`,
      content,
      footer: `
        <button class="btn btn-secondary" onclick="modal.close()">Cancel</button>
        <button class="btn btn-primary" id="confirm-po-rec-btn">Confirm Goods Receiving</button>
      `,
      size: 'lg'
    });

    document.getElementById('confirm-po-rec-btn').addEventListener('click', () => {
      const receivedData = [];
      document.querySelectorAll('.po-accepted-qty').forEach(input => {
        const sku = input.dataset.sku;
        const accepted = parseInt(input.value) || 0;
        const damagedInput = document.querySelector(`.po-damaged-qty[data-sku="${sku}"]`);
        const damaged = damagedInput ? (parseInt(damagedInput.value) || 0) : 0;
        receivedData.push({ sku, receivedQty: accepted, damagedQty: damaged });
      });

      purchaseService.receivePurchaseOrder(
        po.id,
        receivedData,
        authService.getCurrentUser() ? authService.getCurrentUser().name : 'Inventory Staff'
      );

      modal.close();
      toast.success(`Inventory successfully received for ${po.poNumber}! On-hand stock increased.`);
      this.renderPurchaseOrdersTable();
    });
  }

  // =========================================================================
  // 8. ONLINE ORDERS & FULFILLMENT MODULE
  // =========================================================================
  renderOrdersModule(container) {
    container.innerHTML = `
      <div class="action-filter-bar">
        <div class="filter-group">
          <input type="text" id="order-filter-search" class="form-input" placeholder="Search order # or customer..." style="width:260px;" />
          <select id="order-filter-status" class="form-select" style="width:180px;">
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Picking">Picking</option>
            <option value="Ready for Pickup">Ready for Pickup</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <button class="btn btn-secondary" onclick="reportService.exportCSV('orders')">
          ${Icons.get('download', '', 14)} Export CSV
        </button>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Channel</th>
              <th>Customer</th>
              <th>Method</th>
              <th>Branch</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Fulfillment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="orders-table-tbody">
            <!-- Dynamically populated -->
          </tbody>
        </table>
      </div>
    `;

    this.renderOrdersTable();

    document.getElementById('order-filter-status').addEventListener('change', (e) => {
      this.renderOrdersTable(e.target.value);
    });
  }

  renderOrdersTable(statusFilter = 'All') {
    const tbody = document.getElementById('orders-table-tbody');
    if (!tbody) return;

    const bFilter = this.selectedBranchFilter === 'All' ? null : this.selectedBranchFilter;
    const orders = stateManager.get('orders') || [];

    const filtered = orders.filter(o => {
      if (bFilter && o.assignedBranch !== bFilter) return false;
      if (statusFilter !== 'All' && o.status !== statusFilter) return false;
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted" style="padding:24px;">No orders found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(o => `
      <tr>
        <td><strong>${o.orderNumber}</strong></td>
        <td><span class="badge ${o.channel === 'POS' ? 'badge-secondary' : 'badge-primary'}">${o.channel}</span></td>
        <td>${o.customerName}</td>
        <td>${o.fulfillmentMethod}</td>
        <td><span class="badge badge-secondary">${o.assignedBranch}</span></td>
        <td><strong>$${o.total.toFixed(2)}</strong></td>
        <td><span class="badge badge-success">${o.paymentStatus}</span></td>
        <td>
          <span class="badge badge-${o.status === 'Completed' ? 'success' : o.status === 'Cancelled' ? 'danger' : 'info'}">
            ${o.status}
          </span>
        </td>
        <td>
          <button class="btn btn-outline btn-sm view-order-btn" data-id="${o.id}">
            View Details
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.view-order-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.openOrderDetailsModal(e.currentTarget.dataset.id);
      });
    });
  }

  openOrderDetailsModal(orderId) {
    const orders = stateManager.get('orders') || [];
    const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return;

    const itemsHtml = order.items.map(i => `
      <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #f1f5f9; font-size:12px;">
        <span>${i.quantity}x <strong>${i.name}</strong> (${i.sku})</span>
        <span>$${(i.price * i.quantity).toFixed(2)}</span>
      </div>
    `).join('');

    const timelineHtml = (order.timeline || []).map(t => `
      <div style="display:flex; gap:12px; margin-bottom:8px; font-size:12px;">
        <span style="font-weight:700; color:#2563eb; width:80px;">${t.time}</span>
        <div><strong>${t.status}</strong>: <span style="color:#64748b;">${t.note}</span></div>
      </div>
    `).join('');

    const content = `
      <div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; background:#f8fafc; padding:12px; border-radius:8px; font-size:12px;">
          <div>
            <div><strong>Customer:</strong> ${order.customerName} (${order.phone})</div>
            <div><strong>Fulfillment:</strong> ${order.fulfillmentMethod}</div>
            <div><strong>Destination:</strong> ${order.deliveryAddress || 'Branch Pick-up'}</div>
          </div>
          <div>
            <div><strong>Assigned Branch:</strong> ${order.assignedBranch}</div>
            <div><strong>Payment:</strong> ${order.paymentMethod} (${order.paymentStatus})</div>
            <div><strong>Status:</strong> <span class="badge badge-primary">${order.status}</span></div>
          </div>
        </div>

        <h4 style="font-size:13px; font-weight:700; margin-bottom:8px;">Ordered Items</h4>
        <div style="margin-bottom:16px;">
          ${itemsHtml}
          <div style="text-align:right; font-weight:800; font-size:14px; margin-top:8px;">
            Total: $${order.total.toFixed(2)}
          </div>
        </div>

        <h4 style="font-size:13px; font-weight:700; margin-bottom:8px;">Audit Timeline</h4>
        <div style="background:#f1f5f9; padding:12px; border-radius:8px; max-height:140px; overflow-y:auto;">
          ${timelineHtml}
        </div>
      </div>
    `;

    let actionBtns = `<button class="btn btn-secondary" onclick="modal.close()">Close</button>`;

    if (order.status === 'Confirmed' || order.status === 'Processing') {
      actionBtns += `<button class="btn btn-primary" id="btn-status-picking">Start Picking</button>`;
    } else if (order.status === 'Picking') {
      if (order.fulfillmentMethod === 'Pickup') {
        actionBtns += `<button class="btn btn-success" id="btn-status-ready">Ready for Pickup</button>`;
      } else {
        actionBtns += `<button class="btn btn-teal" id="btn-status-dispatch">Dispatch Order</button>`;
      }
    } else if (order.status === 'Ready for Pickup' || order.status === 'Dispatched') {
      actionBtns += `<button class="btn btn-success" id="btn-status-complete">Complete Handover</button>`;
    }

    modal.open({
      title: `Order Details: ${order.orderNumber}`,
      content,
      footer: actionBtns,
      size: 'lg'
    });

    const staff = authService.getCurrentUser() ? authService.getCurrentUser().name : 'Staff';

    if (document.getElementById('btn-status-picking')) {
      document.getElementById('btn-status-picking').addEventListener('click', () => {
        orderService.updateOrderStatus(order.id, 'Picking', 'Staff started item retrieval', staff);
        modal.close();
        toast.info('Order status set to Picking.');
        this.renderOrdersTable();
      });
    }

    if (document.getElementById('btn-status-ready')) {
      document.getElementById('btn-status-ready').addEventListener('click', () => {
        orderService.updateOrderStatus(order.id, 'Ready for Pickup', 'Items packed in branch locker', staff);
        modal.close();
        toast.success('Customer notified: Order Ready for Pickup!');
        this.renderOrdersTable();
      });
    }

    if (document.getElementById('btn-status-dispatch')) {
      document.getElementById('btn-status-dispatch').addEventListener('click', () => {
        orderService.updateOrderStatus(order.id, 'Dispatched', 'Handed over to delivery courier', staff);
        modal.close();
        toast.success('Order dispatched! Inventory reservation fulfilled.');
        this.renderOrdersTable();
      });
    }

    if (document.getElementById('btn-status-complete')) {
      document.getElementById('btn-status-complete').addEventListener('click', () => {
        orderService.updateOrderStatus(order.id, 'Completed', 'Customer confirmed receipt', staff);
        modal.close();
        toast.success('Order completed!');
        this.renderOrdersTable();
      });
    }
  }

  // =========================================================================
  // 9. FULFILLMENT WORKSTATION MODULE
  // =========================================================================
  renderFulfillmentModule(container) {
    const orders = stateManager.get('orders') || [];
    const bFilter = this.selectedBranchFilter === 'All' ? null : this.selectedBranchFilter;

    const pendingOrders = orders.filter(o => {
      if (bFilter && o.assignedBranch !== bFilter) return false;
      return ['Confirmed', 'Processing', 'Picking', 'Ready for Pickup'].includes(o.status);
    });

    container.innerHTML = `
      <div class="action-filter-bar">
        <div>
          <h3 class="card-title">Order Fulfillment Workstation</h3>
          <span class="card-subtitle">Fast checklist for warehouse & branch pickers</span>
        </div>
      </div>

      ${pendingOrders.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">${Icons.get('check', '', 48)}</div>
          <h3 class="font-semibold text-lg">No pending orders to fulfill</h3>
          <p class="text-sm text-muted">All online customer orders have been dispatched or completed.</p>
        </div>
      ` : `
        <div class="grid grid-cols-2 gap-4">
          ${pendingOrders.map(o => `
            <div class="card">
              <div class="card-header">
                <div>
                  <h4 class="card-title">${o.orderNumber}</h4>
                  <span class="card-subtitle">${o.customerName} &bull; ${o.fulfillmentMethod} (${o.assignedBranch})</span>
                </div>
                <span class="badge badge-primary">${o.status}</span>
              </div>
              <div class="card-body">
                <div style="font-size:12px; font-weight:700; color:#334155; margin-bottom:8px;">Picking Checklist:</div>
                ${o.items.map(item => `
                  <div style="display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid #f1f5f9; font-size:12px;">
                    <input type="checkbox" checked style="width:16px; height:16px;" />
                    <span style="flex:1;">${item.quantity}x <strong>${item.name}</strong> (${item.sku})</span>
                    <span class="badge badge-secondary">Bin A-${Math.floor(Math.random() * 8 + 1)}</span>
                  </div>
                `).join('')}
              </div>
              <div class="card-footer">
                <button class="btn btn-outline btn-sm" onclick="adminApp.openOrderDetailsModal('${o.id}')">
                  Full Order Details
                </button>
                <button class="btn btn-primary btn-sm" onclick="orderService.updateOrderStatus('${o.id}', '${o.fulfillmentMethod === 'Pickup' ? 'Ready for Pickup' : 'Dispatched'}'); toast.success('Order processed!'); adminApp.renderModule('fulfillment');">
                  Mark ${o.fulfillmentMethod === 'Pickup' ? 'Ready for Pickup' : 'Dispatched'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;
  }

  // =========================================================================
  // 10. RETURNS, REFUNDS & WARRANTY MODULE
  // =========================================================================
  renderReturnsModule(container) {
    const returns = stateManager.get('returns') || [];

    container.innerHTML = `
      <div class="action-filter-bar">
        <div>
          <h3 class="card-title">Returns, Refunds & Warranty RMA</h3>
          <span class="card-subtitle">Critical Rule: Returned products must first be inspected. Only sellable items return to active stock; damaged goods are isolated.</span>
        </div>
        <button class="btn btn-primary" id="btn-create-return">
          ${Icons.get('rotate-ccw', '', 14)} New Return / RMA Case
        </button>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Case #</th>
              <th>Order #</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Reason</th>
              <th>Condition</th>
              <th>Inspection Result</th>
              <th>Refund</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${returns.map(r => `
              <tr>
                <td><strong>${r.caseNumber}</strong></td>
                <td>${r.orderNumber}</td>
                <td>${r.customerName}</td>
                <td>${r.productName}</td>
                <td style="font-size:12px;">${r.reason}</td>
                <td><span class="badge badge-warning">${r.condition}</span></td>
                <td style="font-size:12px;">${r.inspectionResult}</td>
                <td><strong>$${r.refundAmount.toFixed(2)}</strong></td>
                <td><span class="badge badge-${r.status.includes('Approved') ? 'success' : 'warning'}">${r.status}</span></td>
                <td>
                  ${r.status === 'Pending Review' ? `
                    <button class="btn btn-outline btn-sm resolve-rma-btn" data-id="${r.id}">Inspect & Resolve</button>
                  ` : `
                    <span class="badge badge-secondary">${r.restockDecision || 'Resolved'}</span>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('btn-create-return').addEventListener('click', () => {
      this.openCreateReturnModal();
    });

    document.querySelectorAll('.resolve-rma-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.openResolveReturnModal(e.currentTarget.dataset.id);
      });
    });
  }

  openCreateReturnModal() {
    const products = stateManager.get('products') || [];
    const orders = stateManager.get('orders') || [];

    const content = `
      <div>
        <div class="form-group">
          <label class="form-label">Associated Order #</label>
          <select id="rma-order" class="form-select">
            ${orders.slice(0, 8).map(o => `<option value="${o.orderNumber}">${o.orderNumber} – ${o.customerName} ($${o.total.toFixed(2)})</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Returned Product</label>
          <select id="rma-sku" class="form-select">
            ${products.map(p => `<option value="${p.sku}">${p.name} ($${p.sellingPrice.toFixed(2)})</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Return Reason</label>
          <select id="rma-reason" class="form-select">
            <option value="Defective or does not charge">Defective or does not charge</option>
            <option value="Ordered incorrect cable connector type">Ordered incorrect cable connector type</option>
            <option value="Physical damage out of box">Physical damage out of box</option>
            <option value="Customer changed mind">Customer changed mind</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Physical Item Condition</label>
          <select id="rma-condition" class="form-select">
            <option value="Opened / Defective">Opened / Defective</option>
            <option value="Brand New Unopened in Box">Brand New Unopened in Box</option>
            <option value="Cracked / Broken">Cracked / Broken</option>
          </select>
        </div>
      </div>
    `;

    modal.open({
      title: 'Initiate Customer Return / Warranty Claim',
      content,
      footer: `
        <button class="btn btn-secondary" onclick="modal.close()">Cancel</button>
        <button class="btn btn-primary" id="submit-rma-btn">Open Case</button>
      `
    });

    document.getElementById('submit-rma-btn').addEventListener('click', () => {
      const orderNum = document.getElementById('rma-order').value;
      const sku = document.getElementById('rma-sku').value;
      const reason = document.getElementById('rma-reason').value;
      const cond = document.getElementById('rma-condition').value;

      const order = orders.find(o => o.orderNumber === orderNum);

      returnService.createReturnRequest({
        orderNumber: orderNum,
        customerId: order ? order.customerId : 'C001',
        customerName: order ? order.customerName : 'Customer',
        sku,
        quantity: 1,
        reason,
        condition: cond,
        branchId: order ? order.assignedBranch : 'B001'
      });

      modal.close();
      toast.success('Return case opened!');
      this.renderReturnsModule(document.getElementById('admin-content-area'));
    });
  }

  openResolveReturnModal(caseId) {
    const returns = stateManager.get('returns') || [];
    const rCase = returns.find(r => r.id === caseId);
    if (!rCase) return;

    const content = `
      <div>
        <div style="background:#f8fafc; padding:12px; border-radius:8px; margin-bottom:16px; font-size:12px;">
          <div><strong>Case #:</strong> ${rCase.caseNumber} &bull; <strong>Order:</strong> ${rCase.orderNumber}</div>
          <div><strong>Customer:</strong> ${rCase.customerName}</div>
          <div><strong>Product:</strong> ${rCase.productName} (${rCase.sku})</div>
          <div><strong>Reported Reason:</strong> ${rCase.reason}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Inspection Assessment</label>
          <select id="res-inspection" class="form-select">
            <option value="Passed inspection (unopened, pristine condition)">Passed inspection (unopened, pristine condition)</option>
            <option value="Confirmed internal hardware fault (pins loose)">Confirmed internal hardware fault (pins loose)</option>
            <option value="Customer damaged (misuse / water exposure)">Customer damaged (misuse / water exposure)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Restock Decision</label>
          <select id="res-restock" class="form-select">
            <option value="Restock Sellable">Restock to Sellable Inventory (+1 available stock)</option>
            <option value="Write-off Damaged">Write-off to Damaged Inventory (+1 damaged stock)</option>
            <option value="No Action">No Inventory Change</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Approval & Refund</label>
          <select id="res-approval" class="form-select">
            <option value="true">Approve & Issue Simulated Refund ($${rCase.refundAmount.toFixed(2)})</option>
            <option value="false">Reject Return Claim</option>
          </select>
        </div>
      </div>
    `;

    modal.open({
      title: `Inspect & Resolve RMA: ${rCase.caseNumber}`,
      content,
      footer: `
        <button class="btn btn-secondary" onclick="modal.close()">Cancel</button>
        <button class="btn btn-primary" id="confirm-rma-res-btn">Submit Decision</button>
      `
    });

    document.getElementById('confirm-rma-res-btn').addEventListener('click', () => {
      const approved = document.getElementById('res-approval').value === 'true';
      const inspection = document.getElementById('res-inspection').value;
      const restock = document.getElementById('res-restock').value;

      returnService.resolveReturn({
        caseId: rCase.id,
        approved,
        inspectionResult: inspection,
        restockDecision: restock,
        refundProcessed: approved,
        staffName: authService.getCurrentUser() ? authService.getCurrentUser().name : 'Customer Service'
      });

      modal.close();
      toast.success('RMA case resolved and inventory adjusted accordingly!');
      this.renderReturnsModule(document.getElementById('admin-content-area'));
    });
  }

  // =========================================================================
  // 11. CUSTOMER CRM MODULE
  // =========================================================================
  renderCustomersModule(container) {
    const customers = stateManager.get('customers') || [];

    container.innerHTML = `
      <div class="action-filter-bar">
        <div>
          <h3 class="card-title">Customer Relationship Directory (CRM)</h3>
          <span class="card-subtitle">${customers.length} registered customers in Phnom Penh & Siem Reap</span>
        </div>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Cambodian Address</th>
              <th>Total Spending</th>
              <th>Orders</th>
              <th>Tier</th>
            </tr>
          </thead>
          <tbody>
            ${customers.map(c => `
              <tr>
                <td><strong>${c.id}</strong></td>
                <td><strong>${c.name}</strong></td>
                <td>${c.email}</td>
                <td>${c.phone}</td>
                <td style="font-size:12px; max-width:240px;">${c.address}</td>
                <td><strong>$${(c.totalSpent || 0).toFixed(2)}</strong></td>
                <td>${c.ordersCount || 0}</td>
                <td><span class="badge ${c.status === 'VIP' ? 'badge-teal' : 'badge-secondary'}">${c.status || 'Regular'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // =========================================================================
  // 12. PROMOTIONS & DISCOUNTS MODULE
  // =========================================================================
  renderPromotionsModule(container) {
    const promotions = stateManager.get('promotions') || [];

    container.innerHTML = `
      <div class="action-filter-bar">
        <div>
          <h3 class="card-title">Promotions & Discount Codes</h3>
          <span class="card-subtitle">Active coupons applied consistently across POS and Online checkout</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        ${promotions.map(p => `
          <div class="card">
            <div class="card-header">
              <div>
                <h4 class="card-title" style="letter-spacing:0.04em;">${p.code}</h4>
                <span class="card-subtitle">${p.name}</span>
              </div>
              <span class="badge badge-success">${p.status}</span>
            </div>
            <div class="card-body" style="font-size:13px;">
              <div><strong>Discount:</strong> ${p.type === 'percentage' ? `${p.value}% Off` : `$${p.value} Off`}</div>
              <div><strong>Min Purchase:</strong> $${p.minPurchase.toFixed(2)} &bull; <strong>Max Discount:</strong> $${p.maxDiscount.toFixed(2)}</div>
              <div><strong>Validity:</strong> ${p.startDate} to ${p.endDate}</div>
              <div style="margin-top:8px;"><strong>Usage count:</strong> ${p.usageCount} times</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // =========================================================================
  // 13. EMPLOYEES & ROLES MODULE
  // =========================================================================
  renderEmployeesModule(container) {
    const users = stateManager.get('users') || [];

    container.innerHTML = `
      <div class="action-filter-bar">
        <div>
          <h3 class="card-title">Staff & Role Access Control</h3>
          <span class="card-subtitle">10 distinct system roles with scoped branch permissions</span>
        </div>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Assigned Role</th>
              <th>Branch Scope</th>
              <th>Contact Email</th>
              <th>Role Description & Permissions</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td><strong>${u.name}</strong></td>
                <td><span class="badge badge-primary">${u.role}</span></td>
                <td><span class="badge badge-secondary">${u.branch}</span></td>
                <td>${u.email}</td>
                <td style="font-size:12px; max-width:300px; color:#475569;">${u.description}</td>
                <td><span class="badge badge-success">${u.status}</span></td>
                <td>
                  <button class="btn btn-outline btn-sm switch-to-user-btn" data-id="${u.id}">
                    Switch to Role
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.querySelectorAll('.switch-to-user-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        authService.switchUserById(e.currentTarget.dataset.id, true);
      });
    });
  }

  // =========================================================================
  // 14. REPORTS MODULE
  // =========================================================================
  renderReportsModule(container) {
    const kpis = reportService.getKPISummary(this.selectedBranchFilter === 'All' ? null : this.selectedBranchFilter);
    const perf = reportService.getProductPerformance(this.selectedBranchFilter === 'All' ? null : this.selectedBranchFilter);

    container.innerHTML = `
      <div class="action-filter-bar">
        <div>
          <h3 class="card-title">Executive Financial & Operational Reports</h3>
          <span class="card-subtitle">Calculated dynamically from live simulated transactions</span>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-primary" onclick="reportService.exportCSV('orders')">
            ${Icons.get('download', '', 14)} Export Sales Report (CSV)
          </button>
          <button class="btn btn-secondary" onclick="reportService.exportCSV('inventory')">
            ${Icons.get('download', '', 14)} Export Stock Report (CSV)
          </button>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4" style="margin-bottom:24px;">
        <div class="card" style="padding:16px;">
          <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase;">Gross Revenue</div>
          <div style="font-size:1.75rem; font-weight:800; color:#0f172a; margin:4px 0;">$${kpis.revenue.toFixed(2)}</div>
          <div style="font-size:12px; color:#10b981;">Derived from POS receipts & online checkouts</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase;">Estimated Gross Profit</div>
          <div style="font-size:1.75rem; font-weight:800; color:#10b981; margin:4px 0;">$${kpis.grossProfit.toFixed(2)}</div>
          <div style="font-size:12px; color:#64748b;">${kpis.profitMargin}% Gross Margin after COGS</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase;">Total Volume</div>
          <div style="font-size:1.75rem; font-weight:800; color:#2563eb; margin:4px 0;">${kpis.totalOrders} Orders</div>
          <div style="font-size:12px; color:#64748b;">${kpis.pendingOrders} orders in active fulfillment</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
        <div class="card">
          <div class="card-header">
            <h4 class="card-title">Top-Selling Products</h4>
          </div>
          <div class="card-body" style="padding:0;">
            <table class="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Gross Sales</th>
                </tr>
              </thead>
              <tbody>
                ${perf.topSelling.map(p => `
                  <tr>
                    <td><strong>${p.sku}</strong></td>
                    <td>${p.name}</td>
                    <td><strong>${p.unitsSold}</strong></td>
                    <td>$${p.revenue.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h4 class="card-title">Slow-Moving Stock Alerts</h4>
          </div>
          <div class="card-body" style="padding:0;">
            <table class="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${perf.slowMoving.map(p => `
                  <tr>
                    <td><strong>${p.sku}</strong></td>
                    <td>${p.name}</td>
                    <td>${p.unitsSold} units</td>
                    <td><span class="badge badge-warning">Promote / Discount</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // PAYMENTS & BAKONG KHQR MODULE
  // =========================================================================
  renderPaymentsModule(container) {
    container.innerHTML = `
      <div class="action-filter-bar">
        <div>
          <h3 class="card-title">Payments & Bakong KHQR Gateway</h3>
          <span class="card-subtitle">Cambodia Digital Payment Processing & Branch Merchant Settings</span>
        </div>
      </div>

      <div class="module-tabs" id="payments-tabs">
        <div class="module-tab-btn active" data-tab="ledger">💳 Payment Transactions Ledger</div>
        <div class="module-tab-btn" data-tab="config">⚙️ Branch Merchant Configuration</div>
      </div>

      <!-- Tab 1: Ledger -->
      <div id="pane-payments-ledger">
        <div class="action-filter-bar" style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:16px;">
          <div class="filter-group">
            <input type="text" id="pay-filter-search" class="form-input" placeholder="Search by Ref # or Order #..." style="width:240px;" />
            <select id="pay-filter-method" class="form-select" style="width:170px;">
              <option value="All">All Methods</option>
              <option value="Bakong KHQR">Bakong KHQR</option>
              <option value="Cash">Cash</option>
              <option value="Card (Simulated)">Card (Simulated)</option>
            </select>
            <select id="pay-filter-status" class="form-select" style="width:150px;">
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Expired">Expired</option>
            </select>
            <select id="pay-filter-branch" class="form-select" style="width:170px;">
              <option value="All">All Branches</option>
              <option value="B001">B001 – Phnom Penh Central</option>
              <option value="B002">B002 – Toul Kork</option>
              <option value="B003">B003 – Sen Sok</option>
              <option value="B004">B004 – Siem Reap</option>
              <option value="WH001">WH001 – Central Warehouse</option>
            </select>
          </div>
        </div>

        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Order / Receipt #</th>
                <th>Customer</th>
                <th>Branch</th>
                <th>Method</th>
                <th>Amount (USD & KHR)</th>
                <th>Transaction Reference</th>
                <th>Status</th>
                <th>Paid Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="payments-table-tbody">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 2: Merchant Configuration -->
      <div id="pane-payments-config" class="hidden">
        <div class="card" style="max-width:780px;">
          <div class="card-header">
            <div>
              <h4 class="card-title">Branch Merchant Payment Profiles</h4>
              <span class="card-subtitle">Configure Bakong KHQR credentials, currency rules, and terminal parameters per branch</span>
            </div>
            <select id="cfg-branch-select" class="form-select" style="width:220px;">
              <option value="B001">B001 – Phnom Penh Central</option>
              <option value="B002">B002 – Toul Kork</option>
              <option value="B003">B003 – Sen Sok</option>
              <option value="B004">B004 – Siem Reap</option>
              <option value="WH001">WH001 – Central Warehouse</option>
            </select>
          </div>
          <div class="card-body" id="cfg-form-body">
            <!-- Form populated dynamically -->
          </div>
        </div>
      </div>
    `;

    this.renderPaymentsTable();
    this.renderMerchantConfigForm('B001');

    // Tab toggle
    const tabs = document.querySelectorAll('#payments-tabs .module-tab-btn');
    tabs.forEach(t => {
      t.addEventListener('click', (e) => {
        tabs.forEach(item => item.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const tab = e.currentTarget.dataset.tab;

        document.getElementById('pane-payments-ledger').classList.toggle('hidden', tab !== 'ledger');
        document.getElementById('pane-payments-config').classList.toggle('hidden', tab !== 'config');
      });
    });

    // Ledger filters
    const updateLedger = () => {
      const search = document.getElementById('pay-filter-search').value.trim();
      const method = document.getElementById('pay-filter-method').value;
      const status = document.getElementById('pay-filter-status').value;
      const branch = document.getElementById('pay-filter-branch').value;
      this.renderPaymentsTable({ search, method, status, branch });
    };

    document.getElementById('pay-filter-search').addEventListener('input', updateLedger);
    document.getElementById('pay-filter-method').addEventListener('change', updateLedger);
    document.getElementById('pay-filter-status').addEventListener('change', updateLedger);
    document.getElementById('pay-filter-branch').addEventListener('change', updateLedger);

    // Config branch change
    document.getElementById('cfg-branch-select').addEventListener('change', (e) => {
      this.renderMerchantConfigForm(e.target.value);
    });
  }

  renderPaymentsTable(filters = {}) {
    const tbody = document.getElementById('payments-table-tbody');
    if (!tbody) return;

    const payments = paymentService.getPayments(filters);

    if (payments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted" style="padding:24px;">No payment records found matching criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = payments.map(p => {
      let methodBadge = `<span class="badge badge-secondary">${p.paymentMethod}</span>`;
      if (p.paymentMethod.includes('KHQR')) {
        methodBadge = `<span class="badge" style="background:#ffe4e6; color:#9f1239; border:1px solid #fecdd3; font-weight:700;">🇰🇭 Bakong KHQR</span>`;
      } else if (p.paymentMethod.includes('Cash')) {
        methodBadge = `<span class="badge badge-success">💵 Cash</span>`;
      } else if (p.paymentMethod.includes('Card')) {
        methodBadge = `<span class="badge badge-info">💳 Card (Simulated)</span>`;
      }

      const statusBadge = `<span class="badge badge-${p.status === 'Paid' ? 'success' : p.status === 'Failed' ? 'danger' : p.status === 'Expired' ? 'warning' : 'primary'}">${p.status}</span>`;

      return `
        <tr>
          <td><strong>${p.paymentId || p.id}</strong></td>
          <td>${p.orderNumber}</td>
          <td>${p.customerName}</td>
          <td><span class="badge badge-secondary">${p.branchId}</span></td>
          <td>${methodBadge}</td>
          <td>
            <strong>$${(p.usdAmount || p.amount).toFixed(2)}</strong>
            <span class="text-muted" style="font-size:11px; margin-left:4px;">(${(p.khrAmount || Math.round(p.amount * 4100)).toLocaleString()} ៛)</span>
          </td>
          <td><code>${p.transactionRef}</code></td>
          <td>${statusBadge}</td>
          <td style="font-size:11px; color:#64748b;">${p.paidAt ? new Date(p.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}</td>
          <td>
            <button class="btn btn-outline btn-sm view-payment-btn" data-id="${p.id}">
              Details
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.view-payment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.openPaymentDetailsModal(e.currentTarget.dataset.id);
      });
    });
  }

  openPaymentDetailsModal(paymentId) {
    const p = paymentService.getPaymentById(paymentId);
    if (!p) return;

    const timelineHtml = (p.timeline || []).map(t => `
      <div style="display:flex; gap:12px; margin-bottom:8px; font-size:12px;">
        <span style="font-weight:700; color:#2563eb; width:70px;">${t.time}</span>
        <div><strong>${t.status}</strong>: <span style="color:#475569;">${t.note}</span></div>
      </div>
    `).join('');

    const content = `
      <div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div>
              <h3 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0;">${p.paymentId}</h3>
              <span style="font-size:11px; color:#64748b;">Transaction Reference: <code>${p.transactionRef}</code></span>
            </div>
            <span class="badge badge-${p.status === 'Paid' ? 'success' : 'warning'}" style="font-size:12px;">${p.status}</span>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:12px; border-top:1px solid #e2e8f0; padding-top:12px;">
            <div><strong>Associated Order:</strong> ${p.orderNumber}</div>
            <div><strong>Branch:</strong> ${p.branchName || p.branchId}</div>
            <div><strong>Customer:</strong> ${p.customerName}</div>
            <div><strong>Payment Method:</strong> ${p.paymentMethod}</div>
            <div><strong>Amount USD:</strong> $${(p.usdAmount || p.amount).toFixed(2)}</div>
            <div><strong>Amount KHR:</strong> ${(p.khrAmount || Math.round(p.amount * 4100)).toLocaleString()} ៛ (Rate: 4,100)</div>
          </div>
        </div>

        <h4 style="font-size:13px; font-weight:700; margin-bottom:8px;">Gateway & Verification Metadata</h4>
        <div style="background:#f1f5f9; padding:12px; border-radius:8px; font-size:12px; margin-bottom:16px;">
          <div><strong>Merchant:</strong> ${p.merchantName || 'SMARTRETAIL AI'} (${p.merchantCity || 'Phnom Penh'})</div>
          <div><strong>Bakong Account:</strong> <code>${p.bakongAccountId || 'smartretail@bakong'}</code></div>
          <div><strong>Terminal ID:</strong> <code>${p.verificationData ? p.verificationData.terminalId : 'POS-01'}</code></div>
          <div><strong>Verified By:</strong> ${p.verificationData && p.verificationData.verifiedBy ? p.verificationData.verifiedBy : 'Simulated Gateway Engine'}</div>
        </div>

        <h4 style="font-size:13px; font-weight:700; margin-bottom:8px;">Audit Trail Timeline</h4>
        <div style="background:#ffffff; border:1px solid #e2e8f0; padding:12px; border-radius:8px; max-height:140px; overflow-y:auto;">
          ${timelineHtml}
        </div>
      </div>
    `;

    modal.open({
      title: 'Payment Transaction Details',
      content,
      footer: `
        <button class="btn btn-secondary" onclick="modal.close()">Close</button>
      `,
      size: 'md'
    });
  }

  renderMerchantConfigForm(branchId) {
    const container = document.getElementById('cfg-form-body');
    if (!container) return;

    const config = paymentService.getBranchMerchantConfig(branchId);

    container.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
        <div class="form-group">
          <label class="form-label">Branch Identifier</label>
          <input type="text" class="form-input" value="${config.branchId} (${config.branchName})" disabled />
        </div>

        <div class="form-group">
          <label class="form-label">Merchant Display Name</label>
          <input type="text" id="cfg-merchant-name" class="form-input" value="${config.merchantName}" required />
        </div>

        <div class="form-group">
          <label class="form-label">Bakong Account ID (Mock)</label>
          <input type="text" id="cfg-bakong-acc" class="form-input" value="${config.bakongAccountId}" required />
        </div>

        <div class="form-group">
          <label class="form-label">Merchant City</label>
          <input type="text" id="cfg-city" class="form-input" value="${config.merchantCity}" required />
        </div>

        <div class="form-group">
          <label class="form-label">Default Currency</label>
          <select id="cfg-currency" class="form-select">
            <option value="USD" ${config.defaultCurrency === 'USD' ? 'selected' : ''}>USD ($)</option>
            <option value="KHR" ${config.defaultCurrency === 'KHR' ? 'selected' : ''}>KHR (៛)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">KHQR Expiration Window (Seconds)</label>
          <input type="number" id="cfg-expiry" class="form-input" value="${config.expirationSeconds || 180}" min="60" max="600" />
        </div>

        <div class="form-group">
          <label class="form-label">Terminal / POS Identifier</label>
          <input type="text" id="cfg-terminal" class="form-input" value="${config.terminalId}" />
        </div>

        <div class="form-group" style="display:flex; flex-direction:column; justify-content:center;">
          <label style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; cursor:pointer;">
            <input type="checkbox" id="cfg-khqr-enable" checked style="width:16px; height:16px;" />
            <span>Enable Bakong KHQR for this branch</span>
          </label>
        </div>
      </div>

      <div style="border-top:1px solid #e2e8f0; padding-top:16px; margin-top:16px; display:flex; justify-content:flex-end;">
        <button class="btn btn-primary" id="btn-save-merchant-cfg">
          Save Merchant Settings
        </button>
      </div>
    `;

    document.getElementById('btn-save-merchant-cfg').addEventListener('click', () => {
      const updated = {
        merchantName: document.getElementById('cfg-merchant-name').value.trim(),
        bakongAccountId: document.getElementById('cfg-bakong-acc').value.trim(),
        merchantCity: document.getElementById('cfg-city').value.trim(),
        defaultCurrency: document.getElementById('cfg-currency').value,
        expirationSeconds: parseInt(document.getElementById('cfg-expiry').value) || 180,
        terminalId: document.getElementById('cfg-terminal').value.trim(),
        khqrEnabled: document.getElementById('cfg-khqr-enable').checked
      };

      paymentService.updateMerchantSettings(branchId, updated);
      toast.success(`Merchant configuration updated for ${config.branchName}!`);
    });
  }

  // =========================================================================
  // 15. AI ASSISTANT DRAWER & LIVE INTERACTION
  // =========================================================================
  bindAIWidget() {
    const toggleBtn = document.getElementById('ai-assistant-toggle');
    const overlay = document.getElementById('ai-drawer-overlay');
    const drawer = document.getElementById('ai-drawer');
    const closeBtn = document.getElementById('ai-drawer-close');
    const sendBtn = document.getElementById('ai-send-btn');
    const input = document.getElementById('ai-user-input');
    const chatContainer = document.getElementById('ai-chat-messages');

    if (!toggleBtn || !drawer) return;

    const toggleAI = (open) => {
      if (open) {
        overlay.classList.add('active');
        drawer.classList.add('active');
      } else {
        overlay.classList.remove('active');
        drawer.classList.remove('active');
      }
    };

    toggleBtn.addEventListener('click', () => toggleAI(true));
    closeBtn.addEventListener('click', () => toggleAI(false));
    overlay.addEventListener('click', () => toggleAI(false));

    const postMessage = (userText) => {
      if (!userText.trim()) return;

      // User Bubble
      const userBubble = document.createElement('div');
      userBubble.className = 'ai-bubble ai-bubble-user';
      userBubble.textContent = userText;
      chatContainer.appendChild(userBubble);
      input.value = '';
      chatContainer.scrollTop = chatContainer.scrollHeight;

      // AI Response with thinking delay
      setTimeout(() => {
        const botReply = aiService.queryAssistant(userText);
        const botBubble = document.createElement('div');
        botBubble.className = 'ai-bubble ai-bubble-bot';

        // Render markdown-like bold text & buttons
        let html = botReply
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/\n/g, '<br/>');

        // If transfer recommendation, append 1-click action button
        if (userText.toLowerCase().includes('transfer')) {
          html += `
            <div style="margin-top:10px;">
              <button class="btn btn-primary btn-sm" id="ai-accept-transfer-btn">
                ${Icons.get('repeat', '', 14)} Create Recommended Draft Transfer
              </button>
            </div>
          `;
        }

        botBubble.innerHTML = html;
        chatContainer.appendChild(botBubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Attach 1-click accept transfer listener
        const acceptBtn = botBubble.querySelector('#ai-accept-transfer-btn');
        if (acceptBtn) {
          acceptBtn.addEventListener('click', () => {
            toggleAI(false);
            adminApp.openCreateTransferModal('LOG-M185', 'B002', 'B003', 10);
          });
        }
      }, 350);
    };

    sendBtn.addEventListener('click', () => postMessage(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') postMessage(input.value);
    });

    // Quick prompt chips
    document.querySelectorAll('.ai-prompt-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        postMessage(e.currentTarget.textContent.trim());
      });
    });
  }

  // =========================================================================
  // 16. NOTIFICATIONS PANEL
  // =========================================================================
  bindNotifications() {
    this.renderNotificationBadge();

    const notifBtn = document.getElementById('admin-notif-btn');
    if (!notifBtn) return;

    notifBtn.addEventListener('click', () => {
      const notifs = stateManager.get('notifications') || [];

      const content = `
        <div style="max-height:360px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
          ${notifs.length === 0 ? '<p class="text-sm text-muted">No notifications.</p>' : notifs.map(n => `
            <div style="padding:10px 14px; background:${n.unread ? '#eff6ff' : '#f8fafc'}; border:1px solid #e2e8f0; border-radius:8px; font-size:12px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                <strong style="color:#0f172a;">${n.title}</strong>
                <span class="text-muted" style="font-size:10px;">${new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p style="color:#475569; margin:0;">${n.message}</p>
            </div>
          `).join('')}
        </div>
      `;

      modal.open({
        title: 'System Notifications & Live Alerts',
        content,
        footer: `
          <button class="btn btn-secondary" onclick="modal.close()">Close</button>
          <button class="btn btn-primary" id="mark-notifs-read-btn">Mark All as Read</button>
        `,
        size: 'md'
      });

      document.getElementById('mark-notifs-read-btn').addEventListener('click', () => {
        notifs.forEach(n => n.unread = false);
        stateManager.set('notifications', notifs);
        this.renderNotificationBadge();
        modal.close();
        toast.info('Notifications marked as read.');
      });
    });
  }

  renderNotificationBadge() {
    const badge = document.getElementById('notif-badge-count');
    if (!badge) return;

    const notifs = stateManager.get('notifications') || [];
    const unread = notifs.filter(n => n.unread).length;

    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'flex' : 'none';
  }
}

// Global bootstrap for Admin App
let adminApp;
document.addEventListener('DOMContentLoaded', () => {
  adminApp = new AdminApp();
});

