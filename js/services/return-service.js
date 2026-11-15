/**
 * SmartRetail AI - Returns, Refunds, Exchanges & Warranty Service
 * Rule: Returned products must not automatically become available stock.
 * Only sellable inspected goods return to active stock; damaged goods are logged as damaged.
 */

class ReturnService {
  constructor() {
    this.state = stateManager;
    this.invService = inventoryService;
  }

  // Create a new return/warranty request
  createReturnRequest({
    orderNumber,
    customerId,
    customerName,
    sku,
    quantity = 1,
    reason,
    condition = 'Opened / Defective',
    branchId = 'B001'
  }) {
    const products = this.state.get('products') || [];
    const prod = products.find(p => p.sku === sku);
    const productName = prod ? prod.name : sku;

    const caseNumber = `RET-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newCase = {
      id: caseNumber,
      caseNumber,
      orderNumber,
      customerId,
      customerName,
      branchId,
      sku,
      productName,
      quantity: parseInt(quantity),
      reason,
      condition,
      inspectionResult: 'Pending Inspection',
      status: 'Pending Review',
      refundAmount: prod ? parseFloat((prod.sellingPrice * quantity).toFixed(2)) : 0.00,
      restockDecision: 'Pending',
      createdAt: new Date().toISOString(),
      resolvedBy: null,
      notes: ''
    };

    const returns = this.state.get('returns') || [];
    returns.unshift(newCase);
    this.state.set('returns', returns);

    this.state.addNotification(
      'New Return Request',
      `Case ${caseNumber} opened for ${productName} by ${customerName}`,
      'return'
    );

    return newCase;
  }

  // Inspect and resolve return request
  resolveReturn({
    caseId,
    approved = true,
    inspectionResult, // e.g. "Sellable / Unopened" or "Defective / Damaged"
    restockDecision,  // 'Restock Sellable' or 'Write-off Damaged' or 'No Action'
    refundProcessed = true,
    staffName = 'Nita Hem (Customer Service)'
  }) {
    const returns = this.state.get('returns') || [];
    const rCase = returns.find(r => r.id === caseId || r.caseNumber === caseId);
    if (!rCase) throw new Error('Return case not found');

    rCase.inspectionResult = inspectionResult;
    rCase.restockDecision = restockDecision;
    rCase.status = approved ? (refundProcessed ? 'Approved & Refunded' : 'Approved') : 'Rejected';
    rCase.resolvedBy = staffName;
    rCase.resolvedAt = new Date().toISOString();

    // Critical Rule: Process inventory restock based ONLY on inspection
    if (approved && restockDecision === 'Restock Sellable') {
      this.invService.receiveStock(
        rCase.sku,
        rCase.branchId || 'B001',
        rCase.quantity,
        rCase.caseNumber,
        `Customer return restocked after passing inspection (${rCase.caseNumber})`,
        staffName
      );
    } else if (approved && restockDecision === 'Write-off Damaged') {
      this.invService.recordDamaged(
        rCase.sku,
        rCase.branchId || 'B001',
        rCase.quantity,
        rCase.caseNumber,
        `Customer return marked defective (${rCase.caseNumber})`,
        staffName
      );
    }

    this.state.set('returns', returns);

    this.state.addNotification(
      'Return Case Resolved',
      `Case ${rCase.caseNumber} ${rCase.status}. Restock: ${restockDecision}`,
      'return'
    );

    return rCase;
  }

  getReturns() {
    return this.state.get('returns') || [];
  }
}

const returnService = new ReturnService();

