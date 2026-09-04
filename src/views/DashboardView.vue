<template>
  <div class="space-y-6">
    <!-- TOP SECTION: Balance Graph with Vertical KPI Stack + Green Corporate Card -->
    <div class="grid grid-cols-12 gap-6">
      <!-- Main Graph Card with Vertical KPI Stack (Left 8 cols on xl) -->
      <div class="col-span-12 xl:col-span-8 bg-white border border-[#e2ebd8] rounded-2xl p-6 shadow-[0_2px_12px_-4px_rgba(43,69,27,0.04)] flex flex-col lg:flex-row gap-6">
        <!-- Left: Interactive Graph Component -->
        <div class="flex-1 flex flex-col justify-between min-w-0">
          <!-- Graph Header & Filter Toolbar -->
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div class="text-xs font-medium text-slate-400">Balance overview</div>
              <div class="text-3xl font-bold font-mono tracking-tight text-slate-900 mt-1">
                ₱{{ totalRevenue.toLocaleString() }}
              </div>
            </div>

            <div class="flex items-center gap-3">
              <!-- Legend matching sample -->
              <div class="hidden sm:flex items-center gap-3 text-[11px] font-medium text-slate-500">
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-[#a8d08d]"></span>
                  Delivered
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-[#558238]"></span>
                  Collections
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-[#d6e5cc]"></span>
                  Expenses
                </span>
              </div>

              <!-- Range Toggle -->
              <div class="flex items-center gap-1 bg-[#f4f8f1] p-1 rounded-xl border border-[#e0ebd7]">
                <button
                  @click="activeRange = '7d'"
                  :class="activeRange === '7d' ? 'bg-white text-[#2b451b] font-semibold shadow-2xs' : 'text-slate-500 hover:text-slate-800'"
                  class="px-2.5 py-1 text-xs rounded-lg transition-all"
                >
                  7d
                </button>
                <button
                  @click="activeRange = '30d'"
                  :class="activeRange === '30d' ? 'bg-white text-[#2b451b] font-semibold shadow-2xs' : 'text-slate-500 hover:text-slate-800'"
                  class="px-2.5 py-1 text-xs rounded-lg transition-all"
                >
                  30d
                </button>
              </div>
            </div>
          </div>

          <!-- Stylized Modern Bar Chart with Vertical Pill Tracks & Tooltip -->
          <div class="mt-8 relative">
            <!-- Floating Sample Tooltip (Wed highlight, matching reference image) -->
            <div class="absolute left-[54%] -top-12 -translate-x-1/2 z-10 hidden sm:block">
              <div class="bg-white/95 backdrop-blur-xs border border-[#cfe2c2] shadow-lg rounded-xl px-3 py-2 text-[11px] space-y-0.5">
                <div class="font-medium text-slate-400 text-[10px]">Wed, 7 Sep 2026</div>
                <div class="flex items-center justify-between gap-3">
                  <span class="text-slate-600">Delivered</span>
                  <span class="font-mono font-bold text-[#2b451b]">₱245k</span>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <span class="text-slate-600">Collections</span>
                  <span class="font-mono font-bold text-slate-900">₱493k</span>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <span class="text-slate-600">Expenses</span>
                  <span class="font-mono font-bold text-slate-500">₱98k</span>
                </div>
              </div>
              <div class="w-2 h-2 bg-white border-r border-b border-[#cfe2c2] rotate-45 mx-auto -mt-1 shadow-xs"></div>
            </div>

            <!-- Bar Chart Grid -->
            <div class="h-44 w-full flex items-end justify-between gap-2 sm:gap-4 pt-4 border-b border-slate-100">
              <div
                v-for="(day, idx) in chartData"
                :key="idx"
                class="flex-1 h-full flex flex-col items-center justify-end group cursor-pointer"
              >
                <!-- Background Translucent Pill Track (Reference Sample Style) -->
                <div class="w-full max-w-[42px] h-full bg-[#f6f9f3] rounded-2xl flex flex-col justify-end p-1 relative overflow-hidden group-hover:bg-[#eef5e9] transition-colors">
                  <!-- Stacked Bar: Expenses Base -->
                  <div
                    class="w-full bg-[#d6e5cc] rounded-b-xl transition-all"
                    :style="{ height: day.expenseHeight + '%' }"
                  ></div>
                  <!-- Stacked Bar: Green Delivered Height in #a8d08d -->
                  <div
                    class="w-full bg-[#a8d08d] rounded-t-xl transition-all group-hover:brightness-95"
                    :style="{ height: day.deliveredHeight + '%' }"
                  ></div>
                </div>
                <span class="text-[11px] font-medium text-slate-400 mt-2 font-mono group-hover:text-slate-700">
                  {{ day.label }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Vertical KPI Stack (As Requested by User & Referenced in Sample) -->
        <div class="w-full lg:w-60 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 flex flex-col justify-between py-1 space-y-6 shrink-0">
          <!-- KPI 1 -->
          <div>
            <div class="text-xs font-medium text-slate-400">Total Delivered Revenue</div>
            <div class="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-1">
              ₱{{ totalRevenue.toLocaleString() }}
            </div>
            <div class="text-[11px] text-[#558238] font-medium flex items-center gap-1 mt-1">
              <TrendingUp class="w-3.5 h-3.5" />
              <span>▲ 5.1% from last month</span>
            </div>
          </div>

          <!-- KPI 2 -->
          <div>
            <div class="text-xs font-medium text-slate-400">Total Business Expenses</div>
            <div class="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-1">
              ₱{{ expenseStore.totalExpenses.toLocaleString() }}
            </div>
            <div class="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
              <span>15.5% operational budget</span>
            </div>
          </div>

          <!-- KPI 3 -->
          <div>
            <div class="text-xs font-medium text-slate-400">Net Operating Profit</div>
            <div class="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-1">
              ₱{{ estimatedProfit.toLocaleString() }}
            </div>
            <div class="text-[11px] text-[#558238] font-medium flex items-center gap-1 mt-1">
              <TrendingUp class="w-3.5 h-3.5" />
              <span>▲ 20.7% financial health</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: #a8d08d Green Corporate Card & Quick Actions (Right 4 cols on xl) -->
      <div class="col-span-12 xl:col-span-4 bg-white border border-[#e2ebd8] rounded-2xl p-6 shadow-[0_2px_12px_-4px_rgba(43,69,27,0.04)] flex flex-col justify-between space-y-5">
        <!-- Top: Header & Action -->
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-semibold text-slate-900">Corporate Account</div>
            <div class="text-xs text-slate-400">Remittance & Quick Actions</div>
          </div>
          <button
            @click="assistantStore.openAssistant"
            class="text-xs font-medium text-[#446d29] hover:text-[#2b451b] flex items-center gap-1"
          >
            <span>+ Assistant</span>
          </button>
        </div>

        <!-- Realistic Green Debit Card in #a8d08d (1:1 Reference Sample Representation) -->
        <div class="w-full bg-[#a8d08d] text-[#1a330e] p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between h-44 select-none">
          <!-- Subtle decorative graphic overlay -->
          <div class="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-white/15 pointer-events-none"></div>
          <div class="absolute -right-6 -bottom-10 w-28 h-28 rounded-full bg-white/10 pointer-events-none"></div>

          <!-- Card Header -->
          <div class="flex items-center justify-between z-10">
            <span class="text-[11px] font-bold tracking-wider uppercase opacity-90">Corporate Remittance</span>
            <span class="font-mono font-bold text-xs tracking-wider">METROBANK</span>
          </div>

          <!-- Card Center Chip & Name -->
          <div class="z-10 flex items-center gap-3">
            <div class="w-9 h-7 rounded bg-[#8ab96d] border border-white/30 flex items-center justify-center shadow-2xs">
              <div class="w-5 h-4 border border-white/40 rounded-sm"></div>
            </div>
            <div>
              <div class="text-xs font-bold leading-tight">Rodil B. Vergara</div>
              <div class="text-[10px] opacity-80">Barili Branch • Cebu</div>
            </div>
          </div>

          <!-- Card Number & Expiry -->
          <div class="flex items-center justify-between z-10 font-mono text-xs font-bold">
            <span>•••• •••• 08244-1</span>
            <span class="text-[11px] opacity-80 font-normal">09/28</span>
          </div>
        </div>

        <!-- Quick Action Icon Buttons (Matching Reference Sample: Top up, Send, Request, History) -->
        <div class="grid grid-cols-4 gap-2 pt-1 text-center">
          <router-link
            to="/purchase-orders"
            class="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#f4f8f1] transition-colors group"
          >
            <div class="w-10 h-10 rounded-xl bg-[#f4f8f1] border border-[#dce9d3] flex items-center justify-center text-[#446d29] group-hover:bg-[#a8d08d] group-hover:text-[#1a330e] transition-all shadow-2xs">
              <Plus class="w-4 h-4" />
            </div>
            <span class="text-[11px] font-medium text-slate-600 group-hover:text-slate-900">New PO</span>
          </router-link>

          <router-link
            to="/deliveries"
            class="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#f4f8f1] transition-colors group"
          >
            <div class="w-10 h-10 rounded-xl bg-[#f4f8f1] border border-[#dce9d3] flex items-center justify-center text-[#446d29] group-hover:bg-[#a8d08d] group-hover:text-[#1a330e] transition-all shadow-2xs">
              <PackageCheck class="w-4 h-4" />
            </div>
            <span class="text-[11px] font-medium text-slate-600 group-hover:text-slate-900">Issue DR</span>
          </router-link>

          <router-link
            to="/expenses"
            class="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#f4f8f1] transition-colors group"
          >
            <div class="w-10 h-10 rounded-xl bg-[#f4f8f1] border border-[#dce9d3] flex items-center justify-center text-[#446d29] group-hover:bg-[#a8d08d] group-hover:text-[#1a330e] transition-all shadow-2xs">
              <CreditCard class="w-4 h-4" />
            </div>
            <span class="text-[11px] font-medium text-slate-600 group-hover:text-slate-900">Expense</span>
          </router-link>

          <button
            @click="assistantStore.openAssistant"
            class="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#f4f8f1] transition-colors group"
          >
            <div class="w-10 h-10 rounded-xl bg-[#f4f8f1] border border-[#dce9d3] flex items-center justify-center text-[#446d29] group-hover:bg-[#a8d08d] group-hover:text-[#1a330e] transition-all shadow-2xs">
              <Bot class="w-4 h-4" />
            </div>
            <span class="text-[11px] font-medium text-slate-600 group-hover:text-slate-900">Ask AI</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MIDDLE ROW: Fulfillment Progress (Spending Limit Style) + Operations Tip Card -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Fulfillment Progress (Like "Monthly spending limit" in sample) -->
      <div class="bg-white border border-[#e2ebd8] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <div class="text-sm font-semibold text-slate-900">Order Delivery & Fulfillment Volume</div>
            <router-link to="/purchase-orders" class="text-xs font-medium text-[#446d29] hover:underline">
              View POs
            </router-link>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">Active commitment across all customer projects</p>
        </div>

        <!-- Large Green Horizontal Progress Bar in #a8d08d -->
        <div class="my-5">
          <div class="h-3 w-full bg-[#f2f7ef] rounded-full overflow-hidden p-0.5 border border-[#e0ebd7]">
            <div
              class="h-full bg-[#a8d08d] rounded-full transition-all duration-500"
              :style="{ width: overallFulfillmentPercent + '%' }"
            ></div>
          </div>
          <div class="flex items-center justify-between text-xs mt-2 font-mono">
            <span class="font-bold text-slate-900">₱{{ totalRevenue.toLocaleString() }} delivered</span>
            <span class="text-slate-400">₱{{ totalCommittedValue.toLocaleString() }} committed</span>
          </div>
        </div>
      </div>

      <!-- Quick Operations Advisory (Like "Optimize your budget with these quick tips" in sample) -->
      <div class="bg-white border border-[#e2ebd8] rounded-2xl p-6 shadow-xs flex items-center justify-between gap-4">
        <div>
          <div class="text-sm font-semibold text-slate-900">Fleet Fuel & Trip Auto-Reconciliation</div>
          <p class="text-xs text-slate-600 mt-1.5 leading-relaxed max-w-md">
            Trip fuel and tolls are automatically synced to Central Expenses. Delivery Receipts and 30-day Statements of Account remain 100% matched for the Barili warehouse.
          </p>
          <router-link
            to="/delivery-trips"
            class="inline-flex items-center gap-1 text-xs font-semibold text-[#446d29] hover:text-[#2b451b] mt-3"
          >
            <span>View Trip Manifests</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
        </div>

        <!-- Staggered Green Accent Blocks matching reference sample graphic -->
        <div class="hidden sm:grid grid-cols-3 gap-1.5 p-3 rounded-2xl bg-[#f4f8f1] border border-[#e0ebd7] shrink-0">
          <div class="w-4 h-4 rounded bg-[#a8d08d]"></div>
          <div class="w-4 h-4 rounded bg-[#8ab96d]"></div>
          <div class="w-4 h-4 rounded bg-[#558238]"></div>
          <div class="w-4 h-4 rounded bg-[#c5dfb0]"></div>
          <div class="w-4 h-4 rounded bg-[#a8d08d]"></div>
          <div class="w-4 h-4 rounded bg-[#8ab96d]"></div>
        </div>
      </div>
    </div>

    <!-- BOTTOM ROW: 4 Analytical Cards (Cost Analysis, Financial Health Gauge, Goals, Transactions) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <!-- 1. Cost Analysis (Reference Sample Style) -->
      <div class="bg-white border border-[#e2ebd8] rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-400">Cost analysis</span>
            <span class="text-[11px] text-[#446d29] font-medium bg-[#f4f8f1] px-2 py-0.5 rounded-md">Sept 2026</span>
          </div>
          <div class="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-1">
            ₱{{ expenseStore.totalExpenses.toLocaleString() }}
          </div>

          <!-- Segmented Green Bar -->
          <div class="flex gap-1 h-2 w-full my-3 rounded-full overflow-hidden">
            <div class="bg-[#558238]" style="width: 45%"></div>
            <div class="bg-[#7ea75e]" style="width: 29%"></div>
            <div class="bg-[#a8d08d]" style="width: 14%"></div>
            <div class="bg-[#d2e7c4]" style="width: 12%"></div>
          </div>
        </div>

        <div class="space-y-1.5 text-xs">
          <div
            v-for="cat in expenseStore.categoryBreakdown"
            :key="cat.category"
            class="flex items-center justify-between text-slate-600"
          >
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-xs bg-[#a8d08d]"></span>
              {{ cat.category }}
            </span>
            <span class="font-mono font-medium text-slate-900">{{ cat.percent }}%</span>
          </div>
        </div>
      </div>

      <!-- 2. Financial Health (Semi-Circle Arc Gauge matching Reference Sample) -->
      <div class="bg-white border border-[#e2ebd8] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-400">Financial health</span>
            <span class="text-[11px] text-[#446d29] font-medium bg-[#f4f8f1] px-2 py-0.5 rounded-md">A/R Status</span>
          </div>
          <div class="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-1">
            ₱{{ billingStore.totalCollections.toLocaleString() }}
          </div>
          <div class="text-[11px] text-[#558238] font-medium flex items-center gap-1 mt-0.5">
            <CheckCircle2 class="w-3 h-3" />
            <span>100% current on receivables</span>
          </div>
        </div>

        <!-- Semi-Circle Arc SVG Gauge in #a8d08d -->
        <div class="relative flex flex-col items-center my-2">
          <svg class="w-36 h-20" viewBox="0 0 100 55">
            <!-- Background Arc -->
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#f0f6ec"
              stroke-width="12"
              stroke-linecap="round"
            />
            <!-- Value Arc in #a8d08d -->
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#a8d08d"
              stroke-width="12"
              stroke-linecap="round"
              stroke-dasharray="126"
              stroke-dashoffset="0"
            />
          </svg>
          <div class="text-center -mt-6">
            <div class="text-lg font-bold font-mono text-slate-900">100%</div>
            <div class="text-[10px] text-slate-400">Collections Rate</div>
          </div>
        </div>

        <p class="text-[11px] text-slate-400 text-center">
          Zero overdue invoices across all commercial contractors
        </p>
      </div>

      <!-- 3. Active PO Commitments (Goal Tracker Style in Reference Sample) -->
      <div class="bg-white border border-[#e2ebd8] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-400">Project PO Commitments</span>
            <router-link to="/purchase-orders" class="text-[11px] text-[#446d29] font-semibold hover:underline">
              + Add PO
            </router-link>
          </div>
          <div class="text-xs font-medium text-slate-900 mt-1">Contractor Progress</div>
        </div>

        <div class="space-y-4 my-2">
          <div
            v-for="po in salesStore.enrichedPurchaseOrders"
            :key="po.id"
            class="space-y-1.5"
          >
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium text-slate-800 truncate max-w-[130px]">{{ po.customerName }}</span>
              <span class="font-mono text-[11px] text-slate-500">{{ po.totalDelivered }}/{{ po.totalOrdered }} units</span>
            </div>
            <div class="h-2 w-full bg-[#f4f8f1] rounded-full overflow-hidden">
              <div
                class="h-full bg-[#a8d08d] rounded-full transition-all"
                :style="{ width: po.fulfillmentPercent + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <router-link
          to="/purchase-orders"
          class="text-[11px] text-[#446d29] font-medium flex items-center justify-between hover:underline pt-2 border-t border-slate-100"
        >
          <span>Batch Fulfillment</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </router-link>
      </div>

      <!-- 4. Recent Deliveries (Transaction History Style in Reference Sample) -->
      <div class="bg-white border border-[#e2ebd8] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-400">Delivery Receipts</span>
            <router-link to="/deliveries" class="text-[11px] text-[#446d29] font-semibold hover:underline">
              View All
            </router-link>
          </div>
          <div class="text-xs font-medium text-slate-900 mt-1">Recent Shipments</div>
        </div>

        <div class="space-y-3 my-2 text-xs">
          <div
            v-for="dr in deliveryStore.recentDeliveries.slice(0, 3)"
            :key="dr.id"
            class="flex items-center justify-between gap-2"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-xl bg-[#f4f8f1] border border-[#dce9d3] flex items-center justify-center font-bold font-mono text-[11px] text-[#2b451b] shrink-0">
                DR
              </div>
              <div class="min-w-0">
                <div class="font-medium text-slate-900 truncate">{{ dr.customerName }}</div>
                <div class="text-[10px] text-slate-400 font-mono">{{ dr.drNumber }} • {{ dr.date }}</div>
              </div>
            </div>
            <div class="text-right shrink-0">
              <div class="font-mono font-semibold text-slate-900">
                {{ dr.isReplacement ? '₱0' : '₱' + (dr.subtotal / 1000).toFixed(0) + 'k' }}
              </div>
              <div class="text-[10px] text-[#558238] font-medium">Completed</div>
            </div>
          </div>
        </div>

        <router-link
          to="/deliveries"
          class="text-[11px] text-[#446d29] font-medium flex items-center justify-between hover:underline pt-2 border-t border-slate-100"
        >
          <span>Commercial DR Docs</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  CreditCard,
  Banknote,
  ArrowRight,
  PackageCheck,
  Plus,
  Bot
} from 'lucide-vue-next'

import { useSalesStore } from '@/stores/salesStore'
import { useDeliveryStore } from '@/stores/deliveryStore'
import { useBillingStore } from '@/stores/billingStore'
import { useExpenseStore } from '@/stores/expenseStore'
import { useAssistantStore } from '@/stores/assistantStore'

const salesStore = useSalesStore()
const deliveryStore = useDeliveryStore()
const billingStore = useBillingStore()
const expenseStore = useExpenseStore()
const assistantStore = useAssistantStore()

const activeRange = ref('7d')

const totalRevenue = computed(() => {
  return deliveryStore.deliveryReceipts.reduce((acc, dr) => acc + dr.subtotal, 0)
})

const estimatedProfit = computed(() => {
  return totalRevenue.value - expenseStore.totalExpenses
})

const totalCommittedValue = computed(() => {
  return salesStore.purchaseOrders.reduce((acc, po) => acc + po.totalAmount, 0)
})

const overallFulfillmentPercent = computed(() => {
  if (totalCommittedValue.value === 0) return 0
  return Math.round((totalRevenue.value / totalCommittedValue.value) * 100)
})

// Stylized bar chart data mirroring the sample reference image
const chartData = [
  { label: 'Sun', expenseHeight: 20, deliveredHeight: 35 },
  { label: 'Mon', expenseHeight: 30, deliveredHeight: 45 },
  { label: 'Tue', expenseHeight: 25, deliveredHeight: 40 },
  { label: 'Wed', expenseHeight: 38, deliveredHeight: 75 }, // Highlighted Wednesday matching sample
  { label: 'Thu', expenseHeight: 18, deliveredHeight: 30 },
  { label: 'Fri', expenseHeight: 22, deliveredHeight: 50 },
  { label: 'Sat', expenseHeight: 15, deliveredHeight: 25 },
]
</script>

