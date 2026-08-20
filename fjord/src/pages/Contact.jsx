import { useState } from 'react'
import { useStore } from '../store/Store'
import { emailOk, save, LS, load } from '../lib/utils'

export default function Contact() {
  const { t } = useStore()
  const [form, setForm] = useState({ name: '', email: '', topic: 'product', message: '' })
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.message.trim()) return setErr(t('val.required'))
    if (!emailOk(form.email)) return setErr(t('val.email'))
    const prev = load(LS.messages, [])
    save(LS.messages, [...prev, { ...form, at: new Date().toISOString() }])
    setSent(true)
  }

  return (
    <div className="wrap split">
      <div>
        <header className="page-head" style={{ paddingTop: 8 }}>
          <p className="kicker">{t('nav.contact')}</p>
          <h1 className="display">{t('contact.title')}</h1>
          <p className="muted" style={{ marginTop: 12, maxWidth: '46ch' }}>{t('contact.lead')}</p>
        </header>
        {sent ? (
          <p style={{ fontSize: 20 }}>{t('contact.sent', { email: form.email })}</p>
        ) : (
          <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
            <label className="field"><span>{t('contact.name')}</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="field"><span>{t('contact.email')}</span>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label className="field"><span>{t('contact.topic')}</span>
              <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                <option value="order">{t('contact.topics.order')}</option>
                <option value="product">{t('contact.topics.product')}</option>
                <option value="visit">{t('contact.topics.visit')}</option>
                <option value="other">{t('contact.topics.other')}</option>
              </select>
            </label>
            <label className="field"><span>{t('contact.message')}</span>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </label>
            {err && <p style={{ color: 'var(--danger)' }}>{err}</p>}
            <button className="btn" type="submit">{t('contact.send')}</button>
          </form>
        )}
      </div>
      <aside>
        <p className="kicker">{t('contact.visitTitle')}</p>
        <h2 className="serif" style={{ fontSize: 36, margin: '8px 0 12px' }}>Miera iela 48<br />Riga LV-1013</h2>
        <p className="muted">Thu–Sat 11:00–18:00<br />hello@fjord.atelier<br />+371 20 000 000</p>
        <div style={{ marginTop: 24, minHeight: 280, background: 'var(--paper-2)', display: 'grid', placeItems: 'center', border: '1px solid var(--line)' }}>
          <span className="kicker">56.973 · 24.131</span>
        </div>
      </aside>
    </div>
  )
}
