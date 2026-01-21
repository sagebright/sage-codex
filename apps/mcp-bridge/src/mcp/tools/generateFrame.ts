/**
 * generate_frame_draft MCP Tool
 *
 * Processes user input to generate a custom adventure frame.
 * Interprets natural language descriptions and creates structured frame data.
 */

import type {
  GenerateFrameInput,
  GenerateFrameOutput,
  FrameDraft,
} from '@dagger-app/shared-types';
import type { ToolSchema } from '../mcpServer.js';

// =============================================================================
// Tool Schema
// =============================================================================

export const GENERATE_FRAME_SCHEMA: ToolSchema = {
  description: 'Generate a custom adventure frame from user description',
  inputSchema: {
    type: 'object',
    properties: {
      userMessage: {
        type: 'string',
        description: 'The user\'s description or preferences for the custom frame',
      },
      dialsSummary: {
        type: 'object',
        description: 'Current dial settings for context',
        properties: {
          partySize: { type: 'number' },
          partyTier: { type: 'number' },
          sceneCount: { type: 'number' },
          tone: { type: 'string' },
          themes: { type: 'array', items: { type: 'string' } },
        },
      },
      existingFrameNames: {
        type: 'array',
        items: { type: 'string' },
        description: 'Names of existing frames to avoid duplicates',
      },
    },
    required: ['userMessage', 'dialsSummary'],
  },
};

// =============================================================================
// Frame Generation Helpers
// =============================================================================

/**
 * Keywords that suggest specific themes
 */
const THEME_KEYWORDS: Record<string, string[]> = {
  horror: ['horror', 'scary', 'frightening', 'terrifying', 'dread', 'eldritch', 'lovecraftian'],
  mystery: ['mystery', 'detective', 'investigate', 'clues', 'puzzle', 'whodunit', 'secrets'],
  heist: ['heist', 'theft', 'steal', 'rob', 'break in', 'infiltration', 'caper'],
  political: ['political', 'intrigue', 'court', 'nobility', 'faction', 'diplomacy'],
  dungeon: ['dungeon', 'cave', 'underground', 'crawl', 'labyrinth', 'tomb', 'crypt'],
  wilderness: ['wilderness', 'nature', 'forest', 'survival', 'exploration', 'journey'],
  urban: ['urban', 'city', 'town', 'streets', 'marketplace', 'criminal'],
  war: ['war', 'battle', 'siege', 'army', 'conflict', 'military', 'campaign'],
  rescue: ['rescue', 'save', 'kidnapped', 'hostage', 'retrieve', 'escort'],
  prophecy: ['prophecy', 'destiny', 'chosen', 'fate', 'oracle', 'vision'],
};

/**
 * Keywords that suggest specific adversary types
 */
const ADVERSARY_KEYWORDS: Record<string, string[]> = {
  undead: ['undead', 'zombie', 'skeleton', 'ghost', 'vampire', 'lich', 'necromancer'],
  beasts: ['beast', 'creature', 'monster', 'animal', 'predator', 'wildlife'],
  humanoid: ['bandit', 'cultist', 'guard', 'thief', 'mercenary', 'assassin', 'soldier'],
  demons: ['demon', 'devil', 'fiend', 'infernal', 'hellish', 'abyssal'],
  fey: ['fey', 'fairy', 'sprite', 'nymph', 'dryad', 'pixie', 'trickster'],
  dragons: ['dragon', 'wyrm', 'drake', 'wyvern', 'dragonborn'],
  constructs: ['construct', 'golem', 'automaton', 'mechanical', 'animated'],
  aberrations: ['aberration', 'eldritch', 'lovecraft', 'tentacle', 'alien', 'mindflayer'],
};

/**
 * Extract themes from user message
 */
function extractThemes(message: string): string[] {
  const lower = message.toLowerCase();
  const themes: Set<string> = new Set();

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        themes.add(theme);
        break;
      }
    }
  }

  return Array.from(themes).slice(0, 5); // Max 5 themes
}

/**
 * Extract potential adversaries from user message
 */
function extractAdversaries(message: string): string[] {
  const lower = message.toLowerCase();
  const adversaries: Set<string> = new Set();

  for (const [type, keywords] of Object.entries(ADVERSARY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        adversaries.add(type);
        break;
      }
    }
  }

  return Array.from(adversaries).slice(0, 4); // Max 4 adversary types
}

/**
 * Generate a frame name from user message
 */
function generateFrameName(message: string, existingNames: string[] = []): string {
  // Extract key nouns/phrases from the message
  const words = message.split(/\s+/);
  const significantWords = words.filter((w) => w.length > 3 && !/^(the|and|but|for|with|this|that|from|into|upon|about)$/i.test(w));

  // Try to create a compelling name
  const candidates = [
    significantWords.slice(0, 3).join(' '),
    `The ${significantWords[0] || 'Unknown'} ${significantWords[1] || 'Tale'}`,
  ];

  // Pick the first candidate that isn't already used
  for (const candidate of candidates) {
    const cleanName = candidate.charAt(0).toUpperCase() + candidate.slice(1);
    if (!existingNames.includes(cleanName)) {
      return cleanName;
    }
  }

  return `Custom Frame ${Date.now().toString(36)}`;
}

/**
 * Check if the user message has enough detail for a complete frame
 */
function hasEnoughDetail(message: string): boolean {
  // Need at least 20 characters and some keywords
  if (message.length < 20) return false;

  const hasThemes = extractThemes(message).length > 0;
  const hasAdversaries = extractAdversaries(message).length > 0;
  const hasDescriptiveWords = message.split(/\s+/).length >= 5;

  return hasDescriptiveWords && (hasThemes || hasAdversaries);
}

/**
 * Generate follow-up question based on what's missing
 */
function generateFollowUpQuestion(themes: string[], adversaries: string[]): string {
  const questions: string[] = [];

  if (themes.length === 0) {
    questions.push('What kind of atmosphere or themes do you envision? (e.g., horror, mystery, heist, political intrigue)');
  }

  if (adversaries.length === 0) {
    questions.push('What types of enemies or challenges should the party face? (e.g., undead, cultists, beasts, demons)');
  }

  if (questions.length === 0) {
    return 'Is there anything else you\'d like to add to this frame?';
  }

  return questions.join(' ');
}

// =============================================================================
// Main Handler
// =============================================================================

/**
 * Process user input and generate frame draft
 */
export async function generateFrameHandler(
  input: GenerateFrameInput
): Promise<GenerateFrameOutput> {
  const { userMessage, dialsSummary, existingFrameNames = [] } = input;

  // Extract elements from user message
  const themes = extractThemes(userMessage);
  const adversaries = extractAdversaries(userMessage);

  // Include dial themes if user hasn't specified any
  const finalThemes = themes.length > 0 ? themes : dialsSummary.themes;

  // Check if we have enough detail
  const isComplete = hasEnoughDetail(userMessage);

  if (!isComplete) {
    const followUp = generateFollowUpQuestion(themes, adversaries);
    return {
      assistantMessage: `I'm starting to understand your vision. ${followUp}`,
      isComplete: false,
      followUpQuestion: followUp,
    };
  }

  // Generate the frame draft
  const frameName = generateFrameName(userMessage, existingFrameNames);

  // Create description based on user message and dials
  const tierDescription = dialsSummary.partyTier === 1 ? 'fledgling adventurers' :
    dialsSummary.partyTier === 2 ? 'experienced adventurers' :
    dialsSummary.partyTier === 3 ? 'veteran heroes' : 'legendary champions';

  const description = userMessage.length > 100
    ? userMessage.slice(0, 200) + '...'
    : `An adventure for ${dialsSummary.partySize} ${tierDescription}. ${userMessage}`;

  // Generate lore
  const lore = finalThemes.length > 0
    ? `A tale woven with themes of ${finalThemes.join(', ')}. The challenges ahead will test the party's resolve against ${adversaries.length > 0 ? adversaries.join(' and ') : 'unknown dangers'}.`
    : `A custom adventure awaits, shaped by your vision and ready for ${dialsSummary.sceneCount} scenes of ${dialsSummary.tone || 'adventure'}.`;

  const frameDraft: Omit<FrameDraft, 'id' | 'isCustom'> = {
    name: frameName,
    description,
    themes: finalThemes,
    typicalAdversaries: adversaries,
    lore,
  };

  return {
    assistantMessage: `I've created a frame based on your description: **${frameName}**. This frame features themes of ${finalThemes.join(', ')}${adversaries.length > 0 ? ` with challenges from ${adversaries.join(', ')}` : ''}. Review the preview and let me know if you'd like to make any changes, or confirm to proceed.`,
    frameDraft,
    isComplete: true,
  };
}
