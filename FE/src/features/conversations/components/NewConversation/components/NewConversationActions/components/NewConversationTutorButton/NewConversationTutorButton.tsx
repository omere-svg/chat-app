import { Button } from '@/shared/components/Button/Button.tsx'
import { useNewConversationContext } from '../../../../context/useNewConversationContext.tsx'

export function NewConversationTutorButton(): React.ReactElement {
  const { isSubmitting, tutorLabel, handleCreateTutor } = useNewConversationContext()

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={isSubmitting}
      onClick={handleCreateTutor}
    >
      {tutorLabel}
    </Button>
  )
}
