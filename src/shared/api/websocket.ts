import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { env } from '../config/env';
import { useSession } from '@/features/auth';

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
  content: string;
  type?: string;
  replyToId?: string | null;
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

class WebSocketService {
  private client: Client | null = null;
  public isConnected = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private messageListeners = new Set<(msg: any) => void>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private typingListeners = new Set<(msg: any) => void>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ackListeners = new Set<(ack: any) => void>();
  private errorListeners = new Set<(err: WsError) => void>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private notificationListeners = new Set<(notif: any) => void>();

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
        // Refresh token through HTTP before reconnecting after expiry
        if (!currentToken || isJwtExpiredOrExpiring(currentToken)) {
          try {
            const { authSession } = await import('@/features/auth/lib/auth-session');
            if (authSession.mightBeActive()) {
              currentToken = await authSession.refresh();
            }
          } catch {
            // Ignore if refresh cookie expired
          }
        }
        if (currentToken) {
          this.client!.connectHeaders = {
            Authorization: `Bearer ${currentToken}`,
          };
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: (frame) => {
        // eslint-disable-next-line no-console
        console.log('✅ Connected to Real-time Chat WebSocket:', frame);
        this.isConnected = true;

        // 1. Private server acknowledgements
        this.client?.subscribe('/user/queue/acks', (message) => {
          const parsedAck = safeParse(message.body);
          // eslint-disable-next-line no-console
          console.log('✅ Message saved:', parsedAck);
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
          // eslint-disable-next-line no-console
          console.log('🔔 Notification:', parsedNotif);
          this.notificationListeners.forEach((listener) => listener(parsedNotif));
        });

        // 4. Re-establish any pending dynamic topic subscriptions
        this.topicListeners.forEach((callbacks, destination) => {
          callbacks.forEach((_, callback) => {
            const subscription = this.client?.subscribe(destination, (msg) => {
              const parsed = safeParse(msg.body);
              // eslint-disable-next-line no-console
              console.log(`[STOMP] Received on ${destination}:`, parsed);
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
          // Token expired, refresh token through HTTP before next reconnect
          import('@/features/auth/lib/auth-session').then(({ authSession }) => {
            if (authSession.mightBeActive()) {
              authSession.refresh().catch(() => {});
            }
          });
        }
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

  // Listeners for standard private DMs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addMessageListener(listener: (msg: any) => void) {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
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

  // Listeners for typing indicators
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addTypingListener(listener: (msg: any) => void) {
    this.typingListeners.add(listener);
    return () => this.typingListeners.delete(listener);
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
        // eslint-disable-next-line no-console
        console.log(`[STOMP] Received on ${destination}:`, parsed);
        callback(parsed);
      });
      callbacks.set(callback, subscription);
      // eslint-disable-next-line no-console
      console.log(`[STOMP] Subscribed to ${destination}`);
    } else {
      // Add to map, it will be subscribed onConnect
      callbacks.set(callback, null);
      // eslint-disable-next-line no-console
      console.log(`[STOMP] Queued subscription for ${destination} (waiting for connection...)`);
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
      content: payload.content,
      replyToId: payload.replyToId ?? null,
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
}

export const wsService = new WebSocketService();
