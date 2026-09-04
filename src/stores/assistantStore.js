import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useBillingStore } from './billingStore'
import { useExpenseStore } from './expenseStore'
import { useDeliveryStore } from './deliveryStore'

export const useAssistantStore = defineStore('assistant', () => {
  const isOpen = ref(false)
  const isTyping = ref(false)
  const messages = ref([{
    id: 'welcome',
    role: 'assistant',
    text: 'Hello! I am your CCR Business Assistant. Ask me about revenue, receivables, deliveries, or expenses.',
    timestamp: '',
    proposedAction: null
  }])

  function openAssistant() { isOpen.value = true }
  function closeAssistant() { isOpen.value = false }

  function sendMessage(text) {
    if (!text.trim()) return
    const message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: currentTime(),
      proposedAction: null
    }
    messages.value.push(message)
    isTyping.value = true
    setTimeout(() => {
      processAssistantResponse(message.text)
      isTyping.value = false
    }, 600)
  }

  function processAssistantResponse(query) {
    const billingStore = useBillingStore()
    const expenseStore = useExpenseStore()
    const deliveryStore = useDeliveryStore()
    const normalizedQuery = query.toLowerCase()
    let replyText
    let proposedAction = null

    if (normalizedQuery.includes('overdue') || (normalizedQuery.includes('due') && normalizedQuery.includes('soa'))) {
      const overdue = billingStore.enrichedStatements.filter(statement => statement.agingCategory === 'Overdue')
      const dueSoon = billingStore.enrichedStatements.filter(statement => statement.agingCategory === 'Due Soon')
      const overdueTotal = overdue.reduce((total, statement) => total + statement.balance, 0)
      replyText = overdue.length
        ? `There are **${overdue.length} overdue SOAs** totaling ${formatCurrency(overdueTotal)}.`
        : `There are **no overdue SOAs**. ${dueSoon.length} SOA${dueSoon.length === 1 ? ' is' : 's are'} due within 7 days.`
    } else if (normalizedQuery.includes('gas') || normalizedQuery.includes('fuel')) {
      const gasExpenses = expenseStore.expenses.filter(expense => expense.subCategory === 'Gas/Fuel')
      const total = gasExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      replyText = `Recorded gas and fuel expenses total **${formatCurrency(total)}** across ${gasExpenses.length} entr${gasExpenses.length === 1 ? 'y' : 'ies'}.`
    } else if (normalizedQuery.includes('revenue') || normalizedQuery.includes('profit') || normalizedQuery.includes('summary')) {
      const revenue = deliveryStore.deliveryReceipts.reduce((total, delivery) => total + delivery.subtotal, 0)
      replyText = `Current recorded totals:\n\n• **Delivered revenue:** ${formatCurrency(revenue)}\n• **Collections:** ${formatCurrency(billingStore.totalCollections)}\n• **Expenses:** ${formatCurrency(expenseStore.totalExpenses)}\n• **Estimated operating net:** ${formatCurrency(revenue - expenseStore.totalExpenses)}\n• **Accounts receivable:** ${formatCurrency(billingStore.totalReceivables)}`
    } else if (normalizedQuery.includes('owe') || normalizedQuery.includes('balance') || normalizedQuery.includes('receivable')) {
      replyText = billingStore.customerReceivables.length
        ? `Total accounts receivable is **${formatCurrency(billingStore.totalReceivables)}** across ${billingStore.customerReceivables.length} customer${billingStore.customerReceivables.length === 1 ? '' : 's'}.`
        : 'There are no customer receivables recorded yet.'
    } else if (normalizedQuery.includes('spend') || normalizedQuery.includes('log') || normalizedQuery.includes('record')) {
      const match = query.match(/(\d+[\d,]*)/)
      const amount = match ? Number(match[1].replace(/,/g, '')) : 0
      replyText = 'I drafted an expense entry. Review it carefully before saving.'
      proposedAction = {
        type: 'RECORD_EXPENSE',
        title: 'Confirm Business Expense',
        details: {
          category: 'Transportation',
          subCategory: 'Gas/Fuel',
          description: 'Gasoline refuel for logistics vehicle',
          amount,
          date: new Date().toISOString().split('T')[0],
          supplier: '',
          paymentMethod: 'Cash'
        },
        status: 'pending'
      }
    } else {
      replyText = 'I can summarize revenue, receivables, overdue SOAs, deliveries, and expenses from the records currently in the system.'
    }

    messages.value.push({ id: `msg-${Date.now()}`, role: 'assistant', text: replyText, timestamp: currentTime(), proposedAction })
  }

  function confirmAction(action) {
    if (action.type !== 'RECORD_EXPENSE') return
    const expense = useExpenseStore().addExpense(action.details)
    if (!expense) {
      messages.value.push({ id: `msg-${Date.now()}`, role: 'assistant', text: 'The expense was not saved because it needs a valid amount greater than zero.', timestamp: currentTime(), proposedAction: null })
      return
    }
    action.status = 'confirmed'
    messages.value.push({ id: `msg-${Date.now()}`, role: 'assistant', text: `Expense recorded successfully: **${formatCurrency(action.details.amount)}**.`, timestamp: currentTime(), proposedAction: null })
  }

  function cancelAction(action) {
    action.status = 'cancelled'
    messages.value.push({ id: `msg-${Date.now()}`, role: 'assistant', text: 'Action cancelled. No records were modified.', timestamp: currentTime(), proposedAction: null })
  }

  function currentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
  }

  return { isOpen, isTyping, messages, openAssistant, closeAssistant, sendMessage, confirmAction, cancelAction }
})
