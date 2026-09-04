<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="page-title">Collections & Official Payments Received</h2>
      </div>

      <div class="flex items-center gap-3">
        <div class="text-right text-xs bg-emerald-50 px-3.5 py-1.5 rounded-lg border border-emerald-200">
          <span class="text-emerald-800 font-semibold block text-[10px] uppercase tracking-wider">Total Collections</span>
          <span class="font-mono font-bold text-base text-emerald-950">₱{{ billingStore.totalCollections.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- Payments Table -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <table class="data-table">
        <thead>
          <tr class="data-table-header">
            <th class="py-3 px-4 w-28">Receipt #</th>
            <th class="py-3 px-4 w-28">Payment Date</th>
            <th class="py-3 px-4">Customer Name</th>
            <th class="py-3 px-4">Applied to SOA</th>
            <th class="py-3 px-4 w-28">Method</th>
            <th class="py-3 px-4">Bank / Reference No.</th>
            <th class="py-3 px-4 text-right">Amount Received</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="pay in billingStore.payments"
            :key="pay.id"
            class="hover:bg-slate-50/70 transition-colors"
          >
            <td class="py-3.5 px-4 font-mono font-bold text-slate-900">{{ pay.receiptNumber }}</td>
            <td class="py-3.5 px-4 font-mono text-slate-600">{{ pay.date }}</td>
            <td class="py-3.5 px-4 font-bold text-slate-900">{{ pay.customerName }}</td>
            <td class="py-3.5 px-4 font-mono font-semibold text-brand-700">{{ pay.soaNumber }}</td>
            <td class="py-3.5 px-4">
              <span class="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-medium text-[11px]">
                {{ pay.paymentMethod }}
              </span>
            </td>
            <td class="py-3.5 px-4">
              <div class="font-mono text-slate-900">{{ pay.referenceNumber }}</div>
              <div class="text-[11px] text-slate-500 font-normal">{{ pay.bankName }}</div>
            </td>
            <td class="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
              ₱{{ pay.amount.toLocaleString() }}
            </td>
          </tr>
          <tr v-if="billingStore.payments.length === 0">
            <td colspan="7" class="py-12 text-center text-xs text-slate-500">No payments recorded yet.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useBillingStore } from '@/stores/billingStore'

const billingStore = useBillingStore()
</script>
