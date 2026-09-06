import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const useBillingStore = defineStore('billing', () => {
  const nextSoaSeq = ref(1)
  const statements = ref([])
  const payments = ref([])
  const isLoading = ref(false)

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

  const totalReceivables = computed(() => statements.value.reduce((total, statement) => total + Number(statement.balance || 0), 0))
  const totalCollections = computed(() => payments.value.reduce((total, payment) => total + Number(payment.amount || 0), 0))

  const customerReceivables = computed(() => {
    const customers = {}
    enrichedStatements.value.forEach(statement => {
      const cId = statement.customerId || 'generic'
      if (!customers[cId]) {
        customers[cId] = {
          customerId: cId,
          customerName: statement.customerName,
          totalInvoiced: 0,
          totalCollected: 0,
          totalOutstanding: 0,
          soas: []
        }
      }
      customers[cId].totalInvoiced += Number(statement.totalAmount || 0)
      customers[cId].totalCollected += Number(statement.paidAmount || 0)
      customers[cId].totalOutstanding += Number(statement.balance || 0)
      customers[cId].soas.push(statement)
    })
    return Object.values(customers)
  })

  const agingSummary = computed(() => {
    const summary = { current: 0, dueSoon: 0, overdue: 0, total: 0 }
    enrichedStatements.value.forEach(statement => {
      const bal = Number(statement.balance || 0)
      if (bal <= 0) return
      if (statement.agingCategory === 'Overdue') summary.overdue += bal
      else if (statement.agingCategory === 'Due Soon') summary.dueSoon += bal
      else summary.current += bal
    })
    summary.total = summary.current + summary.dueSoon + summary.overdue
    return summary
  })

  async function fetchAll() {
    isLoading.value = true
    try {
      if (isSupabaseConfigured) {
        const [soaRes, payRes] = await Promise.all([
          supabase.from('statements_of_account').select('*').order('date', { ascending: false }),
          supabase.from('payments').select('*').order('date', { ascending: false })
        ])

        if (soaRes.data) {
          statements.value = soaRes.data.map(r => {
            const drNumbers = Array.isArray(r.dr_numbers) ? r.dr_numbers : (typeof r.dr_numbers === 'string' ? JSON.parse(r.dr_numbers || '[]') : [])
            return {
              id: r.id,
              soaNumber: r.soa_number,
              customerId: r.customer_id,
              customerName: r.customer_name,
              poId: r.po_id,
              date: r.date,
              dueDate: r.due_date,
              drNumbers,
              drNumber: drNumbers.join(', '),
              totalAmount: Number(r.total_amount || 0),
              paidAmount: Number(r.paid_amount || 0),
              balance: Number(r.balance || 0),
              status: r.status,
              notes: r.notes
            }
          })
          if (soaRes.data.length > 0) nextSoaSeq.value = soaRes.data.length + 1
        }

        if (payRes.data) {
          payments.value = payRes.data.map(p => ({
            id: p.id,
            paymentNumber: p.payment_number,
            receiptNumber: p.payment_number,
            soaId: p.soa_id,
            soaNumber: p.soa_number,
            customerId: p.customer_id,
            customerName: p.customer_name,
            date: p.date,
            amount: Number(p.amount || 0),
            paymentMethod: p.payment_method,
            bankName: p.bank_name,
            referenceNumber: p.reference_number,
            notes: p.notes
          }))
        }
        return
      }

      const [soaRes, payRes] = await Promise.all([
        fetch('/api/statements-of-account').then(r => r.json()),
        fetch('/api/payments').then(r => r.json())
      ])
      statements.value = (soaRes || []).map(s => ({
        ...s,
        drNumber: Array.isArray(s.drNumbers) ? s.drNumbers.join(', ') : (s.drNumbers || '')
      }))
      payments.value = (payRes || []).map(p => ({
        ...p,
        receiptNumber: p.paymentNumber
      }))
      if (soaRes && soaRes.length > 0) {
        nextSoaSeq.value = soaRes.length + 1
      }
    } catch (err) {
      console.error('Failed to fetch billing data:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Auto-fetch on store initialization
  fetchAll()

  function generateSOAFromDR(dr) {
    fetchAll()
  }

  async function recordPayment(paymentData) {
    const amount = Number(paymentData.amount)
    const statement = statements.value.find(item => item.soaNumber === paymentData.soaNumber || item.id === paymentData.soaId)
    if (!statement || !Number.isFinite(amount) || amount <= 0 || amount > statement.balance) return null

    const payload = {
      id: `pay-${Date.now()}`,
      soaId: statement.id,
      soaNumber: statement.soaNumber,
      customerId: statement.customerId,
      customerName: statement.customerName,
      date: paymentData.date,
      amount,
      paymentMethod: paymentData.paymentMethod || 'Bank Transfer',
      bankName: paymentData.bankName || 'Metrobank',
      referenceNumber: paymentData.referenceNumber || '',
      notes: paymentData.notes || ''
    }

    if (isSupabaseConfigured) {
      try {
        const paymentNumber = paymentData.paymentNumber || `OR-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
        const { error: payErr } = await supabase.from('payments').insert({
          id: payload.id,
          payment_number: paymentNumber,
          soa_id: payload.soaId,
          soa_number: payload.soaNumber,
          customer_id: payload.customerId,
          customer_name: payload.customerName,
          date: payload.date,
          amount: payload.amount,
          payment_method: payload.paymentMethod,
          bank_name: payload.bankName,
          reference_number: payload.referenceNumber,
          notes: payload.notes
        })
        if (payErr) throw payErr

        // Update Statement balance
        const newPaid = Number(statement.paidAmount || 0) + amount
        const newBalance = Math.max(0, Number(statement.totalAmount || 0) - newPaid)
        const newStatus = newBalance <= 0 ? 'Paid' : 'Partially Paid'

        await supabase.from('statements_of_account').update({
          paid_amount: newPaid,
          balance: newBalance,
          status: newStatus
        }).eq('id', statement.id)

        statement.paidAmount = newPaid
        statement.balance = newBalance
        statement.status = newStatus

        const saved = { ...payload, paymentNumber, receiptNumber: paymentNumber }
        payments.value.unshift(saved)
        fetchAll()
        return saved
      } catch (e) {
        console.error('Supabase payment recording failed, falling back:', e)
      }
    }

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const saved = await res.json()
      fetchAll()
      return saved
    } catch (e) {
      statement.paidAmount += amount
      statement.balance = Math.max(0, statement.totalAmount - statement.paidAmount)
      const fallback = { id: payload.id, receiptNumber: `OR-${Date.now()}`, ...payload }
      payments.value.unshift(fallback)
      return fallback
    }
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
    isLoading,
    fetchAll,
    generateSOAFromDR,
    recordPayment
  }
})
