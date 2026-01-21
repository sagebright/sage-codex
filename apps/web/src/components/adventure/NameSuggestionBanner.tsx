/**
 * NameSuggestionBanner Component
 *
 * Dismissible banner that suggests an adventure name after frame confirmation.
 * Allows user to accept, modify, or dismiss the suggestion.
 * Fantasy-themed styling consistent with other components.
 */

import { useState } from 'react';

// =============================================================================
// Props
// =============================================================================

export interface NameSuggestionBannerProps {
  /** Suggested adventure name */
  suggestedName: string;
  /** Callback when user accepts (with possibly modified name) */
  onAccept: (name: string) => void;
  /** Callback when user dismisses the suggestion */
  onDismiss: () => void;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function NameSuggestionBanner({
  suggestedName,
  onAccept,
  onDismiss,
  className = '',
}: NameSuggestionBannerProps) {
  const [editedName, setEditedName] = useState(suggestedName);
  const [isEditing, setIsEditing] = useState(false);

  const handleAccept = () => {
    const trimmedName = editedName.trim();
    if (trimmedName) {
      onAccept(trimmedName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAccept();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedName(suggestedName);
    }
  };

  return (
    <div
      className={`
        bg-gold-50 dark:bg-gold-900/20
        border border-gold-200 dark:border-gold-700
        rounded-fantasy p-4 shadow-sm
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-gold-600 dark:text-gold-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gold-800 dark:text-gold-200 mb-2">
            How about naming your adventure?
          </p>

          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="
                w-full px-3 py-2 text-sm rounded-fantasy border
                bg-parchment-50 dark:bg-shadow-800
                border-gold-300 dark:border-gold-600
                text-ink-900 dark:text-parchment-100
                focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400
                transition-all
              "
              aria-label="Edit adventure name"
            />
          ) : (
            <p className="text-base font-serif font-semibold text-ink-800 dark:text-parchment-100">
              "{suggestedName}"
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={!editedName.trim()}
                  className="
                    px-3 py-1.5 text-sm font-medium rounded-fantasy
                    bg-gold-500 text-ink-900
                    hover:bg-gold-400
                    dark:bg-gold-600 dark:hover:bg-gold-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedName(suggestedName);
                  }}
                  className="
                    px-3 py-1.5 text-sm font-medium rounded-fantasy
                    text-ink-600 dark:text-parchment-400
                    hover:bg-ink-100 dark:hover:bg-shadow-700
                    transition-colors
                  "
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="
                    px-3 py-1.5 text-sm font-medium rounded-fantasy
                    bg-gold-500 text-ink-900
                    hover:bg-gold-400
                    dark:bg-gold-600 dark:hover:bg-gold-500
                    transition-colors
                  "
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="
                    px-3 py-1.5 text-sm font-medium rounded-fantasy
                    text-gold-700 dark:text-gold-300
                    hover:bg-gold-100 dark:hover:bg-gold-900/30
                    transition-colors
                  "
                >
                  Modify
                </button>
                <button
                  type="button"
                  onClick={onDismiss}
                  className="
                    px-3 py-1.5 text-sm font-medium rounded-fantasy
                    text-ink-500 dark:text-parchment-500
                    hover:bg-ink-100 dark:hover:bg-shadow-700
                    transition-colors
                  "
                >
                  Dismiss
                </button>
              </>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onDismiss}
          className="
            flex-shrink-0 p-1 rounded-full
            text-gold-500 dark:text-gold-400
            hover:bg-gold-100 dark:hover:bg-gold-900/30
            transition-colors
          "
          aria-label="Dismiss suggestion"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
