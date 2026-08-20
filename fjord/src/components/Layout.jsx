import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/Store'
import { CATEGORIES } from '../lib/products'
import { formatPrice } from '../lib/utils'
import { I } from './Icons'
import SafeImg from './SafeImg'


export default function Layout({ children }) {
  const loc = useLocation()
  const { setUi, cartOpen, menuOpen, searchOpen, quick, legal } = useStore()
  useEffect(() => { window.scrollTo(0, 0) }, [loc.pathname])
  useEffect(() => {
    setUi({ cartOpen: false, menuOpen: false, searchOpen: false, quick: null, legal: null })
  }, [loc.pathname, setUi])
  useEffect(() => {
    const map = {
      '/': 'FJORD — Nordic Living',
      '/shop': 'FJORD — Shop',
      '/cart': 'FJORD — Cart',
      '/checkout': 'FJORD — Checkout',
      '/account': 'FJORD — Account',
      '/wishlist': 'FJORD — Saved',
      '/about': 'FJORD — Atelier',
      '/contact': 'FJORD — Contact',
      '/faq': 'FJORD — FAQ',
    }
    const hit = Object.entries(map).find(([k]) => loc.pathname === k || (k !== '/' && loc.pathname.startsWith(k)))
    document.title = hit ? hit[1] : 'FJORD'
  }, [loc.pathname])
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setUi({ cartOpen: false, menuOpen: false, searchOpen: false, quick: null, legal: null })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setUi])
  useEffect(() => {
    document.body.style.overflow = (cartOpen || menuOpen || quick || legal) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen, menuOpen, quick, legal, searchOpen])
  return (
    <div className="app">
      <Announce />
      <Header />
      <main className="main">{children}</main>
      <Footer />
      <CartDrawer />
      <MobileMenu />
      <QuickView />
      <Legal />
      <Toasts />
      <Cookies />
    </div>
  )
}

function Announce() {
  const { t } = useStore()
  return <div className="announce">{t('header.announce')}</div>
}

function Header() {
  const { t, lang, setLang, theme, setTheme, cart, wish, setUi, products, searchOpen } = useStore()
  const [q, setQ] = useState('')
  const loc = useLocation()
  const nav = useNavigate()
  const count = cart.reduce((a, i) => a + i.qty, 0)

  const hits = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (s.length < 2) return []
    return products.filter((p) =>
      `${p.name.en} ${p.name.ru} ${p.blurb.en} ${p.blurb.ru} ${p.category}`.toLowerCase().includes(s)
    ).slice(0, 6)
  }, [q, products])

  useEffect(() => { setQ('') }, [loc.pathname])

  return (
    <header className="header">
      <div className="header-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="icon-btn burger" aria-label={t('common.menu')} onClick={() => setUi({ menuOpen: true })}>{I.menu()}</button>
          <Link to="/" className="logo">FJORD</Link>
        </div>
        <nav className="nav">
          <NavLink to="/shop">{t('nav.shop')}</NavLink>
          {CATEGORIES.slice(0, 4).map((c) => (
            <NavLink key={c.id} to={`/shop/${c.id}`}>{c[lang]}</NavLink>
          ))}
          <NavLink to="/about">{t('nav.about')}</NavLink>
        </nav>
        <div className="tools">
          <button className="icon-btn" aria-label={t('header.lang')} onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}>
            <b style={{ fontSize: 12, letterSpacing: '.12em' }}>{lang === 'ru' ? 'EN' : 'RU'}</b>
          </button>
          <button className="icon-btn" aria-label="theme" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? I.moon() : I.sun()}
          </button>
          <div style={{ position: 'relative' }}>
            <button className="icon-btn" aria-label={t('nav.search')} onClick={() => setUi({ searchOpen: !searchOpen })}>{I.search()}</button>
            {searchOpen && (
              <div className="search-pop">
                <input
                  autoFocus
                  placeholder={t('header.searchPh')}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && q.trim()) nav(`/shop?q=${encodeURIComponent(q.trim())}`)
                    if (e.key === 'Escape') setUi({ searchOpen: false })
                  }}
                />
                {q.trim().length >= 2 && hits.length === 0 && (
                  <p className="muted" style={{ padding: 10 }}>{t('header.noResults', { q })}</p>
                )}
                {hits.map((p) => (
                  <Link key={p.id} to={`/product/${p.id}`} className="sugg">
                    <SafeImg src={p.images[0]} alt="" />
                    <div>
                      <strong>{p.name[lang]}</strong>
                      <span>{formatPrice(p.price, lang)}</span>
                    </div>
                  </Link>
                ))}
                {q.trim() && (
                  <button className="btn btn-sm btn-full" style={{ marginTop: 8 }} onClick={() => nav(`/shop?q=${encodeURIComponent(q.trim())}`)}>
                    {t('header.viewAll')}
                  </button>
                )}
              </div>
            )}
          </div>
          <Link className="icon-btn" to="/wishlist" aria-label={t('nav.wishlist')}>
            {I.heart()}
            {wish.length > 0 && <i className="dot">{wish.length}</i>}
          </Link>
          <Link className="icon-btn" to="/account" aria-label={t('nav.account')}>{I.user()}</Link>
          <button className="icon-btn" aria-label={t('nav.cart')} onClick={() => setUi({ cartOpen: true })}>
            {I.bag()}
            {count > 0 && <i className="dot">{count}</i>}
          </button>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  const { t, subscribe, setUi, lang } = useStore()
  const [email, setEmail] = useState('')
  const [ok, setOk] = useState(false)
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <Link to="/" className="logo">FJORD</Link>
          <p className="muted" style={{ marginTop: 12, maxWidth: '36ch' }}>{t('footer.story')}</p>
          <p className="muted" style={{ marginTop: 8 }}>{t('city')} · Miera iela 48</p>
        </div>
        <div>
          <h4>{t('footer.shop')}</h4>
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={`/shop/${c.id}`}>{c[lang]}</Link>
          ))}
        </div>
        <div>
          <h4>{t('footer.house')}</h4>
          <Link to="/about">{t('nav.about')}</Link>
          <Link to="/contact">{t('nav.contact')}</Link>
          <Link to="/faq">{t('nav.faq')}</Link>
          <Link to="/account">{t('nav.account')}</Link>
        </div>
        <div>
          <h4>{t('footer.newsTitle')}</h4>
          <p className="muted">{t('footer.newsLead')}</p>
          {ok ? <p style={{ marginTop: 12 }}>{t('footer.joined')}</p> : (
            <form className="news" onSubmit={(e) => {
              e.preventDefault()
              if (!email.includes('@')) return
              subscribe(email)
              setOk(true)
            }}>
              <input type="email" required placeholder={t('footer.email')} value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="btn btn-sm" type="submit">{t('footer.join')}</button>
            </form>
          )}
        </div>
      </div>
      <div className="wrap legal-row">
        <span>{t('footer.rights', { y: new Date().getFullYear() })}</span>
        <div>
          <button onClick={() => setUi({ legal: 'privacy' })}>{t('footer.privacy')}</button>
          <button onClick={() => setUi({ legal: 'terms' })}>{t('footer.terms')}</button>
        </div>
      </div>
    </footer>
  )
}

function CartDrawer() {
  const { t, lang, cartOpen, setUi, cart, product, updateQty, removeFromCart, totals } = useStore()
  if (!cartOpen) return null
  return (
    <>
      <div className="overlay" onClick={() => setUi({ cartOpen: false })} />
      <aside className="drawer">
        <div className="drawer-h">
          <h3>{t('cart.title')}</h3>
          <button className="icon-btn" onClick={() => setUi({ cartOpen: false })}>{I.close()}</button>
        </div>
        <div className="drawer-b">
          {cart.length === 0 && <p className="muted">{t('cart.empty')}</p>}
          {cart.map((i) => {
            const p = product(i.id)
            if (!p) return null
            return (
              <div className="line" key={i.key} style={{ gridTemplateColumns: '72px 1fr' }}>
                <SafeImg src={p.images[0]} alt="" />
                <div>
                  <h4>{p.name[lang]}</h4>
                  <p className="muted" style={{ fontSize: 13 }}>
                    {p.colors.find((c) => c.id === i.color)?.[lang]}
                    {i.size ? ` · ${i.size}` : ''}
                  </p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                    <div className="qty">
                      <button onClick={() => updateQty(i.key, i.qty - 1)}>−</button>
                      <span>{i.qty}</span>
                      <button onClick={() => updateQty(i.key, i.qty + 1)}>+</button>
                    </div>
                    <span>{formatPrice(p.price * i.qty, lang)}</span>
                    <button className="muted" onClick={() => removeFromCart(i.key)}>{t('cart.remove')}</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="drawer-f">
          <div className="sum-row big">
            <span>{t('cart.sub')}</span>
            <b>{formatPrice(totals.subtotal, lang)}</b>
          </div>
          <Link className="btn btn-full" to="/checkout" onClick={() => setUi({ cartOpen: false })}>{t('cart.checkout')}</Link>
          <Link className="btn btn-ghost btn-full" to="/cart" onClick={() => setUi({ cartOpen: false })}>{t('nav.cart')}</Link>
        </div>
      </aside>
    </>
  )
}

function MobileMenu() {
  const { t, lang, menuOpen, setUi } = useStore()
  if (!menuOpen) return null
  const close = () => setUi({ menuOpen: false })
  return (
    <div className="mobile-nav">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="logo">FJORD</span>
        <button className="icon-btn" onClick={close}>{I.close()}</button>
      </div>
      <div style={{ marginTop: 28, display: 'grid' }}>
        <Link to="/shop" onClick={close}>{t('nav.shop')}</Link>
        {CATEGORIES.map((c) => (
          <Link key={c.id} to={`/shop/${c.id}`} onClick={close}>{c[lang]}</Link>
        ))}
        <Link to="/about" onClick={close}>{t('nav.about')}</Link>
        <Link to="/contact" onClick={close}>{t('nav.contact')}</Link>
        <Link to="/faq" onClick={close}>{t('nav.faq')}</Link>
        <Link to="/account" onClick={close}>{t('nav.account')}</Link>
      </div>
    </div>
  )
}

function QuickView() {
  const { quick, setUi, product, lang, t, addToCart, wish, toggleWish } = useStore()
  const p = quick ? product(quick) : null
  if (!p) return null
  return (
    <div className="modal">
      <div className="overlay" onClick={() => setUi({ quick: null })} />
      <div className="modal-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <SafeImg src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 280 }} />
        <div style={{ padding: 28, display: 'grid', gap: 12, alignContent: 'center' }}>
          <button className="icon-btn" style={{ justifySelf: 'end' }} onClick={() => setUi({ quick: null })}>{I.close()}</button>
          <h3 className="serif" style={{ fontSize: 36 }}>{p.name[lang]}</h3>
          <p className="muted">{p.blurb[lang]}</p>
          <p className="price-lg">{formatPrice(p.price, lang)}</p>
          <button className="btn" disabled={p.stock <= 0} onClick={() => { addToCart(p.id); setUi({ quick: null }) }}>{t('product.add')}</button>
          <button className="btn btn-ghost" onClick={() => toggleWish(p.id)}>{wish.includes(p.id) ? t('product.wished') : t('product.wish')}</button>
          <Link to={`/product/${p.id}`} onClick={() => setUi({ quick: null })}>{t('home.viewProduct')} →</Link>
        </div>
      </div>
    </div>
  )
}

function Legal() {
  const { legal, setUi, t } = useStore()
  if (!legal) return null
  return (
    <div className="modal">
      <div className="overlay" onClick={() => setUi({ legal: null })} />
      <div className="modal-card legal-card">
        <div className="modal-h">
          <h3>{legal === 'privacy' ? t('legal.privacyTitle') : t('legal.termsTitle')}</h3>
          <button className="icon-btn" onClick={() => setUi({ legal: null })}>{I.close()}</button>
        </div>
        <p>{legal === 'privacy' ? t('legal.privacy') : t('legal.terms')}</p>
      </div>
    </div>
  )
}

function Toasts() {
  const { toasts } = useStore()
  if (!toasts.length) return null
  return (
    <div className="toasts">
      {toasts.map((x) => <div className="toast" key={x.id}>{x.message}</div>)}
    </div>
  )
}

function Cookies() {
  const { cookies, setCookies, t } = useStore()
  if (cookies) return null
  return (
    <div className="cookie">
      <p style={{ margin: 0, maxWidth: 520 }}>{t('cookies.text')}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-sm" onClick={() => setCookies('all')}>{t('cookies.ok')}</button>
        <button className="btn btn-sm btn-ghost" onClick={() => setCookies('min')}>{t('cookies.no')}</button>
      </div>
    </div>
  )
}


