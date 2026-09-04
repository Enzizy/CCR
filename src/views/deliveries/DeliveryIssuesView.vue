<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-base font-semibold text-slate-900 tracking-tight">Delivery Damages & Replacement</h2>
      </div>

      <button
        @click="showReportModal = true"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-lg shadow-xs transition-colors"
      >
        <Plus class="w-4 h-4" />
        <span>Report Damaged Delivery</span>
      </button>
    </div>

    <!-- Architectural Rule Banner -->
    <div class="p-4 bg-purple-50/60 border border-purple-200/70 rounded-xl flex items-start gap-3">
      <ShieldAlert class="w-4 h-4 text-purple-700 mt-0.5 shrink-0" />
      <div class="text-xs">
        <span class="font-medium text-purple-950">Accounting & Fulfillment Safeguard:</span>
        <p class="text-slate-600 mt-0.5 font-normal">
          Free replacement deliveries issue a replacement DR referencing original damages, but <strong>do not inflate original PO fulfillment counts</strong> or generate additional billable revenue.
        </p>
      </div>
    </div>

    <!-- Issues Table -->
    <div class="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-slate-50/60 border-b border-slate-100 text-slate-400 font-medium uppercase text-[11px] tracking-wider">
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
        </tbody>
      </table>
    </div>

    <!-- Report Damaged Delivery Modal -->
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
              <input v-model="newIssue.productName" required class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="Product specification" />
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Qty Damaged *</label>
              <input v-model.number="newIssue.quantityAffected" type="number" min="1" required class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono font-bold" />
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, ShieldAlert, X } from 'lucide-vue-next'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useDeliveryStore } from '@/stores/deliveryStore'

const deliveryStore = useDeliveryStore()

const standardReceipts = computed(() => {
  return deliveryStore.deliveryReceipts.filter(r => !r.isReplacement)
})

const showReportModal = ref(false)
const newIssue = ref({
  dateReported: new Date().toISOString().split('T')[0],
  originalDrNumber: 'DR #4322',
  customerId: 'cust-1',
  customerName: 'Cebu Landmaster Inc.',
  productName: 'Door, Wooden Solid Panel 0.90x2.10 m. w/ Jamb Door',
  quantityAffected: 1,
  reason: ''
})

function onDrSelect() {
  const dr = deliveryStore.deliveryReceipts.find(d => d.drNumber === newIssue.value.originalDrNumber)
  if (dr) {
    newIssue.value.customerId = dr.customerId
    newIssue.value.customerName = dr.customerName
    if (dr.items && dr.items.length > 0) {
      newIssue.value.productName = dr.items[0].name
    }
  }
}

function handleReportDamage() {
  deliveryStore.reportDeliveryDamage(newIssue.value)
  showReportModal.value = false
  newIssue.value.reason = ''
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
    deliveredBy: 'Pedro Cruz (Driver)',
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

