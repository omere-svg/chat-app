import { FormStatusMessage } from '../../../FormStatusMessage/FormStatusMessage.tsx'
import { toFormStatusView } from '../../../FormStatusMessage/FormStatusMessage.utils.ts'
import { useProfileAvatarContext } from '../../context/useProfileAvatarContext.tsx'

export function AvatarStatus(): React.ReactElement | null {
  const { status } = useProfileAvatarContext()

  if (!status) {
    return null
  }

  return <FormStatusMessage {...toFormStatusView(status)} />
}
