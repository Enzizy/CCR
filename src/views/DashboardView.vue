<template>
  <div class="space-y-5">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">Business overview</p>
        <h1 class="mt-1 text-xl font-semibold tracking-tight text-slate-950">{{ currentMonthLabel }}</h1>
        <p class="mt-1 text-xs text-slate-500">Recorded activity through {{ activityThroughLabel }}</p>
      </div>
      <router-link to="/financial-summary" class="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-brand-800 hover:text-brand-950 sm:self-auto">
        View monthly financials
        <ArrowRight class="h-3.5 w-3.5" />
      </router-link>
    </header>

    <section class="overflow-hidden rounded-md border border-brand-700/40 bg-white">
      <div class="flex items-center justify-between border-b border-brand-700/40 bg-brand-400 px-5 py-3 text-brand-950">
        <div>
          <h2 class="text-sm font-bold uppercase tracking-wide">Financial position</h2>
          <p class="mt-0.5 text-[11px] text-brand-950/70">Calculated from delivery, payment, SOA, and expense records</p>
        </div>
      </div>

      <div class="grid divide-y divide-slate-200 lg:grid-cols-[1fr_240px] lg:divide-x lg:divide-y-0">
        <dl class="grid sm:grid-cols-2 xl:grid-cols-4">
          <div v-for="kpi in financialKpis" :key="kpi.label" class="border-b border-slate-200 px-5 py-4 sm:border-r xl:border-b-0 last:border-r-0">
            <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{{ kpi.label }}</dt>
            <dd class="mt-2 text-xl font-semibold tabular-nums tracking-tight text-slate-950">{{ formatCurrency(kpi.value) }}</dd>
            <p class="mt-1.5 text-[11px] leading-4 text-slate-500">{{ kpi.description }}</p>
          </div>
        </dl>

        <div class="bg-brand-50 px-5 py-4">
          <p class="text-[11px] font-bold uppercase tracking-wide text-brand-800">Estimated operating net</p>
          <p class="mt-2 text-2xl font-bold tabular-nums tracking-tight text-brand-950">{{ formatCurrency(estimatedProfit) }}</p>
          <p class="mt-1.5 text-[11px] leading-4 text-brand-900/70">Delivered revenue minus expenses. This is not the cash balance.</p>
          <div class="mt-3 border-t border-brand-200 pt-3">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-brand-900/70">Collection progress</span>
              <span class="font-semibold tabular-nums text-brand-950">{{ collectionRate }}%</span>
            </div>
            <div class="mt-1.5 h-1.5 overflow-hidden bg-brand-200" role="progressbar" aria-label="Collection progress" :aria-valuenow="collectionRate" aria-valuemin="0" aria-valuemax="100">
              <div class="h-full bg-brand-700" :style="{ width: collectionRate + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section class="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
          <div>
            <h2 class="text-sm font-semibold text-slate-950">Purchase orders requiring fulfillment</h2>
            <p class="mt-0.5 text-[11px] text-slate-500">{{ openPurchaseOrders.length }} active POs · {{ totalRemainingUnits }} units remaining</p>
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
                  <div class="font-mono text-[11px] font-semibold text-slate-950">{{ po.poNumber }}</div>
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
        <EmptyState v-else icon="po" title="No purchase orders yet" action-label="Create first purchase order" action-to="/purchase-orders" />
      </section>

      <aside class="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div class="border-b border-brand-700/40 bg-brand-400 px-5 py-3.5">
          <h2 class="text-sm font-bold uppercase tracking-wide text-brand-950">Needs attention</h2>
          <p class="mt-0.5 text-[11px] text-brand-950/70">Items that may require follow-up</p>
        </div>
        <div v-if="hasAttentionItems" class="divide-y divide-slate-100 text-xs">
          <AttentionRow v-if="overdueCount" to="/accounts-receivable" label="Overdue SOAs" :value="overdueCount" :description="`${formatCurrency(billingStore.agingSummary.overdue)} requires collection`" urgent><Clock3 class="h-4 w-4" /></AttentionRow>
          <AttentionRow v-if="dueSoonCount" to="/statements-of-account" label="Due within 7 days" :value="dueSoonCount" :description="`${formatCurrency(billingStore.agingSummary.dueSoon)} due soon`" urgent><CalendarClock class="h-4 w-4" /></AttentionRow>
          <AttentionRow v-if="totalRemainingUnits" to="/purchase-orders" label="Units to deliver" :value="totalRemainingUnits" :description="`Across ${openPurchaseOrders.length} active purchase orders`"><PackageOpen class="h-4 w-4" /></AttentionRow>
          <AttentionRow v-if="deliveryStore.openIssuesCount" to="/delivery-issues" label="Open delivery issues" :value="deliveryStore.openIssuesCount" description="Replacement or resolution required" urgent><ShieldAlert class="h-4 w-4" /></AttentionRow>
        </div>
        <p v-else class="px-5 py-8 text-center text-xs text-slate-500">Nothing currently requires attention.</p>
      </aside>
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
      <section class="overflow-hidden rounded-md border border-slate-200 bg-white">
        <SectionHeader title="Outstanding customer balances" link-label="A/R aging" link-to="/accounts-receivable" />
        <template v-if="billingStore.customerReceivables.length">
          <div class="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-center">
            <div v-for="bucket in agingBuckets" :key="bucket.label" class="border-r border-slate-200 px-3 py-2.5 last:border-r-0">
              <div class="text-[10px] font-semibold uppercase tracking-wide" :class="bucket.labelClass">{{ bucket.label }}</div>
              <div class="mt-1 text-xs font-semibold tabular-nums" :class="bucket.valueClass">{{ formatCurrency(bucket.value) }}</div>
            </div>
          </div>
          <div class="divide-y divide-slate-100">
            <div v-for="customer in billingStore.customerReceivables" :key="customer.customerId" class="flex items-center justify-between gap-4 px-5 py-3.5">
              <div class="min-w-0"><p class="truncate text-xs font-semibold text-slate-900">{{ customer.customerName }}</p><p class="mt-1 text-[11px] text-slate-500">Collected {{ formatCurrency(customer.totalCollected) }} of {{ formatCurrency(customer.totalInvoiced) }}</p></div>
              <div class="text-right"><p class="text-sm font-semibold tabular-nums text-slate-950">{{ formatCurrency(customer.totalOutstanding) }}</p><p class="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">Balance owed</p></div>
            </div>
          </div>
        </template>
        <EmptyState v-else icon="soa" title="No statements of account yet" action-label="View statements" action-to="/statements-of-account" />
      </section>

      <section class="overflow-hidden rounded-md border border-slate-200 bg-white">
        <SectionHeader title="Recent delivery activity" link-label="All deliveries" link-to="/deliveries" />
        <div v-if="deliveryStore.recentDeliveries.length" class="divide-y divide-slate-100">
          <router-link v-for="dr in deliveryStore.recentDeliveries.slice(0, 4)" :key="dr.id" :to="'/deliveries/' + dr.id" class="flex items-center justify-between gap-4 px-5 py-3 hover:bg-brand-50/50">
            <div class="min-w-0">
              <div class="flex items-center gap-2"><span class="font-mono text-[11px] font-semibold text-slate-950">{{ dr.drNumber }}</span><span v-if="dr.isReplacement" class="border-l-2 border-amber-500 pl-2 text-[10px] font-semibold uppercase tracking-wide text-amber-700">Replacement</span></div>
              <p class="mt-1 truncate text-xs font-medium text-slate-700">{{ dr.customerName }}</p>
              <p class="mt-0.5 text-[11px] text-slate-400">{{ formatDate(dr.date) }} · {{ dr.items.length }} line {{ dr.items.length === 1 ? 'item' : 'items' }}</p>
            </div>
            <div class="shrink-0 text-right"><p class="text-sm font-semibold tabular-nums text-slate-950">{{ dr.isReplacement ? 'No charge' : formatCurrency(dr.subtotal) }}</p><p class="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">View DR</p></div>
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
import { ArrowRight, CalendarClock, Clock3, FilePlus2, PackageCheck, PackageOpen, ReceiptText, ShieldAlert } from 'lucide-vue-next'
import { useSalesStore } from '@/stores/salesStore'
import { useDeliveryStore } from '@/stores/deliveryStore'
import { useBillingStore } from '@/stores/billingStore'
import { useExpenseStore } from '@/stores/expenseStore'

const salesStore = useSalesStore()
const deliveryStore = useDeliveryStore()
const billingStore = useBillingStore()
const expenseStore = useExpenseStore()

const totalRevenue = computed(() => deliveryStore.deliveryReceipts.reduce((total, dr) => total + dr.subtotal, 0))
const estimatedProfit = computed(() => totalRevenue.value - expenseStore.totalExpenses)
const collectionRate = computed(() => totalRevenue.value > 0 ? Math.min(100, Math.round((billingStore.totalCollections / totalRevenue.value) * 100)) : 0)
const openPurchaseOrders = computed(() => salesStore.enrichedPurchaseOrders.filter(po => po.totalRemaining > 0).sort((a, b) => b.totalRemaining - a.totalRemaining))
const totalRemainingUnits = computed(() => openPurchaseOrders.value.reduce((total, po) => total + po.totalRemaining, 0))
const dueSoonCount = computed(() => billingStore.enrichedStatements.filter(statement => statement.agingCategory === 'Due Soon').length)
const overdueCount = computed(() => billingStore.enrichedStatements.filter(statement => statement.agingCategory === 'Overdue').length)
const hasAttentionItems = computed(() => overdueCount.value > 0 || dueSoonCount.value > 0 || totalRemainingUnits.value > 0 || deliveryStore.openIssuesCount > 0)
const currentMonthLabel = computed(() => new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }))
const activityThroughLabel = computed(() => new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }))

const financialKpis = computed(() => [
  { label: 'Delivered revenue', value: totalRevenue.value, description: 'Total value of billable delivery receipts' },
  { label: 'Collections', value: billingStore.totalCollections, description: 'Payments received and recorded' },
  { label: 'Accounts receivable', value: billingStore.totalReceivables, description: 'Unpaid balance across all SOAs' },
  { label: 'Business expenses', value: expenseStore.totalExpenses, description: 'All recorded operating costs' }
])

const agingBuckets = computed(() => [
  { label: 'Current', value: billingStore.agingSummary.current, labelClass: 'text-slate-500', valueClass: 'text-slate-900' },
  { label: 'Due soon', value: billingStore.agingSummary.dueSoon, labelClass: 'text-amber-700', valueClass: 'text-amber-800' },
  { label: 'Overdue', value: billingStore.agingSummary.overdue, labelClass: 'text-rose-700', valueClass: 'text-rose-800' }
])

const EmptyState = defineComponent({
  props: { icon: String, title: String, actionLabel: String, actionTo: String },
  setup(props) {
    const icons = { po: FilePlus2, soa: ReceiptText, delivery: PackageCheck }
    return () => h('div', { class: 'flex min-h-44 flex-col items-center justify-center px-5 py-8 text-center' }, [
      h('div', { class: 'flex h-9 w-9 items-center justify-center bg-brand-100 text-brand-800' }, [h(icons[props.icon] || FilePlus2, { class: 'h-4 w-4' })]),
      h('p', { class: 'mt-3 text-xs font-semibold text-slate-800' }, props.title),
      h(RouterLink, { to: props.actionTo, class: 'mt-2 text-xs font-semibold text-brand-800 hover:text-brand-950' }, () => props.actionLabel)
    ])
  }
})

const SectionHeader = defineComponent({
  props: { title: String, linkLabel: String, linkTo: String },
  setup(props) {
    return () => h('div', { class: 'flex items-center justify-between border-b border-slate-200 px-5 py-3.5' }, [
      h('h2', { class: 'text-sm font-semibold text-slate-950' }, props.title),
      h(RouterLink, { to: props.linkTo, class: 'inline-flex items-center gap-1 text-xs font-semibold text-brand-800 hover:text-brand-950' }, () => [props.linkLabel, h(ArrowRight, { class: 'h-3.5 w-3.5' })])
    ])
  }
})

const AttentionRow = defineComponent({
  props: { to: String, label: String, value: Number, description: String, urgent: Boolean },
  setup(props, { slots }) {
    return () => h(RouterLink, { to: props.to, class: 'flex gap-3 px-5 py-3.5 hover:bg-brand-50/50' }, () => [
      h('span', { class: ['flex h-8 w-8 shrink-0 items-center justify-center', props.urgent ? 'bg-amber-50 text-amber-700' : 'bg-brand-100 text-brand-800'] }, slots.default?.()),
      h('span', { class: 'min-w-0 flex-1' }, [
        h('span', { class: 'flex items-center justify-between gap-3' }, [h('span', { class: 'font-semibold text-slate-900' }, props.label), h('span', { class: ['font-semibold tabular-nums', props.urgent ? 'text-amber-700' : 'text-brand-800'] }, props.value)]),
        h('span', { class: 'mt-0.5 block text-[11px] text-slate-500' }, props.description)
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
