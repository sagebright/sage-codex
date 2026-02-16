---
name: generate-npcs
description: Generate Daggerheart narrative NPCs using Homebrew Kit creation order, Sullivan Torch narrative voice, and structural validation. Auto-activates when user mentions creating, generating, or designing NPCs or characters.
activation:
  - user mentions creating or generating NPCs
  - user mentions designing a character or NPC
  - user says /generate-npcs
  - user asks to add friendly NPCs to the reference table
  - user asks to populate the daggerheart_npcs table
---

# Generate Daggerheart NPCs

Create narratively rich, story-driven NPCs for the `daggerheart_npcs` table. These are **reference NPCs** -- allies, quest-givers, bystanders, and narrative characters with optional lightweight mechanical features. Follows the Daggerheart Homebrew Kit creation philosophy with Sullivan Torch narrative voice.

## Reference NPCs vs Adventure NPCs

This skill generates **reference NPCs** stored in `daggerheart_npcs`. These are reusable characters independent of any specific adventure.

**Reference NPCs** (`daggerheart_npcs` table):
- Standalone characters in the content database
- Tier-tagged for filtering by adventure difficulty
- Role-tagged for narrative function
- Optional mechanical features (trigger/effect/choice)
- Embedded for semantic search
- Created by this skill

**Adventure NPCs** (`NPC` / `CompiledNPC` in `content.ts`):
- Extracted from scene drafts during Inscription phase
- Tied to specific adventure scenes via `sceneAppearances`
- Include `extractedFrom` context about which scenes reference them
- Managed by the `compile_npcs` MCP tool
- Not stored in Supabase -- live in adventure state

**Future consideration (out of scope):** A promotion workflow could allow adventure NPCs to be elevated into the reference table after an adventure is complete. This is not part of this skill.

## Creation Order

Execute these steps sequentially. Each step depends on the previous.

### Step 1: Tier + Role

Determine tier (1-4) and role. Tier sets the narrative complexity expectation -- higher-tier NPCs tend to have deeper motivations and more intricate connections. Role determines the character's narrative function in an adventure.

**Roles:**

| Role | Narrative Function | Example |
|------|-------------------|---------|
| ally | Actively helps the party; may join temporarily | A ranger who guides the party through cursed woods |
| neutral | Present in the world; interacts without taking sides | A merchant selling supplies at a crossroads |
| quest-giver | Provides hooks, missions, or information that drives action | An elder who begs the party to recover a stolen relic |
| antagonist | Opposes the party through social/political means (not combat) | A rival noble scheming to discredit the party |
| bystander | Affected by events; creates stakes and consequences | A farmer whose fields are being consumed by blight |

### Step 2: Name

Choose a name that fits the Daggerheart setting. Names should feel grounded but fantastical -- avoid Earth-culture-specific names. The name should hint at ancestry or region without requiring explanation.

### Step 3: Description

Write a 1-2 sentence description capturing who this person is and what makes them narratively interesting. This is the elevator pitch -- what a GM reads to decide whether to use this NPC.

### Step 4: Appearance

Write 2-3 sentences describing physical appearance. Focus on details a GM can convey at the table: silhouette, distinguishing marks, clothing, posture, and sensory details (how they sound, smell, or move). Apply Sullivan Torch voice -- painterly, evocative, specific.

### Step 5: Personality

Write 2-3 sentences describing how this character behaves and interacts. Focus on playable traits -- things a GM can perform at the table: speech patterns, emotional defaults, social habits, nervous tics. Apply Sullivan Torch voice -- make the personality something a GM can inhabit, not just describe.

### Step 6: Motivations

Write 2-4 motivations as a text array. Each motivation is a short phrase or sentence capturing what drives this character. Motivations should create potential tension or hooks for player interaction.

### Step 7: Connections

Write 2-4 connections as a text array. Each connection links the NPC to other characters, factions, locations, or events. Connections should be specific enough to generate story hooks but general enough to fit multiple adventures.

### Step 8: Notable Traits

Write 2-4 notable traits as a text array. These are distinctive quirks, habits, possessions, or abilities that make the NPC memorable and spark GM creativity. Apply Sullivan Torch voice -- each trait should be a gift to the GM, something they can riff on.

### Step 9: Features (Optional)

**Most NPCs should have zero features.** Features are reserved for NPCs whose narrative role requires mechanical interaction -- a healer who can restore HP, a trickster whose lies have game-mechanical consequences, a guardian whose protection has a cost.

If features are warranted, generate 1-2 features (maximum 2) using this pattern:

```json
{
  "name": "Feature Name",
  "trigger": "When [specific narrative/mechanical trigger]...",
  "effect": "...the NPC [mechanical effect with specific values].",
  "choice": "The player may choose to [optional player choice that adds depth]."
}
```

**Feature design rules:**
- `name`: Vivid, specific (e.g., "Grandmother's Remedy", "The Price of Truth")
- `trigger`: Clear condition -- when does this activate? (e.g., "When a PC shares a meal with Thessa...")
- `effect`: Concrete mechanical result with values appropriate to the NPC's tier
- `choice` (optional): A player-facing decision that adds narrative depth to the mechanical interaction

**When to include features:**
- The NPC's narrative role involves a recurring mechanical interaction
- The GM would benefit from structured guidance for the interaction
- The feature creates interesting player choices

**When to skip features:**
- The NPC is purely narrative (most cases)
- The NPC's interesting qualities are already captured in personality/traits
- Adding mechanics would make the NPC feel like an adversary stat block

## Structural Invariants

These rules must hold for every generated NPC:

1. **Tier range:** Tier must be 1, 2, 3, or 4
2. **Valid role:** Role must be one of: ally, neutral, quest-giver, antagonist, bystander
3. **Name uniqueness:** No duplicate of existing NPC name in the database
4. **Description length:** 1-2 sentences
5. **Appearance length:** 2-3 sentences
6. **Personality length:** 2-3 sentences
7. **Motivations count:** 2-4 items
8. **Connections count:** 2-4 items
9. **Notable traits count:** 2-4 items
10. **Features limit:** 0-2 features; each feature must have name, trigger, and effect fields; choice is optional
11. **Source book:** Must be set to `'Generated'`

## Sullivan Torch Integration

Pull the Sullivan Torch narrative profile at runtime to inject voice into generated prose.

### SQL Query

```sql
SELECT personality, character, signature
FROM sage_profiles
WHERE slug = 'sullivan-torch';
```

### Profile Structure

- `personality` (jsonb): Humor, Pacing, Warmth, Guidance, Vitality, Authority, Curiosity, Formality, Elaboration, Adaptiveness, Tension Style -- each with label and score
- `character` (jsonb): Description, Expertise, Voice Snippet, Meta-Instructions, Narrative Texture, Priorities & Values, Use Case
- `signature` (jsonb): key_phrases, anti_patterns, verbal_texture, conceptual_anchors, conversational_moves, rhetorical_structure

### Voice Application

Apply Sullivan Torch voice to these fields:

- **appearance**: Painterly and sensory -- describe NPCs the way a novelist would, with details that make a GM want to perform the character ("Her hands are stained indigo from years of dyeing cloth, and she smells faintly of juniper")
- **personality**: Playable and performable -- give the GM something they can inhabit at the table ("She speaks in half-finished sentences, trailing off when she remembers something painful, then snapping back with fierce warmth")
- **notable_traits**: Spark creativity -- each trait should be a gift to the GM, something that generates scenes and moments ("Carries a leather satchel full of letters she's written to people who died before she could send them")

### Key Voice Principles (from Meta-Instructions)

- Start from specific, vivid examples -- build toward principles
- Use humor as a bridge to depth
- Frame storytelling as an act of service
- Never gatekeep; celebrate the questioner's instincts
- Reference broadly (improv, mythology, psychology)
- Enthusiastic and generous, never condescending

## Validation Checklist

Before presenting the NPC for review, verify all 11 items:

| # | Check | Rule |
|---|-------|------|
| 1 | Tier range | 1, 2, 3, or 4 |
| 2 | Valid role | One of: ally, neutral, quest-giver, antagonist, bystander |
| 3 | Name uniqueness | No duplicate in `daggerheart_npcs` table |
| 4 | Description length | 1-2 sentences |
| 5 | Appearance length | 2-3 sentences |
| 6 | Personality length | 2-3 sentences |
| 7 | Motivations count | 2-4 items |
| 8 | Connections count | 2-4 items |
| 9 | Notable traits count | 2-4 items |
| 10 | Feature constraints | 0-2 features; each has name + trigger + effect; choice optional |
| 11 | source_book | Set to `'Generated'` |

## Human Review Protocol

After generation and validation, present the NPC for human review.

### Present

1. **Stat block** as formatted display:
   - Name, tier, role
   - Description
   - Appearance
   - Personality
   - Motivations (bulleted list)
   - Connections (bulleted list)
   - Notable Traits (bulleted list)
   - Features (if any -- formatted with name, trigger, effect, choice)
2. **Validation checklist** results (all 11 items, pass/fail)

### Options

- **Approve** -- proceed to insert workflow
- **Request revision** -- specify which fields to revise; re-run validation after changes
- **Reject** -- discard and optionally restart with different parameters

## Insert Workflow

After human approval, insert the NPC into the database.

### Step 1: Compute searchable_text

Concatenate for full-text search:

```
searchable_text = name + ' ' + role + ' ' + description + ' ' + appearance + ' ' + personality + ' ' + motivations.join(' ') + ' ' + connections.join(' ') + ' ' + notable_traits.join(' ')
```

### Step 2: Generate Embedding

Call the `embed` Edge Function to generate the embedding vector:

```sql
-- Via Supabase Edge Function (not direct SQL)
-- POST to: {SUPABASE_URL}/functions/v1/embed
-- Body: { "input": searchable_text }
-- Returns: { "embedding": [float array] }
```

### Step 3: Insert via execute_sql

Use `execute_sql` (not `apply_migration` -- this is content data, not schema):

```sql
INSERT INTO daggerheart_npcs (
  name, tier, role, description,
  appearance, personality,
  motivations, connections, notable_traits,
  features,
  searchable_text, embedding, source_book
) VALUES (
  'NPC NAME',
  1,                                    -- tier
  'ally',                               -- role
  'Description text...',                -- description
  'Appearance text...',                 -- appearance
  'Personality text...',                -- personality
  ARRAY['Motivation 1', 'Motivation 2'],
  ARRAY['Connection 1', 'Connection 2'],
  ARRAY['Trait 1', 'Trait 2'],
  ARRAY['{"name":"Feature Name","trigger":"When...","effect":"...","choice":"..."}'::jsonb],
  'computed searchable text...',        -- searchable_text
  '[embedding vector]'::vector,         -- embedding
  'Generated'                           -- source_book
);
```

**Note:** If the NPC has no features, use `'{}'::jsonb[]` for the features column (empty array, matching the table default).

## Exemplar Query

Pull a real NPC as a structural reference (once the table is populated):

```sql
SELECT name, tier, role, description, appearance, personality,
       motivations, connections, notable_traits, features
FROM daggerheart_npcs
WHERE source_book = 'Generated'
ORDER BY created_at DESC
LIMIT 1;
```

## Name Uniqueness Check

Before finalizing, verify the name is not already in use:

```sql
SELECT COUNT(*) FROM daggerheart_npcs WHERE LOWER(name) = LOWER('Proposed Name');
```
