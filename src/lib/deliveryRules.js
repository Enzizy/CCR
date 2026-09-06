// Warranty replacements move goods, but never fulfill or bill the PO again.
export function prepareDelivery(data, receipts) {
  const isReplacement = data.isReplacement === true || data.isReplacement === 1
  const original = isReplacement ? receipts.find(dr => dr.drNumber === data.originalDrNumber && !dr.isReplacement) : null
  if (isReplacement && !original) throw new Error('Select the original billable delivery for this replacement.')
  if (!data.items?.length) throw new Error('Add at least one delivered item.')
  const items = data.items.map(item => {
    let source
    const quantity = Number(item.quantity)
    if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Delivery quantities must be greater than zero.')
    if (isReplacement) {
      source = original.items.find(line => item.productId ? line.productId === item.productId : (line.name || line.productName) === (item.name || item.productName))
      if (!source || quantity > Number(source.quantity)) throw new Error('Replacement quantities must belong to the original delivery.')
    }
    const unitPrice = isReplacement ? 0 : Number(item.unitPrice || 0)
    if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error('Unit price must be zero or greater.')
    return { ...item, name: item.name || item.productName || source?.name || source?.productName, quantity, unitPrice, amount: quantity * unitPrice }
  })
  return {
    ...data, isReplacement, items,
    poId: original?.poId || data.poId,
    customerName: original?.customerName || data.customerName,
    subtotal: items.reduce((sum, item) => sum + item.amount, 0),
  }
}

export function applyDeliveryToItems(items, delivery) {
  if (delivery.isReplacement) return items.map(item => ({ ...item }))
  return items.map(item => {
    const quantity = (delivery.items || []).filter(line => line.productId === item.productId).reduce((sum, line) => sum + Number(line.quantity || 0), 0)
    if (!Number.isFinite(quantity) || quantity < 0) throw new Error('Invalid delivered quantity.')
    const deliveredQty = Number(item.deliveredQty || 0) + quantity
    if (deliveredQty > Number(item.orderedQty)) throw new Error('Delivery exceeds the remaining customer PO quantity.')
    return { ...item, deliveredQty }
  })
}
