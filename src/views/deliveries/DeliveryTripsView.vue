<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="page-title">Delivery Trips & Manifest</h2>
      </div>

      <button
        @click="openCreateTripModal"
        :disabled="availableReceipts.length === 0"
        :title="availableReceipts.length ? 'Dispatch delivery trip' : 'No unassigned delivery receipts'"
        class="primary-button"
      >
        <Plus class="w-4 h-4" />
        <span>Dispatch Delivery Trip</span>
      </button>
    </div>

    <!-- Trip Cards -->
    <div class="grid grid-cols-1 gap-6">
      <div v-if="deliveryStore.deliveryTrips.length === 0" class="section-card empty-state">
        <h3>No delivery trips yet</h3>
        <p>Dispatch a trip after at least one delivery receipt has been created.</p>
      </div>
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
    <Teleport to="body">
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
              <input v-model="newTrip.vehicle" required class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="Vehicle and plate number" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-slate-700 mb-1">Driver *</label>
              <input v-model="newTrip.driver" required class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="Driver name" />
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Driver Assistant / Helper</label>
              <input v-model="newTrip.assistant" class="w-full px-3 py-2 border rounded-md border-slate-300" placeholder="Assistant name" />
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
                <input v-model.number="newTrip.gasExpense" type="number" min="0" required class="w-full px-3 py-1.5 border rounded border-amber-300 bg-white font-mono font-bold" />
              </div>
              <div>
                <label class="block text-amber-900 font-medium mb-1">Toll / Parking (PHP)</label>
                <input v-model.number="newTrip.tollExpense" type="number" min="0" class="w-full px-3 py-1.5 border rounded border-amber-300 bg-white font-mono" />
              </div>
            </div>
          </div>

          <div>
            <label class="block font-medium text-slate-700 mb-1">Assign DRs to this trip</label>
            <div class="space-y-1.5 max-h-36 overflow-y-auto border border-slate-200 p-2 rounded-md">
              <label
                v-for="dr in availableReceipts"
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
            <button type="submit" :disabled="newTrip.drNumbers.length === 0" class="primary-button">
              Save Trip & Auto-Log Expense
            </button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Plus, Truck, Fuel, CheckCircle2, ArrowRight, X } from 'lucide-vue-next'
import { useDeliveryStore } from '@/stores/deliveryStore'

const deliveryStore = useDeliveryStore()
const availableReceipts = computed(() => deliveryStore.deliveryReceipts.filter(receipt => !receipt.tripId))

const showCreateTripModal = ref(false)
const newTrip = ref({
  date: new Date().toISOString().split('T')[0],
  vehicle: '',
  driver: '',
  assistant: '',
  gasExpense: 0,
  tollExpense: 0,
  otherExpense: 0,
  drNumbers: [],
  notes: ''
})

function openCreateTripModal() {
  if (availableReceipts.value.length === 0) return
  showCreateTripModal.value = true
}

function getDrCustomer(drNum) {
  const dr = deliveryStore.deliveryReceipts.find(d => d.drNumber === drNum)
  return dr ? dr.customerName : 'Client Delivery'
}

function getDrLink(drNum) {
  const dr = deliveryStore.deliveryReceipts.find(d => d.drNumber === drNum)
  return dr ? `/deliveries/${dr.id}` : '/deliveries'
}

function handleCreateTrip() {
  if (newTrip.value.drNumbers.length === 0) return
  deliveryStore.createDeliveryTrip(newTrip.value)
  showCreateTripModal.value = false
  newTrip.value = {
    date: new Date().toISOString().split('T')[0],
    vehicle: '',
    driver: '',
    assistant: '',
    gasExpense: 0,
    tollExpense: 0,
    otherExpense: 0,
    drNumbers: [],
    notes: ''
  }
}
</script>
