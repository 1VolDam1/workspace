export const LS = {
  lang: 'fjord.lang',
  theme: 'fjord.theme',
  cart: 'fjord.cart',
  wish: 'fjord.wish',
  user: 'fjord.user',
  users: 'fjord.users',
  orders: 'fjord.orders',
  reviews: 'fjord.reviews',
  stock: 'fjord.stock',
  viewed: 'fjord.viewed',
  cookies: 'fjord.cookies',
  news: 'fjord.news',
  messages: 'fjord.messages',
  pay: 'fjord.pay',
}

export function paypalCheckoutUrl({ email, amount, no, returnUrl, cancelUrl }) {
  const q = new URLSearchParams({
    cmd: '_xclick',
    business: String(email || '').trim(),
    item_name: `FJORD ${no}`,
    amount: Number(amount || 0).toFixed(2),
    currency_code: 'EUR',
    invoice: String(no || ''),
    no_note: '1',
    no_shipping: '1',
    rm: '1',
    lc: 'RU',
    charset: 'utf-8',
  })
  if (returnUrl) q.set('return', returnUrl)
  if (cancelUrl) q.set('cancel_return', cancelUrl)
  return `https://www.paypal.com/cgi-bin/webscr?${q.toString()}`
}

const memory = { local: {}, session: {} }

function bucket(kind) {
  try {
    const s = kind === 'session'
      ? globalThis.sessionStorage
      : globalThis.localStorage
    if (!s) return null
    const probe = '__fjord_ok'
    s.setItem(probe, '1')
    s.removeItem(probe)
    return s
  } catch {
    return null
  }
}

export function load(key, fallback, kind = 'local') {
  try {
    const s = bucket(kind)
    if (s) {
      const raw = s.getItem(key)
      return raw == null ? fallback : JSON.parse(raw)
    }
    if (Object.prototype.hasOwnProperty.call(memory[kind] || {}, key)) {
      return memory[kind][key]
    }
    return fallback
  } catch {
    return fallback
  }
}

export function asArray(v) {
  return Array.isArray(v) ? v : []
}

export function asObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v) ? v : {}
}

export function save(key, value, kind = 'local') {
  try {
    const s = bucket(kind)
    if (s) {
      s.setItem(key, JSON.stringify(value))
      return
    }
    if (!memory[kind]) memory[kind] = {}
    memory[kind][key] = value
  } catch {
    if (!memory[kind]) memory[kind] = {}
    memory[kind][key] = value
  }
}

export function drop(key, kind = 'local') {
  try {
    const s = bucket(kind)
    if (s) s.removeItem(key)
    if (memory[kind]) delete memory[kind][key]
  } catch {
    if (memory[kind]) delete memory[kind][key]
  }
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function orderNo() {
  const n = Math.floor(10000 + Math.random() * 90000)
  return `FJ-${new Date().getFullYear()}-${n}`
}

export function formatPrice(value, lang = 'en') {
  return new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(iso, lang = 'en') {
  return new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

export function emailOk(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim())
}

export function luhn(num) {
  const s = String(num).replace(/\s+/g, '')
  if (!/^\d{13,19}$/.test(s)) return false
  let sum = 0
  let alt = false
  for (let i = s.length - 1; i >= 0; i--) {
    let n = Number(s[i])
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

export function cardBrand(num) {
  const s = String(num).replace(/\s+/g, '')
  if (/^4/.test(s)) return 'Visa'
  if (/^5[1-5]/.test(s) || /^2[2-7]/.test(s)) return 'Mastercard'
  if (/^3[47]/.test(s)) return 'Amex'
  return 'Card'
}

export function formatCard(num) {
  return String(num)
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

export function cartKey(id, color, size) {
  return `${id}__${color || '-'}__${size || '-'}`
}

export function hash(str) {
  let h = 5381
  const s = String(str)
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i)
  return (h >>> 0).toString(16)
}

export function shippingCost(country, method, subtotal, freeShip) {
  if (freeShip || method === 'pickup') return 0
  const zone = country === 'LV' ? 'lv' : ['EE', 'LT'].includes(country) ? 'balt' : 'eu'
  const table = {
    standard: { lv: 6, balt: 12, eu: 18 },
    express: { lv: 16, balt: 24, eu: 36 },
  }
  const base = table[method]?.[zone] ?? 18
  const threshold = zone === 'lv' ? 80 : zone === 'balt' ? 120 : 180
  if (method === 'standard' && subtotal >= threshold) return 0
  return base
}

export function eta(method, lang) {
  const map = {
    pickup: { en: 'Today–tomorrow, Riga atelier', ru: 'Сегодня–завтра, ателье в Риге' },
    standard: { en: '5–8 business days', ru: '5–8 рабочих дней' },
    express: { en: '1–3 business days', ru: '1–3 рабочих дня' },
  }
  return map[method]?.[lang] || map.standard[lang]
}

export const COUNTRIES = [
  { id: 'LV', en: 'Latvia', ru: 'Латвия' },
  { id: 'EE', en: 'Estonia', ru: 'Эстония' },
  { id: 'LT', en: 'Lithuania', ru: 'Литва' },
  { id: 'FI', en: 'Finland', ru: 'Финляндия' },
  { id: 'SE', en: 'Sweden', ru: 'Швеция' },
  { id: 'DE', en: 'Germany', ru: 'Германия' },
  { id: 'PL', en: 'Poland', ru: 'Польша' },
  { id: 'DK', en: 'Denmark', ru: 'Дания' },
  { id: 'NL', en: 'Netherlands', ru: 'Нидерланды' },
  { id: 'FR', en: 'France', ru: 'Франция' },
]

export const PROMO = {
  WELCOME10: { type: 'percent', value: 10 },
  FJORD20: { type: 'percent', value: 20, min: 200 },
  FREESHIP: { type: 'shipping' },
  NORDIC15: { type: 'category', value: 15, category: 'furniture' },
  LINEN25: { type: 'category', value: 25, category: 'textiles' },
}

export function applyPromo(code, items, products, subtotal) {
  const promo = PROMO[String(code || '').trim().toUpperCase()]
  if (!promo) return { ok: false, discount: 0, freeShip: false }
  if (promo.min && subtotal < promo.min) return { ok: false, discount: 0, freeShip: false, need: promo.min }
  if (promo.type === 'percent') return { ok: true, discount: Math.round(subtotal * promo.value / 100), freeShip: false, promo }
  if (promo.type === 'shipping') return { ok: true, discount: 0, freeShip: true, promo }
  if (promo.type === 'category') {
    const sum = items.reduce((acc, it) => {
      const p = products.find((x) => x.id === it.id)
      if (p?.category === promo.category) acc += p.price * it.qty
      return acc
    }, 0)
    return { ok: true, discount: Math.round(sum * promo.value / 100), freeShip: false, promo }
  }
  return { ok: false, discount: 0, freeShip: false }
}

export function avgRating(seed, extra) {
  const all = [...(seed || []), ...(extra || [])]
  if (!all.length) return { rating: 0, count: 0 }
  const sum = all.reduce((a, r) => a + r.stars, 0)
  return { rating: Math.round((sum / all.length) * 10) / 10, count: all.length }
}
