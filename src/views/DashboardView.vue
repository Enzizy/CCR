<template>
  <div class="space-y-6">
    <!-- Header -->
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="page-title">Business Overview</h1>
        <p class="mt-0.5 text-xs text-slate-500">Activity and financial position through {{ activityThroughLabel }}</p>
      </div>
      <router-link
        to="/financial-summary"
        class="inline-flex items-center gap-1.5 self-start px-3.5 py-2 text-xs font-medium text-brand-900 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200/70 shadow-xs transition-colors sm:self-auto"
      >
        <span>Monthly Financials</span>
        <ArrowRight class="h-3.5 w-3.5" />
      </router-link>
    </header>

    <!-- 5 Core KPI Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <!-- Delivered Revenue -->
      <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Delivered Sales</span>
          <span class="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Truck class="w-4 h-4" />
          </span>
        </div>
        <div class="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900">
          {{ formatCurrency(totalRevenue) }}
        </div>
        <p class="text-[11px] text-slate-400 mt-1">All delivered goods</p>
      </div>

      <!-- Collections -->
      <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Collections</span>
          <span class="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <ArrowDownLeft class="w-4 h-4" />
          </span>
        </div>
        <div class="mt-2 text-2xl font-bold font-mono tracking-tight text-emerald-600">
          {{ formatCurrency(billingStore.totalCollections) }}
        </div>
        <p class="text-[11px] text-slate-400 mt-1">All payments received · {{ collectionRate }}% of delivered sales</p>
      </div>

      <!-- Accounts Receivable -->
      <div
        class="bg-white p-5 rounded-xl border shadow-xs"
        :class="billingStore.totalReceivables > 0 ? 'border-amber-200/80 bg-amber-50/10' : 'border-slate-200/80'"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Receivables (A/R)</span>
          <span
            class="p-1.5 rounded-lg"
            :class="billingStore.totalReceivables > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'"
          >
            <Clock3 class="w-4 h-4" />
          </span>
        </div>
        <div
          class="mt-2 text-2xl font-bold font-mono tracking-tight"
          :class="billingStore.totalReceivables > 0 ? 'text-amber-800' : 'text-slate-900'"
        >
          {{ formatCurrency(billingStore.totalReceivables) }}
        </div>
        <p class="text-[11px] text-slate-400 mt-1">All unpaid customer balances</p>
      </div>

      <!-- Business Expenses -->
      <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-500">Expenses</span>
          <span class="p-1.5 rounded-lg bg-rose-50 text-rose-600">
            <ArrowUpRight class="w-4 h-4" />
          </span>
        </div>
        <div class="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900">
          {{ formatCurrency(expenseStore.totalExpenses) }}
        </div>
        <p class="text-[11px] text-slate-400 mt-1">All recorded business expenses</p>
      </div>

      <!-- Estimated Operating Net -->
      <div
        class="bg-white p-5 rounded-xl border shadow-xs"
        :class="estimatedProfit >= 0 ? 'border-brand-200/80 bg-brand-50/20' : 'border-rose-200/80 bg-rose-50/20'"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium" :class="estimatedProfit >= 0 ? 'text-brand-900' : 'text-rose-900'">Sales Less Expenses</span>
          <span
            class="p-1.5 rounded-lg"
            :class="estimatedProfit >= 0 ? 'bg-brand-100 text-brand-700' : 'bg-rose-100 text-rose-700'"
          >
            <Wallet class="w-4 h-4" />
          </span>
        </div>
        <div
          class="mt-2 text-2xl font-bold font-mono tracking-tight"
          :class="estimatedProfit >= 0 ? 'text-brand-900' : 'text-rose-700'"
        >
          {{ formatCurrency(estimatedProfit) }}
        </div>
        <p class="text-[11px] text-slate-400 mt-1">Estimate only — not available cash</p>
      </div>
    </div>

    <!-- Quick Workflow Navigation -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <router-link
        to="/purchase-orders"
        class="flex items-center gap-3 p-3.5 bg-white border border-slate-200/80 rounded-xl hover:border-brand-400 hover:shadow-xs transition-all group"
      >
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 font-bold text-xs group-hover:bg-brand-600 group-hover:text-white transition-colors">1</span>
        <div class="min-w-0">
          <div class="text-xs font-semibold text-slate-900 group-hover:text-brand-800">1. Customer POs</div>
          <p class="text-[11px] text-slate-400 truncate">Record items customers ordered</p>
        </div>
      </router-link>

      <router-link
        to="/deliveries"
        class="flex items-center gap-3 p-3.5 bg-white border border-slate-200/80 rounded-xl hover:border-brand-400 hover:shadow-xs transition-all group"
      >
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 font-bold text-xs group-hover:bg-brand-600 group-hover:text-white transition-colors">2</span>
        <div class="min-w-0">
          <div class="text-xs font-semibold text-slate-900 group-hover:text-brand-800">2. Deliveries (DR & SOA)</div>
          <p class="text-[11px] text-slate-400 truncate">Track deliveries and dispatch</p>
        </div>
      </router-link>

      <router-link
        to="/statements-of-account"
        class="flex items-center gap-3 p-3.5 bg-white border border-slate-200/80 rounded-xl hover:border-brand-400 hover:shadow-xs transition-all group"
      >
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 font-bold text-xs group-hover:bg-brand-600 group-hover:text-white transition-colors">3</span>
        <div class="min-w-0">
          <div class="text-xs font-semibold text-slate-900 group-hover:text-brand-800">3. Receive Payment</div>
          <p class="text-[11px] text-slate-400 truncate">Apply payments to client SOAs</p>
        </div>
      </router-link>
    </div>

    <!-- Active Orders & Attention Section -->
    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section class="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div>
            <h2 class="text-sm font-semibold text-slate-900">Customer POs to Deliver</h2>
            <p class="mt-0.5 text-[11px] text-slate-400">{{ openPurchaseOrders.length }} active POs · {{ totalRemainingUnits }} units remaining</p>
          </div>
          <router-link to="/purchase-orders" class="inline-flex items-center gap-1 text-xs font-semibold text-brand-800 hover:text-brand-950">
            All POs <ArrowRight class="h-3.5 w-3.5" />
          </router-link>
        </div>

        <div v-if="openPurchaseOrders.length" class="overflow-x-auto">
          <table class="data-table min-w-[760px]">
            <thead>
              <tr class="data-table-header">
                <th class="px-5 py-2.5">PO / Customer</th>
                <th class="px-4 py-2.5">Project</th>
                <th class="px-4 py-2.5 text-right">Ordered</th>
                <th class="px-4 py-2.5 text-right">Delivered</th>
                <th class="px-4 py-2.5 text-right">Remaining</th>
                <th class="w-40 px-5 py-2.5">Fulfillment</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr v-for="po in openPurchaseOrders" :key="po.id" class="hover:bg-brand-50/50">
                <td class="px-5 py-3.5">
                  <router-link :to="{ path: '/purchase-orders', query: { po: po.id } }" class="font-mono text-[11px] font-semibold text-brand-800 underline">{{ po.poNumber }}</router-link>
                  <div class="mt-1 font-medium text-slate-700">{{ po.customerName }}</div>
                </td>
                <td class="max-w-56 px-4 py-3.5 text-slate-500">{{ po.project }}</td>
                <td class="px-4 py-3.5 text-right tabular-nums">{{ po.totalOrdered }}</td>
                <td class="px-4 py-3.5 text-right font-semibold tabular-nums text-brand-800">{{ po.totalDelivered }}</td>
                <td class="px-4 py-3.5 text-right font-semibold tabular-nums text-amber-700">{{ po.totalRemaining }}</td>
                <td class="px-5 py-3.5">
                  <div class="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{{ po.status }}</span>
                    <span class="font-semibold tabular-nums text-slate-700">{{ po.fulfillmentPercent }}%</span>
                  </div>
                  <div class="mt-1.5 h-1.5 overflow-hidden bg-slate-100"><div class="h-full bg-brand-600" :style="{ width: po.fulfillmentPercent + '%' }"></div></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-else icon="po" :title="salesStore.purchaseOrders.length ? 'All customer orders delivered' : 'No customer POs yet'" action-label="View customer POs" action-to="/purchase-orders" />
      </section>

      <!-- Needs Attention Aside -->
      <aside class="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div>
            <h2 class="text-sm font-semibold text-slate-900">Needs Attention</h2>
            <p class="mt-0.5 text-[11px] text-slate-400">Items that require action</p>
          </div>
          <span
            v-if="hasAttentionItems"
            class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800"
          >
            Action Required
          </span>
          <span
            v-else
            class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700"
          >
            All Clear
          </span>
        </div>
        <div v-if="hasAttentionItems" class="divide-y divide-slate-100 text-xs">
          <AttentionRow v-if="overdueCount" to="/accounts-receivable" label="Overdue SOAs" :value="overdueCount" :description="`${formatCurrency(billingStore.agingSummary.overdue)} requires collection`" urgent><Clock3 class="h-4 w-4" /></AttentionRow>
          <AttentionRow v-if="dueSoonCount" to="/statements-of-account" label="Due within 7 days" :value="dueSoonCount" :description="`${formatCurrency(billingStore.agingSummary.dueSoon)} due soon`" urgent><CalendarClock class="h-4 w-4" /></AttentionRow>
          <AttentionRow v-if="totalRemainingUnits" to="/purchase-orders" label="Units to deliver" :value="totalRemainingUnits" :description="`Across ${openPurchaseOrders.length} active purchase orders`"><PackageOpen class="h-4 w-4" /></AttentionRow>
          <AttentionRow v-if="deliveryStore.openIssuesCount" to="/delivery-issues" label="Open delivery issues" :value="deliveryStore.openIssuesCount" description="Replacement or resolution required" urgent><ShieldAlert class="h-4 w-4" /></AttentionRow>
        </div>
        <div v-else class="flex flex-col items-center justify-center px-5 py-10 text-center">
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-2">
            <CheckCircle2 class="h-4 w-4" />
          </div>
          <p class="text-xs font-semibold text-slate-800">All clear</p>
          <p class="text-[11px] text-slate-400 mt-0.5">Nothing currently requires attention.</p>
        </div>
      </aside>
    </div>

    <!-- Outstanding Balances & Recent Deliveries -->
    <div class="grid gap-5 lg:grid-cols-2">
      <section class="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <SectionHeader title="Outstanding Customer Balances" link-label="View A/R" link-to="/accounts-receivable" />
        <template v-if="billingStore.customerReceivables.length">
          <div class="grid grid-cols-3 border-b border-slate-100 bg-slate-50/60 text-center">
            <div v-for="bucket in agingBuckets" :key="bucket.label" class="border-r border-slate-100 px-3 py-2.5 last:border-r-0">
              <div class="text-[10px] font-semibold uppercase tracking-wide" :class="bucket.labelClass">{{ bucket.label }}</div>
              <div class="mt-1 text-xs font-semibold tabular-nums font-mono" :class="bucket.valueClass">{{ formatCurrency(bucket.value) }}</div>
            </div>
          </div>
          <div class="divide-y divide-slate-100">
            <div v-for="customer in billingStore.customerReceivables" :key="customer.customerId" class="flex items-center justify-between gap-4 px-5 py-3.5">
              <div class="min-w-0"><p class="truncate text-xs font-semibold text-slate-900">{{ customer.customerName }}</p><p class="mt-1 text-[11px] text-slate-400">Collected {{ formatCurrency(customer.totalCollected) }} of {{ formatCurrency(customer.totalInvoiced) }}</p></div>
              <div class="text-right"><p class="text-sm font-semibold tabular-nums font-mono text-slate-950">{{ formatCurrency(customer.totalOutstanding) }}</p><p class="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">Balance owed</p></div>
            </div>
          </div>
        </template>
        <EmptyState v-else icon="soa" title="No statements of account yet" action-label="View statements" action-to="/statements-of-account" />
      </section>

      <section class="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <SectionHeader title="Recent Delivery Activity" link-label="All deliveries" link-to="/deliveries" />
        <div v-if="deliveryStore.recentDeliveries.length" class="divide-y divide-slate-100">
          <router-link v-for="dr in deliveryStore.recentDeliveries.slice(0, 4)" :key="dr.id" :to="'/deliveries/' + dr.id" class="flex items-center justify-between gap-4 px-5 py-3 hover:bg-brand-50/50">
            <div class="min-w-0">
              <div class="flex items-center gap-2"><span class="font-mono text-[11px] font-semibold text-slate-950">{{ dr.drNumber }}</span><span v-if="dr.isReplacement" class="border-l-2 border-amber-500 pl-2 text-[10px] font-semibold uppercase tracking-wide text-amber-700">Replacement</span></div>
              <p class="mt-1 truncate text-xs font-medium text-slate-700">{{ dr.customerName }}</p>
              <p class="mt-0.5 text-[11px] text-slate-400">{{ formatDate(dr.date) }} · {{ dr.items.length }} line {{ dr.items.length === 1 ? 'item' : 'items' }}</p>
            </div>
            <div class="shrink-0 text-right"><p class="text-sm font-semibold tabular-nums font-mono text-slate-950">{{ dr.isReplacement ? 'No charge' : formatCurrency(dr.subtotal) }}</p><p class="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">View DR</p></div>
          </router-link>
        </div>
        <EmptyState v-else icon="delivery" title="No deliveries recorded yet" action-label="Record a delivery" action-to="/deliveries" />
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  Clock3,
  FilePlus2,
  PackageCheck,
  PackageOpen,
  ReceiptText,
  ShieldAlert,
  Truck,
  Wallet,
  CheckCircle2
} from 'lucide-vue-next'
import { useSalesStore } from '@/stores/salesStore'
import { useDeliveryStore } from '@/stores/deliveryStore'
import { useBillingStore } from '@/stores/billingStore'
import { useExpenseStore } from '@/stores/expenseStore'

const salesStore = useSalesStore()
const deliveryStore = useDeliveryStore()
const billingStore = useBillingStore()
const expenseStore = useExpenseStore()

const totalRevenue = computed(() => deliveryStore.deliveryReceipts.filter(dr => !dr.isReplacement).reduce((total, dr) => total + Number(dr.subtotal || 0), 0))
const estimatedProfit = computed(() => totalRevenue.value - expenseStore.totalExpenses)
const collectionRate = computed(() => totalRevenue.value > 0 ? Math.min(100, Math.round((billingStore.totalCollections / totalRevenue.value) * 100)) : 0)
const openPurchaseOrders = computed(() => salesStore.enrichedPurchaseOrders.filter(po => po.totalRemaining > 0).sort((a, b) => b.totalRemaining - a.totalRemaining))
const totalRemainingUnits = computed(() => openPurchaseOrders.value.reduce((total, po) => total + po.totalRemaining, 0))
const dueSoonCount = computed(() => billingStore.enrichedStatements.filter(statement => statement.agingCategory === 'Due Soon').length)
const overdueCount = computed(() => billingStore.enrichedStatements.filter(statement => statement.agingCategory === 'Overdue').length)
const hasAttentionItems = computed(() => overdueCount.value > 0 || dueSoonCount.value > 0 || totalRemainingUnits.value > 0 || deliveryStore.openIssuesCount > 0)
const activityThroughLabel = computed(() => new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }))

const agingBuckets = computed(() => [
  { label: 'Current', value: billingStore.agingSummary.current, labelClass: 'text-slate-500', valueClass: 'text-slate-900' },
  { label: 'Due soon', value: billingStore.agingSummary.dueSoon, labelClass: 'text-amber-700', valueClass: 'text-amber-800' },
  { label: 'Overdue', value: billingStore.agingSummary.overdue, labelClass: 'text-rose-700', valueClass: 'text-rose-800' }
])

const EmptyState = defineComponent({
  props: { icon: String, title: String, actionLabel: String, actionTo: String },
  setup(props) {
    const icons = { po: FilePlus2, soa: ReceiptText, delivery: PackageCheck }
    return () => h('div', { class: 'flex min-h-40 flex-col items-center justify-center px-5 py-8 text-center' }, [
      h('div', { class: 'flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500' }, [h(icons[props.icon] || FilePlus2, { class: 'h-4 w-4' })]),
      h('p', { class: 'mt-2.5 text-xs font-medium text-slate-600' }, props.title),
      props.actionLabel && props.actionTo ? h(RouterLink, { to: props.actionTo, class: 'mt-1.5 text-xs font-semibold text-brand-800 hover:text-brand-950' }, () => props.actionLabel) : null
    ])
  }
})

const SectionHeader = defineComponent({
  props: { title: String, linkLabel: String, linkTo: String },
  setup(props) {
    return () => h('div', { class: 'flex items-center justify-between border-b border-slate-100 px-5 py-3.5' }, [
      h('h2', { class: 'text-sm font-semibold text-slate-900' }, props.title),
      h(RouterLink, { to: props.linkTo, class: 'inline-flex items-center gap-1 text-xs font-semibold text-brand-800 hover:text-brand-950' }, () => [props.linkLabel, h(ArrowRight, { class: 'h-3.5 w-3.5' })])
    ])
  }
})

const AttentionRow = defineComponent({
  props: { to: String, label: String, value: Number, description: String, urgent: Boolean },
  setup(props, { slots }) {
    return () => h(RouterLink, { to: props.to, class: 'flex items-center gap-3 px-5 py-3 hover:bg-slate-50/70 transition-colors' }, () => [
      h('span', { class: ['flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', props.urgent ? 'bg-amber-50 text-amber-700' : 'bg-brand-50 text-brand-800'] }, slots.default?.()),
      h('span', { class: 'min-w-0 flex-1' }, [
        h('span', { class: 'flex items-center justify-between gap-3 text-xs' }, [h('span', { class: 'font-semibold text-slate-800' }, props.label), h('span', { class: ['font-semibold tabular-nums font-mono', props.urgent ? 'text-amber-700' : 'text-brand-800'] }, props.value)]),
        h('span', { class: 'text-[11px] text-slate-400 block truncate' }, props.description)
      ])
    ])
  }
})

function formatCurrency(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}
</script>
