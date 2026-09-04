<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="page-title">Statements of Account (SOA)</h2>
      </div>
    </div>

    <!-- SOA Table -->
    <div class="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
      <table class="data-table">
        <thead>
          <tr class="data-table-header">
            <th class="py-3 px-5 w-28">SOA Number</th>
            <th class="py-3 px-4 w-28">Billing Date</th>
            <th class="py-3 px-4 w-28">Due Date</th>
            <th class="py-3 px-4">Customer</th>
            <th class="py-3 px-4">DR / PO</th>
            <th class="py-3 px-4 text-right">Invoiced</th>
            <th class="py-3 px-4 text-right">Paid</th>
            <th class="py-3 px-4 text-right">Balance Due</th>
            <th class="py-3 px-4 text-center">Status</th>
            <th class="py-3 px-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-700">
          <tr
            v-for="soa in billingStore.enrichedStatements"
            :key="soa.id"
            class="hover:bg-slate-50/50 transition-colors"
          >
            <td class="py-3.5 px-5 font-mono font-medium text-slate-900">{{ soa.soaNumber }}</td>
            <td class="py-3.5 px-4 font-mono text-slate-500">{{ soa.date }}</td>
            <td class="py-3.5 px-4 font-mono font-medium" :class="soa.agingCategory === 'Overdue' ? 'text-rose-700' : 'text-slate-600'">
              {{ soa.dueDate }}
            </td>
            <td class="py-3.5 px-4 font-medium text-slate-900">{{ soa.customerName }}</td>
            <td class="py-3.5 px-4">
              <span class="font-mono text-slate-700">{{ soa.drNumber }}</span>
              <div class="text-[11px] text-slate-400 font-mono">{{ soa.poNumber }}</div>
            </td>
            <td class="py-3.5 px-4 text-right font-mono text-slate-700">₱{{ soa.totalAmount.toLocaleString() }}</td>
            <td class="py-3.5 px-4 text-right font-mono text-emerald-700 font-medium">
              ₱{{ soa.paidAmount.toLocaleString() }}
            </td>
            <td class="py-3.5 px-4 text-right font-mono font-semibold" :class="soa.balance > 0 ? 'text-slate-900' : 'text-slate-400'">
              ₱{{ soa.balance.toLocaleString() }}
            </td>
            <td class="py-3.5 px-4 text-center">
              <StatusBadge :status="soa.status" />
            </td>
            <td class="py-3.5 px-5 text-right space-x-1.5">
              <button
                @click="openPrintPreview(soa)"
                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-colors shadow-xs"
              >
                <Printer class="w-3.5 h-3.5 text-slate-400" />
                <span>Print</span>
              </button>
              <button
                v-if="soa.balance > 0"
                @click="openPaymentModal(soa)"
                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/70 rounded-md transition-colors shadow-xs"
              >
                <CreditCard class="w-3.5 h-3.5" />
                <span>Pay</span>
              </button>
            </td>
          </tr>
          <tr v-if="billingStore.enrichedStatements.length === 0">
            <td colspan="10" class="py-12 text-center text-xs text-slate-500">No statements yet. An SOA is generated automatically from each billable delivery.</td>
          </tr>
        </tbody>
      </table>
    </div>

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
          :customer="getCustomer(previewingSoa.customerId)"
        />
      </div>
    </div>
    </Teleport>

    <!-- Record Payment Modal -->
    <Teleport to="body">
    <div v-if="showPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Record Payment for {{ paymentForm.soaNumber }}</h3>
            <p class="text-slate-500 mt-0.5">Remaining Balance: <strong>₱{{ paymentForm.maxBalance.toLocaleString() }}</strong></p>
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
              <input v-model="paymentForm.bankName" class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="BDO / BPI" />
            </div>
          </div>

          <div>
            <label class="block font-medium text-slate-700 mb-1">Check No. / Transfer Reference No. *</label>
            <input v-model="paymentForm.referenceNumber" required class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono" placeholder="Check # or online txn ref" />
          </div>

          <div>
            <label class="block font-medium text-slate-700 mb-1">Notes / Remarks</label>
            <input v-model="paymentForm.notes" class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="e.g. Cleared check payment" />
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Printer, CreditCard, X } from 'lucide-vue-next'
import StatusBadge from '@/components/common/StatusBadge.vue'
import StatementOfAccountDoc from '@/components/documents/StatementOfAccountDoc.vue'
import { useBillingStore } from '@/stores/billingStore'
import { useSalesStore } from '@/stores/salesStore'

const billingStore = useBillingStore()
const salesStore = useSalesStore()

const previewingSoa = ref(null)
const showPaymentModal = ref(false)
const paymentForm = ref({
  soaNumber: '',
  customerId: '',
  customerName: '',
  date: new Date().toISOString().split('T')[0],
  amount: 0,
  maxBalance: 0,
  paymentMethod: 'Bank Transfer',
  bankName: 'BDO Unibank',
  referenceNumber: '',
  notes: ''
})

function getCustomer(customerId) {
  return salesStore.customers.find(c => c.id === customerId)
}

function openPrintPreview(soa) {
  previewingSoa.value = soa
}

function triggerPrint() {
  window.print()
}

function openPaymentModal(soa) {
  paymentForm.value = {
    soaNumber: soa.soaNumber,
    customerId: soa.customerId,
    customerName: soa.customerName,
    date: new Date().toISOString().split('T')[0],
    amount: soa.balance,
    maxBalance: soa.balance,
    paymentMethod: 'Bank Transfer',
    bankName: 'BDO Unibank',
    referenceNumber: '',
    notes: `Settlement for ${soa.soaNumber}`
  }
  showPaymentModal.value = true
}

function handleRecordPayment() {
  const payment = billingStore.recordPayment(paymentForm.value)
  if (payment) showPaymentModal.value = false
}
</script>
