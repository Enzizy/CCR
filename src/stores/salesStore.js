import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSalesStore = defineStore('sales', () => {
  // Customers
  const customers = ref([
    {
      id: 'cust-1',
      name: 'CEBU LANDMASTERS, INC.',
      shortName: 'CLI',
      address: '10th Floor Park Centrale Tower Jose Ma Del Mar St. B2 L3, Cebu IT Park Apas 6000 Cebu City (Capital) Cebu Philippines',
      contactPerson: 'Engr. Roberto Santos',
      phone: '+63 32 231 4500',
      email: 'procurement@cebulandmaster.ph',
      tin: '005-412-890-000',
      paymentTerms: '30 days upon delivery on site',
      notes: 'Key developer account. Requires delivery receipts stamped by on-site warehouse engineer.'
    },
    {
      id: 'cust-2',
      name: 'Shalom Constructions Inc.',
      shortName: 'Shalom',
      address: 'Subangdaku, Mandaue City, Cebu',
      contactPerson: 'Arch. David Lim',
      phone: '+63 32 344 8920',
      email: 'supplies@shalomconstructions.com',
      tin: '007-889-123-000',
      paymentTerms: '30 Days upon delivery',
      notes: 'Payment release on 15th and 30th of the month. Site contact: Foreman Tony.'
    }
  ])

  // Products
  const products = ref([
    {
      id: 'prod-1',
      sku: 'WSP-090210',
      name: 'Door, Wooden Solid Panel 0.90x2.10 m. w/ Jamb Door',
      description: 'Solid mahogany wood panel door complete with matching treated jamb, sanded finish.',
      unit: 'set',
      defaultPrice: 6800,
      active: true
    },
    {
      id: 'prod-2',
      sku: 'HCF-070210',
      name: 'Hollow Core Flush 0.70 x 2.10 m. w/ Jamb',
      description: 'Standard residential hollow-core interior flush door with treated pine jamb.',
      unit: 'set',
      defaultPrice: 3500,
      active: true
    },
    {
      id: 'prod-3',
      sku: 'SCF-080210',
      name: 'Door, Solid Core Flush 0.80x2.10 m. w/ Heavy Jamb',
      description: 'Acoustic-rated solid core timber flush door with 2x4 kiln-dried jamb.',
      unit: 'set',
      defaultPrice: 4900,
      active: true
    }
  ])

  // Purchase Orders
  const purchaseOrders = ref([
    {
      id: 'po-1',
      poNumber: '4100017940',
      customerId: 'cust-1',
      customerName: 'CEBU LANDMASTERS, INC.',
      date: '2026-07-13',
      paymentTerms: '30 days upon delivery on site',
      project: 'CASA MIRA SOUTH',
      notes: 'Initial production batch for residential doors',
      items: [
        {
          productId: 'prod-1',
          productName: 'Door, Wooden Solid Panel 0.90x2.10 m. w/ Jamb',
          orderedQty: 100,
          deliveredQty: 75, // Delivery 1 (50) + Delivery 2 (25)
          unitPrice: 5200,
          unit: 'sets'
        },
        {
          productId: 'prod-2',
          productName: 'Door, Hollow Core Flush 0.70 x 2.10 m. w/ Jamb',
          orderedQty: 150,
          deliveredQty: 113, // Delivery 1 (73) + Delivery 2 (40)
          unitPrice: 3200,
          unit: 'sets'
        }
      ]
    },
    {
      id: 'po-2',
      poNumber: 'PO-SCI-2026-092',
      customerId: 'cust-2',
      customerName: 'Shalom Constructions Inc.',
      date: '2026-08-28',
      paymentTerms: '30 Days upon delivery',
      project: 'Villa Maria Subdivision Phase 1',
      notes: 'Model house and block 1 cluster doors',
      items: [
        {
          productId: 'prod-3',
          productName: 'Door, Solid Core Flush 0.80x2.10 m. w/ Heavy Jamb',
          orderedQty: 60,
          deliveredQty: 30,
          unitPrice: 4900,
          unit: 'set'
        },
        {
          productId: 'prod-2',
          productName: 'Hollow Core Flush 0.70 x 2.10 m. w/ Jamb',
          orderedQty: 80,
          deliveredQty: 40,
          unitPrice: 3500,
          unit: 'set'
        }
      ]
    },
    {
      id: 'po-3',
      poNumber: 'PO-CLI-2026-098',
      customerId: 'cust-1',
      customerName: 'Cebu Landmaster Inc.',
      date: '2026-09-01',
      paymentTerms: '30 Days upon delivery',
      project: 'Citadines Suite Commercial Units',
      notes: 'Urgent release requested by mid September',
      items: [
        {
          productId: 'prod-1',
          productName: 'Door, Wooden Solid Panel 0.90x2.10 m. w/ Jamb Door',
          orderedQty: 40,
          deliveredQty: 0,
          unitPrice: 6800,
          unit: 'set'
        }
      ]
    }
  ])

  // Getters with deterministic calculation
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
      if (totalDelivered === 0) {
        status = 'Open'
      } else if (totalDelivered >= totalOrdered) {
        status = 'Completed'
      } else {
        status = 'Partially Delivered'
      }

      return {
        ...po,
        items: enrichedItems,
        totalAmount,
        totalOrdered,
        totalDelivered,
        totalRemaining: Math.max(0, totalOrdered - totalDelivered),
        fulfillmentPercent: Math.min(100, Math.round((totalDelivered / totalOrdered) * 100)),
        status
      }
    })
  })

  // Customer map
  const customerMap = computed(() => {
    return new Map(customers.value.map(c => [c.id, c]))
  })

  // Product map
  const productMap = computed(() => {
    return new Map(products.value.map(p => [p.id, p]))
  })

  // Actions
  function addCustomer(customer) {
    const id = 'cust-' + (customers.value.length + 1)
    customers.value.push({ id, ...customer })
    return id
  }

  function addProduct(product) {
    const id = 'prod-' + (products.value.length + 1)
    products.value.push({ id, ...product, active: true })
    return id
  }

  function addPurchaseOrder(po) {
    const id = 'po-' + (purchaseOrders.value.length + 1)
    purchaseOrders.value.unshift({ id, ...po })
    return id
  }

  function recordDeliveryToPO(poId, deliveredItems) {
    const po = purchaseOrders.value.find(p => p.id === poId)
    if (!po) return false

    deliveredItems.forEach(delItem => {
      const item = po.items.find(i => i.productId === delItem.productId)
      if (item) {
        // Record only valid non-replacement delivery quantity
        item.deliveredQty = Math.min(item.orderedQty, item.deliveredQty + delItem.quantity)
      }
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

