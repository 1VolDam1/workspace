import { useState } from 'react'
import { useStore } from '../store/Store'

export default function FAQ() {
  const { t } = useStore()
  const items = Array.isArray(t('faq.items')) ? t('faq.items') : []
  const [open, setOpen] = useState(0)
  return (
    <div className="wrap" style={{ paddingBottom: 80 }}>
      <header className="page-head">
        <p className="kicker">{t('nav.faq')}</p>
        <h1 className="display" style={{ maxWidth: '16ch' }}>{t('faq.title')}</h1>
      </header>
      <div style={{ maxWidth: 800, marginTop: 12 }}>
        {items.map((it, i) => (
          <div className="faq-item" key={it.q}>
            <button onClick={() => setOpen(open === i ? -1 : i)}>
              {it.q}<span>{open === i ? '–' : '+'}</span>
            </button>
            {open === i && <p>{it.a}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
