/**
 * OptionButtonGroup Component
 *
 * A reusable component for selecting from discrete string options.
 * Renders options as a horizontal button group with aria-pressed state.
 *
 * Follows accessibility patterns from TierSelect component.
 * Fantasy-themed with gold accent styling.
 */

import { useId, useCallback } from 'react';

export interface OptionButtonGroupOption {
  /** The value to emit when selected */
  value: string;
  /** The display label */
  label: string;
  /** Optional description shown below the label */
  description?: string;
}

export interface OptionButtonGroupProps {
  /** Available options to choose from */
  options: OptionButtonGroupOption[];
  /** Currently selected value (null if no selection) */
  value: string | null;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Optional label for the group */
  label?: string;
  /** Whether the control is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function OptionButtonGroup({
  options,
  value,
  onChange,
  label,
  disabled = false,
  className = '',
}: OptionButtonGroupProps) {
  const groupId = useId();
  const labelId = `${groupId}-label`;

  const handleClick = useCallback(
    (optionValue: string) => {
      if (!disabled && optionValue !== value) {
        onChange(optionValue);
      }
    },
    [disabled, value, onChange]
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <span
          id={labelId}
          className="text-sm font-medium text-ink-700 dark:text-parchment-200"
        >
          {label}
        </span>
      )}
      <div
        role="group"
        aria-labelledby={label ? labelId : undefined}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="button"
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => handleClick(option.value)}
              className={`
                flex flex-col items-start px-4 py-2 rounded-lg border-2 transition-all
                focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2
                focus:ring-offset-parchment-100 dark:focus:ring-offset-shadow-900
                ${
                  isSelected
                    ? 'bg-gold-100 border-gold-500 text-ink-900 dark:bg-gold-600/20 dark:border-gold-500 dark:text-parchment-100'
                    : 'bg-parchment-50 border-ink-300 text-ink-700 hover:bg-gold-50 hover:border-gold-300 dark:bg-shadow-800 dark:border-shadow-600 dark:text-parchment-300 dark:hover:border-shadow-500 dark:hover:bg-shadow-700'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className="font-medium">{option.label}</span>
              {option.description && (
                <span className="text-xs text-ink-500 dark:text-parchment-400 mt-0.5">
                  {option.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
