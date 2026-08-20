import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useStore } from '../store/Store'
import { CATEGORIES, MATERIALS } from '../lib/products'
import { avgRating } from '../lib/utils'
import ProductCard from '../components/ProductCard'

const PER = 9

export default function Shop() {
  const { category } = useParams()
  const [sp] = useSearchParams()
  const q = (sp.get('q') || '').trim().toLowerCase()
  const { t, lang, products, reviewsFor } = useStore()
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('pop')
  const [list, setList] = useState(false)
  const [f, setF] = useState({
    cats: category ? [category] : [],
    mats: [],
    sale: false,
    stock: false,
    min: '',
    max: '',
  })

  // sync category from route
  const routeCat = category || ''
  const filters = { ...f, cats: routeCat ? [routeCat] : f.cats.filter(Boolean) }

  const catTitle = CATEGORIES.find((c) => c.id === routeCat)?.[lang] || t('shop.title')

  useEffect(() => { setPage(1) }, [routeCat, q])

  const filtered = useMemo(() => {
    let listP = products.filter((p) => {
      if (filters.cats.length && !filters.cats.includes(p.category)) return false
      if (filters.mats.length && !filters.mats.includes(p.material)) return false
      if (filters.sale && !p.compareAt && !p.tags.includes('sale')) return false
      if (filters.stock && p.stock <= 0) return false
      if (filters.min && p.price < Number(filters.min)) return false
      if (filters.max && p.price > Number(filters.max)) return false
      if (q) {
        const blob = `${p.name.en} ${p.name.ru} ${p.blurb.en} ${p.blurb.ru} ${p.description.en} ${p.category}`.toLowerCase()
        if (!blob.includes(q)) return false
      }
      return true
    })
    const score = (p) => avgRating([], []).rating + (p.tags.includes('bestseller') ? 5 : 0) + (reviewsFor(p.id).length || 0)
    if (sort === 'pop') listP.sort((a, b) => score(b) - score(a))
    if (sort === 'new') listP.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    if (sort === 'pa') listP.sort((a, b) => a.price - b.price)
    if (sort === 'pd') listP.sort((a, b) => b.price - a.price)
    if (sort === 'name') listP.sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang))
    return listP
  }, [products, filters.cats, filters.mats, filters.sale, filters.stock, filters.min, filters.max, q, sort, lang, reviewsFor])

  const pages = Math.max(1, Math.ceil(filtered.length / PER))
  const safePage = Math.min(page, pages)
  const view = filtered.slice((safePage - 1) * PER, safePage * PER)

  const toggle = (key, id) => {
    setPage(1)
    setF((s) => ({
      ...s,
      [key]: s[key].includes(id) ? s[key].filter((x) => x !== id) : [...s[key], id],
    }))
  }

  return (
    <div className="wrap">
      <header className="page-head">
        <p className="kicker">{q ? `“${q}”` : t('shop.all')}</p>
        <h1 className="display">{catTitle}</h1>
      </header>
      <div className="shop-layout">
        <aside className={`filters ${open ? 'open' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 className="serif" style={{ fontSize: 28 }}>{t('shop.filters')}</h3>
            <button className="filter-toggle" onClick={() => setOpen(false)}>{t('common.close')}</button>
          </div>
          {!routeCat && (
            <div className="filter-block">
              <h4>{t('shop.category')}</h4>
              {CATEGORIES.map((c) => (
                <label className="chk" key={c.id}>
                  <input type="checkbox" checked={f.cats.includes(c.id)} onChange={() => toggle('cats', c.id)} />
                  {c[lang]}
                </label>
              ))}
            </div>
          )}
          <div className="filter-block">
            <h4>{t('shop.material')}</h4>
            {MATERIALS.map((m) => (
              <label className="chk" key={m.id}>
                <input type="checkbox" checked={f.mats.includes(m.id)} onChange={() => toggle('mats', m.id)} />
                {m[lang]}
              </label>
            ))}
          </div>
          <div className="filter-block">
            <h4>{t('shop.price')}</h4>
            <div className="range">
              <input type="number" placeholder="€" value={f.min} onChange={(e) => { setPage(1); setF({ ...f, min: e.target.value }) }} />
              <input type="number" placeholder="€" value={f.max} onChange={(e) => { setPage(1); setF({ ...f, max: e.target.value }) }} />
            </div>
          </div>
          <div className="filter-block">
            <h4>{t('shop.availability')}</h4>
            <label className="chk">
              <input type="checkbox" checked={f.stock} onChange={() => { setPage(1); setF({ ...f, stock: !f.stock }) }} />
              {t('shop.inStock')}
            </label>
            <label className="chk">
              <input type="checkbox" checked={f.sale} onChange={() => { setPage(1); setF({ ...f, sale: !f.sale }) }} />
              {t('shop.onSale')}
            </label>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { setF({ cats: [], mats: [], sale: false, stock: false, min: '', max: '' }); setPage(1) }}>
            {t('shop.clear')}
          </button>
        </aside>
        {open && <div className="overlay" onClick={() => setOpen(false)} />}

        <div>
          <div className="shop-top">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button className="btn btn-sm btn-line filter-toggle" onClick={() => setOpen(true)}>{t('shop.filters')}</button>
              <span className="muted">{t('shop.results', { n: filtered.length })}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label={t('shop.sort')}>
                <option value="pop">{t('shop.sortPop')}</option>
                <option value="new">{t('shop.sortNew')}</option>
                <option value="pa">{t('shop.sortPriceAsc')}</option>
                <option value="pd">{t('shop.sortPriceDesc')}</option>
                <option value="name">{t('shop.sortName')}</option>
              </select>
              <button className="btn btn-sm btn-line" onClick={() => setList((v) => !v)}>
                {list ? t('shop.grid') : t('shop.list')}
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty">
              <h2>{t('shop.empty')}</h2>
              <button className="btn" onClick={() => { setF({ cats: [], mats: [], sale: false, stock: false, min: '', max: '' }); setPage(1) }}>{t('shop.reset')}</button>
            </div>
          ) : list ? (
            <div style={{ display: 'grid', gap: 18 }}>
              {view.map((p) => <ProductCard key={p.id} p={p} list />)}
            </div>
          ) : (
            <div className="grid-3">
              {view.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}

          {pages > 1 && (
            <div className="pager">
              {Array.from({ length: pages }, (_, i) => (
                <button key={i} className={safePage === i + 1 ? 'on' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
