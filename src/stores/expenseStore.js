import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const useExpenseStore = defineStore('expense', () => {
  const categories = ref([
    { id: 'cat-materials', name: 'Materials', subCategories: ['Lumber', 'Plywood', 'Glue', 'Nails & Screws', 'Hinges & Hardware', 'Locks', 'Finishing & Sandpaper', 'Other Materials'] },
    { id: 'cat-labor', name: 'Labor', subCategories: ['Worker Salary', 'Overtime', 'Contractor / Specialist'] },
    { id: 'cat-transpo', name: 'Transportation', subCategories: ['Gas/Fuel', 'Toll', 'Parking', 'Vehicle Maintenance', 'Other Transportation'] },
    { id: 'cat-utilities', name: 'Utilities', subCategories: ['Electricity', 'Water', 'Internet', 'Phone'] },
    { id: 'cat-ops', name: 'Operations', subCategories: ['Tools & Bits', 'Machine Repairs', 'Packaging & Straps', 'Office Supplies'] },
    { id: 'cat-other', name: 'Other', subCategories: ['Miscellaneous', 'Taxes & Permits'] }
  ])

  const expenses = ref([])
  const isLoading = ref(false)

  const totalExpenses = computed(() => expenses.value.reduce((total, expense) => total + Number(expense.amount || 0), 0))

  const categoryBreakdown = computed(() => {
    const totals = {}
    expenses.value.forEach(expense => {
      totals[expense.category] = (totals[expense.category] || 0) + Number(expense.amount || 0)
    })

    return Object.entries(totals)
      .map(([category, amount]) => ({
        category,
        amount,
        percent: Math.round((amount / (totalExpenses.value || 1)) * 100)
      }))
      .sort((a, b) => b.amount - a.amount)
  })

  async function fetchAll() {
    isLoading.value = true
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false })
        if (data) {
          expenses.value = data.map(r => ({
            id: r.id,
            expenseNumber: r.expense_number,
            category: r.category,
            subCategory: r.sub_category,
            description: r.description,
            amount: Number(r.amount || 0),
            date: r.date,
            supplier: r.supplier,
            paymentMethod: r.payment_method,
            receiptNo: r.receipt_no,
            sourceType: r.source_type,
            referenceId: r.reference_id,
            receiptImageUrl: r.receipt_image_url,
            notes: r.notes
          }))
        }
        return
      }

      const res = await fetch('/api/expenses')
      const data = await res.json()
      expenses.value = data || []
    } catch (err) {
      console.error('Failed to fetch expenses:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Auto-fetch on store initialization
  fetchAll()

  async function addExpense(expense) {
    const amount = Number(expense.amount)
    if (!expense.category || !expense.description?.trim() || !Number.isFinite(amount) || amount <= 0) return null

    const payload = {
      id: `exp-${Date.now()}`,
      expenseNumber: expense.expenseNumber || `EXP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      date: expense.date || new Date().toISOString().split('T')[0],
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

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('expenses').insert({
          id: payload.id,
          expense_number: payload.expenseNumber,
          category: payload.category,
          sub_category: payload.subCategory,
          description: payload.description,
          amount: payload.amount,
          date: payload.date,
          supplier: payload.supplier,
          payment_method: payload.paymentMethod,
          receipt_no: payload.receiptNo,
          source_type: payload.sourceType,
          reference_id: payload.referenceId,
          notes: payload.notes
        })
        if (error) throw error
        expenses.value.unshift(payload)
        return payload
      } catch (e) {
        console.error('Supabase expense insert failed, falling back:', e)
      }
    }

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const saved = await res.json()
      expenses.value.unshift(saved)
      return saved
    } catch (e) {
      expenses.value.unshift(payload)
      return payload
    }
  }

  return { categories, expenses, totalExpenses, categoryBreakdown, isLoading, fetchAll, addExpense }
})
