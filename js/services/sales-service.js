/**
 * SmartRetail AI - Sales & POS Service
 * Handles instant point-of-sale transactions, receipt generation, and cashier shifts
 */

class SalesService {
  constructor() {
    this.state = stateManager;
    this.invService = inventoryService;
  }

  // Create a new POS sale
  createSale({
    branchId,
    cashierName,
    cashierId,
    customerId,
    customerName,
    items, // array of { sku, name, price, quantity, total }
    discount = 0,
    paymentMethod = 'Cash',
    tenderedAmount = null
  }) {
    // 1. Validation
    if (!items || items.length === 0) {
      throw new Error('Cart is empty. Cannot process sale.');
    }

    // Verify stock availability for all items before committing
    for (const item of items) {
      const avail = this.invService.getAvailableStock(item.sku, branchId);
      if (avail < item.quantity) {
        throw new Error(`Insufficient stock for "${item.name}". Available: ${avail}, Requested: ${item.quantity}`);
      }
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = Math.max(0, subtotal - discount);
    const receiptNumber = `RCP-${Date.now().toString().slice(-6)}`;
    const orderId = `ORD-POS-${Date.now().toString().slice(-6)}`;

    // 2. Decrement physical inventory & log movements
    items.forEach(item => {
      this.invService.deductImmediateSale(
        item.sku,
        branchId,
        item.quantity,
        receiptNumber,
        cashierName
      );
    });

    // 3. Create Order / Sale Record
    const branches = this.state.get('branches') || [];
    const branchObj = branches.find(b => b.id === branchId) || { name: branchId };

    // Register payment record in central payment ledger
    let paymentRec = null;
    if (typeof paymentService !== 'undefined') {
      paymentRec = paymentService.createPaymentRequest({
        orderId,
        orderNumber: receiptNumber,
        branchId,
        customerId: customerId || 'WALK-IN',
        customerName: customerName || 'Walk-in Customer',
        paymentMethod: paymentMethod.includes('KHQR') ? 'Bakong KHQR' : (paymentMethod.includes('Card') ? 'Card (Simulated)' : 'Cash'),
        amountUSD: total,
        currency: 'USD',
        initialStatus: 'Paid'
      });
    }

    const saleRecord = {
      id: orderId,
      orderNumber: receiptNumber,
      channel: 'POS',
      fulfillmentMethod: 'In-Store',
      assignedBranch: branchId,
      branchName: branchObj.name,
      customerId: customerId || 'WALK-IN',
      customerName: customerName || 'Walk-in Customer',
      phone: 'N/A',
      items: items.map(i => ({
        sku: i.sku,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        total: i.price * i.quantity
      })),
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      deliveryFee: 0.00,
      total: parseFloat(total.toFixed(2)),
      paymentMethod: paymentMethod, // 'Cash', 'Card (Simulated)', 'Bakong KHQR'
      paymentStatus: 'Paid',
      transactionRef: paymentRec ? paymentRec.transactionRef : `TXN-${receiptNumber}`,
      paymentId: paymentRec ? paymentRec.id : null,
      tenderedAmount: tenderedAmount ? parseFloat(tenderedAmount.toFixed(2)) : total,
      changeAmount: tenderedAmount ? Math.max(0, parseFloat((tenderedAmount - total).toFixed(2))) : 0.00,
      cashier: cashierName,
      status: 'Completed',
      createdAt: new Date().toISOString(),
      timeline: [
        {
          status: 'Sale Completed',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: `Completed by ${cashierName} at ${branchObj.name}`
        }
      ]
    };

    // 4. Update Orders State
    const orders = this.state.get('orders') || [];
    orders.unshift(saleRecord);
    this.state.set('orders', orders);

    // 5. Update Customer Total Spent if registered
    if (customerId && customerId !== 'WALK-IN') {
      const customers = this.state.get('customers') || [];
      const cust = customers.find(c => c.id === customerId);
      if (cust) {
        cust.totalSpent = parseFloat(((cust.totalSpent || 0) + total).toFixed(2));
        cust.ordersCount = (cust.ordersCount || 0) + 1;
        this.state.set('customers', customers);
      }
    }

    // 6. Broadcast event
    if (typeof eventBus !== 'undefined') {
      eventBus.emit('sales:new_sale', saleRecord);
    }

    return saleRecord;
  }

  // Get sales history filtered by branch / cashier
  getSalesHistory(branchId = null, cashierName = null) {
    const orders = this.state.get('orders') || [];
    return orders.filter(order => {
      if (order.channel !== 'POS') return false;
      if (branchId && order.assignedBranch !== branchId) return false;
      if (cashierName && order.cashier !== cashierName) return false;
      return true;
    });
  }
}

const salesService = new SalesService();

