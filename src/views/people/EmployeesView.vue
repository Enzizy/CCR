<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="page-title">Employees & Workers</h2>
      <button type="button" class="primary-button" @click="showAddModal = true">
        <Plus class="h-4 w-4" />
        Add Employee
      </button>
    </div>

    <div v-if="employeeStore.employees.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="employee in employeeStore.employees" :key="employee.id" class="section-card p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <h3 class="truncate text-sm font-semibold text-slate-950">{{ employee.name }}</h3>
            <p class="mt-0.5 text-xs text-slate-500">{{ employee.position }}</p>
          </div>
          <StatusBadge :status="employee.status" />
        </div>

        <dl class="mt-4 divide-y divide-slate-200 border-y border-slate-200 text-xs">
          <div class="flex items-center justify-between py-2.5">
            <dt class="text-slate-500">Pay arrangement</dt>
            <dd class="font-medium text-slate-800">{{ employee.payType }}</dd>
          </div>
          <div class="flex items-center justify-between py-2.5">
            <dt class="text-slate-500">Base compensation</dt>
            <dd class="font-mono font-semibold text-slate-900">{{ formatCurrency(employee.rate) }}/{{ payUnit(employee.payType) }}</dd>
          </div>
          <div class="flex items-center justify-between py-2.5">
            <dt class="text-slate-500">Open cash advance</dt>
            <dd class="font-mono font-semibold" :class="advanceBalance(employee.id) > 0 ? 'text-amber-700' : 'text-slate-400'">{{ formatCurrency(advanceBalance(employee.id)) }}</dd>
          </div>
        </dl>

        <div class="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>{{ employee.phone || 'No phone recorded' }}</span>
          <span>Since {{ formatDate(employee.startDate) }}</span>
        </div>
        <button type="button" class="mt-4 text-xs font-semibold text-brand-800 hover:text-brand-950" @click="openEditModal(employee)">Edit employee</button>
      </article>
    </div>

    <div v-else class="empty-state section-card">
      <Users class="h-5 w-5 text-brand-700" />
      <h3>No employees or workers yet</h3>
      <p>Add personnel before recording cash advances or payroll.</p>
      <button type="button" class="secondary-button mt-3" @click="showAddModal = true">Add first employee</button>
    </div>

    <Teleport to="body">
      <div v-if="showAddModal" class="modal-backdrop" role="presentation">
        <div class="modal-panel max-w-lg" role="dialog" aria-modal="true" aria-labelledby="add-employee-title">
          <div class="modal-header">
            <h3 id="add-employee-title">{{ editingEmployeeId ? 'Edit Employee' : 'Add Employee' }}</h3>
            <button type="button" class="icon-button" aria-label="Close" @click="closeModal"><X class="h-4 w-4" /></button>
          </div>

          <form class="space-y-4 p-6 text-xs" @submit.prevent="handleAddEmployee">
            <p v-if="saveError" role="alert" class="rounded-md bg-rose-50 px-3 py-2 text-rose-700">{{ saveError }}</p>
            <div>
              <label class="form-label" for="employee-name">Full name *</label>
              <input id="employee-name" v-model.trim="newEmployee.name" class="form-control" required autocomplete="name">
            </div>

            <div>
              <label class="form-label" for="employee-position">Position or role *</label>
              <input id="employee-position" v-model.trim="newEmployee.position" class="form-control" required placeholder="e.g. Carpenter, Driver, Administrator">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="form-label" for="employee-pay-type">Pay type *</label>
                <select id="employee-pay-type" v-model="newEmployee.payType" class="form-control" required>
                  <option value="Daily">Daily</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Hourly">Hourly</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label class="form-label" for="employee-rate">Base rate (PHP) *</label>
                <input id="employee-rate" v-model.number="newEmployee.rate" class="form-control font-mono" type="number" min="0.01" step="0.01" required>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="form-label" for="employee-phone">Phone</label>
                <input id="employee-phone" v-model.trim="newEmployee.phone" class="form-control" autocomplete="tel">
              </div>
              <div>
                <label class="form-label" for="employee-start-date">Start date *</label>
                <input id="employee-start-date" v-model="newEmployee.startDate" class="form-control" type="date" required>
              </div>
            </div>

            <div>
              <label class="form-label" for="employee-status">Status</label>
              <select id="employee-status" v-model="newEmployee.status" class="form-control">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div class="modal-actions">
              <button type="button" class="secondary-button" @click="closeModal">Cancel</button>
              <button type="submit" class="primary-button" :disabled="saving">{{ saving ? 'Saving…' : editingEmployeeId ? 'Save Changes' : 'Save Employee' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, Users, X } from 'lucide-vue-next'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useEmployeeStore } from '@/stores/employeeStore'

const employeeStore = useEmployeeStore()
const showAddModal = ref(false)
const editingEmployeeId = ref(null)
const saving = ref(false)
const saveError = ref('')

function createEmptyEmployee() {
  return {
    name: '',
    position: '',
    payType: 'Daily',
    rate: null,
    phone: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'Active'
  }
}

const newEmployee = ref(createEmptyEmployee())

function advanceBalance(employeeId) {
  return employeeStore.employeeAdvancesMap[employeeId] || 0
}

function payUnit(payType) {
  return { Daily: 'day', Monthly: 'month', Hourly: 'hour', Other: 'period' }[payType] || 'period'
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 }).format(value || 0)
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

function closeModal() {
  showAddModal.value = false
  editingEmployeeId.value = null
  saveError.value = ''
  newEmployee.value = createEmptyEmployee()
}

function openEditModal(employee) {
  editingEmployeeId.value = employee.id
  newEmployee.value = { ...employee }
  showAddModal.value = true
}

async function handleAddEmployee() {
  if (saving.value) return
  saving.value = true
  saveError.value = ''
  try {
    if (editingEmployeeId.value) {
      await employeeStore.updateEmployee(editingEmployeeId.value, newEmployee.value)
    } else {
      await employeeStore.addEmployee(newEmployee.value)
    }
    closeModal()
  } catch (error) {
    saveError.value = 'Could not save employee changes. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>
