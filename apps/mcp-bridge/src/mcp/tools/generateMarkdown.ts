/**
 * generate_markdown MCP Tool
 *
 * Generates markdown files for adventure export.
 * This tool converts WebAdventure data into a structured set of markdown files
 * matching the CLI output structure.
 */

import type {
  WebAdventure,
  SelectedFrame,
  FrameDraft,
  DaggerheartFrame,
  Outline,
  SceneBrief,
  Scene,
  SceneDraft,
  NPC,
  CompiledNPC,
  NPCRole,
  SelectedAdversary,
  SelectedItem,
  Echo,
  EchoCategory,
  GeneratedFile,
  GenerateMarkdownOutput,
} from '@dagger-app/shared-types';
import type { ToolSchema } from '../mcpServer.js';

// =============================================================================
// Tool Schema
// =============================================================================

export const GENERATE_MARKDOWN_SCHEMA: ToolSchema = {
  description: 'Generate markdown files for adventure export',
  inputSchema: {
    type: 'object',
    properties: {
      adventure: {
        type: 'object',
        description: 'The full WebAdventure object to export',
      },
    },
    required: ['adventure'],
  },
};

// =============================================================================
// Input Type
// =============================================================================

export interface GenerateMarkdownInput {
  adventure: WebAdventure;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Slugify a title for use in filenames
 */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Pad number with leading zeros
 */
function padNumber(n: number, width: number = 2): string {
  return String(n).padStart(width, '0');
}

/**
 * Safe access to potentially null/undefined values
 */
function safeArray<T>(arr: T[] | null | undefined): T[] {
  return Array.isArray(arr) ? arr : [];
}

/**
 * Safe access to object properties
 */
function safeObject<T extends Record<string, unknown>>(obj: T | null | undefined): T {
  return (obj ?? {}) as T;
}

/**
 * Check if frame is a custom FrameDraft
 */
function isCustomFrame(frame: SelectedFrame): frame is FrameDraft {
  return 'isCustom' in frame && frame.isCustom === true;
}

/**
 * Get tier description for display
 */
function getTierDescription(tier: number): string {
  const descriptions: Record<number, string> = {
    1: 'Novice',
    2: 'Journeyman',
    3: 'Veteran',
    4: 'Master',
  };
  return descriptions[tier] || `Tier ${tier}`;
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// =============================================================================
// Markdown Generators
// =============================================================================

/**
 * Generate adventure.md - Overview, party info, scene summaries
 */
function generateAdventureMd(adventure: WebAdventure): GeneratedFile {
  const dials = safeObject(adventure.dials as Record<string, unknown>);
  const outline = adventure.current_outline as Outline | null;

  const partySize = (dials.partySize as number) || 4;
  const partyTier = (dials.partyTier as number) || 1;
  const sessionLength = (dials.sessionLength as string) || 'Not specified';
  const tone = (dials.tone as string) || '';
  const themes = safeArray(dials.themes as string[]);

  let md = `# ${adventure.adventure_name}\n\n`;
  md += `*Daggerheart Adventure - ${getTierDescription(partyTier)}*\n\n`;

  // Adventure Overview
  md += `## Adventure Overview\n\n`;
  if (outline?.summary) {
    md += `${outline.summary}\n\n`;
  } else {
    md += `An adventure awaits...\n\n`;
  }

  // Party Configuration
  md += `## Party Configuration\n\n`;
  md += `- **Players:** ${partySize}\n`;
  md += `- **Tier:** ${partyTier} (${getTierDescription(partyTier)})\n`;
  md += `- **Session Length:** ${sessionLength}\n`;
  if (tone) {
    md += `- **Tone:** ${tone}\n`;
  }
  if (themes.length > 0) {
    md += `- **Themes:** ${themes.join(', ')}\n`;
  }
  md += `\n`;

  // Scene Summary
  if (outline?.scenes && outline.scenes.length > 0) {
    md += `## Scene Summary\n\n`;
    for (const scene of outline.scenes) {
      const brief = scene as SceneBrief;
      md += `${brief.sceneNumber}. **${brief.title}** - ${brief.description || 'No description'}\n`;
    }
    md += `\n`;
  }

  // Footer
  md += `---\n\n`;
  md += `*Exported from Dagger-App on ${new Date().toLocaleDateString()}*\n`;

  return { path: 'adventure.md', content: md };
}

/**
 * Generate frame.md - Frame details, themes, lore
 */
function generateFrameMd(frame: SelectedFrame): GeneratedFile {
  const name = frame.name || 'Untitled Frame';
  const description = frame.description || '';

  let themes: string[] = [];
  let lore = '';
  let typicalAdversaries: string[] = [];

  if (isCustomFrame(frame)) {
    themes = safeArray(frame.themes);
    lore = frame.lore || '';
    typicalAdversaries = safeArray(frame.typicalAdversaries);
  } else {
    const dbFrame = frame as DaggerheartFrame;
    themes = safeArray(dbFrame.themes);
    lore = dbFrame.lore || '';
    typicalAdversaries = safeArray(dbFrame.typical_adversaries);
  }

  let md = `# ${name}\n\n`;

  if (description) {
    md += `${description}\n\n`;
  }

  if (themes.length > 0) {
    md += `## Themes\n\n`;
    for (const theme of themes) {
      md += `- ${theme}\n`;
    }
    md += `\n`;
  }

  if (typicalAdversaries.length > 0) {
    md += `## Typical Adversaries\n\n`;
    for (const adv of typicalAdversaries) {
      md += `- ${adv}\n`;
    }
    md += `\n`;
  }

  if (lore) {
    md += `## Lore\n\n`;
    md += `${lore}\n`;
  }

  return { path: 'frame.md', content: md };
}

/**
 * Generate a single scene markdown file
 */
function generateSceneMd(scene: Scene, sceneNumber: number): GeneratedFile | null {
  const draft = scene.draft as SceneDraft | null;
  if (!draft) {
    return null;
  }

  const brief = scene.brief as SceneBrief | null;
  const title = draft.title || brief?.title || `Scene ${sceneNumber}`;
  const slug = slugify(title);
  const filename = `scenes/${padNumber(sceneNumber)}-${slug}.md`;

  let md = `# Scene ${sceneNumber}: ${title}\n\n`;

  // Introduction
  if (draft.introduction) {
    md += `## Introduction\n\n`;
    md += `${draft.introduction}\n\n`;
  }

  // Key Moments
  const keyMoments = safeArray(draft.keyMoments);
  if (keyMoments.length > 0) {
    md += `## Key Moments\n\n`;
    for (const moment of keyMoments) {
      md += `### ${moment.title}\n\n`;
      md += `${moment.description}\n\n`;
    }
  }

  // Resolution
  if (draft.resolution) {
    md += `## Resolution\n\n`;
    md += `${draft.resolution}\n\n`;
  }

  // GM Notes Section
  const hasGmNotes = draft.tierGuidance || draft.toneNotes || draft.combatNotes ||
                     draft.environmentDetails || draft.discoveryOpportunities?.length;

  if (hasGmNotes) {
    md += `---\n\n`;
    md += `## GM Notes\n\n`;

    if (draft.tierGuidance) {
      md += `### Tier Guidance\n\n`;
      md += `${draft.tierGuidance}\n\n`;
    }

    if (draft.toneNotes) {
      md += `### Tone Notes\n\n`;
      md += `${draft.toneNotes}\n\n`;
    }

    if (draft.combatNotes) {
      md += `### Combat Notes\n\n`;
      md += `${draft.combatNotes}\n\n`;
    }

    if (draft.environmentDetails) {
      md += `### Environment Details\n\n`;
      md += `${draft.environmentDetails}\n\n`;
    }

    const discoveries = safeArray(draft.discoveryOpportunities);
    if (discoveries.length > 0) {
      md += `### Discovery Opportunities\n\n`;
      for (const discovery of discoveries) {
        md += `- ${discovery}\n`;
      }
      md += `\n`;
    }
  }

  return { path: filename, content: md };
}

/**
 * Generate npcs.md - NPC compendium grouped by role
 */
function generateNpcsMd(npcs: (NPC | CompiledNPC)[]): GeneratedFile {
  const roleOrder: NPCRole[] = ['ally', 'quest-giver', 'neutral', 'antagonist', 'bystander'];
  const roleLabels: Record<NPCRole, string> = {
    'ally': 'Allies',
    'quest-giver': 'Quest Givers',
    'neutral': 'Neutral Characters',
    'antagonist': 'Antagonists',
    'bystander': 'Bystanders',
  };

  // Group NPCs by role
  const byRole = new Map<NPCRole, (NPC | CompiledNPC)[]>();
  for (const npc of npcs) {
    const role = npc.role || 'neutral';
    if (!byRole.has(role)) {
      byRole.set(role, []);
    }
    byRole.get(role)!.push(npc);
  }

  let md = `# NPC Compendium\n\n`;

  for (const role of roleOrder) {
    const roleNpcs = byRole.get(role);
    if (!roleNpcs || roleNpcs.length === 0) continue;

    md += `## ${roleLabels[role]}\n\n`;

    for (const npc of roleNpcs) {
      md += `### ${npc.name}\n\n`;
      md += `**Role:** ${capitalize(npc.role)}\n\n`;

      if (npc.description) {
        md += `${npc.description}\n\n`;
      }

      if (npc.appearance) {
        md += `**Appearance:** ${npc.appearance}\n\n`;
      }

      if (npc.personality) {
        md += `**Personality:** ${npc.personality}\n\n`;
      }

      const motivations = safeArray(npc.motivations);
      if (motivations.length > 0) {
        md += `**Motivations:**\n`;
        for (const m of motivations) {
          md += `- ${m}\n`;
        }
        md += `\n`;
      }

      const connections = safeArray(npc.connections);
      if (connections.length > 0) {
        md += `**Connections:**\n`;
        for (const c of connections) {
          md += `- ${c}\n`;
        }
        md += `\n`;
      }

      const scenes = safeArray(npc.sceneAppearances);
      if (scenes.length > 0) {
        md += `**Appears in:** ${scenes.map(s => `Scene ${s.replace('scene-', '')}`).join(', ')}\n\n`;
      }

      md += `---\n\n`;
    }
  }

  return { path: 'npcs.md', content: md };
}

/**
 * Generate adversaries.md - Stat blocks with features
 */
function generateAdversariesMd(adversaries: SelectedAdversary[]): GeneratedFile {
  let md = `# Adversaries\n\n`;

  for (const selected of adversaries) {
    const adv = selected.adversary;
    const quantity = selected.quantity || 1;

    md += `## ${adv.name}`;
    if (quantity > 1) {
      md += ` (x${quantity})`;
    }
    md += `\n\n`;

    md += `*${adv.type || 'Unknown'} - Tier ${adv.tier} - ${adv.difficulty || 'Standard'}*\n\n`;

    if (adv.description) {
      md += `${adv.description}\n\n`;
    }

    // Stat block table
    md += `| HP | Stress | Thresholds |\n`;
    md += `|----|--------|------------|\n`;
    md += `| ${adv.hp || '-'} | ${adv.stress || '-'} | ${adv.thresholds || '-'} |\n\n`;

    // Attack info
    if (adv.atk || adv.weapon || adv.dmg) {
      md += `**Attack:** ${adv.atk || '-'} | `;
      md += `**Weapon:** ${adv.weapon || '-'} | `;
      md += `**Range:** ${adv.range || '-'} | `;
      md += `**Damage:** ${adv.dmg || '-'}\n\n`;
    }

    // Motives & Tactics
    const motives = safeArray(adv.motives_tactics);
    if (motives.length > 0) {
      md += `### Motives & Tactics\n\n`;
      for (const m of motives) {
        md += `- ${m}\n`;
      }
      md += `\n`;
    }

    // Features
    const features = safeArray(adv.features as Array<{ name: string; description: string }>);
    if (features.length > 0) {
      md += `### Features\n\n`;
      for (const f of features) {
        md += `**${f.name}:** ${f.description}\n\n`;
      }
    }

    if (selected.notes) {
      md += `### GM Notes\n\n`;
      md += `${selected.notes}\n\n`;
    }

    md += `---\n\n`;
  }

  return { path: 'adversaries.md', content: md };
}

/**
 * Generate items.md - Items grouped by category
 */
function generateItemsMd(items: SelectedItem[]): GeneratedFile {
  const categoryOrder = ['weapon', 'armor', 'item', 'consumable'] as const;
  const categoryLabels: Record<string, string> = {
    'weapon': 'Weapons',
    'armor': 'Armor',
    'item': 'Items',
    'consumable': 'Consumables',
  };

  // Group items by category
  const byCategory = new Map<string, SelectedItem[]>();
  for (const selected of items) {
    const category = selected.item.category;
    if (!byCategory.has(category)) {
      byCategory.set(category, []);
    }
    byCategory.get(category)!.push(selected);
  }

  let md = `# Items & Rewards\n\n`;

  for (const category of categoryOrder) {
    const categoryItems = byCategory.get(category);
    if (!categoryItems || categoryItems.length === 0) continue;

    md += `## ${categoryLabels[category]}\n\n`;

    for (const selected of categoryItems) {
      const item = selected.item;
      const data = item.data;
      const quantity = selected.quantity || 1;

      md += `### ${data.name}`;
      if (quantity > 1) {
        md += ` (x${quantity})`;
      }
      md += `\n\n`;

      // Category-specific formatting
      if (item.category === 'weapon') {
        const weapon = data as { trait?: string; range?: string; damage_dice?: string; burden?: string; tier?: number; feature?: string };
        if (weapon.tier) {
          md += `*Tier ${weapon.tier}*\n\n`;
        }
        if (weapon.trait || weapon.range || weapon.damage_dice) {
          md += `**Trait:** ${weapon.trait || '-'} | `;
          md += `**Range:** ${weapon.range || '-'} | `;
          md += `**Damage:** ${weapon.damage_dice || '-'}\n`;
        }
        if (weapon.burden) {
          md += `**Burden:** ${weapon.burden}\n`;
        }
        if (weapon.feature) {
          md += `**Feature:** ${weapon.feature}\n`;
        }
        md += `\n`;
      } else if (item.category === 'armor') {
        const armor = data as { base_score?: number; base_thresholds?: string; tier?: number; feature?: string };
        if (armor.tier) {
          md += `*Tier ${armor.tier}*\n\n`;
        }
        if (armor.base_score || armor.base_thresholds) {
          md += `**Base Score:** ${armor.base_score || '-'} | `;
          md += `**Thresholds:** ${armor.base_thresholds || '-'}\n`;
        }
        if (armor.feature) {
          md += `**Feature:** ${armor.feature}\n`;
        }
        md += `\n`;
      } else if (item.category === 'consumable') {
        const consumable = data as { uses?: number; description?: string };
        if (consumable.uses) {
          md += `*Uses: ${consumable.uses}*\n\n`;
        }
        if (consumable.description) {
          md += `${consumable.description}\n\n`;
        }
      } else {
        // Generic item
        const generic = data as { description?: string };
        if (generic.description) {
          md += `${generic.description}\n\n`;
        }
      }

      if (selected.notes) {
        md += `**Notes:** ${selected.notes}\n\n`;
      }

      md += `---\n\n`;
    }
  }

  return { path: 'items.md', content: md };
}

/**
 * Generate echoes.md - GM tools organized by category
 */
function generateEchoesMd(echoes: Echo[]): GeneratedFile {
  const categoryOrder: EchoCategory[] = ['complications', 'rumors', 'discoveries', 'intrusions', 'wonders'];
  const categoryLabels: Record<EchoCategory, string> = {
    'complications': 'Complications',
    'rumors': 'Rumors',
    'discoveries': 'Discoveries',
    'intrusions': 'Intrusions',
    'wonders': 'Wonders',
  };

  // Group echoes by category
  const byCategory = new Map<EchoCategory, Echo[]>();
  for (const echo of echoes) {
    const category = echo.category;
    if (!byCategory.has(category)) {
      byCategory.set(category, []);
    }
    byCategory.get(category)!.push(echo);
  }

  let md = `# Echoes (GM Creativity Tools)\n\n`;

  for (const category of categoryOrder) {
    const categoryEchoes = byCategory.get(category);
    if (!categoryEchoes || categoryEchoes.length === 0) continue;

    md += `## ${categoryLabels[category]}\n\n`;

    for (const echo of categoryEchoes) {
      md += `### ${echo.title}\n\n`;
      md += `${echo.content}\n\n`;
    }
  }

  return { path: 'echoes.md', content: md };
}

// =============================================================================
// Main Handler
// =============================================================================

/**
 * Generate markdown files for adventure export
 */
export async function generateMarkdownHandler(
  input: GenerateMarkdownInput
): Promise<GenerateMarkdownOutput> {
  const { adventure } = input;
  const files: GeneratedFile[] = [];

  // Always generate adventure.md
  files.push(generateAdventureMd(adventure));

  // Generate frame.md if frame exists
  if (adventure.selected_frame) {
    files.push(generateFrameMd(adventure.selected_frame as SelectedFrame));
  }

  // Generate scene files
  const scenes = safeArray(adventure.scenes as unknown as Scene[]);
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    if (!scene) continue;

    const sceneNumber = scene.brief?.sceneNumber || (i + 1);
    const sceneMd = generateSceneMd(scene, sceneNumber);
    if (sceneMd) {
      files.push(sceneMd);
    }
  }

  // Generate npcs.md if NPCs exist
  const npcs = safeArray(adventure.npcs as unknown as (NPC | CompiledNPC)[]);
  if (npcs.length > 0) {
    files.push(generateNpcsMd(npcs));
  }

  // Generate adversaries.md if adversaries exist
  const adversaries = safeArray(adventure.selected_adversaries as unknown as SelectedAdversary[]);
  if (adversaries.length > 0) {
    files.push(generateAdversariesMd(adversaries));
  }

  // Generate items.md if items exist
  const items = safeArray(adventure.selected_items as unknown as SelectedItem[]);
  if (items.length > 0) {
    files.push(generateItemsMd(items));
  }

  // Generate echoes.md if echoes exist
  const echoes = safeArray(adventure.echoes as unknown as Echo[]);
  if (echoes.length > 0) {
    files.push(generateEchoesMd(echoes));
  }

  return {
    files,
    adventureName: adventure.adventure_name,
    generatedAt: new Date().toISOString(),
  };
}
