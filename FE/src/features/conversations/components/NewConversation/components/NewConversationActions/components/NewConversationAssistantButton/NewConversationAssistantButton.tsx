import { Button } from '@/shared/components/Button/Button.tsx'
import { useNewConversationContext } from '../../../../context/useNewConversationContext.tsx'

export function NewConversationAssistantButton(): React.ReactElement {
  const { isSubmitting, assistantLabel, handleCreateAssistant } = useNewConversationContext()

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={isSubmitting}
      onClick={handleCreateAssistant}
    >
      {assistantLabel}
    </Button>
  )
}
