/**
 * StepBasics Component
 *
 * Step 1 of the custom frame wizard.
 * Collects Title and Concept with character limits and validation.
 * Includes Advanced Options for Complexity Rating and Touchstones.
 * Fantasy-themed styling.
 */

import { useState, useId } from 'react';
import { AdvancedOptionsDisclosure } from '../AdvancedOptionsDisclosure';

/** Maximum character limits */
const TITLE_MAX_LENGTH = 50;
const CONCEPT_MAX_LENGTH = 150;
const TOUCHSTONE_MAX_LENGTH = 100;

/** Complexity rating descriptions */
const COMPLEXITY_DESCRIPTIONS: Record<number, string> = {
  1: 'Simple - Few modifications to core rules',
  2: 'Moderate - Some new mechanics or restrictions',
  3: 'Complex - Multiple custom systems',
  4: 'Advanced - Significant rule changes',
};

export interface StepBasicsProps {
  /** Current title value */
  title: string;
  /** Current concept value */
  concept: string;
  /** Complexity rating (1-4) */
  complexityRating?: number;
  /** Touchstones (inspirations) */
  touchstones?: string[];
  /** Callback when title changes */
  onTitleChange: (value: string) => void;
  /** Callback when concept changes */
  onConceptChange: (value: string) => void;
  /** Callback when complexity rating changes */
  onComplexityRatingChange?: (value: number | undefined) => void;
  /** Callback when touchstones change */
  onTouchstonesChange?: (value: string[]) => void;
  /** Validation errors */
  errors?: {
    title?: string;
    concept?: string;
  };
  /** Additional CSS classes */
  className?: string;
}

export function StepBasics({
  title,
  concept,
  complexityRating,
  touchstones = [],
  onTitleChange,
  onConceptChange,
  onComplexityRatingChange,
  onTouchstonesChange,
  errors = {},
  className = '',
}: StepBasicsProps) {
  const titleId = useId();
  const conceptId = useId();
  const titleErrorId = useId();
  const conceptErrorId = useId();
  const [newTouchstone, setNewTouchstone] = useState('');

  const handleAddTouchstone = () => {
    const trimmed = newTouchstone.trim();
    if (trimmed && !touchstones.includes(trimmed) && onTouchstonesChange) {
      onTouchstonesChange([...touchstones, trimmed]);
      setNewTouchstone('');
    }
  };

  const handleRemoveTouchstone = (index: number) => {
    if (onTouchstonesChange) {
      onTouchstonesChange(touchstones.filter((_, i) => i !== index));
    }
  };

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Title field */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-baseline">
          <label
            htmlFor={titleId}
            className="text-sm font-medium text-ink-700 dark:text-parchment-300"
          >
            Title <span className="text-blood" aria-hidden="true">*</span>
          </label>
          <span className="text-xs text-ink-500 dark:text-parchment-500">
            {title.length} / {TITLE_MAX_LENGTH}
          </span>
        </div>
        <input
          id={titleId}
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value.slice(0, TITLE_MAX_LENGTH))}
          placeholder="Enter a compelling title for your frame"
          aria-describedby={errors.title ? titleErrorId : undefined}
          aria-invalid={!!errors.title}
          className={`
            w-full px-4 py-3 rounded-fantasy border
            bg-parchment-50 dark:bg-shadow-800
            text-ink-900 dark:text-parchment-100
            placeholder-ink-400 dark:placeholder-parchment-600
            focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400
            transition-all duration-200
            ${
              errors.title
                ? 'border-blood dark:border-blood-400'
                : 'border-ink-300 dark:border-shadow-500'
            }
          `}
        />
        {errors.title && (
          <p
            id={titleErrorId}
            role="alert"
            className="text-xs text-blood dark:text-blood-400 font-medium"
          >
            {errors.title}
          </p>
        )}
      </div>

      {/* Concept field */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-baseline">
          <label
            htmlFor={conceptId}
            className="text-sm font-medium text-ink-700 dark:text-parchment-300"
          >
            Concept <span className="text-blood" aria-hidden="true">*</span>
          </label>
          <span className="text-xs text-ink-500 dark:text-parchment-500">
            {concept.length} / {CONCEPT_MAX_LENGTH}
          </span>
        </div>
        <input
          id={conceptId}
          type="text"
          value={concept}
          onChange={(e) => onConceptChange(e.target.value.slice(0, CONCEPT_MAX_LENGTH))}
          placeholder="One sentence describing the core idea"
          aria-describedby={errors.concept ? conceptErrorId : undefined}
          aria-invalid={!!errors.concept}
          className={`
            w-full px-4 py-3 rounded-fantasy border
            bg-parchment-50 dark:bg-shadow-800
            text-ink-900 dark:text-parchment-100
            placeholder-ink-400 dark:placeholder-parchment-600
            focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400
            transition-all duration-200
            ${
              errors.concept
                ? 'border-blood dark:border-blood-400'
                : 'border-ink-300 dark:border-shadow-500'
            }
          `}
        />
        {errors.concept && (
          <p
            id={conceptErrorId}
            role="alert"
            className="text-xs text-blood dark:text-blood-400 font-medium"
          >
            {errors.concept}
          </p>
        )}
        <p className="text-xs text-ink-500 dark:text-parchment-500 italic">
          Example: &ldquo;A haunted monastery guards an ancient secret&rdquo;
        </p>
      </div>

      {/* Advanced Options */}
      <AdvancedOptionsDisclosure>
        <div className="flex flex-col gap-6">
          {/* Complexity Rating */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ink-700 dark:text-parchment-300">
              Complexity Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => onComplexityRatingChange?.(complexityRating === rating ? undefined : rating)}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-fantasy border transition-colors duration-200
                    ${complexityRating === rating
                      ? 'bg-gold-500 border-gold-600 text-ink-900'
                      : 'bg-parchment-50 border-ink-300 text-ink-600 hover:bg-parchment-100 dark:bg-shadow-800 dark:border-shadow-500 dark:text-parchment-400 dark:hover:bg-shadow-700'
                    }
                  `}
                >
                  {rating}
                </button>
              ))}
            </div>
            {complexityRating && (
              <p className="text-xs text-ink-500 dark:text-parchment-500">
                {COMPLEXITY_DESCRIPTIONS[complexityRating]}
              </p>
            )}
          </div>

          {/* Touchstones */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ink-700 dark:text-parchment-300">
              Touchstones (Inspirations)
            </label>
            <p className="text-xs text-ink-500 dark:text-parchment-500">
              Add movies, books, games, or other media that inspire this frame
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTouchstone}
                onChange={(e) => setNewTouchstone(e.target.value.slice(0, TOUCHSTONE_MAX_LENGTH))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTouchstone();
                  }
                }}
                placeholder="e.g., Dark Souls, Game of Thrones"
                className="
                  flex-1 px-3 py-2 text-sm rounded-fantasy border
                  bg-parchment-50 dark:bg-shadow-800
                  text-ink-900 dark:text-parchment-100
                  placeholder-ink-400 dark:placeholder-parchment-600
                  border-ink-300 dark:border-shadow-500
                  focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400
                  transition-all duration-200
                "
              />
              <button
                type="button"
                onClick={handleAddTouchstone}
                disabled={!newTouchstone.trim()}
                className="
                  px-3 py-2 text-sm font-medium rounded-fantasy border
                  bg-gold-500 border-gold-600 text-ink-900
                  hover:bg-gold-400 hover:border-gold-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-200
                "
              >
                Add
              </button>
            </div>
            {touchstones.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {touchstones.map((touchstone, index) => (
                  <span
                    key={index}
                    className="
                      inline-flex items-center gap-1 px-2 py-1 text-xs
                      rounded-full bg-parchment-200 dark:bg-shadow-700
                      text-ink-700 dark:text-parchment-300
                    "
                  >
                    {touchstone}
                    <button
                      type="button"
                      onClick={() => handleRemoveTouchstone(index)}
                      className="ml-1 text-ink-500 hover:text-ink-700 dark:text-parchment-500 dark:hover:text-parchment-300"
                      aria-label={`Remove ${touchstone}`}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </AdvancedOptionsDisclosure>
    </div>
  );
}
