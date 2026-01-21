/**
 * NumberStepper Component
 *
 * @deprecated This component is deprecated in favor of PartySizeSelect and SceneCountSelect
 * which provide inline option buttons for single-click selection. This component may be
 * removed in a future version. See issue #47 for migration details.
 *
 * A stepper control with +/- buttons for numeric values.
 * Used for party_size and scene_count dials.
 * Fantasy-themed with gold accents.
 */

import { useId } from 'react';

export interface NumberStepperProps {
  /** Current value */
  value: number;
  /** Minimum allowed value */
  min: number;
  /** Maximum allowed value */
  max: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Optional label */
  label?: string;
  /** Whether the control is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function NumberStepper({
  value,
  min,
  max,
  onChange,
  label,
  disabled = false,
  className = '',
}: NumberStepperProps) {
  const labelId = useId();

  const canDecrement = value > min && !disabled;
  const canIncrement = value < max && !disabled;

  const handleDecrement = () => {
    if (canDecrement) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (canIncrement) {
      onChange(value + 1);
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          id={labelId}
          className="text-sm font-medium text-ink-700 dark:text-parchment-300"
        >
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={!canDecrement}
          aria-label="Decrease value"
          className={`
            w-10 h-10 rounded-fantasy border flex items-center justify-center
            transition-all duration-200
            ${
              canDecrement
                ? 'bg-parchment-50 border-ink-300 text-ink-700 hover:bg-gold-100 hover:border-gold-400 dark:bg-shadow-800 dark:border-shadow-500 dark:text-parchment-200 dark:hover:bg-gold-900/30 dark:hover:border-gold-600'
                : 'bg-ink-100 border-ink-200 text-ink-400 cursor-not-allowed dark:bg-shadow-700 dark:border-shadow-600 dark:text-shadow-500'
            }
          `}
        >
          <span className="text-xl font-bold" aria-hidden="true">
            −
          </span>
        </button>

        <div
          role="spinbutton"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-labelledby={label ? labelId : undefined}
          className="
            w-14 h-10 flex items-center justify-center
            bg-parchment-50 border border-ink-300 rounded-fantasy
            font-serif font-semibold text-xl text-ink-900
            dark:bg-shadow-800 dark:border-shadow-500 dark:text-parchment-100
          "
        >
          <span aria-labelledby={label ? labelId : undefined}>{value}</span>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={!canIncrement}
          aria-label="Increase value"
          className={`
            w-10 h-10 rounded-fantasy border flex items-center justify-center
            transition-all duration-200
            ${
              canIncrement
                ? 'bg-parchment-50 border-ink-300 text-ink-700 hover:bg-gold-100 hover:border-gold-400 dark:bg-shadow-800 dark:border-shadow-500 dark:text-parchment-200 dark:hover:bg-gold-900/30 dark:hover:border-gold-600'
                : 'bg-ink-100 border-ink-200 text-ink-400 cursor-not-allowed dark:bg-shadow-700 dark:border-shadow-600 dark:text-shadow-500'
            }
          `}
        >
          <span className="text-xl font-bold" aria-hidden="true">
            +
          </span>
        </button>
      </div>
    </div>
  );
}
