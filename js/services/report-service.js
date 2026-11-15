/**
 * SmartRetail AI - Analytics & Reporting Engine
 * Calculates real-time financial, inventory, and branch performance metrics
 * Crucial rule: Never use static numbers. All values derive from live mock state.
 */

class ReportService {
  constructor() {
    this.state = stateManager;
    this.invService = inventoryService;
  }

  // Get high-level KPI cards metrics
  getKPISummary(branchId = null) {
    const orders = this.state.get('orders') || [];
    const returns = this.state.get('returns') || [];
    const products = this.state.get('products') || [];
    const pos = this.state.get('purchaseOrders') || [];
    const transfers = this.state.get('transfers') || [];

    // Filter orders by branch if requested
    const validOrders = orders.filter(o => {
      if (branchId && o.assignedBranch !== branchId) return false;
      return o.status !== 'Cancelled';
    });

    // 1. Total Gross Revenue
    let totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // 2. Subtract Approved Refunds
    const branchReturns = returns.filter(r => {
      if (branchId && r.branchId !== branchId) return false;
      return r.status.includes('Approved') || r.status.includes('Refunded');
    });
    const totalRefunds = branchReturns.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
    const netRevenue = Math.max(0, totalRevenue - totalRefunds);

    // 3. Estimated COGS (Cost of Goods Sold) and Gross Profit
    let totalCOGS = 0;
    validOrders.forEach(o => {
      o.items.forEach(item => {
        const prod = products.find(p => p.sku === item.sku);
        const unitCost = prod ? prod.costPrice : (item.price * 0.6);
        totalCOGS += unitCost * item.quantity;
      });
    });
    const grossProfit = Math.max(0, netRevenue - totalCOGS);
    const profitMargin = netRevenue > 0 ? ((grossProfit / netRevenue) * 100).toFixed(1) : '0.0';

    // 4. Counts
    const totalOrdersCount = validOrders.length;
    const pendingOrdersCount = orders.filter(o => {
      if (branchId && o.assignedBranch !== branchId) return false;
      return ['Confirmed', 'Processing', 'Picking', 'Ready for Pickup'].includes(o.status);
    }).length;

    // 5. Approvals pending
    let pendingApprovals = 0;
    if (!branchId) {
      pendingApprovals += pos.filter(p => p.status === 'Pending Approval').length;
      pendingApprovals += transfers.filter(t => t.status === 'Pending Approval').length;
      pendingApprovals += returns.filter(r => r.status === 'Pending Review').length;
    } else {
      pendingApprovals += transfers.filter(t => t.status === 'Pending Approval' && (t.sourceBranch === branchId || t.destinationBranch === branchId)).length;
    }

    // 6. Low stock items (unique product count for global view, branch count for branch view)
    const lowStockItems = this.invService.getLowStockItems(branchId);
    const lowStockCount = branchId ? lowStockItems.length : new Set(lowStockItems.map(i => i.sku)).size;

    // 7. Total Products & Customers
    const totalProducts = products.length;
    const totalCustomers = (this.state.get('customers') || []).length;

    return {
      revenue: parseFloat(netRevenue.toFixed(2)),
      grossProfit: parseFloat(grossProfit.toFixed(2)),
      profitMargin,
      totalOrders: totalOrdersCount,
      pendingOrders: pendingOrdersCount,
      pendingApprovals,
      lowStockCount,
      totalProducts,
      totalCustomers
    };
  }

  // Revenue aggregated by Branch
  getRevenueByBranch() {
    const orders = this.state.get('orders') || [];
    const branches = this.state.get('branches') || [];
    const branchMap = {};

    branches.forEach(b => {
      if (b.type === 'retail') {
        branchMap[b.id] = { name: b.name, revenue: 0, ordersCount: 0 };
      }
    });

    orders.forEach(o => {
      if (o.status !== 'Cancelled' && branchMap[o.assignedBranch]) {
        branchMap[o.assignedBranch].revenue += o.total;
        branchMap[o.assignedBranch].ordersCount += 1;
      }
    });

    return Object.values(branchMap);
  }

  // Sales aggregated by Product Category
  getSalesByCategory(branchId = null) {
    const orders = this.state.get('orders') || [];
    const products = this.state.get('products') || [];
    const categoryTotals = {};

    orders.forEach(o => {
      if (branchId && o.assignedBranch !== branchId) return;
      if (o.status === 'Cancelled') return;

      o.items.forEach(item => {
        const prod = products.find(p => p.sku === item.sku);
        const cat = prod ? prod.category : 'Accessories';
        if (!categoryTotals[cat]) categoryTotals[cat] = 0;
        categoryTotals[cat] += (item.price * item.quantity);
      });
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount: parseFloat(amount.toFixed(2))
    }));
  }

  // Top-selling and Slow-moving products
  getProductPerformance(branchId = null) {
    const orders = this.state.get('orders') || [];
    const products = this.state.get('products') || [];
    const salesMap = {};

    products.forEach(p => {
      salesMap[p.sku] = {
        sku: p.sku,
        name: p.name,
        category: p.category,
        price: p.sellingPrice,
        unitsSold: 0,
        revenue: 0
      };
    });

    orders.forEach(o => {
      if (branchId && o.assignedBranch !== branchId) return;
      if (o.status === 'Cancelled') return;

      o.items.forEach(item => {
        if (salesMap[item.sku]) {
          salesMap[item.sku].unitsSold += item.quantity;
          salesMap[item.sku].revenue += (item.price * item.quantity);
        }
      });
    });

    const list = Object.values(salesMap);
    list.sort((a, b) => b.unitsSold - a.unitsSold);

    const topSelling = list.filter(i => i.unitsSold > 0).slice(0, 5);
    const slowMoving = list.filter(i => i.unitsSold <= 1);

    return { topSelling, slowMoving };
  }

  // Client-side CSV generation and trigger download
  exportCSV(dataType = 'orders') {
    let rows = [];
    let filename = `SmartRetail_${dataType}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (dataType === 'orders') {
      const orders = this.state.get('orders') || [];
      rows.push(['Order Number', 'Channel', 'Customer', 'Branch', 'Total ($)', 'Payment Status', 'Fulfillment Status', 'Date']);
      orders.forEach(o => {
        rows.push([
          o.orderNumber,
          o.channel,
          `"${o.customerName}"`,
          o.assignedBranch,
          o.total.toFixed(2),
          o.paymentStatus,
          o.status,
          o.createdAt.slice(0, 10)
        ]);
      });
    } else if (dataType === 'inventory') {
      const products = this.state.get('products') || [];
      const branches = this.state.get('branches') || [];
      rows.push(['SKU', 'Product Name', 'Category', 'Branch', 'On Hand', 'Reserved', 'Available', 'Damaged', 'Cost Price ($)']);
      products.forEach(p => {
        branches.forEach(b => {
          const rec = this.invService.getStockRecord(p.sku, b.id);
          rows.push([
            p.sku,
            `"${p.name}"`,
            p.category,
            b.name,
            rec.onHand,
            rec.reserved,
            rec.available,
            rec.damaged,
            p.costPrice.toFixed(2)
          ]);
        });
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

const reportService = new ReportService();

