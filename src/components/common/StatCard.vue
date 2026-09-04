<template>
  <div class="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] hover:border-slate-300/90 transition-all">
    <div class="flex items-center justify-between">
      <span class="text-xs font-medium text-slate-500">{{ title }}</span>
      <div v-if="$slots.icon" class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100/80">
        <slot name="icon"></slot>
      </div>
    </div>
    
    <div class="mt-3 flex items-baseline gap-1.5">
      <span class="text-2xl font-semibold font-mono tracking-tight text-slate-900">{{ value }}</span>
      <span v-if="unit" class="text-xs text-slate-400 font-normal">{{ unit }}</span>
    </div>

    <div v-if="subtitle || $slots.footer" class="mt-2 text-xs text-slate-400 flex items-center gap-1.5 font-normal">
      <slot name="footer">
        <span>{{ subtitle }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  }
})
</script>

