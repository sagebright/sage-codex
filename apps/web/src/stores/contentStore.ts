/**
 * Content Store - Frame, Outline, Scene, NPC, Adversary, Item, and Echo state
 *
 * Manages content generation state for Phase 3+ including:
 * - Frame selection/creation
 * - Outline generation with feedback loop
 * - Scene drafts and confirmation
 * - NPC compilation and enrichment
 * - Adversary selection from Supabase
 * - Item/reward selection
 * - Echo (GM tool) generation
 *
 * Actions are organized into slice creators by domain for maintainability.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createSetStorage } from './utils/setStorage';
import {
  createFrameActions,
  createOutlineActions,
  createSceneActions,
  createNPCActions,
  createAdversaryActions,
  createItemActions,
  createEchoActions,
  type FrameActions,
  type OutlineActions,
  type SceneActions,
  type NPCActions,
  type AdversaryActions,
  type ItemActions,
  type EchoActions,
  type ContentStateData,
} from './slices';

// Re-export all selectors for backward compatibility
export * from './selectors';

// Re-export ContentStateData for external use
export type { ContentStateData } from './slices';

// =============================================================================
// Types
// =============================================================================

/** Reset action */
export interface ResetAction {
  resetContent: () => void;
}

/** Full content store state with all actions */
export type ContentState = ContentStateData &
  FrameActions &
  OutlineActions &
  SceneActions &
  NPCActions &
  AdversaryActions &
  ItemActions &
  EchoActions &
  ResetAction;

// =============================================================================
// Initial State
// =============================================================================

const initialContentState: ContentStateData = {
  // Frame state
  availableFrames: [],
  selectedFrame: null,
  frameConfirmed: false,
  framesLoading: false,
  framesError: null,

  // Outline state
  currentOutline: null,
  outlineLoading: false,
  outlineError: null,
  outlineConfirmed: false,

  // Scene state
  scenes: [],
  currentSceneId: null,
  sceneLoading: false,
  sceneError: null,
  sceneStreamingContent: null,

  // NPC state
  npcs: [],
  confirmedNPCIds: new Set<string>(),
  npcLoading: false,
  npcError: null,
  npcStreamingContent: null,
  refiningNPCId: null,

  // Adversary state
  availableAdversaries: [],
  selectedAdversaries: [],
  confirmedAdversaryIds: new Set<string>(),
  adversaryLoading: false,
  adversaryError: null,
  availableAdversaryTypes: [],
  adversaryFilters: {},

  // Item state
  availableItems: [],
  selectedItems: [],
  confirmedItemIds: new Set<string>(),
  itemLoading: false,
  itemError: null,
  availableItemCategories: [],
  itemFilters: {},

  // Echo state
  echoes: [],
  confirmedEchoIds: new Set<string>(),
  echoLoading: false,
  echoError: null,
  echoStreamingContent: null,
  activeEchoCategory: 'complications',
};

// =============================================================================
// Store
// =============================================================================

export const useContentStore = create<ContentState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialContentState,

        // Compose all slice actions
        ...createFrameActions(set, get),
        ...createOutlineActions(set, get),
        ...createSceneActions(set, get),
        ...createNPCActions(set, get),
        ...createAdversaryActions(set, get),
        ...createItemActions(set, get),
        ...createEchoActions(set, get),

        // Reset action
        resetContent: () => {
          set(initialContentState, false, 'resetContent');
        },
      }),
      {
        name: 'dagger-content-storage',
        partialize: (state) => ({
          selectedFrame: state.selectedFrame,
          frameConfirmed: state.frameConfirmed,
          currentOutline: state.currentOutline,
          outlineConfirmed: state.outlineConfirmed,
          scenes: state.scenes,
          currentSceneId: state.currentSceneId,
          npcs: state.npcs,
          confirmedNPCIds: Array.from(state.confirmedNPCIds),
          selectedAdversaries: state.selectedAdversaries,
          confirmedAdversaryIds: Array.from(state.confirmedAdversaryIds),
          adversaryFilters: state.adversaryFilters,
          selectedItems: state.selectedItems,
          confirmedItemIds: Array.from(state.confirmedItemIds),
          itemFilters: state.itemFilters,
          echoes: state.echoes,
          confirmedEchoIds: Array.from(state.confirmedEchoIds),
          activeEchoCategory: state.activeEchoCategory,
        }),
        storage: createSetStorage([
          'confirmedNPCIds',
          'confirmedAdversaryIds',
          'confirmedItemIds',
          'confirmedEchoIds',
        ]),
      }
    ),
    { name: 'ContentStore' }
  )
);
