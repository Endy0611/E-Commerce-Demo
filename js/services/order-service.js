/**
 * SmartRetail AI - Online Orders & Fulfillment Service
 * Handles online customer checkout, branch allocation, reservations, and picking/packing/dispatch pipeline
 */

class OrderService {
  constructor() {
    this.state = stateManager;
    this.invService = inventoryService;
  }

  // Create an online customer order
  createOnlineOrder({
    customerId,
    customerName,
    phone,
    deliveryMethod, // 'Delivery' or 'Pickup'
    assignedBranch,
    deliveryAddress,
    items, // array of { sku, name, price, quantity, total }
    subtotal,
    discount = 0,
    deliveryFee = 0,
    paymentMethod = 'Simulated Online Banking (Bakong)'
  }) {
    if (!items || items.length === 0) {
      throw new Error('Your cart is empty.');
    }

    // 1. Verify available stock at assigned branch
    items.forEach(item => {
      const avail = this.invService.getAvailableStock(item.sku, assignedBranch);
      if (avail < item.quantity) {
        throw new Error(`Insufficient available stock for ${item.name} at the selected branch. Available: ${avail}, Requested: ${item.quantity}`);
      }
    });

    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const total = Math.max(0, subtotal - discount + deliveryFee);

    // 2. Reserve stock in inventory (Available stock decreases immediately)
    items.forEach(item => {
      this.invService.reserveStock(item.sku, assignedBranch, item.quantity, orderNumber);
    });

    const branches = this.state.get('branches') || [];
    const branchObj = branches.find(b => b.id === assignedBranch) || { name: assignedBranch };

    const isKHQR = paymentMethod.includes('KHQR') || paymentMethod === 'Bakong KHQR';
    const initialPaymentStatus = isKHQR ? 'Pending Payment' : 'Paid';
    const initialOrderStatus = isKHQR ? 'Pending Payment' : 'Confirmed';

    // Register payment record in central payment ledger
    let paymentRec = null;
    if (typeof paymentService !== 'undefined') {
      paymentRec = paymentService.createPaymentRequest({
        orderId: orderNumber,
        orderNumber,
        branchId: assignedBranch,
        customerId: customerId || 'GUEST',
        customerName,
        paymentMethod: isKHQR ? 'Bakong KHQR' : paymentMethod,
        amountUSD: total,
        currency: 'USD'
      });
      if (!isKHQR) {
        paymentRec.status = 'Paid';
        paymentRec.paidAt = new Date().toISOString();
      }
    }

    const newOrder = {
      id: orderNumber,
      orderNumber,
      customerId: customerId || 'GUEST',
      customerName,
      phone,
      channel: 'Online',
      fulfillmentMethod: deliveryMethod,
      assignedBranch,
      branchName: branchObj.name,
      deliveryAddress,
      items: items.map(i => ({
        sku: i.sku,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        total: parseFloat((i.price * i.quantity).toFixed(2))
      })),
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      deliveryFee: parseFloat(deliveryFee.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      paymentMethod: isKHQR ? 'Bakong KHQR' : paymentMethod,
      paymentStatus: initialPaymentStatus,
      status: initialOrderStatus,
      paymentId: paymentRec ? paymentRec.id : null,
      transactionRef: paymentRec ? paymentRec.transactionRef : null,
      createdAt: new Date().toISOString(),
      timeline: [
        {
          status: 'Order Placed',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: `Customer placed order online for ${deliveryMethod}`
        },
        {
          status: 'Stock Reserved',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: `Inventory reserved at ${branchObj.name}`
        }
      ]
    };

    // 3. Save order to state
    const orders = this.state.get('orders') || [];
    orders.unshift(newOrder);
    this.state.set('orders', orders);

    // 4. Update customer stats if registered
    if (customerId && customerId !== 'GUEST') {
      const customers = this.state.get('customers') || [];
      const cust = customers.find(c => c.id === customerId);
      if (cust) {
        cust.totalSpent = parseFloat(((cust.totalSpent || 0) + total).toFixed(2));
        cust.ordersCount = (cust.ordersCount || 0) + 1;
        this.state.set('customers', customers);
      }
    }

    // 5. Create notification for managers & fulfillment staff
    this.state.addNotification(
      isKHQR ? 'New Order Awaiting KHQR Payment' : 'New Online Order Confirmed',
      `Order ${orderNumber} placed by ${customerName} ($${total.toFixed(2)} via ${deliveryMethod})`,
      'order'
    );

    return newOrder;
  }

  // Complete simulated KHQR payment
  confirmKHQRPayment(orderId, paymentId) {
    const orders = this.state.get('orders') || [];
    const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) throw new Error('Order not found');

    if (typeof paymentService !== 'undefined' && paymentId) {
      paymentService.verifyAndCompletePayment(paymentId);
    }

    order.paymentStatus = 'Paid';
    order.status = 'Confirmed';
    order.timeline.push({
      status: 'Payment Verified',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: 'Bakong KHQR payment successfully verified. Order confirmed for fulfillment.'
    });

    this.state.set('orders', orders);

    this.state.addNotification(
      'Online Order Paid',
      `Order ${order.orderNumber} paid via Bakong KHQR. Ready for fulfillment at ${order.branchName}.`,
      'success'
    );

    return order;
  }

  // Handle KHQR payment failure or expiration
  failOrExpireKHQRPayment(orderId, paymentId, isExpired = false, reason = 'Payment cancelled by customer') {
    const orders = this.state.get('orders') || [];
    const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) throw new Error('Order not found');

    if (typeof paymentService !== 'undefined' && paymentId) {
      if (isExpired) {
        paymentService.expirePayment(paymentId);
      } else {
        paymentService.failPayment(paymentId, reason);
      }
    }

    // Release stock reservation back to available pool
    order.items.forEach(item => {
      this.invService.releaseReservation(item.sku, order.assignedBranch, item.quantity, order.orderNumber);
    });

    order.paymentStatus = isExpired ? 'Expired' : 'Failed';
    order.status = isExpired ? 'Expired' : 'Cancelled';
    order.timeline.push({
      status: isExpired ? 'Payment Expired' : 'Payment Failed',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: `${reason}. Reserved stock released back to available inventory.`
    });

    this.state.set('orders', orders);
    return order;
  }

  // Update order status with timeline tracking
  updateOrderStatus(orderId, newStatus, note = '', staffName = 'Fulfillment Staff') {
    const orders = this.state.get('orders') || [];
    const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);

    if (!order) {
      throw new Error(`Order ${orderId} not found.`);
    }

    const previousStatus = order.status;
    order.status = newStatus;

    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: newStatus,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: note || `Status changed to ${newStatus} by ${staffName}`
    });

    // Handle inventory state transitions
    if (newStatus === 'Dispatched' || (newStatus === 'Completed' && previousStatus !== 'Dispatched')) {
      // Fulfillment complete: consume reservation, decrement physical on-hand
      order.items.forEach(item => {
        this.invService.fulfillReservation(item.sku, order.assignedBranch, item.quantity, order.orderNumber);
      });
    } else if (newStatus === 'Cancelled') {
      // Release reservation back to available pool if was still reserved
      if (['Confirmed', 'Processing', 'Picking', 'Packed', 'Ready for Pickup'].includes(previousStatus)) {
        order.items.forEach(item => {
          this.invService.releaseReservation(item.sku, order.assignedBranch, item.quantity, order.orderNumber);
        });
      }
    }

    this.state.set('orders', orders);
    return order;
  }

  // Cancel order by customer or manager
  cancelOrder(orderId, reason = 'Customer requested cancellation') {
    return this.updateOrderStatus(orderId, 'Cancelled', reason, 'Customer Service');
  }

  // Get orders filtered by branch and/or status
  getOrders(branchId = null, status = null) {
    const orders = this.state.get('orders') || [];
    return orders.filter(o => {
      if (branchId && o.assignedBranch !== branchId) return false;
      if (status && o.status !== status) return false;
      return true;
    });
  }

  // Find single order by ID or orderNumber
  getOrderById(id) {
    const orders = this.state.get('orders') || [];
    return orders.find(o => o.id === id || o.orderNumber === id);
  }
}

const orderService = new OrderService();

