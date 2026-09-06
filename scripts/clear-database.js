import { DatabaseSync } from 'node:sqlite'

const db = new DatabaseSync('data/ccr.db')

const tables = [
  'customers',
  'products',
  'purchase_orders',
  'delivery_receipts',
  'delivery_trips',
  'delivery_issues',
  'statements_of_account',
  'payments',
  'expenses',
  'employees',
  'cash_advances'
]

for (const t of tables) {
  db.exec(`DELETE FROM ${t}`)
}

// Keep only admin user
db.exec("DELETE FROM users WHERE username != 'admin'")

console.log('Database emptied successfully! Current row counts:')
for (const t of [...tables, 'users']) {
  const row = db.prepare(`SELECT COUNT(*) as c FROM ${t}`).get()
  console.log(`- ${t}: ${row.c}`)
}
