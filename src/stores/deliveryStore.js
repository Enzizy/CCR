import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSalesStore } from './salesStore'
import { useExpenseStore } from './expenseStore'
import { useBillingStore } from './billingStore'

export const useDeliveryStore = defineStore('delivery', () => {
  // Sequential DR counter
  const nextDrSeq = ref(4332)

  // Delivery Receipts
  const deliveryReceipts = ref([
    {
      id: 'dr-1',
      drNumber: 'DR #4322',
      date: '2026-08-20',
      poId: 'po-1',
      poNumber: '4100017940',
      customerId: 'cust-1',
      customerName: 'CEBU LANDMASTERS, INC.',
      project: 'CASA MIRA SOUTH',
      tripId: 'trip-1',
      isReplacement: false,
      originalDrNumber: null,
      replacementReason: null,
      status: 'Delivered',
      items: [
        {
          productId: 'prod-1',
          name: 'Door, Wooden Solid Panel 0.90x2.10 m. w/ Jamb',
          quantity: 50,
          unit: 'sets',
          unitPrice: 5200,
          amount: 260000
        },
        {
          productId: 'prod-2',
          name: 'Door, Hollow Core Flush 0.70 x 2.10 m. w/ Jamb',
          quantity: 73,
          unit: 'sets',
          unitPrice: 3200,
          amount: 233600
        }
      ],
      subtotal: 493600,
      preparedBy: 'RODIL B. VERGARA',
      deliveredBy: 'Pedro Cruz (Driver)',
      receivedBy: 'Engr. Roberto Santos / CLI Warehouse'
    },
    {
      id: 'dr-2',
      drNumber: 'DR #4323',
      date: '2026-08-20',
      poId: 'po-2',
      poNumber: 'PO-SCI-2026-092',
      customerId: 'cust-2',
      customerName: 'Shalom Constructions Inc.',
      project: 'Villa Maria Subdivision Phase 1',
      tripId: 'trip-1', // Same trip as DR #4322! Multi-customer trip demonstration
      isReplacement: false,
      originalDrNumber: null,
      replacementReason: null,
      status: 'Delivered',
      items: [
        {
          productId: 'prod-3',
          name: 'Door, Solid Core Flush 0.80x2.10 m. w/ Heavy Jamb',
          quantity: 30,
          unit: 'set',
          unitPrice: 4900,
          amount: 147000
        },
        {
          productId: 'prod-2',
          name: 'Hollow Core Flush 0.70 x 2.10 m. w/ Jamb',
          quantity: 40,
          unit: 'set',
          unitPrice: 3500,
          amount: 140000
        }
      ],
      subtotal: 287000,
      preparedBy: 'Admin Staff',
      deliveredBy: 'Pedro Cruz (Driver)',
      receivedBy: 'Foreman Tony / Shalom'
    },
    {
      id: 'dr-3',
      drNumber: 'DR #4330',
      date: '2026-09-02',
      poId: 'po-1',
      poNumber: 'PO-CLI-2026-081',
      customerId: 'cust-1',
      customerName: 'Cebu Landmaster Inc.',
      project: 'Park Residences Tower 2 - Units 5F-12F',
      tripId: 'trip-2',
      isReplacement: false,
      originalDrNumber: null,
      replacementReason: null,
      status: 'Delivered',
      items: [
        {
          productId: 'prod-1',
          name: 'Door, Wooden Solid Panel 0.90x2.10 m. w/ Jamb Door',
          quantity: 25,
          unit: 'set',
          unitPrice: 6800,
          amount: 170000
        },
        {
          productId: 'prod-2',
          name: 'Hollow Core Flush 0.70 x 2.10 m. w/ Jamb',
          quantity: 40,
          unit: 'set',
          unitPrice: 3500,
          amount: 140000
        }
      ],
      subtotal: 310000,
      preparedBy: 'Admin Staff',
      deliveredBy: 'Pedro Cruz (Driver)',
      receivedBy: 'Warehouse Clerk Ramos'
    },
    {
      id: 'dr-4',
      drNumber: 'DR #4331',
      date: '2026-09-03',
      poId: 'po-1',
      poNumber: 'PO-CLI-2026-081',
      customerId: 'cust-1',
      customerName: 'Cebu Landmaster Inc.',
      project: 'Park Residences Tower 2 - Units 5F-12F',
      tripId: null,
      isReplacement: true,
      originalDrNumber: 'DR #4322',
      replacementReason: 'Damaged during unloading at CLI staging area (2 wooden solid panel doors surface cracked). Free warranty replacement.',
      status: 'Replacement',
      items: [
        {
          productId: 'prod-1',
          name: 'Door, Wooden Solid Panel 0.90x2.10 m. w/ Jamb Door',
          quantity: 2,
          unit: 'set',
          unitPrice: 0, // Free warranty replacement does not add revenue
          amount: 0
        }
      ],
      subtotal: 0,
      preparedBy: 'Admin Staff',
      deliveredBy: 'Pedro Cruz (Driver)',
      receivedBy: 'Engr. Roberto Santos'
    }
  ])

  // Delivery Trips (multi-customer capability)
  const deliveryTrips = ref([
    {
      id: 'trip-1',
      tripNumber: 'TRIP-2026-0089',
      date: '2026-08-20',
      vehicle: 'Isuzu Forward 6-Wheeler (CAE-8921)',
      driver: 'Pedro Cruz',
      assistant: 'Juan Dela Cruz',
      drNumbers: ['DR #4322', 'DR #4323'], // Serves both Cebu Landmaster and Shalom Constructions
      destinations: ['Cebu Business Park (CLI)', 'Subangdaku, Mandaue (Shalom)'],
      gasExpense: 2800,
      tollExpense: 180,
      otherExpense: 150,
      notes: 'Morning run. Heavy rain in Mandaue, unloaded without moisture damage.'
    },
    {
      id: 'trip-2',
      tripNumber: 'TRIP-2026-0092',
      date: '2026-09-02',
      vehicle: 'Isuzu Elf Dropside (GCC-4512)',
      driver: 'Pedro Cruz',
      assistant: 'Mark Bautista',
      drNumbers: ['DR #4330'],
      destinations: ['Cebu Business Park (CLI)'],
      gasExpense: 2500,
      tollExpense: 0,
      otherExpense: 0,
      notes: 'Second batch delivery for PO-CLI-2026-081.'
    }
  ])

  // Damage / Issues Log
  const deliveryIssues = ref([
    {
      id: 'issue-1',
      dateReported: '2026-08-22',
      originalDrNumber: 'DR #4322',
      customerId: 'cust-1',
      customerName: 'Cebu Landmaster Inc.',
      productName: 'Door, Wooden Solid Panel 0.90x2.10 m. w/ Jamb Door',
      quantityAffected: 2,
      reason: 'Corner jamb cracked and deep gouge on door face during unloading at Tower 2 ramp.',
      status: 'Resolved',
      replacementDrNumber: 'DR #4331',
      resolvedDate: '2026-09-03',
      notes: 'Free replacement built in shop and delivered under DR #4331.'
    }
  ])

  // Getters
  const recentDeliveries = computed(() => {
    return [...deliveryReceipts.value].sort((a, b) => new Date(b.date) - new Date(a.date))
  })

  const openIssuesCount = computed(() => {
    return deliveryIssues.value.filter(i => i.status !== 'Resolved').length
  })

  // Actions
  function createDelivery(data) {
    const salesStore = useSalesStore()
    const billingStore = useBillingStore()

    const drNum = `DR #${nextDrSeq.value++}`
    const isReplacement = Boolean(data.isReplacement)

    // Calculate subtotal
    let subtotal = 0
    const items = data.items.map(item => {
      const lineTotal = isReplacement ? 0 : (item.quantity * item.unitPrice)
      subtotal += lineTotal
      return {
        ...item,
        amount: lineTotal
      }
    })

    const newDr = {
      id: 'dr-' + (deliveryReceipts.value.length + 1),
      drNumber: drNum,
      date: data.date,
      poId: data.poId,
      poNumber: data.poNumber,
      customerId: data.customerId,
      customerName: data.customerName,
      project: data.project,
      tripId: data.tripId || null,
      isReplacement,
      originalDrNumber: data.originalDrNumber || null,
      replacementReason: data.replacementReason || null,
      status: isReplacement ? 'Replacement' : 'Delivered',
      items,
      subtotal,
      preparedBy: data.preparedBy || 'Admin Staff',
      deliveredBy: data.deliveredBy || 'Pedro Cruz (Driver)',
      receivedBy: data.receivedBy || 'Pending Signature'
    }

    deliveryReceipts.value.unshift(newDr)

    // Critical: only non-replacements fulfill PO quantities
    if (!isReplacement && data.poId) {
      salesStore.recordDeliveryToPO(data.poId, data.items)
      
      // Auto-generate Statement of Account for this delivery
      billingStore.generateSOAFromDR(newDr)
    }

    return newDr
  }

  function createDeliveryTrip(tripData) {
    const expenseStore = useExpenseStore()
    const tripNum = `TRIP-2026-00${deliveryTrips.value.length + 93}`
    
    const newTrip = {
      id: 'trip-' + (deliveryTrips.value.length + 1),
      tripNumber: tripNum,
      date: tripData.date,
      vehicle: tripData.vehicle,
      driver: tripData.driver,
      assistant: tripData.assistant || '',
      drNumbers: tripData.drNumbers || [],
      destinations: tripData.destinations || [],
      gasExpense: Number(tripData.gasExpense) || 0,
      tollExpense: Number(tripData.tollExpense) || 0,
      otherExpense: Number(tripData.otherExpense) || 0,
      notes: tripData.notes || ''
    }

    deliveryTrips.value.unshift(newTrip)

    // Automatic general business expense generation from operational trip
    if (newTrip.gasExpense > 0) {
      expenseStore.addExpense({
        category: 'Transportation',
        subCategory: 'Gas/Fuel',
        description: `Trip Fuel: ${newTrip.tripNumber} (${newTrip.vehicle})`,
        amount: newTrip.gasExpense,
        date: newTrip.date,
        supplier: 'Shell Gas Station',
        paymentMethod: 'Cash',
        sourceType: 'DELIVERY_TRIP',
        referenceId: newTrip.tripNumber,
        notes: `Auto-generated from Delivery Trip ${newTrip.tripNumber}`
      })
    }

    if (newTrip.tollExpense > 0) {
      expenseStore.addExpense({
        category: 'Transportation',
        subCategory: 'Toll',
        description: `Trip Toll: ${newTrip.tripNumber}`,
        amount: newTrip.tollExpense,
        date: newTrip.date,
        supplier: 'Expressway Tollway',
        paymentMethod: 'Cash',
        sourceType: 'DELIVERY_TRIP',
        referenceId: newTrip.tripNumber,
        notes: `Auto-generated from Delivery Trip ${newTrip.tripNumber}`
      })
    }

    return newTrip
  }

  function reportDeliveryDamage(issueData) {
    const newIssue = {
      id: 'issue-' + (deliveryIssues.value.length + 1),
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
    const issue = deliveryIssues.value.find(i => i.id === issueId)
    if (issue) {
      issue.status = 'Resolved'
      issue.replacementDrNumber = replacementDr.drNumber
      issue.resolvedDate = replacementDr.date
    }
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

