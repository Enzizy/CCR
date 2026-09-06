<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="page-title">Monthly Financial Summary</h2>
        <p class="text-xs text-slate-500 mt-0.5">Overview of cash collections, operational expenses, and deliveries.</p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-medium text-slate-500">Period:</span>
        <select v-model="selectedPeriod" class="text-xs border rounded-lg px-3 py-2 bg-white border-slate-200 font-medium text-slate-800 shadow-xs focus:ring-1 focus:ring-brand-500">
          <option v-for="period in periodOptions" :key="period.value" :value="period.value">{{ period.label }}</option>
        </select>
      </div>
    </div>

    <!-- 4 Key Numbers -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Cash In -->
      <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Cash In (Collections)</span>
          <span class="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <ArrowDownLeft class="w-4 h-4" />
          </span>
        </div>
        <div class="mt-2 text-2xl font-bold font-mono tracking-tight text-emerald-600">
          ₱{{ periodCollections.toLocaleString() }}
        </div>
        <p class="text-[11px] text-slate-400 mt-1">Payments collected this month</p>
      </div>

      <!-- Cash Out -->
      <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Cash Out (Expenses)</span>
          <span class="p-1.5 rounded-lg bg-rose-50 text-rose-600">
            <ArrowUpRight class="w-4 h-4" />
          </span>
        </div>
        <div class="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900">
          ₱{{ periodExpenses.toLocaleString() }}
        </div>
        <p class="text-[11px] text-slate-400 mt-1">Total operating expenses spent</p>
      </div>

      <!-- Net Cash -->
      <div class="bg-white p-5 rounded-xl border shadow-xs" :class="netCash >= 0 ? 'border-brand-200/80 bg-brand-50/20' : 'border-rose-200/80 bg-rose-50/20'">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium" :class="netCash >= 0 ? 'text-brand-900' : 'text-rose-900'">Net Cash Generated</span>
          <span class="p-1.5 rounded-lg" :class="netCash >= 0 ? 'bg-brand-100 text-brand-700' : 'bg-rose-100 text-rose-700'">
            <Wallet class="w-4 h-4" />
          </span>
        </div>
        <div class="mt-2 text-2xl font-bold font-mono tracking-tight" :class="netCash >= 0 ? 'text-brand-900' : 'text-rose-700'">
          ₱{{ netCash.toLocaleString() }}
        </div>
        <p class="text-[11px] text-slate-400 mt-1">Cash In minus Cash Out</p>
      </div>

      <!-- Delivered Sales -->
      <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Delivered Orders</span>
          <span class="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Truck class="w-4 h-4" />
          </span>
        </div>
        <div class="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900">
          ₱{{ periodRevenue.toLocaleString() }}
        </div>
        <p class="text-[11px] text-slate-400 mt-1">Total goods delivered to clients</p>
      </div>
    </div>

    <!-- Details Section: Expense Breakdown + Cash Summary -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Expense Breakdown (Takes 2 cols) -->
      <div class="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-slate-900">Where Money Went (Expenses)</h3>
            <p class="text-[11px] text-slate-400 mt-0.5">Categorized breakdown for this month</p>
          </div>
          <span class="text-xs font-mono font-bold text-slate-900">
            Total: ₱{{ periodExpenses.toLocaleString() }}
          </span>
        </div>

        <table class="data-table">
          <thead>
            <tr class="data-table-header">
              <th class="py-3 px-6">Expense Category</th>
              <th class="py-3 px-4 w-44">Share</th>
              <th class="py-3 px-6 text-right">Amount</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-for="item in periodCategoryBreakdown" :key="item.category" class="hover:bg-slate-50/50 transition-colors">
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
            <tr v-if="periodCategoryBreakdown.length === 0">
              <td colspan="3" class="py-12 text-center text-xs text-slate-400">
                No expenses recorded for this month.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Quick Summary Card (Takes 1 col) -->
      <div class="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-900">Monthly Cash Flow</h3>
          <p class="text-[11px] text-slate-400 mt-0.5">Summary for selected month</p>

          <div class="mt-5 space-y-3 text-xs">
            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <span class="text-slate-600">Cash Received</span>
              <span class="font-mono font-semibold text-emerald-600">+₱{{ periodCollections.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <span class="text-slate-600">Expenses Paid</span>
              <span class="font-mono font-semibold text-rose-600">-₱{{ periodExpenses.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between pt-2">
              <span class="font-bold text-slate-900">Net Cash</span>
              <span class="font-mono font-bold text-base" :class="netCash >= 0 ? 'text-brand-900' : 'text-rose-600'">
                ₱{{ netCash.toLocaleString() }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 bg-slate-50/70 p-3.5 rounded-lg text-xs space-y-1">
          <div class="flex items-center justify-between text-slate-500 text-[11px]">
            <span>Delivered Orders:</span>
            <span class="font-mono font-medium text-slate-800">₱{{ periodRevenue.toLocaleString() }}</span>
          </div>
          <p class="text-[10px] text-slate-400 leading-tight">
            Customer deliveries are collected based on terms (e.g. 15-30 days).
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ArrowDownLeft, ArrowUpRight, Wallet, Truck } from 'lucide-vue-next'
import { useDeliveryStore } from '@/stores/deliveryStore'
import { useBillingStore } from '@/stores/billingStore'
import { useExpenseStore } from '@/stores/expenseStore'

const deliveryStore = useDeliveryStore()
const billingStore = useBillingStore()
const expenseStore = useExpenseStore()

const selectedPeriod = ref(new Date().toISOString().slice(0, 7))

const periodOptions = computed(() => {
  const periods = new Set([selectedPeriod.value])
  deliveryStore.deliveryReceipts.forEach(item => item.date && periods.add(item.date.slice(0, 7)))
  billingStore.payments.forEach(item => item.date && periods.add(item.date.slice(0, 7)))
  expenseStore.expenses.forEach(item => item.date && periods.add(item.date.slice(0, 7)))

  return [...periods].sort().reverse().map(value => ({
    value,
    label: new Date(`${value}-01T00:00:00`).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
  }))
})

const periodRevenue = computed(() => deliveryStore.deliveryReceipts
  .filter(item => item.date?.startsWith(selectedPeriod.value))
  .reduce((total, item) => total + Number(item.subtotal || 0), 0))

const periodCollections = computed(() => billingStore.payments
  .filter(item => item.date?.startsWith(selectedPeriod.value))
  .reduce((total, item) => total + Number(item.amount || 0), 0))

const periodExpenseRecords = computed(() => expenseStore.expenses
  .filter(item => item.date?.startsWith(selectedPeriod.value)))

const periodExpenses = computed(() => periodExpenseRecords.value
  .reduce((total, item) => total + Number(item.amount || 0), 0))

const periodCategoryBreakdown = computed(() => {
  const totals = periodExpenseRecords.value.reduce((result, item) => {
    result[item.category] = (result[item.category] || 0) + Number(item.amount || 0)
    return result
  }, {})

  return Object.entries(totals).map(([category, amount]) => ({
    category,
    amount,
    percent: Math.round((amount / (periodExpenses.value || 1)) * 100)
  })).sort((a, b) => b.amount - a.amount)
})

const netCash = computed(() => {
  return periodCollections.value - periodExpenses.value
})
</script>
