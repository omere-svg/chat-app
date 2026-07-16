import { useState } from "react";
import { ApiError } from "../../api/apiClient.ts";
import { useAuth } from "../../hooks/useAuth.ts";
import { AuthScreen, type AuthMode } from "./AuthScreen.tsx";

export function AuthScreenContainer(): React.ReactElement {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function switchMode(nextMode: AuthMode): void {
    setMode(nextMode);
    setErrorMessage(null);
  }

  async function handleSubmit(): Promise<void> {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (mode === "signup") {
        await signup(email.trim(), password, firstName.trim(), lastName.trim());
      } else {
        await login(email.trim(), password);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreen
      mode={mode}
      email={email}
      password={password}
      firstName={firstName}
      lastName={lastName}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onFirstNameChange={setFirstName}
      onLastNameChange={setLastName}
      onModeChange={switchMode}
      onSubmit={() => void handleSubmit()}
    />
  );
}
