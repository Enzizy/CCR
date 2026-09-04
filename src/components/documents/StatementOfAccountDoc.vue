<template>
  <div class="print-container bg-white text-black max-w-4xl mx-auto p-8 border border-slate-300 rounded-lg shadow-sm print:border-none print:shadow-none print:p-0 font-sans">
    <!-- Top Header: Logo, Company Name & Metadata -->
    <div class="flex justify-between items-start mb-6">
      <!-- Logo and Company Details -->
      <div class="flex items-start gap-3">
        <!-- Seal/Logo Graphic -->
        <div class="w-14 h-14 rounded-full border-2 border-[#5c8b3e] bg-[#f5f9f2] flex items-center justify-center shrink-0 p-1">
          <div class="w-full h-full rounded-full border border-[#9ec37f] bg-white flex flex-col items-center justify-center text-center">
            <span class="text-[8px] font-black text-[#2c431d] uppercase tracking-tighter leading-none">CCR</span>
            <span class="text-[6px] font-bold text-[#5c8b3e] leading-tight">SUPPLY</span>
          </div>
        </div>

        <div>
          <h1 class="text-base font-black italic tracking-tight text-black uppercase">
            CCR CONSTRUCTION SUPPLY
          </h1>
          <p class="text-xs text-slate-700 italic">Poblacion, Barili, Cebu</p>
          <p class="text-xs text-slate-800 mt-1 font-mono">
            Cellphone No.: 0995 743 7989 / 0998 558 0067
          </p>
        </div>
      </div>

      <!-- Statement Date & SOA Number -->
      <div class="text-right text-xs space-y-1">
        <div>
          <span class="font-normal text-slate-800">Statement Date: </span>
          <span class="font-bold text-black font-mono">{{ statementDateFormatted }}</span>
        </div>
        <div>
          <span class="font-normal text-slate-800">SOA No. : </span>
          <span class="font-bold text-black font-mono">{{ statement.soaNumber }}</span>
        </div>
      </div>
    </div>

    <!-- Centered Document Title & Customer Block -->
    <div class="text-center my-6">
      <h2 class="text-base font-bold tracking-wide uppercase text-black">
        STATEMENT OF ACCOUNT
      </h2>
      <div class="text-xs mt-1 text-black font-bold uppercase tracking-wider">
        {{ statement.customerName || 'CEBU LANDMASTERS, INC.' }}
      </div>
      <div class="text-xs text-slate-700 max-w-xl mx-auto mt-0.5 leading-relaxed">
        {{ customerAddress }}
      </div>
    </div>

    <!-- Main Commercial Grid Table -->
    <div class="mb-4">
      <table class="w-full text-xs border-collapse border-2 border-black">
        <thead>
          <tr class="bg-[#9ec37f] text-black font-bold text-center border-b-2 border-black uppercase text-[11px] tracking-tight">
            <th class="py-2 px-1 border-r border-black w-24">PO DATE<br>ISSUED</th>
            <th class="py-2 px-1 border-r border-black w-28">CUSTOMER<br>PO NOS.</th>
            <th class="py-2 px-1 border-r border-black w-24">DELIVERY<br>NOS.</th>
            <th class="py-2 px-1 border-r border-black w-24">TOTAL QTY<br>DELIVERED</th>
            <th class="py-2 px-3 border-r border-black">ITEM DESCRIPTION</th>
            <th class="py-2 px-1 border-r border-black w-14">UNIT</th>
            <th class="py-2 px-2 border-r border-black w-24">UNIT COST</th>
            <th class="py-2 px-2 w-28">AMOUNT</th>
          </tr>
        </thead>
        <tbody class="text-black font-medium">
          <!-- Active Delivery Line Items -->
          <tr
            v-for="(item, idx) in statement.items"
            :key="idx"
            class="border-b border-black text-center"
          >
            <td class="py-1.5 px-1 border-r border-black font-mono">{{ item.poDate || statement.date }}</td>
            <td class="py-1.5 px-1 border-r border-black font-mono font-bold">{{ statement.poNumber || '4100017940' }}</td>
            <td class="py-1.5 px-1 border-r border-black font-mono font-bold">{{ statement.drNumber ? statement.drNumber.replace('DR #', '') : '4322' }}</td>
            <td class="py-1.5 px-1 border-r border-black font-mono font-bold">{{ item.quantity }}</td>
            <td class="py-1.5 px-3 border-r border-black text-left font-sans">{{ item.name }}</td>
            <td class="py-1.5 px-1 border-r border-black">{{ item.unit || 'sets' }}</td>
            <td class="py-1.5 px-2 border-r border-black text-right font-mono">{{ Number(item.unitPrice || 0).toLocaleString() }}</td>
            <td class="py-1.5 px-2 text-right font-mono font-bold">{{ Number(item.amount || (item.quantity * item.unitPrice)).toLocaleString() }}</td>
          </tr>

          <!-- Project Sub-header Row -->
          <tr v-if="statement.project" class="border-b border-black">
            <td class="py-1.5 border-r border-black"></td>
            <td class="py-1.5 border-r border-black"></td>
            <td class="py-1.5 border-r border-black"></td>
            <td class="py-1.5 border-r border-black"></td>
            <td class="py-1.5 px-3 border-r border-black text-center font-bold uppercase tracking-wider text-black">
              {{ statement.project }}
            </td>
            <td class="py-1.5 border-r border-black"></td>
            <td class="py-1.5 border-r border-black"></td>
            <td class="py-1.5 text-center font-mono">-</td>
          </tr>

          <!-- Nothing Follows Row -->
          <tr class="border-b border-black text-center text-[10px] italic">
            <td class="py-1 border-r border-black"></td>
            <td class="py-1 border-r border-black"></td>
            <td class="py-1 border-r border-black"></td>
            <td class="py-1 border-r border-black"></td>
            <td class="py-1 border-r border-black font-semibold tracking-wider text-slate-800">*** nothing follows ***</td>
            <td class="py-1 border-r border-black"></td>
            <td class="py-1 border-r border-black"></td>
            <td class="py-1 font-mono">-</td>
          </tr>

          <!-- Spacer Blank Rows for Commercial Format -->
          <tr v-for="n in blankRowCount" :key="'blank-' + n" class="border-b border-black text-center text-xs">
            <td class="py-1.5 border-r border-black">&nbsp;</td>
            <td class="py-1.5 border-r border-black">&nbsp;</td>
            <td class="py-1.5 border-r border-black">&nbsp;</td>
            <td class="py-1.5 border-r border-black">&nbsp;</td>
            <td class="py-1.5 border-r border-black">&nbsp;</td>
            <td class="py-1.5 border-r border-black">&nbsp;</td>
            <td class="py-1.5 border-r border-black">&nbsp;</td>
            <td class="py-1.5 font-mono text-slate-400">-</td>
          </tr>
        </tbody>

        <!-- Total Amount Footer Row in Exact Green -->
        <tfoot>
          <tr class="border-t-2 border-black font-bold text-xs">
            <td colspan="4" class="border-r border-black py-2 bg-white"></td>
            <td colspan="3" class="bg-[#9ec37f] border-r border-black py-2 px-3 text-right uppercase tracking-wider text-black font-black">
              TOTAL AMOUNT ----&gt;
            </td>
            <td class="bg-[#9ec37f] py-2 px-2 text-right font-mono font-black text-sm text-black">
              {{ (statement.totalAmount || 0).toLocaleString() }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Payment Terms -->
    <div class="text-xs text-black font-medium mb-4">
      <span>Payment Terms: </span>
      <span class="font-normal">{{ statement.paymentTerms || '30 days upon delivery on site' }}</span>
    </div>

    <!-- Bank Remittance Instructions -->
    <div class="text-xs text-black space-y-1 mb-8">
      <p class="font-normal">*For check payments, please make the check payable to <strong>Rodil B. Vergara</strong></p>
      <p class="font-normal">*For online transfers, kindly use the following banking information:</p>
      <div class="pl-4 space-y-0.5 mt-1 font-normal">
        <p>Bank: <strong>Metrobank</strong></p>
        <p>Account Holder: <strong>Rodil B. Vergara</strong></p>
        <p>Account Number: <strong class="font-mono">599-3-599-14522-3</strong></p>
      </div>
    </div>

    <!-- Signatures Section -->
    <div class="grid grid-cols-2 gap-12 pt-4 text-xs">
      <!-- Prepared By (Rodil B. Vergara) -->
      <div>
        <div class="relative h-14 flex items-end">
          <!-- Stylized signature script -->
          <span class="absolute bottom-2 left-4 font-serif italic text-xl text-slate-900 select-none opacity-90">
            Rodil Vergara
          </span>
          <div class="w-56 border-b-2 border-black"></div>
        </div>
        <div class="pt-1 font-bold text-black uppercase tracking-wider text-[11px]">
          RODIL B. VERGARA
        </div>
        <div class="text-[10px] text-black font-bold uppercase tracking-wider">
          PREPARED BY:
        </div>
      </div>

      <!-- Confirmed By -->
      <div class="flex flex-col justify-end">
        <div class="w-56 border-b-2 border-black"></div>
        <div class="pt-1 text-[10px] text-black font-bold uppercase tracking-wider">
          CONFIRMED BY:
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  statement: {
    type: Object,
    required: true
  },
  customer: {
    type: Object,
    default: () => null
  }
})

const customerAddress = computed(() => {
  if (props.customer?.address) return props.customer.address
  if (props.statement?.customerName?.toLowerCase().includes('landmaster')) {
    return '10th Floor Park Centrale Tower Jose Ma Del Mar St. B2 L3, Cebu IT Park Apas 6000 Cebu City (Capital) Cebu Philippines'
  }
  return 'Subangdaku, Mandaue City, Cebu, Philippines'
})

const statementDateFormatted = computed(() => {
  if (!props.statement.date) return '3-Sep-26'
  const d = new Date(props.statement.date)
  if (isNaN(d.getTime())) return props.statement.date
  const day = d.getDate()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[d.getMonth()]
  const year = String(d.getFullYear()).slice(-2)
  return `${day}-${month}-${year}`
})

const blankRowCount = computed(() => {
  const currentCount = (props.statement.items?.length || 0) + (props.statement.project ? 1 : 0) + 1
  return Math.max(3, 8 - currentCount)
})
</script>
