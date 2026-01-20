/**
 * DialWrapper Component
 *
 * Consistent wrapper for dial components providing:
 * - Label with optional required indicator
 * - Description text
 * - Help text
 * - Error state
 * - Confirmed state indicator
 * - Confirm button
 *
 * Fantasy-themed styling.
 */

import { useId, type ReactNode } from 'react';
import type { DialId } from '@dagger-app/shared-types';

export interface DialWrapperProps {
  /** The dial component to wrap */
  children: ReactNode;
  /** Display label for the dial */
  label: string;
  /** Dial identifier */
  dialId: DialId | string;
  /** Optional description text */
  description?: string;
  /** Optional help text */
  helpText?: string;
  /** Whether this dial is required */
  required?: boolean;
  /** Whether this dial has been confirmed */
  isConfirmed?: boolean;
  /** Callback when confirm button is clicked */
  onConfirm?: (dialId: string) => void;
  /** Error message */
  error?: string;
  /** Additional CSS classes */
  className?: string;
}

export function DialWrapper({
  children,
  label,
  dialId,
  description,
  helpText,
  required = false,
  isConfirmed = false,
  onConfirm,
  error,
  className = '',
}: DialWrapperProps) {
  const labelId = useId();
  const descriptionId = useId();
  const errorId = useId();

  return (
    <div
      data-testid="dial-wrapper"
      className={`
        flex flex-col gap-2 p-4 rounded-fantasy border
        ${
          error
            ? 'border-blood bg-blood-50/20 dark:bg-blood-900/10'
            : isConfirmed
              ? 'border-gold-400 bg-gold-50/30 dark:border-gold-600 dark:bg-gold-900/10'
              : 'border-ink-200 bg-parchment-50 dark:border-shadow-600 dark:bg-shadow-800'
        }
        ${className}
      `}
    >
      {/* Header row with label and confirm indicator */}
      <div className="flex items-center justify-between">
        <label
          id={labelId}
          className="text-sm font-serif font-semibold text-ink-800 dark:text-parchment-200"
        >
          {label}
          {required && (
            <span className="text-blood ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>

        {isConfirmed && (
          <span
            data-testid="confirmed-indicator"
            className="flex items-center gap-1 text-xs text-gold-600 dark:text-gold-400"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Confirmed
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p
          id={descriptionId}
          className="text-xs text-ink-500 dark:text-parchment-400 -mt-1"
        >
          {description}
        </p>
      )}

      {/* Main content */}
      <div
        aria-labelledby={labelId}
        aria-describedby={description ? descriptionId : undefined}
      >
        {children}
      </div>

      {/* Help text */}
      {helpText && !error && (
        <p className="text-xs text-ink-400 dark:text-parchment-500 italic">
          {helpText}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-blood dark:text-blood-400 font-medium"
        >
          {error}
        </p>
      )}

      {/* Confirm button */}
      {onConfirm && !isConfirmed && (
        <button
          type="button"
          onClick={() => onConfirm(dialId)}
          className="
            self-end px-3 py-1 text-xs font-medium rounded-fantasy border
            bg-gold-100 border-gold-400 text-ink-800
            hover:bg-gold-200 hover:border-gold-500
            dark:bg-gold-900/40 dark:border-gold-600 dark:text-parchment-200
            dark:hover:bg-gold-900/60
            transition-all duration-200
          "
        >
          Confirm
        </button>
      )}
    </div>
  );
}
