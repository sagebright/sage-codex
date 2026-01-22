/**
 * StepReview Component
 *
 * Step 4 of the custom frame wizard.
 * Displays all entered data with edit buttons.
 * Fantasy-themed styling.
 */

import type { WizardFormData } from '../CustomFrameWizard';

export interface StepReviewProps {
  /** All form data to display */
  formData: WizardFormData;
  /** Callback to edit Basics step */
  onEditBasics: () => void;
  /** Callback to edit Pitch & Tone step */
  onEditPitchTone: () => void;
  /** Callback to edit Themes step */
  onEditThemes: () => void;
  /** Additional CSS classes */
  className?: string;
}

/** Map tone IDs to display labels */
const TONE_LABELS: Record<string, string> = {
  'grim': 'Grim',
  'mysterious': 'Mysterious',
  'heroic': 'Heroic',
  'whimsical': 'Whimsical',
  'epic': 'Epic',
  'intimate': 'Intimate',
};

/** Complexity rating descriptions */
const COMPLEXITY_LABELS: Record<number, string> = {
  1: 'Simple',
  2: 'Moderate',
  3: 'Complex',
  4: 'Advanced',
};

/** Map theme IDs to display labels */
const THEME_LABELS: Record<string, string> = {
  'redemption': 'Redemption',
  'sacrifice': 'Sacrifice',
  'identity': 'Identity',
  'power-corruption': 'Power & Corruption',
  'found-family': 'Found Family',
  'legacy': 'Legacy',
  'survival': 'Survival',
  'justice': 'Justice',
  'nature-vs-civilization': 'Nature vs Civilization',
  'forbidden-knowledge': 'Forbidden Knowledge',
};

export function StepReview({
  formData,
  onEditBasics,
  onEditPitchTone,
  onEditThemes,
  className = '',
}: StepReviewProps) {
  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <p className="text-sm text-ink-600 dark:text-parchment-400">
        Review your frame details before creating
      </p>

      {/* Basics Section */}
      <section className="rounded-fantasy border border-ink-200 dark:border-shadow-600 p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-ink-700 dark:text-parchment-300">
            Basics
          </h3>
          <button
            type="button"
            onClick={onEditBasics}
            className="text-xs text-gold-600 hover:text-gold-700 dark:text-gold-400 dark:hover:text-gold-300 underline"
          >
            Edit Basics
          </button>
        </div>
        <dl className="flex flex-col gap-3">
          <div>
            <dt className="text-xs text-ink-500 dark:text-parchment-500">Title</dt>
            <dd className="text-base font-serif font-semibold text-ink-800 dark:text-parchment-100">
              {formData.title}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-500 dark:text-parchment-500">Concept</dt>
            <dd className="text-sm text-ink-700 dark:text-parchment-300">
              {formData.concept}
            </dd>
          </div>
        </dl>
      </section>

      {/* Pitch & Tone Section */}
      <section className="rounded-fantasy border border-ink-200 dark:border-shadow-600 p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-ink-700 dark:text-parchment-300">
            Pitch & Tone
          </h3>
          <button
            type="button"
            onClick={onEditPitchTone}
            className="text-xs text-gold-600 hover:text-gold-700 dark:text-gold-400 dark:hover:text-gold-300 underline"
          >
            Edit Pitch & Tone
          </button>
        </div>
        <dl className="flex flex-col gap-3">
          <div>
            <dt className="text-xs text-ink-500 dark:text-parchment-500">Pitch</dt>
            <dd className="text-sm text-ink-700 dark:text-parchment-300">
              {formData.pitch}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-500 dark:text-parchment-500">Tone & Feel</dt>
            <dd className="flex flex-wrap gap-1 mt-1">
              {formData.tones.map((toneId) => (
                <span
                  key={toneId}
                  className="px-2 py-0.5 text-xs rounded-full bg-gold-100 text-gold-800 dark:bg-gold-900/40 dark:text-gold-300"
                >
                  {TONE_LABELS[toneId] || toneId}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </section>

      {/* Themes Section */}
      <section className="rounded-fantasy border border-ink-200 dark:border-shadow-600 p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-ink-700 dark:text-parchment-300">
            Themes
          </h3>
          <button
            type="button"
            onClick={onEditThemes}
            className="text-xs text-gold-600 hover:text-gold-700 dark:text-gold-400 dark:hover:text-gold-300 underline"
          >
            Edit Themes
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {formData.themes.map((themeId) => (
            <span
              key={themeId}
              className="px-2 py-0.5 text-xs rounded-full bg-gold-100 text-gold-800 dark:bg-gold-900/40 dark:text-gold-300"
            >
              {THEME_LABELS[themeId] || themeId}
            </span>
          ))}
        </div>
      </section>

      {/* Advanced Options Section (only show if any advanced options are set) */}
      {(formData.complexityRating || (formData.touchstones && formData.touchstones.length > 0) || formData.overview) && (
        <section className="rounded-fantasy border border-ink-200 dark:border-shadow-600 p-4 bg-parchment-50/50 dark:bg-shadow-800/50">
          <h3 className="text-sm font-semibold text-ink-700 dark:text-parchment-300 mb-3">
            Advanced Options
          </h3>
          <dl className="flex flex-col gap-3">
            {formData.complexityRating && (
              <div>
                <dt className="text-xs text-ink-500 dark:text-parchment-500">Complexity Rating</dt>
                <dd className="text-sm text-ink-700 dark:text-parchment-300">
                  {formData.complexityRating} - {COMPLEXITY_LABELS[formData.complexityRating]}
                </dd>
              </div>
            )}
            {formData.touchstones && formData.touchstones.length > 0 && (
              <div>
                <dt className="text-xs text-ink-500 dark:text-parchment-500">Touchstones</dt>
                <dd className="flex flex-wrap gap-1 mt-1">
                  {formData.touchstones.map((touchstone, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-xs rounded-full bg-parchment-200 dark:bg-shadow-700 text-ink-700 dark:text-parchment-300"
                    >
                      {touchstone}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            {formData.overview && (
              <div>
                <dt className="text-xs text-ink-500 dark:text-parchment-500">Overview</dt>
                <dd className="text-sm text-ink-700 dark:text-parchment-300 line-clamp-3">
                  {formData.overview}
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}
    </div>
  );
}
