/**
 * SmartRetail AI - Stock Transfer Management Service
 * Controls inter-branch goods transfers with multi-step approval, dispatch, and receiving
 */

class TransferService {
  constructor() {
    this.state = stateManager;
    this.invService = inventoryService;
  }

  // Create a new stock transfer request
  createTransfer({
    sourceBranch,
    destinationBranch,
    items, // array of { sku, name, requestedQty }
    reason = '',
    requestedBy = 'Branch Staff'
  }) {
    if (sourceBranch === destinationBranch) {
      throw new Error('Source and destination branch cannot be the same.');
    }

    if (!items || items.length === 0) {
      throw new Error('Please select at least one product to transfer.');
    }

    // Validate that source branch has sufficient available stock
    items.forEach(item => {
      const avail = this.invService.getAvailableStock(item.sku, sourceBranch);
      if (avail < item.requestedQty) {
        throw new Error(`Insufficient stock at source branch for ${item.name}. Available: ${avail}, Requested: ${item.requestedQty}`);
      }
    });

    const transferNumber = `TRF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const transfer = {
      id: transferNumber,
      transferNumber,
      sourceBranch,
      destinationBranch,
      status: 'Pending Approval',
      reason,
      requestedBy,
      createdAt: new Date().toISOString(),
      items: items.map(i => ({
        sku: i.sku,
        name: i.name,
        requestedQty: parseInt(i.requestedQty),
        dispatchedQty: 0,
        receivedQty: 0
      })),
      approver: null,
      notes: 'Submitted for manager/head office approval.'
    };

    const transfers = this.state.get('transfers') || [];
    transfers.unshift(transfer);
    this.state.set('transfers', transfers);

    this.state.addNotification(
      'New Transfer Request',
      `Transfer ${transferNumber} created from ${sourceBranch} to ${destinationBranch}`,
      'transfer'
    );

    return transfer;
  }

  // Manager approves transfer
  approveTransfer(transferId, approverName = 'Head Office Admin') {
    const transfers = this.state.get('transfers') || [];
    const trf = transfers.find(t => t.id === transferId || t.transferNumber === transferId);
    if (!trf) throw new Error('Transfer not found');

    trf.status = 'Approved';
    trf.approver = approverName;
    trf.approvedAt = new Date().toISOString();
    this.state.set('transfers', transfers);

    this.state.addNotification(
      'Transfer Approved',
      `${trf.transferNumber} approved by ${approverName}. Ready for source branch picking.`,
      'transfer'
    );
    return trf;
  }

  // Source branch marks transfer as dispatched (In Transit)
  dispatchTransfer(transferId, dispatchedBy = 'Source Branch Staff') {
    const transfers = this.state.get('transfers') || [];
    const trf = transfers.find(t => t.id === transferId || t.transferNumber === transferId);
    if (!trf) throw new Error('Transfer not found');

    if (trf.status !== 'Approved' && trf.status !== 'Picking') {
      throw new Error(`Cannot dispatch transfer with status "${trf.status}"`);
    }

    // Deduct stock from source branch
    trf.items.forEach(item => {
      const qty = item.requestedQty;
      item.dispatchedQty = qty;

      const inv = this.state.get('inventory');
      if (inv[item.sku] && inv[item.sku][trf.sourceBranch]) {
        inv[item.sku][trf.sourceBranch].onHand = Math.max(0, inv[item.sku][trf.sourceBranch].onHand - qty);
      }
      this.state.set('inventory', inv);

      this.invService.logMovement(
        item.sku, trf.sourceBranch, 'Transfer Out', -qty,
        inv[item.sku][trf.sourceBranch].onHand, trf.transferNumber,
        `Dispatched to branch ${trf.destinationBranch}`, dispatchedBy
      );
    });

    trf.status = 'In Transit';
    trf.dispatchedAt = new Date().toISOString();
    this.state.set('transfers', transfers);

    this.state.addNotification(
      'Transfer Dispatched',
      `${trf.transferNumber} is now in transit to branch ${trf.destinationBranch}.`,
      'transfer'
    );
    return trf;
  }

  // Destination branch confirms receiving
  receiveTransfer(transferId, receivedItems, receivedBy = 'Destination Staff') {
    const transfers = this.state.get('transfers') || [];
    const trf = transfers.find(t => t.id === transferId || t.transferNumber === transferId);
    if (!trf) throw new Error('Transfer not found');

    let allComplete = true;

    trf.items.forEach(item => {
      const receivedInfo = receivedItems.find(r => r.sku === item.sku) || { receivedQty: item.dispatchedQty, damagedQty: 0 };
      const acceptedQty = parseInt(receivedInfo.receivedQty) || 0;
      const damagedQty = parseInt(receivedInfo.damagedQty) || 0;

      item.receivedQty = acceptedQty;
      item.damagedQty = damagedQty;

      if (acceptedQty < item.dispatchedQty) {
        allComplete = false;
      }

      // Add accepted stock to destination branch
      if (acceptedQty > 0) {
        this.invService.receiveStock(
          item.sku, trf.destinationBranch, acceptedQty,
          trf.transferNumber, `Transfer received from ${trf.sourceBranch}`, receivedBy
        );
      }

      // Record any damaged goods
      if (damagedQty > 0) {
        this.invService.recordDamaged(
          item.sku, trf.destinationBranch, damagedQty,
          trf.transferNumber, `Transit damage reported upon receiving transfer ${trf.transferNumber}`, receivedBy
        );
      }
    });

    trf.status = allComplete ? 'Completed' : 'Partially Received';
    trf.receivedAt = new Date().toISOString();
    this.state.set('transfers', transfers);

    this.state.addNotification(
      'Transfer Received',
      `${trf.transferNumber} received at ${trf.destinationBranch} (${trf.status}).`,
      'transfer'
    );
    return trf;
  }

  getTransfers(branchId = null) {
    const transfers = this.state.get('transfers') || [];
    if (!branchId) return transfers;
    return transfers.filter(t => t.sourceBranch === branchId || t.destinationBranch === branchId);
  }
}

const transferService = new TransferService();

