import { EMAIL_CHANGE_CONFIRM_CLASS } from './EmailChangeConfirmScreen.constants.ts'
import type { EmailChangeConfirmScreenProps } from './EmailChangeConfirmScreen.types.ts'
import { EmailChangeConfirmHeading } from './components/EmailChangeConfirmHeading/EmailChangeConfirmHeading.tsx'
import './EmailChangeConfirmScreen.css'

export function EmailChangeConfirmScreen({
  children,
}: EmailChangeConfirmScreenProps): React.ReactElement {
  return (
    <main className={EMAIL_CHANGE_CONFIRM_CLASS.screen}>
      <section className={EMAIL_CHANGE_CONFIRM_CLASS.card}>
        <EmailChangeConfirmHeading />
        {children}
      </section>
    </main>
  )
}
