import { useState } from "react";
import { DevToggle } from "../components/DevToggle.tsx";
import { ConversationList } from "../features/conversations/ConversationList.tsx";
import { NewConversationFormContainer } from "../features/conversations/NewConversationForm.container.tsx";
import { MessageThreadContainer } from "../features/messages/MessageThread.container.tsx";
import { useAuth } from "../hooks/useAuth.ts";
import { useConversations } from "../hooks/useConversations.ts";
import { useDevSettings } from "../hooks/useDevSettings.ts";

export function ChatLayout(): React.ReactElement {
  const { currentUser, logout } = useAuth();
  const { simulateSendFailure, setSimulateSendFailure } = useDevSettings();
  const [userSelectedConversationId, setUserSelectedConversationId] = useState<
    string | null
  >(null);
  const { conversationsState, reloadConversations } = useConversations();

  const conversations =
    conversationsState.status === "success"
      ? conversationsState.conversations
      : [];

  const defaultConversationId =
    conversationsState.status === "success"
      ? (conversationsState.conversations[0]?.id ?? null)
      : null;

  const selectedConversationId =
    userSelectedConversationId ?? defaultConversationId;

  function handleConversationCreated(conversationId: string): void {
    setUserSelectedConversationId(conversationId);
    reloadConversations({ quiet: true });
  }

  return (
    <div className="chat-layout">
      <header className="chat-layout__topbar">
        <span className="chat-layout__user">
          Signed in as {currentUser?.displayName}
        </span>
        <DevToggle
          simulateSendFailure={simulateSendFailure}
          onSimulateSendFailureChange={setSimulateSendFailure}
        />
        <button type="button" className="btn btn--ghost" onClick={logout}>
          Log out
        </button>
      </header>

      <div className="chat-layout__panels">
        <aside className="chat-layout__sidebar">
          <h2 className="chat-layout__sidebar-title">Conversations</h2>
          <NewConversationFormContainer
            onConversationCreated={handleConversationCreated}
          />
          <ConversationList
            conversationsState={conversationsState}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setUserSelectedConversationId}
            onRetryLoad={reloadConversations}
          />
        </aside>

        <main className="chat-layout__main">
          <MessageThreadContainer
            selectedConversationId={selectedConversationId}
            conversations={conversations}
            onMessageSendSuccess={() => reloadConversations({ quiet: true })}
          />
        </main>
      </div>
    </div>
  );
}
