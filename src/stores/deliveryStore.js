import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSalesStore } from './salesStore'
import { useExpenseStore } from './expenseStore'
import { useBillingStore } from './billingStore'

export const useDeliveryStore = defineStore('delivery', () => {
  const nextDrSeq = ref(1)
  const deliveryReceipts = ref([])
  const deliveryTrips = ref([])
  const deliveryIssues = ref([])

  const recentDeliveries = computed(() => [...deliveryReceipts.value].sort((a, b) => new Date(b.date) - new Date(a.date)))
  const openIssuesCount = computed(() => deliveryIssues.value.filter(issue => !['Resolved', 'Closed'].includes(issue.status)).length)

  function createDelivery(data) {
    const salesStore = useSalesStore()
    const billingStore = useBillingStore()
    const isReplacement = Boolean(data.isReplacement)
    let subtotal = 0

    const items = data.items.map(item => {
      const amount = isReplacement ? 0 : item.quantity * item.unitPrice
      subtotal += amount
      return { ...item, amount }
    })

    const newDelivery = {
      id: `dr-${deliveryReceipts.value.length + 1}`,
      drNumber: `DR #${String(nextDrSeq.value++).padStart(4, '0')}`,
      date: data.date,
      poId: data.poId,
      poNumber: data.poNumber,
      poDate: data.poDate || null,
      customerId: data.customerId,
      customerName: data.customerName,
      project: data.project,
      paymentTerms: data.paymentTerms || '',
      tripId: data.tripId || null,
      isReplacement,
      originalDrNumber: data.originalDrNumber || null,
      replacementReason: data.replacementReason || null,
      status: isReplacement ? 'Replacement' : 'Delivered',
      items,
      subtotal,
      preparedBy: data.preparedBy || 'Admin Staff',
      deliveredBy: data.deliveredBy || '',
      receivedBy: data.receivedBy || 'Pending Signature'
    }

    deliveryReceipts.value.unshift(newDelivery)
    if (!isReplacement && data.poId) {
      salesStore.recordDeliveryToPO(data.poId, data.items)
      billingStore.generateSOAFromDR(newDelivery)
    }
    return newDelivery
  }

  function createDeliveryTrip(tripData) {
    const expenseStore = useExpenseStore()
    const requestedDrNumbers = [...new Set(tripData.drNumbers || [])]
    const assignableDrNumbers = requestedDrNumbers.filter(drNumber => {
      const receipt = deliveryReceipts.value.find(item => item.drNumber === drNumber)
      return receipt && !receipt.tripId
    })
    if (assignableDrNumbers.length === 0) return null

    const tripYear = new Date(`${tripData.date}T00:00:00`).getFullYear()
    const tripNumber = `TRIP-${tripYear}-${String(deliveryTrips.value.length + 1).padStart(4, '0')}`
    const newTrip = {
      id: `trip-${deliveryTrips.value.length + 1}`,
      tripNumber,
      date: tripData.date,
      vehicle: tripData.vehicle,
      driver: tripData.driver,
      assistant: tripData.assistant || '',
      drNumbers: assignableDrNumbers,
      destinations: tripData.destinations || [],
      gasExpense: Number(tripData.gasExpense) || 0,
      tollExpense: Number(tripData.tollExpense) || 0,
      otherExpense: Number(tripData.otherExpense) || 0,
      notes: tripData.notes || ''
    }
    deliveryTrips.value.unshift(newTrip)

    newTrip.drNumbers.forEach(drNumber => {
      const receipt = deliveryReceipts.value.find(item => item.drNumber === drNumber)
      if (receipt) receipt.tripId = newTrip.id
    })

    const tripExpenses = [
      { amount: newTrip.gasExpense, subCategory: 'Gas/Fuel', description: `Trip Fuel: ${tripNumber}` },
      { amount: newTrip.tollExpense, subCategory: 'Toll', description: `Trip Toll: ${tripNumber}` },
      { amount: newTrip.otherExpense, subCategory: 'Other Transportation', description: `Other Trip Costs: ${tripNumber}` }
    ]
    tripExpenses.filter(expense => expense.amount > 0).forEach(expense => {
      expenseStore.addExpense({
        category: 'Transportation',
        ...expense,
        date: newTrip.date,
        sourceType: 'DELIVERY_TRIP',
        referenceId: tripNumber,
        notes: `Auto-generated from Delivery Trip ${tripNumber}`
      })
    })
    return newTrip
  }

  function reportDeliveryDamage(issueData) {
    const newIssue = {
      id: `issue-${deliveryIssues.value.length + 1}`,
      dateReported: issueData.dateReported,
      originalDrNumber: issueData.originalDrNumber,
      customerId: issueData.customerId,
      customerName: issueData.customerName,
      productName: issueData.productName,
      quantityAffected: Number(issueData.quantityAffected),
      reason: issueData.reason,
      status: 'Open',
      replacementDrNumber: null,
      resolvedDate: null,
      notes: issueData.notes || ''
    }
    deliveryIssues.value.unshift(newIssue)
    return newIssue
  }

  function resolveIssueWithReplacement(issueId, replacementDr) {
    const issue = deliveryIssues.value.find(item => item.id === issueId)
    if (!issue) return
    issue.status = 'Resolved'
    issue.replacementDrNumber = replacementDr.drNumber
    issue.resolvedDate = replacementDr.date
  }

  return {
    deliveryReceipts,
    deliveryTrips,
    deliveryIssues,
    nextDrSeq,
    recentDeliveries,
    openIssuesCount,
    createDelivery,
    createDeliveryTrip,
    reportDeliveryDamage,
    resolveIssueWithReplacement
  }
})
