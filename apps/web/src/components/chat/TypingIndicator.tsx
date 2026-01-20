/**
 * TypingIndicator Component
 *
 * Shows a three-dot bouncing animation to indicate the AI is processing.
 * Uses CSS animation defined in globals.css (.typing-dot class).
 */

export interface TypingIndicatorProps {
  /** Optional text to display alongside the indicator */
  text?: string;
  /** Additional CSS classes */
  className?: string;
}

export function TypingIndicator({
  text = 'Claude is thinking...',
  className = '',
}: TypingIndicatorProps) {
  return (
    <div
      data-testid="typing-indicator"
      className={`flex items-center gap-3 p-3 ${className}`}
      role="status"
      aria-label="AI is typing"
    >
      <div className="flex gap-1">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      {text && (
        <span className="text-sm text-ink-500 dark:text-parchment-400">
          {text}
        </span>
      )}
    </div>
  );
}
