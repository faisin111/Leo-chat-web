import { create } from 'zustand';
import { wsService } from '@/shared/api/websocket';
import { queryClient } from '@/app/providers/AppProviders';
import { env } from '@/shared/config/env';
import { toast } from 'sonner';
import { callSound } from '../lib/sound';
import type { CallStatus, CallType, CallSignalEvent } from '../types/call.types';

// STUN alone fails behind symmetric NAT (many mobile and corporate networks);
// multiple STUN servers and a TURN relay from env are added when configured.
const ICE_SERVERS = [
  {
    urls: [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302',
      'stun:stun3.l.google.com:19302',
      'stun:stun4.l.google.com:19302',
    ],
  },
  ...(env.TURN_URLS.length > 0
    ? [
        {
          urls: env.TURN_URLS,
          username: env.TURN_USERNAME,
          credential: env.TURN_CREDENTIAL,
        },
      ]
    : []),
];

let globalPeerConnection: RTCPeerConnection | null = null;
let pendingIceCandidates: Array<{
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
}> = [];
let localIceCandidates: Array<{
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
}> = [];
let durationInterval: ReturnType<typeof setInterval> | null = null;
let outgoingTimeout: ReturnType<typeof setTimeout> | null = null;
let disconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let originalVideoTrack: MediaStreamTrack | null = null;
let pendingOfferResolvers: Array<(sdp: string) => void> = [];

const clearDisconnectTimeout = () => {
  if (disconnectTimeout) {
    clearTimeout(disconnectTimeout);
    disconnectTimeout = null;
  }
};

function attachPeerConnectionLifecycle(
  pc: RTCPeerConnection,
  options: {
    conversationId: string;
    callId: string;
    targetUserId: string;
    recordLocalIce?: boolean;
    onConnected?: () => void;
    disconnectMessage: string;
  },
  set: (partial: Partial<CallState> | ((state: CallState) => Partial<CallState>)) => void,
  get: () => CallState,
) {
  const { conversationId, callId, targetUserId, recordLocalIce, onConnected, disconnectMessage } =
    options;

  pc.ontrack = (event) => {
    if (event.track?.kind === 'video' && get().callType !== 'video') {
      set({ callType: 'video' });
    }

    if (event.streams && event.streams[0]) {
      set({ remoteStream: new MediaStream(event.streams[0].getTracks()) });
    } else {
      set((state) => {
        const current = state.remoteStream || new MediaStream();
        if (!current.getTracks().some((t) => t.id === event.track.id)) {
          current.addTrack(event.track);
        }
        return { remoteStream: new MediaStream(current.getTracks()) };
      });
    }

    if (event.track) {
      event.track.onunmute = () => {
        const current = get().remoteStream;
        if (current) {
          set({ remoteStream: new MediaStream(current.getTracks()) });
        }
      };
    }
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      const candidateInit = {
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid,
        sdpMLineIndex: event.candidate.sdpMLineIndex,
      };
      if (recordLocalIce) {
        localIceCandidates.push(candidateInit);
      }
      wsService.sendCallSignal({
        conversationId,
        callId,
        targetUserId,
        action: 'ICE_CANDIDATE',
        ...candidateInit,
      });
    }
  };

  pc.oniceconnectionstatechange = () => {
    if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
      clearDisconnectTimeout();
      onConnected?.();
      set({ status: 'connected' });
      if (!durationInterval) {
        durationInterval = setInterval(() => {
          set((prev) => ({ durationSeconds: prev.durationSeconds + 1 }));
        }, 1000);
      }
    } else if (pc.iceConnectionState === 'disconnected') {
      clearDisconnectTimeout();
      disconnectTimeout = setTimeout(() => {
        if (
          globalPeerConnection === pc &&
          (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed')
        ) {
          toast.error(disconnectMessage);
          get().cleanUp();
        }
      }, 6000);
    } else if (pc.iceConnectionState === 'failed') {
      clearDisconnectTimeout();
      toast.error('Call connection failed');
      get().cleanUp();
    }
  };
}

const flushOfferResolvers = (sdp: string) => {
  const resolvers = pendingOfferResolvers;
  pendingOfferResolvers = [];
  resolvers.forEach((resolve) => resolve(sdp));
};

const waitForOfferSdp = (timeoutMs = 6000): Promise<string | null> =>
  new Promise((resolve) => {
    const timer = setTimeout(() => {
      pendingOfferResolvers = pendingOfferResolvers.filter((r) => r !== onOffer);
      resolve(null);
    }, timeoutMs);
    const onOffer = (sdp: string) => {
      clearTimeout(timer);
      resolve(sdp);
    };
    pendingOfferResolvers.push(onOffer);
  });

const waitForWsConnected = async (timeoutMs = 4000): Promise<boolean> => {
  if (wsService.isConnected) return true;
  wsService.connect();
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (wsService.isConnected) return true;
    await new Promise((r) => setTimeout(r, 150));
  }
  return wsService.isConnected;
};

/**
 * Acquires local audio (and optional video) gracefully.
 * Falls back from HD video -> basic video -> audio-only -> null (receive-only)
 * instead of aborting/crashing the call when a camera is busy or missing.
 */
async function acquireMediaStream(wantVideo: boolean): Promise<{
  stream: MediaStream | null;
  hasVideo: boolean;
  cameraFallbackReason?: string;
}> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return { stream: null, hasVideo: false, cameraFallbackReason: 'Media devices unavailable' };
  }

  const audioConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  };

  if (wantVideo) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });
      return { stream, hasVideo: stream.getVideoTracks().length > 0 };
    } catch {
      // Retry with unconstrained video (fixes cameras that reject ideal 720p or facingMode)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        return { stream, hasVideo: stream.getVideoTracks().length > 0 };
      } catch {
        // Camera unavailable or locked by another tab: continue with voice only
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: audioConstraints,
            video: false,
          });
          return {
            stream,
            hasVideo: false,
            cameraFallbackReason: 'Camera unavailable — continuing with voice only',
          };
        } catch {
          return {
            stream: null,
            hasVideo: false,
            cameraFallbackReason: 'Microphone/camera unavailable — joined in listen-only mode',
          };
        }
      }
    }
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: audioConstraints,
      video: false,
    });
    return { stream, hasVideo: false };
  } catch {
    return {
      stream: null,
      hasVideo: false,
      cameraFallbackReason: 'Microphone unavailable — joined in listen-only mode',
    };
  }
}

interface CallState {
  status: CallStatus;
  callId: string | null;
  conversationId: string | null;
  targetUserId: string | null;
  targetUserName: string | null;
  targetAvatarUrl: string | null;
  callType: CallType;
  isCaller: boolean;
  isMuted: boolean;
  isNoiseSuppressionEnabled: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isMinimized: boolean;
  durationSeconds: number;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  pendingOfferSdp: string | null;

  // Actions
  startCall: (
    conversationId: string,
    targetUserId: string,
    targetName: string,
    targetAvatar?: string | null,
    isVideo?: boolean,
  ) => Promise<void>;
  acceptCall: (withVideo?: boolean) => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleNoiseSuppression: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  toggleMinimize: () => void;
  handleIncomingSignal: (event: CallSignalEvent) => Promise<void>;
  cleanUp: () => void;
}

export const useCallStore = create<CallState>((set, get) => ({
  status: 'idle',
  callId: null,
  conversationId: null,
  targetUserId: null,
  targetUserName: null,
  targetAvatarUrl: null,
  callType: 'audio',
  isCaller: false,
  isMuted: false,
  isNoiseSuppressionEnabled: true,
  isCameraOff: false,
  isScreenSharing: false,
  isMinimized: false,
  durationSeconds: 0,
  localStream: null,
  remoteStream: null,
  pendingOfferSdp: null,

  startCall: async (
    conversationId: string,
    targetUserId: string,
    targetName: string,
    targetAvatar?: string | null,
    isVideo = false,
  ) => {
    if (get().status !== 'idle') {
      toast.error('You are already in a call');
      return;
    }

    const callId = crypto.randomUUID();
    const callType: CallType = isVideo ? 'video' : 'audio';

    set({
      status: 'outgoing',
      callId,
      conversationId,
      targetUserId,
      targetUserName: targetName,
      targetAvatarUrl: targetAvatar || null,
      callType,
      isCaller: true,
      isMuted: false,
      isNoiseSuppressionEnabled: true,
      isCameraOff: false,
      isScreenSharing: false,
      isMinimized: false,
      durationSeconds: 0,
      localStream: null,
      remoteStream: null,
      pendingOfferSdp: null,
    });

    callSound.startOutgoingRing();

    // 45s outgoing ring timeout
    outgoingTimeout = setTimeout(() => {
      if (get().status === 'outgoing') {
        toast.info('No answer');
        get().endCall();
      }
    }, 45000);

    try {
      const connected = await waitForWsConnected();
      if (!connected) {
        toast.error('Real-time connection is not available');
        get().cleanUp();
        return;
      }

      const { stream, hasVideo, cameraFallbackReason } = await acquireMediaStream(isVideo);
      if (cameraFallbackReason) {
        toast.info(cameraFallbackReason);
      }

      if (get().status === 'idle' || get().callId !== callId) {
        stream?.getTracks().forEach((t) => t.stop());
        return;
      }

      if (stream) {
        stream.getAudioTracks().forEach((track) => {
          track.enabled = true;
        });
        set({
          localStream: stream,
          isCameraOff: isVideo && !hasVideo,
        });
      } else {
        set({ isCameraOff: true });
      }

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      globalPeerConnection = pc;
      pendingIceCandidates = [];
      localIceCandidates = [];

      if (stream) {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      }

      attachPeerConnectionLifecycle(
        pc,
        {
          conversationId,
          callId,
          targetUserId,
          recordLocalIce: true,
          disconnectMessage: 'Call connection lost',
          onConnected: () => {
            callSound.stopRing();
            if (outgoingTimeout) {
              clearTimeout(outgoingTimeout);
              outgoingTimeout = null;
            }
          },
        },
        set,
        get,
      );

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: isVideo,
      });
      await pc.setLocalDescription(offer);

      // Backend records one idempotent CALL history entry and updates lastMessageAt on INVITE
      const invited = wsService.sendCallSignal({
        conversationId,
        callId,
        targetUserId,
        action: 'INVITE',
        sdp: offer.sdp,
      });

      const published = wsService.sendCallSignal({
        conversationId,
        callId,
        targetUserId,
        action: 'OFFER',
        sdp: offer.sdp,
      });

      if (invited || published) {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      } else {
        toast.error('Real-time connection is not available');
        get().cleanUp();
      }
    } catch (err) {
      console.error('Call init failed:', err);
      toast.error('Unable to start call');
      get().cleanUp();
    }
  },

  acceptCall: async (withVideo?: boolean) => {
    callSound.stopRing();
    const { callId, conversationId, targetUserId, callType } = get();
    if (!callId || !conversationId || !targetUserId) {
      get().cleanUp();
      return;
    }

    const shouldVideo = withVideo ?? callType === 'video';

    set({ status: 'connecting', callType: shouldVideo ? 'video' : 'audio' });

    try {
      const { stream, hasVideo, cameraFallbackReason } = await acquireMediaStream(shouldVideo);
      if (cameraFallbackReason) {
        toast.info(cameraFallbackReason);
      }

      // Call may have been cancelled/ended while awaiting device permissions
      if (get().status === 'idle' || get().callId !== callId) {
        stream?.getTracks().forEach((t) => t.stop());
        return;
      }

      if (stream) {
        stream.getAudioTracks().forEach((track) => {
          track.enabled = true;
        });
        set({
          localStream: stream,
          isCameraOff: shouldVideo && !hasVideo,
        });
      } else {
        set({ isCameraOff: true });
      }

      const offerSdp = get().pendingOfferSdp || (await waitForOfferSdp(6000));
      if (!offerSdp || get().status === 'idle' || get().callId !== callId) {
        if (!offerSdp) {
          toast.error('Call offer timed out');
        }
        get().cleanUp();
        return;
      }

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      globalPeerConnection = pc;

      attachPeerConnectionLifecycle(
        pc,
        {
          conversationId,
          callId,
          targetUserId,
          disconnectMessage: 'Call disconnected',
        },
        set,
        get,
      );

      // Set remote offer description BEFORE adding local tracks so Unified Plan reuses matching m-lines cleanly
      await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: offerSdp }));

      if (stream) {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      }

      // Apply buffered candidates
      while (pendingIceCandidates.length > 0) {
        const candidateInit = pendingIceCandidates.shift();
        if (candidateInit) {
          await pc.addIceCandidate(new RTCIceCandidate(candidateInit)).catch(() => {});
        }
      }

      // Create and set local answer with audio/video reception explicitly declared
      const answer = await pc.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: shouldVideo,
      });
      await pc.setLocalDescription(answer);

      // Transmit answer to caller
      wsService.sendCallSignal({
        conversationId,
        callId,
        targetUserId,
        action: 'ANSWER',
        sdp: answer.sdp,
      });
    } catch (err) {
      console.error('Failed to accept call:', err);
      toast.error('Failed to connect call');
      get().rejectCall();
    }
  },

  rejectCall: () => {
    callSound.stopRing();
    const { callId, conversationId, targetUserId } = get();
    if (callId && conversationId && targetUserId) {
      wsService.sendCallSignal({
        conversationId,
        callId,
        targetUserId,
        action: 'REJECT',
      });
    }
    get().cleanUp();
  },

  endCall: () => {
    callSound.playCallEnd();
    const { callId, conversationId, targetUserId } = get();
    if (callId && conversationId && targetUserId) {
      wsService.sendCallSignal({
        conversationId,
        callId,
        targetUserId,
        action: 'END',
      });
    }
    get().cleanUp();
  },

  toggleMute: () => {
    const { localStream, isMuted } = get();
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = isMuted; // Invert: if muted, enable it
      set({ isMuted: !isMuted });
    }
  },

  toggleNoiseSuppression: async () => {
    const { localStream, isNoiseSuppressionEnabled } = get();
    const audioTrack = localStream?.getAudioTracks()[0];
    if (!audioTrack) return;

    const nextEnabled = !isNoiseSuppressionEnabled;
    try {
      await audioTrack.applyConstraints({ noiseSuppression: nextEnabled });
      set({ isNoiseSuppressionEnabled: nextEnabled });
    } catch {
      toast.error('Noise reduction is not supported by this browser');
    }
  },

  toggleCamera: async () => {
    const { localStream, isCameraOff } = get();
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];

    // If no video track yet (audio-only call or camera fallback), enable camera now
    if (!videoTrack) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        });
        const newVideoTrack = newStream.getVideoTracks()[0];
        if (newVideoTrack && globalPeerConnection) {
          localStream.addTrack(newVideoTrack);
          globalPeerConnection.addTrack(newVideoTrack, localStream);
          set({
            localStream: new MediaStream(localStream.getTracks()),
            callType: 'video',
            isCameraOff: false,
          });
        }
      } catch {
        toast.error('Unable to access camera');
      }
      return;
    }

    if (videoTrack) {
      videoTrack.enabled = isCameraOff; // Invert
      set({
        localStream: new MediaStream(localStream.getTracks()),
        isCameraOff: !isCameraOff,
      });
    }
  },

  toggleScreenShare: async () => {
    const { isScreenSharing, localStream } = get();
    if (!globalPeerConnection || !localStream) return;

    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        if (!screenTrack) return;

        const senders = globalPeerConnection.getSenders();
        const videoSender = senders.find((s) => s.track && s.track.kind === 'video');

        if (videoSender) {
          originalVideoTrack = videoSender.track;
          await videoSender.replaceTrack(screenTrack);
        } else {
          globalPeerConnection.addTrack(screenTrack, localStream);
        }

        screenTrack.onended = () => {
          get()
            .toggleScreenShare()
            .catch(() => {});
        };

        set({ isScreenSharing: true });
      } catch {
        // User cancelled picker
      }
    } else {
      // Revert back to camera track
      const senders = globalPeerConnection.getSenders();
      const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
      if (videoSender && originalVideoTrack) {
        await videoSender.replaceTrack(originalVideoTrack);
        originalVideoTrack = null;
      }
      set({ isScreenSharing: false });
    }
  },

  toggleMinimize: () => {
    set((prev) => ({ isMinimized: !prev.isMinimized }));
  },

  handleIncomingSignal: async (event: CallSignalEvent) => {
    const currentStatus = get().status;

    switch (event.action) {
      case 'INVITE':
      case 'OFFER': {
        if (currentStatus !== 'idle') {
          // Handle matching active callId signals without emitting BUSY
          if (event.callId && event.callId === get().callId) {
            // Mobile callee woke via FCM push, accepted, connected, and sent an OFFER as offerer
            if (
              event.action === 'OFFER' &&
              event.sdp &&
              get().isCaller &&
              (currentStatus === 'outgoing' || currentStatus === 'connecting')
            ) {
              callSound.stopRing();
              if (outgoingTimeout) {
                clearTimeout(outgoingTimeout);
                outgoingTimeout = null;
              }
              const wantsVideo = event.sdp.includes('m=video') || get().callType === 'video';
              set({
                status: 'connecting',
                callType: wantsVideo ? 'video' : 'audio',
              });

              try {
                if (globalPeerConnection) {
                  globalPeerConnection.close();
                  globalPeerConnection = null;
                }

                const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
                globalPeerConnection = pc;

                attachPeerConnectionLifecycle(
                  pc,
                  {
                    conversationId: event.conversationId,
                    callId: event.callId,
                    targetUserId: event.fromUserId,
                    disconnectMessage: 'Call connection lost',
                  },
                  set,
                  get,
                );

                await pc.setRemoteDescription(
                  new RTCSessionDescription({ type: 'offer', sdp: event.sdp }),
                );

                const local = get().localStream;
                if (local) {
                  local.getTracks().forEach((track) => pc.addTrack(track, local));
                }

                while (pendingIceCandidates.length > 0) {
                  const candidateInit = pendingIceCandidates.shift();
                  if (candidateInit) {
                    await pc.addIceCandidate(new RTCIceCandidate(candidateInit)).catch(() => {});
                  }
                }

                const answer = await pc.createAnswer({
                  offerToReceiveAudio: true,
                  offerToReceiveVideo: wantsVideo,
                });
                await pc.setLocalDescription(answer);

                wsService.sendCallSignal({
                  conversationId: event.conversationId,
                  callId: event.callId,
                  targetUserId: event.fromUserId,
                  action: 'ANSWER',
                  sdp: answer.sdp,
                });
              } catch (err) {
                console.error('Failed to negotiate incoming offer from callee:', err);
                toast.error('Failed to connect call');
                get().endCall();
              }
              return;
            }

            if (event.sdp && !get().pendingOfferSdp) {
              const isVideo = event.sdp.includes('m=video');
              set({
                pendingOfferSdp: event.sdp,
                callType: isVideo ? 'video' : get().callType,
              });
              flushOfferResolvers(event.sdp);
            }
            return;
          }

          // If AI START_CALL triggered a placeholder INVITE (no SDP) from the same caller and
          // WebRTC startCall immediately follows with an OFFER/INVITE carrying SDP, adopt it.
          if (
            currentStatus === 'incoming' &&
            !get().pendingOfferSdp &&
            event.sdp &&
            event.fromUserId === get().targetUserId &&
            event.conversationId === get().conversationId
          ) {
            const isVideo = event.sdp.includes('m=video');
            set({
              callId: event.callId,
              pendingOfferSdp: event.sdp,
              callType: isVideo ? 'video' : get().callType,
            });
            flushOfferResolvers(event.sdp);
            return;
          }

          // Different call while busy: send busy signal back to caller
          wsService.sendCallSignal({
            conversationId: event.conversationId,
            callId: event.callId,
            targetUserId: event.fromUserId,
            action: 'BUSY',
          });
          return;
        }

        if (event.action === 'INVITE') {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['messages', event.conversationId] });
        }

        const isVideo = !!event.sdp?.includes('m=video');
        set({
          status: 'incoming',
          callId: event.callId,
          conversationId: event.conversationId,
          targetUserId: event.fromUserId,
          targetUserName: event.fromUsername || 'Incoming Call',
          callType: isVideo ? 'video' : 'audio',
          isNoiseSuppressionEnabled: true,
          pendingOfferSdp: event.sdp || null,
          isCaller: false,
          isMuted: false,
          isCameraOff: false,
          isScreenSharing: false,
          isMinimized: false,
          durationSeconds: 0,
        });

        callSound.startIncomingRing();
        break;
      }

      case 'ACCEPT':
      case 'READY': {
        if (event.callId && get().callId && event.callId !== get().callId) {
          return;
        }

        if (currentStatus === 'outgoing' || currentStatus === 'connecting') {
          callSound.stopRing();
          if (outgoingTimeout) {
            clearTimeout(outgoingTimeout);
            outgoingTimeout = null;
          }
          set({ status: 'connecting' });

          const { conversationId, callId, targetUserId } = get();
          const activeTargetId = event.fromUserId || targetUserId;
          const localOfferSdp = globalPeerConnection?.localDescription?.sdp;

          // Callee woke via FCM push and joined WebSocket; re-send OFFER and buffered ICE candidates
          if (conversationId && callId && activeTargetId && localOfferSdp) {
            wsService.sendCallSignal({
              conversationId,
              callId,
              targetUserId: activeTargetId,
              action: 'OFFER',
              sdp: localOfferSdp,
            });
            for (const cand of localIceCandidates) {
              wsService.sendCallSignal({
                conversationId,
                callId,
                targetUserId: activeTargetId,
                action: 'ICE_CANDIDATE',
                ...cand,
              });
            }
          }
        }
        break;
      }

      case 'ANSWER': {
        if (event.callId && get().callId && event.callId !== get().callId) {
          return;
        }

        if (currentStatus === 'outgoing' || currentStatus === 'connecting') {
          callSound.stopRing();
          if (outgoingTimeout) {
            clearTimeout(outgoingTimeout);
            outgoingTimeout = null;
          }
          set({ status: 'connecting' });

          if (globalPeerConnection && event.sdp) {
            try {
              await globalPeerConnection.setRemoteDescription(
                new RTCSessionDescription({ type: 'answer', sdp: event.sdp }),
              );

              // Apply buffered candidates
              while (pendingIceCandidates.length > 0) {
                const cand = pendingIceCandidates.shift();
                if (cand) {
                  await globalPeerConnection
                    .addIceCandidate(new RTCIceCandidate(cand))
                    .catch(() => {});
                }
              }
            } catch (err) {
              console.error('Failed to set remote answer description:', err);
            }
          }
        }
        break;
      }

      case 'ICE_CANDIDATE': {
        if (event.callId && get().callId && event.callId !== get().callId) {
          return;
        }

        if (event.candidate) {
          const candidateInit = {
            candidate: event.candidate,
            sdpMid: event.sdpMid,
            sdpMLineIndex: event.sdpMLineIndex,
          };

          if (globalPeerConnection && globalPeerConnection.remoteDescription) {
            await globalPeerConnection
              .addIceCandidate(new RTCIceCandidate(candidateInit))
              .catch(() => {});
          } else {
            pendingIceCandidates.push(candidateInit);
          }
        }
        break;
      }

      case 'REJECT': {
        callSound.stopRing();
        toast.error(`${get().targetUserName || 'User'} declined the call`);
        get().cleanUp();
        break;
      }

      case 'BUSY': {
        callSound.stopRing();
        toast.error(`${get().targetUserName || 'User'} is busy on another call`);
        get().cleanUp();
        break;
      }

      case 'UNAVAILABLE': {
        if (currentStatus === 'outgoing' || currentStatus === 'connecting') {
          callSound.stopRing();
          toast.error(`${get().targetUserName || 'User'} is offline or unavailable`);
          get().cleanUp();
        }
        break;
      }

      case 'RINGING':
      case 'DELIVERED': {
        // Push notification or signaling reached target user; outgoing call remains in ringing state
        break;
      }

      case 'END': {
        callSound.playCallEnd();
        toast.info('Call ended');
        get().cleanUp();
        break;
      }

      default:
        break;
    }
  },

  cleanUp: () => {
    callSound.stopRing();
    clearDisconnectTimeout();
    pendingOfferResolvers = [];

    if (outgoingTimeout) {
      clearTimeout(outgoingTimeout);
      outgoingTimeout = null;
    }

    if (durationInterval) {
      clearInterval(durationInterval);
      durationInterval = null;
    }

    // Stop local stream tracks
    const local = get().localStream;
    if (local) {
      local.getTracks().forEach((track) => track.stop());
    }

    // Stop remote stream tracks
    const remote = get().remoteStream;
    if (remote) {
      remote.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (globalPeerConnection) {
      globalPeerConnection.close();
      globalPeerConnection = null;
    }

    pendingIceCandidates = [];
    localIceCandidates = [];
    originalVideoTrack = null;

    set({
      status: 'idle',
      callId: null,
      conversationId: null,
      targetUserId: null,
      targetUserName: null,
      targetAvatarUrl: null,
      callType: 'audio',
      isCaller: false,
      isMuted: false,
      isNoiseSuppressionEnabled: true,
      isCameraOff: false,
      isScreenSharing: false,
      isMinimized: false,
      durationSeconds: 0,
      localStream: null,
      remoteStream: null,
      pendingOfferSdp: null,
    });
  },
}));
