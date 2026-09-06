<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="page-title">Delivery Receipts (DR)</h2>
        <p class="text-xs text-slate-500 mt-0.5">Deliver customer orders with a DR and SOA. Replacement deliveries get a DR only.</p>
      </div>

      <div class="flex items-center gap-2">
        <router-link
          to="/purchase-orders"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
        >
          <FileText class="w-3.5 h-3.5 text-brand-700" />
          <span>Deliver from customer PO</span>
        </router-link>

        <button
          @click="openNewDeliveryModal"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 rounded-lg shadow-xs transition-colors"
        >
          <Plus class="w-4 h-4" />
          <span>New Delivery</span>
        </button>
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
    <div class="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-x-auto">
      <table class="data-table">
        <thead>
          <tr class="data-table-header">
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
            <td class="py-3.5 px-5 font-mono font-medium text-slate-900">
              {{ dr.drNumber }}
              <div v-if="dr.isReplacement" class="text-[10px] text-purple-700 font-medium">Warranty Replacement</div>
            </td>
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
              <span v-if="dr.isReplacement" class="text-purple-700 font-semibold text-xs">
                ₱0.00 <span class="text-[10px] font-normal text-slate-400 block">Free replacement</span>
              </span>
              <span v-else>
                ₱{{ dr.subtotal.toLocaleString() }}
              </span>
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
          <tr v-if="filteredReceipts.length === 0">
            <td colspan="8" class="py-12 text-center text-xs text-slate-500">No delivery receipts match this view.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Direct Create Delivery Modal -->
    <Teleport to="body">
      <div v-if="showNewDeliveryModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Create New Delivery Receipt</h3>
              <p class="text-slate-500 mt-0.5">Select a Purchase Order to fulfill. A Delivery Receipt and Statement of Account (SOA) will be generated automatically.</p>
            </div>
            <button @click="showNewDeliveryModal = false" class="text-slate-400 hover:text-slate-700">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div v-if="openPurchaseOrders.length === 0" class="py-8 text-center space-y-3">
            <PackageX class="w-8 h-8 text-slate-400 mx-auto" />
            <p class="text-slate-600 font-medium">No open purchase orders requiring delivery.</p>
            <router-link
              to="/purchase-orders"
              @click="showNewDeliveryModal = false"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-700 text-white rounded-md font-semibold hover:bg-brand-800 text-xs"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Create Purchase Order First</span>
            </router-link>
          </div>

          <form v-else @submit.prevent="handleCreateDelivery" class="space-y-4">
            <!-- Select PO -->
            <div>
              <label class="block font-medium text-slate-700 mb-1">Select Purchase Order to Fulfill *</label>
              <select
                v-model="selectedPoId"
                @change="onPoSelect"
                required
                class="w-full px-3 py-2 border rounded-md border-slate-300 font-medium"
              >
                <option disabled value="">Choose an open purchase order</option>
                <option v-for="po in openPurchaseOrders" :key="po.id" :value="po.id">
                  {{ po.poNumber }} — {{ po.customerName }} ({{ po.totalRemaining }} items remaining)
                </option>
              </select>
            </div>

            <div v-if="selectedPo" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block font-medium text-slate-700 mb-1">Delivery Date *</label>
                  <input v-model="deliveryForm.date" type="date" required class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono" />
                </div>
                <div>
                  <label class="block font-medium text-slate-700 mb-1">Assigned Logistics Driver</label>
                  <input v-model="deliveryForm.deliveredBy" class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="e.g. Pedro Cruz (Isuzu Elf)" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block font-medium text-slate-700 mb-1">Assign to Delivery Trip (Optional)</label>
                  <select v-model="deliveryForm.tripId" class="w-full px-3 py-2 border rounded-md border-slate-300">
                    <option :value="null">No trip assigned yet (assign later)</option>
                    <option v-for="trip in deliveryStore.deliveryTrips" :key="trip.id" :value="trip.id">
                      {{ trip.tripNumber }} — {{ trip.vehicle }} (Driver: {{ trip.driver }})
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block font-medium text-slate-700 mb-1">Receiving Personnel / Staging Notes</label>
                  <input v-model="deliveryForm.receivedBy" class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="e.g. Engr. Mark / Site Staging Area" />
                </div>
              </div>

              <!-- Items to Deliver -->
              <div>
                <label class="block font-bold text-slate-800 mb-2">Quantities Being Shipped (Auto-calculated remaining quantities)</label>
                <div class="border border-slate-200 rounded-lg overflow-hidden">
                  <table class="data-table">
                    <thead class="data-table-header">
                      <tr>
                        <th class="p-2.5">Product</th>
                        <th class="p-2.5 text-right">Ordered</th>
                        <th class="p-2.5 text-right">Remaining</th>
                        <th class="p-2.5 w-32 text-right">Deliver Now</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      <tr v-for="(line, idx) in deliveryForm.items" :key="idx">
                        <td class="p-2.5 font-medium text-slate-900">{{ line.name }}</td>
                        <td class="p-2.5 text-right font-mono text-slate-500">{{ line.orderedQty }}</td>
                        <td class="p-2.5 text-right font-mono font-bold text-amber-700">{{ line.remainingQty }}</td>
                        <td class="p-2.5 text-right">
                          <input
                            v-model.number="line.quantity"
                            type="number"
                            min="0"
                            :max="line.remainingQty"
                            class="w-24 px-2 py-1 border rounded text-right font-mono font-bold text-slate-900 border-slate-300 focus:ring-1 focus:ring-brand-500"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div class="text-xs text-slate-500">
                  Total Delivery Value: <span class="font-mono font-bold text-slate-900">₱{{ calculatedDeliveryValue.toLocaleString() }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button" @click="showNewDeliveryModal = false" class="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
                  <button type="submit" :disabled="savingDelivery || calculatedDeliveryValue <= 0" class="px-4 py-2 bg-brand-700 text-white font-bold rounded-md hover:bg-brand-800 shadow-sm disabled:opacity-50">
                    {{ savingDelivery ? 'Saving...' : 'Generate DR & SOA' }}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FileText, Printer, Plus, X, PackageX } from 'lucide-vue-next'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useDeliveryStore } from '@/stores/deliveryStore'
import { useSalesStore } from '@/stores/salesStore'

const deliveryStore = useDeliveryStore()
const savingDelivery = ref(false)
const deliveryError = ref('')
const salesStore = useSalesStore()

const filterType = ref('all')
const showNewDeliveryModal = ref(false)
const selectedPoId = ref('')
const selectedPo = ref(null)

const deliveryForm = ref({
  date: new Date().toISOString().split('T')[0],
  deliveredBy: '',
  receivedBy: '',
  tripId: null,
  items: []
})

const openPurchaseOrders = computed(() => {
  return salesStore.enrichedPurchaseOrders.filter(po => po.totalRemaining > 0)
})

const replacementCount = computed(() => {
  return deliveryStore.deliveryReceipts.filter(r => r.isReplacement).length
})

const linkedReceipts = computed(() => deliveryStore.deliveryReceipts.map(dr => {
  const po = salesStore.purchaseOrders.find(po => po.id === dr.poId)
  return { ...dr, poNumber: dr.poNumber || po?.poNumber, project: dr.project || po?.project }
}))
const filteredReceipts = computed(() => {
  if (filterType.value === 'standard') {
    return linkedReceipts.value.filter(r => !r.isReplacement)
  }
  if (filterType.value === 'replacement') {
    return linkedReceipts.value.filter(r => r.isReplacement)
  }
  return linkedReceipts.value
})

const calculatedDeliveryValue = computed(() => {
  if (!deliveryForm.value.items) return 0
  return deliveryForm.value.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
})

function openNewDeliveryModal() {
  selectedPoId.value = ''
  selectedPo.value = null
  deliveryForm.value = {
    date: new Date().toISOString().split('T')[0],
    deliveredBy: '',
    receivedBy: '',
    tripId: null,
    items: []
  }
  showNewDeliveryModal.value = true
}

function onPoSelect() {
  const po = salesStore.enrichedPurchaseOrders.find(p => p.id === selectedPoId.value)
  if (!po) return
  selectedPo.value = po
  deliveryForm.value.items = po.items
    .filter(item => item.remainingQty > 0)
    .map(item => ({
      productId: item.productId,
      name: item.productName,
      unit: item.unit,
      unitPrice: item.unitPrice,
      orderedQty: item.orderedQty,
      remainingQty: item.remainingQty,
      quantity: item.remainingQty
    }))
}

async function handleCreateDelivery() {
  if (!selectedPo.value) return
  const validItems = deliveryForm.value.items.filter(item => item.quantity > 0)
  if (validItems.length === 0) return

  if (savingDelivery.value) return
  savingDelivery.value = true
  deliveryError.value = ''
  try {
  await deliveryStore.createDelivery({
    date: deliveryForm.value.date,
    poId: selectedPo.value.id,
    poNumber: selectedPo.value.poNumber,
    poDate: selectedPo.value.date,
    customerId: selectedPo.value.customerId,
    customerName: selectedPo.value.customerName,
    project: selectedPo.value.project,
    paymentTerms: selectedPo.value.paymentTerms,
    tripId: deliveryForm.value.tripId,
    deliveredBy: deliveryForm.value.deliveredBy,
    receivedBy: deliveryForm.value.receivedBy,
    items: validItems
  })

  showNewDeliveryModal.value = false
  } catch (error) { deliveryError.value = error.message }
  finally { savingDelivery.value = false }
}
</script>
