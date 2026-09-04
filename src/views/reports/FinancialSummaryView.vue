<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-base font-semibold text-slate-900 tracking-tight">Financial Performance & Cash Flow</h2>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-medium text-slate-500">Fiscal Period:</span>
        <select class="text-xs border rounded-lg px-3 py-1.5 bg-white border-slate-200 font-medium text-slate-700 shadow-xs">
          <option value="2026-09">September 2026 (Current)</option>
          <option value="2026-08">August 2026</option>
        </select>
      </div>
    </div>

    <!-- Core Financial Formula Banner -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-5 bg-white border border-slate-200/80 rounded-xl shadow-xs">
        <div class="text-xs font-medium text-slate-500">Operating Accrual Profit</div>
        <div class="mt-3 flex items-center justify-between text-xs">
          <div>
            <div class="text-slate-400 text-[11px]">Delivered Revenue</div>
            <div class="font-mono font-semibold text-slate-900 text-sm mt-0.5">₱{{ totalRevenue.toLocaleString() }}</div>
          </div>
          <span class="text-sm text-slate-300 font-normal">-</span>
          <div>
            <div class="text-slate-400 text-[11px]">Central Expenses</div>
            <div class="font-mono font-semibold text-slate-700 text-sm mt-0.5">₱{{ expenseStore.totalExpenses.toLocaleString() }}</div>
          </div>
          <span class="text-sm text-slate-300 font-normal">=</span>
          <div>
            <div class="text-slate-400 text-[11px]">Operating Profit</div>
            <div class="font-mono font-semibold text-emerald-700 text-sm mt-0.5">₱{{ operatingProfit.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <div class="p-5 bg-white border border-slate-200/80 rounded-xl shadow-xs">
        <div class="text-xs font-medium text-slate-500">Cash Flow Liquidity</div>
        <div class="mt-3 flex items-center justify-between text-xs">
          <div>
            <div class="text-slate-400 text-[11px]">Cash Collected</div>
            <div class="font-mono font-semibold text-emerald-700 text-sm mt-0.5">₱{{ billingStore.totalCollections.toLocaleString() }}</div>
          </div>
          <span class="text-sm text-slate-300 font-normal">-</span>
          <div>
            <div class="text-slate-400 text-[11px]">Cash Disbursed</div>
            <div class="font-mono font-semibold text-slate-700 text-sm mt-0.5">₱{{ expenseStore.totalExpenses.toLocaleString() }}</div>
          </div>
          <span class="text-sm text-slate-300 font-normal">=</span>
          <div>
            <div class="text-slate-400 text-[11px]">Net Cash Balance</div>
            <div class="font-mono font-semibold text-sm mt-0.5" :class="netCash >= 0 ? 'text-brand-800' : 'text-rose-700'">
              ₱{{ netCash.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Metric Breakdown Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <span class="text-xs font-medium text-slate-500">Delivered Revenue</span>
        <div class="mt-2 text-2xl font-semibold font-mono tracking-tight text-slate-900">₱{{ totalRevenue.toLocaleString() }}</div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <span class="text-xs font-medium text-emerald-700">Total Collections</span>
        <div class="mt-2 text-2xl font-semibold font-mono tracking-tight text-emerald-800">₱{{ billingStore.totalCollections.toLocaleString() }}</div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <span class="text-xs font-medium text-amber-700">Accounts Receivable</span>
        <div class="mt-2 text-2xl font-semibold font-mono tracking-tight text-amber-800">₱{{ billingStore.totalReceivables.toLocaleString() }}</div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <span class="text-xs font-medium text-slate-500">Central Expenses</span>
        <div class="mt-2 text-2xl font-semibold font-mono tracking-tight text-slate-900">₱{{ expenseStore.totalExpenses.toLocaleString() }}</div>
      </div>
    </div>

    <!-- Expense Category Breakdown Table -->
    <div class="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100">
        <h3 class="text-sm font-semibold text-slate-900">Monthly Operating Expense Allocation</h3>
      </div>

      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-slate-50/60 border-b border-slate-100 text-slate-400 font-medium uppercase text-[11px] tracking-wider">
            <th class="py-3 px-6">Expense Category</th>
            <th class="py-3 px-4 w-48">Share of Total</th>
            <th class="py-3 px-6 text-right">Amount</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-700">
          <tr v-for="item in expenseStore.categoryBreakdown" :key="item.category" class="hover:bg-slate-50/50 transition-colors">
            <td class="py-3.5 px-6 font-medium text-slate-900">{{ item.category }}</td>
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-2">
                <div class="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div class="h-full bg-brand-600 rounded-full" :style="{ width: item.percent + '%' }"></div>
                </div>
                <span class="font-mono text-[11px] text-slate-400">{{ item.percent }}%</span>
              </div>
            </td>
            <td class="py-3.5 px-6 text-right font-mono font-medium text-slate-900">₱{{ item.amount.toLocaleString() }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="bg-slate-50/60 font-medium border-t border-slate-200">
            <td class="py-3 px-6 text-slate-500 uppercase tracking-wider text-[11px]">Total Consolidated Expenses</td>
            <td></td>
            <td class="py-3 px-6 text-right font-mono font-semibold text-slate-900 text-sm">
              ₱{{ expenseStore.totalExpenses.toLocaleString() }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDeliveryStore } from '@/stores/deliveryStore'
import { useBillingStore } from '@/stores/billingStore'
import { useExpenseStore } from '@/stores/expenseStore'

const deliveryStore = useDeliveryStore()
const billingStore = useBillingStore()
const expenseStore = useExpenseStore()

const totalRevenue = computed(() => {
  return deliveryStore.deliveryReceipts.reduce((acc, dr) => acc + dr.subtotal, 0)
})

const operatingProfit = computed(() => {
  return totalRevenue.value - expenseStore.totalExpenses
})

const netCash = computed(() => {
  return billingStore.totalCollections - expenseStore.totalExpenses
})
</script>

