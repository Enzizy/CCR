<template>
  <div class="space-y-4">
    <!-- Toolbar (Hidden on print) -->
    <div class="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          @click="$router.back()"
          class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Back to Deliveries</span>
        </button>
        <span class="text-slate-300">|</span>
        <span class="text-xs font-mono font-bold text-slate-900">{{ currentReceipt?.drNumber }}</span>
        <StatusBadge v-if="currentReceipt" :status="currentReceipt.status" />
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="currentReceipt"
          @click="triggerPrint"
          class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
        >
          <Printer class="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>
    </div>

    <!-- Official Printable Document -->
    <div v-if="currentReceipt">
      <DeliveryReceiptDoc
        :receipt="currentReceipt"
        :customer="customer"
      />
    </div>
    <div v-else class="text-center py-12 text-slate-500 text-xs">
      Delivery receipt record not found.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Printer } from 'lucide-vue-next'
import StatusBadge from '@/components/common/StatusBadge.vue'
import DeliveryReceiptDoc from '@/components/documents/DeliveryReceiptDoc.vue'
import { useDeliveryStore } from '@/stores/deliveryStore'
import { useSalesStore } from '@/stores/salesStore'

const route = useRoute()
const deliveryStore = useDeliveryStore()
const salesStore = useSalesStore()

const currentReceipt = computed(() => {
  const id = route.params.id
  const receipt = deliveryStore.deliveryReceipts.find(dr => dr.id === id)
  if (!receipt) return null
  const po = salesStore.purchaseOrders.find(order => order.id === receipt.poId)
  return { ...receipt, customerId: receipt.customerId || po?.customerId, poNumber: receipt.poNumber || po?.poNumber, project: receipt.project || po?.project }
})

const customer = computed(() => {
  if (!currentReceipt.value) return null
  return salesStore.customers.find(c => c.id === currentReceipt.value.customerId)
})

function triggerPrint() {
  window.print()
}
</script>
