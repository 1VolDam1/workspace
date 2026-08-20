import { Link } from 'react-router-dom'
import { useStore } from '../store/Store'

export default function NotFound() {
  const { t } = useStore()
  return (
    <div className="wrap empty" style={{ minHeight: '60vh' }}>
      <p className="kicker">404</p>
      <h1 className="display" style={{ fontSize: 64 }}>{t('notFound.title')}</h1>
      <p className="muted">{t('notFound.lead')}</p>
      <Link className="btn" to="/shop">{t('notFound.btn')}</Link>
    </div>
  )
}
