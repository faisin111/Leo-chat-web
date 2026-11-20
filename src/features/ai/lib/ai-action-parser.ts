import { usersApi } from '@/features/users';
import { conversationsApi } from '@/features/chat';
import type { AiActionType } from '../types/ai.types';

export interface ParsedAiAction {
  action: AiActionType;
  targetName?: string;
  targetUserId?: string;
  conversationId?: string;
  messageText?: string;
  query?: string;
  isVideo?: boolean;
}

export interface ResolvedTargetUser {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  conversationId?: string;
}

/**
 * Checks if the prompt is an affirmative confirmation command (e.g. "yes", "confirm", "send it").
 */
export function isConfirmationPrompt(prompt: string): boolean {
  const p = prompt
    .trim()
    .toLowerCase()
    .replace(/[.!?,]+$/, '');
  return /^(yes|confirm|confirm it|send it|call now|proceed|do it|sure|okay|ok|yep|yeah)$/i.test(p);
}

/**
 * Checks if the prompt is a cancellation command (e.g. "no", "cancel", "abort").
 */
export function isCancellationPrompt(prompt: string): boolean {
  const p = prompt
    .trim()
    .toLowerCase()
    .replace(/[.!?,]+$/, '');
  return /^(no|cancel|stop|abort|don't send|dont send|nevermind|never mind|nope)$/i.test(p);
}

/**
 * Parses a natural language prompt to identify intended system actions.
 * Returns null if the prompt is standard conversational text.
 */
export function parseNaturalLanguageAction(prompt: string): ParsedAiAction | null {
  const text = prompt.trim();
  if (!text) return null;

  // 1. GET_MY_PROFILE (e.g. "give my details", "show my profile", "who am i", "my details")
  if (
    /^(?:please\s+)?(?:give|show|what are|get|display|tell me)\s+(?:me\s+)?(?:my\s+)?(?:profile|details|info|information|account(?:\s+details)?)[!?.]*$/i.test(
      text,
    ) ||
    /^(?:who\s+am\s+i|whoami|my\s+profile|my\s+details)[!?.]*$/i.test(text)
  ) {
    return { action: 'GET_MY_PROFILE' };
  }

  // 2. GET_BLOCKED_USERS (e.g. "show blocked users", "who did I block", "list blocked users")
  if (
    /^(?:please\s+)?(?:show|list|get|display|who\s+are)\s+(?:my\s+)?blocked\s+(?:users|people|accounts|contacts)[!?.]*$/i.test(
      text,
    ) ||
    /^(?:who\s+(?:did\s+i|have\s+i)\s+block(?:ed)?)[!?.]*$/i.test(text)
  ) {
    return { action: 'GET_BLOCKED_USERS' };
  }

  // 3. LIST_CONVERSATIONS (e.g. "list conversations", "show my chats", "my conversations")
  if (
    /^(?:please\s+)?(?:show|list|get|display|view)\s+(?:all\s+)?(?:my\s+)?(?:conversations|chats|messages|dms)[!?.]*$/i.test(
      text,
    ) ||
    /^(?:what\s+(?:chats|conversations)\s+do\s+i\s+have)[!?.]*$/i.test(text)
  ) {
    return { action: 'LIST_CONVERSATIONS' };
  }

  // 4. SEND_MESSAGE (e.g. "send a message to John: hello how are you", "message Alice saying let's meet")
  // Patterns:
  // - "send a message to <name>: <message>"
  // - "send message to <name>: <message>"
  // - "send a message to <name> saying <message>"
  // - "message <name>: <message>"
  // - "message <name> saying <message>"
  // - "tell <name>: <message>"
  // - "tell <name> that <message>"
  // - "text <name>: <message>"
  const sendMatch =
    text.match(
      /^(?:please\s+)?(?:can\s+you\s+)?(?:send\s+a\s+message|send\s+message|send\s+a\s+dm|dm|text|message)\s+(?:to\s+)?@?([\w.-]+)(?:\s+(?:saying|with|that|:)\s*|\s*:\s*)([\s\S]+)$/i,
    ) ||
    text.match(
      /^(?:please\s+)?(?:tell)\s+@?([\w.-]+)(?:\s+(?:that|saying|:)\s*|\s*:\s*)([\s\S]+)$/i,
    ) ||
    text.match(/^send\s+(?:to\s+)?@?([\w.-]+)\s*:\s*([\s\S]+)$/i);

  if (sendMatch && sendMatch[1] && sendMatch[2]) {
    const targetName = sendMatch[1].trim();
    let messageText = sendMatch[2].trim();
    // Strip surrounding quotes if present
    if (
      (messageText.startsWith('"') && messageText.endsWith('"')) ||
      (messageText.startsWith("'") && messageText.endsWith("'"))
    ) {
      messageText = messageText.slice(1, -1).trim();
    }
    if (targetName && messageText) {
      return {
        action: 'SEND_MESSAGE',
        targetName,
        messageText,
      };
    }
  }

  // 5. START_CALL (e.g. "call John", "start a call with Alice", "video call Sarah", "voice call Bob")
  const callMatch = text.match(
    /^(?:please\s+)?(?:can\s+you\s+)?(?:start\s+a\s+(?:video\s+|voice\s+|audio\s+)?call|start\s+call|call|video\s+call|voice\s+call|ring)\s+(?:with\s+|to\s+)?@?([\w.-]+)[!?.]*$/i,
  );
  if (callMatch && callMatch[1]) {
    const targetName = callMatch[1].trim();
    const isVideo = /video/i.test(text);
    if (targetName) {
      return {
        action: 'START_CALL',
        targetName,
        isVideo,
      };
    }
  }

  // 6. SEARCH_USERS (e.g. "search user John", "find users named Sarah", "find user @alex")
  const searchMatch = text.match(
    /^(?:please\s+)?(?:search|find|lookup|look\s+for)\s+(?:users?|people|someone|person|user)?\s*(?:named|for)?\s*[:\s]+["']?@?([\w\s.-]+)["']?[!?.]*$/i,
  );
  if (searchMatch && searchMatch[1]) {
    const query = searchMatch[1].trim();
    if (query.length >= 2) {
      return {
        action: 'SEARCH_USERS',
        query,
      };
    }
  }

  // 7. GET_USER (e.g. "who is @john", "get user details for john", "view profile of @sarah")
  const getUserMatch = text.match(
    /^(?:who\s+is|view\s+profile\s+of|get\s+user\s+details\s+for)\s+@?([\w.-]+)[!?.]*$/i,
  );
  if (getUserMatch && getUserMatch[1]) {
    const targetName = getUserMatch[1].trim();
    if (targetName) {
      return {
        action: 'GET_USER',
        targetName,
      };
    }
  }

  return null;
}

/**
 * Searches for a user by username/displayName and retrieves or creates
 * a direct conversation with them.
 */
export async function resolveTargetUserAndConversation(
  targetName: string,
): Promise<ResolvedTargetUser | null> {
  const cleanName = targetName.trim().replace(/^@/, '');
  if (!cleanName) return null;

  try {
    // 1. First, search users in the system directory
    const searchResults = await usersApi.searchUsers(cleanName, 0, 10);
    let matchedUser = searchResults.find(
      (u) =>
        (u.username || '').toLowerCase() === cleanName.toLowerCase() ||
        (u.displayName || '').toLowerCase() === cleanName.toLowerCase(),
    );

    // If no exact match, fallback to first search result containing query
    if (!matchedUser && searchResults.length > 0) {
      matchedUser = searchResults[0];
    }

    if (!matchedUser) {
      return null;
    }

    const targetUserId = matchedUser.id;

    // 2. Find or create the direct conversation with this user
    const directConversation = await conversationsApi.startDirectMessage(targetUserId);

    return {
      id: targetUserId,
      username: matchedUser.username,
      displayName: matchedUser.displayName,
      avatarUrl: matchedUser.profilePictureUrl,
      conversationId: directConversation.id,
    };
  } catch (error) {
    console.error('Failed to resolve target user and conversation:', error);
    return null;
  }
}
