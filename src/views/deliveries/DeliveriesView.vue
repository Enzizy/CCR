<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-base font-semibold text-slate-900 tracking-tight">Delivery Receipts (DR)</h2>
      </div>

      <div class="flex items-center gap-2">
        <router-link
          to="/purchase-orders"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
        >
          <FileText class="w-3.5 h-3.5 text-brand-700" />
          <span>Fulfill from PO</span>
        </router-link>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex items-center gap-1.5 border-b border-slate-200/80 pb-3 text-xs">
      <button
        @click="filterType = 'all'"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
          filterType === 'all' ? 'bg-brand-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
        ]"
      >
        All Receipts ({{ deliveryStore.deliveryReceipts.length }})
      </button>
      <button
        @click="filterType = 'standard'"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
          filterType === 'standard' ? 'bg-brand-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
        ]"
      >
        Billable Deliveries
      </button>
      <button
        @click="filterType = 'replacement'"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
          filterType === 'replacement' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
        ]"
      >
        Replacements ({{ replacementCount }})
      </button>
    </div>

    <!-- DR Table -->
    <div class="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-slate-50/60 border-b border-slate-100 text-slate-400 font-medium uppercase text-[11px] tracking-wider">
            <th class="py-3 px-5 w-28">DR Number</th>
            <th class="py-3 px-4 w-28">Date</th>
            <th class="py-3 px-4">Customer</th>
            <th class="py-3 px-4">PO / Project</th>
            <th class="py-3 px-4 text-center">Items</th>
            <th class="py-3 px-4 text-right">Value</th>
            <th class="py-3 px-4 text-center">Status</th>
            <th class="py-3 px-5 text-right">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-700">
          <tr
            v-for="dr in filteredReceipts"
            :key="dr.id"
            class="hover:bg-slate-50/50 transition-colors"
          >
            <td class="py-3.5 px-5 font-mono font-medium text-slate-900">{{ dr.drNumber }}</td>
            <td class="py-3.5 px-4 font-mono text-slate-500">{{ dr.date }}</td>
            <td class="py-3.5 px-4 font-medium text-slate-900">{{ dr.customerName }}</td>
            <td class="py-3.5 px-4">
              <div class="font-mono text-slate-700">{{ dr.poNumber || '—' }}</div>
              <div class="text-[11px] text-slate-400 font-normal">{{ dr.project }}</div>
            </td>
            <td class="py-3.5 px-4 text-center font-mono">
              <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[11px] font-medium">
                {{ dr.items.length }} lines
              </span>
            </td>
            <td class="py-3.5 px-4 text-right font-mono font-medium text-slate-900">
              {{ dr.isReplacement ? '₱0.00 (Replacement)' : '₱' + dr.subtotal.toLocaleString() }}
            </td>
            <td class="py-3.5 px-4 text-center">
              <StatusBadge :status="dr.status" />
            </td>
            <td class="py-3.5 px-5 text-right">
              <router-link
                :to="'/deliveries/' + dr.id"
                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-colors shadow-xs"
              >
                <Printer class="w-3.5 h-3.5 text-slate-400" />
                <span>View & Print</span>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FileText, Printer } from 'lucide-vue-next'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useDeliveryStore } from '@/stores/deliveryStore'

const deliveryStore = useDeliveryStore()
const filterType = ref('all')

const replacementCount = computed(() => {
  return deliveryStore.deliveryReceipts.filter(r => r.isReplacement).length
})

const filteredReceipts = computed(() => {
  if (filterType.value === 'standard') {
    return deliveryStore.deliveryReceipts.filter(r => !r.isReplacement)
  }
  if (filterType.value === 'replacement') {
    return deliveryStore.deliveryReceipts.filter(r => r.isReplacement)
  }
  return deliveryStore.deliveryReceipts
})
</script>

