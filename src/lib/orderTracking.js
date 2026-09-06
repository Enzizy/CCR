export const isOpenIssue = issue => !['Replaced', 'Resolved', 'Closed'].includes(issue.status)

export function statementDetails(statement, deliveries, orders) {
  const receipts = deliveries.filter(dr => !dr.isReplacement && (statement.drNumbers || []).includes(dr.drNumber))
  const po = orders.find(order => order.id === statement.poId) || orders.find(order => receipts.some(dr => dr.poId === order.id))
  return {
    ...statement,
    poNumber: statement.poNumber || po?.poNumber,
    poDate: statement.poDate || po?.date,
    project: statement.project || po?.project,
    paymentTerms: statement.paymentTerms || po?.paymentTerms,
    items: statement.items?.length ? statement.items : receipts.flatMap(dr => {
      const order = orders.find(order => order.id === dr.poId)
      return (dr.items || []).map(item => ({ ...item, drNumber: dr.drNumber, poNumber: order?.poNumber, poDate: order?.date }))
    }),
  }
}

export function trackOrder(po, deliveries, statements, payments, issues) {
  const receipts = deliveries.filter(dr => dr.poId === po.id)
  const billable = receipts.filter(dr => !dr.isReplacement)
  const numbers = new Set(billable.map(dr => dr.drNumber))
  const soas = statements.filter(soa => soa.poId === po.id || (soa.drNumbers || []).some(number => numbers.has(number)))
  const soaIds = new Set(soas.map(soa => soa.id))
  const soaNumbers = new Set(soas.map(soa => soa.soaNumber))
  const collections = payments.filter(payment => soaIds.has(payment.soaId) || soaNumbers.has(payment.soaNumber))
  const billedNumbers = new Set(soas.flatMap(soa => soa.drNumbers || []))
  const unbilled = billable.filter(dr => !billedNumbers.has(dr.drNumber))
  return {
    ...po, receipts, soas, collections, unbilled,
    replacementQuantity: receipts.filter(dr => dr.isReplacement).reduce((sum, dr) => sum + (dr.items || []).reduce((qty, item) => qty + Number(item.quantity || 0), 0), 0),
    billed: soas.reduce((sum, soa) => sum + Number(soa.totalAmount || 0), 0),
    paid: soas.reduce((sum, soa) => sum + Number(soa.paidAmount || 0), 0),
    balance: soas.reduce((sum, soa) => sum + Math.max(0, Number(soa.balance || 0)), 0),
    remainingValue: po.items.reduce((sum, item) => sum + Number(item.remainingQty || 0) * Number(item.unitPrice || 0), 0),
    openIssues: issues.filter(issue => issue.poId === po.id && isOpenIssue(issue)),
  }
}
