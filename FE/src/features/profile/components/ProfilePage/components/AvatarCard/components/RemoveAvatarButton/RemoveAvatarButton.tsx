import { Button } from '@/shared/components/Button/Button.tsx'
import { useProfileAvatarContext } from '../../context/useProfileAvatarContext.tsx'

export function RemoveAvatarButton(): React.ReactElement {
  const { canRemove, isSaving, removeLabel, removeAvatar } = useProfileAvatarContext()

  const isDisabled = !canRemove || isSaving

  return (
    <Button type="button" variant="ghost" disabled={isDisabled} onClick={removeAvatar}>
      {removeLabel}
    </Button>
  )
}
