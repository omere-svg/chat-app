import { Link } from "react-router-dom";

type FormStatus = { type: "success" | "error"; message: string } | null;

type ProfilePageProps = {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onSubmitName: () => void;
  isSavingName: boolean;
  canSaveName: boolean;
  nameStatus: FormStatus;

  email: string;
  currentPassword: string;
  onEmailChange: (value: string) => void;
  onCurrentPasswordChange: (value: string) => void;
  onSubmitEmail: () => void;
  isSavingEmail: boolean;
  canSaveEmail: boolean;
  emailStatus: FormStatus;
};

function FormStatusMessage({ status }: { status: FormStatus }): React.ReactElement | null {
  if (status === null) {
    return null;
  }
  return (
    <p
      className={`profile-form__status profile-form__status--${status.type}`}
      role={status.type === "error" ? "alert" : "status"}
    >
      {status.message}
    </p>
  );
}

export function ProfilePage({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  onSubmitName,
  isSavingName,
  canSaveName,
  nameStatus,
  email,
  currentPassword,
  onEmailChange,
  onCurrentPasswordChange,
  onSubmitEmail,
  isSavingEmail,
  canSaveEmail,
  emailStatus,
}: ProfilePageProps): React.ReactElement {
  return (
    <div className="profile-page">
      <header className="profile-page__header">
        <h1 className="profile-page__title">Profile</h1>
        <Link to="/chat" className="btn btn--ghost">
          Back to chat
        </Link>
      </header>

      <section className="profile-card" aria-labelledby="profile-name-heading">
        <h2 id="profile-name-heading" className="profile-card__title">
          Name
        </h2>
        <form
          className="profile-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (canSaveName && !isSavingName) onSubmitName();
          }}
        >
          <label className="auth-field">
            <span className="auth-field__label">First name</span>
            <input
              className="auth-field__input"
              type="text"
              name="firstName"
              autoComplete="given-name"
              value={firstName}
              disabled={isSavingName}
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
              disabled={isSavingName}
              onChange={(event) => onLastNameChange(event.target.value)}
            />
          </label>

          <FormStatusMessage status={nameStatus} />

          <button
            type="submit"
            className="btn btn--primary"
            disabled={!canSaveName || isSavingName}
          >
            {isSavingName ? "Saving…" : "Save name"}
          </button>
        </form>
      </section>

      <section className="profile-card" aria-labelledby="profile-email-heading">
        <h2 id="profile-email-heading" className="profile-card__title">
          Email address
        </h2>
        <form
          className="profile-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (canSaveEmail && !isSavingEmail) onSubmitEmail();
          }}
        >
          <label className="auth-field">
            <span className="auth-field__label">Email</span>
            <input
              className="auth-field__input"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              disabled={isSavingEmail}
              onChange={(event) => onEmailChange(event.target.value)}
            />
          </label>
          <label className="auth-field">
            <span className="auth-field__label">Current password</span>
            <input
              className="auth-field__input"
              type="password"
              name="currentPassword"
              autoComplete="current-password"
              value={currentPassword}
              disabled={isSavingEmail}
              onChange={(event) => onCurrentPasswordChange(event.target.value)}
            />
          </label>

          <FormStatusMessage status={emailStatus} />

          <button
            type="submit"
            className="btn btn--primary"
            disabled={!canSaveEmail || isSavingEmail}
          >
            {isSavingEmail ? "Saving…" : "Save email"}
          </button>
        </form>
      </section>
    </div>
  );
}
