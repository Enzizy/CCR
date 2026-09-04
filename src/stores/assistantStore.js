import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useBillingStore } from './billingStore'
import { useExpenseStore } from './expenseStore'
import { useDeliveryStore } from './deliveryStore'
import { useSalesStore } from './salesStore'

export const useAssistantStore = defineStore('assistant', () => {
  const isOpen = ref(false)
  const isTyping = ref(false)

  const messages = ref([
    {
      id: 'msg-1',
      role: 'assistant',
      text: 'Hello! I am your CCR Business Assistant. You can ask me about purchase orders, outstanding balances, delivery trips, recent expenses, or have me log new business transactions.',
      timestamp: '12:30 PM',
      proposedAction: null
    }
  ])

  function toggleAssistant() {
    isOpen.value = !isOpen.value
  }

  function openAssistant() {
    isOpen.value = true
  }

  function closeAssistant() {
    isOpen.value = false
  }

  function sendMessage(text) {
    if (!text.trim()) return

    const userMsg = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      proposedAction: null
    }

    messages.value.push(userMsg)
    isTyping.value = true

    // Process response using application data
    setTimeout(() => {
      processAssistantResponse(userMsg.text)
      isTyping.value = false
    }, 600)
  }

  function processAssistantResponse(query) {
    const billingStore = useBillingStore()
    const expenseStore = useExpenseStore()
    const salesStore = useSalesStore()
    const deliveryStore = useDeliveryStore()

    const q = query.toLowerCase()
    let replyText = ''
    let proposedAction = null

    // 1. Inquire about Cebu Landmaster balance
    if (q.includes('cebu landmaster') && (q.includes('owe') || q.includes('balance') || q.includes('receivable'))) {
      const cliReceivables = billingStore.customerReceivables.find(c => c.customerName.includes('Landmaster'))
      const totalOwed = cliReceivables ? cliReceivables.totalOutstanding : 0
      replyText = `Cebu Landmaster Inc. currently owes **₱${totalOwed.toLocaleString()}** across their delivered orders.\n\n` +
        `• **SOA-2026-001**: ₱395,500 remaining balance (Due: Sept 19, 2026)\n` +
        `• **SOA-2026-003**: ₱310,000 remaining balance (Due: Oct 2, 2026)\n\n` +
        `They have already paid ₱200,000 against SOA-2026-001.`
    }
    // 2. Inquire about overdue SOAs
    else if (q.includes('overdue') || (q.includes('due') && q.includes('soa'))) {
      const overdueList = billingStore.enrichedStatements.filter(s => s.agingCategory === 'Overdue')
      const dueSoonList = billingStore.enrichedStatements.filter(s => s.agingCategory === 'Due Soon')

      if (overdueList.length === 0) {
        replyText = `There are currently **no overdue SOAs** as of today (Sept 4, 2026).\n\n` +
          `However, you have **${dueSoonList.length} SOA due soon** within the next 7-15 days:\n` +
          `• **SOA-2026-001** (Cebu Landmaster Inc.) - ₱395,500 due on September 19.`
      } else {
        replyText = `There are **${overdueList.length} overdue SOAs** totaling ₱${overdueList.reduce((a, b) => a + b.balance, 0).toLocaleString()}.`
      }
    }
    // 3. Inquire about gas/fuel expenses
    else if (q.includes('gas') || q.includes('fuel')) {
      const gasExpenses = expenseStore.expenses.filter(e => e.subCategory === 'Gas/Fuel')
      const totalGas = gasExpenses.reduce((a, b) => a + b.amount, 0)
      replyText = `Total gas and fuel expenditures logged: **₱${totalGas.toLocaleString()}**.\n\n` +
        `Recent trip refuels:\n` +
        gasExpenses.slice(0, 3).map(e => `• ${e.date}: ₱${e.amount.toLocaleString()} - ${e.description}`).join('\n')
    }
    // 4. Inquire about total revenue / profit
    else if (q.includes('revenue') || q.includes('profit') || q.includes('summary')) {
      // Deterministic calculation
      const revenue = deliveryStore.deliveryReceipts.reduce((a, b) => a + b.subtotal, 0)
      const expenses = expenseStore.totalExpenses
      const profit = revenue - expenses
      const collections = billingStore.totalCollections

      replyText = `Here is the current operational financial snapshot:\n\n` +
        `• **Delivered Revenue**: ₱${revenue.toLocaleString()}\n` +
        `• **Collected Cash**: ₱${collections.toLocaleString()}\n` +
        `• **Total Expenses**: ₱${expenses.toLocaleString()}\n` +
        `• **Estimated Profit**: ₱${profit.toLocaleString()}\n` +
        `• **Outstanding Receivables**: ₱${billingStore.totalReceivables.toLocaleString()}`
    }
    // 5. Action proposal: Log gas expense
    else if (q.includes('spend') || q.includes('log') || q.includes('record') || (q.includes('gas') && q.includes('today'))) {
      const match = query.match(/(\d+[\d,]*)/)
      const amount = match ? parseInt(match[1].replace(/,/g, '')) : 2500

      replyText = `I have drafted an expense entry based on your request. Please review and confirm below before saving to financial records.`
      proposedAction = {
        type: 'RECORD_EXPENSE',
        title: 'Confirm Business Expense',
        details: {
          category: 'Transportation',
          subCategory: 'Gas/Fuel',
          description: 'Gasoline refuel for logistics truck',
          amount: amount,
          date: new Date().toISOString().split('T')[0],
          supplier: 'Shell Gas Station',
          paymentMethod: 'Cash'
        },
        status: 'pending'
      }
    }
    // 6. Generic answer
    else {
      replyText = `I can help you look up specific information from your business records or take action. Try asking:\n` +
        `• "How much do Cebu Landmaster Inc. owe us?"\n` +
        `• "What SOAs are due soon?"\n` +
        `• "How much did we spend on gas?"\n` +
        `• "What is our current revenue and profit?"\n` +
        `• "Record ₱2,500 gas expense today"`
    }

    messages.value.push({
      id: 'msg-' + Date.now(),
      role: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      proposedAction
    })
  }

  function confirmAction(action) {
    const expenseStore = useExpenseStore()
    if (action.type === 'RECORD_EXPENSE') {
      expenseStore.addExpense(action.details)
      action.status = 'confirmed'

      messages.value.push({
        id: 'msg-' + Date.now(),
        role: 'assistant',
        text: `✅ **Expense recorded successfully!** ₱${action.details.amount.toLocaleString()} has been logged under **Transportation (Gas/Fuel)** and immediately added to your monthly expense totals.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proposedAction: null
      })
    }
  }

  function cancelAction(action) {
    action.status = 'cancelled'
    messages.value.push({
      id: 'msg-' + Date.now(),
      role: 'assistant',
      text: `❌ Action cancelled. No records were modified.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      proposedAction: null
    })
  }

  return {
    isOpen,
    isTyping,
    messages,
    toggleAssistant,
    openAssistant,
    closeAssistant,
    sendMessage,
    confirmAction,
    cancelAction
  }
})

