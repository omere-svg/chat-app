import { Link } from 'react-router-dom'
import { BUTTON_CLASS } from '@/shared/components/Button/Button.constants.ts'
import {
  PROFILE_BACK_LINK_TO,
  PROFILE_HEADER_CLASS,
  PROFILE_HEADER_TEXT,
} from './ProfileHeader.constants.ts'
import './ProfileHeader.css'

export function ProfileHeader(): React.ReactElement {
  return (
    <header className={PROFILE_HEADER_CLASS.header}>
      <h1 className={PROFILE_HEADER_CLASS.title}>{PROFILE_HEADER_TEXT.title}</h1>
      <Link to={PROFILE_BACK_LINK_TO} className={BUTTON_CLASS.ghost}>
        {PROFILE_HEADER_TEXT.backLabel}
      </Link>
    </header>
  )
}
