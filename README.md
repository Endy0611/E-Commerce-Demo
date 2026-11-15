# SmartRetail AI – Multi-Branch Electronics Retail Management Platform

A modern, comprehensive, and highly interactive frontend prototype designed for an electronics accessories retail company operating multiple physical branches across Cambodia, a central distribution warehouse, and an online shopping website.

---

## 🌟 Executive Overview

**SmartRetail AI** is built not merely as a dashboard template, but as a fully realized **retail business system prototype**. It models the end-to-end operational lifecycle of electronics accessories (chargers, cables, power banks, wireless headphones, mice, keyboards, adapters, and phone cases) across Cambodian physical retail branches (**Phnom Penh Central, Toul Kork, Sen Sok, Siem Reap**) and a **Central Distribution Warehouse**.

### 💡 Core Architectural Highlights
1. **Shadcn UI Design Language & Heroicons**:
   - Built on modern **Shadcn UI design tokens** (slate & zinc neutrals, crisp 1px borders, subtle layered shadows, and high-contrast typography in *Plus Jakarta Sans* and *JetBrains Mono*).
   - Replaced all icons with authentic **Tailwind Heroicons** (outline 24x24 vector SVGs).
   - Upgraded notification system to a stacked **Sileo / Sonner Toast** system with frosted glassmorphism, progress countdown timers, and Heroicon badges.
2. **Three Connected Interfaces**:
   - 🛍️ **Customer E-Commerce Store** (`store.html`): Customer-facing shopping storefront with branch stock availability, shopping bag drawer, home delivery vs. store pickup, simulated Bakong KHQR checkout, and visual order tracking.
   - 🏢 **Enterprise Management SaaS** (`admin.html`): Complete operations portal with 15 business submodules: Multi-branch inventory matrix, stock transfer workflows, supplier procurement with quality inspection, online order fulfillment workstation, customer returns & warranty RMA, live analytics charts, and simulated AI business assistant.
   - 💳 **Branch POS Cashier Terminal** (`pos.html`): High-speed, touch/desktop-optimized sales register for physical store cashiers with barcode lookup, live branch stock checks, cash/KHQR tender, and printable 80mm thermal receipts.
3. **Single Centralized State & Cross-Tab Synchronization**:
   - The platform uses a unified application state persisted in browser `LocalStorage`.
   - Modifying data in one tab (e.g. selling an item on POS) triggers cross-tab storage events that instantly update admin dashboard KPIs, stock availability pills on the e-commerce store, and inventory ledgers!
4. **Ten Scoped User Roles**:
   - Super Admin, Head Office Admin, Branch Managers (B001, B003), Cashier, Inventory Staff, Procurement Staff, Fulfillment Staff, Customer Service Staff, Online Customer, and Guest Customer.
5. **Universal Floating Demo Controller**:
   - Present on all screens (bottom-right floating toolbar) allowing 1-click role switching, app jumping, and instant database reset to Cambodian factory defaults.

---

## 🚀 Quick Start / How to Run

No build tools, Node installations, or external databases are required. The entire platform runs on standard HTML5, CSS3, and modern Vanilla ES6+ JavaScript.

### Option 1: Direct File Open
Simply double-click [`index.html`](file:///d:/NU%20Year4/New%20folder/E-commerce%20Demo/smartretail-ai/index.html) in your file explorer to open it in Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari.

### Option 2: Local Static Server (Recommended)
Run any local static server inside the project folder:
```bash
# Using Python:
python -m http.server 8080

# Or using npx serve:
npx serve .
```
Then navigate in your browser to:
- **Platform Showcase Portal**: `http://localhost:8080/index.html`
- **Customer Online Store**: `http://localhost:8080/store.html`
- **Management Dashboard**: `http://localhost:8080/admin.html`
- **Branch Cashier POS**: `http://localhost:8080/pos.html`
- **Demo Role Login**: `http://localhost:8080/login.html`

---

## 👥 Demo User Accounts & Roles

All accounts share the simple demo password: **`demo123`**.  
You can switch between any role instantly using the bottom-right **Demo Role Controller** or the dedicated [login.html](file:///d:/NU%20Year4/New%20folder/E-commerce%20Demo/smartretail-ai/login.html) screen.

| Name | Role | Branch Scope | Default Landing Interface | Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Admin User** | Super Admin | Company-wide (All) | Management Dashboard | Root access to all branches, products, inventory, financial logs, and settings. |
| **Chantha Sok** | Head Office Admin | Company-wide (All) | Management Dashboard | Enterprise operations, transfer approvals, PO authorizations, AI planning. |
| **Lina Vann** | Branch Manager | Phnom Penh Central (B001) | Management Dashboard | Scoped strictly to B001 store sales, inventory, and staff. |
| **Dara Chea** | Branch Manager | Sen Sok (B003) | Management Dashboard | Scoped strictly to B003 branch operations and stock replenishment. |
| **Sopheak Lim** | Cashier | Phnom Penh Central (B001) | Branch POS Terminal | Front-desk sales, barcode search, discount coupons, cash/KHQR tender, receipts. |
| **Rina Touch** | Inventory Staff | Phnom Penh Central (B001) | Management Dashboard | Physical cycle counts, receiving goods, logging damaged stock, transfer prep. |
| **Vuthy Kim** | Procurement Staff | Company-wide (All) | Management Dashboard | Supplier management, creating POs, tracking vendor delivery schedules. |
| **Mony Chhay** | Fulfillment Staff | Phnom Penh Central (B001) | Management Dashboard | Online order processing: picking checklist, packing, ready for pickup, dispatch. |
| **Nita Hem** | Customer Service Staff | Company-wide (All) | Management Dashboard | Customer returns, warranty inspection, restock decisions, simulated refunds. |
| **Demo Customer** | Online Customer | Customer Store | E-Commerce Website | Browsing accessories, online checkout (delivery or pickup), order tracking. |
| **Guest Customer** | Guest Customer | Customer Store | E-Commerce Website | Anonymous browsing and adding products to temporary cart. |

---

## 🏢 Cambodian Branch & Warehouse Network

The platform is customized for a Cambodian retail chain with USD (`$`) currency:
- **`B001` – Phnom Penh Central**: Flagship retail store on Preah Monivong Blvd, Sangkat Phsar Thmey 1, Khan Doun Penh, Phnom Penh.
- **`B002` – Toul Kork**: Retail store on Street 315, Sangkat Boeng Kak 1, Khan Toul Kork, Phnom Penh.
- **`B003` – Sen Sok**: Retail store on Street 1003, Near AEON Mall Sen Sok City, Khan Sen Sok, Phnom Penh.
- **`B004` – Siem Reap**: Tourist & retail store on Sivutha Blvd, Svay Dangkum, Siem Reap.
- **`WH001` – Central Warehouse**: Distribution & import hub on National Road 4, Sangkat Chaom Chau, Phnom Penh.

---

## 📦 Products & Initial Inventory

Master catalog includes genuine electronics accessories with realistic specifications and Cambodian retail price points:

| SKU | Product Name | Brand | Category | Selling Price | Cost Price | Warranty | Reorder Limit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ANK-20W** | Anker 20W USB-C Charger | Anker | Chargers | $18.00 | $11.00 | 12 months | 8 units |
| **BAS-C1M** | Baseus USB-C Cable 1m | Baseus | Cables | $6.50 | $3.00 | 6 months | 10 units |
| **JBL-520** | JBL Tune 520BT Headphones | JBL | Headphones | $39.00 | $27.00 | 12 months | 5 units |
| **LOG-M185** | Logitech M185 Wireless Mouse | Logitech | Computer Accessories | $15.00 | $9.00 | 12 months | 8 units |
| **IP15-CASE** | iPhone 15 Clear Shockproof Case | Spigen | Phone Cases | $9.00 | $3.50 | 7 days | 10 units |
| **XIA-PB10** | Xiaomi 10,000mAh Power Bank | Xiaomi | Power Banks | $22.00 | $15.00 | 12 months | 6 units |
| **LOG-K380** | Logitech K380 Bluetooth Keyboard | Logitech | Computer Accessories | $35.00 | $24.00 | 12 months | 5 units |
| **ANK-C2M** | Anker USB-C Cable 2m | Anker | Cables | $12.00 | $7.00 | 12 months | 6 units |
| **UGR-GAN65**| UGREEN 65W GaN 3-Port Charger | Ugreen | Chargers | $32.00 | $20.00 | 12 months | 5 units |
| **SONY-WHCH**| Sony WH-CH520 Headphones | Sony | Headphones | $49.00 | $34.00 | 12 months | 4 units |

---

## ⚙️ Core Business Rules & Formulas

### 1. The Multi-Branch Inventory Formula
$$\text{Available Stock} = \text{On Hand} - \text{Reserved} - \text{Damaged}$$
- **On Hand**: Physical units located inside the branch/warehouse building.
- **Reserved**: Units allocated to confirmed, unfulfilled online orders (delivery or branch pickup). Reserved units cannot be sold to walk-in POS customers.
- **Damaged**: Defective units isolated from sale (customer returns, broken pins, damaged-in-transit).
- **Available**: The actual sellable quantity shown to online customers and POS cashiers. Available stock is strictly prevented from becoming negative.

### 2. Procurement Stock Rule
> **Creating a Purchase Order does NOT increase inventory.**  
> When a procurement officer generates a PO, goods have not yet arrived. Stock only increases when authorized inventory staff physically inspects the shipment, counts accepted units, isolates damaged units, and confirms the receiving receipt.

### 3. Customer Returns & RMA Rule
> **Returned products do NOT automatically re-enter available stock.**  
> All returned products enter a *Pending Inspection* state. If staff verifies the product is unopened/sellable, it is returned to active stock. If the product is verified defective/damaged, it is written off to damaged inventory.

---

## 🎯 Step-by-Step Demonstration Workflows

You can present these 7 business workflows to teammates, mentors, and prospective customers:

### Workflow A: Walk-in Cashier Purchase
1. Switch demo role to **Sopheak Lim (Cashier)** &rarr; Lands on `pos.html`.
2. Notice header displays **Phnom Penh Central (B001)** and live branch stock pills on product cards.
3. Type `ANK-20W` or click **Anker 20W USB-C Charger** to add to active ticket.
4. Click **Apply Discount** &rarr; apply `$2.00 Off`.
5. Click **Charge & Print Receipt** &rarr; Select **Cash** &rarr; Tender `$20.00` &rarr; Notice live change calculation (`$4.00`).
6. Click **Complete Sale & Print** &rarr; A realistic 80mm thermal receipt displays with branch phone, VAT TIN, cashier name, and breakdown.
7. Click **Print Thermal Receipt** to trigger browser print dialog.
8. Switch to **admin.html** &rarr; Notice revenue increased, B001 stock decreased, and the sale appears in *Recent Transactions*.

### Workflow B: Online Order & Stock Reservation
1. Switch demo role to **Demo Customer** &rarr; Open `store.html`.
2. Add **UGREEN 65W GaN Charger** and **Baseus USB-C Cable** to bag.
3. Open Bag &rarr; Click **Proceed to Checkout**.
4. Choose **Home Delivery (+$2.00)** &rarr; Select **Phnom Penh Central (B001)** as fulfillment origin &rarr; Select **Bakong KHQR (Simulated)**.
5. Click **Confirm & Place Order** &rarr; Order `ORD-2026-xxx` is generated.
6. Notice that B001 available stock drops immediately, but on-hand stock remains unchanged because goods are *reserved*.
7. Switch to **Mony Chhay (Fulfillment Staff)** on `admin.html` &rarr; Navigate to **Fulfillment Station**.
8. Open the picking checklist &rarr; click **Dispatch Order**.
9. The reservation is fulfilled, and physical on-hand stock is decremented.

### Workflow C: Click & Collect Store Pickup
1. On `store.html`, add **Logitech M185 Mouse** to cart.
2. At checkout, select **Store Pickup (Free)** &rarr; Select **Sen Sok (B003)**.
3. Order is submitted.
4. Staff at Sen Sok receives alert, picks product, and clicks **Ready for Pickup**.
5. Customer opens **Track Order** &rarr; sees status updated to *Ready for Pickup*. Staff confirms customer handover &rarr; status becomes *Completed*.

### Workflow D: Supplier Purchase Order & Goods Receiving
1. Switch to **Vuthy Kim (Procurement Staff)** on `admin.html` &rarr; Navigate to **Procurement & PO**.
2. Click **Create Purchase Order** &rarr; Supplier: *Tech Distribution Co.* &rarr; Destination: *WH001 Central Warehouse* &rarr; Add 40 chargers ($440).
3. Status is *Pending Approval*. Notice warehouse stock **has NOT changed**.
4. Switch to **Chantha Sok (Head Office Admin)** &rarr; Click **Approve PO**.
5. Switch to **Rina Touch (Inventory Staff)** &rarr; Click **Receive Goods**.
6. Enter `38` accepted units and `2` damaged units. Confirm receiving.
7. Warehouse on-hand increases by exactly 38 units, and 2 units are logged to damaged inventory.

### Workflow E: Inter-Branch Stock Transfer
1. Sen Sok (B003) is low on Logitech mice (only 5 left), while Toul Kork (B002) has 9 units.
2. Manager creates transfer request `TRF-2026-xxx` to move 5 units from Toul Kork to Sen Sok.
3. Head Office approves the transfer.
4. Toul Kork staff marks **Dispatch (In-Transit)** &rarr; Toul Kork stock decreases by 5.
5. Sen Sok staff confirms **Receive Goods** &rarr; Sen Sok stock increases from 5 to 10. Transfer status becomes *Completed*.

### Workflow F: Customer Return RMA & Inspection
1. Open **Returns & Warranty** on `admin.html`.
2. Click **New Return / RMA Case** for order `ORD-2026-003` (Baseus Cable).
3. Staff selects **Inspect & Resolve**:
   - Case 1: *Passed inspection (unopened)* &rarr; Restock to Sellable Inventory &rarr; stock increases by 1.
   - Case 2: *Defective pins* &rarr; Write-off to Damaged Inventory &rarr; damaged stock increases by 1.
4. Simulated refund of `$6.50` is approved and credited.

### Workflow G: AI Business Advisor
1. In `admin.html`, click the top-right **AI Business Advisor** button.
2. The slide-out drawer opens. Tap **"Which branch has the lowest inventory?"**.
3. AI analyzes the *actual live stock levels* in memory and lists branches with critical shortages.
4. Tap **"Which branches need stock transfers?"** &rarr; AI identifies that Sen Sok is low and recommends moving units from a surplus branch.
5. Click **"Create Recommended Draft Transfer"** directly inside the AI response &rarr; The transfer modal opens pre-filled with the exact recommended branches, SKU, and quantities!

### Workflow H: Bakong KHQR Payment Simulation (POS & Online Store)
1. **At Branch POS (`pos.html`)**:
   - Add products to the ticket &rarr; Click **Charge & Print Receipt**.
   - Select **Bakong KHQR** (highlighted as primary digital method).
   - Authentic National Bank of Cambodia red header (`KHQR`) card appears with merchant name, branch city, dynamic currency display in USD & KHR (1 USD = 4,100 KHR), and a live 3-minute scan countdown.
   - Click **Simulate Successful Payment** &rarr; sale completes, inventory decrements, and thermal receipt includes the official KHQR transaction reference.
2. **At Online Store (`store.html`)**:
   - Add items to bag &rarr; Proceed to checkout &rarr; Select **Bakong KHQR**.
   - Order is created in **Pending Payment** status and stock is reserved (preventing overselling).
   - Dedicated KHQR payment modal displays with full test controls.
   - Click **Simulate Expire / Fail** &rarr; order cancels and stock reservation is automatically released back to available inventory.
   - Retry checkout and click **Simulate Successful Payment** &rarr; order confirms, payment marks as Paid, and order moves to the fulfillment station.
3. **In Management Dashboard (`admin.html`)**:
   - Navigate to **Payments & KHQR** submodule.
   - View the live **Payment Transactions Ledger** with filterable statuses (`Pending`, `Paid`, `Failed`, `Expired`, `Refunded`) and search by reference.
   - Switch to **Branch Merchant Profiles** tab to configure mock Bakong Account IDs, merchant display names, and expiration timers per branch.

---

## 🇰🇭 Bakong KHQR Payment System

The platform integrates a complete, unified Bakong KHQR payment experience across both customer-facing e-commerce and in-store cashier registers:

### 1. Dual-Currency Engine (USD & KHR)
- Cambodian commerce runs heavily on dual currencies. SmartRetail AI models an accurate fixed conversion rate:
  $$\mathbf{1\text{ USD} = 4,100\text{ KHR}}$$
- The KHQR modal displays amounts in both currencies with a live 1-click toggle, calculating exact Riel amounts (`៛`) and Dollar equivalents.

### 2. POS Bakong Payment Experience
- Cashiers select the **Bakong KHQR** payment tab.
- Displays branch-specific merchant details (e.g. `SMARTRETAIL CENTRAL`, `smartretail_pp_central@aclb`, Phnom Penh).
- Includes clearly labeled simulation buttons:
  - `Simulate Successful Payment` (emulates banking app push notification & approval).
  - `Simulate Failed Payment` (emulates customer cancel/rejection in app).
  - `Simulate Payment Expiration` (emulates timeout).
- Upon success, transaction reference `TXN-KHQR-xxx` is bound to the POS sale and printed on the 80mm receipt.

### 3. Online E-Commerce KHQR Experience
- When an online customer places an order with Bakong KHQR:
  1. An order is created with `Pending Payment` status.
  2. Stock is immediately **reserved** (Available drops, On-Hand remains intact).
  3. A dedicated KHQR checkout modal opens with a live 180s countdown timer.
  4. **Payment Success**: Status becomes `Paid`, order becomes `Confirmed`, and order appears in the fulfillment station.
  5. **Payment Failure or Expiry**: Status becomes `Failed` or `Expired`, and the reserved stock is **automatically released back to available inventory**!

### 4. Enterprise Payment Management (`admin.html`)
- **Transactions Ledger**: Multi-column filterable audit log tracking Payment ID, Order ID, Branch, Customer, Payment Method, USD/KHR Amount, Transaction Reference, Status, and Timestamps.
- **Branch Merchant Profiles**: Allows managers to inspect and configure Bakong account IDs, merchant display names, merchant cities, and countdown expiration durations for each branch.

---

---

## 📁 Project Folder Structure

```
smartretail-ai/
├── index.html                  # Platform showcase portal & demo workflow launcher
├── store.html                  # Customer e-commerce shopping storefront
├── admin.html                  # Enterprise management SaaS operations dashboard
├── pos.html                    # Branch cashier point-of-sale terminal
├── login.html                  # Dedicated demo login & role showcase screen
├── README.md                   # Complete architectural and workflow documentation
│
├── css/
│   ├── variables.css           # Design tokens, color palette, typography scale, shadows
│   ├── global.css              # Reset, utility classes, status pills, simulation badges
│   ├── components.css          # Buttons, form controls, cards, data tables, modals, toasts
│   ├── store.css               # Storefront styles (hero, product cards, cart drawer, tracking)
│   ├── admin.css               # Management layout, sidebar, KPI cards, charts, AI drawer
│   ├── pos.css                 # Touch-friendly POS layout, active ticket, thermal receipt print
│   └── responsive.css          # Breakpoints for mobile, tablet, and high-res desktops
│
└── js/
    ├── data/
    │   └── initial-data.js     # Master initial mock data (Cambodian branches, products, users)
    ├── core/
    │   ├── event-bus.js        # Pub/Sub event bus & window 'storage' cross-tab synchronizer
    │   ├── state-manager.js    # Central state store with LocalStorage persistence & subscribers
    │   └── auth.js             # RBAC service with 10 demo users and role routing
    ├── services/
    │   ├── inventory-service.js# Formula Available = OnHand - Reserved - Damaged & audit trail
    │   ├── payment-service.js  # Bakong KHQR, USD/KHR rates, payment lifecycle & merchant config
    │   ├── sales-service.js    # POS transactions, receipt generation, cashier sales register
    │   ├── order-service.js    # Online orders, delivery/pickup allocation, status pipeline
    │   ├── transfer-service.js # Inter-branch transfer requests, approvals, dispatch, receiving
    │   ├── purchase-service.js # Supplier PO generation, approvals, receiving into warehouse
    │   ├── customer-service.js # Customer CRM, lifetime spending metrics, order history
    │   ├── return-service.js   # RMA inspection, sellable vs. damaged restock, refund processing
    │   ├── report-service.js   # Financial KPIs (revenue, COGS, profit margin), CSV export
    │   └── ai-service.js       # Live state querying assistant, demand forecast, anomaly alerts
    ├── components/
    │   ├── icons.js            # Crisp vector SVG icon helper
    │   ├── toast.js            # Status toast notification manager
    │   ├── modal.js            # Modal dialogs and confirmation popups
    │   └── demo-bar.js         # Universal bottom-right floating demo toolbar
    └── apps/
        ├── store-app.js        # Customer storefront catalog, cart, checkout, tracking logic
        ├── admin-app.js        # Admin dashboard, 15 submodules, dynamic Chart.js charts
        └── pos-app.js          # Branch POS terminal, barcode scan, KHQR tender, receipt print
```

---

## 🔒 Simulated Features Disclaimer & Limitations

This software is a **frontend prototype** built for demonstration and requirement verification:
- **Simulated Payment**: Bakong KHQR, Credit Card swipe, and Cash payments are simulated locally. No real financial credentials or banking APIs are called.
- **Simulated AI Advisor**: The conversational AI assistant runs a deterministic local analysis against live `LocalStorage` state. No external LLM API key or cloud infrastructure is required.
- **Simulated Notifications**: Real-time alerts (low stock, incoming orders, pending transfers) are generated dynamically based on state mutations.
- **Backend Readiness**: The JavaScript services (`inventory-service.js`, `order-service.js`, `sales-service.js`, etc.) are structured with clean async method signatures so they can easily be hooked up to a future **Java Spring Boot REST API** and SQL database.

---

## 👥 Credits & Presentation Notes
- **Project Name**: SmartRetail AI – Multi-Branch Retail Management Platform
- **Target Audience**: University Mentors, Teammates, Retail Business Stakeholders, Potential Customers.
- **Demonstration Device**: Recommended on Google Chrome or Microsoft Edge at 1080p or 1440p resolution for management/POS, and responsive mobile view for the customer storefront.

