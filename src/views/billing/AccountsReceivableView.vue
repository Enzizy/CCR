<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-base font-semibold text-slate-900 tracking-tight">Accounts Receivable (A/R) Aging</h2>
      </div>

      <div class="text-right text-xs bg-white border border-slate-200/80 px-4 py-2 rounded-xl shadow-xs">
        <span class="text-slate-400 block text-[11px] font-medium">Total Outstanding</span>
        <span class="font-mono font-semibold text-base text-slate-900">₱{{ billingStore.totalReceivables.toLocaleString() }}</span>
      </div>
    </div>

    <!-- Aging Buckets Ribbon -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Current (> 7 Days)</span>
          <span class="w-2 h-2 rounded-full bg-slate-400"></span>
        </div>
        <div class="mt-2 text-2xl font-semibold font-mono tracking-tight text-slate-900">
          ₱{{ billingStore.agingSummary.current.toLocaleString() }}
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-amber-200/80 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-amber-700">Due Soon (≤ 7 Days)</span>
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
        </div>
        <div class="mt-2 text-2xl font-semibold font-mono tracking-tight text-amber-800">
          ₱{{ billingStore.agingSummary.dueSoon.toLocaleString() }}
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-rose-200/80 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-rose-700">Overdue</span>
          <span class="w-2 h-2 rounded-full bg-rose-500"></span>
        </div>
        <div class="mt-2 text-2xl font-semibold font-mono tracking-tight text-rose-800">
          ₱{{ billingStore.agingSummary.overdue.toLocaleString() }}
        </div>
      </div>
    </div>

    <!-- Customer Balances & Breakdown -->
    <div class="space-y-6">
      <div
        v-for="cust in billingStore.customerReceivables"
        :key="cust.customerId"
        class="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 class="text-sm font-semibold text-slate-900">{{ cust.customerName }}</h3>
            <div class="flex items-center gap-3 text-xs text-slate-500 font-mono mt-0.5">
              <span>Billed: ₱{{ cust.totalInvoiced.toLocaleString() }}</span>
              <span class="text-slate-300">•</span>
              <span class="text-emerald-700 font-medium">Collected: ₱{{ cust.totalCollected.toLocaleString() }}</span>
            </div>
          </div>

          <div class="text-right">
            <span class="text-[11px] text-slate-400 font-medium block">Total Outstanding</span>
            <span class="text-sm font-mono font-semibold text-slate-900">₱{{ cust.totalOutstanding.toLocaleString() }}</span>
          </div>
        </div>

        <!-- SOAs for this Customer -->
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50/40 border-b border-slate-100 text-slate-400 font-medium uppercase text-[11px] tracking-wider">
              <th class="py-2.5 px-6">SOA Reference</th>
              <th class="py-2.5 px-4">Billing Date</th>
              <th class="py-2.5 px-4">Due Date</th>
              <th class="py-2.5 px-4 text-right">Invoiced</th>
              <th class="py-2.5 px-4 text-right">Paid</th>
              <th class="py-2.5 px-4 text-right">Balance</th>
              <th class="py-2.5 px-6 text-right">Aging Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-for="soa in cust.soas" :key="soa.id" class="hover:bg-slate-50/40 transition-colors">
              <td class="py-3 px-6 font-mono font-medium text-slate-900">
                {{ soa.soaNumber }}
                <span class="text-slate-400 font-normal ml-1">({{ soa.drNumber }})</span>
              </td>
              <td class="py-3 px-4 font-mono text-slate-500">{{ soa.date }}</td>
              <td class="py-3 px-4 font-mono font-medium" :class="soa.agingCategory === 'Overdue' ? 'text-rose-700' : 'text-slate-600'">{{ soa.dueDate }}</td>
              <td class="py-3 px-4 text-right font-mono text-slate-700">₱{{ soa.totalAmount.toLocaleString() }}</td>
              <td class="py-3 px-4 text-right font-mono text-emerald-700 font-medium">₱{{ soa.paidAmount.toLocaleString() }}</td>
              <td class="py-3 px-4 text-right font-mono font-semibold text-slate-900">₱{{ soa.balance.toLocaleString() }}</td>
              <td class="py-3 px-6 text-right">
                <StatusBadge :status="soa.status" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useBillingStore } from '@/stores/billingStore'

const billingStore = useBillingStore()
</script>

