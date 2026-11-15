/**
 * SmartRetail AI - Authentication & Role-Based Access Control (RBAC)
 */

class AuthService {
  constructor() {
    this.STORAGE_KEY = 'smartretail_active_user';
    this.currentUser = this.loadUser();
  }

  loadUser() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load active user', e);
    }
    // Default fallback to Super Admin
    return INITIAL_USERS[0];
  }

  setCurrentUser(user, redirect = false) {
    this.currentUser = user;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    if (typeof eventBus !== 'undefined') {
      eventBus.emit('auth:user_changed', user);
    }

    if (redirect) {
      this.redirectByRole(user.role);
    }
  }

  switchUserById(userId, redirect = false) {
    const user = INITIAL_USERS.find(u => u.id === userId);
    if (user) {
      this.setCurrentUser(user, redirect);
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return !!this.currentUser && this.currentUser.role !== 'Guest Customer';
  }

  // Check if active user has permission
  can(permission) {
    if (!this.currentUser) return false;
    const role = this.currentUser.role;

    if (role === 'Super Admin') return true;

    const permissionsByRole = {
      'Head Office Admin': [
        'dashboard:view', 'dashboard:all_branches',
        'branches:manage', 'products:manage', 'inventory:view', 'inventory:all_branches',
        'transfers:manage', 'transfers:approve', 'purchase:manage', 'purchase:approve',
        'orders:manage', 'fulfillment:manage', 'returns:manage', 'returns:approve',
        'customers:view', 'promotions:manage', 'reports:view', 'reports:export',
        'ai:assistant', 'settings:view'
      ],
      'Branch Manager': [
        'dashboard:view', 'branches:view', 'products:view', 'inventory:view',
        'transfers:manage', 'orders:manage', 'fulfillment:manage', 'returns:manage',
        'reports:view', 'pos:view', 'ai:assistant'
      ],
      'Cashier': [
        'pos:use', 'pos:sales_history', 'customers:view'
      ],
      'Inventory Staff': [
        'inventory:view', 'inventory:adjust', 'inventory:receive_po',
        'transfers:prepare', 'transfers:receive', 'stock_movement:view'
      ],
      'Procurement Staff': [
        'suppliers:manage', 'purchase:create', 'purchase:view', 'purchase:manage'
      ],
      'Fulfillment Staff': [
        'fulfillment:manage', 'orders:view', 'orders:update_status'
      ],
      'Customer Service Staff': [
        'customers:manage', 'returns:manage', 'warranty:manage', 'orders:view'
      ],
      'Online Customer': [
        'store:browse', 'store:cart', 'store:checkout', 'store:my_orders', 'store:account'
      ],
      'Guest Customer': [
        'store:browse', 'store:cart'
      ]
    };

    const allowed = permissionsByRole[role] || [];
    return allowed.includes(permission);
  }

  // Get active branch restriction
  // Returns null if user can see all branches, or branchId string (e.g. 'B001')
  getAssignedBranch() {
    if (!this.currentUser) return null;
    if (this.currentUser.branch === 'All' || this.currentUser.branch === 'Customer') {
      return null;
    }
    return this.currentUser.branch;
  }

  // Route user automatically to their role's ideal interface
  redirectByRole(role) {
    if (role === 'Cashier') {
      window.location.href = 'pos.html';
    } else if (role === 'Online Customer' || role === 'Guest Customer') {
      window.location.href = 'store.html';
    } else {
      window.location.href = 'admin.html';
    }
  }
}

const authService = new AuthService();

