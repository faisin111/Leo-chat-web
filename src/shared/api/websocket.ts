import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  private client: Client | null = null;
  public isConnected = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private messageListeners = new Set<(msg: any) => void>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private typingListeners = new Set<(msg: any) => void>();

  connect() {
    if (this.client && this.client.active) return;

    this.client = new Client({
      // We use SockJS to fallback and handle cross-origin WebSocket upgrades cleanly.
      // Pointing to /ws takes advantage of Vite's proxy in dev, and relative paths in prod.
      webSocketFactory: () => {
        return new SockJS('/ws');
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
          this.messageListeners.forEach(listener => listener(parsedMessage));
        });

        // Optional: Global typing indicator queue
        this.client?.subscribe('/user/queue/typing', (message) => {
          const parsedTyping = JSON.parse(message.body);
          this.typingListeners.forEach(listener => listener(parsedTyping));
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
      }
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
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
    if (!this.client || !this.client.connected) return () => {};
    
    const subscription = this.client.subscribe(destination, (msg) => {
      callback(JSON.parse(msg.body));
    });

    return () => subscription.unsubscribe();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publish(destination: string, body: any) {
    if (!this.client || !this.client.connected) {
      console.warn('⚠️ Cannot publish, STOMP client is not connected');
      return;
    }
    this.client.publish({
      destination,
      body: JSON.stringify(body)
    });
  }
}

export const wsService = new WebSocketService();
