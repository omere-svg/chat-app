import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.ts";
import { UserPicker } from "./UserPicker.tsx";
import { MOCK_USERS } from "../../mocks/mockUsers.ts";

export function AuthScreenContainer(): React.ReactElement {
  const { loginAsUser } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState(MOCK_USERS[0]!.id);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(
    null,
  );

  async function handleLogin(): Promise<void> {
    setIsLoggingIn(true);
    setLoginErrorMessage(null);
    try {
      await loginAsUser(selectedUserId);
    } catch {
      setLoginErrorMessage("Login failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <UserPicker
      users={MOCK_USERS}
      selectedUserId={selectedUserId}
      onSelectUser={setSelectedUserId}
      onLogin={() => void handleLogin()}
      isLoggingIn={isLoggingIn}
      loginErrorMessage={loginErrorMessage}
    />
  );
}
