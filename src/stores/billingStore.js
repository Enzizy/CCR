import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBillingStore = defineStore('billing', () => {
  const nextSoaSeq = ref(1)
  const statements = ref([])
  const payments = ref([])

  const enrichedStatements = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return statements.value.map(statement => {
      const daysUntilDue = Math.ceil((new Date(statement.dueDate) - today) / (1000 * 60 * 60 * 24))
      let status = statement.paidAmount > 0 ? 'Partially Paid' : 'Unpaid'
      let agingCategory = 'Current'

      if (statement.balance <= 0) {
        status = 'Paid'
        agingCategory = 'Paid'
      } else if (daysUntilDue < 0) {
        status = 'Overdue'
        agingCategory = 'Overdue'
      } else if (daysUntilDue <= 7) {
        status = statement.paidAmount > 0 ? 'Partially Paid' : 'Due Soon'
        agingCategory = 'Due Soon'
      }

      return { ...statement, daysUntilDue, status, agingCategory }
    })
  })

  const totalReceivables = computed(() => statements.value.reduce((total, statement) => total + statement.balance, 0))
  const totalCollections = computed(() => payments.value.reduce((total, payment) => total + payment.amount, 0))

  const customerReceivables = computed(() => {
    const customers = {}
    enrichedStatements.value.forEach(statement => {
      if (!customers[statement.customerId]) {
        customers[statement.customerId] = {
          customerId: statement.customerId,
          customerName: statement.customerName,
          totalInvoiced: 0,
          totalCollected: 0,
          totalOutstanding: 0,
          soas: []
        }
      }
      customers[statement.customerId].totalInvoiced += statement.totalAmount
      customers[statement.customerId].totalCollected += statement.paidAmount
      customers[statement.customerId].totalOutstanding += statement.balance
      customers[statement.customerId].soas.push(statement)
    })
    return Object.values(customers)
  })

  const agingSummary = computed(() => {
    const summary = { current: 0, dueSoon: 0, overdue: 0, total: 0 }
    enrichedStatements.value.forEach(statement => {
      if (statement.balance <= 0) return
      if (statement.agingCategory === 'Overdue') summary.overdue += statement.balance
      else if (statement.agingCategory === 'Due Soon') summary.dueSoon += statement.balance
      else summary.current += statement.balance
    })
    summary.total = summary.current + summary.dueSoon + summary.overdue
    return summary
  })

  function generateSOAFromDR(dr) {
    if (dr.subtotal <= 0) return null

    const due = new Date(dr.date)
    due.setDate(due.getDate() + 30)
    const sequence = String(nextSoaSeq.value++).padStart(3, '0')
    const documentYear = new Date(`${dr.date}T00:00:00`).getFullYear()
    const newStatement = {
      id: `soa-${statements.value.length + 1}`,
      soaNumber: `SOA-${documentYear}-${sequence}`,
      customerId: dr.customerId,
      customerName: dr.customerName,
      drNumber: dr.drNumber,
      poNumber: dr.poNumber,
      poDate: dr.poDate || null,
      date: dr.date,
      dueDate: due.toISOString().split('T')[0],
      totalAmount: dr.subtotal,
      paidAmount: 0,
      balance: dr.subtotal,
      paymentTerms: dr.paymentTerms || '30 days upon delivery on site',
      project: dr.project,
      items: dr.items.map(item => ({ ...item })),
      notes: ''
    }
    statements.value.unshift(newStatement)
    return newStatement
  }

  function recordPayment(paymentData) {
    const amount = Number(paymentData.amount)
    const statement = statements.value.find(item => item.soaNumber === paymentData.soaNumber)
    if (!statement || !Number.isFinite(amount) || amount <= 0 || amount > statement.balance) return null

    statement.paidAmount += amount
    statement.balance = Math.max(0, statement.totalAmount - statement.paidAmount)

    const newPayment = {
      id: `pay-${payments.value.length + 1}`,
      receiptNumber: `OR-${new Date(`${paymentData.date}T00:00:00`).getFullYear()}-${String(payments.value.length + 1).padStart(4, '0')}`,
      date: paymentData.date,
      customerId: paymentData.customerId || statement?.customerId || '',
      customerName: paymentData.customerName || statement?.customerName || '',
      soaNumber: paymentData.soaNumber,
      amount,
      paymentMethod: paymentData.paymentMethod || 'Bank Transfer',
      referenceNumber: paymentData.referenceNumber || '',
      bankName: paymentData.bankName || '',
      notes: paymentData.notes || ''
    }
    payments.value.unshift(newPayment)
    return newPayment
  }

  return {
    statements,
    payments,
    nextSoaSeq,
    enrichedStatements,
    totalReceivables,
    totalCollections,
    customerReceivables,
    agingSummary,
    generateSOAFromDR,
    recordPayment
  }
})
