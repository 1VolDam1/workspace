import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { StoreProvider } from './store/Store.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

const rootEl = document.getElementById('root')

function fail(err) {
  console.error(err)
  if (!rootEl) return
  rootEl.innerHTML = `
    <div style="min-height:100svh;display:grid;place-items:center;padding:32px;background:#f3eee6;color:#1a1714;font-family:Georgia,serif">
      <div style="max-width:28rem">
        <p style="letter-spacing:.2em;font-size:12px">FJORD</p>
        <h1 style="font-size:42px;font-weight:500;margin:8px 0 12px">The page did not start.</h1>
        <p style="color:#6b645b">Reload once. If it stays blank, open this preview in a new tab.</p>
        <button onclick="location.reload()" style="margin-top:18px;min-height:44px;padding:0 16px;background:#1a1714;color:#f3eee6;border:0;letter-spacing:.12em;text-transform:uppercase;font-size:12px">Reload</button>
      </div>
    </div>`
}

try {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <HashRouter>
          <StoreProvider>
            <App />
          </StoreProvider>
        </HashRouter>
      </ErrorBoundary>
    </StrictMode>,
  )
} catch (err) {
  fail(err)
}
