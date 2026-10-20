import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCallStore } from './call.store';
import { wsService } from '@/shared/api/websocket';
import { callSound } from '../lib/sound';

describe('useCallStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCallStore.getState().cleanUp();

    // Mock Web Audio
    vi.spyOn(callSound, 'startOutgoingRing').mockImplementation(() => {});
    vi.spyOn(callSound, 'startIncomingRing').mockImplementation(() => {});
    vi.spyOn(callSound, 'stopRing').mockImplementation(() => {});
    vi.spyOn(callSound, 'playCallEnd').mockImplementation(() => {});

    // Mock WebSocket publish / sendCallSignal
    vi.spyOn(wsService, 'sendCallSignal').mockReturnValue(true);

    // Mock MediaDevices
    const mockTrack = {
      kind: 'audio',
      enabled: true,
      stop: vi.fn(),
      readyState: 'live',
    } as unknown as MediaStreamTrack;

    const mockStream = {
      getTracks: () => [mockTrack],
      getAudioTracks: () => [mockTrack],
      getVideoTracks: () => [],
      addTrack: vi.fn(),
    } as unknown as MediaStream;

    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
        getDisplayMedia: vi.fn().mockResolvedValue(mockStream),
      },
      writable: true,
      configurable: true,
    });

    // Mock RTCPeerConnection
    class MockRTCPeerConnection {
      iceConnectionState = 'new';
      remoteDescription: unknown = null;
      localDescription = { sdp: 'mock-sdp-offer', type: 'offer' };
      addTrack = vi.fn();
      getSenders = vi.fn().mockReturnValue([]);
      close = vi.fn();
      createOffer = vi.fn().mockResolvedValue({ sdp: 'mock-sdp-offer', type: 'offer' });
      createAnswer = vi.fn().mockResolvedValue({ sdp: 'mock-sdp-answer', type: 'answer' });
      setLocalDescription = vi.fn().mockResolvedValue(undefined);
      setRemoteDescription = vi.fn().mockResolvedValue(undefined);
      addIceCandidate = vi.fn().mockResolvedValue(undefined);
      onicecandidate: ((event: unknown) => void) | null = null;
      ontrack: ((event: unknown) => void) | null = null;
      oniceconnectionstatechange: (() => void) | null = null;
    }

    Object.defineProperty(global, 'RTCPeerConnection', {
      value: MockRTCPeerConnection,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'RTCSessionDescription', {
      value: class {
        sdp: string;
        type: string;
        constructor(init: { sdp: string; type: string }) {
          this.sdp = init.sdp;
          this.type = init.type;
        }
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'RTCIceCandidate', {
      value: class {
        candidate: string;
        constructor(init: { candidate: string }) {
          this.candidate = init.candidate;
        }
      },
      writable: true,
      configurable: true,
    });
  });

  it('starts an outgoing voice call and transmits OFFER via wsService', async () => {
    const startCall = useCallStore.getState().startCall;
    await startCall('conv-1', 'user-target-1', 'Alice', null, false);

    const state = useCallStore.getState();
    expect(state.status).toBe('outgoing');
    expect(state.targetUserId).toBe('user-target-1');
    expect(state.targetUserName).toBe('Alice');
    expect(state.callType).toBe('audio');
    expect(state.isCaller).toBe(true);

    expect(wsService.sendCallSignal).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: 'conv-1',
        targetUserId: 'user-target-1',
        action: 'OFFER',
        sdp: 'mock-sdp-offer',
      }),
    );
  });

  it('handles incoming OFFER signal and switches to incoming state', async () => {
    const handleIncomingSignal = useCallStore.getState().handleIncomingSignal;

    await handleIncomingSignal({
      conversationId: 'conv-1',
      callId: 'call-123',
      fromUserId: 'caller-user-id',
      fromUsername: 'Bob',
      targetUserId: 'my-user-id',
      action: 'OFFER',
      sdp: 'mock-sdp-offer-from-bob',
    });

    const state = useCallStore.getState();
    expect(state.status).toBe('incoming');
    expect(state.callId).toBe('call-123');
    expect(state.targetUserId).toBe('caller-user-id');
    expect(state.targetUserName).toBe('Bob');
    expect(state.isCaller).toBe(false);
  });

  it('replies with BUSY when already in a call and another OFFER arrives', async () => {
    // Put store in connected call
    useCallStore.setState({
      status: 'connected',
      callId: 'active-call-id',
      conversationId: 'conv-existing',
      targetUserId: 'other-user',
    });

    const handleIncomingSignal = useCallStore.getState().handleIncomingSignal;
    await handleIncomingSignal({
      conversationId: 'conv-new',
      callId: 'call-incoming-2',
      fromUserId: 'third-user',
      fromUsername: 'Charlie',
      targetUserId: 'my-user-id',
      action: 'OFFER',
      sdp: 'mock-sdp',
    });

    expect(wsService.sendCallSignal).toHaveBeenCalledWith({
      conversationId: 'conv-new',
      callId: 'call-incoming-2',
      targetUserId: 'third-user',
      action: 'BUSY',
    });
  });

  it('rejects an incoming call and transmits REJECT signal', async () => {
    useCallStore.setState({
      status: 'incoming',
      callId: 'call-to-reject',
      conversationId: 'conv-reject',
      targetUserId: 'caller-id',
    });

    useCallStore.getState().rejectCall();

    expect(wsService.sendCallSignal).toHaveBeenCalledWith({
      conversationId: 'conv-reject',
      callId: 'call-to-reject',
      targetUserId: 'caller-id',
      action: 'REJECT',
    });

    expect(useCallStore.getState().status).toBe('idle');
  });

  it('ends an active call and transmits END signal', async () => {
    useCallStore.setState({
      status: 'connected',
      callId: 'call-to-end',
      conversationId: 'conv-end',
      targetUserId: 'callee-id',
    });

    useCallStore.getState().endCall();

    expect(wsService.sendCallSignal).toHaveBeenCalledWith({
      conversationId: 'conv-end',
      callId: 'call-to-end',
      targetUserId: 'callee-id',
      action: 'END',
    });

    expect(useCallStore.getState().status).toBe('idle');
  });

  it('handles remote REJECT and cleans up call', async () => {
    useCallStore.setState({
      status: 'outgoing',
      callId: 'call-rejected',
      conversationId: 'conv-1',
      targetUserId: 'callee-id',
      targetUserName: 'Alice',
    });

    await useCallStore.getState().handleIncomingSignal({
      conversationId: 'conv-1',
      callId: 'call-rejected',
      fromUserId: 'callee-id',
      fromUsername: 'Alice',
      targetUserId: 'my-id',
      action: 'REJECT',
    });

    expect(useCallStore.getState().status).toBe('idle');
  });
});
