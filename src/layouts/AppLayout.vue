<template>
  <div class="h-screen w-full bg-[#f8fafc] flex flex-col md:flex-row overflow-hidden antialiased font-sans">
    <!-- Mobile Header -->
    <div class="md:hidden bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between z-30">
      <div class="flex items-center gap-2">
        <img :src="ccrLogo" alt="CCR logo" class="w-7 h-7 object-contain" />
        <span class="font-bold text-slate-900 text-xs tracking-wide uppercase">{{ settingsStore.company.name }}</span>
      </div>
      <button @click="mobileNavOpen = !mobileNavOpen" class="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200">
        <Menu class="w-5 h-5" />
      </button>
    </div>

    <!-- Sidebar Backdrop for Mobile -->
    <div
      v-if="mobileNavOpen"
      @click="mobileNavOpen = false"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
    ></div>

    <!-- Sidebar -->
    <aside
      class="no-print fixed inset-y-0 left-0 z-40 w-64 bg-white text-slate-700 flex flex-col border-r border-slate-200/80 shrink-0 select-none overflow-hidden transition-transform duration-200 md:static md:translate-x-0"
      :class="mobileNavOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Brand Header -->
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
        <div class="flex items-center gap-2.5">
          <img :src="ccrLogo" alt="CCR Construction Supply logo" class="w-9 h-9 shrink-0 object-contain" />
          <div class="min-w-0">
            <h1 class="text-xs font-bold text-slate-900 tracking-wide uppercase truncate">{{ settingsStore.company.name }}</h1>
            <p class="text-[11px] text-slate-400 font-normal truncate">{{ settingsStore.company.address }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-3 py-4 space-y-5 overflow-y-auto no-scrollbar text-xs">
        <div v-for="group in navigation" :key="group.label">
          <div class="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {{ group.label }}
          </div>
          <div class="space-y-0.5">
            <router-link
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              @click="mobileNavOpen = false"
              class="flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
              :class="navActive(item) ? 'bg-brand-50 text-brand-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'"
            >
              <div class="flex items-center gap-2.5">
                <component :is="item.icon" class="w-4 h-4" :class="navActive(item) ? 'text-brand-700' : 'text-slate-400'" />
                <span>{{ item.label }}</span>
              </div>
            </router-link>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 h-full flex flex-col min-w-0 overflow-hidden bg-[#f8fafc]">
      <!-- Top Bar -->
      <header class="no-print bg-white border-b border-slate-200/80 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] z-20">
        <!-- Global Search Bar -->
        <div class="relative max-w-md w-full">
          <div class="relative">
            <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="searchQuery"
              @focus="isSearchOpen = true"
              type="text"
              placeholder="Search PO #, DR #, SOA #, Customer..."
              class="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''; isSearchOpen = false"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Search Results Dropdown -->
          <div
            v-if="isSearchOpen && searchQuery.trim()"
            class="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden text-xs"
          >
            <div class="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Search Results ({{ searchResults.length }})
            </div>
            <div v-if="searchResults.length === 0" class="p-4 text-center text-slate-400">
              No records found matching "{{ searchQuery }}"
            </div>
            <div v-else class="max-h-72 overflow-y-auto divide-y divide-slate-100">
              <button
                v-for="(item, idx) in searchResults"
                :key="idx"
                @click="navigateTo(item.link)"
                class="w-full text-left px-3.5 py-2 hover:bg-brand-50/60 flex items-center justify-between transition-colors group"
              >
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span
                      class="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono uppercase tracking-wider"
                      :class="{
                        'bg-blue-50 text-blue-800 border border-blue-200/70': item.type === 'PO',
                        'bg-emerald-50 text-emerald-800 border border-emerald-200/70': item.type === 'DR',
                        'bg-amber-50 text-amber-800 border border-amber-200/70': item.type === 'SOA',
                        'bg-purple-50 text-purple-800 border border-purple-200/70': item.type === 'CUSTOMER'
                      }"
                    >
                      {{ item.type }}
                    </span>
                    <span class="font-semibold text-slate-900 group-hover:text-brand-900">{{ item.title }}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 truncate mt-0.5">{{ item.subtitle }}</div>
                </div>
                <ArrowRight class="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-700 shrink-0 ml-2" />
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side Actions -->
          <div class="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            class="hidden items-center gap-1.5 rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-brand-800 sm:flex"
            @click="aiOpen = true"
          >
            <Sparkles class="h-3.5 w-3.5" />
            Ask Assistant
          </button>
          <!-- Quick Action Dropdown -->
          <div class="relative">
            <button
              @click="isQuickActionOpen = !isQuickActionOpen"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
            >
              <Plus class="w-3.5 h-3.5 text-brand-700" />
              <span>Go to</span>
              <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="isQuickActionOpen"
              class="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 text-xs"
            >
              <div class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Record Activity</div>
              <button
                @click="triggerQuickAction('/purchase-orders')"
                class="w-full text-left px-3.5 py-2 hover:bg-brand-50 flex items-center gap-2.5 text-slate-700 hover:text-brand-900"
              >
                <FileText class="w-4 h-4 text-brand-700" />
                <span>Record Customer PO</span>
              </button>
              <button
                @click="triggerQuickAction('/deliveries')"
                class="w-full text-left px-3.5 py-2 hover:bg-brand-50 flex items-center gap-2.5 text-slate-700 hover:text-brand-900"
              >
                <PackageCheck class="w-4 h-4 text-brand-700" />
                <span>New Delivery Receipt</span>
              </button>
              <button
                @click="triggerQuickAction('/expenses')"
                class="w-full text-left px-3.5 py-2 hover:bg-brand-50 flex items-center gap-2.5 text-slate-700 hover:text-brand-900"
              >
                <DollarSign class="w-4 h-4 text-brand-700" />
                <span>Log Business Expense</span>
              </button>
              <button
                @click="triggerQuickAction('/payments')"
                class="w-full text-left px-3.5 py-2 hover:bg-brand-50 flex items-center gap-2.5 text-slate-700 hover:text-brand-900"
              >
                <CreditCard class="w-4 h-4 text-brand-700" />
                <span>Record Customer Payment</span>
              </button>
              <button
                @click="triggerQuickAction('/payroll-advances')"
                class="w-full text-left px-3.5 py-2 hover:bg-brand-50 flex items-center gap-2.5 text-slate-700 hover:text-brand-900"
              >
                <Banknote class="w-4 h-4 text-brand-700" />
                <span>Issue Cash Advance (Vale)</span>
              </button>
            </div>
          </div>

          <!-- User Profile & Logout -->
          <div class="relative">
            <button
              @click="isUserMenuOpen = !isUserMenuOpen"
              class="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
            >
              <div class="w-6 h-6 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-[10px]">
                {{ userAvatarLetter }}
              </div>
              <div class="text-left hidden sm:block">
                <div class="text-xs font-semibold text-slate-800 leading-tight">
                  {{ userDisplayName }}
                </div>
                <div class="text-[10px] text-slate-400 font-mono leading-none mt-0.5">
                  {{ authStore.user?.role || 'ADMIN' }}
                </div>
              </div>
              <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
            </button>

            <!-- User Dropdown Menu -->
            <div
              v-if="isUserMenuOpen"
              class="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 text-xs"
            >
              <div class="px-3 py-2 border-b border-slate-100">
                <p class="font-semibold text-slate-900">{{ userDisplayName }}</p>
                <p class="text-[11px] text-slate-400">{{ userEmail }}</p>
              </div>
              <button
                @click="handleLogout"
                class="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition-colors"
              >
                <LogOut class="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Page View Container (Independently Scrollable) -->
      <main ref="mainContent" class="flex-1 min-h-0 p-6 md:p-8 overflow-y-auto" @click="isSearchOpen = false; isQuickActionOpen = false; isUserMenuOpen = false">
        <div class="max-w-7xl mx-auto w-full">
          <SectionTabs />
          <router-view />
        </div>
      </main>
      <BusinessAssistant v-model:open="aiOpen" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  FileText,
  PackageCheck,
  ReceiptText,
  DollarSign,
  TrendingUp,
  Building2,
  Layers,
  Sliders,
  ChevronDown,
  Plus,
  ArrowRight,
  LogOut,
  CreditCard,
  Banknote,
  Search,
  X,
  Menu,
  Sparkles
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import { useSalesStore } from '@/stores/salesStore'
import { useDeliveryStore } from '@/stores/deliveryStore'
import { useBillingStore } from '@/stores/billingStore'
import { useExpenseStore } from '@/stores/expenseStore'
import { useSettingsStore } from '@/stores/settingsStore'
import SectionTabs from '@/components/common/SectionTabs.vue'
import BusinessAssistant from '@/components/assistant/BusinessAssistant.vue'
import ccrLogo from '@/assets/ccr-logo.png'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const salesStore = useSalesStore()
const deliveryStore = useDeliveryStore()
const billingStore = useBillingStore()
const expenseStore = useExpenseStore()
const settingsStore = useSettingsStore()

const mainContent = ref(null)
watch(() => route.fullPath, async () => { await nextTick(); mainContent.value?.scrollTo({ top: 0 }) })
const mobileNavOpen = ref(false)
const aiOpen = ref(false)

const userDisplayName = computed(() => {
  const name = authStore.user?.fullName
  if (!name || name === 'Rodil B. Vergara' || name.toLowerCase().includes('rodil') || name === 'admin') {
    return 'CCR Admin'
  }
  return name
})

const userAvatarLetter = computed(() => {
  return userDisplayName.value.charAt(0) || 'C'
})

const userEmail = computed(() => {
  return authStore.user?.email || 'ccrconsupplies@gmail.com'
})

const navigation = [
  { label: 'Overview', items: [{ to: '/', label: 'Business Overview', icon: LayoutDashboard }] },
  { label: 'Customer Orders', items: [
    { to: '/purchase-orders', label: 'Customer POs', icon: FileText },
    { to: '/deliveries', label: 'Deliveries & Replacements', icon: PackageCheck, paths: ['/deliveries', '/delivery-issues', '/delivery-trips'] },
    { to: '/statements-of-account', label: 'SOAs & Payments', icon: ReceiptText, paths: ['/statements-of-account', '/payments', '/accounts-receivable'] },
  ] },
  { label: 'Business Spending', items: [
    { to: '/expenses', label: 'Expenses', icon: DollarSign },
    { to: '/payroll-advances', label: 'Salaries & Cash Advances', icon: Banknote, paths: ['/payroll-advances', '/employees'] },
  ] },
  { label: 'Reports', items: [{ to: '/financial-summary', label: 'Monthly Summary', icon: TrendingUp }] },
  { label: 'Business Records', items: [
    { to: '/customers', label: 'Customers', icon: Building2 },
    { to: '/products', label: 'Products', icon: Layers },
    { to: '/settings', label: 'Company & Settings', icon: Sliders },
  ] },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(path + '/')
}

const navActive = item => (item.paths || [item.to]).some(isActive)

const searchQuery = ref('')
const isSearchOpen = ref(false)
const isQuickActionOpen = ref(false)
const isUserMenuOpen = ref(false)

function triggerQuickAction(path) {
  isQuickActionOpen.value = false
  router.push(path)
}

function navigateTo(link) {
  isSearchOpen.value = false
  searchQuery.value = ''
  router.push(link)
}

async function handleLogout() {
  isUserMenuOpen.value = false
  await authStore.logout()
  router.push('/login')
}

const searchResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return []
  const results = []

  // Search POs
  salesStore.enrichedPurchaseOrders.forEach(po => {
    if (po.poNumber.toLowerCase().includes(query) || po.customerName.toLowerCase().includes(query) || (po.project && po.project.toLowerCase().includes(query))) {
      results.push({
        type: 'PO',
        title: po.poNumber,
        subtitle: `${po.customerName} · ${po.project || 'Standard Order'}`,
        link: `/purchase-orders?po=${po.id}`
      })
    }
  })

  // Search DRs
  deliveryStore.deliveryReceipts.forEach(dr => {
    if (dr.drNumber.toLowerCase().includes(query) || (dr.customerName && dr.customerName.toLowerCase().includes(query))) {
      results.push({
        type: 'DR',
        title: dr.drNumber,
        subtitle: `${dr.customerName} · ₱${Number(dr.subtotal || 0).toLocaleString()}`,
        link: `/deliveries/${dr.id}`
      })
    }
  })

  // Search SOAs
  billingStore.statements.forEach(soa => {
    if (soa.soaNumber.toLowerCase().includes(query) || (soa.customerName && soa.customerName.toLowerCase().includes(query))) {
      results.push({
        type: 'SOA',
        title: soa.soaNumber,
        subtitle: `${soa.customerName} · ₱${Number(soa.totalAmount || 0).toLocaleString()}`,
        link: `/statements-of-account`
      })
    }
  })

  // Search Customers
  salesStore.customers.forEach(c => {
    if (c.name.toLowerCase().includes(query) || (c.shortName && c.shortName.toLowerCase().includes(query))) {
      results.push({
        type: 'CUSTOMER',
        title: c.name,
        subtitle: c.address || 'Customer Profile',
        link: `/customers`
      })
    }
  })

  return results.slice(0, 10)
})
</script>
