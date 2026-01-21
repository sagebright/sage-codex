/**
 * Content Generation Types
 *
 * Types for Phase 3+ content generation including:
 * - Frames (adventure framework selection/creation)
 * - Outlines (scene briefs)
 * - Scenes (full scene content)
 * - NPCs (compiled characters)
 */

import type { DaggerheartFrame } from './database.js';

// =============================================================================
// Frame Types
// =============================================================================

/**
 * A custom frame created through chat (not from Supabase)
 */
export interface FrameDraft {
  /** Client-generated ID for custom frames */
  id: string;
  name: string;
  description: string;
  themes: string[];
  typicalAdversaries: string[];
  lore: string;
  /** Marks this as a user-created frame vs DB frame */
  isCustom: true;
}

/**
 * Selected frame can be either from Supabase or custom
 */
export type SelectedFrame = DaggerheartFrame | FrameDraft;

/**
 * Type guard to check if a frame is custom
 */
export function isCustomFrame(frame: SelectedFrame): frame is FrameDraft {
  return 'isCustom' in frame && frame.isCustom === true;
}

// =============================================================================
// MCP Tool: generate_frame_draft
// =============================================================================

/**
 * Input for the generate_frame_draft MCP tool
 */
export interface GenerateFrameInput {
  /** The user's description/preferences for the custom frame */
  userMessage: string;
  /** Current dial settings for context */
  dialsSummary: {
    partySize: number;
    partyTier: 1 | 2 | 3 | 4;
    sceneCount: number;
    tone: string | null;
    themes: string[];
  };
  /** Existing frames for reference (avoid duplicates) */
  existingFrameNames?: string[];
}

/**
 * Output from the generate_frame_draft MCP tool
 */
export interface GenerateFrameOutput {
  /** The assistant's response message */
  assistantMessage: string;
  /** The generated frame draft (if successful) */
  frameDraft?: Omit<FrameDraft, 'id' | 'isCustom'>;
  /** Whether the draft is ready for confirmation */
  isComplete: boolean;
  /** Follow-up questions if more info needed */
  followUpQuestion?: string;
}

// =============================================================================
// WebSocket Events for Content
// =============================================================================

/**
 * WebSocket event types for content generation (client → server)
 */
export type ContentClientEventType =
  | 'content:frame_select'
  | 'content:frame_create'
  | 'content:frame_confirm';

/**
 * WebSocket event types for content generation (server → client)
 */
export type ContentServerEventType =
  | 'content:frames_loaded'
  | 'content:frame_draft_start'
  | 'content:frame_draft_chunk'
  | 'content:frame_draft_complete'
  | 'content:frame_confirmed';

// -----------------------------------------------------------------------------
// Client Events (Frontend → Bridge)
// -----------------------------------------------------------------------------

/**
 * User selects an existing frame from the database
 */
export interface FrameSelectEvent {
  type: 'content:frame_select';
  payload: {
    frameId: string;
  };
}

/**
 * User requests a custom frame via chat
 */
export interface FrameCreateEvent {
  type: 'content:frame_create';
  payload: {
    userMessage: string;
    dialsSummary: GenerateFrameInput['dialsSummary'];
  };
}

/**
 * User confirms the selected/created frame
 */
export interface FrameConfirmEvent {
  type: 'content:frame_confirm';
  payload: {
    frame: SelectedFrame;
  };
}

/**
 * Union of all content client events
 */
export type ContentClientEvent = FrameSelectEvent | FrameCreateEvent | FrameConfirmEvent;

// -----------------------------------------------------------------------------
// Server Events (Bridge → Frontend)
// -----------------------------------------------------------------------------

/**
 * Existing frames loaded from database
 */
export interface FramesLoadedEvent {
  type: 'content:frames_loaded';
  payload: {
    frames: DaggerheartFrame[];
  };
}

/**
 * Frame draft generation starting
 */
export interface FrameDraftStartEvent {
  type: 'content:frame_draft_start';
  payload: {
    messageId: string;
  };
}

/**
 * Streaming chunk of frame draft response
 */
export interface FrameDraftChunkEvent {
  type: 'content:frame_draft_chunk';
  payload: {
    messageId: string;
    chunk: string;
  };
}

/**
 * Frame draft generation complete
 */
export interface FrameDraftCompleteEvent {
  type: 'content:frame_draft_complete';
  payload: {
    messageId: string;
    frameDraft?: Omit<FrameDraft, 'id' | 'isCustom'>;
    isComplete: boolean;
    followUpQuestion?: string;
  };
}

/**
 * Frame confirmed and saved
 */
export interface FrameConfirmedEvent {
  type: 'content:frame_confirmed';
  payload: {
    frame: SelectedFrame;
  };
}

/**
 * Union of all content server events
 */
export type ContentServerEvent =
  | FramesLoadedEvent
  | FrameDraftStartEvent
  | FrameDraftChunkEvent
  | FrameDraftCompleteEvent
  | FrameConfirmedEvent;

// =============================================================================
// API Types
// =============================================================================

/**
 * Request to get all frames
 */
export interface GetFramesRequest {
  /** Optional theme filter */
  themes?: string[];
}

/**
 * Response with frames list
 */
export interface GetFramesResponse {
  frames: DaggerheartFrame[];
}

/**
 * Request to generate a custom frame
 */
export interface GenerateFrameRequest {
  userMessage: string;
  dialsSummary: GenerateFrameInput['dialsSummary'];
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

/**
 * Response from frame generation
 */
export interface GenerateFrameResponse {
  messageId: string;
  content: string;
  frameDraft?: Omit<FrameDraft, 'id' | 'isCustom'>;
  isComplete: boolean;
  followUpQuestion?: string;
}
