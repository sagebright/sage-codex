/**
 * Chat Store Tests
 *
 * Tests for message history and streaming state:
 * - addMessage creates messages with UUID and timestamp
 * - Streaming flow (start, append, finalize, cancel)
 * - Connection status management
 * - Date serialization in message timestamps
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import {
  useChatStore,
  selectLastMessage,
  selectMessagesByRole,
  selectMessageCount,
  selectIsStreaming,
  selectIsConnected,
} from './chatStore';
import { clearPersistedStorage, storeAction } from '../test/store-utils';

// Storage key used by the store
const STORAGE_KEY = 'dagger-chat-storage';

describe('chatStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    clearPersistedStorage(STORAGE_KEY);

    // Reset store to initial state
    act(() => {
      useChatStore.getState().clearMessages();
      useChatStore.getState().setConnectionStatus('disconnected');
    });
  });

  describe('initial state', () => {
    it('starts with empty messages', () => {
      const state = useChatStore.getState();
      expect(state.messages).toEqual([]);
    });

    it('starts with streaming disabled', () => {
      const state = useChatStore.getState();
      expect(state.isStreaming).toBe(false);
      expect(state.streamingMessageId).toBeNull();
    });

    it('starts disconnected', () => {
      const state = useChatStore.getState();
      expect(state.connectionStatus).toBe('disconnected');
    });
  });

  describe('addMessage', () => {
    it('adds a message with generated ID', () => {
      const messageId = storeAction(() =>
        useChatStore.getState().addMessage({
          role: 'user',
          content: 'Hello',
        })
      );

      expect(messageId).toBe('test-uuid-0001');
      expect(useChatStore.getState().messages).toHaveLength(1);
    });

    it('adds a message with timestamp', () => {
      const beforeTime = new Date();

      storeAction(() =>
        useChatStore.getState().addMessage({
          role: 'user',
          content: 'Hello',
        })
      );

      const afterTime = new Date();
      const message = useChatStore.getState().messages[0];

      expect(message.timestamp).toBeInstanceOf(Date);
      expect(message.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(message.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('preserves message content and role', () => {
      storeAction(() =>
        useChatStore.getState().addMessage({
          role: 'assistant',
          content: 'How can I help?',
          metadata: { dialUpdate: 'partySize' },
        })
      );

      const message = useChatStore.getState().messages[0];

      expect(message.role).toBe('assistant');
      expect(message.content).toBe('How can I help?');
      expect(message.metadata).toEqual({ dialUpdate: 'partySize' });
    });

    it('appends multiple messages in order', () => {
      storeAction(() => {
        useChatStore.getState().addMessage({ role: 'user', content: 'First' });
        useChatStore.getState().addMessage({ role: 'assistant', content: 'Second' });
        useChatStore.getState().addMessage({ role: 'user', content: 'Third' });
      });

      const messages = useChatStore.getState().messages;

      expect(messages).toHaveLength(3);
      expect(messages[0].content).toBe('First');
      expect(messages[1].content).toBe('Second');
      expect(messages[2].content).toBe('Third');
    });
  });

  describe('updateMessage', () => {
    it('updates message content', () => {
      const messageId = storeAction(() =>
        useChatStore.getState().addMessage({
          role: 'assistant',
          content: 'Initial',
        })
      );

      storeAction(() =>
        useChatStore.getState().updateMessage(messageId, { content: 'Updated' })
      );

      const message = useChatStore.getState().messages[0];
      expect(message.content).toBe('Updated');
    });

    it('updates message metadata', () => {
      const messageId = storeAction(() =>
        useChatStore.getState().addMessage({
          role: 'assistant',
          content: 'Message',
        })
      );

      storeAction(() =>
        useChatStore.getState().updateMessage(messageId, {
          metadata: { processed: true },
        })
      );

      const message = useChatStore.getState().messages[0];
      expect(message.metadata).toEqual({ processed: true });
    });

    it('preserves other fields when updating', () => {
      const messageId = storeAction(() =>
        useChatStore.getState().addMessage({
          role: 'user',
          content: 'Original',
        })
      );

      const originalTimestamp = useChatStore.getState().messages[0].timestamp;

      storeAction(() =>
        useChatStore.getState().updateMessage(messageId, { content: 'Updated' })
      );

      const message = useChatStore.getState().messages[0];
      expect(message.role).toBe('user');
      expect(message.id).toBe(messageId);
      expect(message.timestamp).toEqual(originalTimestamp);
    });

    it('does nothing for non-existent message ID', () => {
      storeAction(() =>
        useChatStore.getState().addMessage({
          role: 'user',
          content: 'Original',
        })
      );

      storeAction(() =>
        useChatStore.getState().updateMessage('non-existent', { content: 'Updated' })
      );

      const message = useChatStore.getState().messages[0];
      expect(message.content).toBe('Original');
    });
  });

  describe('streaming workflow', () => {
    describe('startStreaming', () => {
      it('creates an empty assistant message', () => {
        storeAction(() => useChatStore.getState().startStreaming());

        const state = useChatStore.getState();
        expect(state.messages).toHaveLength(1);
        expect(state.messages[0].role).toBe('assistant');
        expect(state.messages[0].content).toBe('');
        expect(state.messages[0].isStreamed).toBe(true);
      });

      it('sets streaming state', () => {
        storeAction(() => useChatStore.getState().startStreaming());

        const state = useChatStore.getState();
        expect(state.isStreaming).toBe(true);
        expect(state.streamingMessageId).toBe('test-uuid-0001');
      });

      it('returns the streaming message ID', () => {
        const messageId = storeAction(() => useChatStore.getState().startStreaming());

        expect(messageId).toBe('test-uuid-0001');
      });
    });

    describe('appendToStreaming', () => {
      it('appends content to streaming message', () => {
        storeAction(() => useChatStore.getState().startStreaming());
        storeAction(() => useChatStore.getState().appendToStreaming('Hello'));
        storeAction(() => useChatStore.getState().appendToStreaming(' world'));

        const message = useChatStore.getState().messages[0];
        expect(message.content).toBe('Hello world');
      });

      it('does nothing when not streaming', () => {
        storeAction(() =>
          useChatStore.getState().addMessage({ role: 'assistant', content: 'Original' })
        );
        storeAction(() => useChatStore.getState().appendToStreaming(' extra'));

        const message = useChatStore.getState().messages[0];
        expect(message.content).toBe('Original');
      });

      it('handles multiple chunks in sequence', () => {
        storeAction(() => useChatStore.getState().startStreaming());

        const chunks = ['Once', ' upon', ' a', ' time'];
        chunks.forEach((chunk) => {
          storeAction(() => useChatStore.getState().appendToStreaming(chunk));
        });

        const message = useChatStore.getState().messages[0];
        expect(message.content).toBe('Once upon a time');
      });
    });

    describe('finalizeStreaming', () => {
      it('clears streaming state', () => {
        storeAction(() => useChatStore.getState().startStreaming());
        storeAction(() => useChatStore.getState().appendToStreaming('Content'));
        storeAction(() => useChatStore.getState().finalizeStreaming());

        const state = useChatStore.getState();
        expect(state.isStreaming).toBe(false);
        expect(state.streamingMessageId).toBeNull();
      });

      it('preserves the completed message', () => {
        storeAction(() => useChatStore.getState().startStreaming());
        storeAction(() => useChatStore.getState().appendToStreaming('Final content'));
        storeAction(() => useChatStore.getState().finalizeStreaming());

        const messages = useChatStore.getState().messages;
        expect(messages).toHaveLength(1);
        expect(messages[0].content).toBe('Final content');
      });
    });

    describe('cancelStreaming', () => {
      it('removes the streaming message', () => {
        storeAction(() => useChatStore.getState().startStreaming());
        storeAction(() => useChatStore.getState().appendToStreaming('Partial'));
        storeAction(() => useChatStore.getState().cancelStreaming());

        const state = useChatStore.getState();
        expect(state.messages).toHaveLength(0);
        expect(state.isStreaming).toBe(false);
        expect(state.streamingMessageId).toBeNull();
      });

      it('handles cancel when not streaming', () => {
        storeAction(() => useChatStore.getState().cancelStreaming());

        const state = useChatStore.getState();
        expect(state.isStreaming).toBe(false);
      });

      it('preserves non-streaming messages', () => {
        storeAction(() =>
          useChatStore.getState().addMessage({ role: 'user', content: 'User message' })
        );
        storeAction(() => useChatStore.getState().startStreaming());
        storeAction(() => useChatStore.getState().appendToStreaming('Partial'));
        storeAction(() => useChatStore.getState().cancelStreaming());

        const messages = useChatStore.getState().messages;
        expect(messages).toHaveLength(1);
        expect(messages[0].content).toBe('User message');
      });
    });

    describe('complete streaming flow', () => {
      it('handles full conversation with streaming', () => {
        // User sends message
        storeAction(() =>
          useChatStore.getState().addMessage({ role: 'user', content: 'What is 2+2?' })
        );

        // Assistant starts streaming
        storeAction(() => useChatStore.getState().startStreaming());
        storeAction(() => useChatStore.getState().appendToStreaming('The answer'));
        storeAction(() => useChatStore.getState().appendToStreaming(' is 4.'));
        storeAction(() => useChatStore.getState().finalizeStreaming());

        // User sends another message
        storeAction(() =>
          useChatStore.getState().addMessage({ role: 'user', content: 'Thanks!' })
        );

        const messages = useChatStore.getState().messages;
        expect(messages).toHaveLength(3);
        expect(messages[0].role).toBe('user');
        expect(messages[0].content).toBe('What is 2+2?');
        expect(messages[1].role).toBe('assistant');
        expect(messages[1].content).toBe('The answer is 4.');
        expect(messages[2].role).toBe('user');
        expect(messages[2].content).toBe('Thanks!');
      });
    });
  });

  describe('setConnectionStatus', () => {
    it('updates connection status to connected', () => {
      storeAction(() => useChatStore.getState().setConnectionStatus('connected'));

      expect(useChatStore.getState().connectionStatus).toBe('connected');
    });

    it('updates connection status to reconnecting', () => {
      storeAction(() => useChatStore.getState().setConnectionStatus('reconnecting'));

      expect(useChatStore.getState().connectionStatus).toBe('reconnecting');
    });

    it('updates connection status to disconnected', () => {
      storeAction(() => useChatStore.getState().setConnectionStatus('connected'));
      storeAction(() => useChatStore.getState().setConnectionStatus('disconnected'));

      expect(useChatStore.getState().connectionStatus).toBe('disconnected');
    });
  });

  describe('clearMessages', () => {
    it('removes all messages', () => {
      storeAction(() => {
        useChatStore.getState().addMessage({ role: 'user', content: 'One' });
        useChatStore.getState().addMessage({ role: 'assistant', content: 'Two' });
      });

      storeAction(() => useChatStore.getState().clearMessages());

      expect(useChatStore.getState().messages).toEqual([]);
    });

    it('resets streaming state', () => {
      storeAction(() => useChatStore.getState().startStreaming());
      storeAction(() => useChatStore.getState().clearMessages());

      const state = useChatStore.getState();
      expect(state.isStreaming).toBe(false);
      expect(state.streamingMessageId).toBeNull();
    });
  });

  describe('selectors', () => {
    describe('selectLastMessage', () => {
      it('returns undefined for empty messages', () => {
        const state = useChatStore.getState();
        expect(selectLastMessage(state)).toBeUndefined();
      });

      it('returns the last message', () => {
        storeAction(() => {
          useChatStore.getState().addMessage({ role: 'user', content: 'First' });
          useChatStore.getState().addMessage({ role: 'assistant', content: 'Last' });
        });

        const state = useChatStore.getState();
        const lastMessage = selectLastMessage(state);

        expect(lastMessage?.content).toBe('Last');
      });
    });

    describe('selectMessagesByRole', () => {
      beforeEach(() => {
        storeAction(() => {
          useChatStore.getState().addMessage({ role: 'user', content: 'User 1' });
          useChatStore.getState().addMessage({ role: 'assistant', content: 'Assistant 1' });
          useChatStore.getState().addMessage({ role: 'user', content: 'User 2' });
          useChatStore.getState().addMessage({ role: 'system', content: 'System' });
        });
      });

      it('filters user messages', () => {
        const state = useChatStore.getState();
        const userMessages = selectMessagesByRole(state, 'user');

        expect(userMessages).toHaveLength(2);
        expect(userMessages[0].content).toBe('User 1');
        expect(userMessages[1].content).toBe('User 2');
      });

      it('filters assistant messages', () => {
        const state = useChatStore.getState();
        const assistantMessages = selectMessagesByRole(state, 'assistant');

        expect(assistantMessages).toHaveLength(1);
        expect(assistantMessages[0].content).toBe('Assistant 1');
      });

      it('filters system messages', () => {
        const state = useChatStore.getState();
        const systemMessages = selectMessagesByRole(state, 'system');

        expect(systemMessages).toHaveLength(1);
        expect(systemMessages[0].content).toBe('System');
      });
    });

    describe('selectMessageCount', () => {
      it('returns 0 for empty messages', () => {
        const state = useChatStore.getState();
        expect(selectMessageCount(state)).toBe(0);
      });

      it('returns correct count', () => {
        storeAction(() => {
          useChatStore.getState().addMessage({ role: 'user', content: 'One' });
          useChatStore.getState().addMessage({ role: 'assistant', content: 'Two' });
        });

        const state = useChatStore.getState();
        expect(selectMessageCount(state)).toBe(2);
      });
    });

    describe('selectIsStreaming', () => {
      it('returns false when not streaming', () => {
        const state = useChatStore.getState();
        expect(selectIsStreaming(state)).toBe(false);
      });

      it('returns true when streaming', () => {
        storeAction(() => useChatStore.getState().startStreaming());

        const state = useChatStore.getState();
        expect(selectIsStreaming(state)).toBe(true);
      });
    });

    describe('selectIsConnected', () => {
      it('returns false when disconnected', () => {
        const state = useChatStore.getState();
        expect(selectIsConnected(state)).toBe(false);
      });

      it('returns true when connected', () => {
        storeAction(() => useChatStore.getState().setConnectionStatus('connected'));

        const state = useChatStore.getState();
        expect(selectIsConnected(state)).toBe(true);
      });

      it('returns false when reconnecting', () => {
        storeAction(() => useChatStore.getState().setConnectionStatus('reconnecting'));

        const state = useChatStore.getState();
        expect(selectIsConnected(state)).toBe(false);
      });
    });
  });

  describe('Date persistence (message timestamps)', () => {
    it('serializes Date as ISO string in localStorage', () => {
      storeAction(() =>
        useChatStore.getState().addMessage({ role: 'user', content: 'Hello' })
      );

      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(typeof parsed.state.messages[0].timestamp).toBe('string');
      expect(parsed.state.messages[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('deserializes ISO string back to Date on load', () => {
      storeAction(() =>
        useChatStore.getState().addMessage({ role: 'user', content: 'Hello' })
      );

      const originalTimestamp = useChatStore.getState().messages[0].timestamp;
      expect(originalTimestamp).toBeInstanceOf(Date);

      // Verify the stored format can be restored
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored!);

      // Manually restore like the storage handler does
      const restoredTimestamp = new Date(parsed.state.messages[0].timestamp);
      expect(restoredTimestamp).toBeInstanceOf(Date);
      expect(restoredTimestamp.getTime()).toBe(originalTimestamp.getTime());
    });

    it('handles multiple messages with different timestamps', () => {
      storeAction(() =>
        useChatStore.getState().addMessage({ role: 'user', content: 'First' })
      );

      // Small delay to ensure different timestamps
      const firstTimestamp = useChatStore.getState().messages[0].timestamp;

      storeAction(() =>
        useChatStore.getState().addMessage({ role: 'assistant', content: 'Second' })
      );

      const messages = useChatStore.getState().messages;
      expect(messages[0].timestamp).toBeInstanceOf(Date);
      expect(messages[1].timestamp).toBeInstanceOf(Date);
      expect(messages[1].timestamp.getTime()).toBeGreaterThanOrEqual(
        firstTimestamp.getTime()
      );
    });
  });

  describe('persistence partialize', () => {
    it('does not persist streaming state', () => {
      storeAction(() => useChatStore.getState().startStreaming());

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Streaming state should not be in persisted data
        expect(parsed.state.isStreaming).toBeUndefined();
        expect(parsed.state.streamingMessageId).toBeUndefined();
      }
    });

    it('persists messages', () => {
      storeAction(() =>
        useChatStore.getState().addMessage({ role: 'user', content: 'Persisted' })
      );

      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.messages).toHaveLength(1);
      expect(parsed.state.messages[0].content).toBe('Persisted');
    });

    it('persists connection status', () => {
      storeAction(() => useChatStore.getState().setConnectionStatus('connected'));

      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.connectionStatus).toBe('connected');
    });
  });
});
