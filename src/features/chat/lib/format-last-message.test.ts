import { describe, it, expect } from 'vitest';
import { formatLastMessagePreview } from './format-last-message';

describe('formatLastMessagePreview', () => {
  it('falls back to conversation type when lastMessage is null', () => {
    expect(formatLastMessagePreview({ type: 'DIRECT', lastMessage: null }, 'u1')).toEqual({
      text: 'Direct message',
      isDeleted: false,
      isCall: false,
      isSystem: false,
    });
    expect(formatLastMessagePreview({ type: 'GROUP', lastMessage: null }, 'u1')).toEqual({
      text: 'Group conversation',
      isDeleted: false,
      isCall: false,
      isSystem: false,
    });
  });

  it('shows deleted placeholder when deleted is true and content is null', () => {
    expect(
      formatLastMessagePreview(
        {
          type: 'DIRECT',
          lastMessage: {
            id: 'm1',
            senderId: 'u1',
            type: 'TEXT',
            content: null,
            createdAt: '2026-11-25T10:00:00Z',
            deleted: true,
          },
        },
        'u1',
      ),
    ).toEqual({
      text: 'This message was deleted',
      isDeleted: true,
      isCall: false,
      isSystem: false,
    });
  });

  it('prefixes You: for own TEXT, IMAGE, FILE, and VOICE messages', () => {
    expect(
      formatLastMessagePreview(
        {
          type: 'DIRECT',
          lastMessage: {
            id: 'm1',
            senderId: 'u1',
            type: 'TEXT',
            content: 'Hello',
            createdAt: '2026-11-25T10:00:00Z',
            deleted: false,
          },
        },
        'u1',
      ).text,
    ).toBe('You: Hello');

    expect(
      formatLastMessagePreview(
        {
          type: 'DIRECT',
          lastMessage: {
            id: 'm2',
            senderId: 'u2',
            type: 'IMAGE',
            content: null,
            createdAt: '2026-11-25T10:00:00Z',
            deleted: false,
          },
        },
        'u1',
      ).text,
    ).toBe('📷 Photo');

    expect(
      formatLastMessagePreview(
        {
          type: 'DIRECT',
          lastMessage: {
            id: 'm3',
            senderId: 'u1',
            type: 'VOICE',
            content: null,
            createdAt: '2026-11-25T10:00:00Z',
            deleted: false,
          },
        },
        'u1',
      ).text,
    ).toBe('You: 🎤 Voice message');

    expect(
      formatLastMessagePreview(
        {
          type: 'DIRECT',
          lastMessage: {
            id: 'm4',
            senderId: 'u2',
            type: 'FILE',
            content: 'report.pdf',
            createdAt: '2026-11-25T10:00:00Z',
            deleted: false,
          },
        },
        'u1',
      ).text,
    ).toBe('📎 report.pdf');
  });

  it('formats CALL and SYSTEM messages appropriately', () => {
    expect(
      formatLastMessagePreview(
        {
          type: 'DIRECT',
          lastMessage: {
            id: 'm5',
            senderId: 'u1',
            type: 'CALL',
            content: 'Call',
            createdAt: '2026-11-25T10:00:00Z',
            deleted: false,
          },
        },
        'u1',
      ),
    ).toEqual({
      text: 'Outgoing call',
      isDeleted: false,
      isCall: true,
      isSystem: false,
    });

    expect(
      formatLastMessagePreview(
        {
          type: 'DIRECT',
          lastMessage: {
            id: 'm6',
            senderId: 'u2',
            type: 'CALL',
            content: 'Call',
            createdAt: '2026-11-25T10:00:00Z',
            deleted: false,
          },
        },
        'u1',
      ),
    ).toEqual({
      text: 'Incoming call',
      isDeleted: false,
      isCall: true,
      isSystem: false,
    });

    expect(
      formatLastMessagePreview(
        {
          type: 'GROUP',
          lastMessage: {
            id: 'm7',
            senderId: null,
            type: 'SYSTEM',
            content: 'Alice joined the group',
            createdAt: '2026-11-25T10:00:00Z',
            deleted: false,
          },
        },
        'u1',
      ),
    ).toEqual({
      text: 'Alice joined the group',
      isDeleted: false,
      isCall: false,
      isSystem: true,
    });
  });
});
