import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AuthProvider } from '../features/auth/components/AuthProvider/AuthProvider.tsx'
import { ToastHost } from '../features/toast/components/ToastHost/ToastHost.tsx'
import { store } from '../store/store.ts'

export function AppProviders(): React.ReactElement {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <ToastHost />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  )
}
