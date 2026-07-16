import { useState } from "react";
import { Link } from "react-router-dom";
import { ConversationList } from "../features/conversations/ConversationList.tsx";
import { NewConversationFormContainer } from "../features/conversations/NewConversationForm.container.tsx";
import { MessageThreadContainer } from "../features/messages/MessageThread.container.tsx";
import { useAuth } from "../hooks/useAuth.ts";
import { useConversations } from "../hooks/useConversations.ts";
import { fullName } from "../types/domain.ts";

export function ChatLayout(): React.ReactElement {
  const { currentUser, logout } = useAuth();
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
          Signed in as {currentUser ? fullName(currentUser) : ""}
        </span>
        <div className="chat-layout__topbar-actions">
          <Link to="/profile" className="btn btn--ghost">
            Profile
          </Link>
          <button type="button" className="btn btn--ghost" onClick={logout}>
            Log out
          </button>
        </div>
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
