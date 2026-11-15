/**
 * SmartRetail AI - Initial Master Mock Data
 * Realistic Cambodian Electronics Accessories Retail Business
 */

const INITIAL_BRANCHES = [
  {
    id: 'B001',
    name: 'Phnom Penh Central',
    type: 'retail',
    phone: '023-991-001',
    email: 'pp.central@smartretail.kh',
    address: 'Preah Monivong Blvd, Sangkat Phsar Thmey 1, Khan Doun Penh, Phnom Penh',
    manager: 'Lina Vann',
    employeesCount: 8,
    status: 'Active',
    openingHours: '08:00 AM - 09:00 PM'
  },
  {
    id: 'B002',
    name: 'Toul Kork',
    type: 'retail',
    phone: '023-991-002',
    email: 'toulkork@smartretail.kh',
    address: 'Street 315, Sangkat Boeng Kak 1, Khan Toul Kork, Phnom Penh',
    manager: 'Kosal Seng',
    employeesCount: 6,
    status: 'Active',
    openingHours: '08:30 AM - 08:30 PM'
  },
  {
    id: 'B003',
    name: 'Sen Sok',
    type: 'retail',
    phone: '023-991-003',
    email: 'sensok@smartretail.kh',
    address: 'Street 1003, Near AEON Mall Sen Sok City, Khan Sen Sok, Phnom Penh',
    manager: 'Dara Chea',
    employeesCount: 5,
    status: 'Active',
    openingHours: '09:00 AM - 09:30 PM'
  },
  {
    id: 'B004',
    name: 'Siem Reap',
    type: 'retail',
    phone: '063-991-004',
    email: 'siemreap@smartretail.kh',
    address: 'Sivutha Blvd, Svay Dangkum, Siem Reap',
    manager: 'Boramy Hang',
    employeesCount: 5,
    status: 'Active',
    openingHours: '08:30 AM - 08:30 PM'
  },
  {
    id: 'WH001',
    name: 'Central Warehouse',
    type: 'warehouse',
    phone: '023-991-000',
    email: 'warehouse@smartretail.kh',
    address: 'National Road 4, Sangkat Chaom Chau, Khan Pur Senchey, Phnom Penh',
    manager: 'Vong Savath',
    employeesCount: 14,
    status: 'Active',
    openingHours: '07:30 AM - 06:00 PM'
  }
];

const INITIAL_PRODUCTS = [
  {
    id: 'PROD-001',
    sku: 'IP16-PM-256',
    barcode: '195949010011',
    name: 'Apple iPhone 16 Pro Max 256GB Desert Titanium',
    brand: 'Apple',
    category: 'Smartphones',
    sellingPrice: 1299.00,
    costPrice: 1080.00,
    warranty: '12 months official',
    reorderLevel: 2,
    status: 'Active',
    rating: 4.9,
    reviewsCount: 382,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    description: 'Forged in titanium with the boundary-breaking A18 Pro chip, 48MP Fusion camera with 5x Telephoto optical zoom, Camera Control button, and industry-leading battery life.',
    specs: {
      'Chip': 'Apple A18 Pro with 6-core GPU',
      'Display': '6.9" Super Retina XDR OLED (120Hz ProMotion)',
      'Camera': '48MP Main + 48MP Ultra Wide + 12MP 5x Telephoto',
      'Capacity': '256GB NVMe',
      'Finish': 'Desert Titanium'
    }
  },
  {
    id: 'PROD-002',
    sku: 'SAM-S24U-512',
    barcode: '880609501012',
    name: 'Samsung Galaxy S24 Ultra 512GB Titanium Gray',
    brand: 'Samsung',
    category: 'Smartphones',
    sellingPrice: 1249.00,
    costPrice: 1020.00,
    warranty: '12 months official',
    reorderLevel: 2,
    status: 'Active',
    rating: 4.9,
    reviewsCount: 315,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    description: 'Galaxy AI is here. Durable titanium frame, embedded S Pen, 200MP camera system with ProVisual AI engine, and vibrant flat 6.8" Dynamic AMOLED 2X display.',
    specs: {
      'Processor': 'Snapdragon 8 Gen 3 for Galaxy',
      'Display': '6.8" QHD+ Flat Dynamic AMOLED 2X (2600 nits)',
      'Camera': '200MP + 50MP 5x + 10MP 3x + 12MP Ultra-wide',
      'Memory & Storage': '12GB RAM / 512GB UFS 4.0',
      'Color': 'Titanium Gray'
    }
  },
  {
    id: 'PROD-003',
    sku: 'MBP-16-M3',
    barcode: '195949010013',
    name: 'Apple MacBook Pro 16" M3 Max (36GB / 1TB SSD)',
    brand: 'Apple',
    category: 'Laptops',
    sellingPrice: 2799.00,
    costPrice: 2380.00,
    warranty: '12 months official',
    reorderLevel: 1,
    status: 'Active',
    rating: 5.0,
    reviewsCount: 194,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    description: 'Pure performance powerhouse for extreme workflows. Powered by the M3 Max chip with 14-core CPU and 30-core GPU, stunning Liquid Retina XDR display, and up to 22 hours battery.',
    specs: {
      'Processor': 'Apple M3 Max (14-core CPU, 30-core GPU)',
      'Memory': '36GB Unified Memory',
      'Storage': '1TB PCIe Gen4 SSD',
      'Display': '16.2" Liquid Retina XDR (1600 nits peak HDR)',
      'Color': 'Space Black'
    }
  },
  {
    id: 'PROD-004',
    sku: 'MBA-15-M3',
    barcode: '195949010014',
    name: 'Apple MacBook Air 15" M3 (16GB / 512GB SSD)',
    brand: 'Apple',
    category: 'Laptops',
    sellingPrice: 1499.00,
    costPrice: 1260.00,
    warranty: '12 months official',
    reorderLevel: 1,
    status: 'Active',
    rating: 4.8,
    reviewsCount: 228,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
    description: 'Impossibly thin 11.5mm aluminum chassis with an expansive 15.3-inch Liquid Retina screen, blazing-fast M3 performance, MagSafe 3 charging, and fanless silent design.',
    specs: {
      'Processor': 'Apple M3 8-core CPU / 10-core GPU',
      'Memory': '16GB Unified Memory',
      'Storage': '512GB SSD',
      'Battery Life': 'Up to 18 Hours',
      'Color': 'Midnight'
    }
  },
  {
    id: 'PROD-005',
    sku: 'IP16-128',
    barcode: '195949010015',
    name: 'Apple iPhone 16 128GB Ultramarine',
    brand: 'Apple',
    category: 'Smartphones',
    sellingPrice: 899.00,
    costPrice: 750.00,
    warranty: '12 months official',
    reorderLevel: 2,
    status: 'Active',
    rating: 4.8,
    reviewsCount: 172,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
    description: 'Equipped with Apple-designed A18 chip, Camera Control, 48MP Fusion 2-in-1 camera with 2x optical quality zoom, Action button, and vibrant color-infused back glass.',
    specs: {
      'Chip': 'Apple A18 with 5-core GPU',
      'Display': '6.1" Super Retina XDR OLED',
      'Camera': '48MP Fusion + 12MP Ultra Wide with macro',
      'Capacity': '128GB NVMe',
      'Color': 'Ultramarine'
    }
  },
  {
    id: 'PROD-006',
    sku: 'SAM-ZFOLD6',
    barcode: '880609501016',
    name: 'Samsung Galaxy Z Fold 6 256GB Silver Shadow',
    brand: 'Samsung',
    category: 'Smartphones',
    sellingPrice: 1699.00,
    costPrice: 1420.00,
    warranty: '12 months official',
    reorderLevel: 1,
    status: 'Active',
    rating: 4.7,
    reviewsCount: 110,
    image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80',
    description: 'Unfold PC-like power in your pocket. Symmetrical dual-rail hinge, Galaxy AI live translation and note assist, and expansive 7.6" Dynamic AMOLED 2X canvas.',
    specs: {
      'Main Display': '7.6" QXGA+ Dynamic AMOLED 2X (2600 nits)',
      'Cover Screen': '6.3" Dynamic AMOLED 2X',
      'RAM & Storage': '12GB RAM / 256GB UFS 4.0',
      'Durability': 'Enhanced Armor Aluminum & IP48',
      'Color': 'Silver Shadow'
    }
  },
  {
    id: 'PROD-007',
    sku: 'APP-AIRPODS2',
    barcode: '195949010017',
    name: 'Apple AirPods Pro (2nd Gen) with MagSafe USB-C',
    brand: 'Apple',
    category: 'Audio & Wearables',
    sellingPrice: 249.00,
    costPrice: 190.00,
    warranty: '12 months official',
    reorderLevel: 3,
    status: 'Active',
    rating: 4.9,
    reviewsCount: 412,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    description: 'Up to 2x more Active Noise Cancellation with Apple H2 chip, Adaptive Audio, Transparency mode, Personalized Spatial Audio, and MagSafe USB-C charging case.',
    specs: {
      'Audio Processor': 'Apple H2 Headphone Chip',
      'Battery Life': 'Up to 6 hours (30 hours with case)',
      'Connector': 'USB-C / MagSafe / Qi Wireless',
      'Resistance': 'IP54 dust, sweat, and water resistant'
    }
  },
  {
    id: 'PROD-008',
    sku: 'SAM-BUDS3P',
    barcode: '880609501018',
    name: 'Samsung Galaxy Buds 3 Pro Blade Silver',
    brand: 'Samsung',
    category: 'Audio & Wearables',
    sellingPrice: 219.00,
    costPrice: 165.00,
    warranty: '12 months official',
    reorderLevel: 2,
    status: 'Active',
    rating: 4.7,
    reviewsCount: 164,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    description: 'Aerodynamic blade design with dynamic Blade Lights, 24-bit 96kHz Hi-Fi sound with dual amplifiers, adaptive noise control, and Galaxy AI interpreter mode.',
    specs: {
      'Sound System': 'Enhanced 2-way with planar tweeter & dynamic woofer',
      'Bluetooth': 'v5.4 with SSC (Samsung Seamless Codec)',
      'Battery Life': 'Up to 30 Hours total playtime',
      'Finish': 'Blade Silver'
    }
  },
  {
    id: 'PROD-009',
    sku: 'APP-MAGSAFE',
    barcode: '195949010019',
    name: 'Apple MagSafe 15W Qi2 Fast Wireless Charger',
    brand: 'Apple',
    category: 'Chargers & Power',
    sellingPrice: 39.00,
    costPrice: 26.00,
    warranty: '12 months official',
    reorderLevel: 5,
    status: 'Active',
    rating: 4.8,
    reviewsCount: 295,
    image: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=800&q=80',
    description: 'Official Apple snap-on wireless charger featuring perfectly aligned magnets for iPhone 12 through 16 models and AirPods. Fast wireless charging up to 15W with braided cable.',
    specs: {
      'Power Rating': '15W Fast Wireless (Qi2 certified)',
      'Cable Length': '1.0 Meter Braided Woven USB-C',
      'Compatibility': 'iPhone 16, 15, 14, 13, 12 & AirPods',
      'Material': 'Anodized Aluminum & Soft-touch pad'
    }
  },
  {
    id: 'PROD-010',
    sku: 'APP-MAGIC-KB',
    barcode: '195949010020',
    name: 'Apple Magic Keyboard with Touch ID & Keypad',
    brand: 'Apple',
    category: 'Accessories',
    sellingPrice: 179.00,
    costPrice: 135.00,
    warranty: '12 months official',
    reorderLevel: 2,
    status: 'Active',
    rating: 4.9,
    reviewsCount: 153,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    description: 'Wireless Bluetooth keyboard with Touch ID providing fast, secure logins and purchases. Full extended layout with numeric keypad and document navigation keys.',
    specs: {
      'Security': 'Integrated Touch ID biometric sensor',
      'Connectivity': 'Bluetooth Low Energy & USB-C to Lightning',
      'Battery': 'Rechargeable Lithium-ion (1 month+ per charge)',
      'Finish': 'Silver Aluminum with White Keys'
    }
  },
  {
    id: 'PROD-011',
    sku: 'ANK-PRIME-250',
    barcode: '195949010021',
    name: 'Anker Prime 250W 27,650mAh Power Bank (PowerCore)',
    brand: 'Anker',
    category: 'Chargers & Power',
    sellingPrice: 149.00,
    costPrice: 105.00,
    warranty: '18 months official',
    reorderLevel: 2,
    status: 'Active',
    rating: 4.9,
    reviewsCount: 218,
    image: 'https://images.unsplash.com/photo-1609592424368-80b62e49d682?auto=format&fit=crop&w=800&q=80',
    description: 'Massive 250W multi-device fast battery pack with smart color digital display, Bluetooth companion app monitoring, and 140W single-port charging to fast-charge MacBook Pros.',
    specs: {
      'Capacity': '27,650 mAh / 99.54Wh (TSA Carry-on Approved)',
      'Total Output': '250W Max across 2x USB-C + 1x USB-A',
      'Display': 'Color TFT Real-time Telemetry Screen',
      'App Control': 'Anker App Bluetooth Sound/Locate'
    }
  },
  {
    id: 'PROD-012',
    sku: 'UGR-GAN100',
    barcode: '195949010022',
    name: 'UGREEN Nexode 100W GaN 4-Port Fast Desktop Charger',
    brand: 'Ugreen',
    category: 'Chargers & Power',
    sellingPrice: 59.00,
    costPrice: 38.00,
    warranty: '12 months official',
    reorderLevel: 3,
    status: 'Active',
    rating: 4.8,
    reviewsCount: 147,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    description: 'Next-gen GaN II fast desktop & travel charging hub. Power 2 MacBooks and 2 smartphones simultaneously with intelligent Power Dispenser thermal safety.',
    specs: {
      'Total Output': '100W Max PD 3.0 / PPS / QC 4+',
      'Ports': '3x USB-C + 1x USB-A',
      'Technology': 'GaN Fast II Semiconductor',
      'Safety': 'Thermal Guard 800 scans/sec temperature check'
    }
  },
  {
    id: 'PROD-013',
    sku: 'SPG-IP16-ULTRA',
    barcode: '195949010023',
    name: 'Spigen iPhone 16 Pro Max Ultra Hybrid MagFit Case',
    brand: 'Spigen',
    category: 'Accessories',
    sellingPrice: 29.00,
    costPrice: 14.00,
    warranty: '6 months',
    reorderLevel: 5,
    status: 'Active',
    rating: 4.8,
    reviewsCount: 189,
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80',
    description: 'Crystal-clear anti-yellowing PC back with shock-absorbing TPU bumper. Military-grade air cushion corners and strong embedded N52 MagSafe magnetic ring.',
    specs: {
      'Compatibility': 'Apple iPhone 16 Pro Max (6.9")',
      'Protection': 'Military Drop Tested (MIL-STD 810G-516.6)',
      'MagSafe': 'Built-in Magnetic Ring (Fast Alignment)',
      'Color': 'Crystal Clear'
    }
  },
  {
    id: 'PROD-014',
    sku: 'BAS-BLADE-100',
    barcode: '195949010024',
    name: 'Baseus Blade 100W Ultra-Thin Laptop Power Bank 20000mAh',
    brand: 'Baseus',
    category: 'Chargers & Power',
    sellingPrice: 79.00,
    costPrice: 52.00,
    warranty: '12 months',
    reorderLevel: 2,
    status: 'Active',
    rating: 4.7,
    reviewsCount: 135,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    description: 'Razor-thin 18mm laptop companion battery pack. Slips flat into any laptop sleeve with dual 100W Type-C ports, dual USB-A, and precision digital power status readout.',
    specs: {
      'Capacity': '20,000 mAh (74Wh)',
      'Thickness': '18mm Ultra-slim flat design',
      'Power Delivery': '100W Two-way Fast Charge',
      'Display': 'Digital percentage, remaining time & power'
    }
  },
  {
    id: 'PROD-015',
    sku: 'ANK-20W',
    barcode: '880928371011',
    name: 'Anker Nano Pro 20W USB-C Fast Charger',
    brand: 'Anker',
    category: 'Chargers & Power',
    sellingPrice: 18.00,
    costPrice: 11.00,
    warranty: '12 months',
    reorderLevel: 3,
    status: 'Active',
    rating: 4.8,
    reviewsCount: 142,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    description: 'Ultra-compact PowerPort III Nano 20W USB-C wall charger with PowerIQ 3.0 technology for high-speed charging of smartphones and tablets.',
    specs: {
      'Output': '5V=3A / 9V=2.22A (20W Max)',
      'Dimensions': '28 x 28 x 40 mm',
      'Color': 'Arctic White'
    }
  },
  {
    id: 'PROD-016',
    sku: 'BAS-C1M',
    barcode: '880928371012',
    name: 'Baseus 100W Braided USB-C Cable (1.2m)',
    brand: 'Baseus',
    category: 'Accessories',
    sellingPrice: 8.50,
    costPrice: 3.50,
    warranty: '6 months',
    reorderLevel: 4,
    status: 'Active',
    rating: 4.6,
    reviewsCount: 98,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    description: 'High-density braided nylon USB-C to USB-C cable supporting 100W Power Delivery fast charging and 480Mbps data sync.',
    specs: {
      'Length': '1.2 Meters',
      'Power Rating': '100W PD (20V/5A)',
      'Material': 'Zinc Alloy + Braided Nylon'
    }
  },
  {
    id: 'PROD-017',
    sku: 'JBL-520',
    barcode: '880928371013',
    name: 'JBL Tune 520BT Wireless Headphones',
    brand: 'JBL',
    category: 'Audio & Wearables',
    sellingPrice: 39.00,
    costPrice: 27.00,
    warranty: '12 months',
    reorderLevel: 3,
    status: 'Active',
    rating: 4.9,
    reviewsCount: 215,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    description: 'Wireless on-ear headphones with legendary JBL Pure Bass Sound, Bluetooth 5.3, hands-free calls, and up to 57 hours of playtime.',
    specs: {
      'Battery Life': 'Up to 57 Hours',
      'Quick Charge': '5 mins = 3 hours playback',
      'Bluetooth': 'Version 5.3'
    }
  },
  {
    id: 'PROD-018',
    sku: 'LOG-M185',
    barcode: '880928371014',
    name: 'Logitech M185 Wireless Nano Optical Mouse',
    brand: 'Logitech',
    category: 'Accessories',
    sellingPrice: 15.00,
    costPrice: 9.00,
    warranty: '12 months',
    reorderLevel: 3,
    status: 'Active',
    rating: 4.7,
    reviewsCount: 310,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    description: 'Reliable plug-and-play wireless mouse with nano USB receiver, 1-year battery life, and smooth optical tracking.',
    specs: {
      'Sensor': 'Smooth Optical Tracking 1000 DPI',
      'Connection': '2.4 GHz USB Receiver'
    }
  }
];

// Initial inventory state across branches
// Structure: inventory[sku][branchId] = { onHand, reserved, damaged }
const INITIAL_INVENTORY = {
  'IP16-PM-256': {
    'B001': { onHand: 8, reserved: 0, damaged: 0 },
    'B002': { onHand: 5, reserved: 0, damaged: 0 },
    'B003': { onHand: 3, reserved: 0, damaged: 0 },
    'B004': { onHand: 4, reserved: 0, damaged: 0 },
    'WH001': { onHand: 25, reserved: 0, damaged: 0 }
  },
  'SAM-S24U-512': {
    'B001': { onHand: 6, reserved: 0, damaged: 0 },
    'B002': { onHand: 4, reserved: 0, damaged: 0 },
    'B003': { onHand: 2, reserved: 0, damaged: 0 },
    'B004': { onHand: 3, reserved: 0, damaged: 0 },
    'WH001': { onHand: 20, reserved: 0, damaged: 0 }
  },
  'MBP-16-M3': {
    'B001': { onHand: 4, reserved: 0, damaged: 0 },
    'B002': { onHand: 3, reserved: 0, damaged: 0 },
    'B003': { onHand: 1, reserved: 0, damaged: 0 },
    'B004': { onHand: 2, reserved: 0, damaged: 0 },
    'WH001': { onHand: 12, reserved: 0, damaged: 0 }
  },
  'MBA-15-M3': {
    'B001': { onHand: 7, reserved: 0, damaged: 0 },
    'B002': { onHand: 5, reserved: 0, damaged: 0 },
    'B003': { onHand: 2, reserved: 0, damaged: 0 },
    'B004': { onHand: 4, reserved: 0, damaged: 0 },
    'WH001': { onHand: 18, reserved: 0, damaged: 0 }
  },
  'IP16-128': {
    'B001': { onHand: 10, reserved: 0, damaged: 0 },
    'B002': { onHand: 7, reserved: 0, damaged: 0 },
    'B003': { onHand: 4, reserved: 0, damaged: 0 },
    'B004': { onHand: 6, reserved: 0, damaged: 0 },
    'WH001': { onHand: 30, reserved: 0, damaged: 0 }
  },
  'SAM-ZFOLD6': {
    'B001': { onHand: 3, reserved: 0, damaged: 0 },
    'B002': { onHand: 2, reserved: 0, damaged: 0 },
    'B003': { onHand: 1, reserved: 0, damaged: 0 },
    'B004': { onHand: 2, reserved: 0, damaged: 0 },
    'WH001': { onHand: 10, reserved: 0, damaged: 0 }
  },
  'APP-AIRPODS2': {
    'B001': { onHand: 16, reserved: 0, damaged: 0 },
    'B002': { onHand: 11, reserved: 0, damaged: 0 },
    'B003': { onHand: 5, reserved: 0, damaged: 0 },
    'B004': { onHand: 8, reserved: 0, damaged: 0 },
    'WH001': { onHand: 45, reserved: 0, damaged: 0 }
  },
  'SAM-BUDS3P': {
    'B001': { onHand: 12, reserved: 0, damaged: 0 },
    'B002': { onHand: 8, reserved: 0, damaged: 0 },
    'B003': { onHand: 3, reserved: 0, damaged: 0 },
    'B004': { onHand: 6, reserved: 0, damaged: 0 },
    'WH001': { onHand: 35, reserved: 0, damaged: 0 }
  },
  'APP-MAGSAFE': {
    'B001': { onHand: 25, reserved: 0, damaged: 0 },
    'B002': { onHand: 18, reserved: 0, damaged: 0 },
    'B003': { onHand: 8, reserved: 0, damaged: 0 },
    'B004': { onHand: 14, reserved: 0, damaged: 0 },
    'WH001': { onHand: 70, reserved: 0, damaged: 0 }
  },
  'APP-MAGIC-KB': {
    'B001': { onHand: 8, reserved: 0, damaged: 0 },
    'B002': { onHand: 5, reserved: 0, damaged: 0 },
    'B003': { onHand: 2, reserved: 0, damaged: 0 },
    'B004': { onHand: 4, reserved: 0, damaged: 0 },
    'WH001': { onHand: 22, reserved: 0, damaged: 0 }
  },
  'ANK-PRIME-250': {
    'B001': { onHand: 9, reserved: 0, damaged: 0 },
    'B002': { onHand: 6, reserved: 0, damaged: 0 },
    'B003': { onHand: 2, reserved: 0, damaged: 0 },
    'B004': { onHand: 4, reserved: 0, damaged: 0 },
    'WH001': { onHand: 24, reserved: 0, damaged: 0 }
  },
  'UGR-GAN100': {
    'B001': { onHand: 14, reserved: 0, damaged: 0 },
    'B002': { onHand: 9, reserved: 0, damaged: 0 },
    'B003': { onHand: 4, reserved: 0, damaged: 0 },
    'B004': { onHand: 7, reserved: 0, damaged: 0 },
    'WH001': { onHand: 35, reserved: 0, damaged: 0 }
  },
  'SPG-IP16-ULTRA': {
    'B001': { onHand: 30, reserved: 0, damaged: 0 },
    'B002': { onHand: 22, reserved: 0, damaged: 0 },
    'B003': { onHand: 9, reserved: 0, damaged: 0 },
    'B004': { onHand: 15, reserved: 0, damaged: 0 },
    'WH001': { onHand: 60, reserved: 0, damaged: 0 }
  },
  'BAS-BLADE-100': {
    'B001': { onHand: 11, reserved: 0, damaged: 0 },
    'B002': { onHand: 7, reserved: 0, damaged: 0 },
    'B003': { onHand: 3, reserved: 0, damaged: 0 },
    'B004': { onHand: 5, reserved: 0, damaged: 0 },
    'WH001': { onHand: 28, reserved: 0, damaged: 0 }
  },
  'ANK-20W': {
    'B001': { onHand: 18, reserved: 0, damaged: 0 },
    'B002': { onHand: 12, reserved: 0, damaged: 0 },
    'B003': { onHand: 5, reserved: 0, damaged: 0 },
    'B004': { onHand: 8, reserved: 0, damaged: 0 },
    'WH001': { onHand: 50, reserved: 0, damaged: 0 }
  },
  'BAS-C1M': {
    'B001': { onHand: 35, reserved: 0, damaged: 0 },
    'B002': { onHand: 24, reserved: 0, damaged: 0 },
    'B003': { onHand: 3, reserved: 0, damaged: 0 },
    'B004': { onHand: 12, reserved: 0, damaged: 0 },
    'WH001': { onHand: 80, reserved: 0, damaged: 0 }
  },
  'JBL-520': {
    'B001': { onHand: 7, reserved: 0, damaged: 0 },
    'B002': { onHand: 5, reserved: 0, damaged: 0 },
    'B003': { onHand: 4, reserved: 0, damaged: 0 },
    'B004': { onHand: 2, reserved: 0, damaged: 0 },
    'WH001': { onHand: 20, reserved: 0, damaged: 0 }
  },
  'LOG-M185': {
    'B001': { onHand: 14, reserved: 0, damaged: 0 },
    'B002': { onHand: 9, reserved: 0, damaged: 0 },
    'B003': { onHand: 5, reserved: 0, damaged: 0 },
    'B004': { onHand: 6, reserved: 0, damaged: 0 },
    'WH001': { onHand: 30, reserved: 0, damaged: 0 }
  }
};

const INITIAL_CUSTOMERS = [
  {
    id: 'C001',
    name: 'Sokha Vann',
    email: 'sokha@example.com',
    phone: '010-555-101',
    address: '#45 Street 214, Sangkat Boeung Raing, Khan Doun Penh, Phnom Penh',
    totalSpent: 185.00,
    ordersCount: 4,
    returnsCount: 0,
    status: 'VIP'
  },
  {
    id: 'C002',
    name: 'Rina Chea',
    email: 'rina@example.com',
    phone: '010-555-102',
    address: '#12B Street 315, Sangkat Boeng Kak 1, Khan Toul Kork, Phnom Penh',
    totalSpent: 72.50,
    ordersCount: 2,
    returnsCount: 0,
    status: 'Regular'
  },
  {
    id: 'C003',
    name: 'Pisey Lim',
    email: 'pisey@example.com',
    phone: '010-555-103',
    address: '#78 Street 1003, Khan Sen Sok, Phnom Penh',
    totalSpent: 128.00,
    ordersCount: 3,
    returnsCount: 1,
    status: 'Regular'
  },
  {
    id: 'C004',
    name: 'Dara Touch',
    email: 'dara@example.com',
    phone: '010-555-104',
    address: '#99 Preah Sihanouk Blvd, Phnom Penh',
    totalSpent: 39.00,
    ordersCount: 1,
    returnsCount: 0,
    status: 'Regular'
  },
  {
    id: 'C005',
    name: 'Vicheka Meas',
    email: 'vicheka@example.com',
    phone: '010-555-105',
    address: '#23 Sivutha Blvd, Siem Reap',
    totalSpent: 98.00,
    ordersCount: 2,
    returnsCount: 0,
    status: 'Regular'
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-2026-006',
    orderNumber: 'ORD-2026-006',
    customerId: 'C001',
    customerName: 'Sokha Vann',
    channel: 'POS',
    fulfillmentMethod: 'In-Store',
    assignedBranch: 'B001',
    deliveryAddress: 'Walk-in Store POS',
    phone: '010-555-101',
    items: [
      { sku: 'MBP-16-M3', name: 'Apple MacBook Pro 16" M3 Max (36GB / 1TB SSD)', price: 2799.00, quantity: 1, total: 2799.00 }
    ],
    subtotal: 2799.00,
    discount: 0.00,
    deliveryFee: 0.00,
    total: 2799.00,
    paymentMethod: 'Bakong KHQR',
    paymentStatus: 'Paid',
    status: 'Completed',
    createdAt: '2026-11-15T13:15:00Z',
    timeline: [
      { status: 'Sale Completed', time: '2026-11-15 13:15', note: 'Customer scanned Bakong KHQR at Register 1' }
    ]
  },
  {
    id: 'ORD-2026-005',
    orderNumber: 'ORD-2026-005',
    customerId: 'C004',
    customerName: 'Dara Touch',
    channel: 'POS',
    fulfillmentMethod: 'In-Store',
    assignedBranch: 'B002',
    deliveryAddress: 'Walk-in Store POS',
    phone: '010-555-104',
    items: [
      { sku: 'ANK-PRIME-250', name: 'Anker Prime 250W 27,650mAh Power Bank', price: 149.00, quantity: 1, total: 149.00 },
      { sku: 'BAS-C1M', name: 'Baseus 100W Braided USB-C Cable (1.2m)', price: 8.50, quantity: 1, total: 8.50 }
    ],
    subtotal: 157.50,
    discount: 0.00,
    deliveryFee: 0.00,
    total: 157.50,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    status: 'Completed',
    createdAt: '2026-11-15T11:40:00Z',
    timeline: [
      { status: 'Sale Completed', time: '2026-11-15 11:40', note: 'Paid in cash at Toul Kork branch' }
    ]
  },
  {
    id: 'ORD-2026-004',
    orderNumber: 'ORD-2026-004',
    customerId: 'C005',
    customerName: 'Vicheka Meas',
    channel: 'POS',
    fulfillmentMethod: 'In-Store',
    assignedBranch: 'B001',
    deliveryAddress: 'Walk-in Store POS',
    phone: '010-555-105',
    items: [
      { sku: 'APP-AIRPODS2', name: 'Apple AirPods Pro (2nd Gen) with MagSafe USB-C', price: 249.00, quantity: 1, total: 249.00 },
      { sku: 'APP-MAGSAFE', name: 'Apple MagSafe 15W Qi2 Fast Wireless Charger', price: 39.00, quantity: 1, total: 39.00 }
    ],
    subtotal: 288.00,
    discount: 0.00,
    deliveryFee: 0.00,
    total: 288.00,
    paymentMethod: 'Bakong KHQR',
    paymentStatus: 'Paid',
    status: 'Completed',
    createdAt: '2026-11-15T10:15:00Z',
    timeline: [
      { status: 'Sale Completed', time: '2026-11-15 10:15', note: 'Paid via Bakong KHQR at Central branch' }
    ]
  },
  {
    id: 'ORD-2026-003',
    orderNumber: 'ORD-2026-003',
    customerId: 'C003',
    customerName: 'Pisey Lim',
    channel: 'Online',
    fulfillmentMethod: 'Delivery',
    assignedBranch: 'B002',
    deliveryAddress: '#78 Street 1003, Khan Sen Sok, Phnom Penh',
    phone: '010-555-103',
    items: [
      { sku: 'SAM-S24U-512', name: 'Samsung Galaxy S24 Ultra 512GB Titanium Gray', price: 1249.00, quantity: 1, total: 1249.00 },
      { sku: 'SAM-BUDS3P', name: 'Samsung Galaxy Buds 3 Pro Blade Silver', price: 219.00, quantity: 1, total: 219.00 }
    ],
    subtotal: 1468.00,
    discount: 20.00,
    deliveryFee: 0.00,
    total: 1448.00,
    paymentMethod: 'Bakong KHQR',
    paymentStatus: 'Paid',
    status: 'Confirmed',
    createdAt: '2026-11-15T08:20:00Z',
    timeline: [
      { status: 'Order Placed', time: '2026-11-15 08:20', note: 'Customer ordered online' },
      { status: 'Payment Confirmed', time: '2026-11-15 08:21', note: 'Bakong KHQR verified' },
      { status: 'Confirmed', time: '2026-11-15 08:25', note: 'Stock allocated at Toul Kork' }
    ]
  },
  {
    id: 'ORD-2026-002',
    orderNumber: 'ORD-2026-002',
    customerId: 'C002',
    customerName: 'Rina Chea',
    channel: 'Online',
    fulfillmentMethod: 'Pickup',
    assignedBranch: 'B001',
    deliveryAddress: 'Branch Pickup: Phnom Penh Central (B001)',
    phone: '010-555-102',
    items: [
      { sku: 'MBA-15-M3', name: 'Apple MacBook Air 15" M3 (16GB / 512GB SSD)', price: 1499.00, quantity: 1, total: 1499.00 },
      { sku: 'APP-MAGIC-KB', name: 'Apple Magic Keyboard with Touch ID & Keypad', price: 179.00, quantity: 1, total: 179.00 }
    ],
    subtotal: 1678.00,
    discount: 0.00,
    deliveryFee: 0.00,
    total: 1678.00,
    paymentMethod: 'Bakong KHQR',
    paymentStatus: 'Paid',
    status: 'Ready for Pickup',
    createdAt: '2026-11-14T14:15:00Z',
    timeline: [
      { status: 'Order Placed', time: '2026-11-14 14:15', note: 'Pickup order submitted online' },
      { status: 'Picking & Packed', time: '2026-11-14 14:40', note: 'Items packed in locker bin #4' },
      { status: 'Ready for Pickup', time: '2026-11-14 15:00', note: 'Customer notified for branch pickup' }
    ]
  },
  {
    id: 'ORD-2026-001',
    orderNumber: 'ORD-2026-001',
    customerId: 'C001',
    customerName: 'Sokha Vann',
    channel: 'Online',
    fulfillmentMethod: 'Delivery',
    assignedBranch: 'B001',
    deliveryAddress: '#45 Street 214, Khan Doun Penh, Phnom Penh',
    phone: '010-555-101',
    items: [
      { sku: 'IP16-PM-256', name: 'Apple iPhone 16 Pro Max 256GB Desert Titanium', price: 1299.00, quantity: 1, total: 1299.00 },
      { sku: 'SPG-IP16-ULTRA', name: 'Spigen iPhone 16 Pro Max Ultra Hybrid MagFit Case', price: 29.00, quantity: 1, total: 29.00 }
    ],
    subtotal: 1328.00,
    discount: 0.00,
    deliveryFee: 2.00,
    total: 1330.00,
    paymentMethod: 'Bakong KHQR',
    paymentStatus: 'Paid',
    status: 'Processing',
    createdAt: '2026-11-14T10:30:00Z',
    timeline: [
      { status: 'Order Placed', time: '2026-11-14 10:30', note: 'Customer completed online checkout' },
      { status: 'Payment Confirmed', time: '2026-11-14 10:31', note: 'Bakong KHQR verified' },
      { status: 'Processing', time: '2026-11-14 11:00', note: 'Assigned to Phnom Penh Central for fulfillment' }
    ]
  }
];

const INITIAL_PURCHASE_ORDERS = [
  {
    id: 'PO-2026-014',
    poNumber: 'PO-2026-014',
    supplier: 'Tech Distribution Co., Ltd.',
    contactPerson: 'Mr. Heng Vuthy',
    supplierPhone: '012-888-999',
    destinationBranch: 'WH001',
    expectedDate: '2026-11-20',
    status: 'Pending Approval',
    createdBy: 'Vuthy Kim (Procurement)',
    createdAt: '2026-11-14T09:00:00Z',
    items: [
      { sku: 'ANK-20W', name: 'Anker 20W USB-C Charger', unitCost: 11.00, quantity: 40, totalCost: 440.00, receivedQty: 0, damagedQty: 0 },
      { sku: 'BAS-C1M', name: 'Baseus USB-C Cable 1m', unitCost: 3.00, quantity: 60, totalCost: 180.00, receivedQty: 0, damagedQty: 0 },
      { sku: 'LOG-M185', name: 'Logitech M185 Wireless Mouse', unitCost: 9.00, quantity: 25, totalCost: 225.00, receivedQty: 0, damagedQty: 0 }
    ],
    totalAmount: 845.00,
    notes: 'Urgent restocking for Q4 holiday demand across Phnom Penh branches.'
  },
  {
    id: 'PO-2026-013',
    poNumber: 'PO-2026-013',
    supplier: 'Cambodia Mobile Accessories Supply',
    contactPerson: 'Ms. Sreyneath Keo',
    supplierPhone: '098-777-666',
    destinationBranch: 'WH001',
    expectedDate: '2026-11-12',
    status: 'Received',
    createdBy: 'Vuthy Kim (Procurement)',
    createdAt: '2026-11-08T14:00:00Z',
    receivedAt: '2026-11-12T16:20:00Z',
    items: [
      { sku: 'XIA-PB10', name: 'Xiaomi 10,000mAh Power Bank', unitCost: 15.00, quantity: 30, totalCost: 450.00, receivedQty: 30, damagedQty: 0 },
      { sku: 'IP15-CASE', name: 'iPhone 15 Clear Case', unitCost: 3.50, quantity: 50, totalCost: 175.00, receivedQty: 48, damagedQty: 2 }
    ],
    totalAmount: 625.00,
    notes: 'Batch received. 2 units of IP15-CASE arrived cracked and recorded as damaged.'
  }
];

const INITIAL_TRANSFERS = [
  {
    id: 'TRF-2026-008',
    transferNumber: 'TRF-2026-008',
    sourceBranch: 'B002',
    destinationBranch: 'B003',
    status: 'Pending Approval',
    reason: 'Sen Sok stock is low (5 units) while Toul Kork has excess available stock.',
    requestedBy: 'Dara Chea (Manager B003)',
    createdAt: '2026-11-14T15:30:00Z',
    items: [
      { sku: 'LOG-M185', name: 'Logitech M185 Wireless Mouse', requestedQty: 10, dispatchedQty: 0, receivedQty: 0 }
    ],
    approver: null,
    notes: 'Awaiting Head Office / Manager approval.'
  },
  {
    id: 'TRF-2026-007',
    transferNumber: 'TRF-2026-007',
    sourceBranch: 'WH001',
    destinationBranch: 'B001',
    status: 'Completed',
    reason: 'Standard weekly stock replenishment.',
    requestedBy: 'Lina Vann (Manager B001)',
    createdAt: '2026-11-10T09:00:00Z',
    dispatchedAt: '2026-11-11T10:00:00Z',
    receivedAt: '2026-11-11T15:30:00Z',
    items: [
      { sku: 'ANK-20W', name: 'Anker 20W USB-C Charger', requestedQty: 20, dispatchedQty: 20, receivedQty: 20 },
      { sku: 'BAS-C1M', name: 'Baseus USB-C Cable 1m', requestedQty: 30, dispatchedQty: 30, receivedQty: 30 }
    ],
    approver: 'Chantha Sok (Head Office)',
    notes: 'Received and verified in full at Phnom Penh Central.'
  }
];

const INITIAL_STOCK_MOVEMENTS = [
  {
    id: 'MOV-001',
    timestamp: '2026-11-15T09:45:00Z',
    sku: 'JBL-520',
    productName: 'JBL Tune 520BT Wireless Headphones',
    branchId: 'B001',
    type: 'Sale',
    reference: 'ORD-2026-004',
    quantityChange: -1,
    balanceAfter: 7,
    reason: 'POS Sale to walk-in customer Dara Touch',
    actor: 'Sopheak Lim (Cashier)'
  },
  {
    id: 'MOV-002',
    timestamp: '2026-11-14T10:30:00Z',
    sku: 'ANK-20W',
    productName: 'Anker 20W USB-C Charger',
    branchId: 'B001',
    type: 'Reservation',
    reference: 'ORD-2026-001',
    quantityChange: -2,
    balanceAfter: 18,
    reason: 'Online delivery order reservation',
    actor: 'Online Store System'
  },
  {
    id: 'MOV-003',
    timestamp: '2026-11-12T16:20:00Z',
    sku: 'XIA-PB10',
    productName: 'Xiaomi 10,000mAh Power Bank',
    branchId: 'WH001',
    type: 'PO Receiving',
    reference: 'PO-2026-013',
    quantityChange: +30,
    balanceAfter: 25,
    reason: 'Supplier goods accepted from Cambodia Mobile Supply',
    actor: 'Vong Savath (Warehouse Mgr)'
  }
];

const INITIAL_RETURNS = [
  {
    id: 'RET-2026-001',
    caseNumber: 'RET-2026-001',
    orderNumber: 'ORD-2026-003',
    customerId: 'C003',
    customerName: 'Pisey Lim',
    sku: 'BAS-C1M',
    productName: 'Baseus USB-C Cable 1m',
    quantity: 1,
    reason: 'Cable connector loose upon arrival',
    condition: 'Damaged / Defective',
    inspectionResult: 'Confirmed hardware fault on contact pins',
    status: 'Approved & Refunded',
    refundAmount: 6.50,
    restockDecision: 'Write-off to Damaged Inventory (Not Sellable)',
    createdAt: '2026-11-15T11:00:00Z',
    resolvedBy: 'Nita Hem (Customer Service)'
  }
];

const INITIAL_PROMOTIONS = [
  {
    code: 'SMART10',
    name: 'Launch Special 10% Off',
    type: 'percentage',
    value: 10,
    minPurchase: 20.00,
    maxDiscount: 15.00,
    startDate: '2026-11-01',
    endDate: '2026-12-31',
    usageCount: 28,
    status: 'Active'
  },
  {
    code: 'WELCOME5',
    name: 'New Customer $5 Off',
    type: 'fixed',
    value: 5.00,
    minPurchase: 30.00,
    maxDiscount: 5.00,
    startDate: '2026-11-01',
    endDate: '2026-12-31',
    usageCount: 19,
    status: 'Active'
  }
];

const INITIAL_USERS = [
  {
    id: 'USR-001',
    name: 'Admin User',
    role: 'Super Admin',
    branch: 'All',
    email: 'admin@smartretail.kh',
    phone: '012-000-001',
    status: 'Active',
    avatar: 'AU',
    description: 'Full root access to entire company configuration, financial logs, branches, and system audits.'
  },
  {
    id: 'USR-002',
    name: 'Chantha Sok',
    role: 'Head Office Admin',
    branch: 'All',
    email: 'chantha.sok@smartretail.kh',
    phone: '012-000-002',
    status: 'Active',
    avatar: 'CS',
    description: 'Company-wide operations, purchase order approvals, transfer authorization, and AI strategic planning.'
  },
  {
    id: 'USR-003',
    name: 'Lina Vann',
    role: 'Branch Manager',
    branch: 'B001',
    branchName: 'Phnom Penh Central',
    email: 'lina.vann@smartretail.kh',
    phone: '012-000-003',
    status: 'Active',
    avatar: 'LV',
    description: 'Manages sales, inventory, and staff strictly at Phnom Penh Central flagship store.'
  },
  {
    id: 'USR-004',
    name: 'Dara Chea',
    role: 'Branch Manager',
    branch: 'B003',
    branchName: 'Sen Sok',
    email: 'dara.chea@smartretail.kh',
    phone: '012-000-004',
    status: 'Active',
    avatar: 'DC',
    description: 'Manages branch operations, stock shortages, and POS staff at Sen Sok branch.'
  },
  {
    id: 'USR-005',
    name: 'Sopheak Lim',
    role: 'Cashier',
    branch: 'B001',
    branchName: 'Phnom Penh Central',
    email: 'sopheak.lim@smartretail.kh',
    phone: '012-000-005',
    status: 'Active',
    avatar: 'SL',
    description: 'Front-desk point of sale cashier, product search, receipt generation, cash/card handling.'
  },
  {
    id: 'USR-006',
    name: 'Rina Touch',
    role: 'Inventory Staff',
    branch: 'B001',
    branchName: 'Phnom Penh Central',
    email: 'rina.touch@smartretail.kh',
    phone: '012-000-006',
    status: 'Active',
    avatar: 'RT',
    description: 'Performs physical stock audits, receives goods, logs damaged stock, and prepares transfer shipments.'
  },
  {
    id: 'USR-007',
    name: 'Vuthy Kim',
    role: 'Procurement Staff',
    branch: 'All',
    email: 'vuthy.kim@smartretail.kh',
    phone: '012-000-007',
    status: 'Active',
    avatar: 'VK',
    description: 'Oversees vendor negotiations, purchase order generation, and supplier catalog pricing.'
  },
  {
    id: 'USR-008',
    name: 'Mony Chhay',
    role: 'Fulfillment Staff',
    branch: 'B001',
    branchName: 'Phnom Penh Central',
    email: 'mony.chhay@smartretail.kh',
    phone: '012-000-008',
    status: 'Active',
    avatar: 'MC',
    description: 'Processes online orders: picking products from shelves, packing boxes, and coordinating dispatch.'
  },
  {
    id: 'USR-009',
    name: 'Nita Hem',
    role: 'Customer Service Staff',
    branch: 'All',
    email: 'nita.hem@smartretail.kh',
    phone: '012-000-009',
    status: 'Active',
    avatar: 'NH',
    description: 'Handles customer warranty claims, RMA inspections, and initiates simulated refunds.'
  },
  {
    id: 'USR-010',
    name: 'Demo Customer',
    role: 'Online Customer',
    branch: 'Customer',
    email: 'sokha@example.com',
    phone: '010-555-101',
    status: 'Active',
    avatar: 'DC',
    description: 'End consumer browsing electronics accessories, placing delivery or pickup orders online.'
  },
  {
    id: 'USR-011',
    name: 'Guest Customer',
    role: 'Guest Customer',
    branch: 'Customer',
    email: 'guest@smartretail.kh',
    phone: '',
    status: 'Active',
    avatar: 'GC',
    description: 'Anonymous shopper exploring products before creating an account.'
  }
];


const INITIAL_PAYMENT_SETTINGS = {
  'B001': {
    branchId: 'B001',
    branchName: 'Phnom Penh Central',
    merchantName: 'SMARTRETAIL PP CENTRAL',
    bakongAccountId: 'smartretail_b001@aclb',
    merchantCity: 'Phnom Penh',
    defaultCurrency: 'USD',
    khqrEnabled: true,
    cashEnabled: true,
    cardEnabled: true,
    expirationSeconds: 180,
    terminalId: 'TERM-B001-01'
  },
  'B002': {
    branchId: 'B002',
    branchName: 'Toul Kork',
    merchantName: 'SMARTRETAIL TOUL KORK',
    bakongAccountId: 'smartretail_b002@canadia',
    merchantCity: 'Phnom Penh',
    defaultCurrency: 'USD',
    khqrEnabled: true,
    cashEnabled: true,
    cardEnabled: true,
    expirationSeconds: 180,
    terminalId: 'TERM-B002-01'
  },
  'B003': {
    branchId: 'B003',
    branchName: 'Sen Sok',
    merchantName: 'SMARTRETAIL SEN SOK',
    bakongAccountId: 'smartretail_b003@aba',
    merchantCity: 'Phnom Penh',
    defaultCurrency: 'USD',
    khqrEnabled: true,
    cashEnabled: true,
    cardEnabled: true,
    expirationSeconds: 180,
    terminalId: 'TERM-B003-01'
  },
  'B004': {
    branchId: 'B004',
    branchName: 'Siem Reap',
    merchantName: 'SMARTRETAIL SIEM REAP',
    bakongAccountId: 'smartretail_b004@wing',
    merchantCity: 'Siem Reap',
    defaultCurrency: 'USD',
    khqrEnabled: true,
    cashEnabled: true,
    cardEnabled: true,
    expirationSeconds: 180,
    terminalId: 'TERM-B004-01'
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
    terminalId: 'GATEWAY-WH001'
  }
};

const INITIAL_PAYMENTS = [
  {
    id: 'PAY-100001',
    paymentId: 'PAY-100001',
    orderId: 'ORD-2026-006',
    orderNumber: 'ORD-2026-006',
    branchId: 'B001',
    branchName: 'Phnom Penh Central',
    merchantName: 'SMARTRETAIL PP CENTRAL',
    merchantCity: 'Phnom Penh',
    customerId: 'C001',
    customerName: 'Sokha Vann',
    paymentMethod: 'Bakong KHQR',
    amount: 2799.00,
    currency: 'USD',
    usdAmount: 2799.00,
    khrAmount: 11475900,
    transactionRef: 'TXN-KHQR-2026-991820',
    status: 'Paid',
    createdAt: '2026-11-15T13:15:00Z',
    paidAt: '2026-11-15T13:15:45Z',
    expiresAt: '2026-11-15T13:18:00Z',
    verificationData: {
      terminalId: 'POS-B001-01',
      bankName: 'ABA Mobile (Simulated)',
      verifiedBy: 'National Bank of Cambodia Bakong Gateway (Simulated)'
    },
    timeline: [
      { status: 'Created', time: '13:15', note: 'Payment request generated for $2,799.00' },
      { status: 'Paid', time: '13:15', note: 'Verified by ABA Mobile via Bakong KHQR' }
    ]
  },
  {
    id: 'PAY-100002',
    paymentId: 'PAY-100002',
    orderId: 'ORD-2026-005',
    orderNumber: 'ORD-2026-005',
    branchId: 'B002',
    branchName: 'Toul Kork',
    merchantName: 'SMARTRETAIL TOUL KORK',
    merchantCity: 'Phnom Penh',
    customerId: 'C004',
    customerName: 'Dara Touch',
    paymentMethod: 'Cash',
    amount: 157.50,
    currency: 'USD',
    usdAmount: 157.50,
    khrAmount: 645750,
    transactionRef: 'TXN-CASH-2026-281902',
    status: 'Paid',
    createdAt: '2026-11-15T11:40:00Z',
    paidAt: '2026-11-15T11:40:00Z',
    expiresAt: '2026-11-15T11:40:00Z',
    verificationData: {
      terminalId: 'POS-B002-01',
      cashier: 'Kosal Seng'
    },
    timeline: [
      { status: 'Paid', time: '11:40', note: 'Tendered $157.50 Cash at Toul Kork Register' }
    ]
  },
  {
    id: 'PAY-100003',
    paymentId: 'PAY-100003',
    orderId: 'ORD-2026-004',
    orderNumber: 'ORD-2026-004',
    branchId: 'B001',
    branchName: 'Phnom Penh Central',
    merchantName: 'SMARTRETAIL PP CENTRAL',
    merchantCity: 'Phnom Penh',
    customerId: 'C005',
    customerName: 'Vicheka Meas',
    paymentMethod: 'Bakong KHQR',
    amount: 288.00,
    currency: 'USD',
    usdAmount: 288.00,
    khrAmount: 1180800,
    transactionRef: 'TXN-KHQR-2026-110293',
    status: 'Paid',
    createdAt: '2026-11-15T10:15:00Z',
    paidAt: '2026-11-15T10:16:10Z',
    expiresAt: '2026-11-15T10:18:00Z',
    verificationData: {
      terminalId: 'POS-B001-01',
      bankName: 'Canadia Bank (Simulated)',
      verifiedBy: 'Bakong Gateway'
    },
    timeline: [
      { status: 'Paid', time: '10:16', note: 'Verified by Canadia App via Bakong KHQR' }
    ]
  },
  {
    id: 'PAY-100004',
    paymentId: 'PAY-100004',
    orderId: 'ORD-2026-003',
    orderNumber: 'ORD-2026-003',
    branchId: 'B002',
    branchName: 'Toul Kork',
    merchantName: 'SMARTRETAIL TOUL KORK',
    merchantCity: 'Phnom Penh',
    customerId: 'C003',
    customerName: 'Pisey Lim',
    paymentMethod: 'Bakong KHQR',
    amount: 1448.00,
    currency: 'USD',
    usdAmount: 1448.00,
    khrAmount: 5936800,
    transactionRef: 'TXN-KHQR-2026-440192',
    status: 'Paid',
    createdAt: '2026-11-15T08:20:00Z',
    paidAt: '2026-11-15T08:21:00Z',
    expiresAt: '2026-11-15T08:23:00Z',
    verificationData: {
      terminalId: 'WEB-GATEWAY-01',
      bankName: 'Wing Bank (Simulated)',
      verifiedBy: 'Bakong KHQR Payment Switch'
    },
    timeline: [
      { status: 'Paid', time: '08:21', note: 'E-commerce Checkout paid via Wing Bank KHQR' }
    ]
  },
  {
    id: 'PAY-100005',
    paymentId: 'PAY-100005',
    orderId: 'ORD-2026-002',
    orderNumber: 'ORD-2026-002',
    branchId: 'B001',
    branchName: 'Phnom Penh Central',
    merchantName: 'SMARTRETAIL PP CENTRAL',
    merchantCity: 'Phnom Penh',
    customerId: 'C002',
    customerName: 'Rina Chea',
    paymentMethod: 'Bakong KHQR',
    amount: 1678.00,
    currency: 'USD',
    usdAmount: 1678.00,
    khrAmount: 6879800,
    transactionRef: 'TXN-KHQR-2026-382910',
    status: 'Paid',
    createdAt: '2026-11-14T14:15:00Z',
    paidAt: '2026-11-14T14:16:30Z',
    expiresAt: '2026-11-14T14:18:00Z',
    verificationData: {
      terminalId: 'WEB-GATEWAY-01',
      bankName: 'ABA Mobile (Simulated)',
      verifiedBy: 'Bakong KHQR Gateway'
    },
    timeline: [
      { status: 'Paid', time: '14:16', note: 'Customer completed KHQR payment on Web store' }
    ]
  },
  {
    id: 'PAY-100006',
    paymentId: 'PAY-100006',
    orderId: 'ORD-2026-001',
    orderNumber: 'ORD-2026-001',
    branchId: 'B001',
    branchName: 'Phnom Penh Central',
    merchantName: 'SMARTRETAIL PP CENTRAL',
    merchantCity: 'Phnom Penh',
    customerId: 'C001',
    customerName: 'Sokha Vann',
    paymentMethod: 'Bakong KHQR',
    amount: 1330.00,
    currency: 'USD',
    usdAmount: 1330.00,
    khrAmount: 5453000,
    transactionRef: 'TXN-KHQR-2026-881923',
    status: 'Paid',
    createdAt: '2026-11-14T10:30:00Z',
    paidAt: '2026-11-14T10:31:15Z',
    expiresAt: '2026-11-14T10:33:00Z',
    verificationData: {
      terminalId: 'WEB-GATEWAY-01',
      bankName: 'Acleda mobile (Simulated)',
      verifiedBy: 'Bakong Gateway'
    },
    timeline: [
      { status: 'Paid', time: '10:31', note: 'Verified by ACLEDA Mobile via Bakong KHQR' }
    ]
  }
];
