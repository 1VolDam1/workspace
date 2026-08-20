import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useStore } from '../store/Store'
import { formatPrice, applyPromo } from '../lib/utils'
import ProductCard from '../components/ProductCard'
import SafeImg from '../components/SafeImg'

export default function Cart() {
  const { t, lang, cart, product, updateQty, removeFromCart, toggleGift, totals, promo, setPromo, notify, products } = useStore()
  const [code, setCode] = useState(promo)
  const [err, setErr] = useState('')

  const rec = products.filter((p) => p.tags.includes('bestseller') && !cart.some((i) => i.id === p.id)).slice(0, 4)
  const toFree = Math.max(0, 80 - totals.subtotal)

  const apply = () => {
    const res = applyPromo(code, cart, products, totals.subtotal)
    if (!res.ok) {
      setErr(res.need ? t('cart.needMin', { n: formatPrice(res.need, lang) }) : t('cart.invalid'))
      return
    }
    setPromo(code.toUpperCase())
    setErr('')
    notify(t('toast.promo'))
  }

  if (!cart.length) {
    return (
      <div className="wrap empty">
        <p className="kicker">{t('nav.cart')}</p>
        <h2>{t('cart.empty')}</h2>
        <Link className="btn" to="/shop">{t('cart.browse')}</Link>
      </div>
    )
  }

  return (
    <div className="wrap cart-page">
      <div>
        <header className="page-head" style={{ paddingTop: 0 }}>
          <p className="kicker">{t('nav.cart')}</p>
          <h1 className="display">{t('cart.title')}</h1>
        </header>
        {cart.map((i) => {
          const p = product(i.id)
          if (!p) return null
          return (
            <div className="line" key={i.key}>
              <Link to={`/product/${p.id}`}><SafeImg src={p.images[0]} alt="" /></Link>
              <div>
                <Link to={`/product/${p.id}`}><h4>{p.name[lang]}</h4></Link>
                <p className="muted" style={{ fontSize: 14 }}>
                  {p.colors.find((c) => c.id === i.color)?.[lang]}
                  {i.size ? ` · ${i.size}` : ''}
                  {i.gift ? ` · ${t('cart.gift')}` : ''}
                </p>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                  <div className="qty">
                    <button onClick={() => updateQty(i.key, i.qty - 1)}>−</button>
                    <span>{i.qty}</span>
                    <button onClick={() => updateQty(i.key, i.qty + 1)}>+</button>
                  </div>
                  <label className="chk">
                    <input type="checkbox" checked={!!i.gift} onChange={() => toggleGift(i.key)} />
                    {t('product.gift')}
                  </label>
                  <button className="muted" onClick={() => removeFromCart(i.key)}>{t('cart.remove')}</button>
                </div>
              </div>
              <strong>{formatPrice(p.price * i.qty + (i.gift ? 8 * i.qty : 0), lang)}</strong>
            </div>
          )
        })}
        {rec.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h3 className="serif" style={{ fontSize: 32, marginBottom: 16 }}>{t('cart.rec')}</h3>
            <div className="grid-3">{rec.slice(0, 3).map((p) => <ProductCard key={p.id} p={p} />)}</div>
          </div>
        )}
      </div>
      <aside className="sum">
        <h3 className="serif" style={{ fontSize: 28 }}>{t('checkout.summary')}</h3>
        <div className="sum-row"><span>{t('cart.sub')}</span><span>{formatPrice(totals.subtotal, lang)}</span></div>
        {totals.discount > 0 && <div className="sum-row"><span>{t('cart.discount')}</span><span>−{formatPrice(totals.discount, lang)}</span></div>}
        <div className="sum-row"><span>{t('cart.ship')}</span><span>{t('cart.shipCalc')}</span></div>
        <div className="sum-row big"><span>{t('cart.grand')}</span><b>{formatPrice(Math.max(0, totals.subtotal - totals.discount), lang)}</b></div>
        <p className="muted" style={{ fontSize: 13 }}>{t('cart.vat')}</p>
        {toFree > 0 && <p className="muted" style={{ fontSize: 13 }}>{t('cart.freeShipHint', { n: toFree })}</p>}
        <div className="promo-row">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('cart.promo')} />
          <button className="btn btn-sm" onClick={apply}>{t('cart.apply')}</button>
        </div>
        {promo && totals.promoOk && <p className="muted">{t('cart.applied')}: {promo.toUpperCase()}</p>}
        {err && <p className="field"><span className="err">{err}</span></p>}
        <Link className="btn btn-full" to="/checkout">{t('cart.checkout')}</Link>
        <Link className="btn btn-ghost btn-full" to="/shop">{t('cart.continue')}</Link>
      </aside>
    </div>
  )
}
