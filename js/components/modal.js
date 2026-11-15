/**
 * SmartRetail AI - Reusable Modal & Confirmation Dialog Component
 */

class Modal {
  constructor() {
    this.currentBackdrop = null;
  }

  open({ title = '', content = '', footer = '', size = '' }) {
    this.close();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const sizeClass = size ? `modal-${size}` : '';

    backdrop.innerHTML = `
      <div class="modal ${sizeClass}">
        <div class="modal-header">
          <h3 class="card-title">${title}</h3>
          <button class="btn btn-ghost btn-icon" id="modal-close-btn">
            ${typeof Icons !== 'undefined' ? Icons.get('x', '', 18) : '&times;'}
          </button>
        </div>
        <div class="modal-body" id="modal-body-container">
          ${content}
        </div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    `;

    document.body.appendChild(backdrop);
    this.currentBackdrop = backdrop;

    // Close listeners
    backdrop.querySelector('#modal-close-btn').addEventListener('click', () => this.close());
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.close();
    });

    document.addEventListener('keydown', this.handleEsc);
  }

  confirm({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = false,
    onConfirm = () => {}
  }) {
    const footer = `
      <button class="btn btn-secondary" id="modal-cancel-btn">${cancelText}</button>
      <button class="btn ${isDanger ? 'btn-danger' : 'btn-primary'}" id="modal-confirm-btn">${confirmText}</button>
    `;

    const content = `
      <div style="display:flex; gap:16px; align-items:flex-start;">
        <div style="color:${isDanger ? '#ef4444' : '#3b82f6'}; flex-shrink:0;">
          ${typeof Icons !== 'undefined' ? Icons.get('alert-triangle', '', 28) : ''}
        </div>
        <div>
          <p style="font-size:0.95rem; line-height:1.6; color:#334155;">${message}</p>
        </div>
      </div>
    `;

    this.open({ title, content, footer, size: 'sm' });

    document.getElementById('modal-cancel-btn').addEventListener('click', () => this.close());
    document.getElementById('modal-confirm-btn').addEventListener('click', () => {
      this.close();
      onConfirm();
    });
  }

  close() {
    if (this.currentBackdrop) {
      this.currentBackdrop.remove();
      this.currentBackdrop = null;
      document.removeEventListener('keydown', this.handleEsc);
    }
  }

  handleEsc = (e) => {
    if (e.key === 'Escape') this.close();
  };
}

const modal = new Modal();

