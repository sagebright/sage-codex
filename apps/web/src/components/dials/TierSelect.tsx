/**
 * TierSelect Component
 *
 * A button group for selecting party tier (1-4) with descriptions.
 * Fantasy-themed with gold accent for selected tier.
 */

import type { PartyTier } from '@dagger-app/shared-types';

export interface TierSelectProps {
  /** Current selected tier */
  value: PartyTier;
  /** Callback when tier changes */
  onChange: (tier: PartyTier) => void;
  /** Optional label */
  label?: string;
  /** Whether the control is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/** Tier metadata with descriptions */
const TIER_INFO: Record<PartyTier, { label: string; description: string }> = {
  1: { label: 'Tier 1', description: 'Beginner' },
  2: { label: 'Tier 2', description: 'Experienced' },
  3: { label: 'Tier 3', description: 'Veteran' },
  4: { label: 'Tier 4', description: 'Legendary' },
};

const TIERS: PartyTier[] = [1, 2, 3, 4];

export function TierSelect({
  value,
  onChange,
  label,
  disabled = false,
  className = '',
}: TierSelectProps) {
  const handleSelect = (tier: PartyTier) => {
    if (tier !== value && !disabled) {
      onChange(tier);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-ink-700 dark:text-parchment-300">
          {label}
        </label>
      )}
      <div role="group" aria-label="Party Tier Selection" className="flex gap-2">
        {TIERS.map((tier) => {
          const info = TIER_INFO[tier];
          const isSelected = tier === value;

          return (
            <button
              key={tier}
              type="button"
              onClick={() => handleSelect(tier)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={`
                flex-1 flex flex-col items-center justify-center py-2 px-3
                rounded-fantasy border transition-all duration-200
                ${
                  isSelected
                    ? 'bg-gold-100 border-gold-400 text-ink-900 shadow-gold-glow dark:bg-gold-900/40 dark:border-gold-500 dark:text-parchment-100'
                    : disabled
                      ? 'bg-ink-100 border-ink-200 text-ink-400 cursor-not-allowed dark:bg-shadow-700 dark:border-shadow-600 dark:text-shadow-400'
                      : 'bg-parchment-50 border-ink-300 text-ink-700 hover:bg-gold-50 hover:border-gold-300 dark:bg-shadow-800 dark:border-shadow-500 dark:text-parchment-200 dark:hover:bg-gold-900/20 dark:hover:border-gold-600'
                }
              `}
            >
              <span className="font-serif font-semibold">{info.label}</span>
              <span className="text-xs text-ink-500 dark:text-parchment-400">
                {info.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
