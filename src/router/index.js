import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue')
      },
      {
        path: 'purchase-orders',
        name: 'PurchaseOrders',
        component: () => import('@/views/sales/PurchaseOrdersView.vue')
      },
      {
        path: 'deliveries',
        name: 'Deliveries',
        component: () => import('@/views/deliveries/DeliveriesView.vue')
      },
      {
        path: 'deliveries/:id',
        name: 'DeliveryReceiptDetail',
        component: () => import('@/views/deliveries/DeliveryReceiptView.vue')
      },
      {
        path: 'delivery-trips',
        name: 'DeliveryTrips',
        component: () => import('@/views/deliveries/DeliveryTripsView.vue')
      },
      {
        path: 'delivery-issues',
        name: 'DeliveryIssues',
        component: () => import('@/views/deliveries/DeliveryIssuesView.vue')
      },
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('@/views/sales/CustomersView.vue')
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/sales/ProductsView.vue')
      },
      {
        path: 'statements-of-account',
        name: 'StatementsOfAccount',
        component: () => import('@/views/billing/StatementOfAccountsView.vue')
      },
      {
        path: 'payments',
        name: 'Payments',
        component: () => import('@/views/billing/PaymentsView.vue')
      },
      {
        path: 'accounts-receivable',
        name: 'AccountsReceivable',
        component: () => import('@/views/billing/AccountsReceivableView.vue')
      },
      {
        path: 'expenses',
        name: 'Expenses',
        component: () => import('@/views/expenses/ExpensesView.vue')
      },
      {
        path: 'employees',
        name: 'Employees',
        component: () => import('@/views/people/EmployeesView.vue')
      },
      {
        path: 'payroll-advances',
        name: 'PayrollAdvances',
        component: () => import('@/views/people/PayrollAdvancesView.vue')
      },
      {
        path: 'financial-summary',
        name: 'FinancialSummary',
        component: () => import('@/views/reports/FinancialSummaryView.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/SettingsView.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { public: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Authentication navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('ccr_token')
  const user = localStorage.getItem('ccr_user')
  const isAuthenticated = Boolean(token && user)

  if (!to.meta.public && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && isAuthenticated) {
    next({ path: '/' })
  } else {
    next()
  }
})

export default router

