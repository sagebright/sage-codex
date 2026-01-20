/**
 * MessageBubble Component Tests
 *
 * TDD tests for the message bubble with user/assistant variants
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MessageBubble } from './MessageBubble';
import type { ChatMessage } from '@/stores/chatStore';

describe('MessageBubble', () => {
  // Mock requestAnimationFrame for StreamingText
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: () => void) => {
      setTimeout(cb, 0);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const createMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
    id: 'test-id',
    role: 'user',
    content: 'Hello world',
    timestamp: new Date('2024-01-15T10:30:00'),
    ...overrides,
  });

  describe('user messages', () => {
    it('renders user message content', () => {
      const message = createMessage({ role: 'user', content: 'Hello world' });
      render(<MessageBubble message={message} />);

      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('applies right alignment for user messages', () => {
      const message = createMessage({ role: 'user' });
      render(<MessageBubble message={message} />);

      const bubble = screen.getByTestId('message-bubble');
      expect(bubble).toHaveClass('ml-auto');
    });

    it('applies gold accent styling for user messages', () => {
      const message = createMessage({ role: 'user' });
      render(<MessageBubble message={message} />);

      const bubble = screen.getByTestId('message-bubble');
      expect(bubble).toHaveClass('bg-gold-100');
      expect(bubble).toHaveClass('border-gold-300');
    });
  });

  describe('assistant messages', () => {
    it('renders assistant message content', () => {
      const message = createMessage({ role: 'assistant', content: 'I can help you' });
      render(<MessageBubble message={message} />);

      expect(screen.getByText('I can help you')).toBeInTheDocument();
    });

    it('applies left alignment for assistant messages', () => {
      const message = createMessage({ role: 'assistant' });
      render(<MessageBubble message={message} />);

      const bubble = screen.getByTestId('message-bubble');
      expect(bubble).toHaveClass('mr-auto');
    });

    it('applies parchment styling for assistant messages', () => {
      const message = createMessage({ role: 'assistant' });
      render(<MessageBubble message={message} />);

      const bubble = screen.getByTestId('message-bubble');
      expect(bubble).toHaveClass('bg-parchment-50');
      expect(bubble).toHaveClass('border-ink-200');
    });
  });

  describe('system messages', () => {
    it('renders system message content', () => {
      const message = createMessage({ role: 'system', content: 'System notification' });
      render(<MessageBubble message={message} />);

      expect(screen.getByText('System notification')).toBeInTheDocument();
    });

    it('applies center alignment for system messages', () => {
      const message = createMessage({ role: 'system' });
      render(<MessageBubble message={message} />);

      const bubble = screen.getByTestId('message-bubble');
      expect(bubble).toHaveClass('mx-auto');
    });

    it('applies subtle styling for system messages', () => {
      const message = createMessage({ role: 'system' });
      render(<MessageBubble message={message} />);

      const bubble = screen.getByTestId('message-bubble');
      expect(bubble).toHaveClass('bg-ink-100');
    });
  });

  describe('timestamp display', () => {
    it('displays formatted timestamp', () => {
      const message = createMessage({
        timestamp: new Date('2024-01-15T10:30:00'),
      });
      render(<MessageBubble message={message} />);

      // Check for time format (should show hours and minutes)
      expect(screen.getByText(/10:30/)).toBeInTheDocument();
    });
  });

  describe('streaming state', () => {
    it('shows streaming indicator when isStreaming is true', () => {
      const message = createMessage({
        role: 'assistant',
        content: 'Streaming...',
        isStreamed: true,
      });
      render(<MessageBubble message={message} isStreaming={true} />);

      const textContainer = screen.getByTestId('streaming-text');
      expect(textContainer).toHaveClass('streaming-cursor');
    });

    it('does not show streaming indicator when isStreaming is false', () => {
      const message = createMessage({
        role: 'assistant',
        content: 'Complete message',
        isStreamed: true,
      });
      render(<MessageBubble message={message} isStreaming={false} />);

      const textContainer = screen.getByTestId('streaming-text');
      expect(textContainer).not.toHaveClass('streaming-cursor');
    });

    it('uses StreamingText for assistant messages when streaming', () => {
      const message = createMessage({
        role: 'assistant',
        content: 'Streaming content',
      });
      render(<MessageBubble message={message} isStreaming={true} />);

      expect(screen.getByTestId('streaming-text')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      const message = createMessage();
      render(<MessageBubble message={message} className="custom-class" />);

      const wrapper = screen.getByTestId('message-bubble-wrapper');
      expect(wrapper).toHaveClass('custom-class');
    });

    it('applies rounded corners', () => {
      const message = createMessage();
      render(<MessageBubble message={message} />);

      const bubble = screen.getByTestId('message-bubble');
      expect(bubble).toHaveClass('rounded-fantasy');
    });

    it('limits max width', () => {
      const message = createMessage();
      render(<MessageBubble message={message} />);

      const bubble = screen.getByTestId('message-bubble');
      expect(bubble).toHaveClass('max-w-[80%]');
    });
  });

  describe('dark mode', () => {
    it('has dark mode classes for user messages', () => {
      const message = createMessage({ role: 'user' });
      render(<MessageBubble message={message} />);

      const bubble = screen.getByTestId('message-bubble');
      expect(bubble.className).toContain('dark:');
    });

    it('has dark mode classes for assistant messages', () => {
      const message = createMessage({ role: 'assistant' });
      render(<MessageBubble message={message} />);

      const bubble = screen.getByTestId('message-bubble');
      expect(bubble.className).toContain('dark:');
    });
  });

  describe('accessibility', () => {
    it('has correct role', () => {
      const message = createMessage();
      render(<MessageBubble message={message} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('has aria-label indicating message role', () => {
      const message = createMessage({ role: 'assistant' });
      render(<MessageBubble message={message} />);

      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-label', expect.stringContaining('assistant'));
    });
  });
});
