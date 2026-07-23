import { useEmailChangeConfirmContext } from '../../context/useEmailChangeConfirmContext.tsx'
import { BackToProfileLink } from '../BackToProfileLink/BackToProfileLink.tsx'
import { CONFIRM_INVALID_CLASS } from './ConfirmInvalid.constants.ts'
import './ConfirmInvalid.css'

export function ConfirmInvalid(): React.ReactElement {
  const { failureMessage } = useEmailChangeConfirmContext()

  return (
    <>
      <p className={CONFIRM_INVALID_CLASS.message} role="alert">
        {failureMessage}
      </p>
      <BackToProfileLink />
    </>
  )
}
