import { FormStatusMessage } from '../../../FormStatusMessage/FormStatusMessage.tsx'
import { useProfileAvatarContext } from '../../context/useProfileAvatarContext.tsx'

export function AvatarStatus(): React.ReactElement | null {
  const { statusView } = useProfileAvatarContext()

  if (!statusView) {
    return null
  }

  return <FormStatusMessage {...statusView} />
}
