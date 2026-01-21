/**
 * Tests for generate_markdown MCP Tool
 *
 * TDD: RED phase - write failing tests first
 */

import { describe, it, expect } from 'vitest';
import { generateMarkdownHandler, GENERATE_MARKDOWN_SCHEMA } from './generateMarkdown.js';
import type {
  WebAdventure,
  Phase,
  Json,
} from '@dagger-app/shared-types';

// =============================================================================
// Test Fixtures
// =============================================================================

/**
 * Helper to cast typed content to Json (for WebAdventure fields)
 */
function toJson<T>(value: T): Json {
  return value as unknown as Json;
}

function createMockWebAdventure(overrides: Partial<WebAdventure> = {}): WebAdventure {
  return {
    id: 'test-uuid',
    session_id: 'test-session-123',
    adventure_name: 'The Lost Temple',
    current_phase: 'complete' as Phase,
    phase_history: ['setup', 'dial-tuning', 'frame', 'outline', 'scenes', 'npcs', 'adversaries', 'items', 'echoes', 'complete'],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T12:00:00Z',
    dials: toJson({
      partySize: 4,
      partyTier: 2,
      sceneCount: 4,
      sessionLength: '3-4 hours',
      tone: 'dark and mysterious',
      themes: ['redemption', 'identity'],
    }),
    confirmed_dials: ['partySize', 'partyTier', 'sceneCount', 'sessionLength', 'tone', 'themes'],
    selected_frame: null,
    frame_confirmed: false,
    current_outline: null,
    outline_confirmed: false,
    scenes: [],
    current_scene_id: null,
    npcs: [],
    confirmed_npc_ids: [],
    selected_adversaries: [],
    confirmed_adversary_ids: [],
    selected_items: [],
    confirmed_item_ids: [],
    echoes: [],
    confirmed_echo_ids: [],
    last_exported_at: null,
    export_count: 0,
    ...overrides,
  };
}

function createMockDbFrame(overrides: Record<string, unknown> = {}) {
  return {
    id: 'frame-1',
    name: 'The Haunted Forest',
    description: 'A dark forest filled with ancient spirits and forgotten secrets',
    themes: ['horror', 'mystery'],
    typical_adversaries: ['undead', 'fey'],
    lore: 'Long ago, this forest was the site of a great battle...',
    embedding: null,
    source_book: 'Core Rulebook',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function createMockCustomFrame(overrides: Record<string, unknown> = {}) {
  return {
    id: 'custom-1',
    name: 'The Clockwork City',
    description: 'A city of mechanical wonders where gears rule all',
    themes: ['heist', 'political'],
    typicalAdversaries: ['constructs', 'humanoid'],
    lore: 'Built upon the ruins of the old world...',
    isCustom: true,
    ...overrides,
  };
}

function createMockOutline(overrides: Record<string, unknown> = {}) {
  return {
    id: 'outline-1',
    title: 'Shadows of the Lost Temple',
    summary: 'A group of adventurers delves into an ancient temple to uncover dark secrets.',
    scenes: [
      createMockSceneBrief({ sceneNumber: 1, title: 'The Arrival' }),
      createMockSceneBrief({ sceneNumber: 2, title: 'The Descent' }),
      createMockSceneBrief({ sceneNumber: 3, title: 'The Revelation' }),
      createMockSceneBrief({ sceneNumber: 4, title: 'The Confrontation' }),
    ],
    isConfirmed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function createMockSceneBrief(overrides: Record<string, unknown> = {}) {
  const sceneNumber = (overrides.sceneNumber as number) || 1;
  return {
    id: `scene-brief-${sceneNumber}`,
    sceneNumber,
    title: 'The Beginning',
    description: 'The party gathers at the tavern to begin their quest.',
    keyElements: ['mysterious stranger', 'ancient map'],
    location: 'The Silver Stag Tavern',
    characters: ['Barkeep Mira', 'Hooded Stranger'],
    sceneType: 'social',
    ...overrides,
  };
}

function createMockSceneDraft(overrides: Record<string, unknown> = {}) {
  return {
    sceneId: 'scene-1',
    sceneNumber: 1,
    title: 'The Arrival',
    introduction: 'As the sun sets behind the mountains, the party arrives at the ancient temple.',
    keyMoments: [
      { title: 'First Encounter', description: 'The party encounters guardian statues.' },
      { title: 'Discovery', description: 'A hidden passage is revealed.' },
    ],
    resolution: 'The party gains entry to the temple depths.',
    tierGuidance: 'At Tier 2, the guardians should present a moderate challenge.',
    extractedEntities: {
      npcs: [],
      adversaries: [],
      items: [],
    },
    ...overrides,
  };
}

function createMockScene(overrides: Record<string, unknown> = {}) {
  return {
    brief: createMockSceneBrief(),
    draft: createMockSceneDraft(),
    status: 'confirmed',
    confirmedAt: new Date().toISOString(),
    ...overrides,
  };
}

function createMockNPC(overrides: Record<string, unknown> = {}) {
  return {
    id: 'npc-1',
    name: 'Elder Thorne',
    role: 'quest-giver',
    description: 'An elderly sage who knows the secrets of the temple.',
    appearance: 'White beard, worn robes, piercing blue eyes',
    personality: 'Wise but cryptic, speaks in riddles',
    motivations: ['Protect the temple secrets', 'Guide worthy adventurers'],
    connections: ['Former guardian of the temple'],
    sceneAppearances: ['scene-1', 'scene-4'],
    isConfirmed: true,
    extractedFrom: [{ sceneId: 'scene-1', context: 'The party meets Elder Thorne' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function createMockAdversary() {
  return {
    id: 'adv-1',
    name: 'Shadow Guardian',
    tier: 2,
    type: 'undead',
    difficulty: 'standard',
    description: 'A spectral guardian bound to protect the temple.',
    motives_tactics: ['Protect the inner sanctum', 'Drive away intruders'],
    thresholds: '6/12/18',
    hp: 8,
    stress: 3,
    atk: '+4',
    weapon: 'Ethereal Blade',
    range: 'melee',
    dmg: 'd8+2',
    features: [
      { name: 'Incorporeal', description: 'Can pass through solid objects' },
      { name: 'Fear Aura', description: 'Enemies must make a fear save' },
    ],
    embedding: null,
    source_book: 'Core Rulebook',
    created_at: new Date().toISOString(),
  };
}

function createMockSelectedAdversary(overrides: Record<string, unknown> = {}) {
  return {
    adversary: createMockAdversary(),
    quantity: 2,
    assignedScenes: ['scene-3'],
    notes: 'Guard the inner sanctum',
    ...overrides,
  };
}

function createMockUnifiedItem() {
  return {
    category: 'weapon',
    data: {
      id: 'item-1',
      name: 'Temple Guardian Blade',
      weapon_category: 'sword',
      trait: 'Holy',
      damage: 'd8',
      feature: 'Deals extra damage to undead',
      range: 'melee',
      burden: '2',
      tier: 2,
      searchable_text: null,
      embedding: null,
      source_book: 'Core Rulebook',
      created_at: new Date().toISOString(),
    },
  };
}

function createMockSelectedItem(overrides: Record<string, unknown> = {}) {
  return {
    item: createMockUnifiedItem(),
    quantity: 1,
    assignedScenes: ['scene-4'],
    notes: 'Reward for defeating the final guardian',
    ...overrides,
  };
}

function createMockEcho(overrides: Record<string, unknown> = {}) {
  return {
    id: 'echo-1',
    category: 'complications',
    title: 'Crumbling Architecture',
    content: 'The ancient stonework begins to give way, threatening to trap the party.',
    tags: ['environmental', 'danger'],
    isConfirmed: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function createFullMockAdventure(): WebAdventure {
  return createMockWebAdventure({
    selected_frame: toJson(createMockDbFrame()),
    frame_confirmed: true,
    current_outline: toJson(createMockOutline()),
    outline_confirmed: true,
    scenes: [
      toJson(createMockScene({ brief: createMockSceneBrief({ sceneNumber: 1, title: 'The Arrival' }) })),
      toJson(createMockScene({ brief: createMockSceneBrief({ sceneNumber: 2, title: 'The Descent' }) })),
      toJson(createMockScene({ brief: createMockSceneBrief({ sceneNumber: 3, title: 'The Revelation' }) })),
      toJson(createMockScene({ brief: createMockSceneBrief({ sceneNumber: 4, title: 'The Confrontation' }) })),
    ],
    npcs: [toJson(createMockNPC())],
    confirmed_npc_ids: ['npc-1'],
    selected_adversaries: [toJson(createMockSelectedAdversary())],
    confirmed_adversary_ids: ['adv-1'],
    selected_items: [toJson(createMockSelectedItem())],
    confirmed_item_ids: ['item-1'],
    echoes: [
      toJson(createMockEcho({ category: 'complications', title: 'Crumbling Architecture' })),
      toJson(createMockEcho({ id: 'echo-2', category: 'rumors', title: 'Whispers of Gold' })),
      toJson(createMockEcho({ id: 'echo-3', category: 'discoveries', title: 'Hidden Chamber' })),
      toJson(createMockEcho({ id: 'echo-4', category: 'intrusions', title: 'Rival Party' })),
      toJson(createMockEcho({ id: 'echo-5', category: 'wonders', title: 'Ancient Magic' })),
    ],
    confirmed_echo_ids: ['echo-1', 'echo-2', 'echo-3', 'echo-4', 'echo-5'],
  });
}

// =============================================================================
// Schema Tests
// =============================================================================

describe('GENERATE_MARKDOWN_SCHEMA', () => {
  it('has correct description', () => {
    expect(GENERATE_MARKDOWN_SCHEMA.description).toBe(
      'Generate markdown files for adventure export'
    );
  });

  it('requires adventure field', () => {
    expect(GENERATE_MARKDOWN_SCHEMA.inputSchema?.required).toContain('adventure');
  });

  it('has adventure as object type', () => {
    expect(GENERATE_MARKDOWN_SCHEMA.inputSchema?.properties?.adventure).toBeDefined();
  });
});

// =============================================================================
// Basic Generation Tests
// =============================================================================

describe('generateMarkdownHandler', () => {
  describe('basic generation', () => {
    it('returns files array with at least adventure.md', async () => {
      const input = { adventure: createMockWebAdventure() };

      const result = await generateMarkdownHandler(input);

      expect(result.files).toBeDefined();
      expect(Array.isArray(result.files)).toBe(true);
      expect(result.files.length).toBeGreaterThanOrEqual(1);
      expect(result.files.some(f => f.path === 'adventure.md')).toBe(true);
    });

    it('returns adventure name', async () => {
      const input = { adventure: createMockWebAdventure({ adventure_name: 'Test Adventure' }) };

      const result = await generateMarkdownHandler(input);

      expect(result.adventureName).toBe('Test Adventure');
    });

    it('returns generated timestamp', async () => {
      const input = { adventure: createMockWebAdventure() };

      const result = await generateMarkdownHandler(input);

      expect(result.generatedAt).toBeDefined();
      expect(new Date(result.generatedAt).toISOString()).toBe(result.generatedAt);
    });

    it('generates all files when adventure has full content', async () => {
      const input = { adventure: createFullMockAdventure() };

      const result = await generateMarkdownHandler(input);

      const paths = result.files.map(f => f.path);
      expect(paths).toContain('adventure.md');
      expect(paths).toContain('frame.md');
      expect(paths.some(p => p.startsWith('scenes/'))).toBe(true);
      expect(paths).toContain('npcs.md');
      expect(paths).toContain('adversaries.md');
      expect(paths).toContain('items.md');
      expect(paths).toContain('echoes.md');
    });

    it('each file has path and content properties', async () => {
      const input = { adventure: createFullMockAdventure() };

      const result = await generateMarkdownHandler(input);

      for (const file of result.files) {
        expect(typeof file.path).toBe('string');
        expect(typeof file.content).toBe('string');
        expect(file.path.length).toBeGreaterThan(0);
        expect(file.content.length).toBeGreaterThan(0);
      }
    });
  });

  // =============================================================================
  // adventure.md Tests
  // =============================================================================

  describe('adventure.md generation', () => {
    it('includes adventure name as title', async () => {
      const input = { adventure: createMockWebAdventure({ adventure_name: 'The Dark Quest' }) };

      const result = await generateMarkdownHandler(input);
      const adventureMd = result.files.find(f => f.path === 'adventure.md');

      expect(adventureMd?.content).toContain('# The Dark Quest');
    });

    it('includes party configuration from dials', async () => {
      const input = {
        adventure: createMockWebAdventure({
          dials: toJson({ partySize: 5, partyTier: 3, sceneCount: 4, sessionLength: '4-5 hours' }),
        }),
      };

      const result = await generateMarkdownHandler(input);
      const adventureMd = result.files.find(f => f.path === 'adventure.md');

      expect(adventureMd?.content).toContain('5');
      expect(adventureMd?.content).toMatch(/[Tt]ier.*3/);
    });

    it('includes tone when present', async () => {
      const input = {
        adventure: createMockWebAdventure({
          dials: toJson({ tone: 'grim and gritty', partySize: 4, partyTier: 2 }),
        }),
      };

      const result = await generateMarkdownHandler(input);
      const adventureMd = result.files.find(f => f.path === 'adventure.md');

      expect(adventureMd?.content).toContain('grim and gritty');
    });

    it('includes themes when present', async () => {
      const input = {
        adventure: createMockWebAdventure({
          dials: toJson({ themes: ['redemption', 'sacrifice'], partySize: 4, partyTier: 2 }),
        }),
      };

      const result = await generateMarkdownHandler(input);
      const adventureMd = result.files.find(f => f.path === 'adventure.md');

      expect(adventureMd?.content).toContain('redemption');
      expect(adventureMd?.content).toContain('sacrifice');
    });

    it('includes scene summary from outline', async () => {
      const input = {
        adventure: createMockWebAdventure({
          current_outline: toJson(createMockOutline()),
        }),
      };

      const result = await generateMarkdownHandler(input);
      const adventureMd = result.files.find(f => f.path === 'adventure.md');

      expect(adventureMd?.content).toContain('The Arrival');
      expect(adventureMd?.content).toContain('The Descent');
    });

    it('handles missing dials gracefully', async () => {
      const input = { adventure: createMockWebAdventure({ dials: toJson({}) }) };

      const result = await generateMarkdownHandler(input);
      const adventureMd = result.files.find(f => f.path === 'adventure.md');

      expect(adventureMd).toBeDefined();
      expect(adventureMd?.content).not.toContain('undefined');
      expect(adventureMd?.content).not.toContain('null');
    });
  });

  // =============================================================================
  // frame.md Tests
  // =============================================================================

  describe('frame.md generation', () => {
    it('generates frame.md when frame is selected', async () => {
      const input = {
        adventure: createMockWebAdventure({
          selected_frame: toJson(createMockDbFrame()),
        }),
      };

      const result = await generateMarkdownHandler(input);
      const frameMd = result.files.find(f => f.path === 'frame.md');

      expect(frameMd).toBeDefined();
    });

    it('skips frame.md when no frame selected', async () => {
      const input = { adventure: createMockWebAdventure({ selected_frame: null }) };

      const result = await generateMarkdownHandler(input);
      const frameMd = result.files.find(f => f.path === 'frame.md');

      expect(frameMd).toBeUndefined();
    });

    it('includes frame name as title', async () => {
      const input = {
        adventure: createMockWebAdventure({
          selected_frame: toJson(createMockDbFrame({ name: 'The Shadow Keep' })),
        }),
      };

      const result = await generateMarkdownHandler(input);
      const frameMd = result.files.find(f => f.path === 'frame.md');

      expect(frameMd?.content).toContain('# The Shadow Keep');
    });

    it('includes frame description', async () => {
      const input = {
        adventure: createMockWebAdventure({
          selected_frame: toJson(createMockDbFrame({ description: 'A fortress of darkness' })),
        }),
      };

      const result = await generateMarkdownHandler(input);
      const frameMd = result.files.find(f => f.path === 'frame.md');

      expect(frameMd?.content).toContain('A fortress of darkness');
    });

    it('includes themes as list', async () => {
      const input = {
        adventure: createMockWebAdventure({
          selected_frame: toJson(createMockDbFrame({ themes: ['horror', 'intrigue'] })),
        }),
      };

      const result = await generateMarkdownHandler(input);
      const frameMd = result.files.find(f => f.path === 'frame.md');

      expect(frameMd?.content).toContain('horror');
      expect(frameMd?.content).toContain('intrigue');
    });

    it('includes lore when present', async () => {
      const input = {
        adventure: createMockWebAdventure({
          selected_frame: toJson(createMockDbFrame({ lore: 'In ancient times...' })),
        }),
      };

      const result = await generateMarkdownHandler(input);
      const frameMd = result.files.find(f => f.path === 'frame.md');

      expect(frameMd?.content).toContain('In ancient times...');
    });

    it('handles custom FrameDraft correctly', async () => {
      const input = {
        adventure: createMockWebAdventure({
          selected_frame: toJson(createMockCustomFrame({ name: 'My Custom Frame' })),
        }),
      };

      const result = await generateMarkdownHandler(input);
      const frameMd = result.files.find(f => f.path === 'frame.md');

      expect(frameMd?.content).toContain('# My Custom Frame');
    });
  });

  // =============================================================================
  // scenes/*.md Tests
  // =============================================================================

  describe('scenes/*.md generation', () => {
    it('generates scene files for each confirmed scene', async () => {
      const input = {
        adventure: createMockWebAdventure({
          scenes: [
            toJson(createMockScene({ brief: createMockSceneBrief({ sceneNumber: 1, title: 'Opening' }) })),
            toJson(createMockScene({ brief: createMockSceneBrief({ sceneNumber: 2, title: 'Middle' }) })),
          ],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const sceneFiles = result.files.filter(f => f.path.startsWith('scenes/'));

      expect(sceneFiles.length).toBe(2);
    });

    it('creates numbered filenames with slugified titles', async () => {
      const input = {
        adventure: createMockWebAdventure({
          scenes: [
            toJson(createMockScene({
              brief: createMockSceneBrief({ sceneNumber: 1, title: 'The Dark Forest' }),
              draft: createMockSceneDraft({ sceneNumber: 1, title: 'The Dark Forest' }),
            })),
          ],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const scenePath = result.files.find(f => f.path.startsWith('scenes/'))?.path;

      expect(scenePath).toMatch(/scenes\/01-the-dark-forest\.md/);
    });

    it('includes scene title in content', async () => {
      const input = {
        adventure: createMockWebAdventure({
          scenes: [
            toJson(createMockScene({
              brief: createMockSceneBrief({ sceneNumber: 1, title: 'The Arrival' }),
              draft: createMockSceneDraft({ title: 'The Arrival' }),
            })),
          ],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const sceneMd = result.files.find(f => f.path.startsWith('scenes/'));

      expect(sceneMd?.content).toContain('# Scene 1: The Arrival');
    });

    it('includes introduction', async () => {
      const input = {
        adventure: createMockWebAdventure({
          scenes: [
            toJson(createMockScene({
              draft: createMockSceneDraft({ introduction: 'The party arrives at dawn...' }),
            })),
          ],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const sceneMd = result.files.find(f => f.path.startsWith('scenes/'));

      expect(sceneMd?.content).toContain('The party arrives at dawn...');
    });

    it('includes key moments', async () => {
      const input = {
        adventure: createMockWebAdventure({
          scenes: [
            toJson(createMockScene({
              draft: createMockSceneDraft({
                keyMoments: [
                  { title: 'Discovery', description: 'A hidden door is found.' },
                ],
              }),
            })),
          ],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const sceneMd = result.files.find(f => f.path.startsWith('scenes/'));

      expect(sceneMd?.content).toContain('Discovery');
      expect(sceneMd?.content).toContain('A hidden door is found.');
    });

    it('includes resolution', async () => {
      const input = {
        adventure: createMockWebAdventure({
          scenes: [
            toJson(createMockScene({
              draft: createMockSceneDraft({ resolution: 'The party escapes with the treasure.' }),
            })),
          ],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const sceneMd = result.files.find(f => f.path.startsWith('scenes/'));

      expect(sceneMd?.content).toContain('The party escapes with the treasure.');
    });

    it('includes tier guidance', async () => {
      const input = {
        adventure: createMockWebAdventure({
          scenes: [
            toJson(createMockScene({
              draft: createMockSceneDraft({ tierGuidance: 'Tier 2 parties should find this challenging.' }),
            })),
          ],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const sceneMd = result.files.find(f => f.path.startsWith('scenes/'));

      expect(sceneMd?.content).toContain('Tier 2 parties should find this challenging.');
    });

    it('skips scenes without drafts', async () => {
      const input = {
        adventure: createMockWebAdventure({
          scenes: [
            toJson({ brief: null, draft: null, status: 'pending' }),
          ],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const sceneFiles = result.files.filter(f => f.path.startsWith('scenes/'));

      expect(sceneFiles.length).toBe(0);
    });
  });

  // =============================================================================
  // npcs.md Tests
  // =============================================================================

  describe('npcs.md generation', () => {
    it('generates npcs.md when NPCs exist', async () => {
      const input = {
        adventure: createMockWebAdventure({
          npcs: [toJson(createMockNPC())],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const npcsMd = result.files.find(f => f.path === 'npcs.md');

      expect(npcsMd).toBeDefined();
    });

    it('skips npcs.md when no NPCs', async () => {
      const input = { adventure: createMockWebAdventure({ npcs: [] }) };

      const result = await generateMarkdownHandler(input);
      const npcsMd = result.files.find(f => f.path === 'npcs.md');

      expect(npcsMd).toBeUndefined();
    });

    it('includes NPC name and role', async () => {
      const input = {
        adventure: createMockWebAdventure({
          npcs: [toJson(createMockNPC({ name: 'Captain Blackwood', role: 'ally' }))],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const npcsMd = result.files.find(f => f.path === 'npcs.md');

      expect(npcsMd?.content).toContain('Captain Blackwood');
      expect(npcsMd?.content).toContain('Ally'); // Capitalized in output
    });

    it('includes appearance and personality', async () => {
      const input = {
        adventure: createMockWebAdventure({
          npcs: [toJson(createMockNPC({
            appearance: 'Tall, scarred face',
            personality: 'Gruff but loyal',
          }))],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const npcsMd = result.files.find(f => f.path === 'npcs.md');

      expect(npcsMd?.content).toContain('Tall, scarred face');
      expect(npcsMd?.content).toContain('Gruff but loyal');
    });

    it('includes motivations', async () => {
      const input = {
        adventure: createMockWebAdventure({
          npcs: [toJson(createMockNPC({ motivations: ['Protect the village', 'Find redemption'] }))],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const npcsMd = result.files.find(f => f.path === 'npcs.md');

      expect(npcsMd?.content).toContain('Protect the village');
      expect(npcsMd?.content).toContain('Find redemption');
    });

    it('includes scene appearances', async () => {
      const input = {
        adventure: createMockWebAdventure({
          npcs: [toJson(createMockNPC({ sceneAppearances: ['scene-1', 'scene-3'] }))],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const npcsMd = result.files.find(f => f.path === 'npcs.md');

      expect(npcsMd?.content).toMatch(/[Ss]cene/);
    });

    it('groups NPCs by role', async () => {
      const input = {
        adventure: createMockWebAdventure({
          npcs: [
            toJson(createMockNPC({ id: 'npc-1', name: 'Ally One', role: 'ally' })),
            toJson(createMockNPC({ id: 'npc-2', name: 'Bad Guy', role: 'antagonist' })),
            toJson(createMockNPC({ id: 'npc-3', name: 'Ally Two', role: 'ally' })),
          ],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const npcsMd = result.files.find(f => f.path === 'npcs.md');

      // Should have role headers
      expect(npcsMd?.content).toMatch(/## Allies|## Ally/i);
      expect(npcsMd?.content).toMatch(/## Antagonist/i);
    });
  });

  // =============================================================================
  // adversaries.md Tests
  // =============================================================================

  describe('adversaries.md generation', () => {
    it('generates adversaries.md when adversaries exist', async () => {
      const input = {
        adventure: createMockWebAdventure({
          selected_adversaries: [toJson(createMockSelectedAdversary())],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const advMd = result.files.find(f => f.path === 'adversaries.md');

      expect(advMd).toBeDefined();
    });

    it('skips adversaries.md when no adversaries', async () => {
      const input = { adventure: createMockWebAdventure({ selected_adversaries: [] }) };

      const result = await generateMarkdownHandler(input);
      const advMd = result.files.find(f => f.path === 'adversaries.md');

      expect(advMd).toBeUndefined();
    });

    it('includes adversary name and quantity', async () => {
      const adv = createMockAdversary();
      adv.name = 'Goblin Scout';
      const selected = createMockSelectedAdversary({ quantity: 3 });
      selected.adversary = adv;
      const input = {
        adventure: createMockWebAdventure({ selected_adversaries: [toJson(selected)] }),
      };

      const result = await generateMarkdownHandler(input);
      const advMd = result.files.find(f => f.path === 'adversaries.md');

      expect(advMd?.content).toContain('Goblin Scout');
      expect(advMd?.content).toContain('3');
    });

    it('includes tier and type', async () => {
      const adv = createMockAdversary();
      adv.tier = 3;
      adv.type = 'beast';
      const selected = createMockSelectedAdversary();
      selected.adversary = adv;
      const input = {
        adventure: createMockWebAdventure({ selected_adversaries: [toJson(selected)] }),
      };

      const result = await generateMarkdownHandler(input);
      const advMd = result.files.find(f => f.path === 'adversaries.md');

      expect(advMd?.content).toMatch(/[Tt]ier.*3/);
      expect(advMd?.content).toContain('beast');
    });

    it('includes stat block (HP, stress, thresholds)', async () => {
      const adv = createMockAdversary();
      adv.hp = 12;
      adv.stress = 4;
      adv.thresholds = '5/10/15';
      const selected = createMockSelectedAdversary();
      selected.adversary = adv;
      const input = {
        adventure: createMockWebAdventure({ selected_adversaries: [toJson(selected)] }),
      };

      const result = await generateMarkdownHandler(input);
      const advMd = result.files.find(f => f.path === 'adversaries.md');

      expect(advMd?.content).toContain('12');
      expect(advMd?.content).toContain('4');
      expect(advMd?.content).toContain('5/10/15');
    });

    it('includes attack and damage', async () => {
      const adv = createMockAdversary();
      adv.atk = '+5';
      adv.dmg = 'd10+3';
      const selected = createMockSelectedAdversary();
      selected.adversary = adv;
      const input = {
        adventure: createMockWebAdventure({ selected_adversaries: [toJson(selected)] }),
      };

      const result = await generateMarkdownHandler(input);
      const advMd = result.files.find(f => f.path === 'adversaries.md');

      expect(advMd?.content).toContain('+5');
      expect(advMd?.content).toContain('d10+3');
    });

    it('includes features', async () => {
      const adv = createMockAdversary();
      adv.features = [
        { name: 'Pack Tactics', description: 'Advantage when ally is nearby' },
      ];
      const selected = createMockSelectedAdversary();
      selected.adversary = adv;
      const input = {
        adventure: createMockWebAdventure({ selected_adversaries: [toJson(selected)] }),
      };

      const result = await generateMarkdownHandler(input);
      const advMd = result.files.find(f => f.path === 'adversaries.md');

      expect(advMd?.content).toContain('Pack Tactics');
      expect(advMd?.content).toContain('Advantage when ally is nearby');
    });
  });

  // =============================================================================
  // items.md Tests
  // =============================================================================

  describe('items.md generation', () => {
    it('generates items.md when items exist', async () => {
      const input = {
        adventure: createMockWebAdventure({
          selected_items: [toJson(createMockSelectedItem())],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const itemsMd = result.files.find(f => f.path === 'items.md');

      expect(itemsMd).toBeDefined();
    });

    it('skips items.md when no items', async () => {
      const input = { adventure: createMockWebAdventure({ selected_items: [] }) };

      const result = await generateMarkdownHandler(input);
      const itemsMd = result.files.find(f => f.path === 'items.md');

      expect(itemsMd).toBeUndefined();
    });

    it('groups items by category', async () => {
      const weaponItem = createMockSelectedItem();
      const armorItem = {
        item: {
          category: 'armor',
          data: {
            id: 'armor-1',
            name: 'Temple Guard Plate',
            base_score: 3,
            base_thresholds: '3/6/9',
            feature: 'Blessed protection',
            tier: 2,
            searchable_text: null,
            embedding: null,
            source_book: 'Core Rulebook',
            created_at: new Date().toISOString(),
          },
        },
        quantity: 1,
      };
      const input = {
        adventure: createMockWebAdventure({
          selected_items: [toJson(weaponItem), toJson(armorItem)],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const itemsMd = result.files.find(f => f.path === 'items.md');

      expect(itemsMd?.content).toMatch(/## Weapons/i);
      expect(itemsMd?.content).toMatch(/## Armor/i);
    });

    it('includes item name and tier', async () => {
      const input = {
        adventure: createMockWebAdventure({
          selected_items: [toJson(createMockSelectedItem())],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const itemsMd = result.files.find(f => f.path === 'items.md');

      expect(itemsMd?.content).toContain('Temple Guardian Blade');
      expect(itemsMd?.content).toMatch(/[Tt]ier.*2/);
    });
  });

  // =============================================================================
  // echoes.md Tests
  // =============================================================================

  describe('echoes.md generation', () => {
    it('generates echoes.md when echoes exist', async () => {
      const input = {
        adventure: createMockWebAdventure({
          echoes: [toJson(createMockEcho())],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const echoesMd = result.files.find(f => f.path === 'echoes.md');

      expect(echoesMd).toBeDefined();
    });

    it('skips echoes.md when no echoes', async () => {
      const input = { adventure: createMockWebAdventure({ echoes: [] }) };

      const result = await generateMarkdownHandler(input);
      const echoesMd = result.files.find(f => f.path === 'echoes.md');

      expect(echoesMd).toBeUndefined();
    });

    it('organizes echoes by category', async () => {
      const input = {
        adventure: createMockWebAdventure({
          echoes: [
            toJson(createMockEcho({ category: 'complications', title: 'Trap' })),
            toJson(createMockEcho({ id: 'e2', category: 'rumors', title: 'Gossip' })),
            toJson(createMockEcho({ id: 'e3', category: 'discoveries', title: 'Secret' })),
            toJson(createMockEcho({ id: 'e4', category: 'intrusions', title: 'Ambush' })),
            toJson(createMockEcho({ id: 'e5', category: 'wonders', title: 'Magic' })),
          ],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const echoesMd = result.files.find(f => f.path === 'echoes.md');

      expect(echoesMd?.content).toMatch(/## Complications/i);
      expect(echoesMd?.content).toMatch(/## Rumors/i);
      expect(echoesMd?.content).toMatch(/## Discoveries/i);
      expect(echoesMd?.content).toMatch(/## Intrusions/i);
      expect(echoesMd?.content).toMatch(/## Wonders/i);
    });

    it('includes echo title and content', async () => {
      const input = {
        adventure: createMockWebAdventure({
          echoes: [toJson(createMockEcho({
            title: 'Hidden Danger',
            content: 'A trap springs when the party enters.',
          }))],
        }),
      };

      const result = await generateMarkdownHandler(input);
      const echoesMd = result.files.find(f => f.path === 'echoes.md');

      expect(echoesMd?.content).toContain('Hidden Danger');
      expect(echoesMd?.content).toContain('A trap springs when the party enters.');
    });
  });

  // =============================================================================
  // Error Handling Tests
  // =============================================================================

  describe('error handling', () => {
    it('handles empty adventure gracefully', async () => {
      const input = { adventure: createMockWebAdventure() };

      const result = await generateMarkdownHandler(input);

      expect(result.files).toBeDefined();
      expect(result.files.length).toBeGreaterThanOrEqual(1);
    });

    it('handles null JSONB fields', async () => {
      const input = {
        adventure: createMockWebAdventure({
          dials: null as unknown as Json,
          selected_frame: null,
          current_outline: null,
          scenes: [],
          npcs: [],
          selected_adversaries: [],
          selected_items: [],
          echoes: [],
        }),
      };

      const result = await generateMarkdownHandler(input);

      expect(result.files).toBeDefined();
      expect(result.adventureName).toBeDefined();
    });

    it('handles malformed scene data', async () => {
      const input = {
        adventure: createMockWebAdventure({
          scenes: [
            toJson({ brief: null, draft: null, status: 'pending' }),
          ],
        }),
      };

      const result = await generateMarkdownHandler(input);

      // Should not throw, should skip malformed scene
      expect(result.files).toBeDefined();
    });

    it('does not include undefined or null in markdown content', async () => {
      const input = { adventure: createFullMockAdventure() };

      const result = await generateMarkdownHandler(input);

      for (const file of result.files) {
        expect(file.content).not.toContain('undefined');
        expect(file.content).not.toMatch(/\bnull\b/);
      }
    });
  });
});
