/**
 * SmartRetail AI - Central Event Bus & Cross-Tab Synchronizer
 */

class EventBus {
  constructor() {
    this.listeners = new Map();
    this.initCrossTabSync();
  }

  // Subscribe to an in-memory event
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  // Unsubscribe
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  // Emit event to local subscribers and broadcast key change
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in event listener for ${event}:`, e);
        }
      });
    }
  }

  // Cross-tab synchronization via LocalStorage event
  initCrossTabSync() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'smartretail_state' && e.newValue) {
        this.emit('state:external_change', JSON.parse(e.newValue));
      }
      if (e.key === 'smartretail_active_user' && e.newValue) {
        this.emit('auth:user_changed', JSON.parse(e.newValue));
      }
    });
  }
}

const eventBus = new EventBus();

