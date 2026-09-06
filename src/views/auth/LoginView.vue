<template>
  <div class="min-h-screen w-full bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
    <!-- Background subtle texture / glow -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-md relative z-10">
      <!-- Card Container -->
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 space-y-6">
        <!-- Logo & Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-xs">
            <img :src="ccrLogo" alt="CCR Construction Supply" class="w-12 h-12 object-contain" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-900 tracking-tight">CCR Construction Supply</h1>
            <p class="text-xs text-slate-500 font-medium">Operations & Accounting Management System</p>
            <p class="text-[11px] text-slate-400 mt-0.5">Poblacion, Barili, Cebu</p>
          </div>
        </div>

        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5 animate-shake"
        >
          <AlertCircle class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div class="flex-1">
            <p class="font-semibold">Sign in failed</p>
            <p class="text-[11px] text-rose-600 mt-0.5">{{ errorMessage }}</p>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div class="relative">
              <Mail class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                v-model="form.email"
                type="email"
                required
                autocomplete="email"
                placeholder="ccrconsupplies@gmail.com"
                class="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors text-slate-900"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div class="relative">
              <Lock class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="Enter password"
                class="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors text-slate-900"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-2.5 px-4 bg-brand-700 hover:bg-brand-800 active:bg-brand-900 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
            <span v-if="!isLoading">Sign In to Dashboard</span>
            <span v-else>Signing In...</span>
          </button>
        </form>
      </div>

      <!-- Footer Info -->
      <div class="text-center mt-4 text-[11px] text-slate-400">
        <p>CCR Construction Supply &copy; {{ new Date().getFullYear() }} • Barili, Cebu</p>
        <p class="text-slate-400/80 mt-0.5">Proprietor: Rodil B. Vergara • BIR TIN: 142-990-811-000 NV</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import ccrLogo from '@/assets/ccr-logo.png'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  if (!form.value.email || !form.value.password) return
  isLoading.value = true
  errorMessage.value = ''

  try {
    await authStore.login(form.value.email, form.value.password)
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    errorMessage.value = err.message || 'Invalid email or password'
  } finally {
    isLoading.value = false
  }
}
</script>
