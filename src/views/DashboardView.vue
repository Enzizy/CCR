<template>
  <div class="space-y-6">
    <!-- Top Executive Financial Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        title="Delivered Revenue"
        :value="'₱' + totalRevenue.toLocaleString()"
      >
        <template #icon>
          <TrendingUp class="w-4 h-4 text-brand-700" />
        </template>
      </StatCard>

      <StatCard
        title="Collections"
        :value="'₱' + billingStore.totalCollections.toLocaleString()"
      >
        <template #icon>
          <CheckCircle2 class="w-4 h-4 text-emerald-600" />
        </template>
      </StatCard>

      <StatCard
        title="Accounts Receivable"
        :value="'₱' + billingStore.totalReceivables.toLocaleString()"
      >
        <template #icon>
          <Clock class="w-4 h-4 text-amber-600" />
        </template>
      </StatCard>

      <StatCard
        title="Total Expenses"
        :value="'₱' + expenseStore.totalExpenses.toLocaleString()"
      >
        <template #icon>
          <CreditCard class="w-4 h-4 text-slate-600" />
        </template>
      </StatCard>

      <StatCard
        title="Est. Operating Net"
        :value="'₱' + estimatedProfit.toLocaleString()"
      >
        <template #icon>
          <Banknote class="w-4 h-4 text-brand-700" />
        </template>
      </StatCard>
    </div>

    <!-- Active POs & Fulfillment Progress Section -->
    <div class="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-900 tracking-tight">Active Customer Purchase Orders</h3>
        </div>
        <router-link
          to="/purchase-orders"
          class="text-xs font-medium text-brand-700 hover:text-brand-900 flex items-center gap-1 transition-colors"
        >
          <span>View All POs</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </router-link>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50/70 border-b border-slate-200/70 text-slate-500 font-medium uppercase text-[11px] tracking-wider">
              <th class="py-3 px-6">PO Number</th>
              <th class="py-3 px-4">Customer</th>
              <th class="py-3 px-4">Project</th>
              <th class="py-3 px-4 text-right">Total Units</th>
              <th class="py-3 px-4 text-right">Delivered</th>
              <th class="py-3 px-4 text-right">Remaining</th>
              <th class="py-3 px-4 w-40">Progress</th>
              <th class="py-3 px-6">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr
              v-for="po in salesStore.enrichedPurchaseOrders"
              :key="po.id"
              class="hover:bg-slate-50/60 transition-colors"
            >
              <td class="py-3.5 px-6 font-mono font-medium text-slate-900">{{ po.poNumber }}</td>
              <td class="py-3.5 px-4 font-medium text-slate-900">{{ po.customerName }}</td>
              <td class="py-3.5 px-4 text-slate-500">{{ po.project }}</td>
              <td class="py-3.5 px-4 text-right font-mono text-slate-700">{{ po.totalOrdered }}</td>
              <td class="py-3.5 px-4 text-right font-mono text-emerald-700 font-semibold">{{ po.totalDelivered }}</td>
              <td class="py-3.5 px-4 text-right font-mono text-amber-700 font-semibold">{{ po.totalRemaining }}</td>
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      class="h-full bg-brand-500 rounded-full transition-all"
                      :style="{ width: po.fulfillmentPercent + '%' }"
                    ></div>
                  </div>
                  <span class="text-[11px] font-mono text-slate-500">{{ po.fulfillmentPercent }}%</span>
                </div>
              </td>
              <td class="py-3.5 px-6">
                <StatusBadge :status="po.status" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Dual Column: Recent Deliveries & Receivables Aging -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Deliveries (DRs) -->
      <div class="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-slate-900 tracking-tight">Recent Delivery Receipts</h3>
          </div>
          <router-link
            to="/deliveries"
            class="text-xs font-medium text-brand-700 hover:text-brand-900 flex items-center gap-1 transition-colors"
          >
            <span>Deliveries</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
        </div>

        <div class="divide-y divide-slate-100 text-xs">
          <div
            v-for="dr in deliveryStore.recentDeliveries.slice(0, 4)"
            :key="dr.id"
            class="px-6 py-3.5 hover:bg-slate-50/50 flex items-center justify-between transition-colors"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono font-medium text-slate-900">{{ dr.drNumber }}</span>
                <StatusBadge :status="dr.status" />
              </div>
              <div class="text-xs text-slate-700 font-medium mt-1">{{ dr.customerName }}</div>
              <div class="text-[11px] text-slate-400 font-mono mt-0.5">{{ dr.date }} • {{ dr.items.length }} line items</div>
            </div>

            <div class="text-right">
              <div class="font-mono font-semibold text-sm text-slate-900">
                {{ dr.isReplacement ? '₱0.00 (Replacement)' : '₱' + dr.subtotal.toLocaleString() }}
              </div>
              <router-link
                :to="'/deliveries/' + dr.id"
                class="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-brand-700 hover:text-brand-900 transition-colors"
              >
                <Printer class="w-3 h-3" />
                <span>Print DR</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Outstanding Receivables Aging -->
      <div class="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-slate-900 tracking-tight">Customer Balances & Aging</h3>
          </div>
          <router-link
            to="/accounts-receivable"
            class="text-xs font-medium text-brand-700 hover:text-brand-900 flex items-center gap-1 transition-colors"
          >
            <span>A/R Aging</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
        </div>

        <div class="p-6 space-y-4">
          <!-- Aging Bar -->
          <div class="grid grid-cols-3 gap-3 text-center text-xs">
            <div class="p-3 bg-slate-50/80 rounded-lg border border-slate-200/70">
              <div class="text-[11px] font-medium text-slate-500">Current (> 7d)</div>
              <div class="text-sm font-mono font-semibold text-slate-800 mt-1">
                ₱{{ billingStore.agingSummary.current.toLocaleString() }}
              </div>
            </div>

            <div class="p-3 bg-amber-50/60 rounded-lg border border-amber-200/60">
              <div class="text-[11px] font-medium text-amber-700">Due Soon (≤ 7d)</div>
              <div class="text-sm font-mono font-semibold text-amber-800 mt-1">
                ₱{{ billingStore.agingSummary.dueSoon.toLocaleString() }}
              </div>
            </div>

            <div class="p-3 bg-rose-50/60 rounded-lg border border-rose-200/60">
              <div class="text-[11px] font-medium text-rose-700">Overdue</div>
              <div class="text-sm font-mono font-semibold text-rose-800 mt-1">
                ₱{{ billingStore.agingSummary.overdue.toLocaleString() }}
              </div>
            </div>
          </div>

          <!-- Customer Balances -->
          <div class="space-y-2 pt-1">
            <div
              v-for="cust in billingStore.customerReceivables"
              :key="cust.customerId"
              class="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors"
            >
              <div>
                <div class="text-xs font-medium text-slate-900">{{ cust.customerName }}</div>
                <div class="text-[11px] text-slate-400 font-mono mt-0.5">
                  Billed: ₱{{ cust.totalInvoiced.toLocaleString() }} | Collected: ₱{{ cust.totalCollected.toLocaleString() }}
                </div>
              </div>

              <div class="text-right">
                <span class="text-xs font-semibold font-mono text-slate-900">
                  ₱{{ cust.totalOutstanding.toLocaleString() }}
                </span>
                <span class="block text-[10px] text-slate-400">Balance Owed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  CreditCard,
  Banknote,
  ArrowRight,
  Printer
} from 'lucide-vue-next'

import StatCard from '@/components/common/StatCard.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useSalesStore } from '@/stores/salesStore'
import { useDeliveryStore } from '@/stores/deliveryStore'
import { useBillingStore } from '@/stores/billingStore'
import { useExpenseStore } from '@/stores/expenseStore'

const salesStore = useSalesStore()
const deliveryStore = useDeliveryStore()
const billingStore = useBillingStore()
const expenseStore = useExpenseStore()

const totalRevenue = computed(() => {
  return deliveryStore.deliveryReceipts.reduce((acc, dr) => acc + dr.subtotal, 0)
})

const estimatedProfit = computed(() => {
  return totalRevenue.value - expenseStore.totalExpenses
})

const dueSoonCount = computed(() => {
  return billingStore.enrichedStatements.filter(s => s.agingCategory === 'Due Soon').length
})
</script>
