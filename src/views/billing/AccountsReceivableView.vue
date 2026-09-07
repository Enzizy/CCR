<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="page-title">Unpaid Balances</h2>
        <p class="text-xs text-slate-500 mt-0.5">See what each customer still owes and record payments when received.</p>
      </div>

      <div class="text-right text-xs bg-white border border-slate-200/80 px-4 py-2 rounded-xl shadow-xs">
        <span class="text-slate-400 block text-[11px] font-medium">Total Outstanding</span>
        <span class="font-mono font-semibold text-base text-slate-900">₱{{ billingStore.totalReceivables.toLocaleString() }}</span>
      </div>
    </div>

    <!-- Aging Buckets Ribbon -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Not due yet</span>
          <span class="w-2 h-2 rounded-full bg-slate-400"></span>
        </div>
        <div class="mt-2 text-2xl font-semibold font-mono tracking-tight text-slate-900">
          ₱{{ billingStore.agingSummary.current.toLocaleString() }}
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-amber-200/80 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-amber-700">Due within 7 days</span>
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
        </div>
        <div class="mt-2 text-2xl font-semibold font-mono tracking-tight text-amber-800">
          ₱{{ billingStore.agingSummary.dueSoon.toLocaleString() }}
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-rose-200/80 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-rose-700">Overdue</span>
          <span class="w-2 h-2 rounded-full bg-rose-500"></span>
        </div>
        <div class="mt-2 text-2xl font-semibold font-mono tracking-tight text-rose-800">
          ₱{{ billingStore.agingSummary.overdue.toLocaleString() }}
        </div>
      </div>
    </div>

    <!-- Customer Balances & Breakdown -->
    <div class="space-y-6">
      <div v-if="billingStore.customerReceivables.length === 0" class="section-card empty-state">
        <h3>No receivables yet</h3>
        <p>Customer balances will appear after a billable delivery generates an SOA.</p>
      </div>
      <div
        v-for="cust in billingStore.customerReceivables"
        :key="cust.customerId"
        class="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-x-auto"
      >
        <div class="px-6 py-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 class="text-sm font-semibold text-slate-900">{{ cust.customerName }}</h3>
            <div class="flex items-center gap-3 text-xs text-slate-500 font-mono mt-0.5">
              <span>Billed: ₱{{ cust.totalInvoiced.toLocaleString() }}</span>
              <span class="text-slate-300">•</span>
              <span class="text-emerald-700 font-medium">Collected: ₱{{ cust.totalCollected.toLocaleString() }}</span>
            </div>
          </div>

          <div class="text-right">
            <span class="text-[11px] text-slate-400 font-medium block">Total Outstanding</span>
            <span class="text-sm font-mono font-semibold text-slate-900">₱{{ cust.totalOutstanding.toLocaleString() }}</span>
          </div>
        </div>

        <!-- SOAs for this Customer -->
        <table class="data-table">
          <thead>
            <tr class="data-table-header">
              <th class="py-2.5 px-6">SOA Reference</th>
              <th class="py-2.5 px-4">Billing Date</th>
              <th class="py-2.5 px-4">Due Date</th>
              <th class="py-2.5 px-4 text-right">Invoiced</th>
              <th class="py-2.5 px-4 text-right">Paid</th>
              <th class="py-2.5 px-4 text-right">Balance</th>
              <th class="py-2.5 px-4 text-center">Payment Status</th>
              <th class="py-2.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-for="soa in cust.soas" :key="soa.id" class="hover:bg-slate-50/40 transition-colors">
              <td class="py-3 px-6 font-mono font-medium text-slate-900">
                {{ soa.soaNumber }}
                <span class="text-slate-400 font-normal ml-1">({{ soa.drNumber }})</span>
              </td>
              <td class="py-3 px-4 font-mono text-slate-500">{{ soa.date }}</td>
              <td class="py-3 px-4 font-mono font-medium" :class="soa.agingCategory === 'Overdue' ? 'text-rose-700' : 'text-slate-600'">{{ soa.dueDate }}</td>
              <td class="py-3 px-4 text-right font-mono text-slate-700">₱{{ soa.totalAmount.toLocaleString() }}</td>
              <td class="py-3 px-4 text-right font-mono text-emerald-700 font-medium">₱{{ soa.paidAmount.toLocaleString() }}</td>
              <td class="py-3 px-4 text-right font-mono font-semibold text-slate-900">₱{{ soa.balance.toLocaleString() }}</td>
              <td class="py-3 px-4 text-center">
                <StatusBadge :status="soa.status" />
              </td>
              <td class="py-3 px-6 text-right space-x-1.5">
                <button
                  @click="openPrintPreview(soa)"
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-colors shadow-xs"
                >
                  <Printer class="w-3.5 h-3.5 text-slate-400" />
                  <span>Print</span>
                </button>
                <button
                  v-if="soa.balance > 0"
                  @click="openPaymentModal(soa)"
                  class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 rounded-md transition-colors shadow-xs"
                >
                  <CreditCard class="w-3.5 h-3.5" />
                  <span>Record Payment</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Direct Record Payment Modal -->
    <Teleport to="body">
      <div v-if="showPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Record Payment for {{ paymentForm.soaNumber }}</h3>
              <p class="text-slate-500 mt-0.5">Remaining Balance: <strong class="font-mono text-rose-700">₱{{ paymentForm.maxBalance.toLocaleString() }}</strong></p>
            </div>
            <button @click="showPaymentModal = false" class="text-slate-400 hover:text-slate-700">
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="handleRecordPayment" class="space-y-3">
            <div>
              <label class="block font-medium text-slate-700 mb-1">Payment Date *</label>
              <input v-model="paymentForm.date" type="date" required class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono" />
            </div>

            <div>
              <label class="block font-medium text-slate-700 mb-1">Payment Amount (PHP) *</label>
              <input v-model.number="paymentForm.amount" type="number" min="1" :max="paymentForm.maxBalance" required class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono font-bold text-slate-950 text-sm" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-slate-700 mb-1">Payment Method *</label>
                <select v-model="paymentForm.paymentMethod" class="w-full px-3 py-2 border rounded-md border-slate-300">
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Check">Check</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div>
                <label class="block font-medium text-slate-700 mb-1">Depository Bank</label>
                <input v-model="paymentForm.bankName" class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="e.g. Metrobank / BDO" />
              </div>
            </div>

            <div>
              <label class="block font-medium text-slate-700 mb-1">Check No. / Transfer Reference No. *</label>
              <input v-model="paymentForm.referenceNumber" required class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono" placeholder="Check # or online txn ref" />
            </div>

            <div>
              <label class="block font-medium text-slate-700 mb-1">Notes / Remarks</label>
              <input v-model="paymentForm.notes" class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="e.g. Partial remittance" />
            </div>

            <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button type="button" @click="showPaymentModal = false" class="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
              <button type="submit" class="px-4 py-2 bg-emerald-700 text-white font-bold rounded-md hover:bg-emerald-800 shadow-sm">
                Record Official Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Print Modal Container -->
    <Teleport to="body">
      <div v-if="previewingSoa" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4 md:p-8 backdrop-blur-xs flex flex-col items-center">
        <div class="no-print w-full max-w-4xl mb-4 bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
          <button
            @click="previewingSoa = null"
            class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md"
          >
            <X class="w-4 h-4" />
            <span>Close Preview</span>
          </button>

          <button
            @click="triggerPrint"
            class="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-sm"
          >
            <Printer class="w-4 h-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>

        <div class="w-full">
          <StatementOfAccountDoc
            :statement="previewingSoa"
            class="shadow-xl"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Printer, CreditCard, X } from 'lucide-vue-next'
import StatusBadge from '@/components/common/StatusBadge.vue'
import StatementOfAccountDoc from '@/components/documents/StatementOfAccountDoc.vue'
import { useBillingStore } from '@/stores/billingStore'

const billingStore = useBillingStore()

const showPaymentModal = ref(false)
const previewingSoa = ref(null)

const paymentForm = ref({
  soaNumber: '',
  customerId: '',
  customerName: '',
  date: new Date().toISOString().split('T')[0],
  amount: 0,
  maxBalance: 0,
  paymentMethod: 'Bank Transfer',
  bankName: 'Metrobank',
  referenceNumber: '',
  notes: ''
})

function openPaymentModal(soa) {
  paymentForm.value = {
    soaNumber: soa.soaNumber,
    customerId: soa.customerId,
    customerName: soa.customerName,
    date: new Date().toISOString().split('T')[0],
    amount: soa.balance,
    maxBalance: soa.balance,
    paymentMethod: 'Bank Transfer',
    bankName: 'Metrobank',
    referenceNumber: '',
    notes: ''
  }
  showPaymentModal.value = true
}

function handleRecordPayment() {
  billingStore.recordPayment({
    soaNumber: paymentForm.value.soaNumber,
    customerId: paymentForm.value.customerId,
    customerName: paymentForm.value.customerName,
    date: paymentForm.value.date,
    amount: paymentForm.value.amount,
    paymentMethod: paymentForm.value.paymentMethod,
    bankName: paymentForm.value.bankName,
    referenceNumber: paymentForm.value.referenceNumber,
    notes: paymentForm.value.notes
  })
  showPaymentModal.value = false
}

function openPrintPreview(soa) {
  previewingSoa.value = soa
}

function triggerPrint() {
  window.print()
}
</script>

