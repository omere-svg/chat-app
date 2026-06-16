type NewConversationFormProps = {
  participantEmail: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onParticipantEmailChange: (participantEmail: string) => void;
  onSubmit: () => void;
};

export function NewConversationForm({
  participantEmail,
  isSubmitting,
  errorMessage,
  onParticipantEmailChange,
  onSubmit,
}: NewConversationFormProps): React.ReactElement {
  const canSubmit = participantEmail.trim().length > 0;

  return (
    <form
      className="new-conversation"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit && !isSubmitting) onSubmit();
      }}
    >
      <div className="new-conversation__row">
        <input
          className="new-conversation__input"
          type="email"
          name="participantEmail"
          placeholder="User Email to chat with"
          aria-label="User Email to start a conversation with"
          value={participantEmail}
          disabled={isSubmitting}
          onChange={(event) => onParticipantEmailChange(event.target.value)}
        />
        <button
          type="submit"
          className="btn btn--primary"
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? "Starting…" : "New chat"}
        </button>
      </div>

      {errorMessage ? (
        <p className="new-conversation__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
