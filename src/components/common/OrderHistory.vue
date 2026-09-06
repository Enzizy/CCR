<template>
  <div class="border-t border-slate-200">
    <dl class="grid grid-cols-2 md:grid-cols-4 bg-slate-50 text-xs">
      <div v-for="metric in metrics" :key="metric.label" class="px-6 py-3">
        <dt class="text-slate-500">{{ metric.label }}</dt>
        <dd class="mt-1 font-semibold tabular-nums text-slate-900">{{ money(metric.value) }}</dd>
      </div>
    </dl>
    <details class="px-6 py-3 text-xs" :open="expanded">
      <summary class="cursor-pointer font-semibold text-brand-800">Order history · {{ order.receipts.length }} DRs · {{ order.soas.length }} SOAs · {{ order.collections.length }} payments<span v-if="order.openIssues.length" class="ml-2 text-amber-700">· {{ order.openIssues.length }} pending replacements</span></summary>
      <p v-if="order.replacementQuantity" class="mt-3 text-slate-600">{{ order.replacementQuantity }} replacement units sent separately. PO delivered quantities and SOA charges exclude these replacements.</p>
      <p v-if="order.unbilled.length" class="mt-3 border-l-2 border-amber-500 pl-3 text-amber-800">{{ order.unbilled.length }} billable delivery receipt(s) have no linked SOA. Check these before collecting payment.</p>
      <div class="mt-4 grid gap-5 lg:grid-cols-2">
        <div>
          <h4 class="font-semibold text-slate-800 mb-2">Deliveries & replacements</h4>
          <p v-if="!order.receipts.length" class="text-slate-500">No deliveries recorded for this PO.</p>
          <router-link v-for="dr in order.receipts" :key="dr.id" :to="'/deliveries/' + dr.id" class="flex justify-between gap-3 border-t border-slate-100 py-2 hover:text-brand-800">
            <span><strong>{{ dr.drNumber }}</strong><span class="block text-slate-500 mt-1">{{ dr.date }}<template v-if="dr.isReplacement"> · Replaces {{ dr.originalDrNumber }}</template></span></span>
            <span class="text-right"><template v-if="dr.isReplacement">Replacement · no charge<span class="block text-slate-500 mt-1">No SOA</span></template><template v-else>{{ money(dr.subtotal) }}<span class="block text-slate-500 mt-1">{{ soaFor(dr) }}</span></template></span>
          </router-link>
          <router-link v-if="order.openIssues.length" to="/delivery-issues" class="block mt-2 text-amber-800 underline">Review damages awaiting replacement</router-link>
        </div>
        <div>
          <h4 class="font-semibold text-slate-800 mb-2">SOAs & payments</h4>
          <p v-if="!order.soas.length" class="text-slate-500">No SOAs issued for this PO.</p>
          <router-link v-for="soa in order.soas" :key="soa.id" :to="{ path: '/statements-of-account', query: { search: soa.soaNumber } }" class="flex justify-between gap-3 border-t border-slate-100 py-2 hover:text-brand-800">
            <span><strong>{{ soa.soaNumber }}</strong><span class="block text-slate-500 mt-1">Due {{ soa.dueDate }} · {{ soa.status }}</span></span>
            <span class="text-right">{{ money(soa.balance) }} unpaid<span class="block text-slate-500 mt-1">{{ money(soa.paidAmount) }} paid</span></span>
          </router-link>
          <div v-for="payment in order.collections" :key="payment.id" class="flex justify-between gap-3 border-t border-slate-100 py-2">
            <span>{{ payment.date }} · {{ payment.soaNumber }}<span class="block text-slate-500 mt-1">{{ payment.paymentMethod }} · {{ payment.referenceNumber || payment.paymentNumber }}</span></span>
            <span class="text-brand-800">{{ money(payment.amount) }} received</span>
          </div>
        </div>
      </div>
    </details>
  </div>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ order: { type: Object, required: true }, expanded: Boolean })
const metrics = computed(() => [
  { label: 'Value still to deliver', value: props.order.remainingValue },
  { label: 'Billed through SOAs', value: props.order.billed },
  { label: 'Payments applied', value: props.order.paid },
  { label: 'Unpaid SOA balance', value: props.order.balance },
])
const money = value => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0))
const soaFor = dr => props.order.soas.filter(soa => (soa.drNumbers || []).includes(dr.drNumber)).map(soa => soa.soaNumber).join(', ') || 'No linked SOA'
</script>
