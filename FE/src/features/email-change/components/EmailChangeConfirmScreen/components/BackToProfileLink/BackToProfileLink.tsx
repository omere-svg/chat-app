import { Link } from 'react-router-dom'
import { PROFILE_ROUTE } from '@/app/constants/routes.ts'
import { EMAIL_CHANGE_CONFIRM_TEXT } from '../../EmailChangeConfirmScreen.constants.ts'
import { BACK_TO_PROFILE_LINK_CLASS } from './BackToProfileLink.constants.ts'
import './BackToProfileLink.css'

export function BackToProfileLink(): React.ReactElement {
  return (
    <Link className={BACK_TO_PROFILE_LINK_CLASS.link} to={PROFILE_ROUTE}>
      {EMAIL_CHANGE_CONFIRM_TEXT.backToProfile}
    </Link>
  )
}
