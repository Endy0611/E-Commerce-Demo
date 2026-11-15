/**
 * SmartRetail AI - Modern Sileo / Sonner Toast Notification System
 * Inspired by Shadcn UI Sonner (by Emil Kowalski) & Sileo Toast
 * Features stacked cards, frosted-glass backdrop, Heroicons, progress timer,
 * and dual-line typography (title + description).
 */

class Toast {
  constructor() {
    this.container = null;
    this.toasts = [];
    this.ensureContainer();
  }

  ensureContainer() {
    let el = document.getElementById('sileo-toast-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'sileo-toast-container';
      el.className = 'sileo-toast-viewport';
      document.body.appendChild(el);
    }
    this.container = el;
  }

  /**
   * Display a sleek Sonner/Sileo toast
   * @param {string|object} titleOrOpts - Message title or options object
   * @param {string} [description] - Optional secondary text
   * @param {string} [type='info'] - 'success' | 'error' | 'warning' | 'info'
   * @param {number} [duration=3800] - Lifespan in milliseconds
   */
  show(titleOrOpts, description = '', type = 'info', duration = 3800) {
    this.ensureContainer();

    let title = titleOrOpts;
    let action = null;

    if (typeof titleOrOpts === 'object' && titleOrOpts !== null) {
      title = titleOrOpts.title || '';
      description = titleOrOpts.description || '';
      type = titleOrOpts.type || type;
      duration = titleOrOpts.duration || duration;
      action = titleOrOpts.action || null;
    }

    const toastId = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Resolve Heroicon for toast type
    let iconSvg = '';
    let iconClass = 'sileo-icon-info';

    if (type === 'success') {
      iconSvg = typeof Icons !== 'undefined' ? Icons.get('check-circle', 'sileo-icon-svg', 20) : '✓';
      iconClass = 'sileo-icon-success';
    } else if (type === 'error') {
      iconSvg = typeof Icons !== 'undefined' ? Icons.get('exclamation-circle', 'sileo-icon-svg', 20) : '✕';
      iconClass = 'sileo-icon-error';
    } else if (type === 'warning') {
      iconSvg = typeof Icons !== 'undefined' ? Icons.get('alert-triangle', 'sileo-icon-svg', 20) : '⚠';
      iconClass = 'sileo-icon-warning';
    } else {
      iconSvg = typeof Icons !== 'undefined' ? Icons.get('info', 'sileo-icon-svg', 20) : 'ℹ';
      iconClass = 'sileo-icon-info';
    }

    const closeSvg = typeof Icons !== 'undefined' ? Icons.get('x', 'sileo-close-svg', 14) : '×';

    const toastEl = document.createElement('div');
    toastEl.id = toastId;
    toastEl.className = `sileo-toast-card sileo-toast-${type}`;

    let actionBtnHtml = '';
    if (action && action.label && typeof action.onClick === 'function') {
      actionBtnHtml = `<button class="sileo-action-btn" id="${toastId}-action">${action.label}</button>`;
    }

    toastEl.innerHTML = `
      <div class="sileo-toast-inner">
        <div class="sileo-icon-wrap ${iconClass}">
          ${iconSvg}
        </div>
        <div class="sileo-text-wrap">
          <div class="sileo-toast-title">${title}</div>
          ${description ? `<div class="sileo-toast-desc">${description}</div>` : ''}
        </div>
        ${actionBtnHtml}
        <button class="sileo-close-btn" aria-label="Close notification" id="${toastId}-close">
          ${closeSvg}
        </button>
      </div>
      <div class="sileo-progress-bar" style="animation-duration: ${duration}ms;"></div>
    `;

    this.container.appendChild(toastEl);
    this.toasts.push(toastEl);
    this.updateStacking();

    // Bind close action
    const closeBtn = toastEl.querySelector(`#${toastId}-close`);
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.dismiss(toastEl));
    }

    // Bind custom action button if provided
    if (action) {
      const actBtn = toastEl.querySelector(`#${toastId}-action`);
      if (actBtn) {
        actBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          action.onClick();
          this.dismiss(toastEl);
        });
      }
    }

    // Auto dismiss timer
    const timer = setTimeout(() => {
      this.dismiss(toastEl);
    }, duration);

    toastEl._timer = timer;

    // Pause on hover
    toastEl.addEventListener('mouseenter', () => {
      const progressBar = toastEl.querySelector('.sileo-progress-bar');
      if (progressBar) progressBar.style.animationPlayState = 'paused';
    });
    toastEl.addEventListener('mouseleave', () => {
      const progressBar = toastEl.querySelector('.sileo-progress-bar');
      if (progressBar) progressBar.style.animationPlayState = 'running';
    });

    return toastId;
  }

  dismiss(toastEl) {
    if (!toastEl || toastEl._dismissing) return;
    toastEl._dismissing = true;
    if (toastEl._timer) clearTimeout(toastEl._timer);

    toastEl.classList.add('sileo-toast-leaving');
    setTimeout(() => {
      if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
      this.toasts = this.toasts.filter(t => t !== toastEl);
      this.updateStacking();
    }, 220);
  }

  updateStacking() {
    // Keep max 5 visible, stack cleanly
    const active = this.toasts.slice(-4);
    active.forEach((el, idx) => {
      const reverseIdx = active.length - 1 - idx;
      el.style.setProperty('--toast-offset', `${reverseIdx * 12}px`);
      el.style.setProperty('--toast-scale', `${1 - reverseIdx * 0.04}`);
      el.style.setProperty('--toast-opacity', `${1 - reverseIdx * 0.15}`);
    });
  }

  success(title, description = '') {
    return this.show(title, description, 'success');
  }

  error(title, description = '') {
    return this.show(title, description, 'error', 4500);
  }

  warning(title, description = '') {
    return this.show(title, description, 'warning', 4000);
  }

  info(title, description = '') {
    return this.show(title, description, 'info');
  }

  clearAll() {
    [...this.toasts].forEach(t => this.dismiss(t));
  }
}

const toast = new Toast();
