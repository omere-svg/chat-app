import { EmailChangeConfirmScreen } from './EmailChangeConfirmScreen.tsx'
import { EmailChangeConfirmBodyContainer } from './components/EmailChangeConfirmBodyContainer/EmailChangeConfirmBodyContainer.tsx'
import { EmailChangeConfirmProvider } from './context/useEmailChangeConfirmContext.tsx'

export function EmailChangeConfirmScreenContainer(): React.ReactElement {
  return (
    <EmailChangeConfirmProvider>
      <EmailChangeConfirmScreen>
        <EmailChangeConfirmBodyContainer />
      </EmailChangeConfirmScreen>
    </EmailChangeConfirmProvider>
  )
}
