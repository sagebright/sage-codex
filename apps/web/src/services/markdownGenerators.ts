/**
 * Markdown Generators for Adventure Export
 *
 * Functions to convert adventure content into markdown format for export.
 */

import type { ExportData } from './adventureService';

export function generateReadme(data: ExportData): string {
  return `# ${data.adventureName || 'Adventure'}

*Exported from Dagger-App*

## Contents

- \`frame.md\` - Adventure framework and setting
- \`outline.md\` - Scene outline and structure
- \`scenes/\` - Individual scene details
- \`npcs.md\` - Non-player characters
- \`adversaries.md\` - Enemy stat blocks
- \`items.md\` - Rewards and equipment
- \`echoes.md\` - GM creativity tools

---

*Generated on ${new Date().toLocaleDateString()}*
`;
}

export function generateFrameMarkdown(frame: Record<string, unknown>): string {
  const name = (frame.name as string) || 'Frame';
  const description = (frame.description as string) || '';
  const themes = (frame.themes as string[]) || [];

  let md = `# ${name}\n\n`;

  if (description) {
    md += `${description}\n\n`;
  }

  if (themes.length > 0) {
    md += `## Themes\n\n`;
    themes.forEach((theme) => {
      md += `- ${theme}\n`;
    });
  }

  return md;
}

export function generateOutlineMarkdown(outline: Record<string, unknown>): string {
  const title = (outline.title as string) || 'Adventure Outline';
  const scenes = (outline.scenes as Array<Record<string, unknown>>) || [];

  let md = `# ${title}\n\n`;

  if (scenes.length > 0) {
    md += `## Scenes\n\n`;
    scenes.forEach((scene, index) => {
      const sceneTitle = (scene.title as string) || `Scene ${index + 1}`;
      const summary = (scene.summary as string) || '';
      md += `### ${index + 1}. ${sceneTitle}\n\n${summary}\n\n`;
    });
  }

  return md;
}

export function generateSceneMarkdown(scene: Record<string, unknown>, sceneNumber: number): string {
  const title = (scene.title as string) || `Scene ${sceneNumber}`;
  const content = (scene.content as string) || '';

  return `# Scene ${sceneNumber}: ${title}\n\n${content}\n`;
}

export function generateNPCsMarkdown(npcs: Array<Record<string, unknown>>): string {
  let md = `# NPCs\n\n`;

  npcs.forEach((npc) => {
    const name = (npc.name as string) || 'Unknown NPC';
    const role = (npc.role as string) || 'ally';
    const description = (npc.description as string) || '';
    const personality = (npc.personality as string) || '';

    md += `## ${name} (${role})\n\n`;
    if (description) md += `${description}\n\n`;
    if (personality) md += `**Personality:** ${personality}\n\n`;
    md += `---\n\n`;
  });

  return md;
}

export function generateAdversariesMarkdown(adversaries: Array<Record<string, unknown>>): string {
  let md = `# Adversaries\n\n`;

  adversaries.forEach((adv) => {
    const name = (adv.name as string) || 'Unknown';
    const tier = (adv.tier as number) || 1;
    const description = (adv.description as string) || '';

    md += `## ${name} (Tier ${tier})\n\n`;
    if (description) md += `${description}\n\n`;
    md += `---\n\n`;
  });

  return md;
}

export function generateItemsMarkdown(items: Array<Record<string, unknown>>): string {
  let md = `# Items\n\n`;

  items.forEach((item) => {
    const name = (item.name as string) || 'Unknown Item';
    const description = (item.description as string) || '';

    md += `## ${name}\n\n`;
    if (description) md += `${description}\n\n`;
    md += `---\n\n`;
  });

  return md;
}

export function generateEchoesMarkdown(echoes: Array<Record<string, unknown>>): string {
  let md = `# Echoes (GM Creativity Tools)\n\n`;

  const categories = ['complications', 'rumors', 'discoveries', 'intrusions', 'wonders'];
  categories.forEach((category) => {
    const categoryEchoes = echoes.filter((e) => e.category === category);
    if (categoryEchoes.length > 0) {
      md += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
      categoryEchoes.forEach((echo) => {
        const title = (echo.title as string) || 'Untitled';
        const content = (echo.content as string) || '';
        md += `### ${title}\n\n${content}\n\n`;
      });
    }
  });

  return md;
}
