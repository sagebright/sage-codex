---
name: generate-items
description: Generate Daggerheart items, weapons, armor, and consumables using Homebrew Kit creation order, Improvised Statistics, Sullivan Torch narrative voice, and structural validation. Unified skill with 4 branching paths. Auto-activates when user mentions creating, generating, or designing equipment.
activation:
  - user mentions creating or generating items
  - user mentions creating or generating weapons
  - user mentions creating or generating armor
  - user mentions creating or generating consumables
  - user mentions designing equipment or loot
  - user says /generate-items
  - user asks to create gear, loot, or equipment for Daggerheart
---

# Generate Daggerheart Items

Create mechanically sound, narratively rich equipment for Daggerheart. A unified skill with 4 branching paths targeting `daggerheart_items`, `daggerheart_weapons`, `daggerheart_armor`, and `daggerheart_consumables`. Follows the Daggerheart Homebrew Kit v1.0 (pp 20-24) creation order with Sullivan Torch narrative voice.

## Step 0: Item Type Selection

Before any creation steps, determine which equipment type the user wants to generate. Route to the appropriate path.

| Choice | Path | Target Table | Reference |
|--------|------|-------------|-----------|
| **Item** | Path A | `daggerheart_items` | General equipment, tools, narrative items |
| **Weapon** | Path B | `daggerheart_weapons` | Damage-dealing arms with trait, range, burden, features |
| **Armor** | Path C | `daggerheart_armor` | Protective gear with thresholds, score, features |
| **Consumable** | Path D | `daggerheart_consumables` | Single/limited-use items (potions, scrolls, bombs) |

**Routing heuristics:**
- Mentions of damage, attack, melee, ranged, blade, bow, staff (combat) --> Path B (Weapon)
- Mentions of protection, defense, shield, threshold, armor score --> Path C (Armor)
- Mentions of potion, scroll, bomb, salve, one-use, limited use --> Path D (Consumable)
- General gear, tools, trinkets, quest items, narrative items --> Path A (Item)
- If ambiguous, ask the user to clarify before proceeding

---

## Path A: Generic Items

Target table: `daggerheart_items`

Generic items are narrative and utility equipment -- tools, trinkets, quest objects, and miscellaneous gear that do not have weapon or armor stat blocks.

### Creation Order

#### A1: Name

Choose a concise, evocative name for the item.

**Constraints:** 1-5 words. Must be unique across existing `daggerheart_items` names.

**Examples:** "Lantern of Distant Shores", "Cartographer's Folding Table", "Resonance Tuning Fork"

#### A2: Item Type

Classify the item into one category.

| Item Type | Description | Examples |
|-----------|-------------|----------|
| Tool | Functional equipment that aids a specific task | Thieves' tools, healer's kit, climbing gear |
| Trinket | Narrative or sentimental objects with minor effect | Lucky coin, family heirloom, carved figurine |
| Quest Item | Story-critical objects tied to adventure progression | Ancient key, sealed letter, prophecy shard |
| Wondrous | Magical or extraordinary items with unique effects | Bag of holding, ever-burning torch |

#### A3: Description

Write a 2-4 sentence description covering what the item is, what it does, and any narrative flavor. Apply Sullivan Torch voice.

**Guidance:** Generic items lean narrative -- describe how the item feels, what it looks like, and how a character might use it at the table. Avoid mechanical jargon unless the item has a specific game effect.

### Path A Structural Invariants

1. **Name uniqueness:** No duplicate of existing item name in DB
2. **Name length:** 1-5 words
3. **Item type:** One of Tool, Trinket, Quest Item, Wondrous
4. **Description length:** 2-4 sentences
5. **source_book:** Set to `'Generated'`

### Path A Validation Checklist

| # | Check | Rule |
|---|-------|------|
| 1 | Name uniqueness | No duplicate in `daggerheart_items` |
| 2 | Name length | 1-5 words |
| 3 | Item type valid | One of: Tool, Trinket, Quest Item, Wondrous |
| 4 | Description length | 2-4 sentences |
| 5 | source_book | Set to `'Generated'` |
| 6 | Sullivan Torch voice | Applied to description |

### Path A searchable_text

```
searchable_text = name + ' ' + item_type + ' ' + description
```

### Path A Insert SQL

```sql
INSERT INTO daggerheart_items (
  name, item_type, description,
  searchable_text, embedding, source_book
) VALUES (
  'ITEM NAME',
  'Tool',                           -- item_type
  'Description text...',            -- description
  'computed searchable text...',    -- searchable_text
  '[embedding vector]'::vector,     -- embedding
  'Generated'                       -- source_book
);
```

---

## Path B: Weapons

Target table: `daggerheart_weapons`

Weapons are damage-dealing arms with mechanical stat blocks. Follows Homebrew Kit pp 20-22 for creation order, categories, and damage scaling.

### Weapon Damage Scaling Table (Homebrew Kit pp 20-22)

Base damage values before feature adjustments:

| Tier | Melee Close (1H) | Melee Close (2H) | Melee Reach (2H) | Ranged Far (2H) | Ranged Very Far (2H) |
|------|-------------------|-------------------|-------------------|------------------|----------------------|
| 1 | d8 | d10 | d8 | d8 | d6 |
| 2 | d8+2 | d10+2 | d8+1 | d8+1 | d6+2 |
| 3 | d10+2 | d12+2 | d10+1 | d10+1 | d8+2 |
| 4 | d12+3 | 2d8+2 | d12+1 | d12+1 | d10+2 |

**Burden note:** One-handed (1H) weapons are lighter; two-handed (2H) weapons deal more damage but occupy both hands.

### Creation Order

#### B1: Tier

Select tier (1-4). This determines the damage baseline from the scaling table.

#### B2: Weapon Category

Choose a category that defines the weapon's identity:

| Category | Examples |
|----------|----------|
| Blade | Sword, dagger, scimitar, greatsword |
| Bludgeon | Mace, hammer, club, flail |
| Heavy Blade | Claymore, zweihander, executioner's blade |
| Polearm | Spear, halberd, glaive, pike |
| Bow | Shortbow, longbow, greatbow |
| Crossbow | Hand crossbow, heavy crossbow |
| Whip | Whip, chain whip, lash |
| Unarmed | Gauntlet, claw, knuckle |
| Staff | Quarterstaff, arcane focus staff |

#### B3: Trait

Assign a primary trait that describes how the weapon functions mechanically:

| Trait | Meaning |
|-------|---------|
| Finesse | Can use Agility instead of Strength for attack rolls |
| Mighty | Uses Strength for attack rolls |
| Arcane | Can use Knowledge for attack rolls |
| Swift | Can use Agility for attack rolls |

#### B4: Range

Determine the weapon's effective range:

| Range | Description |
|-------|-------------|
| Melee | Adjacent targets only |
| Close | Within short range (melee + a few paces) |
| Far | Medium distance (bow range) |
| Very Far | Long distance (extreme range, crossbow/sniper) |
| Reach | Extended melee (polearms, whips -- melee but with spacing) |

#### B5: Burden

Set the handling requirement:

| Burden | Description |
|--------|-------------|
| One-handed | Can be wielded in one hand, allows shield or dual wield |
| Two-handed | Requires both hands, generally higher damage |

#### B6: Base Damage

Look up the base damage from the Weapon Damage Scaling Table using tier + range + burden combination. This is the starting damage before feature adjustments.

#### B7: Features (Optional)

Add 0-2 weapon features. Features modify the weapon's behavior. Positive features reduce base damage; negative features increase base damage.

**Positive Features (reduce damage by one step):**

| Feature | Effect |
|---------|--------|
| Brutal | On a critical success, deal maximum damage |
| Burning | Deals fire damage; can ignite flammable targets |
| Deadly | +1d4 damage on a critical success |
| Keen | Critical success range expanded (natural 19-20) |
| Returning | Thrown weapon returns to wielder after attack |
| Versatile | Can be used one-handed or two-handed (damage adjusts) |

**Negative Features (increase damage by one step):**

| Feature | Effect |
|---------|--------|
| Cumbersome | Disadvantage on attacks if you moved this turn |
| Fragile | On a critical failure, weapon breaks until repaired |
| Slow | Cannot be used for opportunity attacks |
| Unwieldy | -1 to attack rolls |

**Damage Step Adjustments:**
- Each positive feature: reduce damage die by one step (e.g., d10 --> d8)
- Each negative feature: increase damage die by one step (e.g., d8 --> d10)
- Damage die progression: d4 < d6 < d8 < d10 < d12 < 2d6 < 2d8

**Feature Balance Rules:**
- Maximum 2 features per weapon
- If 2 positive features: damage reduced by two steps
- If 1 positive + 1 negative: damage unchanged (they cancel)
- If 2 negative features: damage increased by two steps (powerful but costly)

#### B8: Name

Choose a concise, evocative weapon name. Apply Sullivan Torch voice.

**Constraints:** 1-5 words. Must be unique across existing `daggerheart_weapons` names.

**Examples:** "Thornveil Longbow", "Crucible Hammer", "Whisperpoint Rapier"

### Path B Structural Invariants

1. **Name uniqueness:** No duplicate of existing weapon name in DB
2. **Name length:** 1-5 words
3. **Tier range:** Integer 1-4
4. **Weapon category:** One of the listed categories
5. **Trait valid:** One of Finesse, Mighty, Arcane, Swift
6. **Range valid:** One of Melee, Close, Far, Very Far, Reach
7. **Burden valid:** One of One-handed, Two-handed
8. **Damage alignment:** Base damage matches Weapon Damage Scaling Table for tier/range/burden
9. **Feature count:** 0-2 features
10. **Feature balance:** Positive features reduce damage, negative features increase damage by the correct number of steps
11. **source_book:** Set to `'Generated'`

### Path B Validation Checklist

| # | Check | Rule |
|---|-------|------|
| 1 | Name uniqueness | No duplicate in `daggerheart_weapons` |
| 2 | Name length | 1-5 words |
| 3 | Tier range | Integer 1-4 |
| 4 | Weapon category | Valid category from list |
| 5 | Trait valid | One of: Finesse, Mighty, Arcane, Swift |
| 6 | Range valid | One of: Melee, Close, Far, Very Far, Reach |
| 7 | Burden valid | One of: One-handed, Two-handed |
| 8 | Damage scaling | Matches Weapon Damage Scaling Table for tier + range + burden |
| 9 | Feature count | 0-2 features |
| 10 | Feature balance | Damage adjusted correctly per positive/negative feature count |
| 11 | source_book | Set to `'Generated'` |
| 12 | Sullivan Torch voice | Applied to name and feature text |

### Path B searchable_text

```
searchable_text = name + ' ' + weapon_category + ' ' + trait + ' ' + range + ' ' + damage + ' ' + (feature || '') + ' ' + burden
```

### Path B Insert SQL

```sql
INSERT INTO daggerheart_weapons (
  name, weapon_category, tier, trait, range, damage, burden, feature,
  searchable_text, embedding, source_book
) VALUES (
  'WEAPON NAME',
  'Blade',                          -- weapon_category
  2,                                -- tier
  'Finesse',                        -- trait
  'Melee',                          -- range
  'd8+2',                           -- damage (from scaling table, adjusted for features)
  'One-handed',                     -- burden
  'Keen: Critical success range expanded (natural 19-20)', -- feature (nullable)
  'computed searchable text...',    -- searchable_text
  '[embedding vector]'::vector,     -- embedding
  'Generated'                       -- source_book
);
```

---

## Path C: Armor

Target table: `daggerheart_armor`

Armor provides damage thresholds and armor score. Follows Homebrew Kit pp 22-23 for creation order, scaling, and feature balance.

### Armor Scaling Table (Homebrew Kit pp 22-23)

| Tier | Low Thresholds (Minor/Major/Severe) | Low Score | Mid Thresholds | Mid Score | High Thresholds | High Score |
|------|-------------------------------------|-----------|----------------|-----------|-----------------|------------|
| 1 | 3/7/13 | 2 | 5/10/16 | 4 | 7/13/19 | 6 |
| 2 | 5/11/17 | 3 | 7/14/21 | 5 | 9/17/25 | 7 |
| 3 | 7/15/21 | 4 | 9/18/26 | 6 | 11/21/31 | 8 |
| 4 | 9/19/27 | 5 | 11/22/33 | 7 | 13/27/40 | 9 |

**Scaling principle:** Higher thresholds mean the wearer shrugs off more damage before taking harm. Higher armor score adds to evasion. The trade-off: high thresholds + high score usually requires a negative feature.

### Creation Order

#### C1: Tier

Select tier (1-4). This determines the baseline thresholds and score from the scaling table.

#### C2: Threshold/Score Selection

Choose a profile from the Armor Scaling Table:

| Profile | Trade-off |
|---------|-----------|
| Low thresholds + Low score | Lightest protection, no feature penalty |
| Mid thresholds + Mid score | Balanced protection, may have a feature |
| High thresholds + High score | Maximum protection, negative feature required |

#### C3: Features (Optional)

Add 0-1 armor features. Armor features are simpler than weapon features.

**Positive Features (reduce thresholds or score by one step):**

| Feature | Effect |
|---------|--------|
| Fortified | +1 to armor score vs. a specific damage type |
| Warded | Advantage on saves against a specific condition |
| Resilient | Once per rest, ignore a Minor threshold hit |

**Negative Features (enable higher thresholds or score):**

| Feature | Effect |
|---------|--------|
| Heavy | Disadvantage on Agility checks |
| Noisy | Disadvantage on stealth rolls |
| Restrictive | -1 to movement speed |
| Cumbersome | Takes an action to don or doff |

**Feature Balance Rules:**
- Maximum 1 feature per armor
- High thresholds + High score **requires** a negative feature (the armor's power comes at a cost)
- Low/Mid profiles may optionally have a positive feature (minor bonus for lighter armor)
- You cannot have a positive feature on a High profile without also having a negative feature

#### C4: Name

Choose a concise, evocative armor name. Apply Sullivan Torch voice.

**Constraints:** 1-5 words. Must be unique across existing `daggerheart_armor` names.

**Examples:** "Rootweave Vestments", "Crucible Plate", "Mistcloak Brigandine"

#### C5: Description (Narrative Only)

Write a 1-2 sentence narrative description for Sullivan Torch flavor. This is not stored in the table but presented during human review for voice verification.

### Path C Structural Invariants

1. **Name uniqueness:** No duplicate of existing armor name in DB
2. **Name length:** 1-5 words
3. **Tier range:** Integer 1-4
4. **Thresholds format:** String matching pattern "Minor/Major/Severe" (e.g., "5/11/17")
5. **Score range:** Integer matching Armor Scaling Table for tier and profile
6. **Threshold/Score alignment:** Values match one of the three profiles (Low/Mid/High) for the selected tier
7. **Feature count:** 0-1 features
8. **High profile constraint:** High thresholds + High score must have a negative feature
9. **source_book:** Set to `'Generated'`

### Path C Validation Checklist

| # | Check | Rule |
|---|-------|------|
| 1 | Name uniqueness | No duplicate in `daggerheart_armor` |
| 2 | Name length | 1-5 words |
| 3 | Tier range | Integer 1-4 |
| 4 | Thresholds format | "Minor/Major/Severe" pattern |
| 5 | Score range | Matches Armor Scaling Table for tier + profile |
| 6 | Threshold/Score alignment | Values from a valid profile row |
| 7 | Feature count | 0-1 features |
| 8 | High profile constraint | High profile requires negative feature |
| 9 | source_book | Set to `'Generated'` |
| 10 | Sullivan Torch voice | Applied to name and feature text |

### Path C searchable_text

```
searchable_text = name + ' ' + 'tier ' + tier + ' ' + base_thresholds + ' score ' + base_score + ' ' + (feature || '')
```

### Path C Insert SQL

```sql
INSERT INTO daggerheart_armor (
  name, tier, base_thresholds, base_score, feature,
  searchable_text, embedding, source_book
) VALUES (
  'ARMOR NAME',
  2,                                -- tier
  '7/14/21',                        -- base_thresholds (Minor/Major/Severe)
  5,                                -- base_score
  'Heavy: Disadvantage on Agility checks', -- feature (nullable)
  'computed searchable text...',    -- searchable_text
  '[embedding vector]'::vector,     -- embedding
  'Generated'                       -- source_book
);
```

---

## Path D: Consumables

Target table: `daggerheart_consumables`

Consumables are limited-use items -- potions, scrolls, bombs, salves, and other expendable equipment. Follows Homebrew Kit p 24 guidance.

### Creation Order

#### D1: Name

Choose a concise, evocative consumable name.

**Constraints:** 1-5 words. Must be unique across existing `daggerheart_consumables` names.

**Examples:** "Vial of Liquid Starlight", "Flashpowder Bomb", "Salve of Mending Roots"

#### D2: Uses

Set the number of uses before the consumable is expended.

| Uses | Guidance |
|------|----------|
| 1 | Powerful single-use effect (potions of major healing, resurrection scrolls) |
| 2 | Strong effect with a second chance (combat elixirs, emergency tools) |
| 3 | Moderate effect, reliable utility (standard potions, alchemical bombs) |
| 4-5 | Minor effect, frequent use (trail rations, torches, minor salves) |

**Hoarding rule:** Consumables are designed to be used, not stockpiled. If a PC accumulates more than 5 of the same consumable, the GM should narratively address the surplus (spoilage, theft, market flooding, etc.). This rule is documented here for GM reference -- it is not enforced mechanically.

#### D3: Description

Write a 2-4 sentence description covering the consumable's effect, usage conditions, and flavor. Apply Sullivan Torch voice.

**Guidance:** Consumable descriptions should make the item feel precious and worth using. Describe the sensory experience of activation (drinking the potion, breaking the seal, throwing the bomb) as well as the mechanical effect.

### Path D Structural Invariants

1. **Name uniqueness:** No duplicate of existing consumable name in DB
2. **Name length:** 1-5 words
3. **Uses range:** Integer 1-5
4. **Description length:** 2-4 sentences
5. **source_book:** Set to `'Generated'`

### Path D Validation Checklist

| # | Check | Rule |
|---|-------|------|
| 1 | Name uniqueness | No duplicate in `daggerheart_consumables` |
| 2 | Name length | 1-5 words |
| 3 | Uses range | Integer 1-5 |
| 4 | Description length | 2-4 sentences |
| 5 | source_book | Set to `'Generated'` |
| 6 | Sullivan Torch voice | Applied to description |

### Path D searchable_text

```
searchable_text = name + ' ' + 'uses ' + uses + ' ' + description
```

### Path D Insert SQL

```sql
INSERT INTO daggerheart_consumables (
  name, description, uses,
  searchable_text, embedding, source_book
) VALUES (
  'CONSUMABLE NAME',
  'Description text...',            -- description
  3,                                -- uses (1-5)
  'computed searchable text...',    -- searchable_text
  '[embedding vector]'::vector,     -- embedding
  'Generated'                       -- source_book
);
```

---

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

### Voice Application by Path

| Path | Fields | Voice Style |
|------|--------|-------------|
| A (Items) | description | Sensory and evocative -- makes the item feel real, tangible, worth picking up |
| B (Weapons) | name, feature text | Visceral and specific -- the name should evoke the weapon's identity; features read like a smith's notes |
| C (Armor) | name, feature text | Grounded and tactile -- the name suggests material and craft; features feel like wearing the armor |
| D (Consumables) | description | Precious and sensory -- describe the moment of use; make the player reluctant to waste it |

### Key Voice Principles (from Meta-Instructions)

- Start from specific, vivid examples -- build toward principles
- Use humor as a bridge to depth
- Frame storytelling as an act of service
- Never gatekeep; celebrate the questioner's instincts
- Reference broadly (improv, mythology, psychology)
- Enthusiastic and generous, never condescending

---

## Human Review Protocol

After generation and validation, present the item for human review. The presentation format varies by path.

### Path A (Items) -- Present

1. **Stat block** as formatted text: name, item_type, description
2. **Validation checklist** results (all 6 items, pass/fail)

### Path B (Weapons) -- Present

1. **Stat block** as formatted text: name, weapon_category, tier, trait, range, damage, burden, feature
2. **Damage derivation** showing: base damage from scaling table, feature adjustments, final damage
3. **Validation checklist** results (all 12 items, pass/fail)

### Path C (Armor) -- Present

1. **Stat block** as formatted text: name, tier, base_thresholds, base_score, feature
2. **Profile selection** showing: which profile (Low/Mid/High) was chosen and why
3. **Validation checklist** results (all 10 items, pass/fail)

### Path D (Consumables) -- Present

1. **Stat block** as formatted text: name, uses, description
2. **Hoarding rule reminder** for GM reference
3. **Validation checklist** results (all 6 items, pass/fail)

### Review Options (All Paths)

- **Approve** -- proceed to insert workflow
- **Request revision** -- specify which fields to revise; re-run validation after changes
- **Reject** -- discard and optionally restart with different parameters

---

## Insert Workflow

After human approval, insert the equipment into the database. The workflow is the same across all paths with path-specific SQL.

### Step 1: Compute searchable_text

Use the path-specific formula from the relevant path section above.

### Step 2: Generate Embedding

Call the `embed` Edge Function to generate the embedding vector:

```sql
-- Via Supabase Edge Function (not direct SQL)
-- POST to: {SUPABASE_URL}/functions/v1/embed
-- Body: { "input": searchable_text }
-- Returns: { "embedding": [float array] }
```

### Step 3: Insert via execute_sql

Use `execute_sql` (not `apply_migration` -- this is content data, not schema). Use the path-specific INSERT SQL from the relevant path section above.

**Critical:** Always set `source_book = 'Generated'` for all paths.

---

## Exemplar Queries

Pull existing items from each table as structural references:

### Items

```sql
SELECT name, item_type, description
FROM daggerheart_items
WHERE source_book IS NOT NULL
ORDER BY created_at DESC
LIMIT 3;
```

### Weapons

```sql
SELECT name, weapon_category, tier, trait, range, damage, burden, feature
FROM daggerheart_weapons
WHERE source_book IS NOT NULL
ORDER BY tier, weapon_category
LIMIT 3;
```

### Armor

```sql
SELECT name, tier, base_thresholds, base_score, feature
FROM daggerheart_armor
WHERE source_book IS NOT NULL
ORDER BY tier
LIMIT 3;
```

### Consumables

```sql
SELECT name, description, uses
FROM daggerheart_consumables
WHERE source_book IS NOT NULL
ORDER BY created_at DESC
LIMIT 3;
```
