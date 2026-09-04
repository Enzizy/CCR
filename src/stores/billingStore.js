import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBillingStore = defineStore('billing', () => {
  const nextSoaSeq = ref(4)

  // Statements of Account
  const statements = ref([
    {
      id: 'soa-1',
      soaNumber: 'SOA-CLI26-03',
      customerId: 'cust-1',
      customerName: 'CEBU LANDMASTERS, INC.',
      drNumber: 'DR #4322',
      poNumber: '4100017940',
      date: '2026-09-03',
      dueDate: '2026-10-03',
      totalAmount: 493600,
      paidAmount: 0,
      balance: 493600,
      paymentTerms: '30 days upon delivery on site',
      project: 'CASA MIRA SOUTH',
      items: [
        { name: 'Door, Wooden Solid Panel 0.90x2.10 m. w/ Jamb', quantity: 50, unit: 'sets', unitPrice: 5200, amount: 260000, poDate: '13-Jul-26' },
        { name: 'Door, Hollow Core Flush 0.70 x 2.10 m. w/ Jamb', quantity: 73, unit: 'sets', unitPrice: 3200, amount: 233600, poDate: '13-Jul-26' }
      ],
      notes: 'Make check payable to Rodil B. Vergara. Metrobank Acct: 599-3-599-14522-3'
    },
    {
      id: 'soa-2',
      soaNumber: 'SOA-2026-002',
      customerId: 'cust-2',
      customerName: 'Shalom Constructions Inc.',
      drNumber: 'DR #4323',
      poNumber: 'PO-SCI-2026-092',
      date: '2026-08-20',
      dueDate: '2026-09-19',
      totalAmount: 287000,
      paidAmount: 287000,    // Fully paid!
      balance: 0,
      paymentTerms: '30 Days upon delivery',
      project: 'Villa Maria Subdivision Phase 1',
      items: [
        { name: 'Door, Solid Core Flush 0.80x2.10 m. w/ Heavy Jamb', quantity: 30, unit: 'set', unitPrice: 4900, amount: 147000 },
        { name: 'Hollow Core Flush 0.70 x 2.10 m. w/ Jamb', quantity: 40, unit: 'set', unitPrice: 3500, amount: 140000 }
      ],
      notes: 'Cleared through BPI Check #881920.'
    },
    {
      id: 'soa-3',
      soaNumber: 'SOA-2026-003',
      customerId: 'cust-1',
      customerName: 'Cebu Landmaster Inc.',
      drNumber: 'DR #4330',
      poNumber: 'PO-CLI-2026-081',
      date: '2026-09-02',
      dueDate: '2026-10-02',
      totalAmount: 310000,
      paidAmount: 0,
      balance: 310000,
      paymentTerms: '30 Days upon delivery',
      project: 'Park Residences Tower 2 - Units 5F-12F',
      items: [
        { name: 'Door, Wooden Solid Panel 0.90x2.10 m. w/ Jamb Door', quantity: 25, unit: 'set', unitPrice: 6800, amount: 170000 },
        { name: 'Hollow Core Flush 0.70 x 2.10 m. w/ Jamb', quantity: 40, unit: 'set', unitPrice: 3500, amount: 140000 }
      ],
      notes: 'Second tranche billing for Tower 2.'
    }
  ])

  // Payment Records
  const payments = ref([
    {
      id: 'pay-1',
      receiptNumber: 'OR-2026-0042',
      date: '2026-08-30',
      customerId: 'cust-2',
      customerName: 'Shalom Constructions Inc.',
      soaNumber: 'SOA-2026-002',
      amount: 287000,
      paymentMethod: 'Check',
      referenceNumber: 'BPI Check #881920',
      bankName: 'BPI Cebu Main',
      notes: 'Full payment for Villa Maria 1st delivery'
    },
    {
      id: 'pay-2',
      receiptNumber: 'OR-2026-0045',
      date: '2026-09-01',
      customerId: 'cust-1',
      customerName: 'Cebu Landmaster Inc.',
      soaNumber: 'SOA-2026-001',
      amount: 200000,
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'BDO-REF-9921448',
      bankName: 'BDO Unibank',
      notes: 'Partial 35% advance clearance for Tower 2 batch 1'
    }
  ])

  // Enriched SOAs with dynamic aging status (relative to today's date)
  const enrichedStatements = computed(() => {
    const today = new Date('2026-09-04') // System reference time

    return statements.value.map(soa => {
      const due = new Date(soa.dueDate)
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))

      let status = 'Unpaid'
      let agingCategory = 'Current'

      if (soa.balance <= 0) {
        status = 'Paid'
        agingCategory = 'Paid'
      } else if (diffDays < 0) {
        status = 'Overdue'
        agingCategory = 'Overdue'
      } else if (diffDays <= 7) {
        status = soa.paidAmount > 0 ? 'Partially Paid' : 'Due Soon'
        agingCategory = 'Due Soon'
      } else {
        status = soa.paidAmount > 0 ? 'Partially Paid' : 'Current'
        agingCategory = 'Current'
      }

      return {
        ...soa,
        daysUntilDue: diffDays,
        status,
        agingCategory
      }
    })
  })

  // Accounts Receivable Metrics
  const totalReceivables = computed(() => {
    return statements.value.reduce((acc, soa) => acc + soa.balance, 0)
  })

  const totalCollections = computed(() => {
    return payments.value.reduce((acc, pay) => acc + pay.amount, 0)
  })

  const customerReceivables = computed(() => {
    const map = {}
    enrichedStatements.value.forEach(soa => {
      if (!map[soa.customerId]) {
        map[soa.customerId] = {
          customerId: soa.customerId,
          customerName: soa.customerName,
          totalInvoiced: 0,
          totalCollected: 0,
          totalOutstanding: 0,
          soas: []
        }
      }
      map[soa.customerId].totalInvoiced += soa.totalAmount
      map[soa.customerId].totalCollected += soa.paidAmount
      map[soa.customerId].totalOutstanding += soa.balance
      map[soa.customerId].soas.push(soa)
    })
    return Object.values(map)
  })

  // Aging Summary
  const agingSummary = computed(() => {
    let current = 0
    let dueSoon = 0
    let overdue = 0

    enrichedStatements.value.forEach(soa => {
      if (soa.balance > 0) {
        if (soa.agingCategory === 'Overdue') {
          overdue += soa.balance
        } else if (soa.agingCategory === 'Due Soon') {
          dueSoon += soa.balance
        } else {
          current += soa.balance
        }
      }
    })

    return { current, dueSoon, overdue, total: current + dueSoon + overdue }
  })

  // Actions
  function generateSOAFromDR(dr) {
    if (dr.subtotal <= 0) return null // Free replacements do not generate billing

    const d = new Date(dr.date)
    d.setDate(d.getDate() + 30) // 30 days terms
    const dueDate = d.toISOString().split('T')[0]

    const seqStr = String(nextSoaSeq.value++).padStart(3, '0')
    const soaNumber = `SOA-2026-${seqStr}`

    const newSoa = {
      id: 'soa-' + (statements.value.length + 1),
      soaNumber,
      customerId: dr.customerId,
      customerName: dr.customerName,
      drNumber: dr.drNumber,
      poNumber: dr.poNumber,
      date: dr.date,
      dueDate,
      totalAmount: dr.subtotal,
      paidAmount: 0,
      balance: dr.subtotal,
      paymentTerms: '30 Days upon delivery',
      project: dr.project,
      items: dr.items.map(i => ({ ...i })),
      notes: 'Please remit payment to BDO Account No. 0045-8912-3401 (CCR Woodcraft Industries).'
    }

    statements.value.unshift(newSoa)
    return newSoa
  }

  function recordPayment(paymentData) {
    const receiptNum = `OR-2026-00${payments.value.length + 46}`
    const amount = Number(paymentData.amount)

    const soa = statements.value.find(s => s.soaNumber === paymentData.soaNumber)
    if (soa) {
      soa.paidAmount = Math.min(soa.totalAmount, soa.paidAmount + amount)
      soa.balance = Math.max(0, soa.totalAmount - soa.paidAmount)
    }

    const newPayment = {
      id: 'pay-' + (payments.value.length + 1),
      receiptNumber: receiptNum,
      date: paymentData.date,
      customerId: paymentData.customerId || (soa ? soa.customerId : ''),
      customerName: paymentData.customerName || (soa ? soa.customerName : ''),
      soaNumber: paymentData.soaNumber,
      amount,
      paymentMethod: paymentData.paymentMethod || 'Bank Transfer',
      referenceNumber: paymentData.referenceNumber || '',
      bankName: paymentData.bankName || 'BDO Unibank',
      notes: paymentData.notes || ''
    }

    payments.value.unshift(newPayment)
    return newPayment
  }

  return {
    statements,
    payments,
    enrichedStatements,
    totalReceivables,
    totalCollections,
    customerReceivables,
    agingSummary,
    generateSOAFromDR,
    recordPayment
  }
})

