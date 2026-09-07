<template>
  <div class="space-y-6 max-w-4xl">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="page-title">Company & Document Settings</h2>
      </div>
      <button
        @click="handleSave"
        :disabled="saving"
        class="primary-button"
      >
        {{ saved ? '✓ Settings Saved' : 'Save Changes' }}
      </button>
    </div>

    <p v-if="saveError" role="alert" class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{{ saveError }}</p>

    <!-- Company Information -->
    <div class="section-card p-6 space-y-4 text-xs">
      <h3 class="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">Company Details</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block font-medium text-slate-700 mb-1">Telephone</label>
          <input v-model="company.phone" class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono" />
        </div>
        <div>
          <label class="block font-medium text-slate-700 mb-1">Official / Accounting Email</label>
          <input v-model="company.email" class="w-full px-3 py-2 border rounded-md border-slate-300" />
        </div>
        <div>
          <label class="block font-medium text-slate-700 mb-1">Standard Payment Terms</label>
          <input v-model="company.defaultTerms" class="w-full px-3 py-2 border rounded-md border-slate-300" />
        </div>
      </div>
    </div>

    <!-- Document Sequencing -->
    <div class="section-card p-6 space-y-4 text-xs">
      <h3 class="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">Document Numbers</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <label class="block font-bold text-slate-800">Next Delivery Receipt (DR) Number</label>
          <div class="flex items-center gap-2">
            <span class="font-mono text-slate-500 font-bold">DR #</span>
            <input v-model.number="deliverySequence" type="number" min="1" class="w-32 px-3 py-1.5 border rounded-md border-slate-300 font-mono font-bold text-base text-slate-950" />
          </div>
          <p class="text-[11px] text-slate-500">Auto-increments upon saving a verified delivery</p>
        </div>

        <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <label class="block font-bold text-slate-800">Next Statement of Account (SOA) Sequence</label>
          <div class="flex items-center gap-2">
            <span class="font-mono text-slate-500 font-bold">SOA-{{ currentYear }}-</span>
            <input v-model.number="soaSequence" type="number" min="1" class="w-32 px-3 py-1.5 border rounded-md border-slate-300 font-mono font-bold text-base text-slate-950" />
          </div>
          <p class="text-[11px] text-slate-500">Generated sequentially per billable delivery</p>
        </div>
      </div>
    </div>

    <!-- Bank Details -->
    <div class="section-card p-6 space-y-4 text-xs">
      <h3 class="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">Bank Details for SOA Printouts</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
import { useSettingsStore } from '@/stores/settingsStore'

const deliveryStore = useDeliveryStore()
const billingStore = useBillingStore()
const settingsStore = useSettingsStore()

const saved = ref(false)
const saving = ref(false)
const saveError = ref('')
const currentYear = new Date().getFullYear()
const deliverySequence = ref(deliveryStore.nextDrSeq)
const soaSequence = ref(billingStore.nextSoaSeq)

const company = ref({ ...settingsStore.company })

async function handleSave() {
  if (saving.value) return
  saving.value = true
  saveError.value = ''
  deliverySequence.value = Math.max(1, Number(deliverySequence.value) || 1)
  soaSequence.value = Math.max(1, Number(soaSequence.value) || 1)
  try {
    await settingsStore.updateCompany(company.value)
    deliveryStore.nextDrSeq = deliverySequence.value
    billingStore.nextSoaSeq = soaSequence.value
    saved.value = true
    window.setTimeout(() => {
      saved.value = false
    }, 2000)
  } catch (error) {
    saveError.value = 'Could not save settings. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>
