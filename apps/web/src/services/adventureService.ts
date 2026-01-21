/**
 * Adventure Service
 *
 * Frontend service layer for Supabase sync via MCP Bridge API.
 * Provides debounced auto-save and all adventure persistence operations.
 */

import JSZip from 'jszip';
import { debounce, type DebouncedFunction } from '../utils/debounce';
import {
  generateReadme,
  generateFrameMarkdown,
  generateOutlineMarkdown,
  generateSceneMarkdown,
  generateNPCsMarkdown,
  generateAdversariesMarkdown,
  generateItemsMarkdown,
  generateEchoesMarkdown,
} from './markdownGenerators';
import type {
  Phase,
  ConcreteDials,
  ConceptualDials,
  WebAdventure,
  SelectedFrame,
  Outline,
  Scene,
  CompiledNPC,
  SelectedAdversary,
  SelectedItem,
  Echo,
} from '@dagger-app/shared-types';

// =============================================================================
// Types
// =============================================================================

/**
 * Dial values extracted from dialsStore
 */
export interface DialsSnapshot extends ConcreteDials, ConceptualDials {}

/**
 * Full snapshot of frontend state for persistence
 *
 * This is the comprehensive state object sent to the backend for saving.
 */
export interface FullSnapshot {
  // Adventure state
  sessionId: string;
  adventureName: string;
  currentPhase: Phase;
  phaseHistory: Phase[];

  // Dial values
  dials: DialsSnapshot;
  confirmedDials: string[];

  // Content state
  selectedFrame: SelectedFrame | null;
  frameConfirmed: boolean;
  currentOutline: Outline | null;
  outlineConfirmed: boolean;
  scenes: Scene[];
  currentSceneId: string | null;
  npcs: CompiledNPC[];
  confirmedNPCIds: string[];
  selectedAdversaries: SelectedAdversary[];
  confirmedAdversaryIds: string[];
  selectedItems: SelectedItem[];
  confirmedItemIds: string[];
  echoes: Echo[];
  confirmedEchoIds: string[];
}

/**
 * Save response from API
 */
export interface SaveResponse {
  success: boolean;
  sessionId?: string;
  updatedAt?: string;
  error?: string;
}

/**
 * Session metadata for recovery modal
 */
export interface SessionMetadata {
  sessionId: string;
  adventureName: string;
  currentPhase: Phase;
  updatedAt: string;
  sceneCount: number;
  npcCount: number;
}

/**
 * Check session response
 */
export interface CheckSessionResponse {
  exists: boolean;
  metadata?: SessionMetadata;
  error?: string;
}

/**
 * Load adventure response
 */
export interface LoadResponse {
  exists: boolean;
  adventure?: WebAdventure;
  error?: string;
}

/**
 * Delete response
 */
export interface DeleteResponse {
  success: boolean;
  error?: string;
}

/**
 * Export data structure
 */
export interface ExportData {
  adventureName: string;
  frame?: Record<string, unknown>;
  outline?: Record<string, unknown>;
  scenes?: Array<Record<string, unknown>>;
  npcs?: Array<Record<string, unknown>>;
  adversaries?: Array<Record<string, unknown>>;
  items?: Array<Record<string, unknown>>;
  echoes?: Array<Record<string, unknown>>;
}

/**
 * Export response
 */
export interface ExportResponse {
  blob: Blob;
  filename: string;
  error?: string;
}

// =============================================================================
// API Functions (Non-debounced)
// =============================================================================

/**
 * Save adventure state to API
 */
export async function saveAdventure(snapshot: FullSnapshot): Promise<SaveResponse> {
  try {
    const response = await fetch('/api/adventure/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      sessionId: data.sessionId,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if a session exists and get metadata for recovery modal
 */
export async function checkSession(sessionId: string): Promise<CheckSessionResponse> {
  try {
    const response = await fetch(`/api/adventure/${sessionId}/metadata`);
    const data = await response.json();

    if (!response.ok) {
      return {
        exists: false,
        error: data.message || `HTTP ${response.status}`,
      };
    }

    return {
      exists: data.exists,
      metadata: data.metadata,
    };
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Load full adventure state from API
 */
export async function loadAdventure(sessionId: string): Promise<LoadResponse> {
  try {
    const response = await fetch(`/api/adventure/${sessionId}`);
    const data = await response.json();

    if (!response.ok) {
      return {
        exists: false,
        error: data.message || `HTTP ${response.status}`,
      };
    }

    return {
      exists: data.exists,
      adventure: data.adventure,
    };
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete adventure from API
 */
export async function deleteAdventure(sessionId: string): Promise<DeleteResponse> {
  try {
    const response = await fetch(`/api/adventure/${sessionId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Export adventure as zip file
 */
export async function exportAdventure(
  sessionId: string,
  data: ExportData
): Promise<ExportResponse> {
  const zip = new JSZip();

  // Add adventure files to zip
  const adventureName = data.adventureName || 'adventure';
  const safeName = adventureName.replace(/[^a-zA-Z0-9]/g, '_');

  // README.md with adventure summary
  zip.file(`${safeName}/README.md`, generateReadme(data));

  // Frame file
  if (data.frame) {
    zip.file(`${safeName}/frame.md`, generateFrameMarkdown(data.frame));
  }

  // Outline file
  if (data.outline) {
    zip.file(`${safeName}/outline.md`, generateOutlineMarkdown(data.outline));
  }

  // Scenes folder
  if (data.scenes && data.scenes.length > 0) {
    data.scenes.forEach((scene, index) => {
      const sceneNum = String(index + 1).padStart(2, '0');
      zip.file(`${safeName}/scenes/scene_${sceneNum}.md`, generateSceneMarkdown(scene, index + 1));
    });
  }

  // NPCs file
  if (data.npcs && data.npcs.length > 0) {
    zip.file(`${safeName}/npcs.md`, generateNPCsMarkdown(data.npcs));
  }

  // Adversaries file
  if (data.adversaries && data.adversaries.length > 0) {
    zip.file(`${safeName}/adversaries.md`, generateAdversariesMarkdown(data.adversaries));
  }

  // Items file
  if (data.items && data.items.length > 0) {
    zip.file(`${safeName}/items.md`, generateItemsMarkdown(data.items));
  }

  // Echoes file
  if (data.echoes && data.echoes.length > 0) {
    zip.file(`${safeName}/echoes.md`, generateEchoesMarkdown(data.echoes));
  }

  // Generate zip blob
  const blob = await zip.generateAsync({ type: 'blob' });

  // Mark as exported in API
  try {
    await fetch(`/api/adventure/${sessionId}/export`, {
      method: 'POST',
    });
  } catch {
    // Non-fatal - continue with download even if marking fails
    console.warn('Failed to mark adventure as exported');
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${safeName}_${timestamp}.zip`;

  return {
    blob,
    filename,
  };
}

// =============================================================================
// Debounced Service (Singleton)
// =============================================================================

const DEBOUNCE_DELAY_MS = 2500;

let lastSnapshot: FullSnapshot | null = null;

/**
 * Internal save function that captures the last snapshot
 */
async function performSave(): Promise<void> {
  if (lastSnapshot) {
    const snapshot = lastSnapshot;
    lastSnapshot = null;
    await saveAdventure(snapshot);
  }
}

const debouncedSave: DebouncedFunction<typeof performSave> = debounce(
  performSave,
  DEBOUNCE_DELAY_MS
);

/**
 * Adventure service with debounced save
 */
export const adventureService = {
  /**
   * Queue a save operation (debounced - 2.5s delay)
   */
  queueSave: (snapshot: FullSnapshot): void => {
    lastSnapshot = snapshot;
    debouncedSave();
  },

  /**
   * Cancel any pending save
   */
  cancel: (): void => {
    lastSnapshot = null;
    debouncedSave.cancel();
  },

  /**
   * Immediately execute any pending save
   */
  flush: (): void => {
    debouncedSave.flush();
  },

  /**
   * Check if a save is pending
   */
  pending: (): boolean => {
    return debouncedSave.pending();
  },
};
