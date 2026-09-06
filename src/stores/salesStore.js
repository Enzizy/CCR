import { defineStore } from 'pinia'
import { applyDeliveryToItems } from '@/lib/deliveryRules'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const useSalesStore = defineStore('sales', () => {
  const customers = ref([])
  const products = ref([])
  const purchaseOrders = ref([])
  const isLoading = ref(false)

  const enrichedPurchaseOrders = computed(() => {
    return purchaseOrders.value.map(po => {
      let totalAmount = 0
      let totalOrdered = 0
      let totalDelivered = 0

      const enrichedItems = (po.items || []).map(item => {
        const itemTotal = Number(item.orderedQty || 0) * Number(item.unitPrice || 0)
        const remainingQty = Math.max(0, Number(item.orderedQty || 0) - Number(item.deliveredQty || 0))
        totalAmount += itemTotal
        totalOrdered += Number(item.orderedQty || 0)
        totalDelivered += Number(item.deliveredQty || 0)

        return {
          ...item,
          remainingQty,
          itemTotal,
          percentDelivered: Number(item.orderedQty) > 0 ? Math.min(100, Math.round((Number(item.deliveredQty || 0) / Number(item.orderedQty)) * 100)) : 0
        }
      })

      let status = 'Open'
      if (totalDelivered >= totalOrdered && totalOrdered > 0) status = 'Completed'
      else if (totalDelivered > 0) status = 'Partially Delivered'

      return {
        ...po,
        items: enrichedItems,
        totalAmount,
        totalOrdered,
        totalDelivered,
        totalRemaining: Math.max(0, totalOrdered - totalDelivered),
        fulfillmentPercent: totalOrdered > 0 ? Math.min(100, Math.round((totalDelivered / totalOrdered) * 100)) : 0,
        status: ['Cancelled', 'Closed'].includes(po.status) ? po.status : status
      }
    })
  })

  const customerMap = computed(() => new Map(customers.value.map(customer => [customer.id, customer])))
  const productMap = computed(() => new Map(products.value.map(product => [product.id, product])))

  async function fetchAll() {
    isLoading.value = true
    try {
      if (isSupabaseConfigured) {
        const [custRes, prodRes, poRes] = await Promise.all([
          supabase.from('customers').select('*').order('name', { ascending: true }),
          supabase.from('products').select('*').order('name', { ascending: true }),
          supabase.from('purchase_orders').select('*').order('created_at', { ascending: false })
        ])

        if (custRes.data) {
          customers.value = custRes.data.map(r => ({
            ...r,
            shortName: r.short_name,
            contactPerson: r.contact_person,
            paymentTerms: r.payment_terms
          }))
        }
        if (prodRes.data) {
          products.value = prodRes.data.map(r => ({
            ...r,
            defaultPrice: Number(r.default_price || 0),
            active: Boolean(r.active)
          }))
        }
        if (poRes.data) {
          purchaseOrders.value = poRes.data.map(r => ({
            ...r,
            poNumber: r.po_number,
            customerId: r.customer_id,
            customerName: r.customer_name,
            paymentTerms: r.payment_terms,
            items: Array.isArray(r.items) ? r.items : (typeof r.items === 'string' ? JSON.parse(r.items || '[]') : [])
          }))
        }
        return
      }

      const [custRes, prodRes, poRes] = await Promise.all([
        fetch('/api/customers').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/purchase-orders').then(r => r.json())
      ])
      customers.value = custRes || []
      products.value = prodRes || []
      purchaseOrders.value = poRes || []
    } catch (err) {
      console.error('Failed to fetch sales data:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Auto-fetch on store initialization
  fetchAll()

  async function addCustomer(customer) {
    if (isSupabaseConfigured) {
      try {
        const id = `cust-${Date.now()}`
        const payload = {
          id,
          name: customer.name,
          short_name: customer.shortName || customer.short_name || '',
          address: customer.address || '',
          contact_person: customer.contactPerson || customer.contact_person || '',
          phone: customer.phone || '',
          email: customer.email || '',
          payment_terms: customer.paymentTerms || customer.payment_terms || '30 Days upon delivery',
          notes: customer.notes || ''
        }
        const { data, error } = await supabase.from('customers').insert(payload).select().single()
        if (error) throw error
        const saved = { ...customer, id: data.id }
        customers.value.push(saved)
        return saved.id
      } catch (e) {
        console.error('Supabase customer insert failed, falling back:', e)
      }
    }

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      })
      const saved = await res.json()
      customers.value.push(saved)
      return saved.id
    } catch (e) {
      const id = `cust-${customers.value.length + 1}`
      customers.value.push({ id, ...customer })
      return id
    }
  }

  async function addProduct(product) {
    if (isSupabaseConfigured) {
      try {
        const id = `prod-${Date.now()}`
        const payload = {
          id,
          sku: product.sku || `SKU-${Date.now()}`,
          name: product.name,
          description: product.description || '',
          unit: product.unit || 'set',
          default_price: Number(product.defaultPrice || product.default_price || 0),
          active: product.active !== false
        }
        const { data, error } = await supabase.from('products').insert(payload).select().single()
        if (error) throw error
        const saved = { ...product, id: data.id, defaultPrice: Number(data.default_price), active: data.active }
        products.value.push(saved)
        return saved.id
      } catch (e) {
        console.error('Supabase product insert failed, falling back:', e)
      }
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      })
      const saved = await res.json()
      products.value.push(saved)
      return saved.id
    } catch (e) {
      const id = `prod-${products.value.length + 1}`
      products.value.push({ id, ...product, active: true })
      return id
    }
  }

  async function addPurchaseOrder(po) {
    if (isSupabaseConfigured) {
      try {
        const id = `po-${Date.now()}`
        const payload = {
          id,
          po_number: po.poNumber || po.po_number,
          customer_id: po.customerId || po.customer_id,
          customer_name: po.customerName || po.customer_name,
          date: po.date || new Date().toISOString().split('T')[0],
          payment_terms: po.paymentTerms || po.payment_terms || '30 Days upon delivery',
          project: po.project || '',
          status: po.status || 'Open',
          items: po.items || []
        }
        const { data, error } = await supabase.from('purchase_orders').insert(payload).select().single()
        if (error) throw error
        const saved = { ...po, id: data.id }
        purchaseOrders.value.unshift(saved)
        return saved.id
      } catch (e) {
        console.error('Supabase PO insert failed, falling back:', e)
      }
    }

    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(po)
      })
      const saved = await res.json()
      purchaseOrders.value.unshift(saved)
      return saved.id
    } catch (e) {
      const id = `po-${purchaseOrders.value.length + 1}`
      purchaseOrders.value.unshift({ id, ...po })
      return id
    }
  }

  async function recordDeliveryToPO(poId, deliveredItems, isReplacement = false) {
    if (isReplacement) return true
    const po = purchaseOrders.value.find(purchaseOrder => purchaseOrder.id === poId)
    if (!po) return false

    po.items = applyDeliveryToItems(po.items, { items: deliveredItems, isReplacement })

    if (isSupabaseConfigured) {
      try {
        await supabase.from('purchase_orders').update({
          items: po.items,
          status: po.status
        }).eq('id', poId)
        return true
      } catch (e) {
        console.warn('Supabase PO delivery update failed, falling back:', e)
      }
    }

    try {
      await fetch(`/api/purchase-orders/${poId}/deliveries`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveredItems })
      })
    } catch (e) {
      console.warn('Backend sync failed, updated locally', e)
    }
    return true
  }

  return {
    customers,
    products,
    purchaseOrders,
    enrichedPurchaseOrders,
    customerMap,
    productMap,
    isLoading,
    fetchAll,
    addCustomer,
    addProduct,
    addPurchaseOrder,
    recordDeliveryToPO
  }
})
