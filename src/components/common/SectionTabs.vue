<template>
  <nav v-if="tabs.length" aria-label="Section pages" class="no-print mb-5 flex gap-5 overflow-x-auto border-b border-slate-200 text-xs">
    <router-link v-for="tab in tabs" :key="tab.to" :to="tab.to" class="whitespace-nowrap border-b-2 pb-3 font-semibold" :class="active(tab.to) ? 'border-brand-700 text-brand-900' : 'border-transparent text-slate-500 hover:text-slate-900'" :aria-current="active(tab.to) ? 'page' : undefined">{{ tab.label }}</router-link>
  </nav>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const groups = [
  [{ to: '/deliveries', label: 'Delivery Receipts' }, { to: '/delivery-issues', label: 'Damages & Replacements' }, { to: '/delivery-trips', label: 'Trips & Fuel' }],
  [{ to: '/statements-of-account', label: 'Statements of Account' }, { to: '/payments', label: 'Payments Received' }, { to: '/accounts-receivable', label: 'Unpaid Balances' }],
  [{ to: '/payroll-advances', label: 'Salaries & Cash Advances' }, { to: '/employees', label: 'Employees' }],
]
const active = path => route.path === path || route.path.startsWith(path + '/')
const tabs = computed(() => groups.find(group => group.some(tab => active(tab.to))) || [])
</script>
