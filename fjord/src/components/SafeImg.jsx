import { useState } from 'react'

export default function SafeImg({ src, alt = '', className, style }) {
  const [ok, setOk] = useState(true)
  if (!src || !ok) {
    return (
      <div className={className} style={{
        ...style,
        background: 'linear-gradient(145deg, #e8dfd2, #cfc3b0)',
        display: 'grid',
        placeItems: 'center',
        color: '#6b645b',
        fontFamily: 'Cormorant Garamond, serif',
        letterSpacing: '0.18em',
        fontSize: 18,
      }}>
        FJORD
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setOk(false)}
    />
  )
}
