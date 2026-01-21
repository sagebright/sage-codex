/**
 * SessionRecoveryModal Component
 *
 * Modal that appears on app load when a previous session exists
 * in localStorage. Allows users to resume or start fresh.
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { checkSession, type SessionMetadata } from '../../services/adventureService';

// =============================================================================
// Types
// =============================================================================

export interface SessionRecoveryModalProps {
  sessionId: string;
  onResume: () => void;
  onStartFresh: () => void;
}

type ModalState =
  | { status: 'loading' }
  | { status: 'ready'; metadata: SessionMetadata }
  | { status: 'error'; message: string };

// =============================================================================
// Helpers
// =============================================================================

/**
 * Format phase name for display
 */
function formatPhase(phase: string): string {
  const phaseLabels: Record<string, string> = {
    setup: 'Setup',
    'dial-tuning': 'Dial Tuning',
    frame: 'Frame Selection',
    outline: 'Outline',
    scenes: 'Scene Writing',
    npcs: 'NPC Compilation',
    adversaries: 'Adversaries',
    items: 'Items & Rewards',
    echoes: 'Echoes',
    complete: 'Complete',
  };
  return phaseLabels[phase] || phase;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'just now';
  }
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// =============================================================================
// Component
// =============================================================================

export function SessionRecoveryModal({
  sessionId,
  onResume,
  onStartFresh,
}: SessionRecoveryModalProps) {
  const [state, setState] = useState<ModalState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function checkExistingSession() {
      const response = await checkSession(sessionId);

      if (cancelled) return;

      if (response.error) {
        setState({ status: 'error', message: response.error });
        return;
      }

      if (!response.exists || !response.metadata) {
        // Session doesn't exist in Supabase - start fresh
        onStartFresh();
        return;
      }

      setState({ status: 'ready', metadata: response.metadata });
    }

    checkExistingSession();

    return () => {
      cancelled = true;
    };
  }, [sessionId, onStartFresh]);

  // Render loading state
  if (state.status === 'loading') {
    return createPortal(
      <div
        role="dialog"
        aria-labelledby="recovery-modal-title"
        aria-describedby="recovery-modal-desc"
        className="fixed inset-0 bg-shadow-950/70 z-50 flex items-center justify-center animate-in fade-in duration-200"
      >
        <div className="bg-parchment-50 dark:bg-shadow-800 rounded-fantasy shadow-fantasy p-8 max-w-md w-full mx-4 text-center">
          {/* Loading spinner */}
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 border-4 border-gold-200 border-t-gold-500 rounded-full animate-spin" />
          </div>
          <p
            id="recovery-modal-desc"
            className="text-ink-600 dark:text-parchment-400"
          >
            Checking for previous session...
          </p>
        </div>
      </div>,
      document.body
    );
  }

  // Render error state
  if (state.status === 'error') {
    return createPortal(
      <div
        role="dialog"
        aria-labelledby="recovery-modal-title"
        aria-describedby="recovery-modal-error"
        className="fixed inset-0 bg-shadow-950/70 z-50 flex items-center justify-center animate-in fade-in duration-200"
      >
        <div className="bg-parchment-50 dark:bg-shadow-800 rounded-fantasy shadow-fantasy p-8 max-w-md w-full mx-4">
          <h2
            id="recovery-modal-title"
            className="font-serif text-xl font-bold text-ink-800 dark:text-parchment-100 mb-4"
          >
            Session Recovery Error
          </h2>
          <p
            id="recovery-modal-error"
            className="text-blood-600 dark:text-blood-400 mb-6"
          >
            {state.message}
          </p>
          <button
            onClick={onStartFresh}
            className="
              w-full py-3 px-4 rounded-fantasy border
              bg-parchment-100 dark:bg-shadow-700
              border-ink-300 dark:border-shadow-500
              text-ink-700 dark:text-parchment-200
              font-semibold
              hover:bg-parchment-200 dark:hover:bg-shadow-600
              transition-all duration-200
            "
          >
            Start Fresh
          </button>
        </div>
      </div>,
      document.body
    );
  }

  // Render ready state with session metadata
  const { metadata } = state;

  return createPortal(
    <div
      role="dialog"
      aria-labelledby="recovery-modal-title"
      aria-describedby="recovery-modal-desc"
      className="fixed inset-0 bg-shadow-950/70 z-50 flex items-center justify-center animate-in fade-in duration-200"
    >
      <div className="bg-parchment-50 dark:bg-shadow-800 rounded-fantasy shadow-fantasy p-8 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <h2
          id="recovery-modal-title"
          role="heading"
          className="font-serif text-xl font-bold text-ink-800 dark:text-parchment-100 mb-2"
        >
          Previous Session Found
        </h2>
        <p
          id="recovery-modal-desc"
          className="text-ink-600 dark:text-parchment-400 text-sm mb-6"
        >
          Would you like to continue where you left off?
        </p>

        {/* Session details card */}
        <div className="bg-parchment-100 dark:bg-shadow-700 rounded-fantasy p-4 mb-6 border border-ink-200 dark:border-shadow-600">
          {/* Adventure name */}
          <h3 className="font-serif text-lg font-semibold text-ink-800 dark:text-parchment-100 mb-3">
            {metadata.adventureName}
          </h3>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-ink-500 dark:text-parchment-500">Phase:</span>
              <span className="ml-2 text-ink-700 dark:text-parchment-300">
                {formatPhase(metadata.currentPhase)}
              </span>
            </div>
            <div>
              <span className="text-ink-500 dark:text-parchment-500">Scenes:</span>
              <span className="ml-2 text-ink-700 dark:text-parchment-300">
                {metadata.sceneCount} scene{metadata.sceneCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div>
              <span className="text-ink-500 dark:text-parchment-500">NPCs:</span>
              <span className="ml-2 text-ink-700 dark:text-parchment-300">
                {metadata.npcCount} NPC{metadata.npcCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div>
              <span className="text-ink-500 dark:text-parchment-500">Last saved:</span>
              <span className="ml-2 text-ink-700 dark:text-parchment-300">
                {formatDate(metadata.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {/* Primary: Resume */}
          <button
            onClick={onResume}
            className="
              w-full py-3 px-4 rounded-fantasy border-2
              bg-gold-500 border-gold-600 text-ink-900
              font-serif font-semibold text-base
              hover:bg-gold-400 hover:border-gold-500
              dark:bg-gold-600 dark:border-gold-500
              dark:hover:bg-gold-500 dark:hover:border-gold-400
              shadow-gold-glow
              transition-all duration-200
            "
          >
            Resume Adventure
          </button>

          {/* Secondary: Start Fresh */}
          <button
            onClick={onStartFresh}
            className="
              w-full py-3 px-4 rounded-fantasy border
              bg-parchment-100 dark:bg-shadow-700
              border-ink-300 dark:border-shadow-500
              text-ink-700 dark:text-parchment-200
              font-semibold
              hover:bg-parchment-200 dark:hover:bg-shadow-600
              transition-all duration-200
            "
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
