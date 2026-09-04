import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useExpenseStore = defineStore('expense', () => {
  // Categories are application configuration, not transactional mock data.
  const categories = ref([
    { id: 'cat-materials', name: 'Materials', subCategories: ['Lumber', 'Plywood', 'Glue', 'Nails & Screws', 'Hinges & Hardware', 'Locks', 'Finishing & Sandpaper', 'Other Materials'] },
    { id: 'cat-labor', name: 'Labor', subCategories: ['Worker Salary', 'Overtime', 'Contractor / Specialist'] },
    { id: 'cat-transpo', name: 'Transportation', subCategories: ['Gas/Fuel', 'Toll', 'Parking', 'Vehicle Maintenance', 'Other Transportation'] },
    { id: 'cat-utilities', name: 'Utilities', subCategories: ['Electricity', 'Water', 'Internet', 'Phone'] },
    { id: 'cat-ops', name: 'Operations', subCategories: ['Tools & Bits', 'Machine Repairs', 'Packaging & Straps', 'Office Supplies'] },
    { id: 'cat-other', name: 'Other', subCategories: ['Miscellaneous', 'Taxes & Permits'] }
  ])

  const expenses = ref([])

  const totalExpenses = computed(() => expenses.value.reduce((total, expense) => total + expense.amount, 0))

  const categoryBreakdown = computed(() => {
    const totals = {}
    expenses.value.forEach(expense => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount
    })

    return Object.entries(totals)
      .map(([category, amount]) => ({
        category,
        amount,
        percent: Math.round((amount / (totalExpenses.value || 1)) * 100)
      }))
      .sort((a, b) => b.amount - a.amount)
  })

  function addExpense(expense) {
    const amount = Number(expense.amount)
    if (!expense.category || !expense.description?.trim() || !Number.isFinite(amount) || amount <= 0) return null

    const newExpense = {
      id: `exp-${expenses.value.length + 1}`,
      date: expense.date,
      category: expense.category,
      subCategory: expense.subCategory || 'General',
      description: expense.description,
      amount,
      supplier: expense.supplier || 'Internal / Direct',
      paymentMethod: expense.paymentMethod || 'Cash',
      receiptNo: expense.receiptNo || 'N/A',
      sourceType: expense.sourceType || 'MANUAL',
      referenceId: expense.referenceId || null,
      notes: expense.notes || ''
    }
    expenses.value.unshift(newExpense)
    return newExpense
  }

  return { categories, expenses, totalExpenses, categoryBreakdown, addExpense }
})
