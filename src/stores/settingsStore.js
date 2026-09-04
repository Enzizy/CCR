import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const company = ref({
    name: 'CCR Construction Supply',
    tin: '142-990-811-000 NV',
    address: 'Poblacion, Barili, Cebu',
    phone: '0995 743 7989 / 0998 558 0067',
    email: 'accounting@ccrsupply.ph',
    defaultTerms: '30 days upon delivery on site',
    bankName: 'Metrobank',
    bankAccountName: 'Rodil B. Vergara',
    bankAccountNumber: '599-3-599-14522-3'
  })

  function updateCompany(details) {
    company.value = { ...company.value, ...details }
  }

  return { company, updateCompany }
})
