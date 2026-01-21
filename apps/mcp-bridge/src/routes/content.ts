/**
 * Content routes for frame selection and generation
 *
 * Handles frame-related endpoints for Phase 3 content generation.
 */

import { Router } from 'express';
import type { Request, Response, Router as RouterType } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type {
  GetFramesResponse,
  GenerateFrameRequest,
  GenerateFrameResponse,
  GenerateOutlineRequest,
  GenerateOutlineResponse,
  DaggerheartFrame,
  DaggerheartAdversary,
  GetAdversariesResponse,
  GetAdversaryTypesResponse,
  GetItemsResponse,
  UnifiedItem,
  ItemCategory,
} from '@dagger-app/shared-types';
import {
  getFrames,
  getFrameByName,
  getAdversaries,
  getAdversaryByName,
  getItems,
  getWeapons,
  getArmor,
  getConsumables,
} from '../services/daggerheart-queries.js';
import { generateFrameHandler } from '../mcp/tools/generateFrame.js';
import { generateOutlineHandler } from '../mcp/tools/generateOutline.js';

const router: RouterType = Router();

// =============================================================================
// Types
// =============================================================================

interface ErrorResponse {
  code: string;
  message: string;
}

// =============================================================================
// Routes
// =============================================================================

/**
 * GET /content/frames
 *
 * Get all available frames from Supabase.
 * Optionally filter by themes.
 */
router.get('/frames', async (req: Request, res: Response) => {
  try {
    const { themes } = req.query;
    const result = await getFrames();

    if (result.error) {
      const error: ErrorResponse = {
        code: 'DATABASE_ERROR',
        message: result.error,
      };
      res.status(500).json(error);
      return;
    }

    let frames = result.data || [];

    // Filter by themes if provided
    if (themes) {
      const themesString = Array.isArray(themes) ? themes[0] : themes;
      if (typeof themesString === 'string') {
        const themeList = themesString.split(',').map((t) => t.trim().toLowerCase());
        frames = frames.filter((frame: DaggerheartFrame) =>
          frame.themes?.some((t: string) => themeList.includes(t.toLowerCase()))
        );
      }
    }

    const response: GetFramesResponse = { frames };
    res.json(response);
  } catch (error) {
    console.error('Error fetching frames:', error);
    const errorResponse: ErrorResponse = {
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch frames',
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * GET /content/frames/:name
 *
 * Get a specific frame by name.
 */
router.get('/frames/:name', async (req: Request, res: Response) => {
  try {
    const name = req.params.name as string;
    const result = await getFrameByName(name);

    if (result.error) {
      const error: ErrorResponse = {
        code: 'DATABASE_ERROR',
        message: result.error,
      };
      res.status(500).json(error);
      return;
    }

    if (!result.data) {
      const error: ErrorResponse = {
        code: 'NOT_FOUND',
        message: `Frame not found: ${name}`,
      };
      res.status(404).json(error);
      return;
    }

    res.json(result.data);
  } catch (error) {
    console.error('Error fetching frame:', error);
    const errorResponse: ErrorResponse = {
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch frame',
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * POST /content/frame/generate
 *
 * Generate a custom frame from user description.
 */
router.post('/frame/generate', async (req: Request, res: Response) => {
  const body = req.body as Partial<GenerateFrameRequest>;

  // Validate request
  if (!body.userMessage || typeof body.userMessage !== 'string') {
    const error: ErrorResponse = {
      code: 'INVALID_REQUEST',
      message: 'userMessage is required',
    };
    res.status(400).json(error);
    return;
  }

  if (!body.dialsSummary || typeof body.dialsSummary !== 'object') {
    const error: ErrorResponse = {
      code: 'INVALID_REQUEST',
      message: 'dialsSummary is required',
    };
    res.status(400).json(error);
    return;
  }

  try {
    // Get existing frame names to avoid duplicates
    const framesResult = await getFrames();
    const existingFrameNames = framesResult.data?.map((f: DaggerheartFrame) => f.name) || [];

    // Process through the frame generation handler
    const result = await generateFrameHandler({
      userMessage: body.userMessage,
      dialsSummary: body.dialsSummary,
      existingFrameNames,
    });

    // Build response
    const response: GenerateFrameResponse = {
      messageId: uuidv4(),
      content: result.assistantMessage,
      frameDraft: result.frameDraft,
      isComplete: result.isComplete,
      followUpQuestion: result.followUpQuestion,
    };

    res.json(response);
  } catch (error) {
    console.error('Frame generation error:', error);
    const errorResponse: ErrorResponse = {
      code: 'PROCESSING_ERROR',
      message: 'Failed to generate frame',
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * POST /content/outline/generate
 *
 * Generate adventure outline with scene briefs.
 */
router.post('/outline/generate', async (req: Request, res: Response) => {
  const body = req.body as Partial<GenerateOutlineRequest>;

  // Validate request
  if (!body.frame || typeof body.frame !== 'object') {
    const error: ErrorResponse = {
      code: 'INVALID_REQUEST',
      message: 'frame is required',
    };
    res.status(400).json(error);
    return;
  }

  if (!body.dialsSummary || typeof body.dialsSummary !== 'object') {
    const error: ErrorResponse = {
      code: 'INVALID_REQUEST',
      message: 'dialsSummary is required',
    };
    res.status(400).json(error);
    return;
  }

  // Validate dialsSummary has required fields
  const { partySize, partyTier, sceneCount } = body.dialsSummary;
  if (typeof partySize !== 'number' || typeof partyTier !== 'number' || typeof sceneCount !== 'number') {
    const error: ErrorResponse = {
      code: 'INVALID_REQUEST',
      message: 'dialsSummary must include partySize, partyTier, and sceneCount',
    };
    res.status(400).json(error);
    return;
  }

  // Validate scene count range
  if (sceneCount < 3 || sceneCount > 6) {
    const error: ErrorResponse = {
      code: 'INVALID_REQUEST',
      message: 'sceneCount must be between 3 and 6',
    };
    res.status(400).json(error);
    return;
  }

  try {
    // Process through the outline generation handler
    const result = await generateOutlineHandler({
      frame: body.frame,
      dialsSummary: body.dialsSummary,
      feedback: body.feedback,
      previousOutline: body.previousOutline,
    });

    // Build response
    const response: GenerateOutlineResponse = {
      messageId: uuidv4(),
      content: result.assistantMessage,
      outline: result.outline,
      isComplete: result.isComplete,
      followUpQuestion: result.followUpQuestion,
    };

    res.json(response);
  } catch (error) {
    console.error('Outline generation error:', error);
    const errorResponse: ErrorResponse = {
      code: 'PROCESSING_ERROR',
      message: 'Failed to generate outline',
    };
    res.status(500).json(errorResponse);
  }
});

// =============================================================================
// Adversary Routes (Phase 4.1)
// =============================================================================

/**
 * GET /content/adversaries
 *
 * Get adversaries from Supabase with optional filters.
 * Query params: tier, type, limit
 */
router.get('/adversaries', async (req: Request, res: Response) => {
  try {
    const { tier, type, limit } = req.query;

    const options: { tier?: number; type?: string; limit?: number } = {};
    if (tier !== undefined && tier !== '') {
      const parsedTier = parseInt(tier as string, 10);
      if (isNaN(parsedTier) || parsedTier < 1 || parsedTier > 4) {
        const error: ErrorResponse = {
          code: 'INVALID_REQUEST',
          message: 'tier must be a number between 1 and 4',
        };
        res.status(400).json(error);
        return;
      }
      options.tier = parsedTier;
    }
    if (type && typeof type === 'string') {
      options.type = type;
    }
    if (limit !== undefined && limit !== '') {
      const parsedLimit = parseInt(limit as string, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        const error: ErrorResponse = {
          code: 'INVALID_REQUEST',
          message: 'limit must be a positive number',
        };
        res.status(400).json(error);
        return;
      }
      options.limit = parsedLimit;
    }

    const result = await getAdversaries(options);

    if (result.error) {
      const error: ErrorResponse = {
        code: 'DATABASE_ERROR',
        message: result.error,
      };
      res.status(500).json(error);
      return;
    }

    const adversaries = result.data || [];

    // Extract unique types for filter dropdown
    const availableTypes = [...new Set(adversaries.map((a: DaggerheartAdversary) => a.type))].sort();

    const response: GetAdversariesResponse = {
      adversaries,
      availableTypes,
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching adversaries:', error);
    const errorResponse: ErrorResponse = {
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch adversaries',
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * GET /content/adversaries/types
 *
 * Get all available adversary types from database.
 */
router.get('/adversaries/types', async (_req: Request, res: Response) => {
  try {
    // Get all adversaries to extract types
    const result = await getAdversaries();

    if (result.error) {
      const error: ErrorResponse = {
        code: 'DATABASE_ERROR',
        message: result.error,
      };
      res.status(500).json(error);
      return;
    }

    const types = [...new Set((result.data || []).map((a: DaggerheartAdversary) => a.type))].sort();

    const response: GetAdversaryTypesResponse = { types };
    res.json(response);
  } catch (error) {
    console.error('Error fetching adversary types:', error);
    const errorResponse: ErrorResponse = {
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch adversary types',
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * GET /content/adversaries/:name
 *
 * Get a specific adversary by name.
 */
router.get('/adversaries/:name', async (req: Request, res: Response) => {
  try {
    const name = decodeURIComponent(req.params.name as string);
    const result = await getAdversaryByName(name);

    if (result.error) {
      const error: ErrorResponse = {
        code: 'DATABASE_ERROR',
        message: result.error,
      };
      res.status(500).json(error);
      return;
    }

    if (!result.data) {
      const error: ErrorResponse = {
        code: 'NOT_FOUND',
        message: `Adversary not found: ${name}`,
      };
      res.status(404).json(error);
      return;
    }

    res.json(result.data);
  } catch (error) {
    console.error('Error fetching adversary:', error);
    const errorResponse: ErrorResponse = {
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch adversary',
    };
    res.status(500).json(errorResponse);
  }
});

// =============================================================================
// Item Routes (Phase 4.2)
// =============================================================================

const VALID_ITEM_CATEGORIES: ItemCategory[] = ['item', 'weapon', 'armor', 'consumable'];

/**
 * GET /content/items
 *
 * Get unified items from all categories (items, weapons, armor, consumables).
 * Query params: tier, category, limit
 */
router.get('/items', async (req: Request, res: Response) => {
  try {
    const { tier, category, limit } = req.query;

    // Validate tier
    let parsedTier: number | undefined;
    if (tier !== undefined && tier !== '') {
      parsedTier = parseInt(tier as string, 10);
      if (isNaN(parsedTier) || parsedTier < 1 || parsedTier > 4) {
        const error: ErrorResponse = {
          code: 'INVALID_REQUEST',
          message: 'tier must be a number between 1 and 4',
        };
        res.status(400).json(error);
        return;
      }
    }

    // Validate category
    let filterCategory: ItemCategory | undefined;
    if (category && typeof category === 'string') {
      if (!VALID_ITEM_CATEGORIES.includes(category as ItemCategory)) {
        const error: ErrorResponse = {
          code: 'INVALID_REQUEST',
          message: `category must be one of: ${VALID_ITEM_CATEGORIES.join(', ')}`,
        };
        res.status(400).json(error);
        return;
      }
      filterCategory = category as ItemCategory;
    }

    // Validate limit
    let parsedLimit: number | undefined;
    if (limit !== undefined && limit !== '') {
      parsedLimit = parseInt(limit as string, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        const error: ErrorResponse = {
          code: 'INVALID_REQUEST',
          message: 'limit must be a positive number',
        };
        res.status(400).json(error);
        return;
      }
    }

    // Fetch from all categories in parallel
    const [itemsResult, weaponsResult, armorResult, consumablesResult] = await Promise.all([
      filterCategory && filterCategory !== 'item' ? Promise.resolve({ data: [], error: null }) : getItems(),
      filterCategory && filterCategory !== 'weapon'
        ? Promise.resolve({ data: [], error: null })
        : getWeapons(parsedTier !== undefined ? { tier: parsedTier } : undefined),
      filterCategory && filterCategory !== 'armor'
        ? Promise.resolve({ data: [], error: null })
        : getArmor(parsedTier !== undefined ? { tier: parsedTier } : undefined),
      filterCategory && filterCategory !== 'consumable'
        ? Promise.resolve({ data: [], error: null })
        : getConsumables(),
    ]);

    // Check for errors
    if (itemsResult.error) {
      const error: ErrorResponse = {
        code: 'DATABASE_ERROR',
        message: itemsResult.error,
      };
      res.status(500).json(error);
      return;
    }
    if (weaponsResult.error) {
      const error: ErrorResponse = {
        code: 'DATABASE_ERROR',
        message: weaponsResult.error,
      };
      res.status(500).json(error);
      return;
    }
    if (armorResult.error) {
      const error: ErrorResponse = {
        code: 'DATABASE_ERROR',
        message: armorResult.error,
      };
      res.status(500).json(error);
      return;
    }
    if (consumablesResult.error) {
      const error: ErrorResponse = {
        code: 'DATABASE_ERROR',
        message: consumablesResult.error,
      };
      res.status(500).json(error);
      return;
    }

    // Build unified items list
    const unifiedItems: UnifiedItem[] = [];

    // Add items
    for (const item of itemsResult.data || []) {
      unifiedItems.push({ category: 'item', data: item });
    }

    // Add weapons
    for (const weapon of weaponsResult.data || []) {
      unifiedItems.push({ category: 'weapon', data: weapon });
    }

    // Add armor
    for (const armor of armorResult.data || []) {
      unifiedItems.push({ category: 'armor', data: armor });
    }

    // Add consumables
    for (const consumable of consumablesResult.data || []) {
      unifiedItems.push({ category: 'consumable', data: consumable });
    }

    // Apply limit if specified
    let finalItems = unifiedItems;
    if (parsedLimit !== undefined) {
      finalItems = unifiedItems.slice(0, parsedLimit);
    }

    // Extract available categories
    const availableCategories = [...new Set(unifiedItems.map((item) => item.category))].sort() as ItemCategory[];

    const response: GetItemsResponse = {
      items: finalItems,
      availableCategories,
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching items:', error);
    const errorResponse: ErrorResponse = {
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch items',
    };
    res.status(500).json(errorResponse);
  }
});

export default router;
