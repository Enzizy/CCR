<template>
  <div class="my-3 p-4 bg-slate-50 border-2 border-brand-200 rounded-lg shadow-sm text-xs">
    <div class="flex items-center justify-between pb-2 border-b border-slate-200">
      <div class="flex items-center gap-1.5 font-bold text-slate-900">
        <span class="w-2 h-2 rounded-full bg-brand-600"></span>
        {{ action.title }}
      </div>
      <span
        :class="[
          'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
          action.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
          action.status === 'cancelled' ? 'bg-slate-200 text-slate-700' :
          'bg-amber-100 text-amber-800'
        ]"
      >
        {{ action.status }}
      </span>
    </div>

    <!-- Action Details Breakdown -->
    <div class="mt-3 space-y-1.5 text-slate-700">
      <div v-if="action.details.amount" class="flex justify-between py-1 bg-white px-2 rounded border border-slate-200">
        <span class="text-slate-500">Amount:</span>
        <span class="font-bold font-mono text-sm text-slate-950">₱{{ Number(action.details.amount).toLocaleString() }}</span>
      </div>
      <div v-if="action.details.category" class="flex justify-between">
        <span class="text-slate-500">Category:</span>
        <span class="font-semibold text-slate-800">{{ action.details.category }} ({{ action.details.subCategory }})</span>
      </div>
      <div v-if="action.details.description" class="flex justify-between">
        <span class="text-slate-500">Description:</span>
        <span class="text-slate-800 text-right">{{ action.details.description }}</span>
      </div>
      <div v-if="action.details.supplier" class="flex justify-between">
        <span class="text-slate-500">Supplier / Vendor:</span>
        <span class="text-slate-800">{{ action.details.supplier }}</span>
      </div>
      <div v-if="action.details.date" class="flex justify-between">
        <span class="text-slate-500">Date:</span>
        <span class="text-slate-800 font-mono">{{ action.details.date }}</span>
      </div>
    </div>

    <!-- Confirmation Actions -->
    <div v-if="action.status === 'pending'" class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
      <button
        @click="$emit('cancel', action)"
        class="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-200/70 rounded transition-colors"
      >
        Cancel
      </button>
      <button
        @click="$emit('confirm', action)"
        class="px-3 py-1.5 font-semibold text-white bg-brand-700 hover:bg-brand-800 rounded shadow-sm transition-colors flex items-center gap-1"
      >
        Confirm & Save Record
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  action: {
    type: Object,
    required: true
  }
})

defineEmits(['confirm', 'cancel'])
</script>

