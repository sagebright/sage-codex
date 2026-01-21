/**
 * Slice Creator Types
 *
 * Common types for Zustand slice creators with devtools middleware support.
 * This file defines the state shape and set/get function types used by all slices.
 */

import type {
  DaggerheartFrame,
  SelectedFrame,
  Outline,
  Scene,
  CompiledNPC,
  DaggerheartAdversary,
  SelectedAdversary,
  AdversaryFilterOptions,
  UnifiedItem,
  SelectedItem,
  ItemFilterOptions,
  ItemCategory,
  Echo,
  EchoCategory,
} from '@dagger-app/shared-types';

/**
 * Content store state (without actions).
 * This is the data shape shared by all slice creators.
 */
export interface ContentStateData {
  // Frame state
  availableFrames: DaggerheartFrame[];
  selectedFrame: SelectedFrame | null;
  frameConfirmed: boolean;
  framesLoading: boolean;
  framesError: string | null;

  // Outline state
  currentOutline: Outline | null;
  outlineLoading: boolean;
  outlineError: string | null;
  outlineConfirmed: boolean;

  // Scene state
  scenes: Scene[];
  currentSceneId: string | null;
  sceneLoading: boolean;
  sceneError: string | null;
  sceneStreamingContent: string | null;

  // NPC state
  npcs: CompiledNPC[];
  confirmedNPCIds: Set<string>;
  npcLoading: boolean;
  npcError: string | null;
  npcStreamingContent: string | null;
  refiningNPCId: string | null;

  // Adversary state
  availableAdversaries: DaggerheartAdversary[];
  selectedAdversaries: SelectedAdversary[];
  confirmedAdversaryIds: Set<string>;
  adversaryLoading: boolean;
  adversaryError: string | null;
  availableAdversaryTypes: string[];
  adversaryFilters: AdversaryFilterOptions;

  // Item state
  availableItems: UnifiedItem[];
  selectedItems: SelectedItem[];
  confirmedItemIds: Set<string>;
  itemLoading: boolean;
  itemError: string | null;
  availableItemCategories: ItemCategory[];
  itemFilters: ItemFilterOptions;

  // Echo state
  echoes: Echo[];
  confirmedEchoIds: Set<string>;
  echoLoading: boolean;
  echoError: string | null;
  echoStreamingContent: string | null;
  activeEchoCategory: EchoCategory;
}

/**
 * SetState function type that includes devtools action name.
 * When using devtools middleware, set() accepts a third argument for the action name.
 * The replace parameter is typed as `false | undefined` to match Zustand's devtools signature.
 */
export type SetState = (
  partial: Partial<ContentStateData> | ((state: ContentStateData) => Partial<ContentStateData>),
  replace?: false,
  actionName?: string
) => void;

/**
 * GetState function type for accessing current store state.
 */
export type GetState = () => ContentStateData;
