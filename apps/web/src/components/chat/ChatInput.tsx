/**
 * ChatInput Component
 *
 * Textarea with send button for chat messages.
 * Supports Enter to send, Shift+Enter for newlines.
 */

import { useState, useCallback, KeyboardEvent, ChangeEvent } from 'react';

export interface ChatInputProps {
  /** Called when user sends a message */
  onSend: (content: string) => void;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Placeholder text for textarea */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
  className = '',
}: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setValue('');
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const isEmpty = value.trim().length === 0;
  const isButtonDisabled = disabled || isEmpty;

  return (
    <div className={`flex gap-2 items-end ${className}`}>
      <textarea
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        aria-label="Chat message input"
        className="input flex-1 min-h-[44px] max-h-32 resize-none"
        rows={1}
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={isButtonDisabled}
        aria-label="Send message"
        className="btn-primary h-[44px] px-4"
      >
        Send
      </button>
    </div>
  );
}
