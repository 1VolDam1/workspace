import { useEffect } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useStore } from '../store/Store'
import { eta, formatDate, formatPrice, paypalCheckoutUrl } from '../lib/utils'

export default function Success() {
  const { id } = useParams()
  const loc = useLocation()
  const [sp] = useSearchParams()
  const { t, lang, orders, pay, notify, markPaid } = useStore()
  const order = loc.state?.order || orders.find((o) => o.id === id)
  const paypal = String(pay?.paypal || '').trim()

  useEffect(() => {
    if (!order) return
    if (sp.get('paid') === '1' && order.status !== 'paid') markPaid(order.id)
  }, [order, sp, markPaid])

  if (!order) {
    return (
      <div className="wrap empty">
        <h2>{t('notFound.title')}</h2>
        <Link className="btn" to="/account">{t('nav.account')}</Link>
      </div>
    )
  }

  const live = orders.find((o) => o.id === order.id) || order
  const paid = live.status === 'paid'
  const origin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''
  const payUrl = paypal
    ? paypalCheckoutUrl({
      email: paypal,
      amount: live.total,
      no: live.no,
      returnUrl: `${origin}#/order/${live.id}?paid=1`,
      cancelUrl: `${origin}#/order/${live.id}`,
    })
    : ''

  const copyPay = async () => {
    try {
      await navigator.clipboard.writeText(paypal)
      notify(t('toast.copied'))
    } catch { /* */ }
  }

  return (
    <div className="wrap success">
      <p className="kicker">{t('success.kicker')}</p>
      <h1 className="display">{paid ? t('success.paidOk') : t('success.title')}</h1>
      <p className="lead muted">{t('success.lead', { n: live.no, email: live.email })}</p>

      {!paid && (
        <div className="sum" style={{ position: 'static', marginTop: 28, gap: 14 }}>
          <strong>PayPal</strong>
          {paypal ? (
            <>
              <div className="sum-row">
                <span>{t('success.payTo')}</span>
                <b>{paypal}</b>
              </div>
              <p className="muted" style={{ fontSize: 14 }}>{t('success.payHint')}</p>
              <a className="btn paypal-btn btn-full" href={payUrl} rel="noopener noreferrer">
                {t('success.payNow', { n: formatPrice(live.total, lang) })}
              </a>
              <button type="button" className="btn btn-ghost btn-full" onClick={() => markPaid(live.id)}>
                {t('success.iPaid')}
              </button>
              <button type="button" className="muted" onClick={copyPay}>
                {t('success.copy')}: {paypal}
              </button>
            </>
          ) : (
            <p>
              {t('success.payNeed')}{' '}
              <Link to="/account">{t('account.tabPay')}</Link>
            </p>
          )}
        </div>
      )}

      {paid && (
        <div className="sum" style={{ position: 'static', marginTop: 28 }}>
          <div className="sum-row big"><span>{t('account.status')}</span><b className="status">{t('account.paid')}</b></div>
        </div>
      )}

      <div className="sum" style={{ position: 'static', marginTop: 28 }}>
        <div className="sum-row"><span>{t('account.order')}</span><b>{live.no}</b></div>
        <div className="sum-row"><span>{t('account.date')}</span><span>{formatDate(live.createdAt, lang)}</span></div>
        <div className="sum-row"><span>{t('success.when')}</span><span>{eta(live.method, lang)}</span></div>
        <div className="sum-row"><span>{t('checkout.payMethod')}</span><span>PayPal</span></div>
        <div className="sum-row big"><span>{t('cart.grand')}</span><b>{formatPrice(live.total, lang)}</b></div>
        {live.items.map((i, idx) => (
          <div className="sum-row" key={idx}>
            <span>{i.name?.[lang] || ''} × {i.qty}</span>
            <span>{formatPrice(i.line, lang)}</span>
          </div>
        ))}
      </div>
      <h3 className="serif" style={{ fontSize: 28, marginTop: 32 }}>{t('success.next')}</h3>
      <ol>
        <li>{t('success.s1')}</li>
        <li>{t('success.s2')}</li>
        <li>{t('success.s3')}</li>
      </ol>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link className="btn" to="/shop">{t('success.again')}</Link>
        <Link className="btn btn-ghost" to="/account">{t('success.account')}</Link>
      </div>
    </div>
  )
}
