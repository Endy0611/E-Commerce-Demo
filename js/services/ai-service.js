/**
 * SmartRetail AI - Simulated Intelligence & Business Advisory Engine
 * Operates strictly on live mock application state, providing context-aware recommendations
 * Note: Clearly labeled as simulated AI. Never makes independent unapproved modifications.
 */

class AIService {
  constructor() {
    this.state = stateManager;
    this.invService = inventoryService;
    this.reportService = reportService;
  }

  // Conversational response engine matching user queries with current state
  queryAssistant(prompt) {
    const q = prompt.toLowerCase();
    const kpis = this.reportService.getKPISummary();
    const perf = this.reportService.getProductPerformance();
    const lowStock = this.invService.getLowStockItems();

    if (q.includes('best-selling') || q.includes('top selling') || q.includes('top product')) {
      if (perf.topSelling.length === 0) {
        return `Based on live transaction records, there are currently no recorded sales in this session.`;
      }
      const topItems = perf.topSelling.map((p, i) => `${i + 1}. **${p.name}** (${p.sku}) – ${p.unitsSold} units sold ($${p.revenue.toFixed(2)})`).join('\n');
      return `📊 **Best-Selling Products Analysis** (from live transactions):\n\n${topItems}\n\n*Recommendation:* Ensure central warehouse reorders remain ahead of holiday run-rate.`;
    }

    if (q.includes('lowest inventory') || q.includes('out of stock') || q.includes('reorder') || q.includes('low stock')) {
      if (lowStock.length === 0) {
        return `✅ **Inventory Health Normal**: All branches currently maintain stock levels above configured reorder thresholds.`;
      }
      const itemsList = lowStock.slice(0, 5).map(item => `• **${item.product.name}** (${item.sku}) at **${item.branchName}**: only **${item.available} units** remaining (reorder threshold: ${item.reorderLevel})`).join('\n');
      return `⚠️ **Critical Stock Shortages Detected**:\n\n${itemsList}\n\n*Suggested Action:* Initiate an internal branch transfer or issue a supplier PO to Central Warehouse.`;
    }

    if (q.includes('transfer') || q.includes('stock transfer')) {
      const recs = this.getTransferRecommendations();
      if (recs.length === 0) {
        return `All branch inventory levels are balanced across Phnom Penh and Siem Reap. No urgent transfers required.`;
      }
      const rec = recs[0];
      return `💡 **Smart Transfer Recommendation**:\n\nBranch **${rec.destinationBranchName}** has only **${rec.currentAvailable} units** of **${rec.productName}**.\nSurplus identified at **${rec.sourceBranchName}** (available: ${rec.sourceAvailable} units).\n\n**Recommended Action:** Transfer **${rec.suggestedQty} units** from ${rec.sourceBranchName} to ${rec.destinationBranchName}.\n\n*(You can accept this recommendation below to create a draft transfer request).*`;
    }

    if (q.includes('revenue') || q.includes('profit') || q.includes('sales')) {
      return `💰 **Financial Performance Snapshot**:\n\n• **Net Revenue:** $${kpis.revenue.toFixed(2)}\n• **Estimated Gross Profit:** $${kpis.grossProfit.toFixed(2)} (Margin: ${kpis.profitMargin}%)\n• **Total Orders Processed:** ${kpis.totalOrders}\n• **Pending Fulfillment:** ${kpis.pendingOrders} orders\n\n*Insight:* Revenue reflects all completed POS and confirmed online orders minus approved customer refunds.`;
    }

    if (q.includes('slow') || q.includes('slow-moving') || q.includes('dead stock')) {
      const slow = perf.slowMoving.slice(0, 4);
      if (slow.length === 0) {
        return `All products in catalog have recorded active movement.`;
      }
      const items = slow.map(p => `• **${p.name}** (${p.sku}) – ${p.unitsSold} sales`).join('\n');
      return `📉 **Slow-Moving Inventory Alert**:\n\n${items}\n\n*Recommendation:* Consider creating a promotional discount code (e.g. 10% off) to accelerate inventory turnover.`;
    }

    if (q.includes('operational') || q.includes('problem') || q.includes('bottleneck') || q.includes('status')) {
      return `🔍 **Operational Overview & Pending Tasks**:\n\n• **Pending Approvals:** ${kpis.pendingApprovals} (Transfers / POs / Returns awaiting manager sign-off)\n• **Pending Fulfillment:** ${kpis.pendingOrders} online orders requiring picking & packing\n• **Low Stock Alerts:** ${kpis.lowStockCount} items at or below reorder threshold\n\nAll tasks require human authorization per standard retail policy.`;
    }

    // Default intelligent overview
    return `🤖 **SmartRetail AI Business Advisor** (Simulated)\n\nI am continuously analyzing your multi-branch transactions and inventory levels.\n\n• Current Net Revenue: **$${kpis.revenue.toFixed(2)}**\n• Pending Approvals: **${kpis.pendingApprovals}**\n• Low Stock SKU Alerts: **${kpis.lowStockCount}**\n\nYou can ask me:\n• *"Which branch has the lowest inventory?"*\n• *"What are our best-selling products?"*\n• *"Which branches need stock transfers?"*\n• *"How much revenue did we make?"*\n• *"What are the current operational problems?"*`;
  }

  // Generate automated stock transfer suggestions
  getTransferRecommendations() {
    const lowStock = this.invService.getLowStockItems();
    const branches = this.state.get('branches') || [];
    const recommendations = [];

    lowStock.forEach(item => {
      // Find another retail branch with excess stock (> reorderLevel + 5)
      branches.forEach(b => {
        if (b.id === item.branchId || b.type === 'warehouse') return;
        const avail = this.invService.getAvailableStock(item.sku, b.id);
        if (avail > item.reorderLevel + 3) {
          const suggested = Math.min(avail - item.reorderLevel, 8);
          if (suggested > 0) {
            recommendations.push({
              id: `REC-${item.sku}-${b.id}-${item.branchId}`,
              sku: item.sku,
              productName: item.product.name,
              sourceBranch: b.id,
              sourceBranchName: b.name,
              sourceAvailable: avail,
              destinationBranch: item.branchId,
              destinationBranchName: item.branchName,
              currentAvailable: item.available,
              suggestedQty: suggested,
              reason: `${item.branchName} is low on stock (${item.available} left), while ${b.name} holds excess surplus (${avail} units).`
            });
          }
        }
      });
    });

    return recommendations;
  }

  // Simulated Demand Forecasting based on current velocity
  getDemandForecasts() {
    return [
      {
        sku: 'LOG-M185',
        productName: 'Logitech M185 Wireless Mouse',
        branch: 'Sen Sok (B003)',
        predictedDemand14Days: 18,
        currentAvailable: this.invService.getAvailableStock('LOG-M185', 'B003'),
        riskLevel: 'High',
        confidenceScore: '92%',
        recommendation: 'Replenish at least 15 units from Central Warehouse or Toul Kork branch.'
      },
      {
        sku: 'BAS-C1M',
        productName: 'Baseus USB-C Cable 1m',
        branch: 'Sen Sok (B003)',
        predictedDemand14Days: 24,
        currentAvailable: this.invService.getAvailableStock('BAS-C1M', 'B003'),
        riskLevel: 'Critical',
        confidenceScore: '95%',
        recommendation: 'Immediate stock transfer recommended. Current stock will deplete in approx 48 hours.'
      },
      {
        sku: 'ANK-20W',
        productName: 'Anker 20W USB-C Charger',
        branch: 'Phnom Penh Central (B001)',
        predictedDemand14Days: 35,
        currentAvailable: this.invService.getAvailableStock('ANK-20W', 'B001'),
        riskLevel: 'Moderate',
        confidenceScore: '88%',
        recommendation: 'Stock adequate for 7 days; schedule standard weekly replenishment.'
      }
    ];
  }

  // Simulated Anomaly Detection
  getAnomalies() {
    return [
      {
        id: 'ANO-001',
        type: 'Inventory Discrepancy',
        severity: 'Medium',
        title: 'Damaged Goods Ratio at PO Receiving',
        description: '2 units of iPhone 15 Clear Case (IP15-CASE) arrived damaged on PO-2026-013. Review supplier packaging standards.',
        timestamp: '2026-11-12'
      },
      {
        id: 'ANO-002',
        type: 'Customer RMA Pattern',
        severity: 'Low',
        title: 'Loose Cable Connector Reported',
        description: 'Case RET-2026-001 reported defective contact pins on Baseus USB-C Cable. Monitor for batch defect trends.',
        timestamp: '2026-11-15'
      }
    ];
  }
}

const aiService = new AIService();

