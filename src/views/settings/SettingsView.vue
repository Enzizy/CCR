<template>
  <div class="space-y-6 max-w-4xl">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-slate-900">System Configuration & Document Numbering</h2>
      </div>
      <button
        @click="saved = true"
        class="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
      >
        {{ saved ? '✓ Settings Saved' : 'Save Changes' }}
      </button>
    </div>

    <!-- Company Information -->
    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 text-xs">
      <h3 class="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">Company Legal Profile</h3>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block font-medium text-slate-700 mb-1">Company Trading Name</label>
          <input v-model="company.name" class="w-full px-3 py-2 border rounded-md border-slate-300 font-bold" />
        </div>
        <div>
          <label class="block font-medium text-slate-700 mb-1">Tax Identification Number (TIN)</label>
          <input v-model="company.tin" class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono" />
        </div>
      </div>

      <div>
        <label class="block font-medium text-slate-700 mb-1">Plant / Workshop Address</label>
        <input v-model="company.address" class="w-full px-3 py-2 border rounded-md border-slate-300" />
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block font-medium text-slate-700 mb-1">Telephone</label>
          <input v-model="company.phone" class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono" />
        </div>
        <div>
          <label class="block font-medium text-slate-700 mb-1">Accounting Email</label>
          <input v-model="company.email" class="w-full px-3 py-2 border rounded-md border-slate-300" />
        </div>
        <div>
          <label class="block font-medium text-slate-700 mb-1">Standard Payment Terms</label>
          <input v-model="company.defaultTerms" class="w-full px-3 py-2 border rounded-md border-slate-300" />
        </div>
      </div>
    </div>

    <!-- Document Sequencing -->
    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 text-xs">
      <h3 class="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">Sequential Document Numbering</h3>
      
      <div class="grid grid-cols-2 gap-6">
        <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <label class="block font-bold text-slate-800">Next Delivery Receipt (DR) Number</label>
          <div class="flex items-center gap-2">
            <span class="font-mono text-slate-500 font-bold">DR #</span>
            <input v-model.number="deliveryStore.nextDrSeq" type="number" class="w-32 px-3 py-1.5 border rounded-md border-slate-300 font-mono font-bold text-base text-slate-950" />
          </div>
          <p class="text-[11px] text-slate-500">Auto-increments upon saving a verified delivery</p>
        </div>

        <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <label class="block font-bold text-slate-800">Next Statement of Account (SOA) Sequence</label>
          <div class="flex items-center gap-2">
            <span class="font-mono text-slate-500 font-bold">SOA-2026-</span>
            <input v-model.number="billingStore.nextSoaSeq" type="number" class="w-32 px-3 py-1.5 border rounded-md border-slate-300 font-mono font-bold text-base text-slate-950" />
          </div>
          <p class="text-[11px] text-slate-500">Generated sequentially per billable delivery</p>
        </div>
      </div>
    </div>

    <!-- Bank Details -->
    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 text-xs">
      <h3 class="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">Remittance Bank Account (For SOA Printouts)</h3>
      
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block font-medium text-slate-700 mb-1">Bank Name</label>
          <input v-model="company.bankName" class="w-full px-3 py-2 border rounded-md border-slate-300" />
        </div>
        <div>
          <label class="block font-medium text-slate-700 mb-1">Account Name</label>
          <input v-model="company.bankAccountName" class="w-full px-3 py-2 border rounded-md border-slate-300" />
        </div>
        <div>
          <label class="block font-medium text-slate-700 mb-1">Account Number</label>
          <input v-model="company.bankAccountNumber" class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDeliveryStore } from '@/stores/deliveryStore'
import { useBillingStore } from '@/stores/billingStore'

const deliveryStore = useDeliveryStore()
const billingStore = useBillingStore()

const saved = ref(false)

const company = ref({
  name: 'CCR Construction Supply',
  tin: '142-990-811-000 NV',
  address: 'Poblacion, Barili, Cebu',
  phone: '0995 743 7989 / 0998 558 0067',
  email: 'accounting@ccrsupply.ph',
  defaultTerms: '30 days upon delivery on site',
  bankName: 'Metrobank',
  bankAccountName: 'Rodil B. Vergara',
  bankAccountNumber: '599-3-599-14522-3'
})
</script>

