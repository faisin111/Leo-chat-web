import type { Conversation, LastMessage } from '../api/conversations-api';

export interface LastMessagePreview {
  text: string;
  isDeleted: boolean;
  isCall: boolean;
  isSystem: boolean;
}

/**
 * Formats a conversation's `lastMessage` into a concise sidebar preview.
 */
export function formatLastMessagePreview(
  conversation: Pick<Conversation, 'type' | 'lastMessage'>,
  currentUserId?: string | null,
): LastMessagePreview {
  const last: LastMessage | null | undefined = conversation.lastMessage;

  if (!last) {
    return {
      text: conversation.type === 'GROUP' ? 'Group conversation' : 'Direct message',
      isDeleted: false,
      isCall: false,
      isSystem: false,
    };
  }

  if (last.deleted) {
    return {
      text: 'This message was deleted',
      isDeleted: true,
      isCall: false,
      isSystem: false,
    };
  }

  const isOwn = !!currentUserId && !!last.senderId && last.senderId === currentUserId;
  const type = (last.type || 'TEXT').toUpperCase();

  if (type === 'CALL') {
    return {
      text: isOwn ? 'Outgoing call' : 'Incoming call',
      isDeleted: false,
      isCall: true,
      isSystem: false,
    };
  }

  if (type === 'SYSTEM') {
    return {
      text: last.content?.trim() || 'System update',
      isDeleted: false,
      isCall: false,
      isSystem: true,
    };
  }

  let body: string;
  switch (type) {
    case 'IMAGE': {
      const caption = last.content?.trim();
      body = caption ? `📷 ${caption}` : '📷 Photo';
      break;
    }
    case 'VOICE': {
      body = '🎤 Voice message';
      break;
    }
    case 'FILE': {
      const label = last.content?.split('\n')[0]?.trim();
      body = label ? `📎 ${label}` : '📎 File';
      break;
    }
    default: {
      body = last.content?.trim() || '';
      break;
    }
  }

  if (!body) {
    return {
      text: conversation.type === 'GROUP' ? 'Group conversation' : 'Direct message',
      isDeleted: false,
      isCall: false,
      isSystem: false,
    };
  }

  return {
    text: isOwn ? `You: ${body}` : body,
    isDeleted: false,
    isCall: false,
    isSystem: false,
  };
}
