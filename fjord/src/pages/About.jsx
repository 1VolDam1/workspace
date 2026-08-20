import { Link } from 'react-router-dom'
import { useStore } from '../store/Store'
import SafeImg from '../components/SafeImg'

const TEAM = [
  { n: 'Agnese Vītola', en: 'Founder, buyer', ru: 'Основательница, закупки', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80' },
  { n: 'Jānis Berziņš', en: 'Workshop, oak', ru: 'Мастерская, дуб', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80' },
  { n: 'Milda Kazlauskaitė', en: 'Linen & wool', ru: 'Лён и шерсть', img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&q=80' },
]

export default function About() {
  const { t, lang } = useStore()
  return (
    <div className="wrap">
      <header className="page-head">
        <p className="kicker">{t('about.kicker')}</p>
        <h1 className="display" style={{ maxWidth: '16ch' }}>{t('about.title')}</h1>
      </header>
      <div className="split">
        <div className="prose">
          <p>{t('about.p1')}</p>
          <p>{t('about.p2')}</p>
          <p>{t('about.p3')}</p>
          <p><strong>{t('about.hours')}</strong><br />Thu–Sat 11:00–18:00<br />{t('about.addr')}</p>
          <Link className="btn" to="/contact" style={{ justifySelf: 'start' }}>{t('nav.contact')}</Link>
        </div>
        <SafeImg
          src="https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1200&q=80"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 360 }}
        />
      </div>
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="serif" style={{ fontSize: 40, marginBottom: 20 }}>{t('about.team')}</h2>
        <div className="grid-3">
          {TEAM.map((m) => (
            <article key={m.n}>
              <SafeImg src={m.img} alt="" style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', marginBottom: 12 }} />
              <h3 className="serif" style={{ fontSize: 26 }}>{m.n}</h3>
              <p className="muted">{m[lang]}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
