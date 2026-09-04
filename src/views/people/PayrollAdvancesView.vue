<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-base font-semibold text-slate-900 tracking-tight">Payroll Payouts & Cash Advances</h2>
      </div>

      <button
        @click="showAdvanceModal = true"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-lg shadow-xs transition-colors"
      >
        <Plus class="w-4 h-4" />
        <span>Issue Cash Advance</span>
      </button>
    </div>

    <!-- Rule Callout -->
    <div class="p-4 bg-sky-50/60 border border-sky-200/70 rounded-xl flex items-start gap-3">
      <AlertCircle class="w-4 h-4 text-sky-700 mt-0.5 shrink-0" />
      <div class="text-xs">
        <span class="font-medium text-sky-950">Accounting Integrity Rule:</span>
        <p class="text-slate-600 mt-0.5 font-normal">
          Cash advances are tracked as an employee receivable, not an immediate business expense. When salary is paid with a cash advance deduction, the system records the true labor cost in the central expenses while settling the advance receivable cleanly.
        </p>
      </div>
    </div>

    <!-- Dual Sections: Active Cash Advances & Recent Payroll Runs -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Cash Advances Ledger -->
      <div class="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-slate-900">Employee Cash Advance Ledger</h3>
          </div>
          <div class="text-[11px] font-mono font-medium text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/70">
            Total Open: ₱{{ employeeStore.totalOpenAdvances.toLocaleString() }}
          </div>
        </div>

        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50/60 border-b border-slate-100 text-slate-400 font-medium uppercase text-[11px] tracking-wider">
              <th class="py-2.5 px-5">Date</th>
              <th class="py-2.5 px-4">Employee</th>
              <th class="py-2.5 px-4 text-right">Advanced</th>
              <th class="py-2.5 px-4 text-right">Deducted</th>
              <th class="py-2.5 px-4 text-right">Remaining</th>
              <th class="py-2.5 px-5 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-for="ca in employeeStore.cashAdvances" :key="ca.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="py-3 px-5 font-mono text-slate-500">{{ ca.date }}</td>
              <td class="py-3 px-4">
                <div class="font-medium text-slate-900">{{ ca.employeeName }}</div>
                <div class="text-[11px] text-slate-400">{{ ca.reason }}</div>
              </td>
              <td class="py-3 px-4 text-right font-mono text-slate-700">₱{{ ca.amount.toLocaleString() }}</td>
              <td class="py-3 px-4 text-right font-mono text-emerald-700 font-medium">₱{{ ca.deductedAmount.toLocaleString() }}</td>
              <td class="py-3 px-4 text-right font-mono font-medium" :class="ca.balance > 0 ? 'text-amber-800' : 'text-slate-400'">
                ₱{{ ca.balance.toLocaleString() }}
              </td>
              <td class="py-3 px-5 text-center">
                <StatusBadge :status="ca.status" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Historical Payroll Payouts -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Recent Payroll Cutoffs</h3>
          </div>
        </div>

        <div class="p-4 space-y-4">
          <div
            v-for="run in employeeStore.payrollRecords"
            :key="run.id"
            class="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-3 text-xs"
          >
            <div class="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <span class="font-mono font-bold text-slate-900">{{ run.payrollRef }}</span>
                <span class="ml-2 font-semibold text-slate-700">{{ run.cutoffPeriod }}</span>
              </div>
              <span class="font-mono text-slate-500">Paid: {{ run.paymentDate }}</span>
            </div>

            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="p-2 bg-white rounded border border-slate-200">
                <div class="text-[10px] text-slate-500 uppercase font-semibold">Gross Earned</div>
                <div class="font-mono font-bold text-slate-900 text-sm mt-0.5">₱{{ run.totalGross.toLocaleString() }}</div>
              </div>
              <div class="p-2 bg-white rounded border border-slate-200">
                <div class="text-[10px] text-slate-500 uppercase font-semibold">Advance Deducted</div>
                <div class="font-mono font-bold text-emerald-700 text-sm mt-0.5">- ₱{{ run.totalAdvanceDeductions.toLocaleString() }}</div>
              </div>
              <div class="p-2 bg-white rounded border border-slate-200">
                <div class="text-[10px] text-slate-500 uppercase font-semibold">Net Cash Disbursed</div>
                <div class="font-mono font-bold text-brand-800 text-sm mt-0.5">₱{{ run.totalNetPaid.toLocaleString() }}</div>
              </div>
            </div>

            <div class="space-y-1 pt-1">
              <div
                v-for="(e, idx) in run.entries"
                :key="idx"
                class="flex items-center justify-between text-[11px] text-slate-600"
              >
                <span>{{ e.employeeName }}</span>
                <span class="font-mono">Gross: ₱{{ e.grossSalary.toLocaleString() }} | Net: ₱{{ e.netPaid.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Issue Cash Advance Modal -->
    <div v-if="showAdvanceModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200">
          <h3 class="text-sm font-bold text-slate-900">Issue Employee Cash Advance</h3>
          <button @click="showAdvanceModal = false" class="text-slate-400 hover:text-slate-700">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleIssueAdvance" class="space-y-3">
          <div>
            <label class="block font-medium text-slate-700 mb-1">Employee *</label>
            <select v-model="newAdvance.employeeId" required class="w-full px-3 py-2 border rounded-md border-slate-300">
              <option v-for="emp in employeeStore.employees" :key="emp.id" :value="emp.id">
                {{ emp.name }} ({{ emp.position }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-slate-700 mb-1">Date *</label>
              <input v-model="newAdvance.date" type="date" required class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono" />
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Advance Amount (PHP) *</label>
              <input v-model.number="newAdvance.amount" type="number" min="100" required class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono font-bold text-slate-950" placeholder="2000" />
            </div>
          </div>

          <div>
            <label class="block font-medium text-slate-700 mb-1">Reason / Notes *</label>
            <textarea v-model="newAdvance.reason" rows="2" required class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="Emergency, tuition, family support..."></textarea>
          </div>

          <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button type="button" @click="showAdvanceModal = false" class="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-slate-900 text-white font-bold rounded-md hover:bg-slate-800 shadow-sm">
              Issue Advance
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, AlertCircle, X } from 'lucide-vue-next'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useEmployeeStore } from '@/stores/employeeStore'

const employeeStore = useEmployeeStore()

const showAdvanceModal = ref(false)
const newAdvance = ref({
  employeeId: 'emp-1',
  date: new Date().toISOString().split('T')[0],
  amount: 2000,
  reason: ''
})

function handleIssueAdvance() {
  employeeStore.addCashAdvance(newAdvance.value)
  showAdvanceModal.value = false
  newAdvance.value = {
    employeeId: 'emp-1',
    date: new Date().toISOString().split('T')[0],
    amount: 2000,
    reason: ''
  }
}
</script>

