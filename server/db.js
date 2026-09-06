import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import fs from 'node:fs'
import { hashPassword } from './auth.js'

const dataDir = path.resolve(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'ccr.db')
export const db = new DatabaseSync(dbPath)

// Initialize all relational tables
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT,
      address TEXT,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      payment_terms TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      unit TEXT DEFAULT 'set',
      default_price REAL DEFAULT 0,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      po_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      date TEXT NOT NULL,
      payment_terms TEXT,
      project TEXT,
      status TEXT DEFAULT 'Open',
      items_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS delivery_receipts (
      id TEXT PRIMARY KEY,
      dr_number TEXT UNIQUE NOT NULL,
      po_id TEXT,
      customer_name TEXT NOT NULL,
      date TEXT NOT NULL,
      trip_id TEXT,
      delivered_by TEXT,
      received_by TEXT,
      status TEXT DEFAULT 'Delivered',
      is_replacement INTEGER DEFAULT 0,
      original_dr_number TEXT,
      notes TEXT,
      items_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS delivery_trips (
      id TEXT PRIMARY KEY,
      trip_number TEXT UNIQUE NOT NULL,
      driver_name TEXT NOT NULL,
      truck_plate TEXT NOT NULL,
      date TEXT NOT NULL,
      fuel_expense REAL DEFAULT 0,
      status TEXT DEFAULT 'Completed',
      notes TEXT,
      dr_numbers_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS delivery_issues (
      id TEXT PRIMARY KEY,
      issue_number TEXT UNIQUE NOT NULL,
      dr_number TEXT NOT NULL,
      po_id TEXT,
      customer_id TEXT,
      customer_name TEXT,
      product_id TEXT,
      product_name TEXT,
      quantity REAL DEFAULT 1,
      unit TEXT DEFAULT 'pc',
      reason TEXT,
      status TEXT DEFAULT 'Pending Replacement',
      replacement_dr_number TEXT,
      date TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS statements_of_account (
      id TEXT PRIMARY KEY,
      soa_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      po_id TEXT,
      date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      dr_numbers_json TEXT NOT NULL,
      total_amount REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      balance REAL DEFAULT 0,
      status TEXT DEFAULT 'Pending Payment',
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      payment_number TEXT UNIQUE NOT NULL,
      soa_id TEXT NOT NULL,
      soa_number TEXT NOT NULL,
      customer_id TEXT,
      customer_name TEXT NOT NULL,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'Check',
      bank_name TEXT,
      reference_number TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      expense_number TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      sub_category TEXT DEFAULT 'General',
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      supplier TEXT DEFAULT 'Internal / Direct',
      payment_method TEXT DEFAULT 'Cash',
      receipt_no TEXT DEFAULT 'N/A',
      source_type TEXT DEFAULT 'MANUAL',
      reference_id TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      pay_type TEXT DEFAULT 'Daily',
      rate REAL NOT NULL,
      phone TEXT,
      start_date TEXT,
      status TEXT DEFAULT 'Active'
    );

    CREATE TABLE IF NOT EXISTS cash_advances (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      employee_name TEXT NOT NULL,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      deducted_amount REAL DEFAULT 0,
      balance REAL NOT NULL,
      status TEXT DEFAULT 'Open',
      reason TEXT DEFAULT 'Vale'
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL
    );
  `)

  // Migrate existing users table if email column doesn't exist
  try {
    db.exec(`ALTER TABLE users ADD COLUMN email TEXT;`)
  } catch (e) {
    // Column already exists
  }

  // Ensure default admin user email is ccrconsupplies@gmail.com
  const existingAdmin = db.prepare("SELECT * FROM users WHERE id = 'usr-1'").get()
  if (existingAdmin) {
    const adminAuth = hashPassword('admin123')
    db.prepare(`
      UPDATE users 
      SET email = 'ccrconsupplies@gmail.com',
          password_hash = ?,
          salt = ?
      WHERE id = 'usr-1'
    `).run(adminAuth.hash, adminAuth.salt)
  }

  seedIfEmpty()
}

// Seed default admin user if users table is empty
export function seedIfEmpty(force = false) {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM users').get()
  if (!force && countRow.count > 0) return

  if (force) {
    db.exec(`
      DELETE FROM users;
      DELETE FROM customers;
      DELETE FROM products;
      DELETE FROM purchase_orders;
      DELETE FROM delivery_receipts;
      DELETE FROM delivery_trips;
      DELETE FROM delivery_issues;
      DELETE FROM statements_of_account;
      DELETE FROM payments;
      DELETE FROM expenses;
      DELETE FROM employees;
      DELETE FROM cash_advances;
    `)
  }

  // 1. Seed Admin User
  const adminAuth = hashPassword('admin123')
  const insertUser = db.prepare(`
    INSERT INTO users (id, username, email, password_hash, salt, full_name, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertUser.run('usr-1', 'admin', 'ccrconsupplies@gmail.com', adminAuth.hash, adminAuth.salt, 'CCR Admin', 'ADMIN', '2026-01-01')
}

// Optional helper to populate realistic sample data for testing
export function seedSampleData() {
  seedIfEmpty(true)

  const accountAuth = hashPassword('account123')
  const dispatchAuth = hashPassword('dispatch123')
  const insertUser = db.prepare(`
    INSERT INTO users (id, username, email, password_hash, salt, full_name, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertUser.run('usr-2', 'accountant', 'accounting@ccrsupply.ph', accountAuth.hash, accountAuth.salt, 'Maria Santos', 'ACCOUNTING', '2026-01-01')
  insertUser.run('usr-3', 'dispatcher', 'logistics@ccrsupply.ph', dispatchAuth.hash, dispatchAuth.salt, 'Junel Alcantara', 'LOGISTICS', '2026-01-01')

  // 2. Seed Customers (Per CCR plan)
  const insertCustomer = db.prepare(`
    INSERT INTO customers (id, name, short_name, address, contact_person, phone, email, payment_terms, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertCustomer.run(
    'cust-1',
    'Cebu Landmaster Inc.',
    'CLI',
    'Park Centrale Tower, Cebu IT Park, Cebu City',
    'Engr. Kevin Tan',
    '0917-555-4321',
    'procurement@cebulandmasters.com',
    '30 Days upon delivery',
    'Major developer account for residential and commercial door requirements.'
  )

  insertCustomer.run(
    'cust-2',
    'Shalom Constructions Inc.',
    'SHALOM',
    'National Highway, Poblacion, Carcar City, Cebu',
    'Arch. Grace Lim',
    '0922-888-7654',
    'purchasing@shalomconstructions.ph',
    '15 Days upon delivery',
    'Regional general contractor specializing in educational and institutional projects.'
  )

  // 3. Seed Products (Per CCR plan)
  const insertProduct = db.prepare(`
    INSERT INTO products (id, sku, name, description, unit, default_price, active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  insertProduct.run(
    'prod-1',
    'DOOR-WSP-01',
    'Door, Wooden Solid Panel 0.90x2.10 m. w/ Jamb Door',
    'Solid kiln-dried mahogany/tanguile panel door with matching 2x4 treated hardwood jamb',
    'set',
    4850.00,
    1
  )

  insertProduct.run(
    'prod-2',
    'DOOR-HCF-01',
    'Hollow Core Flush 0.70 x 2.10 m. w/ Jamb',
    'Interior hollow core flush door with protective marine skin and standard jamb for T&B',
    'set',
    2450.00,
    1
  )

  insertProduct.run(
    'prod-3',
    'DOOR-HCF-02',
    'Hollow Core Flush 0.80 x 2.10 m. w/ Jamb',
    'Bedroom hollow core flush door with protective marine skin and standard jamb',
    'set',
    2650.00,
    1
  )

  // 4. Seed Purchase Orders
  const insertPO = db.prepare(`
    INSERT INTO purchase_orders (id, po_number, customer_id, customer_name, date, payment_terms, project, status, items_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const po1Items = [
    { productId: 'prod-1', productName: 'Door, Wooden Solid Panel 0.90x2.10 m. w/ Jamb Door', orderedQty: 50, deliveredQty: 25, unitPrice: 4850, unit: 'set' },
    { productId: 'prod-2', productName: 'Hollow Core Flush 0.70 x 2.10 m. w/ Jamb', orderedQty: 40, deliveredQty: 40, unitPrice: 2450, unit: 'set' }
  ]
  insertPO.run(
    'po-1',
    'PO-2026-001',
    'cust-1',
    'Cebu Landmaster Inc.',
    '2026-08-10',
    '30 Days upon delivery',
    'Mandani Bay Condo Phase 2',
    'Partially Delivered',
    JSON.stringify(po1Items),
    '2026-08-10'
  )

  const po2Items = [
    { productId: 'prod-3', productName: 'Hollow Core Flush 0.80 x 2.10 m. w/ Jamb', orderedQty: 20, deliveredQty: 0, unitPrice: 2650, unit: 'set' }
  ]
  insertPO.run(
    'po-2',
    'PO-2026-002',
    'cust-2',
    'Shalom Constructions Inc.',
    '2026-08-18',
    '15 Days upon delivery',
    'Carcar City Hospital Wing B',
    'Open',
    JSON.stringify(po2Items),
    '2026-08-18'
  )

  // 5. Seed Delivery Receipts
  const insertDR = db.prepare(`
    INSERT INTO delivery_receipts (id, dr_number, po_id, customer_name, date, trip_id, delivered_by, received_by, status, is_replacement, original_dr_number, notes, items_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const dr1Items = [
    { productId: 'prod-1', productName: 'Door, Wooden Solid Panel 0.90x2.10 m. w/ Jamb Door', quantity: 25, unitPrice: 4850, unit: 'set' },
    { productId: 'prod-2', productName: 'Hollow Core Flush 0.70 x 2.10 m. w/ Jamb', quantity: 40, unitPrice: 2450, unit: 'set' }
  ]
  insertDR.run(
    'dr-1',
    'DR-2026-001',
    'po-1',
    'Cebu Landmaster Inc.',
    '2026-08-15',
    'trip-1',
    'Arnel D. (Driver)',
    'Engr. Kevin Tan / Site Receiving',
    'Delivered',
    0,
    null,
    'Batch 1 on-site delivery via Isuzu Elf.',
    JSON.stringify(dr1Items)
  )

  // 6. Seed Delivery Trips
  const insertTrip = db.prepare(`
    INSERT INTO delivery_trips (id, trip_number, driver_name, truck_plate, date, fuel_expense, status, notes, dr_numbers_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertTrip.run(
    'trip-1',
    'TRIP-2026-001',
    'Arnel D.',
    'GAE-4819 (Isuzu Elf)',
    '2026-08-15',
    1850.00,
    'Completed',
    'South delivery run Barili -> Mandaue / IT Park.',
    JSON.stringify(['DR-2026-001'])
  )

  // 7. Seed Statements of Account
  const insertSOA = db.prepare(`
    INSERT INTO statements_of_account (id, soa_number, customer_id, customer_name, po_id, date, due_date, dr_numbers_json, total_amount, paid_amount, balance, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  // Total amount for DR-2026-001: 25 * 4850 + 40 * 2450 = 121,250 + 98,000 = 219,250
  insertSOA.run(
    'soa-1',
    'SOA-2026-001',
    'cust-1',
    'Cebu Landmaster Inc.',
    'po-1',
    '2026-08-16',
    '2026-09-15',
    JSON.stringify(['DR-2026-001']),
    219250.00,
    100000.00,
    119250.00,
    'Partially Paid',
    'Official billing for Batch 1 delivery.'
  )

  // 8. Seed Payments
  const insertPayment = db.prepare(`
    INSERT INTO payments (id, payment_number, soa_id, soa_number, customer_id, customer_name, date, amount, payment_method, bank_name, reference_number, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertPayment.run(
    'pay-1',
    'OR-2026-001',
    'soa-1',
    'SOA-2026-001',
    'cust-1',
    'Cebu Landmaster Inc.',
    '2026-08-25',
    100000.00,
    'Check',
    'BDO Unibank',
    'CHK-00482910',
    'Downpayment check deposited to Metrobank Barili.'
  )

  // 9. Seed Central Expenses
  const insertExpense = db.prepare(`
    INSERT INTO expenses (id, expense_number, category, sub_category, description, amount, date, supplier, payment_method, receipt_no, source_type, reference_id, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertExpense.run(
    'exp-1',
    'EXP-2026-001',
    'Transportation',
    'Gas/Fuel',
    'Diesel for Isuzu Elf truck (Trip TRIP-2026-001)',
    1850.00,
    '2026-08-15',
    'Petron Barili Station',
    'Cash',
    'OR-88291',
    'DELIVERY_TRIP',
    'trip-1',
    'Auto-logged from delivery dispatch'
  )

  insertExpense.run(
    'exp-2',
    'EXP-2026-002',
    'Materials',
    'Lumber',
    'Kiln dried tanguile planks for door framing (150 board ft)',
    18500.00,
    '2026-08-08',
    'Cebu South Timber Supply',
    'Bank Transfer',
    'SI-9021',
    'MANUAL',
    null,
    'Raw materials inventory replenishment'
  )

  insertExpense.run(
    'exp-3',
    'EXP-2026-003',
    'Utilities',
    'Electricity',
    'VECO Monthly Workshop Power Bill',
    6420.00,
    '2026-08-20',
    'Visayan Electric Company',
    'Cash',
    'BILL-2026-08',
    'MANUAL',
    null,
    'August factory electricity'
  )

  // 10. Seed Employees & Vales
  const insertEmp = db.prepare(`
    INSERT INTO employees (id, name, position, pay_type, rate, phone, start_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertEmp.run('emp-1', 'Reynaldo Cañete', 'Master Carpenter', 'Daily', 650.00, '0933-111-2233', '2025-03-01', 'Active')
  insertEmp.run('emp-2', 'Junel Alcantara', 'Truck Driver / Logistics', 'Daily', 550.00, '0945-222-3344', '2025-06-15', 'Active')
  insertEmp.run('emp-3', 'Ernesto Gomez', 'Finisher / Sanding Helper', 'Daily', 480.00, '0912-333-4455', '2025-08-01', 'Active')

  const insertVale = db.prepare(`
    INSERT INTO cash_advances (id, employee_id, employee_name, date, amount, deducted_amount, balance, status, reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertVale.run('ca-1', 'emp-1', 'Reynaldo Cañete', '2026-08-22', 1500.00, 0, 1500.00, 'Open', 'Emergency family medical expenses (Vale)')
}

// Helper to query all rows from a table
export function getAll(table, orderBy = 'rowid DESC') {
  return db.prepare(`SELECT * FROM ${table} ORDER BY ${orderBy}`).all()
}

// Helper to query single row
export function getOne(table, id) {
  return db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id)
}
