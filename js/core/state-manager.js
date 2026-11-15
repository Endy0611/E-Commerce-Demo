/**
 * SmartRetail AI - Central State Store & Persistence Layer
 * Provides single source of truth across all 3 interfaces (Store, Admin, POS)
 */

class StateManager {
  constructor() {
    this.STORAGE_KEY = 'smartretail_state';
    this.subscribers = new Set();
    this.state = this.loadState();

    // Listen for cross-tab updates
    if (typeof eventBus !== 'undefined') {
      eventBus.on('state:external_change', (newState) => {
        this.state = newState;
        this.notifySubscribers('*');
      });
    }
  }

  // Load state from LocalStorage or initialize with defaults
  loadState() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Automatically migrate to new Flagship & Premium mock data if on older schema
        if (parsed && parsed.products && parsed.products.some(p => p.sku === 'IP16-PM-256') && parsed.orders && parsed.orders.some(o => o.id === 'ORD-2026-006')) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial mock data.', e);
    }
    const initial = this.getInitialState();
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initial));
    } catch (err) {
      // ignore
    }
    return initial;
  }

  // Construct initial mock state from initial-data.js
  getInitialState() {
    const notifications = [
      {
        id: 'NOTIF-001',
        title: 'New Online Order Received',
        message: 'Order #ORD-2026-001 placed by Sokha Vann ($57.00)',
        type: 'order',
        unread: true,
        timestamp: new Date().toISOString()
      },
      {
        id: 'NOTIF-002',
        title: 'Low Stock Alert',
        message: 'Baseus USB-C Cable (BAS-C1M) has only 3 units available at Sen Sok (B003)',
        type: 'warning',
        unread: true,
        timestamp: new Date().toISOString()
      },
      {
        id: 'NOTIF-003',
        title: 'Transfer Awaiting Approval',
        message: 'TRF-2026-008: Toul Kork to Sen Sok (10x Logitech M185)',
        type: 'transfer',
        unread: true,
        timestamp: new Date().toISOString()
      },
      {
        id: 'NOTIF-004',
        title: 'Purchase Order Awaiting Approval',
        message: 'PO-2026-014 from Tech Distribution Co. ($845.00)',
        type: 'purchase',
        unread: true,
        timestamp: new Date().toISOString()
      }
    ];

    return {
      branches: JSON.parse(JSON.stringify(INITIAL_BRANCHES)),
      products: JSON.parse(JSON.stringify(INITIAL_PRODUCTS)),
      inventory: JSON.parse(JSON.stringify(INITIAL_INVENTORY)),
      customers: JSON.parse(JSON.stringify(INITIAL_CUSTOMERS)),
      orders: JSON.parse(JSON.stringify(INITIAL_ORDERS)),
      purchaseOrders: JSON.parse(JSON.stringify(INITIAL_PURCHASE_ORDERS)),
      transfers: JSON.parse(JSON.stringify(INITIAL_TRANSFERS)),
      stockMovements: JSON.parse(JSON.stringify(INITIAL_STOCK_MOVEMENTS)),
      returns: JSON.parse(JSON.stringify(INITIAL_RETURNS)),
      promotions: JSON.parse(JSON.stringify(INITIAL_PROMOTIONS)),
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      payments: JSON.parse(JSON.stringify(typeof INITIAL_PAYMENTS !== 'undefined' ? INITIAL_PAYMENTS : [])),
      paymentSettings: JSON.parse(JSON.stringify(typeof INITIAL_PAYMENT_SETTINGS !== 'undefined' ? INITIAL_PAYMENT_SETTINGS : {})),
      notifications: notifications,
      lastUpdated: new Date().toISOString()
    };
  }

  // Save current state to LocalStorage
  saveState() {
    this.state.lastUpdated = new Date().toISOString();
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to write state to localStorage', e);
    }
  }

  // Reset entire application to initial factory mock data
  resetToDefaults() {
    this.state = this.getInitialState();
    this.saveState();
    this.notifySubscribers('*');
    if (typeof eventBus !== 'undefined') {
      eventBus.emit('state:reset', this.state);
    }
  }

  // State Subscription for Reactive UI
  subscribe(keyOrFn, maybeFn) {
    let key = '*';
    let fn = keyOrFn;
    if (typeof keyOrFn === 'string') {
      key = keyOrFn;
      fn = maybeFn;
    }
    const subscriber = { key, fn };
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }

  notifySubscribers(changedKey) {
    this.subscribers.forEach(({ key, fn }) => {
      if (key === '*' || key === changedKey) {
        try {
          fn(this.state, changedKey);
        } catch (e) {
          console.error('Error notifying state subscriber:', e);
        }
      }
    });
  }

  // Generic state getter
  get(key) {
    return this.state[key];
  }

  // Generic state setter with auto-save & subscriber notification
  set(key, value) {
    this.state[key] = value;
    this.saveState();
    this.notifySubscribers(key);
    if (typeof eventBus !== 'undefined') {
      eventBus.emit(`state:${key}`, value);
    }
  }

  // Push notification helper
  addNotification(title, message, type = 'info') {
    const notif = {
      id: `NOTIF-${Date.now()}`,
      title,
      message,
      type,
      unread: true,
      timestamp: new Date().toISOString()
    };
    this.state.notifications.unshift(notif);
    this.saveState();
    this.notifySubscribers('notifications');
    if (typeof eventBus !== 'undefined') {
      eventBus.emit('notification:new', notif);
    }
    return notif;
  }
}

const stateManager = new StateManager();

