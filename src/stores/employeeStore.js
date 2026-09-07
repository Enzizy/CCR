import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useExpenseStore } from './expenseStore'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const useEmployeeStore = defineStore('employee', () => {
  const employees = ref([])
  const cashAdvances = ref([])
  const payrollRecords = ref([])
  const isLoading = ref(false)

  const totalOpenAdvances = computed(() => cashAdvances.value.filter(advance => advance.status === 'Open').reduce((total, advance) => total + Number(advance.balance || 0), 0))

  const employeeAdvancesMap = computed(() => {
    const balances = {}
    cashAdvances.value.forEach(advance => {
      if (advance.status === 'Open') balances[advance.employeeId] = (balances[advance.employeeId] || 0) + Number(advance.balance || 0)
    })
    return balances
  })

  async function fetchAll() {
    isLoading.value = true
    try {
      if (isSupabaseConfigured) {
        const [empRes, caRes] = await Promise.all([
          supabase.from('employees').select('*').order('name', { ascending: true }),
          supabase.from('cash_advances').select('*').order('date', { ascending: false })
        ])

        if (empRes.data) {
          employees.value = empRes.data.map(r => ({
            id: r.id,
            name: r.name,
            position: r.position,
            payType: r.pay_type,
            rate: Number(r.rate || 0),
            phone: r.phone,
            startDate: r.start_date,
            status: r.status
          }))
        }

        if (caRes.data) {
          cashAdvances.value = caRes.data.map(r => ({
            id: r.id,
            employeeId: r.employee_id,
            employeeName: r.employee_name,
            date: r.date,
            amount: Number(r.amount || 0),
            deductedAmount: Number(r.deducted_amount || 0),
            balance: Number(r.balance || 0),
            status: r.status,
            reason: r.reason
          }))
        }
        return
      }

      const [empRes, caRes] = await Promise.all([
        fetch('/api/employees').then(r => r.json()),
        fetch('/api/cash-advances').then(r => r.json())
      ])
      employees.value = empRes || []
      cashAdvances.value = caRes || []
    } catch (err) {
      console.error('Failed to fetch employee data:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Auto-fetch on store initialization
  fetchAll()

  async function addEmployee(data) {
    const rate = Number(data.rate)
    if (!data.name?.trim() || !data.position?.trim() || !Number.isFinite(rate) || rate < 0) return null

    const payload = {
      id: `emp-${Date.now()}`,
      name: data.name.trim(),
      position: data.position.trim(),
      payType: data.payType || 'Daily',
      rate,
      phone: data.phone?.trim() || '',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      status: data.status || 'Active'
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('employees').insert({
          id: payload.id,
          name: payload.name,
          position: payload.position,
          pay_type: payload.payType,
          rate: payload.rate,
          phone: payload.phone,
          start_date: payload.startDate,
          status: payload.status
        })
        if (error) throw error
        employees.value.push(payload)
        return payload
      } catch (e) {
        console.error('Supabase employee insert failed, falling back:', e)
      }
    }

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const saved = await res.json()
      employees.value.push(saved)
      return saved
    } catch (e) {
      employees.value.push(payload)
      return payload
    }
  }

  async function updateEmployee(id, data) {
    const employeeIndex = employees.value.findIndex(employee => employee.id === id)
    if (employeeIndex < 0) return null

    const rate = Number(data.rate)
    if (!data.name?.trim() || !data.position?.trim() || !Number.isFinite(rate) || rate < 0) return null

    const payload = {
      ...employees.value[employeeIndex],
      name: data.name.trim(),
      position: data.position.trim(),
      payType: data.payType || 'Daily',
      rate,
      phone: data.phone?.trim() || '',
      startDate: data.startDate || employees.value[employeeIndex].startDate,
      status: data.status || 'Active'
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('employees').update({
        name: payload.name,
        position: payload.position,
        pay_type: payload.payType,
        rate: payload.rate,
        phone: payload.phone,
        start_date: payload.startDate,
        status: payload.status
      }).eq('id', id)
      if (error) throw error
    } else {
      const res = await fetch(`/api/employees/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Unable to save employee changes.')
    }

    employees.value.splice(employeeIndex, 1, payload)
    return payload
  }

  async function addCashAdvance(data) {
    const employee = employees.value.find(item => item.id === data.employeeId)
    const amount = Number(data.amount)
    if (!employee || !Number.isFinite(amount) || amount <= 0) return null

    const payload = {
      id: `ca-${Date.now()}`,
      employeeId: data.employeeId,
      employeeName: employee?.name || 'Worker',
      date: data.date || new Date().toISOString().split('T')[0],
      amount,
      deductedAmount: 0,
      balance: amount,
      status: 'Open',
      reason: data.reason || 'Cash Advance (Vale)'
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('cash_advances').insert({
          id: payload.id,
          employee_id: payload.employeeId,
          employee_name: payload.employeeName,
          date: payload.date,
          amount: payload.amount,
          deducted_amount: 0,
          balance: payload.amount,
          status: 'Open',
          reason: payload.reason
        })
        if (error) throw error
        cashAdvances.value.unshift(payload)
        return payload
      } catch (e) {
        console.error('Supabase cash advance insert failed, falling back:', e)
      }
    }

    try {
      const res = await fetch('/api/cash-advances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const saved = await res.json()
      cashAdvances.value.unshift(saved)
      return saved
    } catch (e) {
      cashAdvances.value.unshift(payload)
      return payload
    }
  }

  function recordPayroll(payrollData) {
    const expenseStore = useExpenseStore()
    const entries = (payrollData.entries || [])
      .map(entry => {
        const grossSalary = Math.max(0, Number(entry.grossSalary) || 0)
        const availableAdvance = employeeAdvancesMap.value[entry.employeeId] || 0
        const advanceDeduction = Math.min(grossSalary, availableAdvance, Math.max(0, Number(entry.advanceDeduction) || 0))
        return { ...entry, grossSalary, advanceDeduction, netPaid: grossSalary - advanceDeduction }
      })
      .filter(entry => entry.grossSalary > 0)
    const totalGross = entries.reduce((total, entry) => total + entry.grossSalary, 0)
    const totalAdvanceDeductions = entries.reduce((total, entry) => total + entry.advanceDeduction, 0)
    if (entries.length === 0 || totalGross <= 0) return null

    const newRecord = {
      id: `payr-${payrollRecords.value.length + 1}`,
      payrollRef: `PR-${new Date(`${payrollData.paymentDate}T00:00:00`).getFullYear()}-${String(payrollRecords.value.length + 1).padStart(3, '0')}`,
      cutoffPeriod: payrollData.cutoffPeriod,
      paymentDate: payrollData.paymentDate,
      totalGross,
      totalAdvanceDeductions,
      totalNetPaid: totalGross - totalAdvanceDeductions,
      status: 'Paid',
      entries
    }
    payrollRecords.value.unshift(newRecord)

    newRecord.entries.forEach(entry => {
      if (entry.advanceDeduction <= 0) return
      let remainingDeduction = entry.advanceDeduction
      const openAdvances = cashAdvances.value.filter(item => item.employeeId === entry.employeeId && item.status === 'Open')
      openAdvances.forEach(advance => {
        if (remainingDeduction <= 0) return
        const appliedAmount = Math.min(advance.balance, remainingDeduction)
        advance.deductedAmount += appliedAmount
        advance.balance = Math.max(0, advance.amount - advance.deductedAmount)
        remainingDeduction -= appliedAmount
        if (advance.balance === 0) advance.status = 'Repaid'
      })
    })

    expenseStore.addExpense({
      category: 'Labor',
      subCategory: 'Worker Salary',
      description: `Payroll Cutoff ${newRecord.cutoffPeriod}`,
      amount: newRecord.totalGross,
      date: newRecord.paymentDate,
      supplier: 'Shop Workers',
      paymentMethod: 'Cash',
      sourceType: 'PAYROLL',
      referenceId: newRecord.payrollRef,
      notes: `Gross wages earned: ${newRecord.totalGross}. Net paid after advance deductions: ${newRecord.totalNetPaid}.`
    })
    return newRecord
  }

  return {
    employees,
    cashAdvances,
    payrollRecords,
    totalOpenAdvances,
    employeeAdvancesMap,
    isLoading,
    fetchAll,
    addEmployee,
    updateEmployee,
    addCashAdvance,
    recordPayroll
  }
})
