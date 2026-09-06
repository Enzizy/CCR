<template>
  <div class="soa-document print-container">
    <article class="soa-sheet" aria-label="Statement of Account">
      <header class="soa-header">
        <div class="company-block">
          <div class="company-identity">
            <img class="company-logo" :src="ccrLogo" alt="CCR Construction Supply logo">
            <div>
              <h1>{{ company.name.toUpperCase() }}</h1>
              <p>{{ company.address }}</p>
            </div>
          </div>
          <p class="company-phone">Cellphone No.: {{ company.phone }}</p>
        </div>

        <dl class="statement-meta">
          <div>
            <dt>Statement Date:</dt>
            <dd>{{ statementDateFormatted }}</dd>
          </div>
          <div>
            <dt>SOA No. :</dt>
            <dd>{{ statement.soaNumber || '—' }}</dd>
          </div>
        </dl>
      </header>

      <section class="customer-block">
        <h2>STATEMENT OF ACCOUNT</h2>
        <p class="customer-name">{{ statement.customerName || '—' }}</p>
        <p class="customer-address">{{ customerAddress }}</p>
      </section>

      <section class="ledger-section">
        <table class="soa-ledger">
          <colgroup>
            <col class="col-po-date">
            <col class="col-po-number">
            <col class="col-delivery">
            <col class="col-quantity">
            <col class="col-description">
            <col class="col-unit">
            <col class="col-cost">
            <col class="col-amount">
          </colgroup>
          <thead>
            <tr>
              <th>PO DATE<br>ISSUED</th>
              <th>CUSTOMER<br>PO NOS.</th>
              <th>DELIVERY<br>NOS.</th>
              <th>TOTAL QTY<br>DELIVERED</th>
              <th>ITEM DESCRIPTION</th>
              <th>UNIT</th>
              <th>UNIT COST</th>
              <th>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in statement.items || []" :key="index">
              <td class="center">{{ formatShortDate(item.poDate || statement.poDate) }}</td>
              <td class="center">{{ item.poNumber || statement.poNumber || '—' }}</td>
              <td class="center">{{ item.drNumber || deliveryNumber }}</td>
              <td class="center">{{ formatNumber(item.quantity) }}</td>
              <td class="description">{{ item.name || item.productName || '—' }}</td>
              <td class="center">{{ item.unit || 'set' }}</td>
              <td class="number">{{ formatNumber(item.unitPrice) }}</td>
              <td class="number">{{ formatNumber(lineAmount(item)) }}</td>
            </tr>

            <tr v-if="statement.project">
              <td></td><td></td><td></td><td></td>
              <td class="project-name">{{ statement.project }}</td>
              <td></td><td></td><td class="number">-</td>
            </tr>

            <tr class="nothing-follows">
              <td></td><td></td><td></td><td></td>
              <td>*** nothing follows ***</td>
              <td></td><td></td><td class="number">-</td>
            </tr>

            <tr v-for="row in blankRowCount" :key="`blank-${row}`" class="blank-row" aria-hidden="true">
              <td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td class="number">-</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td></td>
              <td colspan="3" class="total-spacer"></td>
              <td colspan="3" class="total-label">TOTAL AMOUNT&nbsp; ----&gt;</td>
              <td class="total-value">{{ formatNumber(statement.totalAmount) }}</td>
            </tr>
          </tfoot>
        </table>

        <p class="payment-terms"><span>Payment Terms:</span> {{ statement.paymentTerms || '30 days upon delivery on site' }}</p>
      </section>

      <section class="payment-instructions">
        <p>*For check payments, please make the check payable to <strong>{{ company.bankAccountName }}</strong></p>
        <p>*For online transfers, kindly use the following banking information:</p>
        <dl>
          <div><dt>Bank:</dt><dd><strong>{{ company.bankName }}</strong></dd></div>
          <div><dt>Account Holder:</dt><dd><strong>{{ company.bankAccountName }}</strong></dd></div>
          <div><dt>Account Number:</dt><dd><strong>{{ company.bankAccountNumber }}</strong></dd></div>
        </dl>
      </section>

      <footer class="signature-section">
        <div class="prepared-signature">
          <div class="signature-writing" aria-hidden="true">Rodil</div>
          <div class="signature-line"><span>RODIL B. VERGARA</span></div>
          <p>PREPARED BY:</p>
        </div>
        <div class="confirmed-signature">
          <div class="signature-line"></div>
          <p>CONFIRMED BY:</p>
        </div>
      </footer>
    </article>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ccrLogo from '@/assets/ccr-logo.png'
import { useSettingsStore } from '@/stores/settingsStore'

const settingsStore = useSettingsStore()
const company = computed(() => settingsStore.company)

const props = defineProps({
  statement: {
    type: Object,
    required: true
  },
  customer: {
    type: Object,
    default: null
  }
})

const customerAddress = computed(() => props.customer?.address || '—')

const statementDateFormatted = computed(() => formatShortDate(props.statement.date))

const deliveryNumber = computed(() => {
  if (!props.statement.drNumber) return '—'
  return String(props.statement.drNumber).replace(/^DR\s*#?\s*/i, '')
})

const blankRowCount = computed(() => {
  const itemRows = props.statement.items?.length || 0
  const projectRows = props.statement.project ? 1 : 0
  return Math.max(0, 11 - itemRows - projectRows - 1)
})

function formatShortDate(value) {
  if (!value) return '—'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]
  return `${date.getDate()}-${month}-${String(date.getFullYear()).slice(-2)}`
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-PH', { maximumFractionDigits: 2 })
}

function lineAmount(item) {
  return item.amount ?? (Number(item.quantity || 0) * Number(item.unitPrice || 0))
}
</script>

<style scoped>
.soa-document {
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;
  background: #fff;
  color: #000;
  box-shadow: 0 2px 14px rgb(15 23 42 / 12%);
}

.soa-sheet {
  box-sizing: border-box;
  width: 210mm;
  min-height: 297mm;
  padding: 20mm 16mm 14mm;
  background: #fff;
  color: #000;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 9pt;
  line-height: 1.25;
}

.soa-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.company-block { width: 105mm; }
.company-identity { display: flex; align-items: center; gap: 4mm; }

.company-logo {
  display: block;
  width: 18mm;
  height: 18mm;
  flex: 0 0 18mm;
  object-fit: contain;
}

.company-identity h1 { margin: 0; font-size: 11pt; font-style: italic; font-weight: 800; }
.company-identity p { margin: 1.5mm 0 0; font-size: 8pt; }
.company-phone { margin: 2.2mm 0 0 0.8mm; font-size: 8.5pt; }

.statement-meta { width: 38mm; margin: 4mm 0 0; font-size: 8.5pt; }
.statement-meta div { display: grid; grid-template-columns: 23mm 1fr; margin-bottom: 1.2mm; }
.statement-meta dt, .statement-meta dd { margin: 0; }
.statement-meta dd { font-weight: 700; white-space: nowrap; }

.customer-block { margin-top: 11mm; text-align: center; }
.customer-block h2 { margin: 0; font-size: 13pt; font-weight: 700; }
.customer-name { margin: 1.5mm 0 0; font-size: 9pt; }
.customer-address { max-width: 100mm; margin: 1mm auto 0; font-size: 8.5pt; line-height: 1.35; }

.ledger-section { margin-top: 10mm; }
.soa-ledger { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 7.8pt; }
.soa-ledger th, .soa-ledger td { border: 0.25mm solid #000; }
.soa-ledger th { height: 8.5mm; padding: 0.8mm; background: #a8d08d; font-size: 7.5pt; line-height: 1.15; text-align: center; }
.soa-ledger tbody td { box-sizing: border-box; height: 4.35mm; padding: 0.45mm 1.2mm; vertical-align: middle; }
.soa-ledger .center { text-align: center; }
.soa-ledger .number { padding-right: 1.5mm; text-align: right; }
.soa-ledger .description { padding-left: 2mm; white-space: normal; overflow-wrap: anywhere; }
.soa-ledger .project-name { font-weight: 700; text-align: center; text-transform: uppercase; }
.soa-ledger .nothing-follows td:nth-child(5) { font-size: 7pt; font-style: italic; font-weight: 700; text-align: center; }
.soa-ledger tfoot td { height: 6.5mm; }
.soa-ledger .total-spacer { border-right: 0; }
.soa-ledger .total-label, .soa-ledger .total-value { border-left: 0; background: #c6e0b4; font-weight: 700; }
.soa-ledger .total-label { padding-right: 2mm; text-align: right; }
.soa-ledger .total-value { padding-right: 1.5mm; text-align: right; }

.col-po-date { width: 10%; }
.col-po-number { width: 12.5%; }
.col-delivery { width: 8%; }
.col-quantity { width: 9%; }
.col-description { width: 34.5%; }
.col-unit { width: 5%; }
.col-cost { width: 11%; }
.col-amount { width: 10%; }

.payment-terms { margin: 1.2mm 0 0 0.6mm; font-size: 8.5pt; }
.payment-terms span { margin-right: 2mm; }
.payment-instructions { margin: 6mm 0 0 0.6mm; font-size: 8.5pt; line-height: 1.4; }
.payment-instructions p { margin: 0; }
.payment-instructions dl { margin: 1mm 0 0 3mm; }
.payment-instructions dl div { display: flex; gap: 1mm; }
.payment-instructions dt, .payment-instructions dd { margin: 0; }

.signature-section { display: flex; justify-content: space-between; margin-top: 12mm; padding: 0 0.5mm; font-size: 8pt; }
.prepared-signature, .confirmed-signature { position: relative; width: 45mm; }
.confirmed-signature { margin-top: 40mm; }
.signature-line { position: relative; height: 10mm; border-bottom: 0.7mm solid #000; text-align: center; }
.signature-line span { position: absolute; right: 0; bottom: 0.3mm; left: 0; }
.signature-writing { position: absolute; z-index: 1; bottom: 4mm; left: 13mm; transform: rotate(-8deg); font-family: "Brush Script MT", "Segoe Script", cursive; font-size: 20pt; }
.signature-section p { margin: 1mm 0 0 0.5mm; }

@media (max-width: 900px) {
  .soa-document { transform-origin: top left; }
}

@media print {
  .soa-document { width: auto; max-width: none; margin: 0; box-shadow: none; }
  .soa-sheet { width: 180mm; min-height: 273mm; padding: 8mm 0 0; }
}
</style>
