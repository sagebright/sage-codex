/**
 * FrameEditor Component
 *
 * Displays the custom frame creation interface with chat integration.
 * Shows the current frame draft and allows refinement through conversation.
 * Fantasy-themed styling.
 */

import { useState } from 'react';
import type { FrameDraft } from '@dagger-app/shared-types';
import { useContentStore } from '../../stores/contentStore';

export interface FrameEditorProps {
  /** Current frame draft being created (may be partial) */
  frameDraft?: Partial<Omit<FrameDraft, 'id' | 'isCustom'>>;
  /** Whether draft generation is in progress */
  isGenerating: boolean;
  /** Callback when user wants to confirm the draft */
  onConfirmDraft: () => void;
  /** Callback when user wants to go back to frame selection */
  onBack: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function FrameEditor({
  frameDraft,
  isGenerating,
  onConfirmDraft,
  onBack,
  className = '',
}: FrameEditorProps) {
  const [showPreview, setShowPreview] = useState(true);
  const setCustomFrameDraft = useContentStore((state) => state.setCustomFrameDraft);

  // Check if draft is complete enough to confirm
  const isDraftComplete =
    frameDraft?.name &&
    frameDraft?.description &&
    frameDraft?.themes &&
    frameDraft.themes.length > 0;

  const handleConfirm = () => {
    if (isDraftComplete && frameDraft) {
      // Save to store with full structure
      setCustomFrameDraft({
        name: frameDraft.name!,
        description: frameDraft.description!,
        themes: frameDraft.themes!,
        typicalAdversaries: frameDraft.typicalAdversaries ?? [],
        lore: frameDraft.lore ?? '',
      });
      onConfirmDraft();
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-ink-200 dark:border-shadow-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-ink-800 dark:text-parchment-100">
              Create Custom Frame
            </h2>
            <p className="mt-1 text-sm text-ink-600 dark:text-parchment-400">
              Describe your adventure framework in the chat
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="
              px-3 py-1.5 text-sm
              text-ink-600 hover:text-ink-800
              dark:text-parchment-400 dark:hover:text-parchment-200
              underline transition-colors
            "
          >
            ← Back to selection
          </button>
        </div>
      </div>

      {/* Preview toggle */}
      <div className="px-4 pt-4">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          aria-expanded={showPreview}
          className="
            flex items-center gap-2 text-sm font-medium
            text-ink-600 dark:text-parchment-400
            hover:text-ink-800 dark:hover:text-parchment-200
            transition-colors
          "
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${showPreview ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Frame Preview
        </button>
      </div>

      {/* Frame preview */}
      {showPreview && (
        <div className="flex-1 overflow-y-auto p-4">
          {!frameDraft || Object.keys(frameDraft).length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-block p-4 rounded-full bg-parchment-100 dark:bg-shadow-800 mb-4">
                <svg
                  className="w-8 h-8 text-ink-400 dark:text-parchment-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <p className="text-ink-500 dark:text-parchment-500 mb-2">
                No frame draft yet
              </p>
              <p className="text-sm text-ink-400 dark:text-parchment-600">
                Describe your adventure setting in the chat to generate a custom frame
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Frame card preview */}
              <div className="p-4 rounded-fantasy border-2 border-gold-400 dark:border-gold-600 bg-gold-50 dark:bg-gold-900/20">
                {/* Name */}
                <div className="mb-3">
                  <label className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-parchment-500">
                    Name
                  </label>
                  <h3 className="font-serif font-semibold text-lg text-ink-900 dark:text-parchment-100">
                    {frameDraft.name || (
                      <span className="text-ink-400 dark:text-parchment-600 italic">
                        Generating...
                      </span>
                    )}
                  </h3>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-parchment-500">
                    Description
                  </label>
                  <p className="text-sm text-ink-700 dark:text-parchment-300">
                    {frameDraft.description || (
                      <span className="text-ink-400 dark:text-parchment-600 italic">
                        Waiting for description...
                      </span>
                    )}
                  </p>
                </div>

                {/* Themes */}
                <div className="mb-3">
                  <label className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-parchment-500">
                    Themes
                  </label>
                  {frameDraft.themes && frameDraft.themes.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {frameDraft.themes.map((theme, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 text-xs bg-ink-100 text-ink-700 rounded dark:bg-shadow-700 dark:text-parchment-300"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-ink-400 dark:text-parchment-600 italic">
                      No themes yet
                    </p>
                  )}
                </div>

                {/* Typical Adversaries */}
                {frameDraft.typicalAdversaries && frameDraft.typicalAdversaries.length > 0 && (
                  <div className="mb-3">
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-parchment-500">
                      Typical Adversaries
                    </label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {frameDraft.typicalAdversaries.map((adversary, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 text-xs bg-blood-100 text-blood-700 rounded dark:bg-blood-900/40 dark:text-blood-300"
                        >
                          {adversary}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lore */}
                {frameDraft.lore && (
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-parchment-500">
                      Lore
                    </label>
                    <p className="text-sm text-ink-600 dark:text-parchment-400 italic">
                      {frameDraft.lore}
                    </p>
                  </div>
                )}

                {/* Generating indicator */}
                {isGenerating && (
                  <div className="mt-4 pt-3 border-t border-gold-300 dark:border-gold-700 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gold-400 border-t-gold-600 rounded-full animate-spin" />
                    <span className="text-sm text-gold-700 dark:text-gold-400">
                      Generating frame...
                    </span>
                  </div>
                )}
              </div>

              {/* Hint text */}
              <p className="text-xs text-ink-500 dark:text-parchment-500 text-center">
                Continue chatting to refine the frame or click Confirm when ready
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-ink-200 dark:border-shadow-600 bg-parchment-100 dark:bg-shadow-800">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!isDraftComplete || isGenerating}
          className={`
            w-full py-3 px-4 rounded-fantasy border-2
            font-serif font-semibold text-base
            transition-all duration-200
            ${
              isDraftComplete && !isGenerating
                ? 'bg-gold-500 border-gold-600 text-ink-900 hover:bg-gold-400 hover:border-gold-500 dark:bg-gold-600 dark:border-gold-500 dark:hover:bg-gold-500 dark:hover:border-gold-400 shadow-gold-glow'
                : 'bg-ink-100 border-ink-300 text-ink-400 cursor-not-allowed dark:bg-shadow-700 dark:border-shadow-600 dark:text-parchment-600'
            }
          `}
        >
          {isGenerating ? 'Generating...' : isDraftComplete ? 'Confirm Custom Frame' : 'Complete the frame details'}
        </button>
      </div>
    </div>
  );
}
