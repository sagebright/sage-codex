/**
 * Scene Actions Slice Creator
 *
 * Creates scene-related actions for the content store.
 * Handles scene initialization, drafts, navigation, and confirmation.
 */

import type { Scene, SceneDraft, SceneStatus } from '@dagger-app/shared-types';
import type { SetState, GetState } from './types';
import { timestamp } from '../utils/storeUtils';

export interface SceneActions {
  initializeScenesFromOutline: () => void;
  setCurrentScene: (sceneId: string) => void;
  setSceneStatus: (sceneId: string, status: SceneStatus) => void;
  setSceneDraft: (sceneId: string, draft: SceneDraft) => void;
  confirmScene: (sceneId: string) => void;
  setSceneLoading: (loading: boolean) => void;
  setSceneError: (error: string | null) => void;
  setSceneStreamingContent: (content: string | null) => void;
  appendSceneStreamingContent: (chunk: string) => void;
  navigateToNextScene: () => void;
  navigateToPreviousScene: () => void;
  clearScenes: () => void;
}

/**
 * Creates scene-related actions for the content store.
 */
export function createSceneActions(set: SetState, get: GetState): SceneActions {
  return {
    initializeScenesFromOutline: () => {
      const { currentOutline } = get();
      if (!currentOutline) return;

      const scenes: Scene[] = currentOutline.scenes.map((brief) => ({
        brief,
        draft: null,
        status: 'pending' as SceneStatus,
      }));

      const firstSceneId = scenes[0]?.brief.id ?? null;

      set(
        {
          scenes,
          currentSceneId: firstSceneId,
          sceneError: null,
          sceneStreamingContent: null,
        },
        false,
        'initializeScenesFromOutline'
      );
    },

    setCurrentScene: (sceneId: string) => {
      set({ currentSceneId: sceneId, sceneError: null }, false, 'setCurrentScene');
    },

    setSceneStatus: (sceneId: string, status: SceneStatus) => {
      const { scenes } = get();
      const updatedScenes = scenes.map((scene) =>
        scene.brief.id === sceneId ? { ...scene, status } : scene
      );
      set({ scenes: updatedScenes }, false, 'setSceneStatus');
    },

    setSceneDraft: (sceneId: string, draft: SceneDraft) => {
      const { scenes } = get();
      const updatedScenes = scenes.map((scene) =>
        scene.brief.id === sceneId
          ? { ...scene, draft, status: 'draft' as SceneStatus }
          : scene
      );
      set(
        { scenes: updatedScenes, sceneLoading: false, sceneStreamingContent: null },
        false,
        'setSceneDraft'
      );
    },

    confirmScene: (sceneId: string) => {
      const { scenes } = get();
      const updatedScenes = scenes.map((scene) =>
        scene.brief.id === sceneId
          ? { ...scene, status: 'confirmed' as SceneStatus, confirmedAt: timestamp() }
          : scene
      );
      set({ scenes: updatedScenes }, false, 'confirmScene');
    },

    setSceneLoading: (loading: boolean) => {
      set({ sceneLoading: loading }, false, 'setSceneLoading');
    },

    setSceneError: (error: string | null) => {
      set({ sceneError: error, sceneLoading: false }, false, 'setSceneError');
    },

    setSceneStreamingContent: (content: string | null) => {
      set({ sceneStreamingContent: content }, false, 'setSceneStreamingContent');
    },

    appendSceneStreamingContent: (chunk: string) => {
      const { sceneStreamingContent } = get();
      set(
        { sceneStreamingContent: (sceneStreamingContent || '') + chunk },
        false,
        'appendSceneStreamingContent'
      );
    },

    navigateToNextScene: () => {
      const { scenes, currentSceneId } = get();
      const currentIndex = scenes.findIndex((s) => s.brief.id === currentSceneId);
      if (currentIndex < scenes.length - 1) {
        const nextScene = scenes[currentIndex + 1];
        set(
          { currentSceneId: nextScene.brief.id, sceneError: null, sceneStreamingContent: null },
          false,
          'navigateToNextScene'
        );
      }
    },

    navigateToPreviousScene: () => {
      const { scenes, currentSceneId } = get();
      const currentIndex = scenes.findIndex((s) => s.brief.id === currentSceneId);
      if (currentIndex > 0) {
        const prevScene = scenes[currentIndex - 1];
        set(
          { currentSceneId: prevScene.brief.id, sceneError: null, sceneStreamingContent: null },
          false,
          'navigateToPreviousScene'
        );
      }
    },

    clearScenes: () => {
      set(
        {
          scenes: [],
          currentSceneId: null,
          sceneLoading: false,
          sceneError: null,
          sceneStreamingContent: null,
        },
        false,
        'clearScenes'
      );
    },
  };
}
