<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="page-title">Business Expenses</h2>
      </div>

      <button
        @click="showAddModal = true"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-lg shadow-xs transition-colors"
      >
        <Plus class="w-4 h-4" />
        <span>Log Business Expense</span>
      </button>
    </div>

    <!-- Category Breakdown Ribbon -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div
        v-for="item in expenseStore.categoryBreakdown"
        :key="item.category"
        class="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors"
      >
        <div class="flex items-center justify-between text-[11px] font-medium text-slate-500">
          <span>{{ item.category }}</span>
          <span class="font-mono text-slate-400">{{ item.percent }}%</span>
        </div>
        <div class="mt-1.5 text-base font-semibold font-mono text-slate-900">
          ₱{{ item.amount.toLocaleString() }}
        </div>
      </div>
    </div>

    <!-- Category Filter Bar -->
    <div class="flex items-center gap-1.5 border-b border-slate-200/80 pb-3 text-xs overflow-x-auto">
      <button
        @click="selectedCategory = 'All'"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
          selectedCategory === 'All' ? 'bg-brand-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
        ]"
      >
        All Expenses ({{ expenseStore.expenses.length }})
      </button>
      <button
        v-for="cat in expenseStore.categories"
        :key="cat.id"
        @click="selectedCategory = cat.name"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
          selectedCategory === cat.name ? 'bg-brand-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
        ]"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Expense Table -->
    <div class="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
      <table class="data-table">
        <thead>
          <tr class="data-table-header">
            <th class="py-3 px-5 w-28">Date</th>
            <th class="py-3 px-4 w-36">Category</th>
            <th class="py-3 px-4 w-44">Item / Material</th>
            <th class="py-3 px-4">Description</th>
            <th class="py-3 px-5 text-right">Amount</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-700">
          <tr
            v-for="e in filteredExpenses"
            :key="e.id"
            class="hover:bg-slate-50/50 transition-colors"
          >
            <td class="py-3.5 px-5 font-mono text-slate-500 text-xs">{{ e.date }}</td>
            <td class="py-3.5 px-4">
              <span class="font-semibold text-slate-900">{{ e.category }}</span>
              <span
                v-if="e.sourceType === 'DELIVERY_TRIP'"
                class="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200/70"
              >
                Trip
              </span>
              <span
                v-else-if="e.sourceType === 'PAYROLL'"
                class="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-800 border border-sky-200/70"
              >
                Payroll
              </span>
            </td>
            <td class="py-3.5 px-4 font-medium text-slate-800">
              {{ e.subCategory || '—' }}
            </td>
            <td class="py-3.5 px-4 text-slate-600">
              {{ e.description }}
            </td>
            <td class="py-3.5 px-5 text-right font-mono font-bold text-slate-900">
              ₱{{ Number(e.amount || 0).toLocaleString() }}
            </td>
          </tr>
          <tr v-if="filteredExpenses.length === 0">
            <td colspan="5" class="py-12 text-center text-xs text-slate-500">No expenses match this view.</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="bg-slate-50/60 font-medium border-t border-slate-200">
            <td colspan="4" class="py-3 px-5 text-slate-500 uppercase tracking-wider text-[11px]">
              Total Displayed Expenses
            </td>
            <td class="py-3 px-5 text-right font-mono font-semibold text-slate-900">
              ₱{{ totalFilteredExpenses.toLocaleString() }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Fast Log Expense Modal -->
    <Teleport to="body">
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200">
          <h3 class="text-sm font-bold text-slate-900">Record Business Expense</h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-700">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleAddExpense" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-slate-700 mb-1">Expense Date *</label>
              <input v-model="newExpense.date" type="date" required class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Amount (PHP) *</label>
              <input v-model.number="newExpense.amount" type="number" min="1" required class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono font-bold text-slate-950 focus:ring-1 focus:ring-brand-500" placeholder="0" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-slate-700 mb-1">Category *</label>
              <select v-model="newExpense.category" required class="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-1 focus:ring-brand-500">
                <option v-for="cat in expenseStore.categories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
              </select>
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Specific Item / Material *</label>
              <input v-model="newExpense.subCategory" list="expense-subcategories" required class="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-1 focus:ring-brand-500" placeholder="e.g. Lumber, Cement..." />
              <datalist id="expense-subcategories">
                <option v-for="sub in activeSubcategories" :key="sub" :value="sub" />
              </datalist>
            </div>
          </div>

          <div>
            <label class="block font-medium text-slate-700 mb-1">Description *</label>
            <textarea v-model="newExpense.description" rows="2" required class="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-1 focus:ring-brand-500" placeholder="e.g. 50 bdft Kiln-dried Lumber for warehouse..." />
          </div>

          <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button type="button" @click="showAddModal = false" class="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-slate-900 text-white font-bold rounded-md hover:bg-slate-800 shadow-sm">Save Expense</button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, Truck, Banknote, X } from 'lucide-vue-next'
import { useExpenseStore } from '@/stores/expenseStore'

const expenseStore = useExpenseStore()

const selectedCategory = ref('All')
const showAddModal = ref(false)

const newExpense = ref({
  date: new Date().toISOString().split('T')[0],
  category: 'Materials',
  subCategory: '',
  description: '',
  amount: null
})

const activeSubcategories = computed(() => {
  const cat = expenseStore.categories.find(c => c.name === newExpense.value.category)
  return cat ? cat.subCategories : []
})

const filteredExpenses = computed(() => {
  if (selectedCategory.value === 'All') return expenseStore.expenses
  return expenseStore.expenses.filter(e => e.category === selectedCategory.value)
})

const totalFilteredExpenses = computed(() => {
  return filteredExpenses.value.reduce((acc, e) => acc + Number(e.amount || 0), 0)
})

function handleAddExpense() {
  expenseStore.addExpense({
    date: newExpense.value.date,
    category: newExpense.value.category,
    subCategory: newExpense.value.subCategory || 'General',
    description: newExpense.value.description,
    amount: newExpense.value.amount
  })
  showAddModal.value = false
  newExpense.value = {
    date: new Date().toISOString().split('T')[0],
    category: 'Materials',
    subCategory: '',
    description: '',
    amount: null
  }
}
</script>
