import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSalesStore = defineStore('sales', () => {
  const customers = ref([])
  const products = ref([])
  const purchaseOrders = ref([])

  const enrichedPurchaseOrders = computed(() => {
    return purchaseOrders.value.map(po => {
      let totalAmount = 0
      let totalOrdered = 0
      let totalDelivered = 0

      const enrichedItems = po.items.map(item => {
        const itemTotal = item.orderedQty * item.unitPrice
        const remainingQty = Math.max(0, item.orderedQty - item.deliveredQty)
        totalAmount += itemTotal
        totalOrdered += item.orderedQty
        totalDelivered += item.deliveredQty

        return {
          ...item,
          remainingQty,
          itemTotal,
          percentDelivered: Math.min(100, Math.round((item.deliveredQty / item.orderedQty) * 100))
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
        status
      }
    })
  })

  const customerMap = computed(() => new Map(customers.value.map(customer => [customer.id, customer])))
  const productMap = computed(() => new Map(products.value.map(product => [product.id, product])))

  function addCustomer(customer) {
    const id = `cust-${customers.value.length + 1}`
    customers.value.push({ id, ...customer })
    return id
  }

  function addProduct(product) {
    const id = `prod-${products.value.length + 1}`
    products.value.push({ id, ...product, active: true })
    return id
  }

  function addPurchaseOrder(po) {
    const id = `po-${purchaseOrders.value.length + 1}`
    purchaseOrders.value.unshift({ id, ...po })
    return id
  }

  function recordDeliveryToPO(poId, deliveredItems) {
    const po = purchaseOrders.value.find(purchaseOrder => purchaseOrder.id === poId)
    if (!po) return false

    deliveredItems.forEach(deliveredItem => {
      const item = po.items.find(poItem => poItem.productId === deliveredItem.productId)
      if (item) item.deliveredQty = Math.min(item.orderedQty, item.deliveredQty + deliveredItem.quantity)
    })
    return true
  }

  return {
    customers,
    products,
    purchaseOrders,
    enrichedPurchaseOrders,
    customerMap,
    productMap,
    addCustomer,
    addProduct,
    addPurchaseOrder,
    recordDeliveryToPO
  }
})
