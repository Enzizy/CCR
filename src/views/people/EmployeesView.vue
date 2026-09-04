<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-slate-900">Workers & Workshop Personnel</h2>
      </div>
    </div>

    <!-- Employee Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="emp in employeeStore.employees"
        :key="emp.id"
        class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-bold text-sm text-slate-950">{{ emp.name }}</h3>
            <p class="text-xs text-slate-500 mt-0.5">{{ emp.position }}</p>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {{ emp.status }}
          </span>
        </div>

        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1.5">
          <div class="flex justify-between">
            <span class="text-slate-500">Pay Type:</span>
            <span class="font-semibold text-slate-800">{{ emp.payType }} Rate</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Base Compensation:</span>
            <span class="font-mono font-bold text-slate-900">₱{{ emp.rate.toLocaleString() }}/{{ emp.payType === 'Daily' ? 'day' : 'mo' }}</span>
          </div>
          <div class="flex justify-between pt-1 border-t border-slate-200">
            <span class="text-slate-500">Open Cash Advance:</span>
            <span
              :class="[
                'font-mono font-bold',
                (employeeStore.employeeAdvancesMap[emp.id] || 0) > 0 ? 'text-amber-700' : 'text-slate-400'
              ]"
            >
              ₱{{ (employeeStore.employeeAdvancesMap[emp.id] || 0).toLocaleString() }}
            </span>
          </div>
        </div>

        <div class="text-[11px] text-slate-400 font-mono">
          {{ emp.phone }} • Since {{ emp.startDate }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEmployeeStore } from '@/stores/employeeStore'

const employeeStore = useEmployeeStore()
</script>

