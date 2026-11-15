/**
 * SmartRetail AI - Customer CRM Service
 */

class CustomerService {
  constructor() {
    this.state = stateManager;
  }

  getCustomers() {
    return this.state.get('customers') || [];
  }

  getCustomerById(id) {
    const customers = this.getCustomers();
    return customers.find(c => c.id === id);
  }

  getCustomerOrders(customerId) {
    const orders = this.state.get('orders') || [];
    return orders.filter(o => o.customerId === customerId);
  }

  getCustomerReturns(customerId) {
    const returns = this.state.get('returns') || [];
    return returns.filter(r => r.customerId === customerId);
  }

  createCustomer({ name, email, phone, address }) {
    const customers = this.getCustomers();
    const id = `C00${customers.length + 1}`;
    const newCust = {
      id,
      name,
      email,
      phone,
      address,
      totalSpent: 0.00,
      ordersCount: 0,
      returnsCount: 0,
      status: 'Regular'
    };
    customers.push(newCust);
    this.state.set('customers', customers);
    return newCust;
  }
}

const customerService = new CustomerService();

