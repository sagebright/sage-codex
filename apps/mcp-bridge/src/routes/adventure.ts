/**
 * Adventure routes for MCP Bridge
 *
 * Provides REST endpoints for adventure persistence operations:
 * - POST /adventure/save - Save/update adventure state
 * - GET /adventure/:sessionId - Load full adventure
 * - GET /adventure/:sessionId/metadata - Get metadata for recovery modal
 * - DELETE /adventure/:sessionId - Delete adventure
 * - POST /adventure/:sessionId/export - Generate markdown files and mark as exported
 */

import { Router } from 'express';
import type { Request, Response, Router as RouterType } from 'express';
import type { AdventureSnapshot, ApiError, WebAdventure } from '@dagger-app/shared-types';
import {
  saveAdventure,
  loadAdventure,
  getAdventureMetadata,
  deleteAdventure,
  markExported,
} from '../services/web-adventure-queries.js';
import { generateMarkdownHandler } from '../mcp/tools/generateMarkdown.js';

const router: RouterType = Router();

/**
 * Validate required fields for AdventureSnapshot
 */
function validateSnapshot(body: unknown): body is AdventureSnapshot {
  if (typeof body !== 'object' || body === null) {
    return false;
  }
  const snapshot = body as Record<string, unknown>;
  return (
    typeof snapshot.sessionId === 'string' &&
    snapshot.sessionId.length > 0 &&
    typeof snapshot.adventureName === 'string' &&
    snapshot.adventureName.length > 0 &&
    typeof snapshot.currentPhase === 'string' &&
    Array.isArray(snapshot.phaseHistory)
  );
}

/**
 * POST /adventure/save
 *
 * Save or update adventure state. Uses upsert by session_id.
 */
router.post('/save', async (req: Request, res: Response) => {
  // Validate request body
  if (!validateSnapshot(req.body)) {
    const error: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'Missing required fields: sessionId, adventureName, currentPhase, phaseHistory',
    };
    res.status(400).json(error);
    return;
  }

  const result = await saveAdventure(req.body);

  if (result.error || !result.data) {
    const error: ApiError = {
      code: 'SAVE_FAILED',
      message: result.error ?? 'Failed to save adventure',
    };
    res.status(500).json(error);
    return;
  }

  res.status(200).json({
    success: true,
    sessionId: result.data.sessionId,
    updatedAt: result.data.updatedAt,
  });
});

/**
 * GET /adventure/:sessionId
 *
 * Load full adventure state by session ID.
 */
router.get('/:sessionId', async (req: Request, res: Response) => {
  const sessionId = req.params.sessionId as string;

  const result = await loadAdventure(sessionId);

  if (result.error) {
    const error: ApiError = {
      code: 'LOAD_FAILED',
      message: result.error,
    };
    res.status(500).json(error);
    return;
  }

  if (!result.data) {
    res.status(200).json({
      exists: false,
    });
    return;
  }

  res.status(200).json({
    exists: true,
    adventure: result.data,
  });
});

/**
 * GET /adventure/:sessionId/metadata
 *
 * Get lightweight metadata for recovery modal display.
 */
router.get('/:sessionId/metadata', async (req: Request, res: Response) => {
  const sessionId = req.params.sessionId as string;

  const result = await getAdventureMetadata(sessionId);

  if (result.error) {
    const error: ApiError = {
      code: 'METADATA_FAILED',
      message: result.error,
    };
    res.status(500).json(error);
    return;
  }

  if (!result.data) {
    res.status(200).json({
      exists: false,
    });
    return;
  }

  res.status(200).json(result.data);
});

/**
 * DELETE /adventure/:sessionId
 *
 * Delete adventure (used for "Start Fresh" functionality).
 */
router.delete('/:sessionId', async (req: Request, res: Response) => {
  const sessionId = req.params.sessionId as string;

  const result = await deleteAdventure(sessionId);

  if (!result.success) {
    const error: ApiError = {
      code: 'DELETE_FAILED',
      message: result.error ?? 'Failed to delete adventure',
    };
    res.status(500).json(error);
    return;
  }

  res.status(200).json({
    success: true,
  });
});

/**
 * POST /adventure/:sessionId/export
 *
 * Generate markdown files and mark adventure as exported.
 * Returns generated files as JSON array.
 */
router.post('/:sessionId/export', async (req: Request, res: Response) => {
  const sessionId = req.params.sessionId as string;

  // 1. Load the full adventure
  const loadResult = await loadAdventure(sessionId);

  if (loadResult.error) {
    const error: ApiError = {
      code: 'LOAD_FAILED',
      message: loadResult.error,
    };
    res.status(500).json(error);
    return;
  }

  if (!loadResult.data) {
    const error: ApiError = {
      code: 'NOT_FOUND',
      message: 'Adventure not found',
    };
    res.status(404).json(error);
    return;
  }

  // 2. Generate markdown files via MCP tool
  const markdownResult = await generateMarkdownHandler({
    adventure: loadResult.data as WebAdventure,
  });

  // 3. Mark as exported (non-blocking - continue even if this fails)
  const exportResult = await markExported(sessionId);

  // 4. Return generated files with export metadata
  res.status(200).json({
    success: true,
    files: markdownResult.files,
    adventureName: markdownResult.adventureName,
    generatedAt: markdownResult.generatedAt,
    lastExportedAt: exportResult.data?.lastExportedAt ?? new Date().toISOString(),
    exportCount: exportResult.data?.exportCount ?? 1,
  });
});

export default router;
