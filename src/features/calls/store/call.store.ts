import { create } from 'zustand';
import { wsService } from '@/shared/api/websocket';
import { toast } from 'sonner';
import { callSound } from '../lib/sound';
import type { CallStatus, CallType, CallSignalEvent } from '../types/call.types';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

let globalPeerConnection: RTCPeerConnection | null = null;
let pendingIceCandidates: Array<{
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
}> = [];
let durationInterval: ReturnType<typeof setInterval> | null = null;
let outgoingTimeout: ReturnType<typeof setTimeout> | null = null;
let originalVideoTrack: MediaStreamTrack | null = null;

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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: isVideo
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            }
          : false,
      });

      set({ localStream: stream });

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      globalPeerConnection = pc;
      pendingIceCandidates = [];

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        const remote = event.streams[0] || new MediaStream([event.track]);
        set({ remoteStream: remote });
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          wsService.sendCallSignal({
            conversationId,
            callId,
            targetUserId,
            action: 'ICE_CANDIDATE',
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          callSound.stopRing();
          if (outgoingTimeout) {
            clearTimeout(outgoingTimeout);
            outgoingTimeout = null;
          }
          set({ status: 'connected' });
          if (!durationInterval) {
            durationInterval = setInterval(() => {
              set((prev) => ({ durationSeconds: prev.durationSeconds + 1 }));
            }, 1000);
          }
        } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
          // If connection dropped, gracefully notify
          toast.error('Call connection lost');
          get().cleanUp();
        }
      };

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: isVideo,
      });
      await pc.setLocalDescription(offer);

      const published = wsService.sendCallSignal({
        conversationId,
        callId,
        targetUserId,
        action: 'OFFER',
        sdp: offer.sdp,
      });

      if (!published) {
        toast.error('Real-time connection is not available');
        get().cleanUp();
      }
    } catch (err) {
      console.error('Call init failed:', err);
      toast.error('Unable to access camera or microphone');
      get().cleanUp();
    }
  },

  acceptCall: async (withVideo?: boolean) => {
    callSound.stopRing();
    const { callId, conversationId, targetUserId, pendingOfferSdp, callType } = get();
    if (!callId || !conversationId || !targetUserId || !pendingOfferSdp) {
      get().cleanUp();
      return;
    }

    const shouldVideo = withVideo ?? callType === 'video';

    set({ status: 'connecting', callType: shouldVideo ? 'video' : 'audio' });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: shouldVideo
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            }
          : false,
      });

      set({ localStream: stream });

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      globalPeerConnection = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        const remote = event.streams[0] || new MediaStream([event.track]);
        set({ remoteStream: remote });
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          wsService.sendCallSignal({
            conversationId,
            callId,
            targetUserId,
            action: 'ICE_CANDIDATE',
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          set({ status: 'connected' });
          if (!durationInterval) {
            durationInterval = setInterval(() => {
              set((prev) => ({ durationSeconds: prev.durationSeconds + 1 }));
            }, 1000);
          }
        } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
          toast.error('Call disconnected');
          get().cleanUp();
        }
      };

      // Set remote offer description
      await pc.setRemoteDescription(
        new RTCSessionDescription({ type: 'offer', sdp: pendingOfferSdp }),
      );

      // Apply buffered candidates
      while (pendingIceCandidates.length > 0) {
        const candidateInit = pendingIceCandidates.shift();
        if (candidateInit) {
          await pc.addIceCandidate(new RTCIceCandidate(candidateInit)).catch(() => {});
        }
      }

      // Create and set local answer
      const answer = await pc.createAnswer();
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
      toast.error('Could not access microphone/camera');
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

  toggleCamera: async () => {
    const { localStream, isCameraOff, callType } = get();
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];

    // If call started as audio-only, enable camera now
    if (!videoTrack && callType === 'audio') {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        });
        const newVideoTrack = newStream.getVideoTracks()[0];
        if (newVideoTrack && globalPeerConnection) {
          localStream.addTrack(newVideoTrack);
          globalPeerConnection.addTrack(newVideoTrack, localStream);
          set({ callType: 'video', isCameraOff: false });
        }
      } catch {
        toast.error('Unable to access camera');
      }
      return;
    }

    if (videoTrack) {
      videoTrack.enabled = isCameraOff; // Invert
      set({ isCameraOff: !isCameraOff });
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
      case 'OFFER': {
        if (currentStatus !== 'idle') {
          // Send busy signal back to caller
          wsService.sendCallSignal({
            conversationId: event.conversationId,
            callId: event.callId,
            targetUserId: event.fromUserId,
            action: 'BUSY',
          });
          return;
        }

        const isVideo = !!event.sdp?.includes('m=video');
        set({
          status: 'incoming',
          callId: event.callId,
          conversationId: event.conversationId,
          targetUserId: event.fromUserId,
          targetUserName: event.fromUsername,
          callType: isVideo ? 'video' : 'audio',
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

      case 'ANSWER': {
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
