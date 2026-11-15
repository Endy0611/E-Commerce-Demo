/**
 * SmartRetail AI - Bakong KHQR & Multi-Method Payment Service
 * Handles KHQR generation, simulated verification, status transitions,
 * currency conversions (USD <-> KHR), and merchant branch configurations.
 */

class PaymentService {
  constructor() {
    this.state = stateManager;
    this.EXCHANGE_RATE = 4100; // 1 USD = 4,100 KHR (Simulated Fixed Rate)
  }

  // Currency helper
  convertToKHR(usdAmount) {
    return Math.round(usdAmount * this.EXCHANGE_RATE);
  }

  convertToUSD(khrAmount) {
    return parseFloat((khrAmount / this.EXCHANGE_RATE).toFixed(2));
  }

  // Get branch merchant configuration
  getBranchMerchantConfig(branchId = 'B001') {
    const settings = this.state.get('paymentSettings') || this.getDefaultMerchantSettings();
    return settings[branchId] || settings['B001'];
  }

  getDefaultMerchantSettings() {
    return {
      'B001': {
        branchId: 'B001',
        branchName: 'Phnom Penh Central',
        merchantName: 'SMARTRETAIL CENTRAL',
        bakongAccountId: 'smartretail_pp_central@aclb',
        merchantCity: 'Phnom Penh',
        defaultCurrency: 'USD',
        khqrEnabled: true,
        cashEnabled: true,
        cardEnabled: true,
        expirationSeconds: 180,
        terminalId: 'POS-B001-01'
      },
      'B002': {
        branchId: 'B002',
        branchName: 'Toul Kork',
        merchantName: 'SMARTRETAIL TOUL KORK',
        bakongAccountId: 'smartretail_toulkork@canadia',
        merchantCity: 'Phnom Penh',
        defaultCurrency: 'USD',
        khqrEnabled: true,
        cashEnabled: true,
        cardEnabled: true,
        expirationSeconds: 180,
        terminalId: 'POS-B002-01'
      },
      'B003': {
        branchId: 'B003',
        branchName: 'Sen Sok',
        merchantName: 'SMARTRETAIL SEN SOK',
        bakongAccountId: 'smartretail_sensok@aba',
        merchantCity: 'Phnom Penh',
        defaultCurrency: 'USD',
        khqrEnabled: true,
        cashEnabled: true,
        cardEnabled: true,
        expirationSeconds: 180,
        terminalId: 'POS-B003-01'
      },
      'B004': {
        branchId: 'B004',
        branchName: 'Siem Reap',
        merchantName: 'SMARTRETAIL SIEM REAP',
        bakongAccountId: 'smartretail_siemreap@wing',
        merchantCity: 'Siem Reap',
        defaultCurrency: 'USD',
        khqrEnabled: true,
        cashEnabled: true,
        cardEnabled: true,
        expirationSeconds: 180,
        terminalId: 'POS-B004-01'
      },
      'WH001': {
        branchId: 'WH001',
        branchName: 'Central Warehouse',
        merchantName: 'SMARTRETAIL HQ WAREHOUSE',
        bakongAccountId: 'smartretail_hq@bakong',
        merchantCity: 'Phnom Penh',
        defaultCurrency: 'USD',
        khqrEnabled: true,
        cashEnabled: false,
        cardEnabled: true,
        expirationSeconds: 300,
        terminalId: 'ONLINE-GATEWAY-01'
      }
    };
  }

  // Save updated branch merchant configurations
  updateMerchantSettings(branchId, updatedConfig) {
    const settings = this.state.get('paymentSettings') || this.getDefaultMerchantSettings();
    settings[branchId] = { ...settings[branchId], ...updatedConfig };
    this.state.set('paymentSettings', settings);
  }

  // Create a new payment request
  createPaymentRequest({
    orderId,
    orderNumber,
    branchId = 'B001',
    customerId = 'WALK-IN',
    customerName = 'Walk-in Customer',
    paymentMethod = 'Bakong KHQR',
    amountUSD,
    currency = 'USD',
    initialStatus = null
  }) {
    const paymentId = `PAY-${Date.now().toString().slice(-6)}`;
    const txnRef = `TXN-KHQR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const config = this.getBranchMerchantConfig(branchId);

    const amount = currency === 'KHR' ? this.convertToKHR(amountUSD) : parseFloat(amountUSD.toFixed(2));
    const khrAmount = this.convertToKHR(amountUSD);
    const usdAmount = parseFloat(amountUSD.toFixed(2));

    const expirationSeconds = config.expirationSeconds || 180;
    const expiresAt = new Date(Date.now() + expirationSeconds * 1000).toISOString();

    const isPaid = initialStatus === 'Paid' || paymentMethod === 'Cash';
    const status = isPaid ? 'Paid' : (initialStatus || 'Pending');

    const payment = {
      id: paymentId,
      paymentId,
      orderId,
      orderNumber,
      branchId,
      branchName: config.branchName,
      merchantName: config.merchantName,
      bakongAccountId: config.bakongAccountId,
      merchantCity: config.merchantCity,
      customerId,
      customerName,
      paymentMethod,
      amount,
      currency, // 'USD' or 'KHR'
      usdAmount,
      khrAmount,
      transactionRef: txnRef,
      status,
      createdAt: new Date().toISOString(),
      paidAt: isPaid ? new Date().toISOString() : null,
      expiresAt,
      expirationSeconds,
      verificationData: {
        terminalId: config.terminalId,
        mockPayload: `00020101021230${config.bakongAccountId.length + 4}00${config.bakongAccountId}520459995303840540${amount.toFixed(2)}5802KH59${config.merchantName.length}${config.merchantName}60${config.merchantCity.length}${config.merchantCity}62${txnRef.length + 4}07${txnRef}6304ABCD`,
        hash: `mock_hash_${Date.now()}`
      },
      timeline: [
        {
          status: 'Created',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: `Payment request initialized for $${usdAmount.toFixed(2)} (${khrAmount.toLocaleString()} KHR) via ${paymentMethod}`
        }
      ]
    };

    if (isPaid && paymentMethod !== 'Cash') {
      payment.timeline.push({
        status: 'Paid',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        note: `Verified and marked Paid via ${paymentMethod}`
      });
    }

    const payments = this.state.get('payments') || [];
    payments.unshift(payment);
    this.state.set('payments', payments);

    return payment;
  }

  // Simulate payment verification / success
  verifyAndCompletePayment(paymentId, bankName = 'Bakong Mobile Banking (Simulated)') {
    const payments = this.state.get('payments') || [];
    const payment = payments.find(p => p.id === paymentId || p.paymentId === paymentId);

    if (!payment) throw new Error('Payment record not found.');
    if (payment.status === 'Paid') throw new Error('Payment already completed.');
    if (payment.status === 'Expired') throw new Error('Payment has expired. Please initiate a new payment attempt.');

    payment.status = 'Paid';
    payment.paidAt = new Date().toISOString();
    payment.verificationData.bankName = bankName;
    payment.verificationData.verifiedBy = 'National Bank of Cambodia Bakong Gateway (Simulated)';

    payment.timeline.push({
      status: 'Paid',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: `Verified transaction by ${bankName}. Reference: ${payment.transactionRef}`
    });

    this.state.set('payments', payments);

    this.state.addNotification(
      'Bakong KHQR Payment Verified',
      `Payment ${payment.transactionRef} for $${payment.usdAmount.toFixed(2)} (${payment.khrAmount.toLocaleString()} KHR) confirmed.`,
      'success'
    );

    return payment;
  }

  // Simulate payment failure
  failPayment(paymentId, failureReason = 'Customer rejected transaction in mobile app') {
    const payments = this.state.get('payments') || [];
    const payment = payments.find(p => p.id === paymentId || p.paymentId === paymentId);
    if (!payment) throw new Error('Payment record not found.');

    payment.status = 'Failed';
    payment.timeline.push({
      status: 'Failed',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: `Payment failed: ${failureReason}`
    });

    this.state.set('payments', payments);

    this.state.addNotification(
      'Payment Failed',
      `Payment ${payment.transactionRef} failed: ${failureReason}`,
      'warning'
    );

    return payment;
  }

  // Simulate payment expiration
  expirePayment(paymentId) {
    const payments = this.state.get('payments') || [];
    const payment = payments.find(p => p.id === paymentId || p.paymentId === paymentId);
    if (!payment) return null;

    if (payment.status === 'Pending') {
      payment.status = 'Expired';
      payment.timeline.push({
        status: 'Expired',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        note: 'Payment window expired without customer confirmation.'
      });
      this.state.set('payments', payments);
    }
    return payment;
  }

  // Get payment by ID or transaction reference
  getPaymentById(id) {
    const payments = this.state.get('payments') || [];
    return payments.find(p => p.id === id || p.paymentId === id || p.transactionRef === id);
  }

  // Get payments list with multi-column filtering
  getPayments({ method = 'All', status = 'All', branch = 'All', search = '' } = {}) {
    let payments = this.state.get('payments') || [];

    return payments.filter(p => {
      if (method !== 'All' && p.paymentMethod !== method) return false;
      if (status !== 'All' && p.status !== status) return false;
      if (branch !== 'All' && p.branchId !== branch) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchRef = p.transactionRef && p.transactionRef.toLowerCase().includes(q);
        const matchOrder = p.orderNumber && p.orderNumber.toLowerCase().includes(q);
        const matchCust = p.customerName && p.customerName.toLowerCase().includes(q);
        if (!matchRef && !matchOrder && !matchCust) return false;
      }
      return true;
    });
  }

  // Render authentic-looking Bakong KHQR visual component
  generateKHQRVisualHTML({
    merchantName,
    merchantCity,
    currency,
    amount,
    usdAmount,
    khrAmount,
    transactionRef,
    expirationSeconds = 180
  }) {
    const isKHR = currency === 'KHR';
    const primaryDisplay = isKHR ? `${khrAmount.toLocaleString()} KHR` : `$${usdAmount.toFixed(2)} USD`;
    const secondaryDisplay = isKHR ? `≈ $${usdAmount.toFixed(2)} USD` : `≈ ${khrAmount.toLocaleString()} KHR`;

    return `
      <div class="khqr-card-container">
        <!-- KHQR Header Banner -->
        <div class="khqr-header-banner">
          <div class="khqr-brand-tag">
            <span class="khqr-emblem-red">KHQR</span>
            <span class="khqr-sub-text">National Bank of Cambodia</span>
          </div>
          <div class="khqr-sim-watermark">SIMULATED DEMO</div>
        </div>

        <!-- Merchant Header -->
        <div class="khqr-merchant-info">
          <div class="khqr-merchant-name">${merchantName || 'SMARTRETAIL AI'}</div>
          <div class="khqr-merchant-city">${merchantCity || 'Phnom Penh'} &bull; Bakong Merchant</div>
        </div>

        <!-- Dynamic Payable Amount -->
        <div class="khqr-amount-wrap">
          <div class="khqr-amount-primary" id="khqr-amount-main">${primaryDisplay}</div>
          <div class="khqr-amount-secondary" id="khqr-amount-sub">${secondaryDisplay}</div>
        </div>

        <!-- QR Code Frame -->
        <div class="khqr-code-frame">
          <div class="khqr-corner-border top-left"></div>
          <div class="khqr-corner-border top-right"></div>
          <div class="khqr-corner-border bottom-left"></div>
          <div class="khqr-corner-border bottom-right"></div>

          <!-- Crisp SVG Simulated QR Code with Bakong Center Icon -->
          <div class="khqr-svg-wrapper">
            <svg class="khqr-svg-matrix" viewBox="0 0 160 160" width="160" height="160">
              <!-- Background -->
              <rect width="160" height="160" fill="white" />
              <!-- Top Left Position Detection -->
              <rect x="10" y="10" width="40" height="40" fill="#0f172a" />
              <rect x="16" y="16" width="28" height="28" fill="white" />
              <rect x="22" y="22" width="16" height="16" fill="#0f172a" />
              <!-- Top Right Position Detection -->
              <rect x="110" y="10" width="40" height="40" fill="#0f172a" />
              <rect x="116" y="16" width="28" height="28" fill="white" />
              <rect x="122" y="22" width="16" height="16" fill="#0f172a" />
              <!-- Bottom Left Position Detection -->
              <rect x="10" y="110" width="40" height="40" fill="#0f172a" />
              <rect x="16" y="116" width="28" height="28" fill="white" />
              <rect x="22" y="122" width="16" height="16" fill="#0f172a" />
              <!-- Synthetic Matrix Dots Pattern -->
              <circle cx="65" cy="20" r="4" fill="#0f172a" />
              <circle cx="80" cy="20" r="4" fill="#0f172a" />
              <circle cx="95" cy="20" r="4" fill="#0f172a" />
              <circle cx="65" cy="35" r="4" fill="#0f172a" />
              <circle cx="95" cy="35" r="4" fill="#0f172a" />
              <circle cx="65" cy="50" r="4" fill="#0f172a" />
              <circle cx="80" cy="50" r="4" fill="#0f172a" />
              <circle cx="20" cy="65" r="4" fill="#0f172a" />
              <circle cx="35" cy="65" r="4" fill="#0f172a" />
              <circle cx="50" cy="65" r="4" fill="#0f172a" />
              <circle cx="110" cy="65" r="4" fill="#0f172a" />
              <circle cx="125" cy="65" r="4" fill="#0f172a" />
              <circle cx="140" cy="65" r="4" fill="#0f172a" />
              <circle cx="20" cy="80" r="4" fill="#0f172a" />
              <circle cx="140" cy="80" r="4" fill="#0f172a" />
              <circle cx="20" cy="95" r="4" fill="#0f172a" />
              <circle cx="35" cy="95" r="4" fill="#0f172a" />
              <circle cx="50" cy="95" r="4" fill="#0f172a" />
              <circle cx="110" cy="95" r="4" fill="#0f172a" />
              <circle cx="125" cy="95" r="4" fill="#0f172a" />
              <circle cx="140" cy="95" r="4" fill="#0f172a" />
              <circle cx="65" cy="110" r="4" fill="#0f172a" />
              <circle cx="95" cy="110" r="4" fill="#0f172a" />
              <circle cx="65" cy="125" r="4" fill="#0f172a" />
              <circle cx="80" cy="125" r="4" fill="#0f172a" />
              <circle cx="95" cy="125" r="4" fill="#0f172a" />
              <circle cx="65" cy="140" r="4" fill="#0f172a" />
              <circle cx="80" cy="140" r="4" fill="#0f172a" />
              <circle cx="95" cy="140" r="4" fill="#0f172a" />
              <!-- Central Bakong Red Badge -->
              <rect x="62" y="62" width="36" height="36" rx="6" fill="#e11d48" />
              <text x="80" y="84" font-family="'Inter', sans-serif" font-weight="900" font-size="11" fill="white" text-anchor="middle">KHQR</text>
            </svg>
          </div>
        </div>

        <!-- Reference & Expiration Live Countdown -->
        <div class="khqr-footer-meta">
          <div class="khqr-countdown-strip">
            <span class="khqr-pulse-dot"></span>
            <span>Awaiting Scan: <strong id="khqr-timer-text">03:00</strong></span>
          </div>
          <div class="khqr-ref-tag">Ref: <code>${transactionRef}</code></div>
          <div class="khqr-banks-tag">Scan with Bakong, ABA Mobile, Wing, ACLEDA, Sathapana, etc.</div>
        </div>
      </div>
    `;
  }
}

const paymentService = new PaymentService();
