import { defineStore } from 'pinia'
import { prepareDelivery, applyDeliveryToItems } from '@/lib/deliveryRules'
import { ref, computed } from 'vue'
import { useSalesStore } from './salesStore'
import { useExpenseStore } from './expenseStore'
import { useBillingStore } from './billingStore'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const useDeliveryStore = defineStore('delivery', () => {
  const nextDrSeq = ref(1)
  const deliveryReceipts = ref([])
  const deliveryTrips = ref([])
  const deliveryIssues = ref([])
  const isLoading = ref(false)

  const recentDeliveries = computed(() => [...deliveryReceipts.value].sort((a, b) => new Date(b.date) - new Date(a.date)))
  const openIssuesCount = computed(() => deliveryIssues.value.filter(issue => !['Replaced', 'Resolved', 'Closed'].includes(issue.status)).length)

  async function fetchAll() {
    isLoading.value = true
    try {
      if (isSupabaseConfigured) {
        const [drRes, tripRes, issueRes] = await Promise.all([
          supabase.from('delivery_receipts').select('*').order('date', { ascending: false }),
          supabase.from('delivery_trips').select('*').order('date', { ascending: false }),
          supabase.from('delivery_issues').select('*').order('date', { ascending: false })
        ])

        if (drRes.data) {
          deliveryReceipts.value = drRes.data.map(r => {
            const items = Array.isArray(r.items) ? r.items : (typeof r.items === 'string' ? JSON.parse(r.items || '[]') : [])
            const isReplacement = Boolean(r.is_replacement)
            const subtotal = items.reduce((sum, it) => sum + (isReplacement ? 0 : Number(it.quantity || 0) * Number(it.unitPrice || 0)), 0)
            return {
              id: r.id,
              drNumber: r.dr_number,
              poId: r.po_id,
              customerName: r.customer_name,
              date: r.date,
              tripId: r.trip_id,
              deliveredBy: r.delivered_by,
              receivedBy: r.received_by,
              status: r.status,
              isReplacement,
              originalDrNumber: r.original_dr_number,
              notes: r.notes,
              items,
              subtotal
            }
          })
          if (drRes.data.length > 0) nextDrSeq.value = drRes.data.length + 1
        }

        if (tripRes.data) {
          deliveryTrips.value = tripRes.data.map(r => ({
            id: r.id,
            tripNumber: r.trip_number,
            driverName: r.driver_name,
            truckPlate: r.truck_plate,
            date: r.date,
            fuelExpense: Number(r.fuel_expense || 0),
            status: r.status,
            notes: r.notes,
            drNumbers: Array.isArray(r.dr_numbers) ? r.dr_numbers : (typeof r.dr_numbers === 'string' ? JSON.parse(r.dr_numbers || '[]') : [])
          }))
        }

        if (issueRes.data) {
          deliveryIssues.value = issueRes.data.map(r => ({
            id: r.id,
            issueNumber: r.issue_number,
            drNumber: r.dr_number,
            poId: r.po_id,
            customerId: r.customer_id,
            customerName: r.customer_name,
            productId: r.product_id,
            productName: r.product_name,
            quantity: Number(r.quantity || 1),
            unit: r.unit,
            reason: r.reason,
            status: r.status,
            replacementDrNumber: r.replacement_dr_number,
            date: r.date,
            notes: r.notes
          }))
        }
        return
      }

      const [drRes, tripRes, issueRes] = await Promise.all([
        fetch('/api/deliveries').then(r => r.json()),
        fetch('/api/delivery-trips').then(r => r.json()),
        fetch('/api/delivery-issues').then(r => r.json())
      ])
      deliveryReceipts.value = (drRes || []).map(dr => ({ ...dr, subtotal: dr.isReplacement ? 0 : (dr.items || []).reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0) }))
      deliveryTrips.value = tripRes || []
      deliveryIssues.value = issueRes || []
      if (drRes && drRes.length > 0) {
        nextDrSeq.value = drRes.length + 1
      }
    } catch (err) {
      console.error('Failed to fetch delivery data:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Auto-fetch on store initialization
  fetchAll()

  async function createDelivery(data) {
    data = prepareDelivery(data, deliveryReceipts.value)
    const salesStore = useSalesStore()
    const billingStore = useBillingStore()
    const isReplacement = Boolean(data.isReplacement)
    if (!isReplacement && data.poId) {
      const po = salesStore.purchaseOrders.find(po => po.id === data.poId)
      if (!po) throw new Error('Customer PO not found.')
      applyDeliveryToItems(po.items, data)
    }
    let subtotal = 0

    const items = (data.items || []).map(item => {
      const amount = isReplacement ? 0 : Number(item.quantity || 0) * Number(item.unitPrice || 0)
      subtotal += amount
      return { ...item, amount }
    })

    const drNumber = data.drNumber || `DR-${new Date().getFullYear()}-${String(deliveryReceipts.value.length + 1).padStart(3, '0')}`
    const drPayload = {
      id: `dr-${Date.now()}`,
      drNumber,
      date: data.date,
      poId: data.poId,
      poNumber: data.poNumber,
      customerName: data.customerName,
      tripId: data.tripId || null,
      deliveredBy: data.deliveredBy || 'CCR Logistics',
      receivedBy: data.receivedBy || 'Site Receiver',
      isReplacement,
      originalDrNumber: data.originalDrNumber || null,
      notes: data.notes || '',
      items,
      subtotal
    }

    if (isSupabaseConfigured) {
      try {
        const { data: savedDr, error: drErr } = await supabase.from('delivery_receipts').insert({
          id: drPayload.id,
          dr_number: drPayload.drNumber,
          po_id: drPayload.poId || null,
          customer_name: drPayload.customerName,
          date: drPayload.date,
          trip_id: drPayload.tripId || null,
          delivered_by: drPayload.deliveredBy,
          received_by: drPayload.receivedBy,
          status: 'Delivered',
          is_replacement: isReplacement,
          original_dr_number: drPayload.originalDrNumber,
          notes: drPayload.notes,
          items: drPayload.items
        }).select().single()

        if (drErr) throw drErr

        deliveryReceipts.value.unshift(drPayload)

        // If part of a delivery trip, update trip's dr_numbers
        if (data.tripId) {
          const trip = deliveryTrips.value.find(t => t.id === data.tripId)
          if (trip && !trip.drNumbers.includes(drNumber)) {
            trip.drNumbers.push(drNumber)
            await supabase.from('delivery_trips').update({ dr_numbers: trip.drNumbers }).eq('id', data.tripId)
          }
        }

        // If not replacement, update PO and generate SOA
        if (!isReplacement && data.poId) {
          await salesStore.recordDeliveryToPO(data.poId, items)

          if (subtotal > 0) {
            const po = salesStore.purchaseOrders.find(p => p.id === data.poId)
            const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            const soaNumber = `SOA-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
            const { error: soaError } = await supabase.from('statements_of_account').insert({
              id: `soa-${Date.now()}`,
              soa_number: soaNumber,
              customer_id: po?.customerId || null,
              customer_name: data.customerName,
              po_id: data.poId,
              date: data.date,
              due_date: dueDate,
              dr_numbers: [drNumber],
              total_amount: subtotal,
              paid_amount: 0,
              balance: subtotal,
              status: 'Pending Payment',
              notes: `Auto-generated from Delivery Receipt ${drNumber}`
            })
            if (soaError) throw soaError
          }
        }

        salesStore.fetchAll()
        billingStore.fetchAll()
        return drPayload
      } catch (e) {
        throw new Error('Could not finish saving the delivery. Review the DR and SOA records before retrying. ' + e.message)
      }
    }

    try {
      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(drPayload)
      })
      const saved = await res.json()
      if (!res.ok) throw new Error(saved.error || 'Could not save delivery.')
      deliveryReceipts.value.unshift(saved)

      if (saved.tripId) {
        const trip = deliveryTrips.value.find(item => item.id === saved.tripId)
        if (trip && !trip.drNumbers.includes(saved.drNumber)) {
          trip.drNumbers.push(saved.drNumber)
        }
      }

      salesStore.fetchAll()
      billingStore.fetchAll()
      return saved
    } catch (e) {
      throw e
    }
  }

  async function createDeliveryTrip(tripData) {
    const expenseStore = useExpenseStore()
    const tripYear = new Date(`${tripData.date}T00:00:00`).getFullYear()
    const tripNumber = `TRIP-${tripYear}-${String(deliveryTrips.value.length + 1).padStart(3, '0')}`
    const fuelExpense = Number(tripData.gasExpense || tripData.fuelExpense || 0)

    const payload = {
      id: `trip-${Date.now()}`,
      tripNumber,
      date: tripData.date,
      driverName: tripData.driver || tripData.driverName || 'Driver',
      truckPlate: tripData.vehicle || tripData.truckPlate || 'Vehicle',
      fuelExpense,
      drNumbers: tripData.drNumbers || [],
      notes: tripData.notes || ''
    }

    if (isSupabaseConfigured) {
      try {
        const { error: tripErr } = await supabase.from('delivery_trips').insert({
          id: payload.id,
          trip_number: payload.tripNumber,
          driver_name: payload.driverName,
          truck_plate: payload.truckPlate,
          date: payload.date,
          fuel_expense: payload.fuelExpense,
          status: 'Completed',
          notes: payload.notes,
          dr_numbers: payload.drNumbers
        })
        if (tripErr) throw tripErr

        // Automatically log gas expense if entered
        if (fuelExpense > 0) {
          await expenseStore.addExpense({
            category: 'Transportation',
            subCategory: 'Gas/Fuel',
            description: `Diesel for ${payload.truckPlate} (${payload.tripNumber})`,
            amount: fuelExpense,
            date: payload.date,
            supplier: 'Petron Barili Station',
            paymentMethod: 'Cash',
            sourceType: 'DELIVERY_TRIP',
            referenceId: payload.id,
            notes: 'Auto-logged from delivery trip dispatch'
          })
        }

        deliveryTrips.value.unshift(payload)
        expenseStore.fetchAll()
        return payload
      } catch (e) {
        console.error('Supabase trip creation failed, falling back:', e)
      }
    }

    try {
      const res = await fetch('/api/delivery-trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const saved = await res.json()
      deliveryTrips.value.unshift(saved)
      expenseStore.fetchAll()
      return saved
    } catch (e) {
      deliveryTrips.value.unshift(payload)
      return payload
    }
  }

  async function reportDeliveryDamage(issueData) {
    const payload = {
      id: `iss-${Date.now()}`,
      issueNumber: `ISS-${new Date().getFullYear()}-${String(deliveryIssues.value.length + 1).padStart(3, '0')}`,
      drNumber: issueData.originalDrNumber || issueData.drNumber,
      poId: issueData.poId || null,
      customerId: issueData.customerId || null,
      customerName: issueData.customerName || '',
      productId: issueData.productId || null,
      productName: issueData.productName || '',
      quantity: Number(issueData.quantityAffected || issueData.quantity || 1),
      unit: issueData.unit || 'set',
      reason: issueData.reason || 'Damaged during transit',
      date: issueData.dateReported || issueData.date || new Date().toISOString().split('T')[0],
      notes: issueData.notes || '',
      status: 'Pending Replacement'
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('delivery_issues').insert({
          id: payload.id,
          issue_number: payload.issueNumber,
          dr_number: payload.drNumber,
          po_id: payload.poId,
          customer_id: payload.customerId,
          customer_name: payload.customerName,
          product_id: payload.productId,
          product_name: payload.productName,
          quantity: payload.quantity,
          unit: payload.unit,
          reason: payload.reason,
          status: payload.status,
          date: payload.date,
          notes: payload.notes
        })
        if (error) throw error
        deliveryIssues.value.unshift(payload)
        return payload
      } catch (e) {
        console.error('Supabase issue report failed, falling back:', e)
      }
    }

    try {
      const res = await fetch('/api/delivery-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const saved = await res.json()
      deliveryIssues.value.unshift(saved)
      return saved
    } catch (e) {
      deliveryIssues.value.unshift(payload)
      return payload
    }
  }

  async function resolveIssueWithReplacement(issueId, replacementDr) {
    const issue = deliveryIssues.value.find(item => item.id === issueId)
    if (!issue || !replacementDr?.drNumber || !replacementDr.isReplacement || replacementDr.originalDrNumber !== issue.drNumber) {
      throw new Error('The replacement DR must match this damage report.')
    }
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('delivery_issues').update({
        status: 'Replaced', replacement_dr_number: replacementDr.drNumber
      }).eq('id', issueId).select('id').single()
      if (error) throw new Error('Replacement DR saved, but the damage report could not be updated. ' + error.message)
    } else {
      const response = await fetch(`/api/delivery-issues/${issueId}/replacement`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replacementDrNumber: replacementDr.drNumber })
      })
      if (!response.ok) throw new Error('Replacement DR saved, but the damage report could not be updated.')
    }
    issue.status = 'Replaced'
    issue.replacementDrNumber = replacementDr.drNumber
  }

  return {
    deliveryReceipts,
    deliveryTrips,
    deliveryIssues,
    nextDrSeq,
    recentDeliveries,
    openIssuesCount,
    isLoading,
    fetchAll,
    createDelivery,
    createDeliveryTrip,
    reportDeliveryDamage,
    resolveIssueWithReplacement
  }
})
