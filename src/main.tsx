import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from './AppProviders.tsx'
import './index.css'

async function enableMocking(): Promise<void> {
  if (!import.meta.env.DEV) return
  const { worker } = await import('./mocks/browser.ts')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

void enableMocking().then(() => {
  const root = document.getElementById('root')
  if (!root) throw new Error('Root element not found')

  createRoot(root).render(
    <StrictMode>
      <AppProviders />
    </StrictMode>,
  )
})
