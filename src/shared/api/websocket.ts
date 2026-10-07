import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  private client: Client | null = null;
  public isConnected = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private messageListeners = new Set<(msg: any) => void>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private typingListeners = new Set<(msg: any) => void>();

  // Track dynamic topic subscriptions
  // destination -> Map<callback, StompSubscription>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private topicListeners = new Map<string, Map<(msg: any) => void, any>>();

  connect() {
    if (this.client && this.client.active) return;

    this.client = new Client({
      // We use SockJS to fallback and handle cross-origin WebSocket upgrades cleanly.
      webSocketFactory: () => {
        // Use exact URL requested by user to ensure it hits local dev backend and allows credentials
        return new SockJS('http://localhost:8080/ws');
      },
      connectHeaders: {},
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: (frame) => {
        // eslint-disable-next-line no-console
        console.log('✅ Connected to Real-time Chat WebSocket:', frame);
        this.isConnected = true;

        // Subscribe to global user queue for private messages
        this.client?.subscribe('/user/queue/messages', (message) => {
          const parsedMessage = JSON.parse(message.body);
          // eslint-disable-next-line no-console
          console.log('📩 New Private Message:', parsedMessage);
          this.messageListeners.forEach((listener) => listener(parsedMessage));
        });

        // Optional: Global typing indicator queue
        this.client?.subscribe('/user/queue/typing', (message) => {
          const parsedTyping = JSON.parse(message.body);
          this.typingListeners.forEach((listener) => listener(parsedTyping));
        });

        // Re-establish any pending dynamic topic subscriptions
        this.topicListeners.forEach((callbacks, destination) => {
          callbacks.forEach((_, callback) => {
            const subscription = this.client?.subscribe(destination, (msg) => {
              callback(JSON.parse(msg.body));
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

  // Listeners for typing indicators
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addTypingListener(listener: (msg: any) => void) {
    this.typingListeners.add(listener);
    return () => this.typingListeners.delete(listener);
  }

  // Subscribe to specific topics (like a group chat)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribe(destination: string, callback: (message: any) => void) {
    if (!this.topicListeners.has(destination)) {
      this.topicListeners.set(destination, new Map());
    }

    const callbacks = this.topicListeners.get(destination)!;

    if (this.client && this.client.connected) {
      const subscription = this.client.subscribe(destination, (msg) => {
        callback(JSON.parse(msg.body));
      });
      callbacks.set(callback, subscription);
    } else {
      // Add to map, it will be subscribed onConnect
      callbacks.set(callback, null);
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
      return;
    }
    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }
}

export const wsService = new WebSocketService();
