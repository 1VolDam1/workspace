import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../store/Store'
import { formatPrice, avgRating, emailOk } from '../lib/utils'
import { Stars } from '../components/Icons'
import ProductCard from '../components/ProductCard'
import SafeImg from '../components/SafeImg'

export default function Product() {
  const { id } = useParams()
  const s = useStore()
  const p = s.product(id)
  const [img, setImg] = useState(0)
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)
  const [gift, setGift] = useState(false)
  const [open, setOpen] = useState('details')
  const [rev, setRev] = useState({ name: s.user?.name || '', stars: 5, text: '' })
  const [wait, setWait] = useState('')
  const [waited, setWaited] = useState(false)

  useEffect(() => {
    if (!p) return
    setImg(0)
    setColor(p.colors[0]?.id || '')
    setSize(p.sizes?.[0] || '')
    setQty(1)
    s.viewProduct(p.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p?.id])

  if (!p) {
    return (
      <div className="wrap empty">
        <h2>{s.t('notFound.title')}</h2>
        <Link className="btn" to="/shop">{s.t('notFound.btn')}</Link>
      </div>
    )
  }

  const reviews = s.reviewsFor(p.id)
  const { rating, count } = avgRating(reviews)
  const related = s.products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4)
  const viewed = s.viewed.map((vid) => s.product(vid)).filter((x) => x && x.id !== p.id).slice(0, 4)
  const sold = p.stock <= 0
  const colorName = p.colors.find((c) => c.id === color)?.[s.lang]

  return (
    <div className="wrap">
      <div className="product">
        <div className="gallery">
          <div className="gallery-main">
            <SafeImg src={p.images[img]} alt={p.name[s.lang]} />
          </div>
          <div className="thumbs">
            {p.images.map((src, i) => (
              <button key={src} className={img === i ? 'on' : ''} onClick={() => setImg(i)}>
                <SafeImg src={src} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="pinfo">
          <p className="kicker">{p.sku} · {p.origin[s.lang]}</p>
          <h1>{p.name[s.lang]}</h1>
          <p className="lead">{p.blurb[s.lang]}</p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Stars value={rating || 5} />
            <span className="muted">{count} · {sold ? s.t('product.sold') : p.stock < 4 ? s.t('product.low', { n: p.stock }) : s.t('product.stock', { n: p.stock })}</span>
          </div>
          <p className="price-lg">
            {p.compareAt && <span className="price-old">{formatPrice(p.compareAt, s.lang)}</span>}
            <span className={p.compareAt ? 'price-now' : ''}>{formatPrice(p.price, s.lang)}</span>
          </p>

          <div>
            <p className="kicker">{s.t('product.color')}{colorName ? ` — ${colorName}` : ''}</p>
            <div className="swatches" style={{ marginTop: 8 }}>
              {p.colors.map((c) => (
                <button
                  key={c.id}
                  className={`swatch ${color === c.id ? 'on' : ''}`}
                  style={{ background: c.hex }}
                  title={c[s.lang]}
                  onClick={() => setColor(c.id)}
                />
              ))}
            </div>
          </div>

          {p.sizes && (
            <div>
              <p className="kicker">{s.t('product.size')}</p>
              <div className="sizes" style={{ marginTop: 8 }}>
                {p.sizes.map((sz) => (
                  <button key={sz} className={size === sz ? 'on' : ''} onClick={() => setSize(sz)}>{sz}</button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="kicker">{s.t('product.qty')}</p>
            <div className="qty" style={{ marginTop: 8 }}>
              <button onClick={() => setQty((n) => Math.max(1, n - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((n) => Math.min(p.stock || 1, n + 1))}>+</button>
            </div>
          </div>

          <label className="chk">
            <input type="checkbox" checked={gift} onChange={() => setGift((v) => !v)} />
            {s.t('product.gift')}
          </label>

          {sold ? (
            <form onSubmit={(e) => {
              e.preventDefault()
              if (!emailOk(wait)) return
              s.waitFor(p.id, wait)
              setWaited(true)
            }} className="form-grid" style={{ gridTemplateColumns: '1fr auto' }}>
              <div className="field">
                <input type="email" placeholder={s.t('footer.email')} value={wait} onChange={(e) => setWait(e.target.value)} required />
              </div>
              <button className="btn" disabled={waited}>{waited ? s.t('product.notified') : s.t('product.wait')}</button>
            </form>
          ) : (
            <div className="buy-row">
              <button className="btn" onClick={() => s.addToCart(p.id, { color, size, qty, gift })}>
                {s.t('product.add')}
              </button>
              <button className="btn btn-ghost" onClick={() => s.toggleWish(p.id)}>
                {s.wish.includes(p.id) ? s.t('product.wished') : s.t('product.wish')}
              </button>
            </div>
          )}

          <div className="acc">
            {[
              ['details', s.t('product.details'), p.description[s.lang] + ` · ${s.t('product.dims')}: ${p.dims}. ${s.t('product.weight')}: ${p.weight} ${s.t('product.kg')}.`],
              ['care', s.t('product.care'), p.care[s.lang]],
              ['ship', s.t('product.ship'), s.t('product.shipBody')],
            ].map(([k, title, body]) => (
              <div className="acc-item" key={k}>
                <button onClick={() => setOpen(open === k ? '' : k)}>
                  {title}<span>{open === k ? '–' : '+'}</span>
                </button>
                {open === k && <p>{body}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 10 }}>
        <h2 className="serif" style={{ fontSize: 40, marginBottom: 16 }}>{s.t('product.reviews')}</h2>
        <div className="reviews">
          {reviews.length === 0 && <p className="muted">{s.t('product.noReviews')}</p>}
          {reviews.map((r) => (
            <article className="review" key={r.id}>
              <div className="review-h">
                <strong>{r.name}</strong>
                <Stars value={r.stars} />
              </div>
              <p>{r[s.lang] || r.en}</p>
              <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>{r.date}</p>
            </article>
          ))}
        </div>
        <div style={{ marginTop: 24, maxWidth: 520 }}>
          <h3 className="serif" style={{ fontSize: 28, marginBottom: 12 }}>{s.t('product.write')}</h3>
          {s.user ? (
            <form onSubmit={(e) => {
              e.preventDefault()
              if (!rev.text.trim()) return
              s.addReview(p.id, { name: rev.name || s.user.name, stars: rev.stars, text: rev.text.trim() })
              setRev({ ...rev, text: '' })
            }} style={{ display: 'grid', gap: 12 }}>
              <div className="field">
                <span>{s.t('product.yourName')}</span>
                <input value={rev.name} onChange={(e) => setRev({ ...rev, name: e.target.value })} />
              </div>
              <div className="sizes">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} className={rev.stars === n ? 'on' : ''} onClick={() => setRev({ ...rev, stars: n })}>{n}★</button>
                ))}
              </div>
              <div className="field">
                <span>{s.t('product.yourReview')}</span>
                <textarea value={rev.text} onChange={(e) => setRev({ ...rev, text: e.target.value })} required />
              </div>
              <button className="btn" type="submit">{s.t('product.sendReview')}</button>
            </form>
          ) : (
            <p className="muted">{s.t('product.needAuth')} <Link to="/account">{s.t('account.login')}</Link></p>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <h2 className="serif" style={{ fontSize: 40, marginBottom: 20 }}>{s.t('product.related')}</h2>
          <div className="grid-4">{related.map((x) => <ProductCard key={x.id} p={x} />)}</div>
        </section>
      )}
      {viewed.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <h2 className="serif" style={{ fontSize: 40, marginBottom: 20 }}>{s.t('product.viewed')}</h2>
          <div className="grid-4">{viewed.map((x) => <ProductCard key={x.id} p={x} />)}</div>
        </section>
      )}
    </div>
  )
}
