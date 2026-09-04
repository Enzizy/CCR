import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useExpenseStore } from './expenseStore'

export const useEmployeeStore = defineStore('employee', () => {
  const employees = ref([
    {
      id: 'emp-1',
      name: 'Juan Dela Cruz',
      position: 'Master Carpenter / Shop Lead',
      payType: 'Daily',
      rate: 750,
      phone: '+63 917 111 2233',
      startDate: '2023-03-15',
      status: 'Active'
    },
    {
      id: 'emp-2',
      name: 'Pedro Cruz',
      position: 'Delivery Driver / Logistics',
      payType: 'Daily',
      rate: 650,
      phone: '+63 920 444 5566',
      startDate: '2023-06-01',
      status: 'Active'
    },
    {
      id: 'emp-3',
      name: 'Mark Bautista',
      position: 'Sander & Finisher',
      payType: 'Daily',
      rate: 550,
      phone: '+63 922 777 8899',
      startDate: '2024-01-10',
      status: 'Active'
    },
    {
      id: 'emp-4',
      name: 'Elena Santos',
      position: 'Shop Admin & Inventory Clerk',
      payType: 'Monthly',
      rate: 18000,
      phone: '+63 918 333 4455',
      startDate: '2023-10-01',
      status: 'Active'
    }
  ])

  // Cash Advance Ledger (Balances owed by employees)
  const cashAdvances = ref([
    {
      id: 'ca-1',
      employeeId: 'emp-1',
      employeeName: 'Juan Dela Cruz',
      date: '2026-08-10',
      amount: 3000,
      deductedAmount: 2000, // ₱2,000 already deducted on Aug 31 cutoff
      balance: 1000,
      status: 'Open',
      reason: 'Family emergency / medical allowance'
    },
    {
      id: 'ca-2',
      employeeId: 'emp-2',
      employeeName: 'Pedro Cruz',
      date: '2026-08-25',
      amount: 1500,
      deductedAmount: 1500, // fully repaid
      balance: 0,
      status: 'Repaid',
      reason: 'Motorcycle repair'
    },
    {
      id: 'ca-3',
      employeeId: 'emp-3',
      employeeName: 'Mark Bautista',
      date: '2026-09-01',
      amount: 2500,
      deductedAmount: 0,
      balance: 2500,
      status: 'Open',
      reason: 'House rental deposit'
    }
  ])

  // Payroll Payout Records
  const payrollRecords = ref([
    {
      id: 'payr-1',
      payrollRef: 'PR-2026-08B',
      cutoffPeriod: 'Aug 16 - 31, 2026',
      paymentDate: '2026-08-31',
      totalGross: 52000,
      totalAdvanceDeductions: 3500,
      totalNetPaid: 48500,
      status: 'Paid',
      entries: [
        {
          employeeId: 'emp-1',
          employeeName: 'Juan Dela Cruz',
          grossSalary: 11250, // 15 days @ 750
          advanceDeduction: 2000,
          netPaid: 9250
        },
        {
          employeeId: 'emp-2',
          employeeName: 'Pedro Cruz',
          grossSalary: 9750,  // 15 days @ 650
          advanceDeduction: 1500,
          netPaid: 8250
        },
        {
          employeeId: 'emp-3',
          employeeName: 'Mark Bautista',
          grossSalary: 8250,  // 15 days @ 550
          advanceDeduction: 0,
          netPaid: 8250
        },
        {
          employeeId: 'emp-4',
          employeeName: 'Elena Santos',
          grossSalary: 9000,  // half month of 18000
          advanceDeduction: 0,
          netPaid: 9000
        }
      ]
    }
  ])

  // Getters
  const totalOpenAdvances = computed(() => {
    return cashAdvances.value.filter(ca => ca.status === 'Open').reduce((acc, ca) => acc + ca.balance, 0)
  })

  const employeeAdvancesMap = computed(() => {
    const map = {}
    cashAdvances.value.forEach(ca => {
      if (ca.status === 'Open') {
        map[ca.employeeId] = (map[ca.employeeId] || 0) + ca.balance
      }
    })
    return map
  })

  // Actions
  function addCashAdvance(data) {
    const emp = employees.value.find(e => e.id === data.employeeId)
    const newCa = {
      id: 'ca-' + (cashAdvances.value.length + 1),
      employeeId: data.employeeId,
      employeeName: emp ? emp.name : 'Unknown Employee',
      date: data.date,
      amount: Number(data.amount),
      deductedAmount: 0,
      balance: Number(data.amount),
      status: 'Open',
      reason: data.reason || 'Cash Advance'
    }
    cashAdvances.value.unshift(newCa)
    return newCa
  }

  function recordPayroll(payrollData) {
    const expenseStore = useExpenseStore()
    const payrRef = `PR-2026-09A`

    const newRecord = {
      id: 'payr-' + (payrollRecords.value.length + 1),
      payrollRef: payrRef,
      cutoffPeriod: payrollData.cutoffPeriod,
      paymentDate: payrollData.paymentDate,
      totalGross: Number(payrollData.totalGross),
      totalAdvanceDeductions: Number(payrollData.totalAdvanceDeductions),
      totalNetPaid: Number(payrollData.totalGross) - Number(payrollData.totalAdvanceDeductions),
      status: 'Paid',
      entries: payrollData.entries || []
    }

    payrollRecords.value.unshift(newRecord)

    // Apply deductions against active advances
    if (payrollData.entries) {
      payrollData.entries.forEach(entry => {
        if (entry.advanceDeduction > 0) {
          const openAdv = cashAdvances.value.find(ca => ca.employeeId === entry.employeeId && ca.status === 'Open')
          if (openAdv) {
            openAdv.deductedAmount += entry.advanceDeduction
            openAdv.balance = Math.max(0, openAdv.amount - openAdv.deductedAmount)
            if (openAdv.balance === 0) {
              openAdv.status = 'Repaid'
            }
          }
        }
      })
    }

    // Record gross labor in general business expenses (without double counting advance deductions)
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
      notes: `Gross wages earned: ₱${newRecord.totalGross.toLocaleString()}. Net paid after advance deductions: ₱${newRecord.totalNetPaid.toLocaleString()}.`
    })

    return newRecord
  }

  return {
    employees,
    cashAdvances,
    payrollRecords,
    totalOpenAdvances,
    employeeAdvancesMap,
    addCashAdvance,
    recordPayroll
  }
})

