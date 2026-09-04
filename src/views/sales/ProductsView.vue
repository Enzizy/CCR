<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-base font-semibold text-slate-900 tracking-tight">Products & Catalog</h2>
      </div>
      <button
        @click="showAddModal = true"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-lg shadow-xs transition-colors"
      >
        <Plus class="w-4 h-4" />
        <span>Add Product</span>
      </button>
    </div>

    <!-- Products Table -->
    <div class="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-slate-50/60 border-b border-slate-100 text-slate-400 font-medium uppercase text-[11px] tracking-wider">
            <th class="py-3 px-5 w-32">SKU Code</th>
            <th class="py-3 px-4">Item Name & Specification</th>
            <th class="py-3 px-4 w-24 text-center">Unit</th>
            <th class="py-3 px-4 w-36 text-right">Standard Price</th>
            <th class="py-3 px-5 w-28 text-center">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-700">
          <tr v-for="p in salesStore.products" :key="p.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="py-3.5 px-5 font-mono font-medium text-slate-900">{{ p.sku }}</td>
            <td class="py-3.5 px-4">
              <div class="font-medium text-slate-900">{{ p.name }}</div>
              <div class="text-[11px] text-slate-400 font-normal mt-0.5">{{ p.description }}</div>
            </td>
            <td class="py-3.5 px-4 text-center uppercase text-slate-500 font-mono text-[11px]">{{ p.unit }}</td>
            <td class="py-3.5 px-4 text-right font-mono font-medium text-slate-900">₱{{ p.defaultPrice.toLocaleString() }}</td>
            <td class="py-3.5 px-5 text-center">
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                Active
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Product Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div class="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 text-xs space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200">
          <h3 class="text-sm font-bold text-slate-900">Add New Architectural Product</h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-700">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleAddProduct" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-slate-700 mb-1">SKU / Item Code *</label>
              <input v-model="newProd.sku" required class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono" placeholder="e.g. WSP-080210" />
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Unit of Measure *</label>
              <input v-model="newProd.unit" required class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="e.g. set, pc, panel" />
            </div>
          </div>
          <div>
            <label class="block font-medium text-slate-700 mb-1">Product Name / Title *</label>
            <input v-model="newProd.name" required class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="e.g. Door, Wooden Solid Panel 0.80x2.10 m." />
          </div>
          <div>
            <label class="block font-medium text-slate-700 mb-1">Standard Reference Price (PHP) *</label>
            <input v-model.number="newProd.defaultPrice" type="number" required class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono" placeholder="6800" />
          </div>
          <div>
            <label class="block font-medium text-slate-700 mb-1">Detailed Technical Specifications</label>
            <textarea v-model="newProd.description" rows="2" class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="Wood species, jamb dimensions, sanding grit, moisture content..."></textarea>
          </div>

          <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button type="button" @click="showAddModal = false" class="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-slate-900 text-white font-semibold rounded-md hover:bg-slate-800">Add to Catalog</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import { useSalesStore } from '@/stores/salesStore'

const salesStore = useSalesStore()

const showAddModal = ref(false)
const newProd = ref({
  sku: '',
  name: '',
  unit: 'set',
  defaultPrice: null,
  description: ''
})

function handleAddProduct() {
  salesStore.addProduct(newProd.value)
  showAddModal.value = false
  newProd.value = {
    sku: '',
    name: '',
    unit: 'set',
    defaultPrice: null,
    description: ''
  }
}
</script>

