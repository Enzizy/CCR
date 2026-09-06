<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="page-title">Salaries & Cash Advances</h2>
        <p class="text-xs text-slate-500 mt-0.5">Manage worker cash advances (vales), deduct balances during cutoff, and record official labor expenses.</p>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" class="secondary-button" :disabled="!activeEmployees.length" @click="openPayrollModal">
          <Banknote class="h-4 w-4" /> Record Payroll
        </button>
        <button type="button" class="primary-button" :disabled="!activeEmployees.length" @click="openAdvanceModal">
          <Plus class="h-4 w-4" /> Issue Cash Advance / Vale
        </button>
      </div>
    </div>

    <div v-if="!activeEmployees.length" class="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
      <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
      <p>Add an active employee before recording payroll or issuing a cash advance (vale). <router-link to="/employees" class="font-semibold underline">Go to Employees & Workers</router-link>.</p>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <section class="section-card overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 class="text-sm font-semibold text-slate-900">Worker Vale Ledger</h3>
            <p class="text-[11px] text-slate-500 mt-0.5">Active cash advances awaiting payroll deduction</p>
          </div>
          <span class="text-xs text-slate-500">Open balance: <strong class="font-mono text-amber-700">{{ formatCurrency(employeeStore.totalOpenAdvances) }}</strong></span>
        </div>

        <table v-if="employeeStore.cashAdvances.length" class="data-table">
          <thead><tr class="data-table-header"><th class="px-5">Date</th><th class="px-4">Employee</th><th class="px-4 text-right">Vale Issued</th><th class="px-4 text-right">Deducted</th><th class="px-4 text-right">Remaining Vale</th><th class="px-5 text-center">Status</th></tr></thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="advance in employeeStore.cashAdvances" :key="advance.id">
              <td class="px-5 font-mono text-slate-500">{{ advance.date }}</td>
              <td class="px-4"><div class="font-medium text-slate-900">{{ advance.employeeName }}</div><div class="mt-0.5 text-[11px] text-slate-400">{{ advance.reason }}</div></td>
              <td class="px-4 text-right font-mono">{{ formatCurrency(advance.amount) }}</td>
              <td class="px-4 text-right font-mono text-brand-700">{{ formatCurrency(advance.deductedAmount) }}</td>
              <td class="px-4 text-right font-mono font-semibold" :class="advance.balance > 0 ? 'text-amber-700' : 'text-slate-400'">{{ formatCurrency(advance.balance) }}</td>
              <td class="px-5 text-center"><StatusBadge :status="advance.status" /></td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state min-h-56"><WalletCards class="h-5 w-5 text-brand-700" /><h3>No cash advances (vales) recorded</h3><p>Employee advances and payroll deductions will appear here.</p></div>
      </section>

      <section class="section-card overflow-hidden">
        <div class="border-b border-slate-200 px-5 py-4">
          <h3 class="text-sm font-semibold text-slate-900">Payroll Cutoff History</h3>
          <p class="text-[11px] text-slate-500 mt-0.5">Historical pay run summaries with auto-logged labor expenses</p>
        </div>
        <div v-if="employeeStore.payrollRecords.length" class="divide-y divide-slate-100">
          <article v-for="run in employeeStore.payrollRecords" :key="run.id" class="p-5 text-xs">
            <div class="flex items-start justify-between gap-4">
              <div><p class="font-mono font-semibold text-slate-900">{{ run.payrollRef }}</p><p class="mt-1 text-slate-500">{{ run.cutoffPeriod }} · Paid {{ run.paymentDate }}</p></div>
              <StatusBadge :status="run.status" />
            </div>
            <dl class="mt-4 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 py-3 text-center">
              <div><dt class="text-[10px] uppercase tracking-wide text-slate-500">Gross Wage (Labor Exp)</dt><dd class="mt-1 font-mono font-semibold text-slate-900">{{ formatCurrency(run.totalGross) }}</dd></div>
              <div><dt class="text-[10px] uppercase tracking-wide text-slate-500">Vale Deducted</dt><dd class="mt-1 font-mono font-semibold text-brand-700">{{ formatCurrency(run.totalAdvanceDeductions) }}</dd></div>
              <div><dt class="text-[10px] uppercase tracking-wide text-slate-500">Net Take-Home Pay</dt><dd class="mt-1 font-mono font-semibold text-slate-900">{{ formatCurrency(run.totalNetPaid) }}</dd></div>
            </dl>
          </article>
        </div>
        <div v-else class="empty-state min-h-56"><Banknote class="h-5 w-5 text-brand-700" /><h3>No payroll records yet</h3><p>Recorded payroll creates the corresponding labor expense automatically.</p></div>
      </section>
    </div>

    <Teleport to="body">
      <div v-if="showAdvanceModal" class="modal-backdrop">
        <div class="modal-panel max-w-md" role="dialog" aria-modal="true" aria-labelledby="advance-title">
          <div class="modal-header">
            <div>
              <h3 id="advance-title">Issue Cash Advance / Vale</h3>
              <p class="text-[11px] text-slate-500 mt-0.5">Record money advanced to a worker prior to regular payroll cutoff.</p>
            </div>
            <button type="button" class="icon-button" aria-label="Close" @click="showAdvanceModal = false"><X class="h-4 w-4" /></button>
          </div>
          <form class="space-y-4 p-6" @submit.prevent="handleIssueAdvance">
            <div><label class="form-label" for="advance-employee">Employee *</label><select id="advance-employee" v-model="newAdvance.employeeId" class="form-control" required><option v-for="employee in activeEmployees" :key="employee.id" :value="employee.id">{{ employee.name }} — {{ employee.position }}</option></select></div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="form-label" for="advance-date">Date Issued *</label><input id="advance-date" v-model="newAdvance.date" class="form-control" type="date" required></div>
              <div><label class="form-label" for="advance-amount">Vale Amount (PHP) *</label><input id="advance-amount" v-model.number="newAdvance.amount" class="form-control font-mono font-bold" type="number" min="1" step="0.01" required></div>
            </div>
            <div><label class="form-label" for="advance-reason">Reason or Purpose *</label><textarea id="advance-reason" v-model.trim="newAdvance.reason" class="form-control" rows="2" required placeholder="e.g. Family emergency, personal needs..."></textarea></div>
            <div class="modal-actions"><button type="button" class="secondary-button" @click="showAdvanceModal = false">Cancel</button><button type="submit" class="primary-button">Issue Vale</button></div>
          </form>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showPayrollModal" class="modal-backdrop">
        <div class="modal-panel max-w-3xl" role="dialog" aria-modal="true" aria-labelledby="payroll-title">
          <div class="modal-header">
            <div>
              <h3 id="payroll-title">Record Payroll Cutoff</h3>
              <p class="mt-0.5 text-xs text-slate-500">Gross salary becomes a central labor expense. Vale deductions reduce the worker's open cash balance without duplicating labor expenses.</p>
            </div>
            <button type="button" class="icon-button" aria-label="Close" @click="showPayrollModal = false"><X class="h-4 w-4" /></button>
          </div>
          <form class="max-h-[80vh] overflow-y-auto p-6" @submit.prevent="handleRecordPayroll">
            <div class="mb-4 grid grid-cols-2 gap-3">
              <div><label class="form-label" for="payroll-period">Payroll period *</label><input id="payroll-period" v-model.trim="newPayroll.cutoffPeriod" class="form-control" required placeholder="e.g. Sep 1–15, 2026"></div>
              <div><label class="form-label" for="payroll-date">Payment date *</label><input id="payroll-date" v-model="newPayroll.paymentDate" class="form-control" type="date" required></div>
            </div>

            <div class="overflow-hidden rounded-lg border border-slate-200">
              <table class="data-table">
                <thead><tr class="data-table-header"><th class="px-4">Employee</th><th class="px-4 text-right">Gross salary</th><th class="px-4 text-right">Available vale</th><th class="px-4 text-right">Vale deduction</th><th class="px-4 text-right">Net take-home pay</th></tr></thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="entry in newPayroll.entries" :key="entry.employeeId">
                    <td class="px-4"><span class="font-medium text-slate-900">{{ entry.employeeName }}</span><span class="mt-0.5 block text-[11px] text-slate-400">{{ entry.position }}</span></td>
                    <td class="px-4"><input v-model.number="entry.grossSalary" class="form-control ml-auto w-28 text-right font-mono" type="number" min="0" step="0.01"></td>
                    <td class="px-4 text-right font-mono text-slate-500">{{ formatCurrency(advanceBalance(entry.employeeId)) }}</td>
                    <td class="px-4"><input v-model.number="entry.advanceDeduction" class="form-control ml-auto w-28 text-right font-mono text-brand-800 font-bold" type="number" min="0" :max="Math.min(entry.grossSalary || 0, advanceBalance(entry.employeeId))" step="0.01"></td>
                    <td class="px-4 text-right font-mono font-semibold text-slate-900">{{ formatCurrency(Math.max(0, (entry.grossSalary || 0) - (entry.advanceDeduction || 0))) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-4 flex items-center justify-between border-y border-slate-200 bg-slate-50 px-4 py-3 text-xs">
              <div class="text-[11px] text-slate-500">
                Formula: <span class="font-mono text-slate-700 font-medium">Gross Wage − Vale Deduction = Net Take-Home Pay</span>
              </div>
              <div class="flex items-center gap-6">
                <span>Gross: <strong class="font-mono">{{ formatCurrency(payrollTotals.gross) }}</strong></span>
                <span>Vale deductions: <strong class="font-mono text-brand-700">-{{ formatCurrency(payrollTotals.deductions) }}</strong></span>
                <span>Net paid: <strong class="font-mono text-slate-950 font-bold">{{ formatCurrency(payrollTotals.net) }}</strong></span>
              </div>
            </div>
            <div class="modal-actions mt-4"><button type="button" class="secondary-button" @click="showPayrollModal = false">Cancel</button><button type="submit" class="primary-button" :disabled="payrollTotals.gross <= 0">Record Payroll & Expense</button></div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { AlertCircle, Banknote, Plus, WalletCards, X } from 'lucide-vue-next'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useEmployeeStore } from '@/stores/employeeStore'

const employeeStore = useEmployeeStore()
const showAdvanceModal = ref(false)
const showPayrollModal = ref(false)
const activeEmployees = computed(() => employeeStore.employees.filter(employee => employee.status === 'Active'))

function emptyAdvance() {
  return { employeeId: '', date: new Date().toISOString().split('T')[0], amount: null, reason: '' }
}

function emptyPayroll() {
  return { cutoffPeriod: '', paymentDate: new Date().toISOString().split('T')[0], entries: [] }
}

const newAdvance = ref(emptyAdvance())
const newPayroll = ref(emptyPayroll())

const payrollTotals = computed(() => newPayroll.value.entries.reduce((totals, entry) => {
  const gross = Number(entry.grossSalary) || 0
  const deduction = Math.min(Number(entry.advanceDeduction) || 0, gross, advanceBalance(entry.employeeId))
  totals.gross += gross
  totals.deductions += deduction
  totals.net += gross - deduction
  return totals
}, { gross: 0, deductions: 0, net: 0 }))

function advanceBalance(employeeId) {
  return employeeStore.employeeAdvancesMap[employeeId] || 0
}

function openAdvanceModal() {
  if (!activeEmployees.value.length) return
  newAdvance.value = { ...emptyAdvance(), employeeId: activeEmployees.value[0].id }
  showAdvanceModal.value = true
}

function openPayrollModal() {
  if (!activeEmployees.value.length) return
  newPayroll.value = {
    ...emptyPayroll(),
    entries: activeEmployees.value.map(employee => ({ employeeId: employee.id, employeeName: employee.name, position: employee.position, grossSalary: 0, advanceDeduction: 0 }))
  }
  showPayrollModal.value = true
}

function handleIssueAdvance() {
  employeeStore.addCashAdvance(newAdvance.value)
  showAdvanceModal.value = false
}

function handleRecordPayroll() {
  if (payrollTotals.value.gross <= 0) return
  employeeStore.recordPayroll(newPayroll.value)
  showPayrollModal.value = false
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 }).format(value || 0)
}
</script>
