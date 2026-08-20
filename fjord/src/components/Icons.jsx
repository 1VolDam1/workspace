const svg = (d) => (
  <svg viewBox="0 0 24 24">{d}</svg>
)

export const I = {
  search: () => svg(<><circle cx="11" cy="11" r="6.5" /><path d="M16 16l5 5" /></>),
  bag: () => svg(<><path d="M6 8h12l-1 13H7L6 8z" /><path d="M9 8V7a3 3 0 016 0v1" /></>),
  heart: () => svg(<path d="M12 20s-7-4.4-9.2-8.2C1 9.2 2.2 6 5.4 6c1.9 0 3.2 1.1 3.8 2.2C9.8 7.1 11.1 6 13 6c3.2 0 4.4 3.2 2.6 5.8C13.4 15.6 12 20 12 20z" />),
  heartFill: () => svg(<path fill="currentColor" stroke="currentColor" d="M12 20s-7-4.4-9.2-8.2C1 9.2 2.2 6 5.4 6c1.9 0 3.2 1.1 3.8 2.2C9.8 7.1 11.1 6 13 6c3.2 0 4.4 3.2 2.6 5.8C13.4 15.6 12 20 12 20z" />),
  user: () => svg(<><circle cx="12" cy="8" r="3.2" /><path d="M5 19c1.4-3 4-4.5 7-4.5S17.6 16 19 19" /></>),
  close: () => svg(<path d="M6 6l12 12M18 6L6 18" />),
  menu: () => svg(<path d="M4 7h16M4 12h16M4 17h16" />),
  sun: () => svg(<><circle cx="12" cy="12" r="3.5" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" /></>),
  moon: () => svg(<path d="M16 13.5A6.5 6.5 0 1110.5 4 5.2 5.2 0 0016 13.5z" />),
}

export function Stars({ value }) {
  const full = Math.round(value)
  return (
    <span className="stars" aria-label={`${value}`}>
      {'★★★★★'.slice(0, full)}
      <span style={{ opacity: 0.28 }}>{'★★★★★'.slice(full)}</span>
    </span>
  )
}
