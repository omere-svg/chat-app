import App from './App.tsx'
import { ToastHost } from './components/ToastHost.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'

export function AppProviders(): React.ReactElement {
  return (
    <AuthProvider>
      <ToastProvider>
        <App />
        <ToastHost />
      </ToastProvider>
    </AuthProvider>
  )
}
