import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/Store'
import { COUNTRIES, emailOk, formatDate, formatPrice } from '../lib/utils'
import { passwordPolicy, passwordScore } from '../lib/auth'

export default function Account() {
  const { t, user } = useStore()
  return (
    <div className="wrap">
      <header className="page-head">
        <p className="kicker">{t('nav.account')}</p>
        <h1 className="display">{user ? t('account.hello', { name: user.name }) : t('account.guestTitle')}</h1>
        {!user && <p className="muted" style={{ maxWidth: '46ch', marginTop: 10 }}>{t('account.guestLead')}</p>}
      </header>
      {user ? <Dashboard /> : <Auth />}
      <PayBox />
    </div>
  )
}

function PayBox() {
  const { t, pay, setPay, notify } = useStore()
  const [email, setEmail] = useState(pay?.paypal || '')
  return (
    <section style={{ padding: '24px 0 80px', maxWidth: 520 }}>
      <h2 className="serif" style={{ fontSize: 32, marginBottom: 8 }}>{t('account.payTitle')}</h2>
      <p className="muted" style={{ marginBottom: 16 }}>{t('account.payLead')}</p>
      <form style={{ display: 'grid', gap: 12 }} onSubmit={(e) => {
        e.preventDefault()
        const em = email.trim().toLowerCase()
        if (em && !emailOk(em)) return
        setPay({ paypal: em })
        notify(t('account.saved'))
      }}>
        <label className="field">
          <span>{t('account.paypalEmail')}</span>
          <input
            type="email"
            placeholder="you@paypal.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <button className="btn" type="submit">{t('account.save')}</button>
      </form>
    </section>
  )
}

function Auth() {
  const { t, login, register, authBusy } = useStore()
  const [mode, setMode] = useState('register')
  const [form, setForm] = useState({ name: '', email: '', password: '', password2: '', remember: true })
  const [err, setErr] = useState('')
  const [show, setShow] = useState(false)
  const score = passwordScore(form.password)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!emailOk(form.email)) return setErr(t('account.needEmail'))
    if (mode === 'register') {
      if (!form.name.trim()) return setErr(t('account.needName'))
      const policy = passwordPolicy(form.password)
      if (policy) return setErr(t(`account.${policy}`))
      if (form.password !== form.password2) return setErr(t('account.mismatch'))
      const res = await register(form)
      if (!res.ok) setErr(t(`account.${res.error}`))
    } else {
      if (!form.password) return setErr(t('val.required'))
      const res = await login(form)
      if (!res.ok) setErr(t(`account.${res.error}`))
    }
  }

  return (
    <div className="auth-grid">
      <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 440 }} autoComplete="on">
        <div className="tabs" style={{ margin: 0 }}>
          <button type="button" className={mode === 'register' ? 'on' : ''} onClick={() => { setMode('register'); setErr('') }}>
            {t('account.register')}
          </button>
          <button type="button" className={mode === 'login' ? 'on' : ''} onClick={() => { setMode('login'); setErr('') }}>
            {t('account.login')}
          </button>
        </div>

        {mode === 'register' && (
          <label className="field">
            <span>{t('account.name')}</span>
            <input
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
        )}
        <label className="field">
          <span>{t('checkout.email')}</span>
          <input
            type="email"
            name="email"
            autoComplete="username"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label className="field">
          <span>{t('account.password')}</span>
          <div className="pass-wrap">
            <input
              type={show ? 'text' : 'password'}
              name="password"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="button" className="pass-toggle" onClick={() => setShow((v) => !v)}>
              {show ? t('account.hide') : t('account.show')}
            </button>
          </div>
        </label>
        {mode === 'register' && (
          <>
            <div className="strength" aria-hidden>
              {[0, 1, 2, 3].map((i) => <i key={i} className={i < score ? `on s${score}` : ''} />)}
            </div>
            <label className="field">
              <span>{t('account.password2')}</span>
              <input
                type={show ? 'text' : 'password'}
                name="password2"
                autoComplete="new-password"
                value={form.password2}
                onChange={(e) => setForm({ ...form, password2: e.target.value })}
              />
            </label>
          </>
        )}
        <label className="chk">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(e) => setForm({ ...form, remember: e.target.checked })}
          />
          {t('account.remember')}
        </label>
        {err && <p style={{ color: 'var(--danger)', margin: 0 }}>{err}</p>}
        <button className="btn" type="submit" disabled={authBusy}>
          {authBusy ? t('account.working') : (mode === 'login' ? t('account.login') : t('account.register'))}
        </button>
        <p className="muted" style={{ fontSize: 13 }}>{t('account.secureNote')}</p>
      </form>
      <div className="quote">
        <p>{t('tagline')}</p>
        <span className="kicker">{t('city')}</span>
      </div>
    </div>
  )
}

function Dashboard() {
  const { t, lang, user, logout, updateProfile, orders } = useStore()
  const [tab, setTab] = useState('orders')
  const mine = orders.filter((o) => o.userId === user.id || o.email === user.email)
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || '',
    password: '',
    line: user.address?.line || '',
    city: user.address?.city || 'Riga',
    zip: user.address?.zip || '',
    country: user.address?.country || 'LV',
  })
  const [err, setErr] = useState('')

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div className="tabs">
          {['orders', 'profile', 'addr'].map((id) => (
            <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
              {id === 'orders' ? t('account.tabOrders') : id === 'profile' ? t('account.tabProfile') : t('account.tabAddr')}
            </button>
          ))}
        </div>
        <button className="btn btn-sm btn-ghost" onClick={logout}>{t('account.logout')}</button>
      </div>

      {tab === 'orders' && (
        <div>
          {mine.length === 0 && (
            <div className="empty">
              <h2>{t('account.noOrders')}</h2>
              <Link className="btn" to="/shop">{t('nav.shop')}</Link>
            </div>
          )}
          {mine.map((o) => (
            <article className="order" key={o.id}>
              <div className="order-h">
                <div>
                  <strong>{t('account.order')} {o.no}</strong>
                  <div className="muted">{formatDate(o.createdAt, lang)}</div>
                </div>
                <span className="status">{t(`account.${o.status}`)}</span>
              </div>
              <div className="muted">
                {o.items.map((i) => `${i.name?.[lang] || ''} × ${i.qty}`).join(' · ')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{formatPrice(o.total, lang)}</span>
                <Link to={`/order/${o.id}`}>{t('home.viewProduct')} →</Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === 'profile' && (
        <form style={{ display: 'grid', gap: 12, maxWidth: 460 }} onSubmit={async (e) => {
          e.preventDefault()
          setErr('')
          if (form.password) {
            const policy = passwordPolicy(form.password)
            if (policy) return setErr(t(`account.${policy}`))
          }
          const res = await updateProfile({
            name: form.name,
            phone: form.phone,
            ...(form.password ? { password: form.password } : {}),
          })
          if (!res.ok && res.error) setErr(t(`account.${res.error}`))
          else setForm({ ...form, password: '' })
        }}>
          <label className="field"><span>{t('account.name')}</span>
            <input autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="field"><span>{t('checkout.email')}</span>
            <input value={user.email} disabled autoComplete="username" />
          </label>
          <label className="field"><span>{t('account.phone')}</span>
            <input autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="field"><span>{t('account.changePass')}</span>
            <input type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          {err && <p style={{ color: 'var(--danger)' }}>{err}</p>}
          <button className="btn" type="submit">{t('account.save')}</button>
        </form>
      )}

      {tab === 'addr' && (
        <form className="form-grid" style={{ maxWidth: 560 }} onSubmit={async (e) => {
          e.preventDefault()
          await updateProfile({ address: { line: form.line, city: form.city, zip: form.zip, country: form.country } })
        }}>
          <label className="field full"><span>{t('checkout.line')}</span>
            <input autoComplete="street-address" value={form.line} onChange={(e) => setForm({ ...form, line: e.target.value })} />
          </label>
          <label className="field"><span>{t('checkout.city')}</span>
            <input autoComplete="address-level2" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </label>
          <label className="field"><span>{t('checkout.zip')}</span>
            <input autoComplete="postal-code" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
          </label>
          <label className="field full"><span>{t('checkout.country')}</span>
            <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
              {COUNTRIES.map((c) => <option key={c.id} value={c.id}>{c[lang]}</option>)}
            </select>
          </label>
          <button className="btn" type="submit">{t('account.save')}</button>
        </form>
      )}
    </div>
  )
}
