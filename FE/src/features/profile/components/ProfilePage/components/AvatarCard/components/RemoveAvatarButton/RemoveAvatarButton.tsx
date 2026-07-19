import { Button } from '@/shared/components/Button/Button.tsx'
import { useProfileAvatarContext } from '../../context/useProfileAvatarContext.tsx'
import { REMOVE_AVATAR_TEXT } from './RemoveAvatarButton.constants.ts'

export function RemoveAvatarButton(): React.ReactElement {
  const { canRemove, isSaving, removeAvatar } = useProfileAvatarContext()

  const label = isSaving ? REMOVE_AVATAR_TEXT.removing : REMOVE_AVATAR_TEXT.remove
  const isDisabled = !canRemove || isSaving

  return (
    <Button type="button" variant="ghost" disabled={isDisabled} onClick={removeAvatar}>
      {label}
    </Button>
  )
}
