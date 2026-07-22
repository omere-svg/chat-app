import { AUTH_MODE_SWITCH_CLASS } from './AuthModeSwitch.constants.ts'
import { useAuthScreenContext } from '../../context/useAuthScreenContext.tsx'
import './AuthModeSwitch.css'

export function AuthModeSwitch(): React.ReactElement {
  const { copy, isSubmitting, toggleMode } = useAuthScreenContext()

  return (
    <p className={AUTH_MODE_SWITCH_CLASS.text}>
      {copy.switchPrompt}{' '}
      <button
        type="button"
        className={AUTH_MODE_SWITCH_CLASS.button}
        disabled={isSubmitting}
        onClick={toggleMode}
      >
        {copy.switchCta}
      </button>
    </p>
  )
}
