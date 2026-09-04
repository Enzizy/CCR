<template>
  <div class="h-screen w-full bg-[#f8fafc] flex flex-col md:flex-row overflow-hidden antialiased font-sans">
    <!-- Sidebar -->
    <aside class="no-print w-full md:w-64 h-full bg-white text-slate-700 flex flex-col border-r border-slate-200/80 shrink-0 select-none overflow-hidden">
      <!-- Brand Header -->
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-brand-700 text-white flex items-center justify-center font-bold text-xs shadow-xs tracking-wider">
              CCR
            </div>
            <div>
              <h1 class="text-xs font-bold text-slate-900 tracking-wide uppercase">CCR Construction</h1>
              <p class="text-[11px] text-slate-400 font-normal">Poblacion, Barili, Cebu</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-3 py-4 space-y-6 overflow-y-auto no-scrollbar text-xs">
        <!-- Overview -->
        <div>
          <div class="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Overview</div>
          <router-link
            to="/"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
            :class="isActive('/') ? 'bg-brand-50 text-brand-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'"
          >
            <LayoutDashboard class="w-4 h-4" :class="isActive('/') ? 'text-brand-700' : 'text-slate-400'" />
            <span>Dashboard</span>
          </router-link>
        </div>

        <!-- Sales & Fulfillment -->
        <div>
          <div class="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Sales & Fulfillment</div>
          <div class="space-y-0.5">
            <router-link
              to="/purchase-orders"
              class="flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
              :class="isActive('/purchase-orders') ? 'bg-brand-50 text-brand-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'"
            >
              <div class="flex items-center gap-2.5">
                <FileText class="w-4 h-4" :class="isActive('/purchase-orders') ? 'text-brand-700' : 'text-slate-400'" />
                <span>Purchase Orders</span>
              </div>
              <span :class="isActive('/purchase-orders') ? 'bg-brand-100 text-brand-800 font-semibold' : 'bg-slate-100 text-slate-500 font-medium'" class="text-[11px] px-2 py-0.5 rounded-full font-mono">{{ salesStore.purchaseOrders.length }}</span>
            </router-link>

            <router-link
              to="/deliveries"
              class="flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
              :class="isActive('/deliveries') ? 'bg-brand-50 text-brand-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'"
            >
              <div class="flex items-center gap-2.5">
                <PackageCheck class="w-4 h-4" :class="isActive('/deliveries') ? 'text-brand-700' : 'text-slate-400'" />
                <span>Delivery Receipts (DR)</span>
              </div>
              <span :class="isActive('/deliveries') ? 'bg-brand-100 text-brand-800 font-semibold' : 'bg-slate-100 text-slate-500 font-medium'" class="text-[11px] px-2 py-0.5 rounded-full font-mono">{{ deliveryStore.deliveryReceipts.length }}</span>
            </router-link>

            <router-link
              to="/delivery-trips"
              class="flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
              :class="isActive('/delivery-trips') ? 'bg-brand-50 text-brand-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'"
            >
              <div class="flex items-center gap-2.5">
                <Truck class="w-4 h-4" :class="isActive('/delivery-trips') ? 'text-brand-700' : 'text-slate-400'" />
                <span>Delivery Trips</span>
              </div>
              <span :class="isActive('/delivery-trips') ? 'bg-brand-100 text-brand-800 font-semibold' : 'bg-slate-100 text-slate-500 font-medium'" class="text-[11px] px-2 py-0.5 rounded-full font-mono">{{ deliveryStore.deliveryTrips.length }}</span>
            </router-link>

            <router-link
              to="/delivery-issues"
              class="flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
              :class="isActive('/delivery-issues') ? 'bg-brand-50 text-brand-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'"
            >
              <div class="flex items-center gap-2.5">
                <AlertTriangle class="w-4 h-4 text-amber-500" />
                <span>Damages & Replacements</span>
              </div>
              <span v-if="deliveryStore.openIssuesCount > 0" class="text-[11px] bg-amber-50 text-amber-800 border border-amber-200/70 px-2 py-0.5 rounded-full font-mono font-medium">
                {{ deliveryStore.openIssuesCount }}
              </span>
            </router-link>

            <router-link
              to="/customers"
              class="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
              :class="isActive('/customers') ? 'bg-brand-50 text-brand-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'"
            >
              <Building2 class="w-4 h-4" :class="isActive('/customers') ? 'text-brand-700' : 'text-slate-400'" />
              <span>Customers</span>
            </router-link>

            <router-link
              to="/products"
              class="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
              :class="isActive('/products') ? 'bg-brand-50 text-brand-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'"
            >
              <Layers class="w-4 h-4" :class="isActive('/products') ? 'text-brand-700' : 'text-slate-400'" />
              <span>Products & Specs</span>
            </router-link>
          </div>
        </div>

        <!-- Billing & Receivables -->
        <div>
          <div class="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Billing & Finance</div>
          <div class="space-y-0.5">
            <router-link
              to="/statements-of-account"
              class="flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
              :class="isActive('/statements-of-account') ? 'bg-brand-50 text-brand-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'"
            >
              <div class="flex items-center gap-2.5">
                <ReceiptText class="w-4 h-4" :class="isActive('/statements-of-account') ? 'text-brand-700' : 'text-slate-400'" />
                <span>Statements (SOA)</span>
              </div>
              <span :class="isActive('/statements-of-account') ? 'bg-brand-100 text-brand-800 font-semibold' : 'bg-slate-100 text-slate-500 font-medium'" class="text-[11px] px-2 py-0.5 rounded-full font-mono">{{ billingStore.statements.length }}</span>
            </router-link>

            <router-link
              to="/payments"
              class="flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
              :class="isActive('/payments') ? 'bg-brand-50 text-brand-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'"
            >
              <div class="flex items-center gap-2.5">
                <CreditCard class="w-4 h-4" :class="isActive('/payments') ? 'text-brand-700' : 'text-slate-400'" />
                <span>Payments Received</span>
              </div>
              <span :class="isActive('/payments') ? 'bg-brand-100 text-brand-800 font-semibold' : 'bg-slate-100 text-slate-500 font-medium'" class="text-[11px] px-2 py-0.5 rounded-full font-mono">{{ billingStore.payments.length }}</span>
            </router-link>

            <router-link
              to="/accounts-receivable"
              class="flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
              :class="isActive('/accounts-receivable') ? 'bg-brand-50 text-brand-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'"
            >
              <div class="flex items-center gap-2.5">
                <Clock class="w-4 h-4" :class="isActive('/accounts-receivable') ? 'text-brand-700' : 'text-slate-400'" />
                <span>Accounts Receivable</span>
              </div>
              <span class="text-[11px] bg-brand-100 text-brand-800 font-medium font-mono px-2 py-0.5 rounded-full">
                ₱{{ (billingStore.totalReceivables / 1000).toFixed(0) }}k
              </span>
            </router-link>
          </div>
        </div>

        <!-- Operations & Staff -->
        <div>
          <div class="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Expenses & Staff</div>
          <div class="space-y-0.5">
            <router-link
              to="/expenses"
              class="flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
              :class="isActive('/expenses') ? 'bg-brand-50 text-brand-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'"
            >
              <div class="flex items-center gap-2.5">
                <DollarSign class="w-4 h-4" :class="isActive('/expenses') ? 'text-brand-700' : 'text-slate-400'" />
                <span>Central Expenses</span>
              </div>
              <span :class="isActive('/expenses') ? 'bg-brand-100 text-brand-800 font-semibold' : 'bg-slate-100 text-slate-500 font-medium'" class="text-[11px] px-2 py-0.5 rounded-full font-mono">
                {{ expenseStore.expenses.length }}
              </span>
            </router-link>

            <router-link
              to="/employees"
              class="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
              :class="isActive('/employees') ? 'bg-brand-50 text-brand-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'"
            >
              <Users class="w-4 h-4" :class="isActive('/employees') ? 'text-brand-700' : 'text-slate-400'" />
              <span>Employees & Workers</span>
            </router-link>

            <router-link
              to="/payroll-advances"
              class="flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
              :class="isActive('/payroll-advances') ? 'bg-brand-50 text-brand-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'"
            >
              <div class="flex items-center gap-2.5">
                <Banknote class="w-4 h-4" :class="isActive('/payroll-advances') ? 'text-brand-700' : 'text-slate-400'" />
                <span>Payroll & Advances</span>
              </div>
              <span v-if="employeeStore.totalOpenAdvances > 0" class="text-[11px] bg-brand-100 text-brand-800 font-medium px-2 py-0.5 rounded-full font-mono">
                ₱{{ employeeStore.totalOpenAdvances.toLocaleString() }}
              </span>
            </router-link>
          </div>
        </div>

        <!-- Reports & Settings -->
        <div>
          <div class="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Reports</div>
          <div class="space-y-0.5">
            <router-link
              to="/financial-summary"
              class="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
              :class="isActive('/financial-summary') ? 'bg-brand-50 text-brand-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'"
            >
              <TrendingUp class="w-4 h-4" :class="isActive('/financial-summary') ? 'text-brand-700' : 'text-slate-400'" />
              <span>Monthly Financials</span>
            </router-link>

            <router-link
              to="/settings"
              class="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
              :class="isActive('/settings') ? 'bg-brand-50 text-brand-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'"
            >
              <Sliders class="w-4 h-4" :class="isActive('/settings') ? 'text-brand-700' : 'text-slate-400'" />
              <span>Settings & Sequence</span>
            </router-link>
          </div>
        </div>
      </nav>

      <!-- Bottom Status -->
      <div class="p-3.5 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-brand-500"></span>
          <span class="font-medium text-slate-600">Fiscal: Sept 2026</span>
        </div>
        <button
          @click="assistantStore.openAssistant"
          class="flex items-center gap-1.5 text-brand-700 hover:text-brand-900 font-semibold px-2 py-1 rounded-md hover:bg-brand-50 transition-colors"
        >
          <Bot class="w-3.5 h-3.5" />
          <span>Ask AI</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 h-full flex flex-col min-w-0 overflow-hidden bg-[#f8fafc]">
      <!-- Top Bar -->
      <header class="no-print bg-white border-b border-slate-200/80 px-6 py-3 flex items-center justify-between shrink-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
        <div class="flex items-center gap-3">
          <h2 class="text-sm font-semibold text-slate-800 tracking-tight">{{ routeTitle }}</h2>
        </div>

        <div class="flex items-center gap-2.5">
          <!-- Quick Action Buttons -->
          <router-link
            to="/purchase-orders"
            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors shadow-xs"
          >
            <Plus class="w-3.5 h-3.5 text-brand-700" />
            <span>New PO</span>
          </router-link>

          <router-link
            to="/expenses"
            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors shadow-xs"
          >
            <Plus class="w-3.5 h-3.5 text-brand-700" />
            <span>Log Expense</span>
          </router-link>

          <button
            @click="assistantStore.openAssistant"
            class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-lg shadow-xs transition-all"
          >
            <Bot class="w-3.5 h-3.5 text-brand-300" />
            <span>AI Assistant</span>
          </button>
        </div>
      </header>

      <!-- Page View Container (Independently Scrollable) -->
      <main class="flex-1 min-h-0 p-6 md:p-8 overflow-y-auto">
        <div class="max-w-7xl mx-auto w-full">
          <router-view />
        </div>
      </main>
    </div>

    <!-- AI Assistant Floating Drawer -->
    <AssistantDrawer class="no-print" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  LayoutDashboard,
  FileText,
  PackageCheck,
  Truck,
  AlertTriangle,
  Building2,
  Layers,
  ReceiptText,
  CreditCard,
  Clock,
  DollarSign,
  Users,
  Banknote,
  TrendingUp,
  Sliders,
  Plus,
  Bot
} from 'lucide-vue-next'

import { useSalesStore } from '@/stores/salesStore'
import { useDeliveryStore } from '@/stores/deliveryStore'
import { useBillingStore } from '@/stores/billingStore'
import { useExpenseStore } from '@/stores/expenseStore'
import { useEmployeeStore } from '@/stores/employeeStore'
import { useAssistantStore } from '@/stores/assistantStore'
import AssistantDrawer from '@/components/assistant/AssistantDrawer.vue'

const route = useRoute()
const salesStore = useSalesStore()
const deliveryStore = useDeliveryStore()
const billingStore = useBillingStore()
const expenseStore = useExpenseStore()
const employeeStore = useEmployeeStore()
const assistantStore = useAssistantStore()

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const routeTitle = computed(() => {
  switch (route.path) {
    case '/': return 'Executive Dashboard'
    case '/purchase-orders': return 'Purchase Orders & Fulfillment'
    case '/deliveries': return 'Delivery Receipts (DR)'
    case '/delivery-trips': return 'Delivery Trips & Multi-drop Manifest'
    case '/delivery-issues': return 'Delivery Damages & Free Replacements'
    case '/customers': return 'Customer Directory'
    case '/products': return 'Products & Architectural Specifications'
    case '/statements-of-account': return 'Statements of Account (SOA)'
    case '/payments': return 'Payments Received & Official Receipts'
    case '/accounts-receivable': return 'Accounts Receivable Aging'
    case '/expenses': return 'Centralized Business Expenses'
    case '/employees': return 'Workers & Staff Directory'
    case '/payroll-advances': return 'Payroll & Cash Advances'
    case '/financial-summary': return 'Monthly Financial Performance'
    case '/settings': return 'System Settings & Document Sequence'
    default: return 'Business Management System'
  }
})
</script>

