import type { ApiErrorPayload } from "../types/api.ts";
import { fullName } from "../types/domain.ts";
import type { ConversationPreview, Message, User } from "../types/domain.ts";

type StoredUser = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

const SHARED_DEMO_PASSWORD = "password123";

function buildSeedUsers(): StoredUser[] {
  return [
    {
      id: "user-alice",
      email: "alice@example.com",
      password: SHARED_DEMO_PASSWORD,
      firstName: "Alice",
      lastName: "Anderson",
    },
    {
      id: "user-bob",
      email: "bob@example.com",
      password: SHARED_DEMO_PASSWORD,
      firstName: "Bob",
      lastName: "Brown",
    },
    {
      id: "user-carol",
      email: "carol@example.com",
      password: SHARED_DEMO_PASSWORD,
      firstName: "Carol",
      lastName: "Clark",
    },
  ];
}

export function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export type MockDb = {
  users: StoredUser[];
  conversations: ConversationPreview[];
  messages: Map<string, Message[]>;
  tokens: Map<string, string>;
};

function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function buildSeedMessages(
  conversationId: string,
  senderIds: string[],
  count: number,
): Message[] {
  const messages: Message[] = [];
  for (let i = 0; i < count; i++) {
    messages.push({
      id: `${conversationId}-msg-${i + 1}`,
      conversationId,
      senderId: senderIds[i % senderIds.length]!,
      body: `Message ${i + 1} in ${conversationId}`,
      createdAt: isoMinutesAgo(count - i + 100),
    });
  }
  return messages.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function createMockDb(): MockDb {
  const users = buildSeedUsers();

  const conv1Messages = buildSeedMessages(
    "conv-alice-bob",
    ["user-alice", "user-bob"],
    45,
  );
  const conv2Messages = buildSeedMessages(
    "conv-alice-carol",
    ["user-alice", "user-carol"],
    8,
  );
  const conv3Messages = buildSeedMessages(
    "conv-bob-carol",
    ["user-bob", "user-carol"],
    3,
  );

  const last1 = conv1Messages[conv1Messages.length - 1]!;
  const last2 = conv2Messages[conv2Messages.length - 1]!;
  const last3 = conv3Messages[conv3Messages.length - 1]!;

  const conversations: ConversationPreview[] = [
    {
      id: "conv-alice-bob",
      type: "direct",
      title: "Alice & Bob",
      participantIds: ["user-alice", "user-bob"],
      lastMessage: {
        body: last1.body,
        createdAt: last1.createdAt,
        senderId: last1.senderId,
      },
      updatedAt: last1.createdAt,
    },
    {
      id: "conv-alice-carol",
      type: "direct",
      title: "Project sync",
      participantIds: ["user-alice", "user-carol"],
      lastMessage: {
        body: last2.body,
        createdAt: last2.createdAt,
        senderId: last2.senderId,
      },
      updatedAt: last2.createdAt,
    },
    {
      id: "conv-bob-carol",
      type: "direct",
      title: "Weekend plans",
      participantIds: ["user-bob", "user-carol"],
      lastMessage: {
        body: last3.body,
        createdAt: last3.createdAt,
        senderId: last3.senderId,
      },
      updatedAt: last3.createdAt,
    },
  ];

  const messages = new Map<string, Message[]>();
  messages.set("conv-alice-bob", conv1Messages);
  messages.set("conv-alice-carol", conv2Messages);
  messages.set("conv-bob-carol", conv3Messages);

  return {
    users,
    conversations,
    messages,
    tokens: new Map(),
  };
}

let db: MockDb = createMockDb();

export function getDb(): MockDb {
  return db;
}

export function resetDb(): void {
  db = createMockDb();
}

export function issueToken(userId: string): string {
  const token = `mock-token-${userId}-${crypto.randomUUID()}`;
  db.tokens.set(token, userId);
  return token;
}

export function resolveUserId(token: string | null): string | null {
  if (!token) return null;
  return db.tokens.get(token) ?? null;
}

export function findUserById(userId: string): StoredUser | null {
  return db.users.find((user) => user.id === userId) ?? null;
}

export function verifyCredentials(
  email: string,
  password: string,
): StoredUser | null {
  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find((candidate) => candidate.email === normalizedEmail);
  if (!user || user.password !== password) return null;
  return user;
}

export type CreateUserResult =
  | { user: StoredUser }
  | { error: "EMAIL_ALREADY_REGISTERED" };

export function createUser(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): CreateUserResult {
  const normalizedEmail = input.email.trim().toLowerCase();
  if (db.users.some((candidate) => candidate.email === normalizedEmail)) {
    return { error: "EMAIL_ALREADY_REGISTERED" };
  }

  const user: StoredUser = {
    id: `user-${crypto.randomUUID()}`,
    email: normalizedEmail,
    password: input.password,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
  };
  db.users.push(user);
  return { user };
}

export function updateUserName(
  userId: string,
  firstName: string,
  lastName: string,
): StoredUser | null {
  const user = findUserById(userId);
  if (!user) return null;
  user.firstName = firstName.trim();
  user.lastName = lastName.trim();
  return user;
}

export type UpdateEmailResult =
  | { user: StoredUser }
  | { error: "INVALID_CREDENTIALS" | "EMAIL_ALREADY_REGISTERED" };

export function updateUserEmail(
  userId: string,
  email: string,
  currentPassword: string,
): UpdateEmailResult {
  const user = findUserById(userId);
  if (!user) return { error: "INVALID_CREDENTIALS" };
  if (user.password !== currentPassword) {
    return { error: "INVALID_CREDENTIALS" };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail === user.email) {
    return { user };
  }
  if (db.users.some((candidate) => candidate.email === normalizedEmail)) {
    return { error: "EMAIL_ALREADY_REGISTERED" };
  }

  user.email = normalizedEmail;
  return { user };
}

function deriveDirectTitle(conversation: ConversationPreview): string {
  const names = [...conversation.participantIds]
    .sort()
    .map((participantId) => {
      const user = findUserById(participantId);
      return user ? fullName(user) : null;
    });
  if (names.some((name) => name === null)) {
    return conversation.title;
  }
  return names.join(" & ");
}

export function getUserConversations(userId: string): ConversationPreview[] {
  return db.conversations
    .filter((c) => c.participantIds.includes(userId))
    .map((c) =>
      c.type === "direct" ? { ...c, title: deriveDirectTitle(c) } : c,
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export function userInConversation(
  userId: string,
  conversationId: string,
): boolean {
  const conv = db.conversations.find((c) => c.id === conversationId);
  return conv?.participantIds.includes(userId) ?? false;
}

export type PaginateMessagesResult =
  | { messages: Message[]; nextCursor: string | null }
  | { error: ApiErrorPayload };

export function paginateMessages(
  conversationId: string,
  cursor: string | null,
  limit: number,
): PaginateMessagesResult {
  const all = db.messages.get(conversationId) ?? [];
  const sorted = [...all].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  if (sorted.length === 0) {
    return { messages: [], nextCursor: null };
  }

  let endIndex = sorted.length;
  if (cursor) {
    const cursorIndex = sorted.findIndex((m) => m.id === cursor);
    if (cursorIndex === -1) {
      return {
        error: {
          code: "INVALID_CURSOR",
          message: "Pagination cursor is invalid or expired",
        },
      };
    }
    endIndex = cursorIndex;
  }

  const startIndex = Math.max(0, endIndex - limit);
  const page = sorted.slice(startIndex, endIndex);
  const nextCursor = startIndex > 0 ? sorted[startIndex]!.id : null;

  return { messages: page, nextCursor };
}

export function addMessage(
  conversationId: string,
  senderId: string,
  body: string,
  clientMessageId?: string,
): Message {
  const existing = db.messages.get(conversationId) ?? [];
  if (clientMessageId) {
    const dup = existing.find((m) => m.id === clientMessageId);
    if (dup) return dup;
  }

  const message: Message = {
    id: clientMessageId ?? `msg-${crypto.randomUUID()}`,
    conversationId,
    senderId,
    body,
    createdAt: new Date().toISOString(),
  };

  const updated = [...existing, message].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  db.messages.set(conversationId, updated);

  const conv = db.conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.lastMessage = {
      body: message.body,
      createdAt: message.createdAt,
      senderId: message.senderId,
    };
    conv.updatedAt = message.createdAt;
  }

  return message;
}
