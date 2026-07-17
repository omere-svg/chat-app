import { AUTH_MODE_SWITCH_CLASS } from './AuthModeSwitch.constants.ts'
import type { AuthModeSwitchProps } from './AuthModeSwitch.types.ts'
import './AuthModeSwitch.css'

export function AuthModeSwitch({
  prompt,
  cta,
  disabled,
  onToggle,
}: AuthModeSwitchProps): React.ReactElement {
  return (
    <p className={AUTH_MODE_SWITCH_CLASS.text}>
      {prompt}{' '}
      <button
        type="button"
        className={AUTH_MODE_SWITCH_CLASS.button}
        disabled={disabled}
        onClick={onToggle}
      >
        {cta}
      </button>
    </p>
  )
}
