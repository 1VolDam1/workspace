import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/Store'
import { COUNTRIES, emailOk, formatPrice, shippingCost, eta } from '../lib/utils'

const empty = {
  email: '', phone: '', name: '',
  line: '', city: 'Riga', zip: '', country: 'LV',
  notes: '', method: 'standard', pay: 'paypal',
  terms: false, saveAddr: true,
}

export default function Checkout() {
  const nav = useNavigate()
  const { t, lang, cart, user, totals, placeOrder, updateProfile, pay, setPay } = useStore()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(() => ({
    ...empty,
    email: user?.email || '',
    name: user?.name || '',
    phone: user?.phone || '',
    ...(user?.address || {}),
  }))
  const [errs, setErrs] = useState({})
  const [busy, setBusy] = useState(false)
  const [shopMail, setShopMail] = useState(pay?.paypal || '')

  const ship = shippingCost(form.country, form.method, totals.subtotal, totals.freeShip)
  const grand = Math.max(0, totals.subtotal - totals.discount + ship)
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }))
  const paypalReady = emailOk(pay?.paypal)

  const validate = (n) => {
    const e = {}
    if (n === 1) {
      if (!form.name.trim()) e.name = t('val.required')
      if (!emailOk(form.email)) e.email = t('val.email')
      if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 6) e.phone = t('val.phone')
      if (!form.line.trim()) e.line = t('val.required')
      if (!form.city.trim()) e.city = t('val.required')
      if (!form.zip.trim()) e.zip = t('val.zip')
    }
    if (n === 3) {
      if (form.pay === 'paypal' && !emailOk(pay?.paypal || shopMail)) e.paypal = t('success.payNeed')
      if (!form.terms) e.terms = t('val.terms')
    }
    setErrs(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (step === 1 && !validate(1)) return
    setStep((s) => Math.min(3, s + 1))
  }

  const saveShopPay = () => {
    const em = shopMail.trim().toLowerCase()
    if (!emailOk(em)) return
    setPay({ paypal: em })
  }

  const submit = async () => {
    if (form.pay === 'paypal' && !paypalReady) saveShopPay()
    if (!validate(3)) return
    setBusy(true)
    const res = placeOrder({ ...form, pay: form.pay })
    if (res.ok) {
      if (user && form.saveAddr) {
        await updateProfile({
          phone: form.phone,
          address: { line: form.line, city: form.city, zip: form.zip, country: form.country },
        }, { silent: true })
      }
      nav(`/order/${res.order.id}`, { state: { order: res.order } })
    } else {
      setBusy(false)
    }
  }

  const methods = useMemo(() => ([
    { id: 'standard', title: t('checkout.standard'), hint: eta('standard', lang), price: shippingCost(form.country, 'standard', totals.subtotal, totals.freeShip) },
    { id: 'express', title: t('checkout.express'), hint: eta('express', lang), price: shippingCost(form.country, 'express', totals.subtotal, totals.freeShip) },
    { id: 'pickup', title: t('checkout.pickup'), hint: t('checkout.pickupAddr'), price: 0 },
  ]), [t, lang, form.country, totals.subtotal, totals.freeShip])

  if (!cart.length) {
    return (
      <div className="wrap empty">
        <h2>{t('cart.empty')}</h2>
        <Link className="btn" to="/shop">{t('cart.browse')}</Link>
      </div>
    )
  }

  return (
    <div className="wrap check-page">
      <div>
        <header className="page-head" style={{ paddingTop: 0 }}>
          <p className="kicker">{user ? t('account.hello', { name: user.name }) : t('checkout.guest')}</p>
          <h1 className="display">{t('checkout.title')}</h1>
        </header>
        <div className="steps">
          {[1, 2, 3].map((n) => (
            <div className={`step ${step === n ? 'on' : ''}`} key={n}>
              <i>{n}</i>
              {n === 1 ? t('checkout.step1') : n === 2 ? t('checkout.step2') : t('checkout.step3')}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="form-grid">
            <Field label={t('checkout.name')} err={errs.name} className="full">
              <input value={form.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label={t('checkout.email')} err={errs.email}>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <Field label={t('checkout.phone')} err={errs.phone}>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+371" />
            </Field>
            <Field label={t('checkout.line')} err={errs.line} className="full">
              <input value={form.line} onChange={(e) => set('line', e.target.value)} />
            </Field>
            <Field label={t('checkout.city')} err={errs.city}>
              <input value={form.city} onChange={(e) => set('city', e.target.value)} />
            </Field>
            <Field label={t('checkout.zip')} err={errs.zip}>
              <input value={form.zip} onChange={(e) => set('zip', e.target.value)} />
            </Field>
            <Field label={t('checkout.country')} className="full">
              <select value={form.country} onChange={(e) => set('country', e.target.value)}>
                {COUNTRIES.map((c) => <option key={c.id} value={c.id}>{c[lang]}</option>)}
              </select>
            </Field>
            <Field label={t('checkout.notes')} className="full">
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder={t('checkout.notesPh')} />
            </Field>
            {user && (
              <label className="chk full">
                <input type="checkbox" checked={form.saveAddr} onChange={(e) => set('saveAddr', e.target.checked)} />
                {t('checkout.saveAddr')}
              </label>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="ship-opts">
            {methods.map((m) => (
              <button type="button" key={m.id} className={`opt ${form.method === m.id ? 'on' : ''}`} onClick={() => set('method', m.id)}>
                <span />
                <span>
                  <strong>{m.title}</strong>
                  <div className="muted" style={{ fontSize: 13 }}>{m.hint}</div>
                </span>
                <span>{m.price === 0 ? '—' : formatPrice(m.price, lang)}</span>
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'grid', gap: 16 }}>
            <button
              type="button"
              className={`opt paypal-opt ${form.pay === 'paypal' ? 'on' : ''}`}
              onClick={() => set('pay', 'paypal')}
            >
              <span className="paypal-mark">P</span>
              <span>
                <strong>PayPal</strong>
                <div className="muted" style={{ fontSize: 13 }}>{t('checkout.paypalHint')}</div>
                {paypalReady && <div style={{ marginTop: 6 }}>{t('success.payTo')}: <b>{pay.paypal}</b></div>}
              </span>
              <span>{formatPrice(grand, lang)}</span>
            </button>

            {!paypalReady && (
              <Field label={t('account.paypalEmail')} err={errs.paypal} className="full">
                <input
                  type="email"
                  placeholder="you@paypal.com"
                  value={shopMail}
                  onChange={(e) => setShopMail(e.target.value)}
                  onBlur={saveShopPay}
                />
              </Field>
            )}

            <label className="chk">
              <input type="checkbox" checked={form.terms} onChange={(e) => set('terms', e.target.checked)} />
              {t('checkout.terms')}
            </label>
            {errs.terms && <span className="err" style={{ color: 'var(--danger)', fontSize: 13 }}>{errs.terms}</span>}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {step > 1 && <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>{t('checkout.back')}</button>}
          {step < 3 && <button type="button" className="btn" onClick={next}>{t('checkout.next')}</button>}
          {step === 3 && (
            <button type="button" className="btn paypal-btn" disabled={busy} onClick={submit}>
              {busy ? t('checkout.placing') : t('checkout.paypalBtn', { n: formatPrice(grand, lang) })}
            </button>
          )}
        </div>
      </div>

      <aside className="sum">
        <h3 className="serif" style={{ fontSize: 28 }}>{t('checkout.summary')}</h3>
        {totals.items.map((i) => (
          <div className="sum-row" key={i.key}>
            <span>{i.product?.name[lang]} × {i.qty}</span>
            <span>{formatPrice(i.line, lang)}</span>
          </div>
        ))}
        <hr className="fade" />
        <div className="sum-row"><span>{t('cart.sub')}</span><span>{formatPrice(totals.subtotal, lang)}</span></div>
        {totals.discount > 0 && <div className="sum-row"><span>{t('cart.discount')}</span><span>−{formatPrice(totals.discount, lang)}</span></div>}
        <div className="sum-row"><span>{t('cart.ship')}</span><span>{ship === 0 ? '—' : formatPrice(ship, lang)}</span></div>
        <div className="sum-row big"><span>{t('cart.grand')}</span><b>{formatPrice(grand, lang)}</b></div>
        <p className="muted" style={{ fontSize: 13 }}>{t('cart.vat')}</p>
      </aside>
    </div>
  )
}

function Field({ label, err, className = '', children }) {
  return (
    <label className={`field ${className} ${err ? 'invalid' : ''}`}>
      <span>{label}</span>
      {children}
      {err && <span className="err">{err}</span>}
    </label>
  )
}
