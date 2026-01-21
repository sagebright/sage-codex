/**
 * NPC Actions Slice Creator
 *
 * Creates NPC-related actions for the content store.
 * Handles NPC compilation, updates, confirmation, and streaming.
 */

import type { CompiledNPC } from '@dagger-app/shared-types';
import type { SetState, GetState } from './types';
import { timestamp, addToSet, confirmAllItems } from '../utils/storeUtils';

export interface NPCActions {
  setNPCs: (npcs: CompiledNPC[]) => void;
  addNPC: (npc: CompiledNPC) => void;
  updateNPC: (npcId: string, updates: Partial<CompiledNPC>) => void;
  confirmNPC: (npcId: string) => void;
  confirmAllNPCs: () => void;
  setNPCLoading: (loading: boolean) => void;
  setNPCError: (error: string | null) => void;
  setNPCStreamingContent: (content: string | null) => void;
  appendNPCStreamingContent: (chunk: string) => void;
  setRefiningNPCId: (npcId: string | null) => void;
  clearNPCs: () => void;
}

/**
 * Creates NPC-related actions for the content store.
 */
export function createNPCActions(set: SetState, get: GetState): NPCActions {
  return {
    setNPCs: (npcs: CompiledNPC[]) => {
      set({ npcs, npcError: null }, false, 'setNPCs');
    },

    addNPC: (npc: CompiledNPC) => {
      const { npcs } = get();
      set({ npcs: [...npcs, npc] }, false, 'addNPC');
    },

    updateNPC: (npcId: string, updates: Partial<CompiledNPC>) => {
      const { npcs } = get();
      const updatedNPCs = npcs.map((npc) =>
        npc.id === npcId ? { ...npc, ...updates, updatedAt: timestamp() } : npc
      );
      set({ npcs: updatedNPCs }, false, 'updateNPC');
    },

    confirmNPC: (npcId: string) => {
      const { npcs, confirmedNPCIds } = get();
      const updatedNPCs = npcs.map((npc) =>
        npc.id === npcId ? { ...npc, isConfirmed: true, updatedAt: timestamp() } : npc
      );
      set(
        { npcs: updatedNPCs, confirmedNPCIds: addToSet(confirmedNPCIds, npcId) },
        false,
        'confirmNPC'
      );
    },

    confirmAllNPCs: () => {
      const { npcs } = get();
      const { updatedItems, allIds } = confirmAllItems(npcs, (npc) => npc.id);
      set({ npcs: updatedItems, confirmedNPCIds: allIds }, false, 'confirmAllNPCs');
    },

    setNPCLoading: (loading: boolean) => {
      set({ npcLoading: loading }, false, 'setNPCLoading');
    },

    setNPCError: (error: string | null) => {
      set({ npcError: error, npcLoading: false }, false, 'setNPCError');
    },

    setNPCStreamingContent: (content: string | null) => {
      set({ npcStreamingContent: content }, false, 'setNPCStreamingContent');
    },

    appendNPCStreamingContent: (chunk: string) => {
      const { npcStreamingContent } = get();
      set(
        { npcStreamingContent: (npcStreamingContent || '') + chunk },
        false,
        'appendNPCStreamingContent'
      );
    },

    setRefiningNPCId: (npcId: string | null) => {
      set({ refiningNPCId: npcId }, false, 'setRefiningNPCId');
    },

    clearNPCs: () => {
      set(
        {
          npcs: [],
          confirmedNPCIds: new Set<string>(),
          npcLoading: false,
          npcError: null,
          npcStreamingContent: null,
          refiningNPCId: null,
        },
        false,
        'clearNPCs'
      );
    },
  };
}
