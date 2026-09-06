import crypto from 'node:crypto'

// Secret key for token signing / verification
const TOKEN_SECRET = 'ccr-construction-supply-barili-cebu-secret-key-2026'

// In-memory active tokens map: token -> { userId, username, role, expiresAt }
const activeSessions = new Map()

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return { hash, salt }
}

export function verifyPassword(password, storedHash, salt) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return hash === storedHash
}

export function createSession(user) {
  const token = crypto.randomBytes(32).toString('hex')
  const session = {
    userId: user.id,
    username: user.username,
    fullName: user.full_name,
    role: user.role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  }
  activeSessions.set(token, session)
  return token
}

export function getSession(token) {
  if (!token) return null
  const session = activeSessions.get(token)
  if (!session) return null
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token)
    return null
  }
  return session
}

export function removeSession(token) {
  if (token) activeSessions.delete(token)
}

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' })
  }

  const session = getSession(token)
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' })
  }

  req.user = session
  next()
}
