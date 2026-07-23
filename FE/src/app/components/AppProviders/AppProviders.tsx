import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/components/AuthProvider/AuthProvider.tsx'
import { ToastHostContainer } from '@/features/toast/components/ToastHost/ToastHostContainer.tsx'
import { store } from '@/store/store.ts'
import { AppContainer } from '../App/AppContainer.tsx'

export function AppProviders(): React.ReactElement {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <AppContainer />
          <ToastHostContainer />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  )
}
