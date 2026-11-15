/**
 * SmartRetail AI - Universal Floating Demo Controller
 * Injected automatically on all screens to enable effortless 1-click role switching,
 * navigation between the 3 interfaces, and instant demo data reset.
 */

class DemoBar {
  constructor() {
    this.init();
  }

  init() {
    // Wait for DOM to load if needed
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.render());
    } else {
      this.render();
    }
  }

  render() {
    // Remove if already exists
    const existing = document.getElementById('smartretail-demo-bar');
    if (existing) existing.remove();

    const currentUser = authService.getCurrentUser();
    const allUsers = INITIAL_USERS || [];

    const bar = document.createElement('div');
    bar.id = 'smartretail-demo-bar';
    bar.className = 'demo-bar';

    const userOptions = allUsers.map(u => {
      const selected = currentUser && currentUser.id === u.id ? 'selected' : '';
      const branchTag = u.branch !== 'All' && u.branch !== 'Customer' ? ` (${u.branch})` : '';
      return `<option value="${u.id}" ${selected}>${u.name} – ${u.role}${branchTag}</option>`;
    }).join('');

    bar.innerHTML = `
      <div style="display:flex; align-items:center; gap:6px;">
        <span class="sync-indicator" title="State Synchronized via LocalStorage"></span>
        <span style="font-weight:700; color:#38bdf8; font-size:11px; letter-spacing:0.04em;">DEMO ROLE:</span>
      </div>

      <select id="demo-role-select">
        ${userOptions}
      </select>

      <div style="display:flex; align-items:center; gap:8px; border-left:1px solid #334155; padding-left:8px;">
        <a href="store.html" title="Customer Shopping Storefront">Store</a>
        <span style="color:#475569;">|</span>
        <a href="pos.html" title="Branch Cashier POS Terminal">POS</a>
        <span style="color:#475569;">|</span>
        <a href="admin.html" title="Enterprise Management Dashboard">Admin</a>
      </div>

      <button id="demo-reset-btn" class="btn btn-secondary btn-sm" style="padding:2px 8px; font-size:10px; background:#334155; color:#cbd5e1; border:none; margin-left:4px;" title="Reset mock database to initial state">
        Reset
      </button>
    `;

    document.body.appendChild(bar);

    // Event listeners
    bar.querySelector('#demo-role-select').addEventListener('change', (e) => {
      const selectedId = e.target.value;
      const targetUser = allUsers.find(u => u.id === selectedId);
      if (targetUser) {
        toast.info(`Switched active user to ${targetUser.name} (${targetUser.role})`);
        authService.setCurrentUser(targetUser, true);
      }
    });

    bar.querySelector('#demo-reset-btn').addEventListener('click', () => {
      modal.confirm({
        title: 'Reset Demo Data?',
        message: 'This will restore all inventory levels, initial Cambodian branches, sample orders, and purchase orders to factory defaults.',
        confirmText: 'Reset Everything',
        isDanger: true,
        onConfirm: () => {
          stateManager.resetToDefaults();
          toast.success('Database reset to initial Cambodian retail mock data.');
          setTimeout(() => window.location.reload(), 400);
        }
      });
    });
  }
}

// Instantiate demo bar
const demoBar = new DemoBar();

