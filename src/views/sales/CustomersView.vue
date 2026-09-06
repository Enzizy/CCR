<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="page-title">Customer Accounts</h2>
      </div>
      <button
        @click="showAddModal = true"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-lg shadow-xs transition-colors"
      >
        <Plus class="w-4 h-4" />
        <span>Add Customer</span>
      </button>
    </div>

    <!-- Customer Cards / Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-if="salesStore.customers.length === 0" class="section-card empty-state md:col-span-2">
        <h3>No customers yet</h3>
        <p>Add the first customer before creating a purchase order.</p>
      </div>
      <div
        v-for="c in salesStore.customers"
        :key="c.id"
        class="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-full bg-brand-50 text-brand-800 font-mono text-[10px] font-medium border border-brand-200/70">
                {{ c.shortName || 'CLIENT' }}
              </span>
              <h3 class="text-sm font-semibold text-slate-900">{{ c.name }}</h3>
            </div>
            <p class="text-xs text-slate-400 mt-1 flex items-center gap-1 font-normal">
              <MapPin class="w-3.5 h-3.5 shrink-0" />
              <span>{{ c.address }}</span>
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs bg-slate-50/60 p-3.5 rounded-lg border border-slate-100">
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Email</span>
            <span class="text-slate-800 truncate block">{{ c.email || '—' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Payment Terms</span>
            <span class="font-medium text-brand-700">{{ c.paymentTerms || '—' }}</span>
          </div>
          <div v-if="c.contactPerson">
            <span class="text-slate-400 block text-[11px] font-medium">Contact Person</span>
            <span class="font-medium text-slate-800">{{ c.contactPerson }}</span>
          </div>
          <div v-if="c.phone">
            <span class="text-slate-400 block text-[11px] font-medium">Phone / Mobile</span>
            <span class="font-mono text-slate-800">{{ c.phone }}</span>
          </div>
        </div>

        <div v-if="c.notes" class="text-xs text-slate-500 italic bg-white p-2.5 rounded border border-slate-100 font-normal">
          "{{ c.notes }}"
        </div>

        <!-- Receivables snapshot for this customer -->
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-400 font-normal">Outstanding Balance:</span>
          <span class="font-mono font-semibold text-slate-900 text-sm">
            ₱{{ getCustomerBalance(c.id).toLocaleString() }}
          </span>
        </div>
      </div>
    </div>

    <!-- Add Customer Modal -->
    <Teleport to="body">
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div class="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 text-xs space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200">
          <h3 class="text-sm font-bold text-slate-900">Add New Customer Account</h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-700">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleAddCustomer" class="space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
              <label class="block font-medium text-slate-700 mb-1">Company / Customer Name *</label>
              <input v-model="newCust.name" required class="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-1 focus:ring-brand-500" placeholder="e.g. Primary Homes Inc." />
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Short Name / Code</label>
              <input v-model="newCust.shortName" class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="e.g. PHI" />
            </div>
          </div>

          <div>
            <label class="block font-medium text-slate-700 mb-1">Billing / Delivery Address</label>
            <input v-model="newCust.address" class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="Full street / city address" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-slate-700 mb-1">Email</label>
              <input v-model="newCust.email" type="email" class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="procurement@company.ph" />
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Payment Terms</label>
              <select v-model="newCust.paymentTerms" class="w-full px-3 py-2 border rounded-md border-slate-300">
                <option value="30 Days upon delivery">30 Days upon delivery</option>
                <option value="15 Days upon delivery">15 Days upon delivery</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="50% Advance, 50% Delivery">50% Advance, 50% Delivery</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-medium text-slate-700 mb-1">Notes / Instructions</label>
            <textarea v-model="newCust.notes" rows="2" class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="Site contact, delivery gate instructions..."></textarea>
          </div>

          <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button type="button" @click="showAddModal = false" class="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-slate-900 text-white font-semibold rounded-md hover:bg-slate-800">Save Customer</button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, MapPin, X } from 'lucide-vue-next'
import { useSalesStore } from '@/stores/salesStore'
import { useBillingStore } from '@/stores/billingStore'

const salesStore = useSalesStore()
const billingStore = useBillingStore()

const showAddModal = ref(false)
const newCust = ref({
  name: '',
  shortName: '',
  address: '',
  email: '',
  paymentTerms: '30 Days upon delivery',
  notes: ''
})

function getCustomerBalance(customerId) {
  const c = billingStore.customerReceivables.find(item => item.customerId === customerId)
  return c ? c.totalOutstanding : 0
}

function handleAddCustomer() {
  salesStore.addCustomer(newCust.value)
  showAddModal.value = false
  newCust.value = {
    name: '',
    shortName: '',
    address: '',
    email: '',
    paymentTerms: '30 Days upon delivery',
    notes: ''
  }
}
</script>
