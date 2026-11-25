import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ActiveCallModal } from './ActiveCallModal';
import { useCallStore } from '../store/call.store';

describe('ActiveCallModal', () => {
  beforeEach(() => {
    useCallStore.getState().cleanUp();
  });

  it('renders both Remote and You (Me) video frames side-by-side in video call compare view', () => {
    useCallStore.setState({
      status: 'connected',
      callId: 'call-ui-1',
      conversationId: 'conv-1',
      targetUserId: 'u2',
      targetUserName: 'Alice',
      callType: 'video',
      isCaller: true,
      isCameraOff: false,
      isMuted: false,
      isMinimized: false,
    });

    const { container } = render(<ActiveCallModal />);

    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('You (Me)')).toBeInTheDocument();
    expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Compare')).toBeInTheDocument();
    expect(container.querySelector('#remoteVideo')).toBeInTheDocument();
    expect(container.querySelector('#localVideo')).toBeInTheDocument();
  });
});
