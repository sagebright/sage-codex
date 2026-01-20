/**
 * StreamingText Component Tests
 *
 * TDD tests for the typewriter animation component
 */

import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StreamingText } from './StreamingText';

describe('StreamingText', () => {
  // Mock requestAnimationFrame for controlled testing
  let rafCallbacks: ((timestamp: number) => void)[] = [];
  let rafId = 0;
  let currentTime = 0;

  beforeEach(() => {
    rafCallbacks = [];
    rafId = 0;
    currentTime = 0;

    vi.stubGlobal('requestAnimationFrame', (callback: (timestamp: number) => void) => {
      rafCallbacks.push(callback);
      return ++rafId;
    });

    vi.stubGlobal('cancelAnimationFrame', (_id: number) => {
      // Mock implementation - no action needed
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Helper to advance animation frames
  const advanceFrames = (frameCount: number, timePerFrame = 16) => {
    for (let i = 0; i < frameCount; i++) {
      currentTime += timePerFrame;
      const callbacks = [...rafCallbacks];
      rafCallbacks = [];
      callbacks.forEach((cb) => cb(currentTime));
    }
  };

  describe('content display', () => {
    it('shows full content when not streaming', () => {
      render(<StreamingText content="Hello world" isStreaming={false} />);

      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('initially shows empty content when streaming starts', () => {
      render(<StreamingText content="Hello world" isStreaming={true} />);

      const textElement = screen.getByTestId('streaming-text');
      expect(textElement.textContent).toBe('');
    });

    it('reveals characters progressively during streaming', async () => {
      render(<StreamingText content="Hello" isStreaming={true} speed={100} />);

      // Run a few animation frames
      await act(async () => {
        advanceFrames(10, 50); // 500ms worth of frames at 100 chars/sec = ~50 chars
      });

      const textElement = screen.getByTestId('streaming-text');
      expect(textElement.textContent?.length).toBeGreaterThan(0);
    });

    it('shows full content immediately when streaming stops', () => {
      const { rerender } = render(
        <StreamingText content="Hi" isStreaming={true} speed={100} />
      );

      // Finish streaming
      rerender(<StreamingText content="Hi" isStreaming={false} speed={100} />);

      expect(screen.getByText('Hi')).toBeInTheDocument();
    });
  });

  describe('cursor indicator', () => {
    it('shows cursor during streaming', () => {
      render(<StreamingText content="Hello" isStreaming={true} />);

      const textElement = screen.getByTestId('streaming-text');
      expect(textElement).toHaveClass('streaming-cursor');
    });

    it('hides cursor when not streaming', () => {
      render(<StreamingText content="Hi" isStreaming={false} />);

      const textElement = screen.getByTestId('streaming-text');
      expect(textElement).not.toHaveClass('streaming-cursor');
    });

    it('hides cursor when streaming stops', () => {
      const { rerender } = render(
        <StreamingText content="Hi" isStreaming={true} />
      );

      rerender(<StreamingText content="Hi" isStreaming={false} />);

      const textElement = screen.getByTestId('streaming-text');
      expect(textElement).not.toHaveClass('streaming-cursor');
    });
  });

  describe('onComplete callback', () => {
    it('calls onComplete when streaming finishes', () => {
      const onComplete = vi.fn();

      const { rerender } = render(
        <StreamingText
          content="Hi"
          isStreaming={true}
          onComplete={onComplete}
        />
      );

      expect(onComplete).not.toHaveBeenCalled();

      // Finish streaming
      rerender(
        <StreamingText
          content="Hi"
          isStreaming={false}
          onComplete={onComplete}
        />
      );

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('does not call onComplete while still streaming', async () => {
      const onComplete = vi.fn();

      render(
        <StreamingText
          content="Hello world"
          isStreaming={true}
          speed={10}
          onComplete={onComplete}
        />
      );

      // Run some animation frames
      await act(async () => {
        advanceFrames(5);
      });

      expect(onComplete).not.toHaveBeenCalled();
    });

    it('only calls onComplete once', () => {
      const onComplete = vi.fn();

      const { rerender } = render(
        <StreamingText
          content="Hi"
          isStreaming={true}
          onComplete={onComplete}
        />
      );

      // Finish streaming
      rerender(
        <StreamingText
          content="Hi"
          isStreaming={false}
          onComplete={onComplete}
        />
      );

      // Rerender again with same props
      rerender(
        <StreamingText
          content="Hi"
          isStreaming={false}
          onComplete={onComplete}
        />
      );

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('content updates', () => {
    it('handles content growing during streaming', async () => {
      const { rerender } = render(
        <StreamingText content="Hello" isStreaming={true} speed={1000} />
      );

      // Run animation
      await act(async () => {
        advanceFrames(5, 20);
      });

      // Add more content (simulating streaming chunks)
      rerender(
        <StreamingText content="Hello world" isStreaming={true} speed={1000} />
      );

      // Run more animation
      await act(async () => {
        advanceFrames(5, 20);
      });

      const textElement = screen.getByTestId('streaming-text');
      expect(textElement.textContent).toBeTruthy();
    });
  });

  describe('speed configuration', () => {
    it('uses default speed when not specified', () => {
      render(<StreamingText content="Hello" isStreaming={true} />);

      // Component should render without error using default speed
      expect(screen.getByTestId('streaming-text')).toBeInTheDocument();
    });

    it('reveals more content with higher speed', async () => {
      // Render with high speed
      render(
        <StreamingText content="Hello world test" isStreaming={true} speed={2000} />
      );

      // Run animation frames
      await act(async () => {
        advanceFrames(10, 16);
      });

      const textElement = screen.getByTestId('streaming-text');
      // With 2000 chars/sec and ~160ms elapsed, should have revealed several characters
      expect(textElement.textContent?.length).toBeGreaterThan(0);
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(
        <StreamingText
          content="Hello"
          isStreaming={false}
          className="custom-class"
        />
      );

      const textElement = screen.getByTestId('streaming-text');
      expect(textElement).toHaveClass('custom-class');
    });

    it('preserves whitespace in content', () => {
      render(
        <StreamingText
          content="Line 1\nLine 2"
          isStreaming={false}
        />
      );

      const textElement = screen.getByTestId('streaming-text');
      expect(textElement).toHaveClass('whitespace-pre-wrap');
    });
  });

  describe('cleanup', () => {
    it('cleans up animation on unmount', async () => {
      const cancelSpy = vi.fn();
      vi.stubGlobal('cancelAnimationFrame', cancelSpy);

      const { unmount } = render(
        <StreamingText content="Hello world" isStreaming={true} />
      );

      // Start animation
      await act(async () => {
        advanceFrames(1);
      });

      // Unmount should call cancelAnimationFrame
      unmount();

      // The component should have cleaned up
      expect(cancelSpy).toHaveBeenCalled();
    });
  });
});
