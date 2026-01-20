/**
 * StreamingText Component
 *
 * Displays text with a typewriter animation effect.
 * Uses requestAnimationFrame for smooth character-by-character reveal.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface StreamingTextProps {
  /** The full content to display */
  content: string;
  /** Whether streaming is currently active */
  isStreaming: boolean;
  /** Characters per second for the animation (default: 50) */
  speed?: number;
  /** Called when all content is revealed and streaming is complete */
  onComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function StreamingText({
  content,
  isStreaming,
  speed = 50,
  onComplete,
  className = '',
}: StreamingTextProps) {
  const [displayedLength, setDisplayedLength] = useState(isStreaming ? 0 : content.length);
  const lastTimeRef = useRef<number>(0);
  const rafRef = useRef<number>();
  const hasCalledComplete = useRef(false);

  // Reset displayed length when streaming starts with new content
  useEffect(() => {
    if (isStreaming && displayedLength > content.length) {
      setDisplayedLength(0);
    }
  }, [isStreaming, content.length, displayedLength]);

  // Animation loop using requestAnimationFrame
  const animate = useCallback(
    (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastTimeRef.current;
      const charsToAdd = Math.floor((elapsed * speed) / 1000);

      if (charsToAdd > 0) {
        setDisplayedLength((prev) => {
          const next = Math.min(prev + charsToAdd, content.length);
          return next;
        });
        lastTimeRef.current = timestamp;
      }

      // Continue animation if there's more content to reveal
      if (displayedLength < content.length && isStreaming) {
        rafRef.current = requestAnimationFrame(animate);
      }
    },
    [content.length, displayedLength, isStreaming, speed]
  );

  // Start/stop animation based on streaming state
  useEffect(() => {
    if (isStreaming && displayedLength < content.length) {
      lastTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isStreaming, displayedLength, content.length, animate]);

  // When streaming stops, immediately show all content
  useEffect(() => {
    if (!isStreaming) {
      setDisplayedLength(content.length);
    }
  }, [isStreaming, content.length]);

  // Call onComplete when streaming finishes and all content is revealed
  useEffect(() => {
    if (
      !isStreaming &&
      displayedLength >= content.length &&
      onComplete &&
      !hasCalledComplete.current
    ) {
      hasCalledComplete.current = true;
      onComplete();
    }

    // Reset the flag when streaming starts again
    if (isStreaming) {
      hasCalledComplete.current = false;
    }
  }, [isStreaming, displayedLength, content.length, onComplete]);

  const displayedContent = content.slice(0, displayedLength);
  const showCursor = isStreaming;

  return (
    <span
      data-testid="streaming-text"
      className={`whitespace-pre-wrap ${showCursor ? 'streaming-cursor' : ''} ${className}`}
    >
      {displayedContent}
    </span>
  );
}
