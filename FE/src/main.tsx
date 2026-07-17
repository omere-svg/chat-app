import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from './app/AppProviders.tsx'
import { bootstrapAuthToken } from './features/auth/store/authStorage.ts'
import './index.css'

bootstrapAuthToken()

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
)
