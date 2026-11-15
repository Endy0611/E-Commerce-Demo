/**
 * SmartRetail AI - Central Inventory Service
 * Manages multi-branch stock levels, reservations, adjustments, and audit trail
 * Core formula: Available = On Hand - Reserved - Damaged
 */

class InventoryService {
  constructor() {
    this.state = stateManager;
  }

  // Get stock details for a specific product at a specific branch
  getStockRecord(sku, branchId) {
    const inv = this.state.get('inventory');
    if (!inv[sku]) {
      inv[sku] = {};
    }
    if (!inv[sku][branchId]) {
      inv[sku][branchId] = { onHand: 0, reserved: 0, damaged: 0 };
    }
    const item = inv[sku][branchId];
    const available = Math.max(0, (item.onHand || 0) - (item.reserved || 0) - (item.damaged || 0));
    return {
      onHand: item.onHand || 0,
      reserved: item.reserved || 0,
      damaged: item.damaged || 0,
      available: available
    };
  }

  getAvailableStock(sku, branchId) {
    return this.getStockRecord(sku, branchId).available;
  }

  // Get total stock across all branches for a SKU
  getTotalAvailableStock(sku) {
    const inv = this.state.get('inventory');
    if (!inv[sku]) return 0;
    let total = 0;
    Object.keys(inv[sku]).forEach(bId => {
      total += this.getAvailableStock(sku, bId);
    });
    return total;
  }

  // Reserve stock for an online order (available stock drops, on-hand stays until fulfilled)
  reserveStock(sku, branchId, quantity, reference = '') {
    const record = this.getStockRecord(sku, branchId);
    if (record.available < quantity) {
      throw new Error(`Insufficient available stock for ${sku} at branch ${branchId}. Requested: ${quantity}, Available: ${record.available}`);
    }

    const inv = this.state.get('inventory');
    inv[sku][branchId].reserved = (inv[sku][branchId].reserved || 0) + quantity;
    this.state.set('inventory', inv);

    this.logMovement(
      sku, branchId, 'Reservation', -quantity,
      inv[sku][branchId].onHand, reference,
      `Reserved for order ${reference}`,
      'System Fulfillment'
    );
    return true;
  }

  // Release reservation if an order is cancelled or payment fails
  releaseReservation(sku, branchId, quantity, reference = '') {
    const inv = this.state.get('inventory');
    if (inv[sku] && inv[sku][branchId]) {
      inv[sku][branchId].reserved = Math.max(0, (inv[sku][branchId].reserved || 0) - quantity);
      this.state.set('inventory', inv);

      this.logMovement(
        sku, branchId, 'Release Reservation', +quantity,
        inv[sku][branchId].onHand, reference,
        `Released reserved stock for order ${reference}`,
        'System Fulfillment'
      );
    }
  }

  // Fulfill an order: on-hand decreases, reservation drops
  fulfillReservation(sku, branchId, quantity, reference = '') {
    const inv = this.state.get('inventory');
    if (inv[sku] && inv[sku][branchId]) {
      inv[sku][branchId].onHand = Math.max(0, (inv[sku][branchId].onHand || 0) - quantity);
      inv[sku][branchId].reserved = Math.max(0, (inv[sku][branchId].reserved || 0) - quantity);
      this.state.set('inventory', inv);

      this.logMovement(
        sku, branchId, 'Fulfillment Dispatch', -quantity,
        inv[sku][branchId].onHand, reference,
        `Order fulfilled and dispatched: ${reference}`,
        'Fulfillment Staff'
      );
    }
  }

  // Direct deduction for POS cash-and-carry sale
  deductImmediateSale(sku, branchId, quantity, receiptNumber = '', cashierName = 'Cashier') {
    const record = this.getStockRecord(sku, branchId);
    if (record.available < quantity) {
      throw new Error(`Cannot complete sale: Only ${record.available} units available for ${sku} at this branch.`);
    }

    const inv = this.state.get('inventory');
    inv[sku][branchId].onHand = Math.max(0, inv[sku][branchId].onHand - quantity);
    this.state.set('inventory', inv);

    this.logMovement(
      sku, branchId, 'POS Sale', -quantity,
      inv[sku][branchId].onHand, receiptNumber,
      `Walk-in customer sale via POS receipt #${receiptNumber}`,
      cashierName
    );
    return true;
  }

  // Receive goods from PO or completed transfer
  receiveStock(sku, branchId, quantity, reference = '', reason = 'Stock Receiving', actor = 'Inventory Staff') {
    const inv = this.state.get('inventory');
    if (!inv[sku]) inv[sku] = {};
    if (!inv[sku][branchId]) inv[sku][branchId] = { onHand: 0, reserved: 0, damaged: 0 };

    inv[sku][branchId].onHand += quantity;
    this.state.set('inventory', inv);

    this.logMovement(
      sku, branchId, 'Stock In', +quantity,
      inv[sku][branchId].onHand, reference,
      reason, actor
    );
  }

  // Record damaged stock (from customer returns or shipping damages)
  recordDamaged(sku, branchId, quantity, reference = '', reason = 'Damaged goods', actor = 'Staff') {
    const inv = this.state.get('inventory');
    if (!inv[sku]) inv[sku] = {};
    if (!inv[sku][branchId]) inv[sku][branchId] = { onHand: 0, reserved: 0, damaged: 0 };

    inv[sku][branchId].damaged = (inv[sku][branchId].damaged || 0) + quantity;
    this.state.set('inventory', inv);

    this.logMovement(
      sku, branchId, 'Damaged Write-off', 0,
      inv[sku][branchId].onHand, reference,
      `${reason} (Marked ${quantity} unit(s) as damaged)`, actor
    );
  }

  // Manual stock adjustment after physical audit/cycle count
  adjustStock(sku, branchId, newOnHand, reason = 'Inventory Count Audit', actor = 'Inventory Staff') {
    const inv = this.state.get('inventory');
    if (!inv[sku]) inv[sku] = {};
    if (!inv[sku][branchId]) inv[sku][branchId] = { onHand: 0, reserved: 0, damaged: 0 };

    const oldOnHand = inv[sku][branchId].onHand || 0;
    const diff = newOnHand - oldOnHand;
    inv[sku][branchId].onHand = Math.max(0, newOnHand);
    this.state.set('inventory', inv);

    this.logMovement(
      sku, branchId, 'Audit Adjustment', diff,
      newOnHand, `ADJ-${Date.now().toString().slice(-6)}`,
      `${reason} (from ${oldOnHand} to ${newOnHand})`, actor
    );
  }

  // Append movement to the immutable audit log
  logMovement(sku, branchId, type, change, balanceAfter, reference, reason, actor) {
    const movements = this.state.get('stockMovements') || [];
    const products = this.state.get('products') || [];
    const prod = products.find(p => p.sku === sku);
    const productName = prod ? prod.name : sku;

    const entry = {
      id: `MOV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      sku,
      productName,
      branchId,
      type,
      reference,
      quantityChange: change,
      balanceAfter,
      reason,
      actor
    };

    movements.unshift(entry);
    this.state.set('stockMovements', movements);

    // Trigger low stock notification check
    this.checkLowStockNotification(sku, branchId);
  }

  checkLowStockNotification(sku, branchId) {
    const products = this.state.get('products') || [];
    const prod = products.find(p => p.sku === sku);
    if (!prod) return;

    const available = this.getAvailableStock(sku, branchId);
    if (available <= (prod.reorderLevel || 5)) {
      const branches = this.state.get('branches') || [];
      const branchObj = branches.find(b => b.id === branchId);
      const branchName = branchObj ? branchObj.name : branchId;

      this.state.addNotification(
        'Low Stock Warning',
        `${prod.name} (${sku}) is down to ${available} available units at ${branchName}.`,
        'warning'
      );
    }
  }

  // Get list of low stock items for dashboard alerts
  getLowStockItems(targetBranchId = null) {
    const products = this.state.get('products') || [];
    const branches = this.state.get('branches') || [];
    const lowStockList = [];

    products.forEach(p => {
      branches.forEach(b => {
        if (targetBranchId && b.id !== targetBranchId) return;
        const available = this.getAvailableStock(p.sku, b.id);
        const reorder = p.reorderLevel || 8;
        if (available <= reorder) {
          lowStockList.push({
            product: p,
            sku: p.sku,
            branchId: b.id,
            branchName: b.name,
            available,
            onHand: this.getStockRecord(p.sku, b.id).onHand,
            reorderLevel: reorder,
            status: available === 0 ? 'Out of Stock' : 'Low Stock'
          });
        }
      });
    });

    return lowStockList;
  }

  // Calculate inventory valuation
  getValuation(targetBranchId = null) {
    const products = this.state.get('products') || [];
    const branches = this.state.get('branches') || [];
    let totalValue = 0;
    let totalItems = 0;

    products.forEach(p => {
      branches.forEach(b => {
        if (targetBranchId && b.id !== targetBranchId) return;
        const record = this.getStockRecord(p.sku, b.id);
        totalValue += record.onHand * (p.costPrice || 0);
        totalItems += record.onHand;
      });
    });

    return { totalValue, totalItems };
  }
}

const inventoryService = new InventoryService();

