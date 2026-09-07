<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="page-title">Salaries & Cash Advances</h2>
      </div>
      <div v-if="activeEmployees.length" class="flex items-center gap-2">
        <button type="button" class="secondary-button" :disabled="!activeEmployees.length" @click="openPayrollModal">
          <Banknote class="h-4 w-4" /> Record Salary
        </button>
        <button type="button" class="primary-button" :disabled="!activeEmployees.length" @click="openAdvanceModal">
          <Plus class="h-4 w-4" /> Add Cash Advance
        </button>
      </div>
    </div>

    <div v-if="employeeStore.isLoading" class="py-8 text-center text-xs text-slate-500" role="status">Loading employee records...</div>
    <div v-else-if="!employeeStore.employees.length" class="section-card px-6 py-10 text-center">
      <h3 class="text-sm font-semibold text-slate-900">Start with your employees</h3>
      <p class="mt-1 text-xs text-slate-500">Add an employee to track salary and cash advances.</p>
      <router-link to="/employees" class="primary-button mt-4">Add Employee</router-link>
    </div>

    <div v-else class="space-y-4">
      <p v-if="!activeEmployees.length" class="text-xs text-slate-500">No active employees. <router-link to="/employees" class="text-brand-800 underline">Manage employees</router-link></p>
      <section class="section-card overflow-x-auto">
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 class="text-sm font-semibold text-slate-900">Cash Advances</h3>
          </div>
          <span class="text-xs text-slate-500">Still owed: <strong class="font-mono text-amber-700">{{ formatCurrency(employeeStore.totalOpenAdvances) }}</strong></span>
        </div>

        <table v-if="employeeStore.cashAdvances.length" class="data-table">
          <thead><tr class="data-table-header"><th class="px-5">Date</th><th class="px-4">Employee</th><th class="px-4 text-right">Amount</th><th class="px-4 text-right">Repaid</th><th class="px-5 text-right">Still owed</th></tr></thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="advance in employeeStore.cashAdvances" :key="advance.id">
              <td class="px-5 font-mono text-slate-500">{{ advance.date }}</td>
              <td class="px-4"><div class="font-medium text-slate-900">{{ advance.employeeName }}</div><div class="mt-0.5 text-[11px] text-slate-400">{{ advance.reason }}</div></td>
              <td class="px-4 text-right font-mono">{{ formatCurrency(advance.amount) }}</td>
              <td class="px-4 text-right font-mono text-brand-700">{{ formatCurrency(advance.deductedAmount) }}</td>
              <td class="px-4 text-right font-mono font-semibold" :class="advance.balance > 0 ? 'text-amber-700' : 'text-slate-400'">{{ formatCurrency(advance.balance) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="px-5 py-6 text-xs text-slate-500">No cash advances yet.</p>
      </section>

      <section class="section-card overflow-hidden">
        <div class="border-b border-slate-200 px-5 py-4">
          <h3 class="text-sm font-semibold text-slate-900">Salary Payments</h3>
        </div>
        <div v-if="employeeStore.payrollRecords.length" class="divide-y divide-slate-100">
          <article v-for="run in employeeStore.payrollRecords" :key="run.id" class="p-5 text-xs">
            <div class="flex items-start justify-between gap-4">
              <div><p class="font-semibold text-slate-900">{{ run.cutoffPeriod }}</p><p class="mt-1 text-slate-500">Paid {{ run.paymentDate }}</p></div>
            </div>
            <dl class="mt-4 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 py-3 text-center">
              <div><dt class="text-[11px] text-slate-500">Salary</dt><dd class="mt-1 font-mono font-semibold text-slate-900">{{ formatCurrency(run.totalGross) }}</dd></div>
              <div><dt class="text-[11px] text-slate-500">Advance deducted</dt><dd class="mt-1 font-mono font-semibold text-brand-700">{{ formatCurrency(run.totalAdvanceDeductions) }}</dd></div>
              <div><dt class="text-[11px] text-slate-500">Paid to employees</dt><dd class="mt-1 font-mono font-semibold text-slate-900">{{ formatCurrency(run.totalNetPaid) }}</dd></div>
            </dl>
          </article>
        </div>
        <p v-else class="px-5 py-6 text-xs text-slate-500">No salary payments yet.</p>
      </section>
    </div>

    <Teleport to="body">
      <div v-if="showAdvanceModal" class="modal-backdrop">
        <div class="modal-panel max-w-md" role="dialog" aria-modal="true" aria-labelledby="advance-title">
          <div class="modal-header">
            <div>
              <h3 id="advance-title">Add Cash Advance</h3>
            </div>
            <button type="button" class="icon-button" aria-label="Close" @click="showAdvanceModal = false"><X class="h-4 w-4" /></button>
          </div>
          <form class="space-y-4 p-6" @submit.prevent="handleIssueAdvance">
            <div><label class="form-label" for="advance-employee">Employee *</label><select id="advance-employee" v-model="newAdvance.employeeId" class="form-control" required><option v-for="employee in activeEmployees" :key="employee.id" :value="employee.id">{{ employee.name }} — {{ employee.position }}</option></select></div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="form-label" for="advance-date">Date Issued *</label><input id="advance-date" v-model="newAdvance.date" class="form-control" type="date" required></div>
              <div><label class="form-label" for="advance-amount">Amount (PHP) *</label><input id="advance-amount" v-model.number="newAdvance.amount" class="form-control font-mono font-bold" type="number" min="1" step="0.01" required></div>
            </div>
            <div><label class="form-label" for="advance-reason">Note (optional)</label><input id="advance-reason" v-model.trim="newAdvance.reason" class="form-control" placeholder="What is this advance for?"></div>
            <div class="modal-actions"><button type="button" class="secondary-button" @click="showAdvanceModal = false">Cancel</button><button type="submit" class="primary-button">Save Advance</button></div>
          </form>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showPayrollModal" class="modal-backdrop">
        <div class="modal-panel max-w-3xl" role="dialog" aria-modal="true" aria-labelledby="payroll-title">
          <div class="modal-header">
            <div>
              <h3 id="payroll-title">Record Salary</h3>
              <p class="mt-0.5 text-xs text-slate-500">Enter salary and any cash advance to deduct.</p>
            </div>
            <button type="button" class="icon-button" aria-label="Close" @click="showPayrollModal = false"><X class="h-4 w-4" /></button>
          </div>
          <form class="max-h-[80vh] overflow-y-auto p-6" @submit.prevent="handleRecordPayroll">
            <div class="mb-4 grid grid-cols-2 gap-3">
              <div><label class="form-label" for="payroll-period">Payroll period *</label><input id="payroll-period" v-model.trim="newPayroll.cutoffPeriod" class="form-control" required placeholder="e.g. Sep 1–15, 2026"></div>
              <div><label class="form-label" for="payroll-date">Payment date *</label><input id="payroll-date" v-model="newPayroll.paymentDate" class="form-control" type="date" required></div>
            </div>

            <div class="overflow-x-auto rounded-lg border border-slate-200">
              <table class="data-table">
                <thead><tr class="data-table-header"><th class="px-4">Employee</th><th class="px-4 text-right">Salary</th><th class="px-4 text-right">Advance owed</th><th class="px-4 text-right">Deduct</th><th class="px-4 text-right">Pay now</th></tr></thead>
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

            <div class="mt-4 flex items-center justify-between rounded-lg bg-brand-50 px-4 py-3 text-sm">
              <span class="text-brand-900">Total to pay</span>
              <strong class="font-mono text-brand-950">{{ formatCurrency(payrollTotals.net) }}</strong>
            </div>
            <div class="modal-actions mt-4"><button type="button" class="secondary-button" @click="showPayrollModal = false">Cancel</button><button type="submit" class="primary-button" :disabled="payrollTotals.gross <= 0">Save Salary Payment</button></div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Banknote, Plus, X } from 'lucide-vue-next'
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
