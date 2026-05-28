import App from './App.tsx'
import { ToastHost } from './components/ToastHost.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { DevSettingsProvider } from './context/DevSettingsContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'

export function AppProviders(): React.ReactElement {
  return (
    <AuthProvider>
      <DevSettingsProvider>
        <ToastProvider>
          <App />
          <ToastHost />
        </ToastProvider>
      </DevSettingsProvider>
    </AuthProvider>
  )
}
