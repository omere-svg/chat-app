import {
  EMAIL_CHANGE_CONFIRM_CLASS,
  EMAIL_CHANGE_CONFIRM_TEXT,
} from './EmailChangeConfirmScreen.constants.ts'
import type { EmailChangeConfirmScreenProps } from './EmailChangeConfirmScreen.types.ts'
import './EmailChangeConfirmScreen.css'

export function EmailChangeConfirmScreen({
  children,
}: EmailChangeConfirmScreenProps): React.ReactElement {
  return (
    <main className={EMAIL_CHANGE_CONFIRM_CLASS.screen}>
      <section className={EMAIL_CHANGE_CONFIRM_CLASS.card}>
        <h1 className={EMAIL_CHANGE_CONFIRM_CLASS.heading}>
          {EMAIL_CHANGE_CONFIRM_TEXT.heading}
        </h1>
        {children}
      </section>
    </main>
  )
}
