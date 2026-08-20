import { Link } from 'react-router-dom'
import { useStore } from '../store/Store'
import { CATEGORIES } from '../lib/products'
import { avgRating } from '../lib/utils'
import ProductCard from '../components/ProductCard'
import SafeImg from '../components/SafeImg'

const CAT_IMG = {
  furniture: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80',
  lighting: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=900&q=80',
  textiles: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=900&q=80',
  ceramics: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=80',
  accessories: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=900&q=80',
}

export default function Home() {
  const { t, lang, products, reviewsFor } = useStore()
  const featured = products.filter((p) => p.featured).slice(0, 4)
  const best = [...products]
    .sort((a, b) => avgRating(reviewsFor(b.id)).count - avgRating(reviewsFor(a.id)).count)
    .filter((p) => (p.tags || []).includes('bestseller'))
    .slice(0, 4)
  const stories = Array.isArray(t('home.stories')) ? t('home.stories') : []
  const quotes = [
    { n: 'Elīna, Riga', en: 'The Århus chair changed how the evening works in this apartment.', ru: 'Кресло Århus изменило, как в этой квартире устроен вечер.' },
    { n: 'Jonas, Tallinn', en: 'Finally a shop that does not shout. The table arrived with the right marks already imagined.', ru: 'Наконец магазин, который не кричит. Стол приехал уже с правильными следами в воображении.' },
    { n: 'Olga, Vilnius', en: 'Linen that felt finished on the first night. That never happens.', ru: 'Лён, который был готов в первую ночь. Так не бывает.' },
  ]

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">{t('home.kicker')}</p>
          <h1 className="display">{t('home.heroTitle')}</h1>
          <p className="hero-lead">{t('home.heroLead')}</p>
          <div className="hero-actions">
            <Link className="btn" to="/shop">{t('home.shopAll')}</Link>
            <Link className="btn btn-ghost" to="/about">{t('home.ourStory')}</Link>
          </div>
        </div>
        <div className="hero-visual">
          <SafeImg
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80"
            alt=""
          />
          <span className="hero-cap">Riga · 2026</span>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-h">
          <div>
            <p className="kicker">FJORD</p>
            <h2>{t('home.catsTitle')}</h2>
          </div>
        </div>
        <div className="cats">
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={`/shop/${c.id}`} className="cat">
              <SafeImg src={CAT_IMG[c.id]} alt="" />
              <span>{c[lang]}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section wrap">
        <div className="section-h">
          <h2>{t('home.featured')}</h2>
          <Link to="/shop">{t('nav.shop')} →</Link>
        </div>
        <div className="grid-4">
          {featured.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      <section className="editorial">
        <SafeImg src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1400&q=80" alt="" />
        <div className="editorial-copy">
          <p className="kicker">{t('home.editorialKicker')}</p>
          <h2>{t('home.editorialTitle')}</h2>
          <p className="muted" style={{ fontSize: 17, maxWidth: '46ch' }}>{t('home.editorialBody')}</p>
          <div>
            <Link className="btn" to="/about">{t('home.visit')}</Link>
          </div>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-h">
          <h2>{t('home.best')}</h2>
        </div>
        <div className="grid-4">
          {best.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      <section className="section wrap">
        <div className="section-h">
          <h2>{t('home.journal')}</h2>
        </div>
        <div className="stories">
          {stories.map((s) => (
            <article key={s.t} className="story">
              <p className="kicker">Note</p>
              <h3>{s.t}</h3>
              <p className="muted">{s.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section wrap">
        <div className="section-h">
          <h2>{t('home.quotesTitle')}</h2>
        </div>
        <div className="quotes">
          {quotes.map((q) => (
            <blockquote className="quote" key={q.n}>
              <p>“{q[lang]}”</p>
              <span className="kicker">{q.n}</span>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap">
          <p className="kicker" style={{ color: 'inherit', opacity: .7 }}>{t('city')}</p>
          <h2 className="display">{t('home.ctaTitle')}</h2>
          <p>{t('home.ctaBody')}</p>
          <Link className="btn" to="/contact">{t('home.ctaBtn')}</Link>
        </div>
      </section>
    </>
  )
}
