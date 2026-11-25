import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { env } from '../config/env';
import { useSession } from '@/features/auth';

// Real-time payloads carry message content, SDP and user data: log them only in dev builds.
const debugLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug(...args);
  }
};

const safeParse = (body: string) => {
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
};

const getWsUrl = () => {
  if (env.WS_URL && env.WS_URL.startsWith('http')) {
    if (
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1' &&
      env.WS_URL.includes('localhost')
    ) {
      return 'https://leo-chat-backend.onrender.com/ws';
    }
    return env.WS_URL;
  }
  return 'https://leo-chat-backend.onrender.com/ws';
};

export type SendChatMessagePayload = {
  conversationId: string;
  clientMessageId: string;
  content?: string | null;
  type?: string;
  replyToId?: string | null;
  storageKey?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
};

export type SendAiChatPayload = {
  conversationId: string;
  prompt: string;
  clientMessageId?: string;
};

export type CallSignalAction =
  | 'INVITE'
  | 'OFFER'
  | 'ACCEPT'
  | 'READY'
  | 'ANSWER'
  | 'ICE_CANDIDATE'
  | 'REJECT'
  | 'BUSY'
  | 'END'
  | 'RINGING'
  | 'DELIVERED'
  | 'UNAVAILABLE';

export type CallSignalRequest = {
  conversationId: string;
  callId: string;
  targetUserId: string;
  action: CallSignalAction;
  sdp?: string;
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
};

export type CallSignalEvent = {
  conversationId: string;
  callId: string;
  fromUserId: string;
  fromUsername: string;
  targetUserId: string;
  action: CallSignalAction;
  sdp?: string;
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
};

export type WsError = {
  code:
    'FORBIDDEN' | 'NOT_FOUND' | 'BUSINESS_RULE' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR' | string;
  message: string;
};

const isJwtExpiredOrExpiring = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length < 2 || !parts[1]) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    // Expiring within the next 15 seconds
    return Date.now() >= payload.exp * 1000 - 15000;
  } catch {
    return false;
  }
};

const isAuthRejection = (err: unknown) => {
  const status = (err as { status?: number } | null)?.status;
  return status === 401 || status === 403;
};

class WebSocketService {
  private client: Client | null = null;
  public isConnected = false;
  // Set when the server rejected our CONNECT; the next attempt must get a new token first.
  private forceTokenRefresh = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ackListeners = new Set<(ack: any) => void>();
  private errorListeners = new Set<(err: WsError) => void>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private notificationListeners = new Set<(notif: any) => void>();
  private callSignalListeners = new Set<(signal: CallSignalEvent) => void>();

  // Track dynamic topic subscriptions
  // destination -> Map<callback, StompSubscription>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private topicListeners = new Map<string, Map<(msg: any) => void, any>>();

  connect() {
    if (this.client && this.client.active) return;

    const token = useSession.getState().accessToken;

    this.client = new Client({
      // Connect to WebSocket via SockJS
      webSocketFactory: () => {
        return new SockJS(getWsUrl());
      },
      connectHeaders: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      beforeConnect: async () => {
        let currentToken = useSession.getState().accessToken;
        const needsRefresh =
          this.forceTokenRefresh || !currentToken || isJwtExpiredOrExpiring(currentToken);
        if (needsRefresh) {
          const { authSession } = await import('@/features/auth/lib/auth-session');
          try {
            currentToken = authSession.mightBeActive() ? await authSession.refresh() : null;
            this.forceTokenRefresh = false;
          } catch (err) {
            if (isAuthRejection(err)) {
              // Session is gone (refresh cookie missing/expired): stop reconnecting and sign out
              // instead of retrying with a dead token every few seconds.
              currentToken = null;
            }
            // Network/server errors: keep the current token and let the reconnect retry.
          }
        }
        if (!currentToken) {
          const { authSession } = await import('@/features/auth/lib/auth-session');
          authSession.expire(); // deactivates this client, so stompjs will not connect
          return;
        }
        this.client!.connectHeaders = {
          Authorization: `Bearer ${currentToken}`,
        };
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: (frame) => {
        debugLog('✅ Connected to Real-time Chat WebSocket:', frame);
        this.isConnected = true;

        // 1. Private server acknowledgements
        this.client?.subscribe('/user/queue/acks', (message) => {
          const parsedAck = safeParse(message.body);
          debugLog('✅ Message saved:', parsedAck);
          this.ackListeners.forEach((listener) => listener(parsedAck));
        });

        // 2. WebSocket errors
        this.client?.subscribe('/user/queue/errors', (message) => {
          const parsedErr: WsError = safeParse(message.body);
          // eslint-disable-next-line no-console
          console.error('❌ WebSocket error:', parsedErr);
          this.errorListeners.forEach((listener) => listener(parsedErr));
        });

        // 3. Private server notifications
        this.client?.subscribe('/user/queue/notifications', (message) => {
          const parsedNotif = safeParse(message.body);
          debugLog('🔔 Notification:', parsedNotif);
          this.notificationListeners.forEach((listener) => listener(parsedNotif));
        });

        // 4. Private WebRTC call signaling
        this.client?.subscribe('/user/queue/calls', (message) => {
          const parsedSignal: CallSignalEvent = safeParse(message.body);
          debugLog('📞 Received call signal:', parsedSignal);
          this.callSignalListeners.forEach((listener) => listener(parsedSignal));
        });

        // 5. Re-establish any pending dynamic topic subscriptions
        this.topicListeners.forEach((callbacks, destination) => {
          callbacks.forEach((_, callback) => {
            const subscription = this.client?.subscribe(destination, (msg) => {
              const parsed = safeParse(msg.body);
              debugLog(`[STOMP] Received on ${destination}:`, parsed);
              callback(parsed);
            });
            callbacks.set(callback, subscription);
          });
        });
      },
      onStompError: (frame) => {
        // eslint-disable-next-line no-console
        console.error('❌ STOMP error:', frame.headers, frame.body);
        if (
          frame.headers['message']?.toLowerCase().includes('unauthorized') ||
          frame.headers['message']?.toLowerCase().includes('forbidden')
        ) {
          // Get a new token before the next reconnect (done in beforeConnect, one refresh only).
          this.forceTokenRefresh = true;
        }
      },
      onWebSocketClose: () => {
        this.isConnected = false;
      },
      onDisconnect: () => {
        this.isConnected = false;
      },
      onWebSocketError: (error) => {
        // eslint-disable-next-line no-console
        console.error('❌ WebSocket error:', error);
      },
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;

      // Clear out active stomp subscription references, but keep the callbacks
      // so they can be re-subscribed if reconnecting
      this.topicListeners.forEach((callbacks) => {
        callbacks.forEach((_, callback) => {
          callbacks.set(callback, null);
        });
      });
    }
  }

  // Listeners for acknowledgements
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addAckListener(listener: (ack: any) => void) {
    this.ackListeners.add(listener);
    return () => this.ackListeners.delete(listener);
  }

  // Listeners for STOMP errors
  addErrorListener(listener: (err: WsError) => void) {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  // Listeners for notifications
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addNotificationListener(listener: (notif: any) => void) {
    this.notificationListeners.add(listener);
    return () => this.notificationListeners.delete(listener);
  }

  // Listeners for WebRTC call signaling
  addCallSignalListener(listener: (signal: CallSignalEvent) => void) {
    this.callSignalListeners.add(listener);
    return () => this.callSignalListeners.delete(listener);
  }

  // Send WebRTC call signal to /app/call.signal
  sendCallSignal(payload: CallSignalRequest) {
    return this.publish('/app/call.signal', payload);
  }

  // Subscribe to specific topics (like /topic/conversations.{id})
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribe(destination: string, callback: (message: any) => void) {
    if (!this.topicListeners.has(destination)) {
      this.topicListeners.set(destination, new Map());
    }

    const callbacks = this.topicListeners.get(destination)!;

    if (this.client && this.client.connected) {
      const subscription = this.client.subscribe(destination, (msg) => {
        const parsed = safeParse(msg.body);
        debugLog(`[STOMP] Received on ${destination}:`, parsed);
        callback(parsed);
      });
      callbacks.set(callback, subscription);
      debugLog(`[STOMP] Subscribed to ${destination}`);
    } else {
      // Add to map, it will be subscribed onConnect
      callbacks.set(callback, null);
      debugLog(`[STOMP] Queued subscription for ${destination} (waiting for connection...)`);
    }

    return () => {
      const sub = callbacks.get(callback);
      if (sub) {
        sub.unsubscribe();
      }
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.topicListeners.delete(destination);
      }
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publish(destination: string, body: any) {
    if (!this.client || !this.client.connected) {
      console.warn('⚠️ Cannot publish, STOMP client is not connected');
      return false;
    }
    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
    return true;
  }

  // Send message over STOMP to /app/chat.send
  sendChatMessage(payload: SendChatMessagePayload) {
    return this.publish('/app/chat.send', {
      conversationId: payload.conversationId,
      clientMessageId: payload.clientMessageId,
      type: payload.type || 'TEXT',
      content: payload.content ?? null,
      replyToId: payload.replyToId ?? null,
      storageKey: payload.storageKey ?? null,
      fileName: payload.fileName ?? null,
      mimeType: payload.mimeType ?? null,
      sizeBytes: payload.sizeBytes ?? null,
    });
  }

  // Send read receipt over STOMP to /app/chat.read
  sendChatRead(conversationId: string, upToSeq: number) {
    return this.publish('/app/chat.read', {
      conversationId,
      upToSeq,
    });
  }

  // Send typing indicator over STOMP to /app/chat.typing
  sendChatTyping(conversationId: string, isTyping: boolean) {
    return this.publish('/app/chat.typing', {
      conversationId,
      isTyping,
    });
  }

  // Send AI chat prompt over STOMP to /app/ai.chat
  sendAiChat(payload: SendAiChatPayload) {
    return this.publish('/app/ai.chat', {
      conversationId: payload.conversationId,
      prompt: payload.prompt,
      clientMessageId: payload.clientMessageId || `ai-prompt-${Date.now()}`,
    });
  }
}

export const wsService = new WebSocketService();
