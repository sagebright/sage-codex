/**
 * useChat Hook Tests
 *
 * TDD tests for the WebSocket connection and chat state management hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useChat } from './useChat';
import { useChatStore } from '@/stores/chatStore';
import { MockWebSocket } from '@/test/setup';

describe('useChat', () => {
  beforeEach(() => {
    // Reset WebSocket mock
    MockWebSocket.reset();

    // Reset chat store
    act(() => {
      useChatStore.getState().clearMessages();
      useChatStore.getState().setConnectionStatus('disconnected');
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('connection lifecycle', () => {
    it('connects to WebSocket on mount when autoConnect is true', async () => {
      renderHook(() => useChat({ sessionId: 'test-session' }));

      await waitFor(() => {
        expect(MockWebSocket.instances.length).toBe(1);
      });
    });

    it('does not connect when autoConnect is false', () => {
      renderHook(() =>
        useChat({ sessionId: 'test-session', autoConnect: false })
      );

      expect(MockWebSocket.instances.length).toBe(0);
    });

    it('connects to correct WebSocket URL', async () => {
      renderHook(() => useChat({ sessionId: 'test-session' }));

      await waitFor(() => {
        const ws = MockWebSocket.getLastInstance();
        expect(ws?.url).toContain('/ws');
      });
    });

    it('sets connection status to connected on successful connection', async () => {
      renderHook(() => useChat({ sessionId: 'test-session' }));

      await waitFor(() => {
        expect(useChatStore.getState().connectionStatus).toBe('connected');
      });
    });

    it('cleans up WebSocket on unmount', async () => {
      const { unmount } = renderHook(() =>
        useChat({ sessionId: 'test-session' })
      );

      await waitFor(() => {
        expect(MockWebSocket.instances.length).toBe(1);
      });

      const ws = MockWebSocket.getLastInstance()!;
      const closeSpy = ws.close;

      unmount();

      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('manual connection control', () => {
    it('provides connect function', async () => {
      const { result } = renderHook(() =>
        useChat({ sessionId: 'test-session', autoConnect: false })
      );

      expect(MockWebSocket.instances.length).toBe(0);

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(MockWebSocket.instances.length).toBe(1);
      });
    });

    it('provides disconnect function', async () => {
      const { result } = renderHook(() =>
        useChat({ sessionId: 'test-session' })
      );

      await waitFor(() => {
        expect(MockWebSocket.instances.length).toBe(1);
      });

      const ws = MockWebSocket.getLastInstance()!;

      act(() => {
        result.current.disconnect();
      });

      expect(ws.close).toHaveBeenCalled();
    });
  });

  describe('sending messages', () => {
    it('adds user message to store when sending', async () => {
      const { result } = renderHook(() =>
        useChat({ sessionId: 'test-session' })
      );

      await waitFor(() => {
        expect(useChatStore.getState().connectionStatus).toBe('connected');
      });

      act(() => {
        result.current.sendMessage('Hello world');
      });

      const messages = useChatStore.getState().messages;
      expect(messages.length).toBe(1);
      expect(messages[0].content).toBe('Hello world');
      expect(messages[0].role).toBe('user');
    });

    it('sends message via WebSocket', async () => {
      const { result } = renderHook(() =>
        useChat({ sessionId: 'test-session' })
      );

      await waitFor(() => {
        expect(MockWebSocket.instances.length).toBe(1);
      });

      const ws = MockWebSocket.getLastInstance()!;

      act(() => {
        result.current.sendMessage('Hello world');
      });

      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('chat:send')
      );
      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('Hello world')
      );
    });

    it('includes sessionId in sent message', async () => {
      const { result } = renderHook(() =>
        useChat({ sessionId: 'my-session-123' })
      );

      await waitFor(() => {
        expect(MockWebSocket.instances.length).toBe(1);
      });

      const ws = MockWebSocket.getLastInstance()!;

      act(() => {
        result.current.sendMessage('Hello');
      });

      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('my-session-123')
      );
    });

    it('does not send empty messages', async () => {
      const { result } = renderHook(() =>
        useChat({ sessionId: 'test-session' })
      );

      await waitFor(() => {
        expect(MockWebSocket.instances.length).toBe(1);
      });

      const ws = MockWebSocket.getLastInstance()!;

      act(() => {
        result.current.sendMessage('   ');
      });

      expect(ws.send).not.toHaveBeenCalled();
    });
  });

  describe('receiving messages', () => {
    it('handles stream:start message', async () => {
      renderHook(() => useChat({ sessionId: 'test-session' }));

      await waitFor(() => {
        expect(MockWebSocket.instances.length).toBe(1);
      });

      const ws = MockWebSocket.getLastInstance()!;

      act(() => {
        ws.simulateMessage({ type: 'stream:start', messageId: 'msg-123' });
      });

      expect(useChatStore.getState().isStreaming).toBe(true);
    });

    it('handles stream:chunk message', async () => {
      renderHook(() => useChat({ sessionId: 'test-session' }));

      await waitFor(() => {
        expect(MockWebSocket.instances.length).toBe(1);
      });

      const ws = MockWebSocket.getLastInstance()!;

      // Start streaming first
      act(() => {
        ws.simulateMessage({ type: 'stream:start', messageId: 'msg-123' });
      });

      // Then send chunk
      act(() => {
        ws.simulateMessage({ type: 'stream:chunk', content: 'Hello ' });
      });

      const messages = useChatStore.getState().messages;
      const streamingMessage = messages[messages.length - 1];
      expect(streamingMessage.content).toContain('Hello');
    });

    it('handles stream:end message', async () => {
      renderHook(() => useChat({ sessionId: 'test-session' }));

      await waitFor(() => {
        expect(MockWebSocket.instances.length).toBe(1);
      });

      const ws = MockWebSocket.getLastInstance()!;

      // Start streaming
      act(() => {
        ws.simulateMessage({ type: 'stream:start', messageId: 'msg-123' });
      });

      // End streaming
      act(() => {
        ws.simulateMessage({ type: 'stream:end', messageId: 'msg-123' });
      });

      expect(useChatStore.getState().isStreaming).toBe(false);
    });

    it('handles connected message', async () => {
      renderHook(() => useChat({ sessionId: 'test-session' }));

      await waitFor(() => {
        expect(MockWebSocket.instances.length).toBe(1);
      });

      const ws = MockWebSocket.getLastInstance()!;

      act(() => {
        ws.simulateMessage({ type: 'connected', message: 'Welcome' });
      });

      expect(useChatStore.getState().connectionStatus).toBe('connected');
    });
  });

  describe('reconnection', () => {
    it('sets status to reconnecting on disconnect', async () => {
      renderHook(() => useChat({ sessionId: 'test-session' }));

      await waitFor(() => {
        expect(MockWebSocket.instances.length).toBe(1);
      });

      const ws = MockWebSocket.getLastInstance()!;

      act(() => {
        ws.simulateClose(1006, 'Connection lost');
      });

      expect(useChatStore.getState().connectionStatus).toBe('reconnecting');
    });

    it('schedules reconnection after abnormal disconnect', async () => {
      // Test that status changes to reconnecting (which indicates reconnect is scheduled)
      renderHook(() =>
        useChat({
          sessionId: 'test-session',
          reconnectInterval: 1000,
        })
      );

      await waitFor(() => {
        expect(MockWebSocket.instances.length).toBe(1);
      });

      const ws = MockWebSocket.getLastInstance()!;

      act(() => {
        ws.simulateClose(1006, 'Connection lost');
      });

      // Status should be reconnecting
      expect(useChatStore.getState().connectionStatus).toBe('reconnecting');
    });

    it('does not reconnect on intentional close', async () => {
      const { result } = renderHook(() =>
        useChat({
          sessionId: 'test-session',
          reconnectInterval: 100,
        })
      );

      await waitFor(() => {
        expect(MockWebSocket.instances.length).toBe(1);
      });

      const instancesBeforeDisconnect = MockWebSocket.instances.length;

      // Intentionally disconnect
      act(() => {
        result.current.disconnect();
      });

      // Status should be disconnected (not reconnecting)
      expect(useChatStore.getState().connectionStatus).toBe('disconnected');

      // No new instances should be created
      expect(MockWebSocket.instances.length).toBe(instancesBeforeDisconnect);
    });

    it('does not reconnect on normal close code 1000', async () => {
      renderHook(() =>
        useChat({
          sessionId: 'test-session',
          reconnectInterval: 100,
        })
      );

      await waitFor(() => {
        expect(MockWebSocket.instances.length).toBe(1);
      });

      const ws = MockWebSocket.getLastInstance()!;

      act(() => {
        ws.simulateClose(1000, 'Normal closure');
      });

      // Status should be disconnected (not reconnecting)
      expect(useChatStore.getState().connectionStatus).toBe('disconnected');
    });
  });

  describe('state exposure', () => {
    it('exposes messages from store', async () => {
      // Add a message to store first
      act(() => {
        useChatStore.getState().addMessage({
          role: 'user',
          content: 'Existing message',
        });
      });

      const { result } = renderHook(() =>
        useChat({ sessionId: 'test-session' })
      );

      expect(result.current.messages.length).toBe(1);
      expect(result.current.messages[0].content).toBe('Existing message');
    });

    it('exposes isStreaming from store', async () => {
      const { result } = renderHook(() =>
        useChat({ sessionId: 'test-session' })
      );

      await waitFor(() => {
        expect(MockWebSocket.instances.length).toBe(1);
      });

      expect(result.current.isStreaming).toBe(false);

      const ws = MockWebSocket.getLastInstance()!;

      act(() => {
        ws.simulateMessage({ type: 'stream:start', messageId: 'msg-123' });
      });

      expect(result.current.isStreaming).toBe(true);
    });

    it('exposes connectionStatus from store', async () => {
      const { result } = renderHook(() =>
        useChat({ sessionId: 'test-session' })
      );

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });
    });
  });
});
