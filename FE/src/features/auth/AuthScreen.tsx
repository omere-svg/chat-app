export type AuthMode = "login" | "signup";

type AuthScreenProps = {
  mode: AuthMode;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onFirstNameChange: (firstName: string) => void;
  onLastNameChange: (lastName: string) => void;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: () => void;
};

const COPY: Record<
  AuthMode,
  { title: string; submitLabel: string; switchPrompt: string; switchCta: string }
> = {
  login: {
    title: "Log in",
    submitLabel: "Log in",
    switchPrompt: "Need an account?",
    switchCta: "Sign up",
  },
  signup: {
    title: "Create your account",
    submitLabel: "Sign up",
    switchPrompt: "Already have an account?",
    switchCta: "Log in",
  },
};

export function AuthScreen({
  mode,
  email,
  password,
  firstName,
  lastName,
  isSubmitting,
  errorMessage,
  onEmailChange,
  onPasswordChange,
  onFirstNameChange,
  onLastNameChange,
  onModeChange,
  onSubmit,
}: AuthScreenProps): React.ReactElement {
  const copy = COPY[mode];
  const isSignup = mode === "signup";
  const canSubmit =
    email.trim().length > 0 &&
    password.length > 0 &&
    (!isSignup || (firstName.trim().length > 0 && lastName.trim().length > 0));

  return (
    <form
      className="auth-screen"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit && !isSubmitting) onSubmit();
      }}
    >
      <h1>Chat MVP</h1>
      <p className="auth-screen__subtitle">{copy.title}</p>

      {isSignup ? (
        <>
          <label className="auth-field">
            <span className="auth-field__label">First name</span>
            <input
              className="auth-field__input"
              type="text"
              name="firstName"
              autoComplete="given-name"
              value={firstName}
              disabled={isSubmitting}
              onChange={(event) => onFirstNameChange(event.target.value)}
            />
          </label>
          <label className="auth-field">
            <span className="auth-field__label">Last name</span>
            <input
              className="auth-field__input"
              type="text"
              name="lastName"
              autoComplete="family-name"
              value={lastName}
              disabled={isSubmitting}
              onChange={(event) => onLastNameChange(event.target.value)}
            />
          </label>
        </>
      ) : null}

      <label className="auth-field">
        <span className="auth-field__label">Email</span>
        <input
          className="auth-field__input"
          type="email"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          disabled={isSubmitting}
          onChange={(event) => onEmailChange(event.target.value)}
        />
      </label>

      <label className="auth-field">
        <span className="auth-field__label">Password</span>
        <input
          className="auth-field__input"
          type="password"
          name="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          value={password}
          disabled={isSubmitting}
          onChange={(event) => onPasswordChange(event.target.value)}
        />
      </label>

      {errorMessage ? (
        <p className="auth-screen__error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn--primary"
        disabled={!canSubmit || isSubmitting}
      >
        {isSubmitting ? `${copy.submitLabel}…` : copy.submitLabel}
      </button>

      <p className="auth-screen__switch">
        {copy.switchPrompt}{" "}
        <button
          type="button"
          className="auth-screen__switch-btn"
          disabled={isSubmitting}
          onClick={() => onModeChange(isSignup ? "login" : "signup")}
        >
          {copy.switchCta}
        </button>
      </p>
    </form>
  );
}
