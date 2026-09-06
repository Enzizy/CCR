import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { prepareDelivery, applyDeliveryToItems } from '../src/lib/deliveryRules.js'
import { trackOrder, statementDetails, isOpenIssue } from '../src/lib/orderTracking.js'

// The API uses cwd/data. Keep all test records outside the business database.
const testDirectory = mkdtempSync(join(tmpdir(), 'ccr-workflow-'))
process.chdir(testDirectory)
const { db, initDb } = await import('../server/db.js')
const { apiRouter } = await import('../server/api.js')
const { default: express } = await import('express')
initDb()
const app = express()
app.use('/api', apiRouter)
const server = app.listen(0, '127.0.0.1')
await new Promise(resolve => server.once('listening', resolve))
const base = `http://127.0.0.1:${server.address().port}/api`
async function request(path, body) {
  const response = await fetch(base + path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {})
  const data = await response.json()
  assert.ok(response.ok, JSON.stringify(data))
  return data
}

try {
  const customer = await request('/customers', { name: 'Workflow Test Customer' })
  const po = await request('/purchase-orders', { poNumber: 'CUSTOMER-PO-50', customerId: customer.id, customerName: customer.name, date: '2026-09-01', items: [{ productId: 'test-door', productName: 'Door', orderedQty: 50, deliveredQty: 0, unitPrice: 5200, unit: 'set' }] })
  const first = await request('/deliveries', { drNumber: 'TEST-DR-1', poId: po.id, customerName: customer.name, date: '2026-09-02', items: [{ productId: 'test-door', name: 'Door', quantity: 30, unitPrice: 5200 }] })
  await request('/deliveries', { drNumber: 'TEST-DR-2', poId: po.id, customerName: customer.name, date: '2026-09-03', items: [{ productId: 'test-door', name: 'Door', quantity: 20, unitPrice: 5200 }] })
  const before = (await request('/purchase-orders'))[0]
  assert.equal(before.items[0].deliveredQty, 50)
  assert.equal(before.status, 'Completed')
  const soasBefore = await request('/statements-of-account')
  assert.equal(soasBefore.length, 2)
  assert.equal(soasBefore.reduce((sum, soa) => sum + soa.totalAmount, 0), 260000)

  // Even an incoming price must be zeroed for a replacement.
  const replacement = await request('/deliveries', { drNumber: 'TEST-REPLACEMENT-1', isReplacement: true, originalDrNumber: first.drNumber, date: '2026-09-04', items: [{ productId: 'test-door', name: 'Door', quantity: 2, unitPrice: 5200 }] })
  assert.equal(replacement.poId, po.id)
  assert.equal(replacement.subtotal, 0)
  assert.equal(replacement.items[0].unitPrice, 0)
  assert.deepEqual((await request('/purchase-orders'))[0].items, before.items)
  assert.deepEqual(await request('/statements-of-account'), soasBefore)

  const receipts = await request('/deliveries')
  assert.ok(receipts.some(dr => dr.id === replacement.id), 'Returned DR ID must match the saved record')
  const issue = await request('/delivery-issues', { id: 'client-generated-id', drNumber: first.drNumber, poId: po.id, productId: 'test-door', productName: 'Door', quantity: 2 })
  assert.ok((await request('/delivery-issues')).some(saved => saved.id === issue.id), 'Returned damage ID must match the saved record')
  const resolution = await fetch(base + `/delivery-issues/${issue.id}/replacement`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ replacementDrNumber: replacement.drNumber }) })
  assert.equal(resolution.status, 200)
  assert.equal((await request('/delivery-issues'))[0].status, 'Replaced')
  await request('/payments', { soaId: soasBefore[0].id, soaNumber: soasBefore[0].soaNumber, customerName: customer.name, customerId: customer.id, amount: 10000, date: '2026-09-05', paymentMethod: 'Cash' })
  const paidStatements = await request('/statements-of-account')
  assert.equal(paidStatements.reduce((sum, soa) => sum + soa.balance, 0), 250000)
  const tracking = trackOrder({ ...before, items: before.items.map(item => ({ ...item, remainingQty: 0 })) }, receipts, soasBefore, [], [])
  assert.equal(tracking.replacementQuantity, 2)
  assert.equal(tracking.billed, 260000)
  assert.equal(tracking.balance, 260000)
  assert.equal(tracking.unbilled.length, 0)
  assert.equal(tracking.remainingValue, 0)
  const print = statementDetails(soasBefore[0], receipts, [before])
  assert.equal(print.poNumber, 'CUSTOMER-PO-50')
  assert.ok(print.items.length)
  assert.ok(print.items.every(item => item.drNumber !== replacement.drNumber))
  assert.deepEqual(applyDeliveryToItems(before.items, replacement), before.items)
  assert.throws(() => applyDeliveryToItems(before.items, { items: [{ productId: 'test-door', quantity: 1 }] }), /exceeds/)
  assert.throws(() => prepareDelivery({ isReplacement: true, originalDrNumber: 'missing', items: replacement.items }, receipts), /original/)
  assert.equal(isOpenIssue({ status: 'Replaced' }), false)
  assert.equal(isOpenIssue({ status: 'Pending Replacement' }), true)
  console.log('PASS: partial deliveries 30 + 20 = 50; replacing 2 keeps 50 delivered, two SOAs and the same balance. Replacement DR links to the PO with zero charge. Print rows retain PO and DR references.')
} finally {
  await new Promise(resolve => server.close(resolve))
  db.close()
}
