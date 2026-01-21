/**
 * NPCList Component
 *
 * Displays the list of compiled NPCs with:
 * - Streaming content during compilation
 * - NPC cards with refine/confirm actions
 * - Progress tracking
 * - Confirm all and proceed actions
 * Fantasy-themed styling consistent with other content panels.
 */

import { useCallback, useMemo } from 'react';
import type { NPC } from '@dagger-app/shared-types';
import { NPCCard } from './NPCCard';

// =============================================================================
// Props
// =============================================================================

export interface NPCListProps {
  /** List of compiled NPCs */
  npcs: NPC[];
  /** Callback when user wants to refine an NPC */
  onRefine: (npcId: string) => void;
  /** Callback when user confirms an NPC */
  onConfirm: (npcId: string) => void;
  /** Callback when user confirms all NPCs */
  onConfirmAll: () => void;
  /** Callback when user proceeds to next phase */
  onProceed: () => void;
  /** Set of confirmed NPC IDs */
  confirmedNPCIds?: Set<string>;
  /** Whether NPCs are being compiled */
  isLoading?: boolean;
  /** Streaming content during compilation */
  streamingContent?: string | null;
  /** NPC currently being refined */
  refiningNPCId?: string | null;
  /** Error message if compilation failed */
  error?: string | null;
  /** Callback for retry on error */
  onRetry?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function NPCList({
  npcs,
  onRefine,
  onConfirm,
  onConfirmAll,
  onProceed,
  confirmedNPCIds = new Set(),
  isLoading = false,
  streamingContent = null,
  refiningNPCId = null,
  error = null,
  onRetry,
  className = '',
}: NPCListProps) {
  const handleRefine = useCallback(
    (npcId: string) => {
      onRefine(npcId);
    },
    [onRefine]
  );

  const handleConfirm = useCallback(
    (npcId: string) => {
      onConfirm(npcId);
    },
    [onConfirm]
  );

  const confirmedCount = useMemo(() => {
    return npcs.filter((n) => confirmedNPCIds.has(n.id)).length;
  }, [npcs, confirmedNPCIds]);

  const allConfirmed = confirmedCount === npcs.length && npcs.length > 0;
  const npcCount = npcs.length;

  // Error state
  if (error) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <NPCListHeader npcCount={0} confirmedCount={0} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-blood-600 dark:text-blood-400 font-medium mb-4">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-4 py-2 text-sm bg-gold-500 hover:bg-gold-400 text-ink-900 rounded-fantasy transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading/streaming state
  if (isLoading) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <NPCListHeader npcCount={npcCount} confirmedCount={confirmedCount} isLoading />
        <div className="flex-1 overflow-y-auto p-4">
          <div role="status" className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 border-3 border-gold-300 border-t-gold-600 rounded-full animate-spin" />
            <span className="text-ink-600 dark:text-parchment-400">
              {streamingContent ? 'Compiling NPCs...' : 'Compiling NPCs from scenes...'}
            </span>
          </div>
          {streamingContent && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-ink-700 dark:text-parchment-300 whitespace-pre-wrap">
                {streamingContent}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Empty state
  if (npcCount === 0) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <NPCListHeader npcCount={0} confirmedCount={0} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-ink-500 dark:text-parchment-500 mb-2">No NPCs compiled yet.</p>
            <p className="text-sm text-ink-400 dark:text-parchment-600">
              NPCs will be extracted from your confirmed scenes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <NPCListHeader npcCount={npcCount} confirmedCount={confirmedCount} />

      {/* NPC List */}
      <div className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-4" role="list">
          {npcs.map((npc) => (
            <li key={npc.id} role="listitem">
              <NPCCard
                npc={npc}
                onRefine={handleRefine}
                onConfirm={handleConfirm}
                isConfirmed={confirmedNPCIds.has(npc.id)}
                isLoading={refiningNPCId === npc.id}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Footer with actions */}
      <div className="p-4 border-t border-ink-200 dark:border-shadow-600 bg-parchment-100 dark:bg-shadow-800">
        {allConfirmed ? (
          <button
            type="button"
            onClick={onProceed}
            className="
              w-full py-3 px-4 rounded-fantasy border-2
              bg-gold-500 border-gold-600 text-ink-900
              font-serif font-semibold text-base
              hover:bg-gold-400 hover:border-gold-500
              dark:bg-gold-600 dark:border-gold-500 dark:text-ink-900
              dark:hover:bg-gold-500 dark:hover:border-gold-400
              shadow-gold-glow
              transition-all duration-200
            "
          >
            Proceed to Adversaries
          </button>
        ) : (
          <button
            type="button"
            onClick={onConfirmAll}
            disabled={isLoading || allConfirmed}
            className="
              w-full py-3 px-4 rounded-fantasy border-2
              bg-parchment-200 dark:bg-shadow-600
              border-ink-300 dark:border-shadow-500
              text-ink-700 dark:text-parchment-300
              font-serif font-semibold text-base
              hover:bg-gold-100 hover:border-gold-400
              dark:hover:bg-gold-900/30 dark:hover:border-gold-600
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            Confirm All NPCs
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

interface NPCListHeaderProps {
  npcCount: number;
  confirmedCount: number;
  isLoading?: boolean;
}

function NPCListHeader({ npcCount, confirmedCount, isLoading }: NPCListHeaderProps) {
  return (
    <div className="p-4 border-b border-ink-200 dark:border-shadow-600">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-ink-800 dark:text-parchment-100">
            Compiled NPCs
          </h2>
          <p className="text-sm text-ink-500 dark:text-parchment-500">
            {npcCount} NPC{npcCount !== 1 ? 's' : ''} extracted from scenes
          </p>
        </div>
        {!isLoading && npcCount > 0 && (
          <div className="text-right">
            <div className="text-lg font-semibold text-gold-600 dark:text-gold-400">
              {confirmedCount}/{npcCount}
            </div>
            <div className="text-xs text-ink-500 dark:text-parchment-500">confirmed</div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {!isLoading && npcCount > 0 && (
        <div className="mt-3">
          <div className="h-2 bg-parchment-200 dark:bg-shadow-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold-500 dark:bg-gold-600 transition-all duration-300"
              style={{ width: `${(confirmedCount / npcCount) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
