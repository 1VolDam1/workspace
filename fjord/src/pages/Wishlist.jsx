import { Link } from 'react-router-dom'
import { useStore } from '../store/Store'
import ProductCard from '../components/ProductCard'

export default function Wishlist() {
  const { t, wish, products, addToCart, setUi } = useStore()
  const list = products.filter((p) => wish.includes(p.id))

  return (
    <div className="wrap" style={{ paddingBottom: 80 }}>
      <header className="page-head">
        <p className="kicker">{t('nav.wishlist')}</p>
        <h1 className="display">{t('wish.title')}</h1>
      </header>
      {list.length === 0 ? (
        <div className="empty">
          <h2>{t('wish.empty')}</h2>
          <Link className="btn" to="/shop">{t('nav.shop')}</Link>
        </div>
      ) : (
        <>
          <div style={{ margin: '12px 0 24px' }}>
            <button className="btn" onClick={() => {
              list.forEach((p) => p.stock > 0 && addToCart(p.id, { silent: true }))
              setUi({ cartOpen: true })
            }}>
              {t('wish.move')}
            </button>
          </div>
          <div className="grid-4">
            {list.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </>
      )}
    </div>
  )
}
