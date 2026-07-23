import { NewConversationAssistantButton } from './components/NewConversationAssistantButton/NewConversationAssistantButton.tsx'
import { NewConversationTutorButton } from './components/NewConversationTutorButton/NewConversationTutorButton.tsx'
import { NEW_CONVERSATION_ACTIONS_CLASS } from './NewConversationActions.constants.ts'
import './NewConversationActions.css'

export function NewConversationActions(): React.ReactElement {
  return (
    <div className={NEW_CONVERSATION_ACTIONS_CLASS.root}>
      <NewConversationAssistantButton />
      <NewConversationTutorButton />
    </div>
  )
}
