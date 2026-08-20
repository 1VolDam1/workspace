const enc = new TextEncoder()

function bufToB64(buf) {
  const bytes = new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s)
}

function b64ToBuf(b64) {
  const s = atob(b64)
  const out = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i)
  return out.buffer
}

export function passwordPolicy(pw) {
  const v = String(pw || '')
  if (v.length < 8) return 'short'
  if (!/[A-Za-zА-Яа-я]/.test(v) || !/\d/.test(v)) return 'weak'
  return null
}

export function passwordScore(pw) {
  const v = String(pw || '')
  let n = 0
  if (v.length >= 8) n++
  if (v.length >= 12) n++
  if (/[A-ZА-Я]/.test(v) && /[a-zа-я]/.test(v)) n++
  if (/\d/.test(v)) n++
  if (/[^A-Za-zА-Яа-я0-9]/.test(v)) n++
  return Math.min(4, n)
}

export async function hashPassword(password, saltB64) {
  const salt = saltB64
    ? new Uint8Array(b64ToBuf(saltB64))
    : crypto.getRandomValues(new Uint8Array(16))
  const material = await crypto.subtle.importKey(
    'raw',
    enc.encode(String(password)),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' },
    material,
    256,
  )
  return { hash: bufToB64(bits), salt: bufToB64(salt) }
}

export function timingSafeEqual(a, b) {
  const x = String(a || '')
  const y = String(b || '')
  const len = Math.max(x.length, y.length)
  let out = x.length === y.length ? 0 : 1
  for (let i = 0; i < len; i++) out |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0)
  return out === 0
}

export function publicUser(u) {
  if (!u || typeof u !== 'object') return null
  return {
    id: String(u.id || ''),
    name: String(u.name || '').slice(0, 80),
    email: String(u.email || '').slice(0, 120),
    phone: String(u.phone || '').slice(0, 40),
    address: {
      line: String(u.address?.line || '').slice(0, 160),
      city: String(u.address?.city || '').slice(0, 80),
      zip: String(u.address?.zip || '').slice(0, 20),
      country: String(u.address?.country || 'LV').slice(0, 4),
    },
    createdAt: u.createdAt || new Date().toISOString(),
  }
}

export function isLocked(user) {
  return !!(user?.lockedUntil && Date.now() < user.lockedUntil)
}

export function nextLock(fails) {
  if (fails < 5) return { failed: fails, lockedUntil: 0 }
  return { failed: fails, lockedUntil: Date.now() + 60_000 }
}

/** Legacy djb2 — only to upgrade old demo accounts once. */
export function legacyHash(str) {
  let h = 5381
  const s = String(str)
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i)
  return (h >>> 0).toString(16)
}
