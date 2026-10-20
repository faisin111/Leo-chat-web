export type CallSignalAction = 'OFFER' | 'ANSWER' | 'ICE_CANDIDATE' | 'REJECT' | 'BUSY' | 'END';

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

export type CallStatus = 'idle' | 'outgoing' | 'incoming' | 'connecting' | 'connected' | 'ended';

export type CallType = 'audio' | 'video';

export type ActiveCall = {
  callId: string;
  conversationId: string;
  targetUserId: string;
  targetUserName: string;
  targetAvatarUrl?: string | null;
  callType: CallType;
  status: CallStatus;
  isCaller: boolean;
  sdpOffer?: string;
};
