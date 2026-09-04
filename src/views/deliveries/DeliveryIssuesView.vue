<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="page-title">Delivery Damages & Replacement</h2>
      </div>

      <button
        @click="openReportModal"
        :disabled="standardReceipts.length === 0"
        :title="standardReceipts.length ? 'Report damaged delivery' : 'No billable delivery receipts available'"
        class="primary-button"
      >
        <Plus class="w-4 h-4" />
        <span>Report Damaged Delivery</span>
      </button>
    </div>

    <!-- Issues Table -->
    <div class="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
      <table class="data-table">
        <thead>
          <tr class="data-table-header">
            <th class="py-3 px-5 w-28">Date Reported</th>
            <th class="py-3 px-4 w-28">Original DR</th>
            <th class="py-3 px-4">Customer</th>
            <th class="py-3 px-4">Affected Item</th>
            <th class="py-3 px-4">Damage Description</th>
            <th class="py-3 px-4 text-center">Status</th>
            <th class="py-3 px-5 text-right">Replacement DR</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-700">
          <tr
            v-for="issue in deliveryStore.deliveryIssues"
            :key="issue.id"
            class="hover:bg-slate-50/50 transition-colors"
          >
            <td class="py-3.5 px-5 font-mono text-slate-500">{{ issue.dateReported }}</td>
            <td class="py-3.5 px-4 font-mono font-medium text-slate-900">{{ issue.originalDrNumber }}</td>
            <td class="py-3.5 px-4 font-medium text-slate-900">{{ issue.customerName }}</td>
            <td class="py-3.5 px-4">
              <span class="font-mono font-medium text-rose-700">{{ issue.quantityAffected }} set(s)</span>
              <div class="text-slate-500 text-[11px] mt-0.5">{{ issue.productName }}</div>
            </td>
            <td class="py-3.5 px-4 text-slate-600 max-w-xs">
              {{ issue.reason }}
            </td>
            <td class="py-3.5 px-4 text-center">
              <StatusBadge :status="issue.status" />
            </td>
            <td class="py-3.5 px-5 text-right">
              <span v-if="issue.replacementDrNumber" class="font-mono text-[11px] font-medium text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/70">
                {{ issue.replacementDrNumber }}
              </span>
              <button
                v-else
                @click="openReplacementModal(issue)"
                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100/80 rounded-md border border-purple-200/70 transition-colors shadow-xs"
              >
                <span>Dispatch Replacement</span>
              </button>
            </td>
          </tr>
          <tr v-if="deliveryStore.deliveryIssues.length === 0">
            <td colspan="7" class="py-12 text-center text-xs text-slate-500">No delivery damage reports recorded.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Report Damaged Delivery Modal -->
    <Teleport to="body">
    <div v-if="showReportModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200">
          <h3 class="text-sm font-bold text-slate-900">Report Damaged Delivery Item</h3>
          <button @click="showReportModal = false" class="text-slate-400 hover:text-slate-700">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleReportDamage" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-slate-700 mb-1">Date Reported *</label>
              <input v-model="newIssue.dateReported" type="date" required class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono" />
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Original Delivery DR *</label>
              <select v-model="newIssue.originalDrNumber" required class="w-full px-3 py-2 border rounded-md border-slate-300" @change="onDrSelect">
                <option disabled value="">Select a delivery receipt</option>
                <option v-for="dr in standardReceipts" :key="dr.id" :value="dr.drNumber">
                  {{ dr.drNumber }} - {{ dr.customerName }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-medium text-slate-700 mb-1">Customer Name</label>
            <input v-model="newIssue.customerName" readonly class="w-full px-3 py-2 border rounded-md border-slate-200 bg-slate-50 text-slate-600" />
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-2">
              <label class="block font-medium text-slate-700 mb-1">Damaged Item *</label>
              <select v-model="newIssue.productName" required class="w-full px-3 py-2 border rounded-md border-slate-300">
                <option disabled value="">Select a delivered item</option>
                <option v-for="item in selectedReceipt?.items || []" :key="item.productId || item.name" :value="item.name">
                  {{ item.name }} ({{ item.quantity }} {{ item.unit || 'unit' }})
                </option>
              </select>
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Qty Damaged *</label>
              <input v-model.number="newIssue.quantityAffected" type="number" min="1" :max="selectedItem?.quantity || 1" required class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono font-bold" />
            </div>
          </div>

          <div>
            <label class="block font-medium text-slate-700 mb-1">Reason / Condition Details *</label>
            <textarea v-model="newIssue.reason" rows="2" required class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="e.g. Scratches during unloading, cracked jamb corner..."></textarea>
          </div>

          <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button type="button" @click="showReportModal = false" class="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-rose-700 text-white font-semibold rounded-md hover:bg-rose-800">Submit Damage Report</button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useDeliveryStore } from '@/stores/deliveryStore'

const deliveryStore = useDeliveryStore()

const standardReceipts = computed(() => {
  return deliveryStore.deliveryReceipts.filter(r => !r.isReplacement)
})

const selectedReceipt = computed(() => standardReceipts.value.find(receipt => receipt.drNumber === newIssue.value.originalDrNumber))
const selectedItem = computed(() => selectedReceipt.value?.items?.find(item => item.name === newIssue.value.productName))

const showReportModal = ref(false)
const newIssue = ref({
  dateReported: new Date().toISOString().split('T')[0],
  originalDrNumber: '',
  customerId: '',
  customerName: '',
  productName: '',
  quantityAffected: 1,
  reason: ''
})

function onDrSelect() {
  const dr = deliveryStore.deliveryReceipts.find(d => d.drNumber === newIssue.value.originalDrNumber)
  if (dr) {
    newIssue.value.customerId = dr.customerId
    newIssue.value.customerName = dr.customerName
    newIssue.value.productName = ''
    newIssue.value.quantityAffected = 1
    if (dr.items && dr.items.length > 0) {
      newIssue.value.productName = dr.items[0].name
    }
  }
}

function openReportModal() {
  if (standardReceipts.value.length === 0) return
  showReportModal.value = true
}

function handleReportDamage() {
  if (!selectedReceipt.value || !selectedItem.value || newIssue.value.quantityAffected > selectedItem.value.quantity) return
  deliveryStore.reportDeliveryDamage(newIssue.value)
  showReportModal.value = false
  newIssue.value = {
    dateReported: new Date().toISOString().split('T')[0],
    originalDrNumber: '',
    customerId: '',
    customerName: '',
    productName: '',
    quantityAffected: 1,
    reason: ''
  }
}

function openReplacementModal(issue) {
  // Directly dispatch a replacement DR
  const repDr = deliveryStore.createDelivery({
    date: new Date().toISOString().split('T')[0],
    isReplacement: true,
    originalDrNumber: issue.originalDrNumber,
    replacementReason: `Free warranty replacement for: ${issue.reason}`,
    customerId: issue.customerId,
    customerName: issue.customerName,
    project: 'Warranty Replacement',
    deliveredBy: '',
    receivedBy: 'Pending Client Signature',
    items: [
      {
        name: issue.productName,
        quantity: issue.quantityAffected,
        unit: 'set',
        unitPrice: 0
      }
    ]
  })

  deliveryStore.resolveIssueWithReplacement(issue.id, repDr)
}
</script>
