/**
 * MCP Bridge Server
 *
 * Entry point for the Express + WebSocket server that bridges
 * the React frontend to Claude Code via MCP.
 */

import type { HealthResponse } from '@dagger-app/shared-types';

const health: HealthResponse = { status: 'ok', timestamp: new Date().toISOString() };
console.log('MCP Bridge starting...', health);
