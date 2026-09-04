<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-base font-semibold text-slate-900 tracking-tight">Purchase Orders & Fulfillment</h2>
      </div>
      <button
        @click="showCreatePoModal = true"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-lg shadow-xs transition-colors"
      >
        <Plus class="w-4 h-4" />
        <span>New Purchase Order</span>
      </button>
    </div>

    <!-- PO List Cards -->
    <div class="space-y-6">
      <div
        v-for="po in salesStore.enrichedPurchaseOrders"
        :key="po.id"
        class="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden"
      >
        <!-- PO Top Card Header -->
        <div class="px-6 py-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-3">
              <span class="text-sm font-semibold font-mono text-slate-900">{{ po.poNumber }}</span>
              <StatusBadge :status="po.status" />
              <span class="text-xs text-slate-400 font-mono">Date: {{ po.date }}</span>
            </div>
            <div class="flex items-center gap-2 mt-1 text-xs">
              <span class="font-medium text-slate-900">{{ po.customerName }}</span>
              <span class="text-slate-300">•</span>
              <span class="text-slate-500 font-normal">{{ po.project }}</span>
            </div>
          </div>

          <div class="flex items-center gap-5">
            <div class="text-right">
              <div class="text-[11px] text-slate-400 font-medium">Total Value</div>
              <div class="text-sm font-mono font-semibold text-slate-900">₱{{ po.totalAmount.toLocaleString() }}</div>
            </div>

            <button
              v-if="po.totalRemaining > 0"
              @click="openDeliveryModal(po)"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-lg shadow-xs transition-colors"
            >
              <PackageCheck class="w-4 h-4" />
              <span>Create Delivery</span>
            </button>
            <span v-else class="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/70">
              ✓ Fully Fulfilled
            </span>
          </div>
        </div>

        <!-- Progress Summary Ribbon -->
        <div class="px-6 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs">
          <div class="flex items-center gap-6">
            <div>
              <span class="text-slate-400 font-normal">Ordered:</span>
              <span class="ml-1 font-mono font-medium text-slate-800">{{ po.totalOrdered }} units</span>
            </div>
            <div>
              <span class="text-slate-400 font-normal">Delivered:</span>
              <span class="ml-1 font-mono font-semibold text-emerald-700">{{ po.totalDelivered }} units</span>
            </div>
            <div>
              <span class="text-slate-400 font-normal">Remaining:</span>
              <span class="ml-1 font-mono font-semibold text-amber-700">{{ po.totalRemaining }} units</span>
            </div>
          </div>

          <div class="w-48 flex items-center gap-2">
            <div class="flex-1 h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
              <div
                class="h-full bg-brand-600 rounded-full transition-all"
                :style="{ width: po.fulfillmentPercent + '%' }"
              ></div>
            </div>
            <span class="font-mono text-[11px] font-medium text-slate-500">{{ po.fulfillmentPercent }}%</span>
          </div>
        </div>

        <!-- Line Items Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50/40 border-b border-slate-100 text-slate-400 font-medium uppercase text-[11px] tracking-wider">
                <th class="py-3 px-6">Product Description</th>
                <th class="py-3 px-4 text-right">Unit Price</th>
                <th class="py-3 px-4 text-right">Ordered</th>
                <th class="py-3 px-4 text-right text-emerald-700">Delivered</th>
                <th class="py-3 px-4 text-right text-amber-700">Remaining</th>
                <th class="py-3 px-6 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr v-for="(item, idx) in po.items" :key="idx" class="hover:bg-slate-50/40 transition-colors">
                <td class="py-3 px-6">
                  <div class="font-medium text-slate-900">{{ item.productName }}</div>
                  <div class="text-[11px] text-slate-400 font-mono">Unit: {{ item.unit }}</div>
                </td>
                <td class="py-3 px-4 text-right font-mono text-slate-600">₱{{ item.unitPrice.toLocaleString() }}</td>
                <td class="py-3 px-4 text-right font-mono font-medium text-slate-800">{{ item.orderedQty }}</td>
                <td class="py-3 px-4 text-right font-mono font-semibold text-emerald-700">{{ item.deliveredQty }}</td>
                <td class="py-3 px-4 text-right font-mono font-semibold text-amber-700">{{ item.remainingQty }}</td>
                <td class="py-3 px-6 text-right font-mono font-medium text-slate-900">₱{{ item.itemTotal.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Delivery Modal (Integrated PO Fulfillment) -->
    <div v-if="showDeliveryModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 text-xs space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Create Delivery for {{ selectedPo?.poNumber }}</h3>
            <p class="text-slate-500 mt-0.5">Specify delivered quantities. A Delivery Receipt (DR) and SOA will be generated automatically.</p>
          </div>
          <button @click="showDeliveryModal = false" class="text-slate-400 hover:text-slate-700">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleCreateDelivery" class="space-y-4">
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

          <!-- Items Picker with Remaining Quantities pre-populated -->
          <div>
            <label class="block font-bold text-slate-800 mb-2">Quantities Being Shipped (Auto-calculated remaining quantities shown)</label>
            <div class="border border-slate-200 rounded-lg overflow-hidden">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
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

          <div>
            <label class="block font-medium text-slate-700 mb-1">Receiving Personnel / Staging Notes</label>
            <input v-model="deliveryForm.receivedBy" class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="e.g. Site Engineer / Receiving Staging ramp" />
          </div>

          <div class="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div class="text-xs text-slate-500">
              Total Delivery Value: <span class="font-mono font-bold text-slate-900">₱{{ calculatedDeliveryValue.toLocaleString() }}</span>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" @click="showDeliveryModal = false" class="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
              <button type="submit" class="px-4 py-2 bg-brand-700 text-white font-bold rounded-md hover:bg-brand-800 shadow-sm">
                Generate DR & SOA
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Create PO Modal -->
    <div v-if="showCreatePoModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 text-xs space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200">
          <h3 class="text-sm font-bold text-slate-900">Create New Customer Purchase Order</h3>
          <button @click="showCreatePoModal = false" class="text-slate-400 hover:text-slate-700">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleCreatePo" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-slate-700 mb-1">Customer *</label>
              <select v-model="newPo.customerId" required class="w-full px-3 py-2 border rounded-md border-slate-300" @change="onCustomerSelect">
                <option v-for="c in salesStore.customers" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">PO Reference Number *</label>
              <input v-model="newPo.poNumber" required class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono" placeholder="PO-CLI-2026-..." />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-slate-700 mb-1">PO Issue Date *</label>
              <input v-model="newPo.date" type="date" required class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono" />
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Payment Terms</label>
              <input v-model="newPo.paymentTerms" class="w-full px-3 py-2 border rounded-md border-slate-300" />
            </div>
          </div>

          <div>
            <label class="block font-medium text-slate-700 mb-1">Project Site / Building Reference *</label>
            <input v-model="newPo.project" required class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="e.g. Grand Residences Tower 3" />
          </div>

          <!-- Line items -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="font-bold text-slate-800">PO Ordered Products</label>
              <button type="button" @click="addLineItem" class="text-brand-700 hover:underline font-semibold">+ Add Item</button>
            </div>
            <div class="space-y-2">
              <div v-for="(line, idx) in newPo.items" :key="idx" class="flex gap-2 items-center">
                <select v-model="line.productId" @change="onProductSelect(line)" class="flex-1 px-2 py-1.5 border rounded border-slate-300">
                  <option v-for="p in salesStore.products" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
                <input v-model.number="line.orderedQty" type="number" min="1" placeholder="Qty" class="w-20 px-2 py-1.5 border rounded border-slate-300 text-right font-mono" />
                <input v-model.number="line.unitPrice" type="number" min="0" placeholder="Price" class="w-24 px-2 py-1.5 border rounded border-slate-300 text-right font-mono" />
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button type="button" @click="showCreatePoModal = false" class="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-slate-900 text-white font-semibold rounded-md hover:bg-slate-800">Save Purchase Order</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, PackageCheck, X } from 'lucide-vue-next'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useSalesStore } from '@/stores/salesStore'
import { useDeliveryStore } from '@/stores/deliveryStore'

const salesStore = useSalesStore()
const deliveryStore = useDeliveryStore()

// Delivery Modal State
const showDeliveryModal = ref(false)
const selectedPo = ref(null)
const deliveryForm = ref({
  date: new Date().toISOString().split('T')[0],
  deliveredBy: 'Pedro Cruz (Driver)',
  receivedBy: '',
  items: []
})

function openDeliveryModal(po) {
  selectedPo.value = po
  deliveryForm.value = {
    date: new Date().toISOString().split('T')[0],
    deliveredBy: 'Pedro Cruz (Driver)',
    receivedBy: po.customerName + ' Site Engineer',
    items: po.items.map(item => ({
      productId: item.productId,
      name: item.productName,
      unitPrice: item.unitPrice,
      unit: item.unit,
      orderedQty: item.orderedQty,
      remainingQty: item.remainingQty,
      quantity: item.remainingQty // default deliver remaining
    }))
  }
  showDeliveryModal.value = true
}

const calculatedDeliveryValue = computed(() => {
  if (!deliveryForm.value.items) return 0
  return deliveryForm.value.items.reduce((sum, i) => sum + ((Number(i.quantity) || 0) * (Number(i.unitPrice) || 0)), 0)
})

function handleCreateDelivery() {
  if (!selectedPo.value) return

  // Filter items with quantity > 0
  const validItems = deliveryForm.value.items.filter(i => Number(i.quantity) > 0)
  if (validItems.length === 0) {
    alert('Please enter at least one quantity to deliver.')
    return
  }

  deliveryStore.createDelivery({
    date: deliveryForm.value.date,
    poId: selectedPo.value.id,
    poNumber: selectedPo.value.poNumber,
    customerId: selectedPo.value.customerId,
    customerName: selectedPo.value.customerName,
    project: selectedPo.value.project,
    deliveredBy: deliveryForm.value.deliveredBy,
    receivedBy: deliveryForm.value.receivedBy,
    items: validItems
  })

  showDeliveryModal.value = false
}

// Create PO Modal State
const showCreatePoModal = ref(false)
const newPo = ref({
  customerId: 'cust-1',
  customerName: 'Cebu Landmaster Inc.',
  poNumber: '',
  date: new Date().toISOString().split('T')[0],
  paymentTerms: '30 Days upon delivery',
  project: '',
  items: [
    { productId: 'prod-1', productName: 'Door, Wooden Solid Panel 0.90x2.10 m. w/ Jamb Door', orderedQty: 50, unitPrice: 6800, unit: 'set' }
  ]
})

function onCustomerSelect() {
  const cust = salesStore.customers.find(c => c.id === newPo.value.customerId)
  if (cust) {
    newPo.value.customerName = cust.name
    newPo.value.paymentTerms = cust.paymentTerms
  }
}

function addLineItem() {
  newPo.value.items.push({
    productId: 'prod-2',
    productName: 'Hollow Core Flush 0.70 x 2.10 m. w/ Jamb',
    orderedQty: 50,
    unitPrice: 3500,
    unit: 'set'
  })
}

function onProductSelect(line) {
  const p = salesStore.products.find(prod => prod.id === line.productId)
  if (p) {
    line.productName = p.name
    line.unitPrice = p.defaultPrice
    line.unit = p.unit
  }
}

function handleCreatePo() {
  salesStore.addPurchaseOrder({
    ...newPo.value,
    items: newPo.value.items.map(i => ({
      ...i,
      deliveredQty: 0
    }))
  })

  showCreatePoModal.value = false
  newPo.value = {
    customerId: 'cust-1',
    customerName: 'Cebu Landmaster Inc.',
    poNumber: '',
    date: new Date().toISOString().split('T')[0],
    paymentTerms: '30 Days upon delivery',
    project: '',
    items: [
      { productId: 'prod-1', productName: 'Door, Wooden Solid Panel 0.90x2.10 m. w/ Jamb Door', orderedQty: 50, unitPrice: 6800, unit: 'set' }
    ]
  }
}
</script>

