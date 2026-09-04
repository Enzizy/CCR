<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border tracking-normal transition-colors',
      badgeStyles
    ]"
  >
    <span :class="['w-1.5 h-1.5 rounded-full', dotStyle]"></span>
    {{ label || status }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: ''
  }
})

const badgeStyles = computed(() => {
  switch (props.status) {
    case 'Completed':
    case 'Paid':
    case 'Resolved':
    case 'Repaid':
      return 'bg-emerald-50/80 text-emerald-700 border-emerald-200/70'
    case 'Partially Delivered':
    case 'Partially Paid':
      return 'bg-sky-50/80 text-sky-700 border-sky-200/70'
    case 'Open':
    case 'Draft':
    case 'Current':
      return 'bg-slate-50 text-slate-600 border-slate-200/70'
    case 'Due Soon':
    case 'Replacement Pending':
      return 'bg-amber-50/80 text-amber-700 border-amber-200/70'
    case 'Overdue':
    case 'Cancelled':
      return 'bg-rose-50/80 text-rose-700 border-rose-200/70'
    case 'Replacement':
      return 'bg-purple-50/80 text-purple-700 border-purple-200/70'
    case 'Delivered':
      return 'bg-brand-50 text-brand-800 border-brand-200/70'
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200/70'
  }
})

const dotStyle = computed(() => {
  switch (props.status) {
    case 'Completed':
    case 'Paid':
    case 'Resolved':
    case 'Repaid':
      return 'bg-emerald-500'
    case 'Partially Delivered':
    case 'Partially Paid':
      return 'bg-sky-500'
    case 'Open':
    case 'Draft':
    case 'Current':
      return 'bg-slate-400'
    case 'Due Soon':
    case 'Replacement Pending':
      return 'bg-amber-500'
    case 'Overdue':
    case 'Cancelled':
      return 'bg-rose-500'
    case 'Replacement':
      return 'bg-purple-500'
    case 'Delivered':
      return 'bg-blue-500'
    default:
      return 'bg-slate-400'
  }
})
</script>

