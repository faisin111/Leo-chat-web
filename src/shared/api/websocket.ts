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
  if (env.WS_URL) return env.WS_URL;
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:8080/ws';
  }
  return '/ws';
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
      beforeConnect: () => {
        const currentToken = useSession.getState().accessToken;
        if (currentToken) {
          this.client!.connectHeaders = {
            Authorization: `Bearer ${currentToken}`,
          };
        }
      },
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: (frame) => {
        // eslint-disable-next-line no-console
        console.log('✅ Connected to Real-time Chat WebSocket:', frame);
        this.isConnected = true;

        // 1. Subscribe to /user/queue/errors for STOMP error events
        this.client?.subscribe('/user/queue/errors', (message) => {
          const parsedErr: WsError = safeParse(message.body);
          // eslint-disable-next-line no-console
          console.error('❌ Received STOMP error on /user/queue/errors:', parsedErr);
          this.errorListeners.forEach((listener) => listener(parsedErr));
        });

        // 2. Subscribe to /user/queue/acks for delivery confirmations
        this.client?.subscribe('/user/queue/acks', (message) => {
          const parsedAck = safeParse(message.body);
          // eslint-disable-next-line no-console
          console.log('✅ Received Ack on /user/queue/acks:', parsedAck);
          this.ackListeners.forEach((listener) => listener(parsedAck));
        });

        // 3. Subscribe to global user queue for private messages
        this.client?.subscribe('/user/queue/messages', (message) => {
          const parsedMessage = safeParse(message.body);
          // eslint-disable-next-line no-console
          console.log('📩 New Private Message on /user/queue/messages:', parsedMessage);
          this.messageListeners.forEach((listener) => listener(parsedMessage));
        });

        // 4. Global typing indicator queue
        this.client?.subscribe('/user/queue/typing', (message) => {
          const parsedTyping = safeParse(message.body);
          this.typingListeners.forEach((listener) => listener(parsedTyping));
        });

        // 5. Re-establish any pending dynamic topic subscriptions
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
        console.error('❌ Broker reported error: ' + frame.headers['message']);
        // eslint-disable-next-line no-console
        console.error('❌ Additional details: ' + frame.body);
      },
      onWebSocketError: (event) => {
        // eslint-disable-next-line no-console
        console.error('❌ WebSocket error (is the backend running?):', event);
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
