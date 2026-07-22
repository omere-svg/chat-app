import { Button } from '@/shared/components/Button/Button.tsx'
import { useAuthScreenContext } from '../../context/useAuthScreenContext.tsx'

export function AuthSubmit(): React.ReactElement {
  const { submitLabel, canSubmit, isSubmitting } = useAuthScreenContext()

  return (
    <Button type="submit" variant="primary" disabled={!canSubmit || isSubmitting}>
      {submitLabel}
    </Button>
  )
}
