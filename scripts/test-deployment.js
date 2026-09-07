import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createPinia, setActivePinia } from 'pinia'
import { publicConfig } from './public-config.js'

const url = 'https://example.supabase.co'
assert.throws(() => publicConfig({}, true))
for (const key of ['sb_secret_private', `a.${Buffer.from('{"role":"service_role"}').toString('base64url')}.b`]) {
  assert.throws(() => publicConfig({ SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: key }, true))
}
assert.equal(publicConfig({ SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test' }, true).key, 'sb_publishable_test')

const storage = new Map()
globalThis.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) }
let localRequests = 0
globalThis.fetch = async () => { localRequests++; throw new Error('Unexpected local API request') }
globalThis.testSupabase = { auth: { signInWithPassword: async () => ({ error: new Error('Invalid login credentials') }) } }
let source = await readFile(new URL('../src/stores/authStore.js', import.meta.url), 'utf8')
source = source.replace("import { supabase, isSupabaseConfigured } from '@/lib/supabase'", 'const supabase = globalThis.testSupabase; const isSupabaseConfigured = true')
  .replace("from 'pinia'", `from '${import.meta.resolve('pinia')}'`)
  .replace("from 'vue'", `from '${import.meta.resolve('vue')}'`)
  .replaceAll('import.meta.env.DEV', 'false')
const { useAuthStore } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
setActivePinia(createPinia())
const auth = useAuthStore()
await assert.rejects(auth.login('test@example.com', 'invalid'), /Invalid login credentials/)
assert.equal(localRequests, 0)
assert.equal(auth.isLoading, false)
globalThis.testSupabase.auth.signInWithPassword = async () => ({ data: { user: { id: 'test', email: 'test@example.com', user_metadata: { role: 'ADMIN' }, app_metadata: {} }, session: { access_token: 'test-token' } } })
await auth.login('test@example.com', 'valid')
assert.equal(auth.userRole, 'GUEST')
assert.equal(auth.isLoading, false)
assert.equal(localRequests, 0)
console.log('Deployment configuration and login regression checks passed.')
