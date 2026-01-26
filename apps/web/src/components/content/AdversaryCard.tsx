/**
 * AdversaryCard Component
 *
 * Displays individual adversary stat block including:
 * - Name, tier, type
 * - Combat stats: HP, Stress, Difficulty, Attack, Damage, Range
 * - Description, Motives/Tactics, Features
 * - Selection checkbox with quantity stepper
 * - Confirm action
 * Fantasy-themed styling consistent with other content components.
 */

import { useState, useCallback } from 'react';
import type { DaggerheartAdversary } from '@dagger-app/shared-types';

// =============================================================================
// Props
// =============================================================================

export interface AdversaryCardProps {
  /** The adversary to display */
  adversary: DaggerheartAdversary;
  /** Whether the adversary is selected */
  isSelected?: boolean;
  /** Current quantity if selected */
  quantity?: number;
  /** Whether the adversary is confirmed */
  isConfirmed?: boolean;
  /** Callback when selection is toggled */
  onToggleSelect: (adversaryId: string) => void;
  /** Callback when quantity changes */
  onQuantityChange?: (adversaryId: string, quantity: number) => void;
  /** Callback when adversary is confirmed */
  onConfirm?: (adversaryId: string) => void;
  /** Whether to show expanded details by default */
  defaultExpanded?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Tier Styling Helpers
// =============================================================================

const tierStyles: Record<number, { bg: string; text: string; border: string }> = {
  1: {
    bg: 'bg-green-100 dark:bg-green-900/40',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-300 dark:border-green-700',
  },
  2: {
    bg: 'bg-gold-100 dark:bg-gold-900/40',
    text: 'text-gold-700 dark:text-gold-400',
    border: 'border-gold-300 dark:border-gold-700',
  },
  3: {
    bg: 'bg-orange-100 dark:bg-orange-900/40',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-300 dark:border-orange-700',
  },
  4: {
    bg: 'bg-blood-100 dark:bg-blood-900/40',
    text: 'text-blood-700 dark:text-blood-400',
    border: 'border-blood-300 dark:border-blood-700',
  },
};

const typeStyles: Record<string, { bg: string; text: string; border: string }> = {
  beast: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-300 dark:border-green-700',
  },
  humanoid: {
    bg: 'bg-parchment-200 dark:bg-shadow-600',
    text: 'text-ink-600 dark:text-parchment-400',
    border: 'border-parchment-400 dark:border-shadow-500',
  },
  undead: {
    bg: 'bg-shadow-200 dark:bg-shadow-700',
    text: 'text-shadow-700 dark:text-shadow-300',
    border: 'border-shadow-400 dark:border-shadow-500',
  },
  construct: {
    bg: 'bg-ink-200 dark:bg-ink-800',
    text: 'text-ink-600 dark:text-ink-400',
    border: 'border-ink-400 dark:border-ink-600',
  },
  elemental: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-300 dark:border-orange-700',
  },
  fiend: {
    bg: 'bg-blood-100 dark:bg-blood-900/30',
    text: 'text-blood-700 dark:text-blood-400',
    border: 'border-blood-300 dark:border-blood-700',
  },
  celestial: {
    bg: 'bg-gold-100 dark:bg-gold-900/30',
    text: 'text-gold-700 dark:text-gold-400',
    border: 'border-gold-300 dark:border-gold-700',
  },
  aberration: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-300 dark:border-purple-700',
  },
  default: {
    bg: 'bg-ink-100 dark:bg-shadow-700',
    text: 'text-ink-500 dark:text-parchment-500',
    border: 'border-ink-300 dark:border-shadow-500',
  },
};

function getTypeStyle(type: string) {
  const normalizedType = type.toLowerCase();
  return typeStyles[normalizedType] || typeStyles.default;
}

// =============================================================================
// Component
// =============================================================================

export function AdversaryCard({
  adversary,
  isSelected = false,
  quantity = 1,
  isConfirmed = false,
  onToggleSelect,
  onQuantityChange,
  onConfirm,
  defaultExpanded = false,
  className = '',
}: AdversaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleToggleSelect = useCallback(() => {
    onToggleSelect(adversary.name);
  }, [adversary.name, onToggleSelect]);

  const handleQuantityIncrease = useCallback(() => {
    if (onQuantityChange && quantity < 10) {
      onQuantityChange(adversary.name, quantity + 1);
    }
  }, [adversary.name, onQuantityChange, quantity]);

  const handleQuantityDecrease = useCallback(() => {
    if (onQuantityChange && quantity > 1) {
      onQuantityChange(adversary.name, quantity - 1);
    }
  }, [adversary.name, onQuantityChange, quantity]);

  const handleConfirm = useCallback(() => {
    if (onConfirm) {
      onConfirm(adversary.name);
    }
  }, [adversary.name, onConfirm]);

  const tierStyle = tierStyles[adversary.tier] || tierStyles[1];
  const typeStyle = getTypeStyle(adversary.type);
  const hasExpandableContent =
    (adversary.motives_tactics && adversary.motives_tactics.length > 0) ||
    (adversary.features && adversary.features.length > 0);

  return (
    <article
      className={`
        bg-parchment-50 dark:bg-shadow-800
        border border-ink-200 dark:border-shadow-600
        rounded-fantasy overflow-hidden
        transition-all duration-200
        motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-gold-glow-subtle
        ${isSelected ? 'ring-2 ring-gold-400 dark:ring-gold-500 motion-safe:animate-selection-glow' : ''}
        ${isConfirmed ? 'border-2 border-gold-400 dark:border-gold-500 shadow-gold-glow-subtle' : ''}
        ${className}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-ink-200 dark:border-shadow-600">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {/* Selection checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleToggleSelect}
                className="
                  w-4 h-4 rounded
                  border-ink-300 dark:border-shadow-500
                  text-gold-500
                  dark:bg-shadow-700
                  focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2
                  focus:ring-offset-parchment-100 dark:focus:ring-offset-shadow-900
                "
                aria-label={`Select ${adversary.name}`}
              />
              <h3 className="text-lg font-serif font-bold text-ink-800 dark:text-parchment-100 truncate">
                {adversary.name}
              </h3>
              <span
                className={`rounded-lg border-2 px-3 py-1 text-xs font-medium ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}
              >
                T{adversary.tier}
              </span>
              <span
                className={`rounded-lg border-2 px-3 py-1 text-xs font-medium capitalize ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}
              >
                {adversary.type}
              </span>
            </div>
            <p className="text-sm text-ink-600 dark:text-parchment-400 line-clamp-2">
              {adversary.description}
            </p>
          </div>
          {isConfirmed && (
            <span className="px-2 py-1 text-xs font-medium bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-400 rounded-full shrink-0">
              Confirmed
            </span>
          )}
        </div>
      </div>

      {/* Combat Stats Bar */}
      <div className="px-4 py-2 bg-parchment-100/50 dark:bg-shadow-700/50 border-b border-ink-100 dark:border-shadow-700">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-blood-600 dark:text-blood-400">HP</span>
            <span className="text-ink-700 dark:text-parchment-300">{adversary.hp}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-purple-600 dark:text-purple-400">Stress</span>
            <span className="text-ink-700 dark:text-parchment-300">{adversary.stress}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gold-600 dark:text-gold-400">Diff</span>
            <span className="text-ink-700 dark:text-parchment-300">{adversary.difficulty}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-ink-500 dark:text-parchment-500">Atk</span>
            <span className="text-ink-700 dark:text-parchment-300">{adversary.atk}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-orange-600 dark:text-orange-400">Dmg</span>
            <span className="text-ink-700 dark:text-parchment-300">{adversary.dmg}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-ink-500 dark:text-parchment-500">Range</span>
            <span className="text-ink-700 dark:text-parchment-300">{adversary.range}</span>
          </div>
        </div>
      </div>

      {/* Weapon */}
      {adversary.weapon && (
        <div className="px-4 py-2 border-b border-ink-100 dark:border-shadow-700">
          <span className="text-xs font-semibold text-ink-500 dark:text-parchment-500">Weapon: </span>
          <span className="text-xs text-ink-700 dark:text-parchment-300">{adversary.weapon}</span>
        </div>
      )}

      {/* Expandable details */}
      {isExpanded && hasExpandableContent && (
        <div className="p-4 space-y-3 border-b border-ink-100 dark:border-shadow-700">
          {/* Motives & Tactics */}
          {adversary.motives_tactics && adversary.motives_tactics.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-ink-500 dark:text-parchment-500 uppercase tracking-wide mb-1">
                Motives & Tactics
              </h4>
              <ul className="list-disc list-inside text-sm text-ink-700 dark:text-parchment-300 space-y-0.5">
                {adversary.motives_tactics.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Features */}
          {adversary.features && adversary.features.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-ink-500 dark:text-parchment-500 uppercase tracking-wide mb-1">
                Features
              </h4>
              <ul className="list-disc list-inside text-sm text-ink-700 dark:text-parchment-300 space-y-0.5">
                {adversary.features.map((feature, i) => (
                  <li key={i}>
                    {typeof feature === 'object' && feature !== null
                      ? JSON.stringify(feature)
                      : String(feature)}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* Show more/less toggle */}
      {hasExpandableContent && (
        <div className="px-4 py-2 border-b border-ink-100 dark:border-shadow-700">
          <button
            type="button"
            onClick={handleToggleExpand}
            className="
              text-xs text-gold-600 dark:text-gold-400
              hover:text-gold-500 dark:hover:text-gold-300 font-medium
              focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-1
              focus:ring-offset-parchment-100 dark:focus:ring-offset-shadow-800
              rounded
            "
            aria-label={isExpanded ? 'Show less details' : 'Show more details'}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      )}

      {/* Selection actions */}
      {isSelected && !isConfirmed && (
        <div className="p-3 border-t border-ink-200 dark:border-shadow-600 bg-parchment-100 dark:bg-shadow-800">
          <div className="flex items-center justify-between gap-3">
            {/* Quantity stepper */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-ink-600 dark:text-parchment-400">Qty:</span>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={handleQuantityDecrease}
                  disabled={quantity <= 1}
                  className="
                    w-6 h-6 flex items-center justify-center
                    bg-parchment-200 dark:bg-shadow-600
                    text-ink-700 dark:text-parchment-300
                    border border-ink-300 dark:border-shadow-500
                    rounded-l
                    hover:bg-gold-100 dark:hover:bg-gold-900/30
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                    focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-1
                    focus:ring-offset-parchment-100 dark:focus:ring-offset-shadow-800
                  "
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span
                  className="
                    w-8 h-6 flex items-center justify-center
                    bg-white dark:bg-shadow-700
                    text-sm font-medium text-ink-800 dark:text-parchment-200
                    border-y border-ink-300 dark:border-shadow-500
                  "
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleQuantityIncrease}
                  disabled={quantity >= 10}
                  className="
                    w-6 h-6 flex items-center justify-center
                    bg-parchment-200 dark:bg-shadow-600
                    text-ink-700 dark:text-parchment-300
                    border border-ink-300 dark:border-shadow-500
                    rounded-r
                    hover:bg-gold-100 dark:hover:bg-gold-900/30
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                    focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-1
                    focus:ring-offset-parchment-100 dark:focus:ring-offset-shadow-800
                  "
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Confirm button */}
            {onConfirm && (
              <button
                type="button"
                onClick={handleConfirm}
                className="
                  py-1.5 px-4 text-sm font-medium
                  bg-gold-500 border-gold-600 text-ink-900
                  rounded-fantasy
                  hover:bg-gold-400 hover:border-gold-500
                  dark:bg-gold-600 dark:border-gold-500 dark:text-ink-900
                  dark:hover:bg-gold-500 dark:hover:border-gold-400
                  transition-colors
                  focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2
                  focus:ring-offset-parchment-100 dark:focus:ring-offset-shadow-800
                "
                aria-label="Confirm adversary selection"
              >
                Confirm
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
