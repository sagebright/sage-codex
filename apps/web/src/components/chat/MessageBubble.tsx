/**
 * MessageBubble Component
 *
 * Displays a single chat message with role-specific styling.
 * User messages are right-aligned with gold accent.
 * Assistant messages are left-aligned with parchment background.
 * System messages are centered with subtle styling.
 */

import type { ChatMessage } from '@/stores/chatStore';
import { StreamingText } from './StreamingText';

export interface MessageBubbleProps {
  /** The message to display */
  message: ChatMessage;
  /** Whether this message is currently streaming */
  isStreaming?: boolean;
  /** Additional CSS classes for the wrapper */
  className?: string;
}

/** Format timestamp for display */
function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Get role-specific styling classes */
function getBubbleClasses(role: ChatMessage['role']): string {
  const base = 'max-w-[80%] p-3 rounded-fantasy border';

  switch (role) {
    case 'user':
      return `${base} ml-auto bg-gold-100 border-gold-300 text-ink-900 dark:bg-gold-900/30 dark:border-gold-700 dark:text-parchment-100`;
    case 'assistant':
      return `${base} mr-auto bg-parchment-50 border-ink-200 text-ink-800 dark:bg-shadow-800 dark:border-shadow-600 dark:text-parchment-200`;
    case 'system':
      return `${base} mx-auto bg-ink-100 border-ink-200 text-ink-600 text-sm italic dark:bg-shadow-700 dark:border-shadow-600 dark:text-parchment-400`;
    default:
      return base;
  }
}

export function MessageBubble({
  message,
  isStreaming = false,
  className = '',
}: MessageBubbleProps) {
  const { role, content, timestamp } = message;
  const bubbleClasses = getBubbleClasses(role);

  // Use StreamingText for assistant messages to support streaming animation
  const renderContent = () => {
    if (role === 'assistant') {
      return (
        <StreamingText
          content={content}
          isStreaming={isStreaming}
          speed={80}
        />
      );
    }
    return <span className="whitespace-pre-wrap">{content}</span>;
  };

  return (
    <div
      data-testid="message-bubble-wrapper"
      className={`flex flex-col gap-1 ${className}`}
    >
      <article
        data-testid="message-bubble"
        role="article"
        aria-label={`${role} message`}
        className={bubbleClasses}
      >
        {renderContent()}
      </article>
      <time
        dateTime={timestamp.toISOString()}
        className={`text-xs text-ink-400 dark:text-parchment-500 ${
          role === 'user'
            ? 'text-right'
            : role === 'system'
              ? 'text-center'
              : 'text-left'
        }`}
      >
        {formatTime(timestamp)}
      </time>
    </div>
  );
}
