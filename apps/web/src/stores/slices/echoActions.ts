/**
 * Echo Actions Slice Creator
 *
 * Creates echo-related actions for the content store.
 * Handles echo generation, updates, confirmation, and streaming.
 */

import type { Echo, EchoCategory } from '@dagger-app/shared-types';
import type { SetState, GetState } from './types';
import { addToSet } from '../utils/storeUtils';

export interface EchoActions {
  setEchoes: (echoes: Echo[]) => void;
  addEcho: (echo: Echo) => void;
  updateEcho: (echoId: string, updates: Partial<Echo>) => void;
  confirmEcho: (echoId: string) => void;
  confirmAllEchoes: () => void;
  setActiveEchoCategory: (category: EchoCategory) => void;
  setEchoLoading: (loading: boolean) => void;
  setEchoError: (error: string | null) => void;
  setEchoStreamingContent: (content: string | null) => void;
  appendEchoStreamingContent: (chunk: string) => void;
  clearEchoes: () => void;
}

/**
 * Creates echo-related actions for the content store.
 */
export function createEchoActions(set: SetState, get: GetState): EchoActions {
  return {
    setEchoes: (echoes: Echo[]) => {
      set({ echoes, echoError: null }, false, 'setEchoes');
    },

    addEcho: (echo: Echo) => {
      const { echoes } = get();
      set({ echoes: [...echoes, echo] }, false, 'addEcho');
    },

    updateEcho: (echoId: string, updates: Partial<Echo>) => {
      const { echoes } = get();
      const updatedEchoes = echoes.map((echo) =>
        echo.id === echoId ? { ...echo, ...updates } : echo
      );
      set({ echoes: updatedEchoes }, false, 'updateEcho');
    },

    confirmEcho: (echoId: string) => {
      const { echoes, confirmedEchoIds } = get();
      const updatedEchoes = echoes.map((echo) =>
        echo.id === echoId ? { ...echo, isConfirmed: true } : echo
      );
      set(
        { echoes: updatedEchoes, confirmedEchoIds: addToSet(confirmedEchoIds, echoId) },
        false,
        'confirmEcho'
      );
    },

    confirmAllEchoes: () => {
      const { echoes } = get();
      const updatedEchoes = echoes.map((echo) => ({ ...echo, isConfirmed: true }));
      const allIds = new Set(echoes.map((e) => e.id));
      set({ echoes: updatedEchoes, confirmedEchoIds: allIds }, false, 'confirmAllEchoes');
    },

    setActiveEchoCategory: (category: EchoCategory) => {
      set({ activeEchoCategory: category }, false, 'setActiveEchoCategory');
    },

    setEchoLoading: (loading: boolean) => {
      set({ echoLoading: loading }, false, 'setEchoLoading');
    },

    setEchoError: (error: string | null) => {
      set({ echoError: error, echoLoading: false }, false, 'setEchoError');
    },

    setEchoStreamingContent: (content: string | null) => {
      set({ echoStreamingContent: content }, false, 'setEchoStreamingContent');
    },

    appendEchoStreamingContent: (chunk: string) => {
      const { echoStreamingContent } = get();
      set(
        { echoStreamingContent: (echoStreamingContent || '') + chunk },
        false,
        'appendEchoStreamingContent'
      );
    },

    clearEchoes: () => {
      set(
        {
          echoes: [],
          confirmedEchoIds: new Set<string>(),
          echoLoading: false,
          echoError: null,
          echoStreamingContent: null,
          activeEchoCategory: 'complications',
        },
        false,
        'clearEchoes'
      );
    },
  };
}
