import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Read .env manually
const envPath = path.resolve(process.cwd(), '.env')
let supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tgzrytgoyyeztkiprrqy.supabase.co'
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const [k, ...v] = trimmed.split('=')
    const val = v.join('=').trim()
    if (k.trim() === 'VITE_SUPABASE_URL') supabaseUrl = val
    if (k.trim() === 'VITE_SUPABASE_ANON_KEY' && !supabaseKey) supabaseKey = val
    if (k.trim() === 'SUPABASE_SERVICE_ROLE_KEY') supabaseKey = val
  }
}

if (!supabaseKey || supabaseKey === 'your-anon-key-here') {
  console.error('ERROR: Please set your valid VITE_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY in .env before running this script.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  console.log('Seeding CCR data to Supabase at:', supabaseUrl)

  // 1. Customers
  const { error: custErr } = await supabase.from('customers').upsert([
    {
      id: 'cust-1',
      name: 'Cebu Landmaster Inc.',
      short_name: 'CLI',
      address: 'Park Centrale Tower, Cebu IT Park, Cebu City',
      contact_person: 'Engr. Kevin Tan',
      phone: '0917-555-4321',
      email: 'procurement@cebulandmasters.com',
      payment_terms: '30 Days upon delivery',
      notes: 'Major developer account for residential and commercial door requirements.'
    },
    {
      id: 'cust-2',
      name: 'Shalom Constructions Inc.',
      short_name: 'SHALOM',
      address: 'National Highway, Poblacion, Carcar City, Cebu',
      contact_person: 'Arch. Grace Lim',
      phone: '0922-888-7654',
      email: 'purchasing@shalomconstructions.ph',
      payment_terms: '15 Days upon delivery',
      notes: 'Regional general contractor specializing in educational and institutional projects.'
    }
  ])
  if (custErr) console.error('Customers error:', custErr.message)
  else console.log('✓ Customers seeded')

  // 2. Products
  const { error: prodErr } = await supabase.from('products').upsert([
    {
      id: 'prod-1',
      sku: 'DOOR-WSP-01',
      name: 'Door, Wooden Solid Panel 0.90x2.10 m. w/ Jamb Door',
      description: 'Solid kiln-dried mahogany/tanguile panel door with matching 2x4 treated hardwood jamb',
      unit: 'set',
      default_price: 4850.00,
      active: true
    },
    {
      id: 'prod-2',
      sku: 'DOOR-HCF-01',
      name: 'Hollow Core Flush 0.70 x 2.10 m. w/ Jamb',
      description: 'Interior hollow core flush door with protective marine skin and standard jamb for T&B',
      unit: 'set',
      default_price: 2450.00,
      active: true
    },
    {
      id: 'prod-3',
      sku: 'DOOR-HCF-02',
      name: 'Hollow Core Flush 0.80 x 2.10 m. w/ Jamb',
      description: 'Bedroom hollow core flush door with protective marine skin and standard jamb',
      unit: 'set',
      default_price: 2650.00,
      active: true
    }
  ])
  if (prodErr) console.error('Products error:', prodErr.message)
  else console.log('✓ Products seeded')

  // 3. Purchase Orders
  const { error: poErr } = await supabase.from('purchase_orders').upsert([
    {
      id: 'po-1',
      po_number: 'PO-2026-001',
      customer_id: 'cust-1',
      customer_name: 'Cebu Landmaster Inc.',
      date: '2026-08-10',
      payment_terms: '30 Days upon delivery',
      project: 'Mandani Bay Condo Phase 2',
      status: 'Partially Delivered',
      items: [
        { productId: 'prod-1', productName: 'Door, Wooden Solid Panel 0.90x2.10 m. w/ Jamb Door', orderedQty: 50, deliveredQty: 25, unitPrice: 4850, unit: 'set' },
        { productId: 'prod-2', productName: 'Hollow Core Flush 0.70 x 2.10 m. w/ Jamb', orderedQty: 40, deliveredQty: 40, unitPrice: 2450, unit: 'set' }
      ]
    },
    {
      id: 'po-2',
      po_number: 'PO-2026-002',
      customer_id: 'cust-2',
      customer_name: 'Shalom Constructions Inc.',
      date: '2026-08-18',
      payment_terms: '15 Days upon delivery',
      project: 'Carcar City Hospital Wing B',
      status: 'Open',
      items: [
        { productId: 'prod-3', productName: 'Hollow Core Flush 0.80 x 2.10 m. w/ Jamb', orderedQty: 20, deliveredQty: 0, unitPrice: 2650, unit: 'set' }
      ]
    }
  ])
  if (poErr) console.error('POs error:', poErr.message)
  else console.log('✓ Purchase Orders seeded')

  // 4. Delivery Trips
  const { error: tripErr } = await supabase.from('delivery_trips').upsert([
    {
      id: 'trip-1',
      trip_number: 'TRIP-2026-001',
      driver_name: 'Arnel D.',
      truck_plate: 'GAE-4819 (Isuzu Elf)',
      date: '2026-08-15',
      fuel_expense: 1850.00,
      status: 'Completed',
      notes: 'South delivery run Barili -> Mandaue / IT Park.',
      dr_numbers: ['DR-2026-001']
    }
  ])
  if (tripErr) console.error('Trips error:', tripErr.message)
  else console.log('✓ Delivery Trips seeded')

  // 5. Delivery Receipts
  const { error: drErr } = await supabase.from('delivery_receipts').upsert([
    {
      id: 'dr-1',
      dr_number: 'DR-2026-001',
      po_id: 'po-1',
      customer_name: 'Cebu Landmaster Inc.',
      date: '2026-08-15',
      trip_id: 'trip-1',
      delivered_by: 'Arnel D. (Driver)',
      received_by: 'Engr. Kevin Tan / Site Receiving',
      status: 'Delivered',
      is_replacement: false,
      notes: 'Batch 1 on-site delivery via Isuzu Elf.',
      items: [
        { productId: 'prod-1', productName: 'Door, Wooden Solid Panel 0.90x2.10 m. w/ Jamb Door', quantity: 25, unitPrice: 4850, unit: 'set' },
        { productId: 'prod-2', productName: 'Hollow Core Flush 0.70 x 2.10 m. w/ Jamb', quantity: 40, unitPrice: 2450, unit: 'set' }
      ]
    }
  ])
  if (drErr) console.error('DR error:', drErr.message)
  else console.log('✓ Delivery Receipts seeded')

  // 6. Statements of Account
  const { error: soaErr } = await supabase.from('statements_of_account').upsert([
    {
      id: 'soa-1',
      soa_number: 'SOA-2026-001',
      customer_id: 'cust-1',
      customer_name: 'Cebu Landmaster Inc.',
      po_id: 'po-1',
      date: '2026-08-16',
      due_date: '2026-09-15',
      dr_numbers: ['DR-2026-001'],
      total_amount: 219250.00,
      paid_amount: 100000.00,
      balance: 119250.00,
      status: 'Partially Paid',
      notes: 'Official billing for Batch 1 delivery.'
    }
  ])
  if (soaErr) console.error('SOA error:', soaErr.message)
  else console.log('✓ Statements of Account seeded')

  // 7. Payments
  const { error: payErr } = await supabase.from('payments').upsert([
    {
      id: 'pay-1',
      payment_number: 'OR-2026-001',
      soa_id: 'soa-1',
      soa_number: 'SOA-2026-001',
      customer_id: 'cust-1',
      customer_name: 'Cebu Landmaster Inc.',
      date: '2026-08-25',
      amount: 100000.00,
      payment_method: 'Check',
      bank_name: 'BDO Unibank',
      reference_number: 'CHK-00482910',
      notes: 'Downpayment check deposited to Metrobank Barili.'
    }
  ])
  if (payErr) console.error('Payment error:', payErr.message)
  else console.log('✓ Payments seeded')

  // 8. Expenses
  const { error: expErr } = await supabase.from('expenses').upsert([
    {
      id: 'exp-1',
      expense_number: 'EXP-2026-001',
      category: 'Transportation',
      sub_category: 'Gas/Fuel',
      description: 'Diesel for Isuzu Elf truck (Trip TRIP-2026-001)',
      amount: 1850.00,
      date: '2026-08-15',
      supplier: 'Petron Barili Station',
      payment_method: 'Cash',
      receipt_no: 'OR-88291',
      source_type: 'DELIVERY_TRIP',
      reference_id: 'trip-1'
    },
    {
      id: 'exp-2',
      expense_number: 'EXP-2026-002',
      category: 'Materials',
      sub_category: 'Lumber',
      description: 'Kiln dried tanguile planks for door framing (150 board ft)',
      amount: 18500.00,
      date: '2026-08-08',
      supplier: 'Cebu South Timber Supply',
      payment_method: 'Bank Transfer',
      receipt_no: 'SI-9021',
      source_type: 'MANUAL'
    },
    {
      id: 'exp-3',
      expense_number: 'EXP-2026-003',
      category: 'Utilities',
      sub_category: 'Electricity',
      description: 'VECO Monthly Workshop Power Bill',
      amount: 6420.00,
      date: '2026-08-20',
      supplier: 'Visayan Electric Company',
      payment_method: 'Cash',
      receipt_no: 'BILL-2026-08',
      source_type: 'MANUAL'
    }
  ])
  if (expErr) console.error('Expenses error:', expErr.message)
  else console.log('✓ Expenses seeded')

  // 9. Employees & Vales
  const { error: empErr } = await supabase.from('employees').upsert([
    { id: 'emp-1', name: 'Reynaldo Cañete', position: 'Master Carpenter', pay_type: 'Daily', rate: 650.00, phone: '0933-111-2233', start_date: '2025-03-01', status: 'Active' },
    { id: 'emp-2', name: 'Junel Alcantara', position: 'Truck Driver / Logistics', pay_type: 'Daily', rate: 550.00, phone: '0945-222-3344', start_date: '2025-06-15', status: 'Active' },
    { id: 'emp-3', name: 'Ernesto Gomez', position: 'Finisher / Sanding Helper', pay_type: 'Daily', rate: 480.00, phone: '0912-333-4455', start_date: '2025-08-01', status: 'Active' }
  ])
  if (empErr) console.error('Employees error:', empErr.message)
  else console.log('✓ Employees seeded')

  const { error: valeErr } = await supabase.from('cash_advances').upsert([
    {
      id: 'ca-1',
      employee_id: 'emp-1',
      employee_name: 'Reynaldo Cañete',
      date: '2026-08-22',
      amount: 1500.00,
      deducted_amount: 0.00,
      balance: 1500.00,
      status: 'Open',
      reason: 'Emergency family medical expenses (Vale)'
    }
  ])
  if (valeErr) console.error('Cash advances error:', valeErr.message)
  else console.log('✓ Cash Advances seeded')

  // 10. Settings
  const { error: setErr } = await supabase.from('settings').upsert([
    {
      key: 'company_profile',
      value: {
        name: 'CCR Construction Supply',
        tin: '142-990-811-000 NV',
        address: 'Poblacion, Barili, Cebu',
        phone: '0995 743 7989 / 0998 558 0067',
        email: 'ccrconsupplies@gmail.com',
        defaultTerms: '30 days upon delivery on site',
        bankName: 'Metrobank',
        bankAccountName: 'Rodil B. Vergara',
        bankAccountNumber: '599-3-599-14522-3'
      }
    }
  ])
  if (setErr) console.error('Settings error:', setErr.message)
  else console.log('✓ Company settings seeded')

  console.log('\nSeed completed successfully!')
}

seed().catch(err => {
  console.error('Fatal seed error:', err)
  process.exit(1)
})
