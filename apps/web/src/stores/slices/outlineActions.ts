/**
 * Outline Actions Slice Creator
 *
 * Creates outline-related actions for the content store.
 * Handles outline creation, scene brief updates, and confirmation.
 */

import type { Outline, SceneBrief } from '@dagger-app/shared-types';
import type { SetState, GetState } from './types';
import { timestamp } from '../utils/storeUtils';

export interface OutlineActions {
  setOutline: (outline: Omit<Outline, 'id' | 'isConfirmed' | 'createdAt' | 'updatedAt'>) => void;
  updateOutline: (outline: Outline) => void;
  updateSceneBrief: (sceneId: string, updates: Partial<Omit<SceneBrief, 'id' | 'sceneNumber'>>) => void;
  confirmOutline: () => void;
  clearOutline: () => void;
  setOutlineLoading: (loading: boolean) => void;
  setOutlineError: (error: string | null) => void;
}

/**
 * Creates outline-related actions for the content store.
 */
export function createOutlineActions(set: SetState, get: GetState): OutlineActions {
  return {
    setOutline: (outline: Omit<Outline, 'id' | 'isConfirmed' | 'createdAt' | 'updatedAt'>) => {
      const now = timestamp();
      const fullOutline: Outline = {
        ...outline,
        id: `outline-${Date.now()}`,
        isConfirmed: false,
        createdAt: now,
        updatedAt: now,
        scenes: outline.scenes.map((scene, index) => ({
          ...scene,
          id: scene.id || `scene-${Date.now()}-${index}`,
        })),
      };
      set(
        { currentOutline: fullOutline, outlineConfirmed: false, outlineError: null },
        false,
        'setOutline'
      );
    },

    updateOutline: (outline: Outline) => {
      const updatedOutline: Outline = {
        ...outline,
        updatedAt: timestamp(),
      };
      set({ currentOutline: updatedOutline }, false, 'updateOutline');
    },

    updateSceneBrief: (
      sceneId: string,
      updates: Partial<Omit<SceneBrief, 'id' | 'sceneNumber'>>
    ) => {
      const { currentOutline } = get();
      if (!currentOutline) return;

      const updatedScenes = currentOutline.scenes.map((scene) =>
        scene.id === sceneId ? { ...scene, ...updates } : scene
      );

      const updatedOutline: Outline = {
        ...currentOutline,
        scenes: updatedScenes,
        updatedAt: timestamp(),
      };

      set({ currentOutline: updatedOutline }, false, 'updateSceneBrief');
    },

    confirmOutline: () => {
      const { currentOutline } = get();
      if (currentOutline) {
        const confirmedOutline: Outline = {
          ...currentOutline,
          isConfirmed: true,
          updatedAt: timestamp(),
        };
        set(
          { currentOutline: confirmedOutline, outlineConfirmed: true },
          false,
          'confirmOutline'
        );
      }
    },

    clearOutline: () => {
      set(
        { currentOutline: null, outlineConfirmed: false, outlineError: null },
        false,
        'clearOutline'
      );
    },

    setOutlineLoading: (loading: boolean) => {
      set({ outlineLoading: loading }, false, 'setOutlineLoading');
    },

    setOutlineError: (error: string | null) => {
      set({ outlineError: error, outlineLoading: false }, false, 'setOutlineError');
    },
  };
}
