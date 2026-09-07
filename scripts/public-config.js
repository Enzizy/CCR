export function publicConfig(env, required = false) {
  const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim()
  const key = (env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || '').trim()
  if (!key || key.includes('your-anon-key')) {
    if (required) throw new Error('Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY before deploying.')
    return { url, key: '' }
  }
  let isPublic = /^sb_publishable_[A-Za-z0-9_-]+$/.test(key)
  if (!isPublic) {
    try {
      isPublic = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role === 'anon'
    } catch { /* Not a legacy anon JWT. */ }
  }
  if (!isPublic) throw new Error('Only a Supabase publishable or legacy anon key can be used by this app. Private keys are forbidden.')
  try {
    if (new URL(url).protocol !== 'https:') throw new Error()
  } catch { throw new Error('SUPABASE_URL must be a valid HTTPS URL.') }
  return { url, key }
}
