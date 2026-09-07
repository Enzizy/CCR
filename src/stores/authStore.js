import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const storedUser = JSON.parse(localStorage.getItem('ccr_user') || 'null')
  if (storedUser && (storedUser.fullName === 'Rodil B. Vergara' || storedUser.fullName?.includes('Rodil') || storedUser.fullName === 'admin')) {
    storedUser.fullName = 'CCR Admin'
    localStorage.setItem('ccr_user', JSON.stringify(storedUser))
  }
  const user = ref(storedUser)
  const token = ref(localStorage.getItem('ccr_token') || null)
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const userRole = computed(() => user.value?.role || 'GUEST')
  const isAdmin = computed(() => userRole.value === 'ADMIN')
  const isAccounting = computed(() => userRole.value === 'ACCOUNTING')
  const isLogistics = computed(() => userRole.value === 'LOGISTICS')

  async function login(emailOrUsername, password) {
    isLoading.value = true
    error.value = null

    try {
      if (isSupabaseConfigured) {
        const email = emailOrUsername.includes('@')
          ? emailOrUsername
          : (emailOrUsername.toLowerCase() === 'admin' ? 'ccrconsupplies@gmail.com' : `${emailOrUsername.toLowerCase()}@gmail.com`)
        const { data: supaAuth, error: supaErr } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (supaErr) throw supaErr
        if (!supaAuth?.session) throw new Error('No sign-in session was returned. Please try again.')

        if (!supaErr && supaAuth?.user) {
          const rawName = supaAuth.user.user_metadata?.full_name || emailOrUsername
          const fullName = (!rawName || rawName.includes('Rodil') || rawName.toLowerCase() === 'admin') ? 'CCR Admin' : rawName
          const authUser = {
            id: supaAuth.user.id,
            email: supaAuth.user.email,
            fullName,
            role: supaAuth.user.app_metadata?.role || 'GUEST'
          }
          user.value = authUser
          token.value = supaAuth.session.access_token
          localStorage.setItem('ccr_user', JSON.stringify(authUser))
          localStorage.setItem('ccr_token', token.value)
          return authUser
        }
      }

      if (!import.meta.env.DEV) throw new Error('Sign-in is not configured. Set the Supabase deployment variables and rebuild.')
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrUsername, username: emailOrUsername, password })
      })

      if (!res.headers.get('content-type')?.includes('application/json')) {
        throw new Error('The local sign-in server is unavailable. Start the development server or configure Supabase.')
      }
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login')
      }

      user.value = data.user
      token.value = data.token
      localStorage.setItem('ccr_user', JSON.stringify(data.user))
      localStorage.setItem('ccr_token', data.token)
      return data.user
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut()
      } catch (e) {
        // Ignore errors during Supabase signout
      }
    }

    try {
      if (!isSupabaseConfigured && import.meta.env.DEV && token.value) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.value}`
          }
        })
      }
    } catch (e) {
      // Ignore network errors during logout
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('ccr_user')
      localStorage.removeItem('ccr_token')
    }
  }

  function getAuthHeaders() {
    return token.value ? { 'Authorization': `Bearer ${token.value}` } : {}
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    userRole,
    isAdmin,
    isAccounting,
    isLogistics,
    login,
    logout,
    getAuthHeaders
  }
})
