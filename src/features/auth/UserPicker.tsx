import type { User } from '../../types/domain.ts'

type UserPickerProps = {
  users: User[]
  selectedUserId: string
  onSelectUser: (userId: string) => void
  onLogin: () => void
  isLoggingIn: boolean
  loginErrorMessage: string | null
}

export function UserPicker({
  users,
  selectedUserId,
  onSelectUser,
  onLogin,
  isLoggingIn,
  loginErrorMessage,
}: UserPickerProps): React.ReactElement {
  return (
    <div className="auth-screen">
      <h1>Chat MVP</h1>
      <p className="auth-screen__subtitle">Log in as a user (mocked)</p>

      <ul className="user-picker" role="listbox" aria-label="Select user">
        {users.map((user) => (
          <li key={user.id}>
            <button
              type="button"
              role="option"
              aria-selected={user.id === selectedUserId}
              className={`user-picker__item${user.id === selectedUserId ? ' user-picker__item--selected' : ''}`}
              onClick={() => onSelectUser(user.id)}
            >
              {user.displayName}
            </button>
          </li>
        ))}
      </ul>

      {loginErrorMessage ? (
        <p className="auth-screen__error" role="alert">
          {loginErrorMessage}
        </p>
      ) : null}

      <button
        type="button"
        className="btn btn--primary"
        onClick={onLogin}
        disabled={isLoggingIn || !selectedUserId}
      >
        {isLoggingIn ? 'Logging in…' : 'Continue'}
      </button>
    </div>
  )
}
