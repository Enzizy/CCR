import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useExpenseStore } from './expenseStore'

export const useEmployeeStore = defineStore('employee', () => {
  const employees = ref([])
  const cashAdvances = ref([])
  const payrollRecords = ref([])

  const totalOpenAdvances = computed(() => cashAdvances.value.filter(advance => advance.status === 'Open').reduce((total, advance) => total + advance.balance, 0))

  const employeeAdvancesMap = computed(() => {
    const balances = {}
    cashAdvances.value.forEach(advance => {
      if (advance.status === 'Open') balances[advance.employeeId] = (balances[advance.employeeId] || 0) + advance.balance
    })
    return balances
  })

  function addEmployee(data) {
    const rate = Number(data.rate)
    if (!data.name?.trim() || !data.position?.trim() || !Number.isFinite(rate) || rate < 0) return null

    const employee = {
      id: `emp-${employees.value.length + 1}`,
      name: data.name.trim(),
      position: data.position.trim(),
      payType: data.payType,
      rate,
      phone: data.phone?.trim() || '',
      startDate: data.startDate,
      status: data.status || 'Active'
    }
    employees.value.unshift(employee)
    return employee
  }

  function addCashAdvance(data) {
    const employee = employees.value.find(item => item.id === data.employeeId)
    const amount = Number(data.amount)
    if (!employee || !Number.isFinite(amount) || amount <= 0) return null

    const newAdvance = {
      id: `ca-${cashAdvances.value.length + 1}`,
      employeeId: data.employeeId,
      employeeName: employee?.name || 'Unknown Employee',
      date: data.date,
      amount,
      deductedAmount: 0,
      balance: amount,
      status: 'Open',
      reason: data.reason || 'Cash Advance'
    }
    cashAdvances.value.unshift(newAdvance)
    return newAdvance
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
    addEmployee,
    addCashAdvance,
    recordPayroll
  }
})
