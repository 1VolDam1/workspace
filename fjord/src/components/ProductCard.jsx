import { Link } from 'react-router-dom'
import { useStore } from '../store/Store'
import { formatPrice } from '../lib/utils'
import { I } from './Icons'
import SafeImg from './SafeImg'

export default function ProductCard({ p, list = false }) {
  const { lang, t, wish, toggleWish, addToCart, setUi } = useStore()
  if (!p) return null
  const saved = wish.includes(p.id)
  const sold = p.stock <= 0
  const tags = p.tags || []

  return (
    <article className={list ? 'list-card' : 'pcard'}>
      <div className="pcard-media" style={list ? { aspectRatio: 'auto' } : undefined}>
        <Link to={`/product/${p.id}`} className="pcard-link">
          <SafeImg src={p.images[0]} alt={p.name[lang]} />
        </Link>
        <div className="pcard-badges">
          {tags.includes('new') && <span className="badge badge-new">{t('common.new')}</span>}
          {tags.includes('sale') && <span className="badge badge-sale">{t('common.sale')}</span>}
          {tags.includes('bestseller') && <span className="badge badge-best">{t('common.best')}</span>}
          {sold && <span className="badge">{t('common.sold')}</span>}
        </div>
        <button
          type="button"
          className="wish-abs"
          aria-label={t('nav.wishlist')}
          onClick={() => toggleWish(p.id)}
        >
          {saved ? I.heartFill() : I.heart()}
        </button>
      </div>
      <div>
        <Link to={`/product/${p.id}`} className="pcard-name">{p.name[lang]}</Link>
        <p className="muted" style={{ fontSize: 14, margin: '4px 0 6px' }}>{p.blurb[lang]}</p>
        <div className="pcard-meta">
          <span>
            {p.compareAt && <span className="price-old">{formatPrice(p.compareAt, lang)}</span>}
            <span className={p.compareAt ? 'price-now' : ''}>{formatPrice(p.price, lang)}</span>
          </span>
        </div>
        <div className="pcard-actions">
          <button type="button" className="btn btn-sm" disabled={sold} onClick={() => addToCart(p.id)}>
            {t('product.add')}
          </button>
          <button type="button" className="btn btn-sm btn-line" onClick={() => setUi({ quick: p.id })}>
            {t('common.quick')}
          </button>
        </div>
      </div>
    </article>
  )
}
