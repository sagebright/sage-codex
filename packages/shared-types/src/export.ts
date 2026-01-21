/**
 * Export Types
 *
 * Types for adventure markdown export functionality.
 */

/**
 * A single generated file for export
 */
export interface GeneratedFile {
  /** Relative path within export folder (e.g., "scenes/01-arrival.md") */
  path: string;
  /** Markdown content */
  content: string;
}

/**
 * Input for the generate_markdown MCP tool
 */
export interface GenerateMarkdownInput {
  /** The full WebAdventure object to export */
  adventure: unknown; // Uses unknown to avoid circular dependency, validated at runtime
}

/**
 * Output from the generate_markdown MCP tool
 */
export interface GenerateMarkdownOutput {
  /** Array of generated files */
  files: GeneratedFile[];
  /** Adventure name for folder naming */
  adventureName: string;
  /** When generation occurred */
  generatedAt: string;
}

/**
 * Full export API response from POST /adventure/:sessionId/export
 */
export interface ExportApiResponse {
  success: boolean;
  files: GeneratedFile[];
  adventureName: string;
  generatedAt: string;
  lastExportedAt: string;
  exportCount: number;
}
