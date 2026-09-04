import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useExpenseStore = defineStore('expense', () => {
  const categories = ref([
    {
      id: 'cat-materials',
      name: 'Materials',
      subCategories: ['Lumber', 'Plywood', 'Glue', 'Nails & Screws', 'Hinges & Hardware', 'Locks', 'Finishing & Sandpaper', 'Other Materials']
    },
    {
      id: 'cat-labor',
      name: 'Labor',
      subCategories: ['Worker Salary', 'Overtime', 'Contractor / Specialist']
    },
    {
      id: 'cat-transpo',
      name: 'Transportation',
      subCategories: ['Gas/Fuel', 'Toll', 'Parking', 'Vehicle Maintenance', 'Other Transportation']
    },
    {
      id: 'cat-utilities',
      name: 'Utilities',
      subCategories: ['Electricity', 'Water', 'Internet', 'Phone']
    },
    {
      id: 'cat-ops',
      name: 'Operations',
      subCategories: ['Tools & Bits', 'Machine Repairs', 'Packaging & Straps', 'Office Supplies']
    },
    {
      id: 'cat-other',
      name: 'Other',
      subCategories: ['Miscellaneous', 'Taxes & Permits']
    }
  ])

  const expenses = ref([
    {
      id: 'exp-1',
      date: '2026-08-18',
      category: 'Materials',
      subCategory: 'Lumber',
      description: 'Kiln-dried Mahogany rough lumber (800 bdft) for door stiles & rails',
      amount: 48000,
      supplier: 'Mindanao Woodcraft Supply Inc.',
      paymentMethod: 'Bank Transfer',
      receiptNo: 'SI-77821',
      sourceType: 'MANUAL',
      referenceId: null,
      notes: 'Delivered directly to carpentry shop'
    },
    {
      id: 'exp-2',
      date: '2026-08-19',
      category: 'Materials',
      subCategory: 'Plywood',
      description: 'Marine plywood 1/4" and 1/2" for flush door skins (60 sheets)',
      amount: 28500,
      supplier: 'Cebu Eastern Hardware',
      paymentMethod: 'Cash',
      receiptNo: 'OR-99120',
      sourceType: 'MANUAL',
      referenceId: null,
      notes: 'Cash on delivery'
    },
    {
      id: 'exp-3',
      date: '2026-08-20',
      category: 'Transportation',
      subCategory: 'Gas/Fuel',
      description: 'Trip Fuel: TRIP-2026-0089 (Isuzu Forward 6-Wheeler)',
      amount: 2800,
      supplier: 'Shell Gas Station - North Reclamation',
      paymentMethod: 'Cash',
      receiptNo: 'POS-0988',
      sourceType: 'DELIVERY_TRIP',
      referenceId: 'TRIP-2026-0089',
      notes: 'Auto-generated from Delivery Trip TRIP-2026-0089'
    },
    {
      id: 'exp-4',
      date: '2026-08-20',
      category: 'Transportation',
      subCategory: 'Toll',
      description: 'Trip Toll: TRIP-2026-0089',
      amount: 180,
      supplier: 'CCLEX Tollway',
      paymentMethod: 'Cash',
      receiptNo: 'RFID-112',
      sourceType: 'DELIVERY_TRIP',
      referenceId: 'TRIP-2026-0089',
      notes: 'Auto-generated from Delivery Trip TRIP-2026-0089'
    },
    {
      id: 'exp-5',
      date: '2026-08-31',
      category: 'Labor',
      subCategory: 'Worker Salary',
      description: 'Payroll Cutoff Aug 16 - 31 (5 shop carpenters & finishers)',
      amount: 52000,
      supplier: 'Shop Workers',
      paymentMethod: 'Cash',
      receiptNo: 'PAYROLL-AUG-B',
      sourceType: 'PAYROLL',
      referenceId: 'PAY-AUG-2',
      notes: 'Total gross salary earned for period'
    },
    {
      id: 'exp-6',
      date: '2026-09-01',
      category: 'Utilities',
      subCategory: 'Electricity',
      description: 'Monthly electric bill for workshop and dust collection system',
      amount: 18500,
      supplier: 'Veco (Visayan Electric Company)',
      paymentMethod: 'Online Banking',
      receiptNo: 'VECO-20260901',
      sourceType: 'MANUAL',
      referenceId: null,
      notes: 'Peak billing due to continuous planar & sander operations'
    },
    {
      id: 'exp-7',
      date: '2026-09-02',
      category: 'Transportation',
      subCategory: 'Gas/Fuel',
      description: 'Trip Fuel: TRIP-2026-0092 (Isuzu Elf Dropside)',
      amount: 2500,
      supplier: 'Petron Gas Station - Mandaue',
      paymentMethod: 'Cash',
      receiptNo: 'POS-4491',
      sourceType: 'DELIVERY_TRIP',
      referenceId: 'TRIP-2026-0092',
      notes: 'Auto-generated from Delivery Trip TRIP-2026-0092'
    },
    {
      id: 'exp-8',
      date: '2026-09-03',
      category: 'Operations',
      subCategory: 'Tools & Bits',
      description: 'Carbide router bits and replacement planer blades',
      amount: 6400,
      supplier: 'Golden Wood Tooling Center',
      paymentMethod: 'Cash',
      receiptNo: 'SI-3310',
      sourceType: 'MANUAL',
      referenceId: null,
      notes: 'For profile cutter machine'
    }
  ])

  // Computed metrics
  const totalExpenses = computed(() => {
    return expenses.value.reduce((acc, e) => acc + e.amount, 0)
  })

  // Category breakdown
  const categoryBreakdown = computed(() => {
    const map = {}
    expenses.value.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount
    })
    return Object.entries(map).map(([category, amount]) => ({
      category,
      amount,
      percent: Math.round((amount / (totalExpenses.value || 1)) * 100)
    })).sort((a, b) => b.amount - a.amount)
  })

  // Actions
  function addExpense(expense) {
    const id = 'exp-' + (expenses.value.length + 1)
    const newExp = {
      id,
      date: expense.date,
      category: expense.category,
      subCategory: expense.subCategory || 'General',
      description: expense.description,
      amount: Number(expense.amount),
      supplier: expense.supplier || 'Internal / Direct',
      paymentMethod: expense.paymentMethod || 'Cash',
      receiptNo: expense.receiptNo || 'N/A',
      sourceType: expense.sourceType || 'MANUAL',
      referenceId: expense.referenceId || null,
      notes: expense.notes || ''
    }
    expenses.value.unshift(newExp)
    return newExp
  }

  return {
    categories,
    expenses,
    totalExpenses,
    categoryBreakdown,
    addExpense
  }
})

