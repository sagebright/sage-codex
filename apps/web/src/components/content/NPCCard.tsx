/**
 * NPCCard Component
 *
 * Displays individual NPC details including:
 * - Name, role, description
 * - Appearance and personality
 * - Motivations and connections
 * - Scene appearances
 * - Refine and confirm actions
 * Fantasy-themed styling consistent with other content components.
 */

import { useState, useCallback } from 'react';
import type { NPC } from '@dagger-app/shared-types';

// =============================================================================
// Props
// =============================================================================

export interface NPCCardProps {
  /** The NPC to display */
  npc: NPC;
  /** Callback when user wants to refine the NPC */
  onRefine: (npcId: string) => void;
  /** Callback when user confirms the NPC */
  onConfirm: (npcId: string) => void;
  /** Whether this NPC is confirmed */
  isConfirmed?: boolean;
  /** Whether the NPC is being refined */
  isLoading?: boolean;
  /** Whether to show expanded details by default */
  defaultExpanded?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Role Styling Helpers
// =============================================================================

const roleStyles: Record<NPC['role'], { bg: string; text: string; border: string }> = {
  ally: {
    bg: 'bg-gold-100 dark:bg-gold-900/40',
    text: 'text-gold-700 dark:text-gold-400',
    border: 'border-gold-300 dark:border-gold-700',
  },
  neutral: {
    bg: 'bg-parchment-100 dark:bg-shadow-700',
    text: 'text-ink-600 dark:text-parchment-400',
    border: 'border-ink-200 dark:border-shadow-600',
  },
  'quest-giver': {
    bg: 'bg-gold-100 dark:bg-gold-900/40',
    text: 'text-gold-700 dark:text-gold-400',
    border: 'border-gold-300 dark:border-gold-700',
  },
  antagonist: {
    bg: 'bg-blood-100 dark:bg-blood-900/40',
    text: 'text-blood-700 dark:text-blood-400',
    border: 'border-blood-300 dark:border-blood-700',
  },
  bystander: {
    bg: 'bg-ink-100 dark:bg-shadow-700',
    text: 'text-ink-500 dark:text-parchment-500',
    border: 'border-ink-200 dark:border-shadow-600',
  },
};

// =============================================================================
// Component
// =============================================================================

export function NPCCard({
  npc,
  onRefine,
  onConfirm,
  isConfirmed = false,
  isLoading = false,
  defaultExpanded = false,
  className = '',
}: NPCCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleRefine = useCallback(() => {
    onRefine(npc.id);
  }, [npc.id, onRefine]);

  const handleConfirm = useCallback(() => {
    onConfirm(npc.id);
  }, [npc.id, onConfirm]);

  const roleStyle = roleStyles[npc.role];
  const sceneCount = npc.sceneAppearances.length;

  return (
    <article
      className={`
        bg-parchment-50 dark:bg-shadow-800
        border border-ink-200 dark:border-shadow-600
        rounded-fantasy overflow-hidden
        ${isConfirmed ? 'border-gold-400 dark:border-gold-600' : ''}
        ${className}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-ink-200 dark:border-shadow-600">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-lg font-serif font-bold text-ink-800 dark:text-parchment-100 truncate">
                {npc.name}
              </h3>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${roleStyle.bg} ${roleStyle.text}`}
              >
                {npc.role}
              </span>
            </div>
            <p className="text-sm text-ink-600 dark:text-parchment-400">{npc.description}</p>
          </div>
          {isConfirmed && (
            <span className="px-2 py-1 text-xs font-medium bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-400 rounded-full shrink-0">
              Confirmed
            </span>
          )}
        </div>
      </div>

      {/* Scene count */}
      <div className="px-4 py-2 bg-parchment-100/50 dark:bg-shadow-700/50 border-b border-ink-100 dark:border-shadow-700">
        <span className="text-xs text-ink-500 dark:text-parchment-500">
          Appears in {sceneCount} scene{sceneCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Expandable details */}
      <div className="p-4 space-y-3">
        {/* Appearance - always visible */}
        {npc.appearance && (
          <section>
            <h4 className="text-xs font-semibold text-ink-500 dark:text-parchment-500 uppercase tracking-wide mb-1">
              Appearance
            </h4>
            <p className="text-sm text-ink-700 dark:text-parchment-300">{npc.appearance}</p>
          </section>
        )}

        {/* Personality - always visible */}
        {npc.personality && (
          <section>
            <h4 className="text-xs font-semibold text-ink-500 dark:text-parchment-500 uppercase tracking-wide mb-1">
              Personality
            </h4>
            <p className="text-sm text-ink-700 dark:text-parchment-300">{npc.personality}</p>
          </section>
        )}

        {/* Expandable sections */}
        {isExpanded && (
          <>
            {/* Motivations */}
            {npc.motivations.length > 0 && (
              <section>
                <h4 className="text-xs font-semibold text-ink-500 dark:text-parchment-500 uppercase tracking-wide mb-1">
                  Motivations
                </h4>
                <ul className="list-disc list-inside text-sm text-ink-700 dark:text-parchment-300 space-y-0.5">
                  {npc.motivations.map((motivation, i) => (
                    <li key={i}>{motivation}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Connections */}
            {npc.connections.length > 0 && (
              <section>
                <h4 className="text-xs font-semibold text-ink-500 dark:text-parchment-500 uppercase tracking-wide mb-1">
                  Connections
                </h4>
                <ul className="list-disc list-inside text-sm text-ink-700 dark:text-parchment-300 space-y-0.5">
                  {npc.connections.map((connection, i) => (
                    <li key={i}>{connection}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        {/* Show more/less toggle */}
        {(npc.motivations.length > 0 || npc.connections.length > 0) && (
          <button
            type="button"
            onClick={handleToggleExpand}
            className="text-xs text-gold-600 dark:text-gold-400 hover:text-gold-500 dark:hover:text-gold-300 font-medium"
            aria-label={isExpanded ? 'Show less details' : 'Show more details'}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="px-4 py-2 bg-gold-50 dark:bg-gold-900/20 border-t border-gold-200 dark:border-gold-800">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gold-300 border-t-gold-600 rounded-full animate-spin" />
            <span className="text-sm text-gold-700 dark:text-gold-400">Refining...</span>
          </div>
        </div>
      )}

      {/* Footer with actions */}
      {!isConfirmed && !isLoading && (
        <div className="p-3 border-t border-ink-200 dark:border-shadow-600 bg-parchment-100 dark:bg-shadow-800 flex gap-2">
          <button
            type="button"
            onClick={handleRefine}
            disabled={isLoading}
            className="
              flex-1 py-2 px-3 text-sm font-medium
              bg-parchment-200 dark:bg-shadow-600
              text-ink-700 dark:text-parchment-300
              border border-ink-300 dark:border-shadow-500
              rounded-fantasy
              hover:bg-gold-100 hover:border-gold-400
              dark:hover:bg-gold-900/30 dark:hover:border-gold-600
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
            aria-label="Refine NPC"
          >
            Refine
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="
              flex-1 py-2 px-3 text-sm font-medium
              bg-gold-500 border-gold-600 text-ink-900
              rounded-fantasy
              hover:bg-gold-400 hover:border-gold-500
              dark:bg-gold-600 dark:border-gold-500 dark:text-ink-900
              dark:hover:bg-gold-500 dark:hover:border-gold-400
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
            aria-label="Confirm NPC"
          >
            Confirm
          </button>
        </div>
      )}
    </article>
  );
}
