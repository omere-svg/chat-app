import { useEmailChangeRequestContext } from '../../context/useEmailChangeRequestContext.tsx'
import { CURRENT_EMAIL_CLASS, CURRENT_EMAIL_TEXT } from './CurrentEmail.constants.ts'
import './CurrentEmail.css'

export function CurrentEmail(): React.ReactElement {
  const { currentEmail } = useEmailChangeRequestContext()

  return (
    <p className={CURRENT_EMAIL_CLASS.currentEmail}>
      <span className={CURRENT_EMAIL_CLASS.label}>{CURRENT_EMAIL_TEXT.label}</span>{' '}
      {currentEmail}
    </p>
  )
}
