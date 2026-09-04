<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-base font-semibold text-slate-900 tracking-tight">Delivery Trips & Manifest</h2>
      </div>

      <button
        @click="showCreateTripModal = true"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-lg shadow-xs transition-colors"
      >
        <Plus class="w-4 h-4" />
        <span>Dispatch Delivery Trip</span>
      </button>
    </div>

    <!-- Automatic Expense Feature Callout -->
    <div class="p-4 bg-brand-50/60 border border-brand-200/70 rounded-xl flex items-start gap-3">
      <Fuel class="w-4 h-4 text-brand-700 mt-0.5 shrink-0" />
      <div class="text-xs">
        <span class="font-medium text-brand-950">Automatic Fuel Expense Integration:</span>
        <p class="text-slate-600 mt-0.5 font-normal">
          When fuel or toll costs are recorded on a delivery trip, the system automatically posts the corresponding general business expense under <strong>Transportation &gt; Gas/Fuel</strong> without duplicate manual entry.
        </p>
      </div>
    </div>

    <!-- Trip Cards -->
    <div class="grid grid-cols-1 gap-6">
      <div
        v-for="trip in deliveryStore.deliveryTrips"
        :key="trip.id"
        class="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-3">
              <span class="text-sm font-semibold font-mono text-slate-900">{{ trip.tripNumber }}</span>
              <span class="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-medium">{{ trip.date }}</span>
            </div>
            <div class="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <Truck class="w-3.5 h-3.5 text-slate-400" />
              <span class="font-medium text-slate-800">{{ trip.vehicle }}</span>
              <span class="text-slate-300">•</span>
              <span>Driver: <span class="text-slate-800 font-medium">{{ trip.driver }}</span></span>
              <span v-if="trip.assistant" class="text-slate-400">• Helper: {{ trip.assistant }}</span>
            </div>
          </div>

          <!-- Trip Expenses -->
          <div class="flex items-center gap-4 bg-slate-50/70 px-3.5 py-2 rounded-lg border border-slate-200/60 text-xs">
            <div>
              <span class="text-[10px] text-slate-400 font-medium block">Trip Gas/Fuel</span>
              <span class="font-mono font-medium text-slate-800">₱{{ trip.gasExpense.toLocaleString() }}</span>
            </div>
            <div class="border-l border-slate-200 pl-4">
              <span class="text-[10px] text-slate-400 font-medium block">Toll / Other</span>
              <span class="font-mono font-medium text-slate-800">₱{{ (trip.tollExpense + trip.otherExpense).toLocaleString() }}</span>
            </div>
            <div class="border-l border-slate-200 pl-4">
              <span class="text-[10px] text-emerald-700 font-medium block flex items-center gap-1">
                <CheckCircle2 class="w-3 h-3" /> Auto-Expensed
              </span>
              <span class="text-[10px] text-slate-400">In Central Expenses</span>
            </div>
          </div>
        </div>

        <!-- Manifest: DRs on this truck -->
        <div class="p-6">
          <div class="text-xs font-medium text-slate-500 mb-3">
            Trip Delivery Manifest ({{ trip.drNumbers.length }} Client Deliveries)
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="drNum in trip.drNumbers"
              :key="drNum"
              class="p-3 bg-slate-50/50 border border-slate-200/70 hover:border-slate-300 rounded-lg flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <span class="font-mono font-medium text-slate-900">{{ drNum }}</span>
                <div class="text-slate-600 font-medium mt-0.5">
                  {{ getDrCustomer(drNum) }}
                </div>
              </div>

              <router-link
                :to="getDrLink(drNum)"
                class="text-xs font-medium text-brand-700 hover:text-brand-900 flex items-center gap-1 transition-colors"
              >
                <span>View DR</span>
                <ArrowRight class="w-3 h-3" />
              </router-link>
            </div>
          </div>

          <div v-if="trip.notes" class="mt-4 text-xs text-slate-500 italic">
            Notes: {{ trip.notes }}
          </div>
        </div>
      </div>
    </div>

    <!-- Create Trip Modal -->
    <div v-if="showCreateTripModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Dispatch Delivery Trip</h3>
            <p class="text-slate-500 mt-0.5">Enter trip details. Fuel will automatically be recorded as an expense.</p>
          </div>
          <button @click="showCreateTripModal = false" class="text-slate-400 hover:text-slate-700">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleCreateTrip" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-slate-700 mb-1">Trip Date *</label>
              <input v-model="newTrip.date" type="date" required class="w-full px-3 py-2 border rounded-md border-slate-300 font-mono" />
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Vehicle *</label>
              <select v-model="newTrip.vehicle" class="w-full px-3 py-2 border rounded-md border-slate-300">
                <option value="Isuzu Forward 6-Wheeler (CAE-8921)">Isuzu Forward 6-Wheeler (CAE-8921)</option>
                <option value="Isuzu Elf Dropside (GCC-4512)">Isuzu Elf Dropside (GCC-4512)</option>
                <option value="Mitsubishi Canter Van (YAA-3390)">Mitsubishi Canter Van (YAA-3390)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-slate-700 mb-1">Driver *</label>
              <input v-model="newTrip.driver" required class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="Pedro Cruz" />
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Driver Assistant / Helper</label>
              <input v-model="newTrip.assistant" class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="Juan Dela Cruz" />
            </div>
          </div>

          <div class="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-2">
            <div class="font-bold text-amber-950 flex items-center gap-1.5">
              <Fuel class="w-4 h-4 text-amber-700" />
              <span>Trip Operating Expenses (Auto-Logged)</span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-amber-900 font-medium mb-1">Gas / Diesel (PHP) *</label>
                <input v-model.number="newTrip.gasExpense" type="number" required class="w-full px-3 py-1.5 border rounded border-amber-300 bg-white font-mono font-bold" />
              </div>
              <div>
                <label class="block text-amber-900 font-medium mb-1">Toll / Parking (PHP)</label>
                <input v-model.number="newTrip.tollExpense" type="number" class="w-full px-3 py-1.5 border rounded border-amber-300 bg-white font-mono" />
              </div>
            </div>
          </div>

          <div>
            <label class="block font-medium text-slate-700 mb-1">Assign DRs to this trip</label>
            <div class="space-y-1.5 max-h-36 overflow-y-auto border border-slate-200 p-2 rounded-md">
              <label
                v-for="dr in deliveryStore.deliveryReceipts"
                :key="dr.id"
                class="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer"
              >
                <input type="checkbox" :value="dr.drNumber" v-model="newTrip.drNumbers" class="rounded text-brand-600" />
                <span class="font-mono font-bold text-slate-900">{{ dr.drNumber }}</span>
                <span class="text-slate-600">({{ dr.customerName }})</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block font-medium text-slate-700 mb-1">Trip Logistics Notes</label>
            <textarea v-model="newTrip.notes" rows="2" class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="Route sequence, customer gate timings..."></textarea>
          </div>

          <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button type="button" @click="showCreateTripModal = false" class="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-slate-900 text-white font-bold rounded-md hover:bg-slate-800 shadow-sm">
              Save Trip & Auto-Log Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, Truck, Fuel, CheckCircle2, ArrowRight, X } from 'lucide-vue-next'
import { useDeliveryStore } from '@/stores/deliveryStore'

const deliveryStore = useDeliveryStore()

const showCreateTripModal = ref(false)
const newTrip = ref({
  date: new Date().toISOString().split('T')[0],
  vehicle: 'Isuzu Elf Dropside (GCC-4512)',
  driver: 'Pedro Cruz',
  assistant: 'Mark Bautista',
  gasExpense: 2500,
  tollExpense: 0,
  otherExpense: 0,
  drNumbers: ['DR #4330'],
  notes: ''
})

function getDrCustomer(drNum) {
  const dr = deliveryStore.deliveryReceipts.find(d => d.drNumber === drNum)
  return dr ? dr.customerName : 'Client Delivery'
}

function getDrLink(drNum) {
  const dr = deliveryStore.deliveryReceipts.find(d => d.drNumber === drNum)
  return dr ? `/deliveries/${dr.id}` : '/deliveries'
}

function handleCreateTrip() {
  deliveryStore.createDeliveryTrip(newTrip.value)
  showCreateTripModal.value = false
  newTrip.value = {
    date: new Date().toISOString().split('T')[0],
    vehicle: 'Isuzu Elf Dropside (GCC-4512)',
    driver: 'Pedro Cruz',
    assistant: '',
    gasExpense: 2500,
    tollExpense: 0,
    otherExpense: 0,
    drNumbers: [],
    notes: ''
  }
}
</script>

