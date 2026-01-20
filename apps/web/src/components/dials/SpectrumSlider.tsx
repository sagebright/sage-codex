/**
 * SpectrumSlider Component
 *
 * A slider for conceptual dials with endpoint labels.
 * Converts numeric position (0-100) to semantic values.
 * Fantasy-themed with gold accent track.
 */

import { useId, useCallback } from 'react';

export interface SpectrumSliderProps {
  /** Current value (semantic string or null) */
  value: string | null;
  /** Endpoint labels */
  endpoints: { low: string; high: string };
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Optional label */
  label?: string;
  /** Whether the control is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/** Convert semantic value to slider position */
function valueToPosition(value: string | null): number {
  if (value === null) return 50;
  const lower = value.toLowerCase();
  if (lower.includes('low') || lower.includes('combat') || lower.includes('sparse')) return 25;
  if (lower.includes('high') || lower.includes('exploration') || lower.includes('rich')) return 75;
  if (lower.includes('balanced') || lower.includes('middle') || lower.includes('moderate')) return 50;
  return 50;
}

/** Convert slider position to semantic value */
function positionToValue(position: number, endpoints: { low: string; high: string }): string {
  if (position <= 33) {
    return `Leaning ${endpoints.low.toLowerCase()}`;
  }
  if (position >= 67) {
    return `Leaning ${endpoints.high.toLowerCase()}`;
  }
  return 'Balanced/middle';
}

/** Get human-readable description for position */
function getValueText(position: number, endpoints: { low: string; high: string }): string {
  if (position <= 33) return endpoints.low;
  if (position >= 67) return endpoints.high;
  return 'Balanced between extremes';
}

export function SpectrumSlider({
  value,
  endpoints,
  onChange,
  label,
  disabled = false,
  className = '',
}: SpectrumSliderProps) {
  const labelId = useId();
  const position = valueToPosition(value);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const newPosition = parseInt(e.target.value, 10);
      const newValue = positionToValue(newPosition, endpoints);
      onChange(newValue);
    },
    [disabled, endpoints, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      // Let the browser handle arrow keys, but trigger onChange
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        // onChange will be triggered by the native change event
      }
    },
    [disabled]
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label
          id={labelId}
          className="text-sm font-medium text-ink-700 dark:text-parchment-300"
        >
          {label}
        </label>
      )}
      <div className="flex flex-col gap-1">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={position}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-labelledby={label ? labelId : undefined}
          aria-label={!label ? 'Spectrum slider' : undefined}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={position}
          aria-valuetext={getValueText(position, endpoints)}
          className={`
            w-full h-2 rounded-full appearance-none cursor-pointer
            bg-ink-200 dark:bg-shadow-600
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-gold
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-gold-600
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:bg-gold-400
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-gold
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-gold-600
            [&::-moz-range-thumb]:shadow-md
            dark:[&::-webkit-slider-thumb]:bg-gold-400
            dark:[&::-webkit-slider-thumb]:border-gold-500
            dark:[&::-moz-range-thumb]:bg-gold-400
            dark:[&::-moz-range-thumb]:border-gold-500
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:[&::-webkit-slider-thumb]:hover:scale-100
          `}
        />
        <div className="flex justify-between text-xs text-ink-500 dark:text-parchment-400">
          <span>{endpoints.low}</span>
          <span>{endpoints.high}</span>
        </div>
      </div>
    </div>
  );
}
