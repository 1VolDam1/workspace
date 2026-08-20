import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { err: null }
  }
  static getDerivedStateFromError(err) {
    return { err }
  }
  render() {
    if (!this.state.err) return this.props.children
    return (
      <div style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', padding: 32, fontFamily: 'Outfit, sans-serif', background: '#f3eee6', color: '#1a1714' }}>
        <div style={{ maxWidth: 480 }}>
          <p style={{ letterSpacing: '0.2em', fontSize: 12 }}>FJORD</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 40, fontWeight: 500, margin: '8px 0 12px' }}>Ошибка</h1>
          <p style={{ color: '#6b645b' }}>Обновите страницу. Если снова белый экран — очистите данные сайта.</p>
          {this.state.err?.message && (
            <p style={{ fontSize: 13, color: '#8f3a2c', marginTop: 12 }}>{String(this.state.err.message)}</p>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ marginTop: 20, minHeight: 44, padding: '0 18px', background: '#1a1714', color: '#f3eee6', border: 0, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 12 }}
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}
