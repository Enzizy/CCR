<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div class="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div class="px-6 pt-6 pb-4">
        <h3 class="text-lg font-bold text-slate-900">{{ title }}</h3>
        <p class="mt-2 text-sm text-slate-600 leading-relaxed">{{ message }}</p>
        <slot></slot>
      </div>
      
      <div class="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-3">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="$emit('confirm')"
          :class="[
            'px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-colors',
            confirmButtonClass
          ]"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?'
  },
  confirmLabel: {
    type: String,
    default: 'Confirm'
  },
  confirmButtonClass: {
    type: String,
    default: 'bg-slate-900 text-white hover:bg-slate-800'
  }
})

defineEmits(['confirm', 'cancel'])
</script>

