/**
 * SmartRetail AI - Procurement & Supplier Purchase Order Service
 * Rule: Creating PO does NOT increase stock. Only confirmed receiving increases stock.
 */

class PurchaseService {
  constructor() {
    this.state = stateManager;
    this.invService = inventoryService;
  }

  // Create a new purchase order
  createPurchaseOrder({
    supplier,
    contactPerson = '',
    supplierPhone = '',
    destinationBranch = 'WH001',
    expectedDate,
    items, // array of { sku, name, unitCost, quantity }
    notes = '',
    createdBy = 'Vuthy Kim (Procurement)'
  }) {
    if (!items || items.length === 0) {
      throw new Error('Please add at least one product to the purchase order.');
    }

    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const totalAmount = items.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);

    const newPO = {
      id: poNumber,
      poNumber,
      supplier,
      contactPerson,
      supplierPhone,
      destinationBranch,
      expectedDate: expectedDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      status: 'Pending Approval',
      createdBy,
      createdAt: new Date().toISOString(),
      items: items.map(i => ({
        sku: i.sku,
        name: i.name,
        unitCost: parseFloat(i.unitCost),
        quantity: parseInt(i.quantity),
        totalCost: parseFloat((i.unitCost * i.quantity).toFixed(2)),
        receivedQty: 0,
        damagedQty: 0
      })),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      notes
    };

    const pos = this.state.get('purchaseOrders') || [];
    pos.unshift(newPO);
    this.state.set('purchaseOrders', pos);

    this.state.addNotification(
      'New PO Awaiting Approval',
      `${poNumber} created for ${supplier} ($${totalAmount.toFixed(2)})`,
      'purchase'
    );

    return newPO;
  }

  // Approve PO
  approvePurchaseOrder(poId, approverName = 'Chantha Sok (Head Office)') {
    const pos = this.state.get('purchaseOrders') || [];
    const po = pos.find(p => p.id === poId || p.poNumber === poId);
    if (!po) throw new Error('Purchase order not found');

    po.status = 'Approved';
    po.approvedBy = approverName;
    po.approvedAt = new Date().toISOString();
    this.state.set('purchaseOrders', pos);

    this.state.addNotification(
      'Purchase Order Approved',
      `${po.poNumber} has been approved. Awaiting delivery at ${po.destinationBranch}.`,
      'purchase'
    );
    return po;
  }

  // Receive goods into warehouse / destination branch
  receivePurchaseOrder(poId, receivedData, receiverName = 'Rina Touch (Inventory Staff)') {
    const pos = this.state.get('purchaseOrders') || [];
    const po = pos.find(p => p.id === poId || p.poNumber === poId);
    if (!po) throw new Error('Purchase order not found');

    if (po.status !== 'Approved' && po.status !== 'Partially Received') {
      throw new Error(`Cannot receive goods for PO in status "${po.status}". Must be Approved first.`);
    }

    let allComplete = true;

    po.items.forEach(item => {
      const match = receivedData.find(r => r.sku === item.sku) || {
        receivedQty: item.quantity,
        damagedQty: 0
      };

      const accepted = parseInt(match.receivedQty) || 0;
      const damaged = parseInt(match.damagedQty) || 0;

      item.receivedQty = (item.receivedQty || 0) + accepted;
      item.damagedQty = (item.damagedQty || 0) + damaged;

      if (item.receivedQty < item.quantity) {
        allComplete = false;
      }

      // CRITICAL BUSINESS RULE: Only accepted quantities increase on-hand stock
      if (accepted > 0) {
        this.invService.receiveStock(
          item.sku,
          po.destinationBranch,
          accepted,
          po.poNumber,
          `Goods received from supplier: ${po.supplier}`,
          receiverName
        );
      }

      // Damaged goods recorded separately
      if (damaged > 0) {
        this.invService.recordDamaged(
          item.sku,
          po.destinationBranch,
          damaged,
          po.poNumber,
          `Damaged on arrival from supplier ${po.supplier}`,
          receiverName
        );
      }
    });

    po.status = allComplete ? 'Received' : 'Partially Received';
    po.receivedAt = new Date().toISOString();
    po.receivedBy = receiverName;
    this.state.set('purchaseOrders', pos);

    this.state.addNotification(
      'Goods Received',
      `Inventory received for ${po.poNumber} at ${po.destinationBranch}. Status: ${po.status}`,
      'purchase'
    );

    return po;
  }

  getPurchaseOrders() {
    return this.state.get('purchaseOrders') || [];
  }
}

const purchaseService = new PurchaseService();

