import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { PRODUCTS, SEED_REVIEWS } from '../lib/products'
import { translate } from '../lib/i18n'
import {
  LS, load, save, drop, uid, orderNo, cartKey, clamp, applyPromo, shippingCost,
  asArray, asObject, cardBrand,
} from '../lib/utils'
import {
  hashPassword, timingSafeEqual, publicUser, passwordPolicy,
  isLocked, nextLock, legacyHash,
} from '../lib/auth'

const StoreContext = createContext(null)
const SESSION = 'fjord.session'

function cleanCart(raw) {
  return asArray(raw).filter((i) => i && i.id && i.key && Number(i.qty) > 0)
    .map((i) => ({
      key: String(i.key),
      id: String(i.id),
      color: i.color || null,
      size: i.size || null,
      qty: Math.max(1, Number(i.qty) || 1),
      gift: !!i.gift,
    }))
}

function blankState(products) {
  return {
    lang: 'ru',
    theme: 'light',
    cart: [],
    wish: [],
    user: null,
    users: [],
    orders: [],
    reviews: {},
    viewed: [],
    cookies: 'min',
    news: [],
    waitlist: {},
    products,
    promo: '',
    toasts: [],
    cartOpen: false,
    searchOpen: false,
    menuOpen: false,
    quick: null,
    legal: null,
    authBusy: false,
    pay: { paypal: '' },
  }
}

function initial() {
  const catalog = PRODUCTS.map((p) => ({
    ...p,
    tags: asArray(p.tags),
    colors: asArray(p.colors),
    images: asArray(p.images),
  }))
  try {
  const stock = asObject(load(LS.stock, {}))
  const products = catalog.map((p) => ({
    ...p,
    stock: Number.isFinite(stock[p.id]) ? stock[p.id] : p.stock,
  }))
  const session = publicUser(load(SESSION, null, 'session')) || publicUser(load(LS.user, null))
  return {
    lang: load(LS.lang, 'ru') === 'en' ? 'en' : 'ru',
    theme: load(LS.theme, 'light') === 'dark' ? 'dark' : 'light',
    cart: cleanCart(load(LS.cart, [])),
    wish: asArray(load(LS.wish, [])).filter((x) => typeof x === 'string'),
    user: session,
    users: asArray(load(LS.users, [])).filter((u) => u && u.email),
    orders: asArray(load(LS.orders, [])),
    reviews: asObject(load(LS.reviews, {})),
    viewed: asArray(load(LS.viewed, [])).filter((x) => typeof x === 'string'),
    cookies: load(LS.cookies, 'min'),
    news: asArray(load(LS.news, [])),
    waitlist: asObject(load('fjord.wait', {})),
    products,
    promo: '',
    toasts: [],
    cartOpen: false,
    searchOpen: false,
    menuOpen: false,
    quick: null,
    legal: null,
    authBusy: false,
    pay: { paypal: String(asObject(load(LS.pay, {})).paypal || '') },
  }
  } catch (err) {
    console.error(err)
    return blankState(catalog)
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'LANG':
      return { ...state, lang: action.lang }
    case 'THEME':
      return { ...state, theme: action.theme }
    case 'TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] }
    case 'UNTOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) }
    case 'UI':
      return { ...state, ...action.patch }
    case 'CART':
      return { ...state, cart: action.cart }
    case 'WISH':
      return { ...state, wish: action.wish }
    case 'PROMO':
      return { ...state, promo: action.promo }
    case 'USER':
      return { ...state, user: action.user, users: action.users ?? state.users }
    case 'ORDERS':
      return { ...state, orders: action.orders }
    case 'PRODUCTS':
      return { ...state, products: action.products }
    case 'REVIEWS':
      return { ...state, reviews: action.reviews }
    case 'VIEWED':
      return { ...state, viewed: action.viewed }
    case 'COOKIES':
      return { ...state, cookies: action.cookies }
    case 'NEWS':
      return { ...state, news: action.news }
    case 'WAIT':
      return { ...state, waitlist: action.waitlist }
    case 'PAY':
      return { ...state, pay: action.pay }
    case 'ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map((o) => (o.id === action.id ? { ...o, status: action.status, paidAt: action.paidAt || o.paidAt } : o)),
      }
    default:
      return state
  }
}

function persistSession(user, remember) {
  const pub = publicUser(user)
  if (!pub) {
    drop(LS.user)
    drop(SESSION, 'session')
    return
  }
  if (remember) {
    save(LS.user, pub)
    drop(SESSION, 'session')
  } else {
    save(SESSION, pub, 'session')
    drop(LS.user)
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, initial)

  useEffect(() => save(LS.lang, state.lang), [state.lang])
  useEffect(() => save(LS.theme, state.theme), [state.theme])
  useEffect(() => save(LS.cart, state.cart), [state.cart])
  useEffect(() => save(LS.wish, state.wish), [state.wish])
  useEffect(() => save(LS.users, state.users), [state.users])
  useEffect(() => save(LS.orders, state.orders), [state.orders])
  useEffect(() => save(LS.reviews, state.reviews), [state.reviews])
  useEffect(() => save(LS.viewed, state.viewed), [state.viewed])
  useEffect(() => save(LS.cookies, state.cookies), [state.cookies])
  useEffect(() => save(LS.news, state.news), [state.news])
  useEffect(() => save('fjord.wait', state.waitlist), [state.waitlist])
  useEffect(() => save(LS.pay, state.pay), [state.pay])
  useEffect(() => {
    const stock = Object.fromEntries(state.products.map((p) => [p.id, p.stock]))
    save(LS.stock, stock)
  }, [state.products])

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme
    document.documentElement.lang = state.lang === 'ru' ? 'ru' : 'en'
  }, [state.theme, state.lang])

  const setLang = useCallback((lang) => dispatch({ type: 'LANG', lang }), [])
  const setTheme = useCallback((theme) => dispatch({ type: 'THEME', theme }), [])
  const setPromo = useCallback((promo) => dispatch({ type: 'PROMO', promo }), [])
  const setUi = useCallback((patch) => dispatch({ type: 'UI', patch }), [])
  const setCookies = useCallback((cookies) => dispatch({ type: 'COOKIES', cookies }), [])
  const setPay = useCallback((pay) => dispatch({ type: 'PAY', pay }), [])

  const t = useCallback((path, vars) => translate(state.lang, path, vars), [state.lang])

  const notify = useCallback((message) => {
    const toast = { id: uid('t'), message }
    dispatch({ type: 'TOAST', toast })
    setTimeout(() => dispatch({ type: 'UNTOAST', id: toast.id }), 3200)
  }, [])

  const markPaid = useCallback((id) => {
    dispatch({ type: 'ORDER_STATUS', id, status: 'paid', paidAt: new Date().toISOString() })
    notify(state.lang === 'ru' ? 'Оплата подтверждена' : 'Payment confirmed')
  }, [notify, state.lang])

  const product = useCallback((id) => state.products.find((p) => p.id === id), [state.products])

  const addToCart = useCallback((id, opts = {}) => {
    const p = state.products.find((x) => x.id === id)
    if (!p || p.stock <= 0) return false
    const color = opts.color || p.colors[0]?.id
    const size = opts.size || p.sizes?.[0] || null
    const qty = clamp(opts.qty || 1, 1, p.stock)
    const gift = !!opts.gift
    const key = cartKey(id, color, size)
    const existing = state.cart.find((i) => i.key === key)
    const nextQty = (existing?.qty || 0) + qty
    if (nextQty > p.stock) {
      notify(state.lang === 'ru' ? `В ателье только ${p.stock}` : `Only ${p.stock} in the atelier`)
      return false
    }
    const cart = existing
      ? state.cart.map((i) => (i.key === key ? { ...i, qty: nextQty, gift: gift || i.gift } : i))
      : [...state.cart, { key, id, color, size, qty, gift }]
    dispatch({ type: 'CART', cart })
    dispatch({ type: 'UI', patch: { cartOpen: opts.silent ? state.cartOpen : true } })
    if (!opts.silent) notify(t('toast.added'))
    return true
  }, [state.products, state.cart, state.cartOpen, state.lang, notify, t])

  const updateQty = useCallback((key, qty) => {
    const item = state.cart.find((i) => i.key === key)
    if (!item) return
    const p = state.products.find((x) => x.id === item.id)
    const next = clamp(qty, 0, p?.stock ?? 0)
    const cart = next === 0 ? state.cart.filter((i) => i.key !== key) : state.cart.map((i) => (i.key === key ? { ...i, qty: next } : i))
    dispatch({ type: 'CART', cart })
  }, [state.cart, state.products])

  const removeFromCart = useCallback((key) => {
    dispatch({ type: 'CART', cart: state.cart.filter((i) => i.key !== key) })
    notify(t('toast.removed'))
  }, [state.cart, notify, t])

  const toggleGift = useCallback((key) => {
    dispatch({
      type: 'CART',
      cart: state.cart.map((i) => (i.key === key ? { ...i, gift: !i.gift } : i)),
    })
  }, [state.cart])

  const clearCart = useCallback(() => dispatch({ type: 'CART', cart: [] }), [])

  const toggleWish = useCallback((id) => {
    const on = state.wish.includes(id)
    dispatch({ type: 'WISH', wish: on ? state.wish.filter((x) => x !== id) : [...state.wish, id] })
    notify(on ? t('toast.unwish') : t('toast.wished'))
  }, [state.wish, notify, t])

  const register = useCallback(async ({ name, email, password, remember = true }) => {
    const policy = passwordPolicy(password)
    if (policy) return { ok: false, error: policy }
    const em = String(email || '').trim().toLowerCase()
    if (state.users.some((u) => u.email === em)) return { ok: false, error: 'exists' }
    dispatch({ type: 'UI', patch: { authBusy: true } })
    try {
      const { hash, salt } = await hashPassword(password)
      const record = {
        id: uid('u'),
        name: String(name || '').trim().slice(0, 80),
        email: em,
        pass: hash,
        salt,
        phone: '',
        address: { line: '', city: 'Riga', zip: '', country: 'LV' },
        createdAt: new Date().toISOString(),
        failed: 0,
        lockedUntil: 0,
      }
      const session = publicUser(record)
      persistSession(session, remember)
      dispatch({ type: 'USER', user: session, users: [...state.users, record] })
      notify(t('account.created'))
      return { ok: true }
    } catch {
      return { ok: false, error: 'wrong' }
    } finally {
      dispatch({ type: 'UI', patch: { authBusy: false } })
    }
  }, [state.users, notify, t])

  const login = useCallback(async ({ email, password, remember = true }) => {
    const em = String(email || '').trim().toLowerCase()
    const found = state.users.find((u) => u.email === em)
    if (!found) return { ok: false, error: 'wrong' }
    if (isLocked(found)) return { ok: false, error: 'locked' }
    dispatch({ type: 'UI', patch: { authBusy: true } })
    try {
      let ok = false
      let upgraded = found
      if (found.salt) {
        const { hash } = await hashPassword(password, found.salt)
        ok = timingSafeEqual(hash, found.pass)
      } else {
        ok = timingSafeEqual(legacyHash(password), found.pass)
        if (ok) {
          const fresh = await hashPassword(password)
          upgraded = { ...found, pass: fresh.hash, salt: fresh.salt }
        }
      }
      if (!ok) {
        const lock = nextLock((found.failed || 0) + 1)
        const users = state.users.map((u) => (u.id === found.id ? { ...u, ...lock } : u))
        dispatch({ type: 'USER', user: state.user, users })
        return { ok: false, error: lock.lockedUntil ? 'locked' : 'wrong' }
      }
      const record = { ...upgraded, failed: 0, lockedUntil: 0 }
      const session = publicUser(record)
      persistSession(session, remember)
      dispatch({
        type: 'USER',
        user: session,
        users: state.users.map((u) => (u.id === record.id ? record : u)),
      })
      notify(t('account.welcomeBack'))
      return { ok: true }
    } catch {
      return { ok: false, error: 'wrong' }
    } finally {
      dispatch({ type: 'UI', patch: { authBusy: false } })
    }
  }, [state.users, state.user, notify, t])

  const logout = useCallback(() => {
    persistSession(null, false)
    dispatch({ type: 'USER', user: null })
  }, [])

  const updateProfile = useCallback(async (patch, opts = {}) => {
    if (!state.user) return { ok: false }
    let users = state.users
    const rec = users.find((u) => u.id === state.user.id)
    if (!rec) return { ok: false }
    const nextRec = { ...rec }
    if (patch.name != null) nextRec.name = String(patch.name).trim().slice(0, 80)
    if (patch.phone != null) nextRec.phone = String(patch.phone).slice(0, 40)
    if (patch.address) nextRec.address = { ...nextRec.address, ...patch.address }
    if (patch.password) {
      const policy = passwordPolicy(patch.password)
      if (policy) return { ok: false, error: policy }
      const fresh = await hashPassword(patch.password)
      nextRec.pass = fresh.hash
      nextRec.salt = fresh.salt
    }
    users = users.map((u) => (u.id === nextRec.id ? nextRec : u))
    const session = publicUser(nextRec)
    const remember = !!load(LS.user, null)
    persistSession(session, remember)
    dispatch({ type: 'USER', user: session, users })
    if (!opts.silent) notify(t('account.saved'))
    return { ok: true }
  }, [state.user, state.users, notify, t])

  const totals = useMemo(() => {
    const items = state.cart.map((i) => {
      const p = state.products.find((x) => x.id === i.id)
      const line = (p?.price || 0) * i.qty + (i.gift ? 8 * i.qty : 0)
      return { ...i, product: p, line }
    }).filter((i) => i.product)
    const subtotal = items.reduce((a, i) => a + i.line, 0)
    const promoRes = applyPromo(state.promo, state.cart, state.products, subtotal)
    return { items, subtotal, discount: promoRes.ok ? promoRes.discount : 0, freeShip: !!promoRes.ok && promoRes.freeShip, promoOk: promoRes.ok, promoNeed: promoRes.need }
  }, [state.cart, state.products, state.promo])

  const placeOrder = useCallback((form) => {
    for (const item of state.cart) {
      const p = state.products.find((x) => x.id === item.id)
      if (!p || p.stock < item.qty) {
        return { ok: false, error: 'stock', id: item.id }
      }
    }
    const ship = shippingCost(form.country, form.method, totals.subtotal, totals.freeShip)
    const grand = Math.max(0, totals.subtotal - totals.discount + ship)
    const digits = String(form.card || '').replace(/\s/g, '')
    const order = {
      id: uid('o'),
      no: orderNo(),
      createdAt: new Date().toISOString(),
      userId: state.user?.id || null,
      email: String(form.email || '').trim().toLowerCase(),
      name: String(form.name || '').trim().slice(0, 80),
      phone: String(form.phone || '').trim().slice(0, 40),
      address: {
        line: String(form.line || '').slice(0, 160),
        city: String(form.city || '').slice(0, 80),
        zip: String(form.zip || '').slice(0, 20),
        country: String(form.country || 'LV').slice(0, 4),
      },
      notes: String(form.notes || '').slice(0, 400),
      method: form.method,
      pay: form.pay,
      payMeta: form.pay === 'card' && digits
        ? { brand: cardBrand(digits), last4: digits.slice(-4) }
        : null,
      items: totals.items.map((i) => ({
        id: i.id,
        name: i.product.name,
        color: i.color,
        size: i.size,
        qty: i.qty,
        gift: i.gift,
        price: i.product.price,
        image: i.product.images[0],
        line: i.line,
      })),
      subtotal: totals.subtotal,
      discount: totals.discount,
      promo: totals.promoOk ? state.promo.toUpperCase() : '',
      shipping: ship,
      total: grand,
      status: form.pay === 'paypal' ? 'awaiting' : (form.method === 'pickup' ? 'pickup' : 'processing'),
    }
    const products = state.products.map((p) => {
      const used = state.cart.filter((i) => i.id === p.id).reduce((a, i) => a + i.qty, 0)
      return used ? { ...p, stock: p.stock - used } : p
    })
    dispatch({ type: 'PRODUCTS', products })
    dispatch({ type: 'ORDERS', orders: [order, ...state.orders] })
    dispatch({ type: 'CART', cart: [] })
    dispatch({ type: 'PROMO', promo: '' })
    notify(t('toast.order'))
    return { ok: true, order }
  }, [state.cart, state.products, state.orders, state.user, state.promo, totals, notify, t])

  const addReview = useCallback((productId, { name, stars, text }) => {
    const entry = {
      id: uid('r'),
      name: String(name || '').slice(0, 80),
      stars: clamp(Number(stars) || 5, 1, 5),
      date: new Date().toISOString().slice(0, 10),
      en: String(text || '').slice(0, 800),
      ru: String(text || '').slice(0, 800),
      userId: state.user?.id,
    }
    const list = [...(state.reviews[productId] || []), entry]
    dispatch({ type: 'REVIEWS', reviews: { ...state.reviews, [productId]: list } })
  }, [state.reviews, state.user])

  const reviewsFor = useCallback((id) => {
    return [...(SEED_REVIEWS[id] || []), ...(state.reviews[id] || [])]
  }, [state.reviews])

  const viewProduct = useCallback((id) => {
    const viewed = [id, ...state.viewed.filter((x) => x !== id)].slice(0, 8)
    dispatch({ type: 'VIEWED', viewed })
  }, [state.viewed])

  const subscribe = useCallback((email) => {
    const em = String(email || '').trim().toLowerCase()
    if (state.news.includes(em)) return true
    dispatch({ type: 'NEWS', news: [...state.news, em] })
    notify(t('toast.news'))
    return true
  }, [state.news, notify, t])

  const waitFor = useCallback((id, email) => {
    const em = String(email || '').trim().toLowerCase()
    const cur = state.waitlist[id] || []
    if (cur.includes(em)) return
    dispatch({ type: 'WAIT', waitlist: { ...state.waitlist, [id]: [...cur, em] } })
    notify(t('toast.wait'))
  }, [state.waitlist, notify, t])

  const value = useMemo(() => ({
    ...state,
    t,
    notify,
    product,
    addToCart,
    updateQty,
    removeFromCart,
    toggleGift,
    clearCart,
    toggleWish,
    register,
    login,
    logout,
    updateProfile,
    totals,
    placeOrder,
    addReview,
    reviewsFor,
    viewProduct,
    subscribe,
    waitFor,
    setLang,
    setTheme,
    setPromo,
    setUi,
    setCookies,
    setPay,
    markPaid,
  }), [
    state, t, notify, product, addToCart, updateQty, removeFromCart, toggleGift,
    clearCart, toggleWish, register, login, logout, updateProfile, totals,
    placeOrder, addReview, reviewsFor, viewProduct, subscribe, waitFor,
    setLang, setTheme, setPromo, setUi, setCookies, setPay, markPaid,
  ])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('Store')
  return ctx
}
