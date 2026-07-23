import { NewConversationActions } from './components/NewConversationActions/NewConversationActions.tsx'
import { NewConversationProvider } from './context/useNewConversationContext.tsx'
import { NewConversationForm } from './NewConversationForm.tsx'

export function NewConversationContainer(): React.ReactElement {
  return (
    <NewConversationProvider>
      <NewConversationForm />
      <NewConversationActions />
    </NewConversationProvider>
  )
}
