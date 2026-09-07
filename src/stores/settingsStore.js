import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const useSettingsStore = defineStore('settings', () => {
  const company = ref({
    name: 'CCR Construction Supply',
    tin: '142-990-811-000 NV',
    address: 'Poblacion, Barili, Cebu',
    phone: '0995 743 7989 / 0998 558 0067',
    email: 'ccrconsupplies@gmail.com',
    defaultTerms: '30 days upon delivery on site',
    bankName: 'Metrobank',
    bankAccountName: 'Rodil B. Vergara',
    bankAccountNumber: '599-3-599-14522-3'
  })

  async function fetchSettings() {
    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase.from('settings').select('*').eq('key', 'company_profile').maybeSingle()
        if (data && data.value) {
          company.value = { ...company.value, ...data.value }
        }
      } catch (e) {
        console.warn('Failed to load company profile from Supabase:', e)
      }
    }
  }

  fetchSettings()

  async function updateCompany(details) {
    const nextCompany = { ...company.value, ...details }
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('settings').upsert({
        key: 'company_profile',
        value: nextCompany
      })
      if (error) throw error
    }
    company.value = nextCompany
  }

  return { company, updateCompany, fetchSettings }
})
