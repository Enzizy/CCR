<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="page-title">Collections & Official Payments Received</h2>
        <p class="text-xs text-slate-500 mt-0.5">Track verified customer remittances, check payments, and bank deposit acknowledgments.</p>
      </div>

      <div class="flex items-center gap-3">
        <div class="text-right text-xs bg-emerald-50 px-3.5 py-1.5 rounded-lg border border-emerald-200">
          <span class="text-emerald-800 font-semibold block text-[10px] uppercase tracking-wider">Total Collections</span>
          <span class="font-mono font-bold text-base text-emerald-950">₱{{ billingStore.totalCollections.toLocaleString() }}</span>
        </div>

        <button
          @click="openRecordPaymentModal"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
        >
          <Plus class="w-4 h-4" />
          <span>Record Payment</span>
        </button>
      </div>
    </div>

    <!-- Payments Table -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <table class="data-table">
        <thead>
          <tr class="data-table-header">
            <th class="py-3 px-4 w-28">Receipt #</th>
            <th class="py-3 px-4 w-28">Payment Date</th>
            <th class="py-3 px-4">Customer Name</th>
            <th class="py-3 px-4">Applied to SOA</th>
            <th class="py-3 px-4 w-28">Method</th>
            <th class="py-3 px-4">Bank / Reference No.</th>
            <th class="py-3 px-4 text-right">Amount Received</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="pay in billingStore.payments"
            :key="pay.id"
            class="hover:bg-slate-50/70 transition-colors"
          >
            <td class="py-3.5 px-4 font-mono font-bold text-slate-900">{{ pay.receiptNumber }}</td>
            <td class="py-3.5 px-4 font-mono text-slate-600">{{ pay.date }}</td>
            <td class="py-3.5 px-4 font-bold text-slate-900">{{ pay.customerName }}</td>
            <td class="py-3.5 px-4 font-mono font-semibold text-brand-700">
              {{ pay.soaNumber }}
            </td>
            <td class="py-3.5 px-4">
              <span class="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-medium text-[11px]">
                {{ pay.paymentMethod }}
              </span>
            </td>
            <td class="py-3.5 px-4">
              <div class="font-mono text-slate-900">{{ pay.referenceNumber }}</div>
              <div class="text-[11px] text-slate-500 font-normal">{{ pay.bankName }}</div>
            </td>
            <td class="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
              ₱{{ pay.amount.toLocaleString() }}
            </td>
          </tr>
          <tr v-if="billingStore.payments.length === 0">
            <td colspan="7" class="py-12 text-center text-xs text-slate-500">No payments recorded yet.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Record Payment Modal -->
    <Teleport to="body">
      <div v-if="showPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Record Customer Payment</h3>
              <p class="text-slate-500 mt-0.5">Apply cash, check, or online bank deposit to an outstanding Statement of Account.</p>
            </div>
            <button @click="showPaymentModal = false" class="text-slate-400 hover:text-slate-700">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div v-if="unpaidStatements.length === 0" class="py-8 text-center space-y-3">
            <CheckCircle2 class="w-8 h-8 text-emerald-600 mx-auto" />
            <p class="text-slate-700 font-medium">All Statements of Account are fully paid!</p>
            <p class="text-slate-400 text-[11px]">New statements will appear once new billable deliveries are dispatched.</p>
          </div>

          <form v-else @submit.prevent="handleRecordPayment" class="space-y-3">
            <div>
              <label class="block font-medium text-slate-700 mb-1">Select Statement of Account (SOA) *</label>
              <select
                v-model="paymentForm.soaNumber"
                @change="onSoaSelect"
                required
                class="w-full px-3 py-2 border rounded-md border-slate-300 font-medium"
              >
                <option disabled value="">Choose an open statement</option>
                <option v-for="soa in unpaidStatements" :key="soa.id" :value="soa.soaNumber">
                  {{ soa.soaNumber }} — {{ soa.customerName }} (Due: ₱{{ soa.balance.toLocaleString() }})
                </option>
              </select>
            </div>

            <div v-if="selectedStatement" class="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div class="flex justify-between text-slate-500">
                <span>Customer:</span>
                <strong class="text-slate-900">{{ selectedStatement.customerName }}</strong>
              </div>
              <div class="flex justify-between text-slate-500">
                <span>Original Invoice:</span>
                <span class="font-mono text-slate-800">₱{{ selectedStatement.totalAmount.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-slate-500">
                <span>Current Balance Due:</span>
                <strong class="font-mono text-rose-700 text-sm">₱{{ selectedStatement.balance.toLocaleString() }}</strong>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-slate-700 mb-1">Payment Date *</label>
                <input v-model="paymentForm.date" type="date" required class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono" />
              </div>
              <div>
                <label class="block font-medium text-slate-700 mb-1">Amount (PHP) *</label>
                <input
                  v-model.number="paymentForm.amount"
                  type="number"
                  min="1"
                  :max="selectedStatement?.balance || 9999999"
                  required
                  class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono font-bold text-slate-950 text-sm"
                />
              </div>
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
              <input v-model="paymentForm.notes" class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="e.g. Full settlement via online transfer" />
            </div>

            <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button type="button" @click="showPaymentModal = false" class="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
              <button type="submit" :disabled="!paymentForm.amount || paymentForm.amount <= 0" class="px-4 py-2 bg-emerald-700 text-white font-bold rounded-md hover:bg-emerald-800 shadow-sm disabled:opacity-50">
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
import { ref, computed } from 'vue'
import { Plus, X, CheckCircle2 } from 'lucide-vue-next'
import { useBillingStore } from '@/stores/billingStore'

const billingStore = useBillingStore()

const showPaymentModal = ref(false)
const selectedStatement = ref(null)

const paymentForm = ref({
  soaNumber: '',
  date: new Date().toISOString().split('T')[0],
  amount: 0,
  paymentMethod: 'Bank Transfer',
  bankName: 'Metrobank',
  referenceNumber: '',
  notes: ''
})

const unpaidStatements = computed(() => {
  return billingStore.enrichedStatements.filter(s => s.balance > 0)
})

function openRecordPaymentModal() {
  selectedStatement.value = null
  paymentForm.value = {
    soaNumber: '',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    paymentMethod: 'Bank Transfer',
    bankName: 'Metrobank',
    referenceNumber: '',
    notes: ''
  }
  showPaymentModal.value = true
}

function onSoaSelect() {
  const soa = unpaidStatements.value.find(s => s.soaNumber === paymentForm.value.soaNumber)
  if (soa) {
    selectedStatement.value = soa
    paymentForm.value.amount = soa.balance
  }
}

function handleRecordPayment() {
  if (!selectedStatement.value || paymentForm.value.amount <= 0) return

  billingStore.recordPayment({
    soaNumber: paymentForm.value.soaNumber,
    customerId: selectedStatement.value.customerId,
    customerName: selectedStatement.value.customerName,
    date: paymentForm.value.date,
    amount: paymentForm.value.amount,
    paymentMethod: paymentForm.value.paymentMethod,
    bankName: paymentForm.value.bankName,
    referenceNumber: paymentForm.value.referenceNumber,
    notes: paymentForm.value.notes
  })

  showPaymentModal.value = false
}
</script>

