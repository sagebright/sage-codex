/**
 * SessionLengthSelect Component
 *
 * A button group for selecting session length duration.
 * Fantasy-themed with gold accent for selected option.
 */

import type { SessionLength } from '@dagger-app/shared-types';
import { DIAL_CONSTRAINTS } from '@dagger-app/shared-types';

export interface SessionLengthSelectProps {
  /** Current selected session length */
  value: SessionLength;
  /** Callback when session length changes */
  onChange: (length: SessionLength) => void;
  /** Optional label */
  label?: string;
  /** Whether the control is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const SESSION_OPTIONS = DIAL_CONSTRAINTS.sessionLength.options;

export function SessionLengthSelect({
  value,
  onChange,
  label,
  disabled = false,
  className = '',
}: SessionLengthSelectProps) {
  const handleSelect = (length: SessionLength) => {
    if (length !== value && !disabled) {
      onChange(length);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-ink-700 dark:text-parchment-300">
          {label}
        </label>
      )}
      <div role="group" aria-label="Session Length Selection" className="flex gap-2">
        {SESSION_OPTIONS.map((option) => {
          const isSelected = option === value;

          return (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={`
                flex-1 py-2 px-3 rounded-fantasy border
                font-medium transition-all duration-200
                ${
                  isSelected
                    ? 'bg-gold-100 border-gold-400 text-ink-900 shadow-gold-glow dark:bg-gold-900/40 dark:border-gold-500 dark:text-parchment-100'
                    : disabled
                      ? 'bg-ink-100 border-ink-200 text-ink-400 cursor-not-allowed dark:bg-shadow-700 dark:border-shadow-600 dark:text-shadow-400'
                      : 'bg-parchment-50 border-ink-300 text-ink-700 hover:bg-gold-50 hover:border-gold-300 dark:bg-shadow-800 dark:border-shadow-500 dark:text-parchment-200 dark:hover:bg-gold-900/20 dark:hover:border-gold-600'
                }
              `}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
