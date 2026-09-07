import express from 'express'
import { prepareDelivery, applyDeliveryToItems } from '../src/lib/deliveryRules.js'
import { db, getAll, getOne, seedIfEmpty } from './db.js'
import { verifyPassword, createSession, removeSession, authenticate } from './auth.js'

export const apiRouter = express.Router()
apiRouter.use(express.json())

// ==================== AUTH ROUTES ====================

apiRouter.post('/auth/login', (req, res) => {
  const { username, email, password } = req.body || {}
  const identifier = (email || username || '').trim()
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const user = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)').get(identifier, identifier)
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const isValid = verifyPassword(password, user.password_hash, user.salt)
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const token = createSession(user)
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    }
  })
})

apiRouter.get('/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user })
})

apiRouter.post('/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null
  if (token) removeSession(token)
  res.json({ success: true })
})

// ==================== CUSTOMERS ====================

apiRouter.get('/customers', (req, res) => {
  const rows = getAll('customers', 'name ASC')
  res.json(rows.map(r => ({
    ...r,
    shortName: r.short_name,
    contactPerson: r.contact_person,
    paymentTerms: r.payment_terms
  })))
})

apiRouter.post('/customers', (req, res) => {
  const data = req.body || {}
  const id = `cust-${Date.now()}`
  db.prepare(`
    INSERT INTO customers (id, name, short_name, address, contact_person, phone, email, payment_terms, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.name,
    data.shortName || data.short_name || '',
    data.address || '',
    data.contactPerson || data.contact_person || '',
    data.phone || '',
    data.email || '',
    data.paymentTerms || data.payment_terms || '30 Days upon delivery',
    data.notes || ''
  )
  res.status(201).json({ id, ...data })
})

// ==================== PRODUCTS ====================

apiRouter.get('/products', (req, res) => {
  const rows = getAll('products', 'name ASC')
  res.json(rows.map(r => ({
    ...r,
    defaultPrice: r.default_price,
    active: Boolean(r.active)
  })))
})

apiRouter.post('/products', (req, res) => {
  const data = req.body || {}
  const id = `prod-${Date.now()}`
  db.prepare(`
    INSERT INTO products (id, sku, name, description, unit, default_price, active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.sku || `PROD-${Date.now().toString().slice(-4)}`,
    data.name,
    data.description || '',
    data.unit || 'set',
    Number(data.defaultPrice || data.default_price || 0),
    data.active !== false ? 1 : 0
  )
  res.status(201).json({ id, ...data })
})

// ==================== PURCHASE ORDERS ====================

apiRouter.get('/purchase-orders', (req, res) => {
  const rows = getAll('purchase_orders', 'rowid DESC')
  res.json(rows.map(r => ({
    id: r.id,
    poNumber: r.po_number,
    customerId: r.customer_id,
    customerName: r.customer_name,
    date: r.date,
    paymentTerms: r.payment_terms,
    project: r.project,
    status: r.status,
    items: JSON.parse(r.items_json || '[]'),
    createdAt: r.created_at
  })))
})

apiRouter.post('/purchase-orders', (req, res) => {
  const data = req.body || {}
  const id = `po-${Date.now()}`
  const poNumber = data.poNumber || `PO-2026-${String(Date.now()).slice(-4)}`
  db.prepare(`
    INSERT INTO purchase_orders (id, po_number, customer_id, customer_name, date, payment_terms, project, status, items_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    poNumber,
    data.customerId,
    data.customerName,
    data.date || new Date().toISOString().split('T')[0],
    data.paymentTerms || '30 Days upon delivery',
    data.project || '',
    'Open',
    JSON.stringify(data.items || []),
    new Date().toISOString().split('T')[0]
  )
  res.status(201).json({ id, poNumber, ...data })
})

apiRouter.put('/purchase-orders/:id/deliveries', (req, res) => {
  const { id } = req.params
  const { deliveredItems } = req.body || {}
  const row = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id)
  if (!row) return res.status(404).json({ error: 'Purchase Order not found' })

  const items = JSON.parse(row.items_json || '[]')
  let allDelivered = true
  let anyDelivered = false

  items.forEach(item => {
    const match = (deliveredItems || []).find(d => d.productId === item.productId)
    if (match) {
      item.deliveredQty = Math.min(item.orderedQty, (item.deliveredQty || 0) + Number(match.quantity || 0))
    }
    if (item.deliveredQty > 0) anyDelivered = true
    if (item.deliveredQty < item.orderedQty) allDelivered = false
  })

  const newStatus = allDelivered ? 'Completed' : (anyDelivered ? 'Partially Delivered' : 'Open')
  db.prepare('UPDATE purchase_orders SET items_json = ?, status = ? WHERE id = ?').run(
    JSON.stringify(items),
    newStatus,
    id
  )

  res.json({ id, status: newStatus, items })
})

// ==================== DELIVERY RECEIPTS ====================

apiRouter.get('/deliveries', (req, res) => {
  const rows = getAll('delivery_receipts', 'rowid DESC')
  res.json(rows.map(r => ({
    id: r.id,
    drNumber: r.dr_number,
    poId: r.po_id,
    customerName: r.customer_name,
    date: r.date,
    tripId: r.trip_id,
    deliveredBy: r.delivered_by,
    receivedBy: r.received_by,
    status: r.status,
    isReplacement: Boolean(r.is_replacement),
    originalDrNumber: r.original_dr_number,
    notes: r.notes,
    items: JSON.parse(r.items_json || '[]')
  })))
})

apiRouter.post('/deliveries', (req, res) => {
  let data
  try {
    const originals = (req.body?.isReplacement ? getAll('delivery_receipts') : []).map(r => ({ drNumber: r.dr_number, poId: r.po_id, customerName: r.customer_name, isReplacement: Boolean(r.is_replacement), items: JSON.parse(r.items_json || '[]') }))
    data = prepareDelivery(req.body || {}, originals)
    if (!data.isReplacement && data.poId) {
      const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(data.poId)
      if (!po) throw new Error('Customer PO not found.')
      applyDeliveryToItems(JSON.parse(po.items_json || '[]'), data)
    }
  } catch (error) { return res.status(400).json({ error: error.message }) }
  const id = `dr-${Date.now()}`
  const drNumber = data.drNumber || `DR-2026-${String(Date.now()).slice(-4)}`
  const isReplacement = data.isReplacement ? 1 : 0

  db.prepare(`
    INSERT INTO delivery_receipts (id, dr_number, po_id, customer_name, date, trip_id, delivered_by, received_by, status, is_replacement, original_dr_number, notes, items_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    drNumber,
    data.poId || null,
    data.customerName,
    data.date || new Date().toISOString().split('T')[0],
    data.tripId || null,
    data.deliveredBy || 'CCR Logistics',
    data.receivedBy || 'Site Engineer / Warehouse Receiver',
    'Delivered',
    isReplacement,
    data.originalDrNumber || null,
    data.notes || '',
    JSON.stringify(data.items || [])
  )

  // If linked to a Trip, add DR to trip's dr_numbers_json
  if (data.tripId) {
    const trip = db.prepare('SELECT * FROM delivery_trips WHERE id = ?').get(data.tripId)
    if (trip) {
      const drs = JSON.parse(trip.dr_numbers_json || '[]')
      if (!drs.includes(drNumber)) {
        drs.push(drNumber)
        db.prepare('UPDATE delivery_trips SET dr_numbers_json = ? WHERE id = ?').run(JSON.stringify(drs), data.tripId)
      }
    }
  }

  // If not replacement and has poId, update PO quantities & create draft SOA
  if (!isReplacement && data.poId) {
    const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(data.poId)
    if (po) {
      const poItems = applyDeliveryToItems(JSON.parse(po.items_json || '[]'), data)
      let totalAmount = 0
      ;(data.items || []).forEach(delItem => {
        const poItem = poItems.find(p => p.productId === delItem.productId)
        if (poItem) {
          totalAmount += Number(delItem.quantity || 0) * (poItem.unitPrice || 0)
        }
      })
      const allDone = poItems.every(p => (p.deliveredQty || 0) >= p.orderedQty)
      db.prepare('UPDATE purchase_orders SET items_json = ?, status = ? WHERE id = ?').run(
        JSON.stringify(poItems),
        allDone ? 'Completed' : 'Partially Delivered',
        data.poId
      )

      // Auto-generate Statement of Account for delivered goods
      if (totalAmount > 0) {
        const soaId = `soa-${Date.now()}`
        const soaNumber = `SOA-2026-${String(Date.now()).slice(-4)}`
        const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        db.prepare(`
          INSERT INTO statements_of_account (id, soa_number, customer_id, customer_name, po_id, date, due_date, dr_numbers_json, total_amount, paid_amount, balance, status, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          soaId,
          soaNumber,
          po.customer_id,
          po.customer_name,
          data.poId,
          data.date || new Date().toISOString().split('T')[0],
          dueDate,
          JSON.stringify([drNumber]),
          totalAmount,
          0,
          totalAmount,
          'Pending Payment',
          `Auto-generated from Delivery Receipt ${drNumber}`
        )
      }
    }
  }

  res.status(201).json({ ...data, id, drNumber })
})

// ==================== DELIVERY TRIPS ====================

apiRouter.get('/delivery-trips', (req, res) => {
  const rows = getAll('delivery_trips', 'rowid DESC')
  res.json(rows.map(r => ({
    id: r.id,
    tripNumber: r.trip_number,
    driverName: r.driver_name,
    truckPlate: r.truck_plate,
    date: r.date,
    fuelExpense: r.fuel_expense,
    status: r.status,
    notes: r.notes,
    drNumbers: JSON.parse(r.dr_numbers_json || '[]')
  })))
})

apiRouter.post('/delivery-trips', (req, res) => {
  const data = req.body || {}
  const id = `trip-${Date.now()}`
  const tripNumber = data.tripNumber || `TRIP-2026-${String(Date.now()).slice(-4)}`
  const fuelExpense = Number(data.fuelExpense || 0)

  db.prepare(`
    INSERT INTO delivery_trips (id, trip_number, driver_name, truck_plate, date, fuel_expense, status, notes, dr_numbers_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    tripNumber,
    data.driverName,
    data.truckPlate,
    data.date || new Date().toISOString().split('T')[0],
    fuelExpense,
    'Completed',
    data.notes || '',
    JSON.stringify(data.drNumbers || [])
  )

  // If fuel expense > 0, auto-log to Central Expenses
  if (fuelExpense > 0) {
    const expId = `exp-${Date.now()}`
    const expNumber = `EXP-2026-${String(Date.now()).slice(-4)}`
    db.prepare(`
      INSERT INTO expenses (id, expense_number, category, sub_category, description, amount, date, supplier, payment_method, receipt_no, source_type, reference_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      expId,
      expNumber,
      'Transportation',
      'Gas/Fuel',
      `Fuel for ${data.truckPlate} (${tripNumber})`,
      fuelExpense,
      data.date || new Date().toISOString().split('T')[0],
      'Gas Station / Direct',
      'Cash',
      'N/A',
      'DELIVERY_TRIP',
      id,
      `Auto-logged from Delivery Trip ${tripNumber}`
    )
  }

  res.status(201).json({ id, tripNumber, ...data })
})

// ==================== DELIVERY ISSUES ====================

apiRouter.get('/delivery-issues', (req, res) => {
  const rows = getAll('delivery_issues', 'rowid DESC')
  res.json(rows.map(r => ({
    id: r.id,
    issueNumber: r.issue_number,
    drNumber: r.dr_number,
    poId: r.po_id,
    customerId: r.customer_id,
    customerName: r.customer_name,
    productId: r.product_id,
    productName: r.product_name,
    quantity: r.quantity,
    unit: r.unit,
    reason: r.reason,
    status: r.status,
    replacementDrNumber: r.replacement_dr_number,
    date: r.date,
    notes: r.notes
  })))
})

apiRouter.post('/delivery-issues', (req, res) => {
  const data = req.body || {}
  const id = `issue-${Date.now()}`
  const issueNumber = data.issueNumber || `ISSUE-2026-${String(Date.now()).slice(-4)}`

  db.prepare(`
    INSERT INTO delivery_issues (id, issue_number, dr_number, po_id, customer_id, customer_name, product_id, product_name, quantity, unit, reason, status, replacement_dr_number, date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    issueNumber,
    data.drNumber,
    data.poId || null,
    data.customerId || null,
    data.customerName || '',
    data.productId || null,
    data.productName || '',
    Number(data.quantity || 1),
    data.unit || 'pc',
    data.reason || 'Damaged during transit',
    'Pending Replacement',
    null,
    data.date || new Date().toISOString().split('T')[0],
    data.notes || ''
  )

  res.status(201).json({ ...data, id, issueNumber })
})

apiRouter.put('/delivery-issues/:id/replacement', (req, res) => {
  const { id } = req.params
  const { replacementDrNumber } = req.body || {}
  const issue = db.prepare('SELECT * FROM delivery_issues WHERE id = ?').get(id)
  if (!issue) return res.status(404).json({ error: 'Damage report not found.' })
  const replacement = db.prepare('SELECT * FROM delivery_receipts WHERE dr_number = ?').get(replacementDrNumber)
  if (!replacement?.is_replacement || replacement.original_dr_number !== issue.dr_number) {
    return res.status(400).json({ error: 'Choose a replacement DR for this damage report.' })
  }
  db.prepare('UPDATE delivery_issues SET status = ?, replacement_dr_number = ? WHERE id = ?').run(
    'Replaced',
    replacementDrNumber,
    id
  )
  res.json({ id, status: 'Replaced', replacementDrNumber })
})

// ==================== STATEMENTS OF ACCOUNT ====================

apiRouter.get('/statements-of-account', (req, res) => {
  const rows = getAll('statements_of_account', 'rowid DESC')
  res.json(rows.map(r => ({
    id: r.id,
    soaNumber: r.soa_number,
    customerId: r.customer_id,
    customerName: r.customer_name,
    poId: r.po_id,
    date: r.date,
    dueDate: r.due_date,
    drNumbers: JSON.parse(r.dr_numbers_json || '[]'),
    totalAmount: r.total_amount,
    paidAmount: r.paid_amount,
    balance: r.balance,
    status: r.status,
    notes: r.notes
  })))
})

// ==================== PAYMENTS ====================

apiRouter.get('/payments', (req, res) => {
  const rows = getAll('payments', 'rowid DESC')
  res.json(rows.map(r => ({
    id: r.id,
    paymentNumber: r.payment_number,
    soaId: r.soa_id,
    soaNumber: r.soa_number,
    customerId: r.customer_id,
    customerName: r.customer_name,
    date: r.date,
    amount: r.amount,
    paymentMethod: r.payment_method,
    bankName: r.bank_name,
    referenceNumber: r.reference_number,
    notes: r.notes
  })))
})

apiRouter.post('/payments', (req, res) => {
  const data = req.body || {}
  const id = `pay-${Date.now()}`
  const paymentNumber = data.paymentNumber || `OR-2026-${String(Date.now()).slice(-4)}`
  const amount = Number(data.amount || 0)

  db.prepare(`
    INSERT INTO payments (id, payment_number, soa_id, soa_number, customer_id, customer_name, date, amount, payment_method, bank_name, reference_number, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    paymentNumber,
    data.soaId,
    data.soaNumber,
    data.customerId || null,
    data.customerName,
    data.date || new Date().toISOString().split('T')[0],
    amount,
    data.paymentMethod || 'Check',
    data.bankName || 'Metrobank',
    data.referenceNumber || '',
    data.notes || ''
  )

  // Update Statement of Account balance
  const soa = db.prepare('SELECT * FROM statements_of_account WHERE id = ?').get(data.soaId)
  if (soa) {
    const newPaid = Number(soa.paid_amount || 0) + amount
    const newBalance = Math.max(0, Number(soa.total_amount || 0) - newPaid)
    const newStatus = newBalance <= 0 ? 'Paid' : 'Partially Paid'
    db.prepare('UPDATE statements_of_account SET paid_amount = ?, balance = ?, status = ? WHERE id = ?').run(
      newPaid,
      newBalance,
      newStatus,
      data.soaId
    )
  }

  res.status(201).json({ id, paymentNumber, ...data })
})

// ==================== EXPENSES ====================

apiRouter.get('/expenses', (req, res) => {
  const rows = getAll('expenses', 'rowid DESC')
  res.json(rows.map(r => ({
    id: r.id,
    expenseNumber: r.expense_number,
    category: r.category,
    subCategory: r.sub_category,
    description: r.description,
    amount: r.amount,
    date: r.date,
    supplier: r.supplier,
    paymentMethod: r.payment_method,
    receiptNo: r.receipt_no,
    sourceType: r.source_type,
    referenceId: r.reference_id,
    notes: r.notes
  })))
})

apiRouter.post('/expenses', (req, res) => {
  const data = req.body || {}
  const id = `exp-${Date.now()}`
  const expenseNumber = data.expenseNumber || `EXP-2026-${String(Date.now()).slice(-4)}`

  db.prepare(`
    INSERT INTO expenses (id, expense_number, category, sub_category, description, amount, date, supplier, payment_method, receipt_no, source_type, reference_id, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    expenseNumber,
    data.category,
    data.subCategory || 'General',
    data.description,
    Number(data.amount || 0),
    data.date || new Date().toISOString().split('T')[0],
    data.supplier || 'Internal / Direct',
    data.paymentMethod || 'Cash',
    data.receiptNo || 'N/A',
    data.sourceType || 'MANUAL',
    data.referenceId || null,
    data.notes || ''
  )

  res.status(201).json({ id, expenseNumber, ...data })
})

// ==================== EMPLOYEES & VALES ====================

apiRouter.get('/employees', (req, res) => {
  const rows = getAll('employees', 'name ASC')
  res.json(rows.map(r => ({
    id: r.id,
    name: r.name,
    position: r.position,
    payType: r.pay_type,
    rate: r.rate,
    phone: r.phone,
    startDate: r.start_date,
    status: r.status
  })))
})

apiRouter.post('/employees', (req, res) => {
  const data = req.body || {}
  const id = `emp-${Date.now()}`
  db.prepare(`
    INSERT INTO employees (id, name, position, pay_type, rate, phone, start_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.name,
    data.position,
    data.payType || 'Daily',
    Number(data.rate || 0),
    data.phone || '',
    data.startDate || new Date().toISOString().split('T')[0],
    data.status || 'Active'
  )
  res.status(201).json({ id, ...data })
})

apiRouter.put('/employees/:id', (req, res) => {
  const data = req.body || {}
  const result = db.prepare(`
    UPDATE employees
    SET name = ?, position = ?, pay_type = ?, rate = ?, phone = ?, start_date = ?, status = ?
    WHERE id = ?
  `).run(
    data.name,
    data.position,
    data.payType || 'Daily',
    Number(data.rate || 0),
    data.phone || '',
    data.startDate || new Date().toISOString().split('T')[0],
    data.status || 'Active',
    req.params.id
  )
  if (!result.changes) return res.status(404).json({ error: 'Employee not found.' })
  return res.json({ id: req.params.id, ...data })
})

apiRouter.get('/cash-advances', (req, res) => {
  const rows = getAll('cash_advances', 'rowid DESC')
  res.json(rows.map(r => ({
    id: r.id,
    employeeId: r.employee_id,
    employeeName: r.employee_name,
    date: r.date,
    amount: r.amount,
    deductedAmount: r.deducted_amount,
    balance: r.balance,
    status: r.status,
    reason: r.reason
  })))
})

apiRouter.post('/cash-advances', (req, res) => {
  const data = req.body || {}
  const id = `ca-${Date.now()}`
  const amount = Number(data.amount || 0)

  db.prepare(`
    INSERT INTO cash_advances (id, employee_id, employee_name, date, amount, deducted_amount, balance, status, reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.employeeId,
    data.employeeName,
    data.date || new Date().toISOString().split('T')[0],
    amount,
    0,
    amount,
    'Open',
    data.reason || 'Cash Advance (Vale)'
  )

  res.status(201).json({ id, ...data })
})

// ==================== SEED / RESET ====================

apiRouter.post('/seed', (req, res) => {
  seedIfEmpty(true)
  res.json({ success: true, message: 'Database reset and seeded with CCR default business data.' })
})
