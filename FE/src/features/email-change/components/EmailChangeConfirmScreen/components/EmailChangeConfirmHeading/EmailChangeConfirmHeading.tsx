import {
  EMAIL_CHANGE_CONFIRM_HEADING_CLASS,
  EMAIL_CHANGE_CONFIRM_HEADING_TEXT,
} from './EmailChangeConfirmHeading.constants.ts'
import './EmailChangeConfirmHeading.css'

export function EmailChangeConfirmHeading(): React.ReactElement {
  return (
    <h1 className={EMAIL_CHANGE_CONFIRM_HEADING_CLASS.heading}>
      {EMAIL_CHANGE_CONFIRM_HEADING_TEXT}
    </h1>
  )
}
