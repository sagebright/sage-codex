/**
 * PillarBalanceSelect Component
 *
 * A priority ranking UI for the three TTRPG pillars: Combat, Exploration, Social.
 * Uses drag-and-drop reordering with @dnd-kit for intuitive priority management.
 * Fantasy-themed with gold accent for primary pillar.
 */

import { useId, useCallback, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Pillar, PillarBalance } from '@dagger-app/shared-types';
import { reorderPillars, arrayToBalance, balanceToArray } from './pillar-utils';

export interface PillarBalanceSelectProps {
  /** Current pillar balance configuration */
  value: PillarBalance;
  /** Callback when balance changes */
  onChange: (balance: PillarBalance) => void;
  /** Optional label */
  label?: string;
  /** Whether the control is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/** Pillar display metadata */
const PILLAR_INFO: Record<Pillar, { label: string; description: string }> = {
  combat: { label: 'Combat', description: 'Tactical encounters and battles' },
  exploration: { label: 'Exploration', description: 'Discovery and investigation' },
  social: { label: 'Social', description: 'Roleplay and negotiation' },
};

/** Position labels */
const POSITION_LABELS = ['1st', '2nd', '3rd'] as const;

interface SortablePillarItemProps {
  pillar: Pillar;
  index: number;
  disabled: boolean;
  isDragging: boolean;
}

/** Individual sortable pillar item */
function SortablePillarItem({
  pillar,
  index,
  disabled,
  isDragging,
}: SortablePillarItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isItemDragging,
  } = useSortable({
    id: pillar,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const info = PILLAR_INFO[pillar];
  const isPrimary = index === 0;

  return (
    <li ref={setNodeRef} style={style} className="flex-1">
      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={disabled}
        aria-label={`${info.label} - ${POSITION_LABELS[index]} priority. Drag to reorder.`}
        aria-describedby={isDragging ? 'dnd-instructions' : undefined}
        className={`
          w-full flex flex-col items-center px-3 py-3 rounded-lg border-2 transition-all
          focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2
          focus:ring-offset-parchment-100 dark:focus:ring-offset-shadow-900
          ${isItemDragging ? 'opacity-50 scale-105 z-10' : ''}
          ${
            isPrimary
              ? 'bg-gold-100 border-gold-500 text-ink-900 dark:bg-gold-600/20 dark:border-gold-500 dark:text-parchment-100'
              : 'bg-parchment-50 border-ink-300 text-ink-700 hover:bg-gold-50 hover:border-gold-300 dark:bg-shadow-800 dark:border-shadow-600 dark:text-parchment-300 dark:hover:border-shadow-500 dark:hover:bg-shadow-700'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
        `}
      >
        <span className="text-xs text-ink-500 dark:text-parchment-400 mb-1">
          {POSITION_LABELS[index]}
        </span>
        <span className="font-medium">{info.label}</span>
      </button>
    </li>
  );
}

/** Drag overlay component shown while dragging */
function DragOverlayItem({ pillar, index }: { pillar: Pillar; index: number }) {
  const info = PILLAR_INFO[pillar];
  const isPrimary = index === 0;

  return (
    <div
      className={`
        flex flex-col items-center px-3 py-3 rounded-lg border-2 shadow-lg
        ${
          isPrimary
            ? 'bg-gold-100 border-gold-500 text-ink-900'
            : 'bg-parchment-50 border-ink-300 text-ink-700'
        }
      `}
    >
      <span className="text-xs text-ink-500 mb-1">
        {POSITION_LABELS[index]}
      </span>
      <span className="font-medium">{info.label}</span>
    </div>
  );
}

export function PillarBalanceSelect({
  value,
  onChange,
  label,
  disabled = false,
  className = '',
}: PillarBalanceSelectProps) {
  const groupId = useId();
  const labelId = `${groupId}-label`;
  const instructionsId = `${groupId}-instructions`;

  const [activeId, setActiveId] = useState<Pillar | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const pillarsArray = balanceToArray(value);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = event.active.id as Pillar;
    setActiveId(id);
    setActiveIndex(pillarsArray.indexOf(id));
  }, [pillarsArray]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = pillarsArray.indexOf(active.id as Pillar);
      const newIndex = pillarsArray.indexOf(over.id as Pillar);

      const newPillars = reorderPillars(pillarsArray, oldIndex, newIndex);
      const newBalance = arrayToBalance(newPillars);

      onChange(newBalance);
    },
    [pillarsArray, onChange]
  );

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {label && (
        <span id={labelId} className="text-sm font-medium text-ink-700 dark:text-parchment-200">
          {label}
        </span>
      )}

      {/* Priority slots header */}
      <div className="flex gap-2 text-xs text-ink-500 dark:text-parchment-400 px-1">
        <span className="flex-1 text-center">1st</span>
        <span className="flex-1 text-center">2nd</span>
        <span className="flex-1 text-center">3rd</span>
      </div>

      {/* Screen reader instructions for keyboard users */}
      <div id={instructionsId} className="sr-only">
        Press Space or Enter to start dragging. Use arrow keys to move. Press Space or Enter again to drop.
      </div>

      {/* Drag overlay announcement for screen readers */}
      {activeId && (
        <div id="dnd-instructions" className="sr-only" role="status" aria-live="polite">
          Dragging {PILLAR_INFO[activeId].label}. Use arrow keys to reorder.
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={pillarsArray} strategy={horizontalListSortingStrategy}>
          {/* Pillar list showing current order */}
          <ol
            role="group"
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={instructionsId}
            className="flex gap-2"
          >
            {pillarsArray.map((pillar, index) => (
              <SortablePillarItem
                key={pillar}
                pillar={pillar}
                index={index}
                disabled={disabled}
                isDragging={activeId !== null}
              />
            ))}
          </ol>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <DragOverlayItem pillar={activeId} index={activeIndex} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <p className="text-xs text-ink-500 dark:text-parchment-500 text-center">
        Drag pillars to reorder priority
      </p>
    </div>
  );
}
