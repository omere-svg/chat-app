import { useState } from "react";
import { ApiError, apiClient } from "../../api/apiClient.ts";
import { useAuth } from "../../hooks/useAuth.ts";
import { ProfilePage } from "./ProfilePage.tsx";

type FormStatus = { type: "success" | "error"; message: string } | null;

function errorMessageFrom(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

export function ProfilePageContainer(): React.ReactElement {
  const { currentUser, updateCurrentUser } = useAuth();

  const [firstName, setFirstName] = useState(currentUser?.firstName ?? "");
  const [lastName, setLastName] = useState(currentUser?.lastName ?? "");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameStatus, setNameStatus] = useState<FormStatus>(null);

  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<FormStatus>(null);

  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();
  const nameChanged =
    trimmedFirstName !== (currentUser?.firstName ?? "") ||
    trimmedLastName !== (currentUser?.lastName ?? "");
  const canSaveName =
    trimmedFirstName.length > 0 && trimmedLastName.length > 0 && nameChanged;

  const trimmedEmail = email.trim();
  const emailChanged = trimmedEmail !== (currentUser?.email ?? "");
  const canSaveEmail =
    trimmedEmail.length > 0 && currentPassword.length > 0 && emailChanged;

  async function handleSubmitName(): Promise<void> {
    setIsSavingName(true);
    setNameStatus(null);
    try {
      const updatedUser = await apiClient.updateProfile({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
      });
      updateCurrentUser(updatedUser);
      setFirstName(updatedUser.firstName);
      setLastName(updatedUser.lastName);
      setNameStatus({ type: "success", message: "Name updated." });
    } catch (error) {
      setNameStatus({ type: "error", message: errorMessageFrom(error) });
    } finally {
      setIsSavingName(false);
    }
  }

  async function handleSubmitEmail(): Promise<void> {
    setIsSavingEmail(true);
    setEmailStatus(null);
    try {
      const updatedUser = await apiClient.updateEmail({
        email: trimmedEmail,
        currentPassword,
      });
      updateCurrentUser(updatedUser);
      setEmail(updatedUser.email ?? trimmedEmail);
      // Never keep the password in memory after a successful change.
      setCurrentPassword("");
      setEmailStatus({ type: "success", message: "Email updated." });
    } catch (error) {
      setEmailStatus({ type: "error", message: errorMessageFrom(error) });
    } finally {
      setIsSavingEmail(false);
    }
  }

  return (
    <ProfilePage
      firstName={firstName}
      lastName={lastName}
      onFirstNameChange={setFirstName}
      onLastNameChange={setLastName}
      onSubmitName={() => void handleSubmitName()}
      isSavingName={isSavingName}
      canSaveName={canSaveName}
      nameStatus={nameStatus}
      email={email}
      currentPassword={currentPassword}
      onEmailChange={setEmail}
      onCurrentPasswordChange={setCurrentPassword}
      onSubmitEmail={() => void handleSubmitEmail()}
      isSavingEmail={isSavingEmail}
      canSaveEmail={canSaveEmail}
      emailStatus={emailStatus}
    />
  );
}
