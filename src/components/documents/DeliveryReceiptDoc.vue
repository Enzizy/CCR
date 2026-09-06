<template>
  <div class="print-container bg-white text-black max-w-4xl mx-auto p-8 border border-slate-300 rounded-lg shadow-sm print:border-none print:shadow-none print:p-0 font-sans">
    <!-- Replacement Banner if applicable -->
    <div v-if="receipt.isReplacement" class="mb-6 p-3.5 bg-purple-50 border-2 border-purple-300 rounded-md print:border-black">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xs font-extrabold uppercase tracking-wider bg-purple-700 text-white px-2 py-0.5 rounded">
            Free Warranty Replacement
          </span>
          <span class="text-sm font-semibold text-purple-950">
            Original Reference: {{ receipt.originalDrNumber }}
          </span>
        </div>
        <span class="text-xs font-mono text-purple-800 font-bold">Non-billable (₱0.00)</span>
      </div>
      <p v-if="receipt.replacementReason" class="mt-1 text-xs text-purple-900 italic">
        Reason: {{ receipt.replacementReason }}
      </p>
    </div>

    <!-- Company Header -->
    <div class="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
      <div class="flex items-start gap-3">
        <img :src="ccrLogo" alt="CCR Construction Supply logo" class="w-12 h-12 shrink-0 object-contain" />

        <div>
          <h1 class="text-base font-black italic tracking-tight text-black uppercase">
            {{ company.name }}
          </h1>
          <p class="text-xs text-slate-700 italic">{{ company.address }}</p>
          <p class="text-xs text-slate-800 mt-1 font-mono">
            Cellphone No.: {{ company.phone }}
          </p>
        </div>
      </div>

      <div class="text-right">
        <div class="inline-block bg-[#9ec37f] text-black border border-black px-4 py-1.5 rounded font-black text-sm uppercase tracking-wider">
          DELIVERY RECEIPT
        </div>
        <div class="mt-2 text-right">
          <span class="text-[10px] uppercase font-bold text-slate-600 block">DR NUMBER</span>
          <span class="text-lg font-black font-mono text-black">{{ receipt.drNumber }}</span>
        </div>
        <div class="mt-0.5 text-xs text-slate-800">
          <span class="font-bold">Date:</span> {{ formatDate(receipt.date) }}
        </div>
      </div>
    </div>

    <!-- Recipient & Logistics Metadata Grid -->
    <div class="grid grid-cols-2 gap-6 text-xs mb-6 border border-black rounded p-4 bg-slate-50/40 print:bg-transparent">
      <div>
        <div class="font-bold text-slate-600 uppercase tracking-wider text-[11px] mb-1">Delivered To</div>
        <div class="font-bold text-sm text-black">{{ receipt.customerName }}</div>
        <div class="text-slate-700 mt-0.5">{{ customer?.address || 'Site Warehouse' }}</div>
        <div class="text-slate-700 mt-0.5" v-if="customer?.contactPerson">
          <span class="font-medium">Attn:</span> {{ customer.contactPerson }} ({{ customer.phone }})
        </div>
      </div>

      <div class="space-y-1.5 border-l border-black pl-6">
        <div class="flex justify-between">
          <span class="text-slate-600 font-medium">Purchase Order No:</span>
          <span class="font-mono font-bold text-black">{{ receipt.poNumber || '—' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-600 font-medium">Project Site:</span>
          <span class="font-semibold text-black text-right">{{ receipt.project || '—' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-600 font-medium">Terms:</span>
          <span class="font-semibold text-black">{{ receipt.paymentTerms || company.defaultTerms }}</span>
        </div>
        <div class="flex justify-between" v-if="receipt.tripId">
          <span class="text-slate-600 font-medium">Trip Reference:</span>
          <span class="font-mono text-black font-semibold">{{ receipt.tripId }}</span>
        </div>
      </div>
    </div>

    <!-- Items Table in SOA Style -->
    <div class="border-2 border-black rounded overflow-hidden mb-6">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-[#9ec37f] border-b-2 border-black text-black font-bold uppercase tracking-tight text-center">
            <th class="py-2.5 px-3 w-12 border-r border-black">#</th>
            <th class="py-2.5 px-3 border-r border-black text-left">Item Description / Specifications</th>
            <th class="py-2.5 px-3 w-20 border-r border-black text-center">Qty</th>
            <th class="py-2.5 px-3 w-16 border-r border-black text-center">Unit</th>
            <th class="py-2.5 px-3 w-28 border-r border-black text-right">Unit Price</th>
            <th class="py-2.5 px-3 w-32 text-right">Amount (PHP)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-black font-medium">
          <tr v-for="(item, idx) in receipt.items" :key="idx" class="hover:bg-slate-50/50">
            <td class="py-2.5 px-3 text-center font-mono border-r border-black">{{ idx + 1 }}</td>
            <td class="py-2.5 px-3 text-black border-r border-black">
              <div class="font-bold">{{ item.name }}</div>
              <div v-if="item.description" class="text-[11px] text-slate-600 font-normal">{{ item.description }}</div>
            </td>
            <td class="py-2.5 px-3 text-center font-mono font-bold text-black border-r border-black">{{ item.quantity }}</td>
            <td class="py-2.5 px-3 text-center text-black uppercase border-r border-black">{{ item.unit || 'sets' }}</td>
            <td class="py-2.5 px-3 text-right font-mono text-black border-r border-black">
              {{ receipt.isReplacement ? '—' : '₱' + (Number(item.unitPrice) || 0).toLocaleString() }}
            </td>
            <td class="py-2.5 px-3 text-right font-mono font-bold text-black">
              {{ receipt.isReplacement ? '₱0.00' : '₱' + (item.amount || (item.quantity * item.unitPrice) || 0).toLocaleString() }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t-2 border-black bg-[#9ec37f] font-bold text-xs text-black">
            <td colspan="2" class="py-2.5 px-3 border-r border-black">
              TOTAL DELIVERED ITEMS: {{ totalDeliveredQuantity }} {{ totalDeliveredQuantity === 1 ? 'unit' : 'units' }}
            </td>
            <td class="py-2.5 px-3 text-center font-mono font-bold border-r border-black">{{ totalDeliveredQuantity }}</td>
            <td colspan="2" class="py-2.5 px-3 text-right uppercase tracking-wider border-r border-black">
              {{ receipt.isReplacement ? 'REPLACEMENT TOTAL' : 'TOTAL AMOUNT' }}
            </td>
            <td class="py-2.5 px-3 text-right font-mono text-sm font-black">
              ₱{{ (receipt.subtotal || 0).toLocaleString() }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Conditions Note -->
    <div class="text-[11px] text-slate-700 leading-relaxed mb-8 bg-slate-50 p-3 rounded border border-slate-300 print:bg-transparent">
      <p class="font-bold text-black mb-0.5">Conditions of Delivery & Acceptance:</p>
      <p>1. Received the above architectural supplies complete, unmarred, and in good condition.</p>
      <p>2. Claims regarding defects or shortages must be endorsed upon delivery.</p>
      <p>3. This Delivery Receipt is followed by Statement of Account (SOA) for payment remittance.</p>
    </div>

    <!-- Tri-Signatures Section -->
    <div class="grid grid-cols-3 gap-6 pt-4 text-xs">
      <!-- Prepared By -->
      <div>
        <div class="h-12 flex items-end justify-center font-medium italic text-black">
          Authorized Staff
        </div>
        <div class="border-t-2 border-black pt-1.5 text-center">
          <div class="font-bold text-black uppercase">AUTHORIZED STAFF</div>
          <div class="text-[10px] text-slate-600 font-bold uppercase">PREPARED BY</div>
        </div>
      </div>

      <!-- Delivered By -->
      <div>
        <div class="h-12 flex items-end justify-center font-medium italic text-black">
          {{ receipt.deliveredBy || '—' }}
        </div>
        <div class="border-t-2 border-black pt-1.5 text-center">
          <div class="font-bold text-black uppercase">Delivered By</div>
          <div class="text-[10px] text-slate-600 font-bold uppercase">Logistics Driver</div>
        </div>
      </div>

      <!-- Received By -->
      <div>
        <div class="h-12 flex items-end justify-center font-medium italic text-black">
          {{ receipt.receivedBy || '______________________' }}
        </div>
        <div class="border-t-2 border-black pt-1.5 text-center">
          <div class="font-bold text-black uppercase">Received in Good Condition</div>
          <div class="text-[10px] text-slate-600 font-bold uppercase">Client Authorized Signature</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ccrLogo from '@/assets/ccr-logo.png'
import { useSettingsStore } from '@/stores/settingsStore'

const settingsStore = useSettingsStore()
const company = computed(() => settingsStore.company)

const props = defineProps({
  receipt: {
    type: Object,
    required: true
  },
  customer: {
    type: Object,
    default: () => null
  }
})

const totalDeliveredQuantity = computed(() => {
  if (!props.receipt.items) return 0
  return props.receipt.items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0)
})

function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateStr).toLocaleDateString('en-US', options)
}
</script>
