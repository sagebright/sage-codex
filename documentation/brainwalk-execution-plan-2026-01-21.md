# Brainwalk Execution Plan

## Overview

This plan addresses 7 initiative areas from the brainwalk summary. Phase 1 focuses on `/create-project` refinements (the foundational leverage point). Subsequent phases are ordered by dependencies and impact.

---

## Phase 1: `/create-project` Depth & Template Creation (Primary)

### 1.1 Template Pipeline Configuration
**Files**: `~/.claude/templates/*/template.yaml`

Templates should declare their pipeline behavior:

```yaml
# Quick templates (functional-spec, bug-report, etc.)
pipeline: direct_to_issues
# create-project → create-issues (skip refine-plan)

# Complex templates (software, dagger-gen)
pipeline: full_refinement
# create-project → refine-plan → create-issues → execute-issue
```

### 1.2 Issue Status Schema
**Files**: `~/.claude/templates/software/GITHUB_INTEGRATION.md`

Add explicit status field to plan items:
- `ready` - Fully specified, execute immediately
- `needs_refinement` - Create with `[REFINE]` prefix + checklist
- `blocked` - Add `blocked` label
- `optional` - Add `nice-to-have` label

Update `/create-project` to assign statuses based on question depth answered.

### 1.3 Depth Modules
**Files**: `~/.claude/templates/software/depth-modules/*.yaml`

Create optional deep-dive modules that activate during relevant phases:
- `auth.yaml` - Authentication patterns (provider, session strategy, authorization)
- `design-system.yaml` - Colors, typography, spacing, icon library
- `libraries.yaml` - Package decisions (forms, state, API client)
- `api-contracts.yaml` - Endpoint specifications
- `state-management.yaml` - Frontend state patterns

Activation flow: After base questions, offer "Quick defaults / Deep dive / Mark for refinement"

### 1.4 `/create-template` Command
**Files**: `~/.claude/commands/create-template.md`

A conversational research process for creating project templates. Templates are "containers with defined expected outputs" - running `/create-project <template>` fills the container with project-specific details.

**Phase 1: Template Identity**
1. Name the template and its domain (e.g., "functional-spec", "event-planning", "book-creation")
2. Define expected output format: markdown docs, GitHub issues, or file scaffolding
3. Declare pipeline: `direct_to_issues` vs `full_refinement`

**Phase 2: Domain Research** (CRITICAL)
4. Claude researches the domain to identify all atomic building blocks
   - Essential components of this project type
   - Questions a domain expert would ask
   - Common variations and edge cases
5. Present findings: "Based on my research, a [domain] typically includes..."

**Phase 3: Component Validation**
6. Together validate which components are:
   - **Always present** (required in all projects of this type)
   - **Sometimes present** (conditional on project specifics)
   - **Optional** (nice-to-have, can be deferred)

**Phase 4: Template Generation**
7. Generate template files to `~/.claude/templates/<id>/`:
   - `template.yaml` - Configuration with phases, dials/branches, outputs
   - `PLANNING_SKILL.md` - Expert persona for this domain
   - Supporting files as needed

**Phase 5: Validation**
8. Test template against 2-3 hypothetical use cases
9. Refine based on gaps discovered

### 1.5 Design Persona Framework
**Files**: `~/.claude/skills/design-personas/SKILL.md`, `~/.claude/design-personas/*.yaml`

Design personas are **skills** (not templates) that constrain how an agent executes design-related work. They are domain-and-audience specific.

> **Key Distinction**: Project templates define *what* we're building; design personas define *how* design work gets executed.

**1.5.1 Design Persona Categories** (11 total)

| Category | Description | Examples |
|----------|-------------|----------|
| Domain | Industry/context | B2B SaaS, TTRPG, e-commerce |
| Audience | Who will use it | Enterprise users, gamers, children |
| Emotional Goals | Feelings to evoke | Trust, excitement, wonder |
| Desired Actions | What users should do | Sign up, explore, purchase |
| Color Strategy | Palette approach | Muted/professional, bold/playful |
| Animation Boundaries | Motion philosophy | Minimal/subtle, expressive |
| Typography Rules | Text hierarchy | Dense data tables, readable prose |
| Layout Conventions | Spatial patterns | Dashboard grids, card layouts |
| Component Vocabulary | UI patterns | Data viz heavy, form-centric |
| Accessibility | WCAG compliance | AA/AAA, keyboard nav, screen reader |
| Brand Voice | Copy and terminology | Formal/casual, technical/friendly |

**1.5.2 Persona Instantiation**

Create persona instances as YAML files in `~/.claude/design-personas/`:
- `b2b-saas.yaml` - Enterprise software (muted, data-dense, AA accessibility)
- `ttrpg.yaml` - Gaming/fantasy (expressive, themed, immersive)
- `youth.yaml` - Youth-oriented (bold, playful, AAA accessibility)

**1.5.3 Integration Points**

1. **During Project Creation**: Auto-assign based on project type + audience
2. **At Issue Level**: Assign via GitHub labels (`design` + `frontend`)

**1.5.4 Implementation**

Single skill with persona selection (may refactor to multiple skills as library grows):
- Skill auto-activates on frontend design work
- Loads active persona from project state or issue assignment
- Enforces constraints during component generation

---

## Phase 2: Hook Debugging & Research

### 2.1 PermissionRequest Hook Investigation
**Issue**: Hook is configured but doesn't fire.

Investigation steps:
1. Test other hook events (PreToolUse, PostToolUse) to isolate issue
2. Check Claude Code version compatibility
3. Review hook event documentation for PermissionRequest triggers
4. Test with minimal reproduction case

### 2.2 Hookify Capabilities Audit
**Files**: `~/.claude/plugins/marketplaces/claude-code-plugins/plugins/hookify/`

Document:
- What events Hookify can intercept
- Rule file format and patterns
- Whether it can solve permission-prompt sound problem
- Create test rule for validation

---

## Phase 3: Remote Claude Infrastructure

### 3.1 Inbound Trigger Architecture
**Mac Mini is already running Claude Code 24/7**

Research options:
1. **File watcher** - Monitor a folder for new files (simplest)
2. **Google Doc API** - Watch specific doc for changes
3. **SMS/Twilio webhook** - Forward texts to local endpoint
4. **n8n/Make workflow** - Cloud automation triggers local script

Recommended MVP: File watcher + Dropbox/iCloud sync
- Paste brainwalk to Notes app on phone
- Syncs to Mac Mini folder
- File watcher triggers Claude Code processing
- Results written to output folder (syncs back)

### 3.2 Scheduled Jobs
**Approach**: Cron + Claude Code CLI

```bash
# Example: Daily morning briefing at 7am
0 7 * * * /path/to/claude-code --prompt "Check GitHub issues, cross-reference calendar, identify top 3 accomplishable items" > /path/to/output/morning-briefing.md
```

Requirements:
- Claude Code CLI invocation pattern
- Output persistence
- Notification mechanism (email via `mail`, SMS via Twilio)

### 3.3 Email Monitoring
**Approach**: IMAP polling + Claude Code

Script monitors inbox for specific senders → triggers Claude analysis → sends notification

---

## Phase 4: Design Persona Instances

> **Note**: Phase 4 implements the framework defined in Section 1.5. Create this after the design-personas skill is working.

### 4.1 Create Core Personas

Using the 11-category schema from 1.5.1, create initial persona instances:

**B2B SaaS** (`~/.claude/design-personas/b2b-saas.yaml`):
- Emotional goals: trust, reliability, efficiency
- Color: muted professional, blue primary
- Animation: subtle (micro-interactions, loading states only)
- Typography: compact, scannable, data-dense
- Accessibility: WCAG AA, keyboard nav required

**TTRPG/Gaming** (`~/.claude/design-personas/ttrpg.yaml`):
- Emotional goals: excitement, wonder, immersion
- Color: themed palettes (fantasy, sci-fi variants)
- Animation: expressive, atmospheric
- Typography: readable prose, dramatic headers
- Accessibility: WCAG AA, accommodates long reading sessions

**Youth-Oriented** (`~/.claude/design-personas/youth.yaml`):
- Emotional goals: fun, engagement, discovery
- Color: bold, high-contrast, playful
- Animation: expressive but not distracting
- Typography: large, clear, scannable
- Accessibility: WCAG AAA, supports emerging readers

### 4.2 Persona Voiceprint Traits (for fine-tuning)

Optional spectrum-based adjustments within any persona:
- **Boldness**: conservative ↔ experimental
- **Density**: minimal ↔ rich
- **Formality**: playful ↔ corporate
- **Motion**: static ↔ animated

---

## Phase 5: Daggerhart App Expansion (Separate Project)

**Location**: `/Users/jaykelly/Repos/daggergm/`

### 5.1 Custom Content Creation
Add user content tables + UI:
- `user_adversaries`, `user_items`, `user_classes`, `user_ancestries`
- Creator/editor components
- Validation against game rules

### 5.2 World Building (Proper Frames)
Extend frame concept beyond one-shot settings:
- Geography, lore, deity structures
- Points of interest management
- Faction system

### 5.3 Campaign Management
New tables + UI:
- `campaigns` - Persistent campaign state
- `campaign_sessions` - Session tracking within campaign
- NPC persistence across sessions
- Timeline/continuity tracking

---

## Phase 6: NPC Repo Operationalization

**Source**: github.com/sagebright/npcs

### 6.1 Schema Validation
Current assets:
- `voiceprint_traits_7.2.25.json` - 22 traits with anchors
- `npc_layers_7.2.25.json` - 7 layers

Create TypeScript/Zod schemas for validation.

### 6.2 Claude Code Integration
**Use Case 1: Agent Skinning**
- Create skill that loads NPC profile into session context
- Command: `/persona load <npc-id>`
- Transforms Claude's communication style

**Use Case 2: Simulation**
- Multi-agent conversation orchestration
- Spin up subagents with different personas
- Summarize outcomes, conflicts, decisions

### 6.3 Implementation Path
1. Move schemas to `~/.claude/npc-profiles/`
2. Create `/persona` command
3. Test with single NPC (mentor persona)
4. Extend to simulation use case

---

## Phase 7: Companion App Scoping (Future)

Defer until remote triggers work. MVP features:
- View Claude outputs/summaries
- Trigger processing via text input
- Notification preferences
- Session history

---

## Verification

### Phase 1 Verification
1. Verify template.yaml accepts `pipeline: direct_to_issues | full_refinement`
2. Run `/create-project software` and verify depth module activation prompts appear
3. Create test issue with `needs_refinement` status, verify `[REFINE]` prefix
4. Run `/create-template` and verify research phase triggers before file generation
5. Verify Claude presents domain research findings for user validation
6. Verify generated template includes all required files (template.yaml, PLANNING_SKILL.md)
7. Verify design-personas skill auto-activates on frontend design work
8. Verify persona constraints (colors, animations, accessibility) are applied during component generation
9. Test persona assignment at both project and issue level

### Phase 2 Verification
1. Add debug logging to hook configuration
2. Test PreToolUse hook as control (should fire)
3. Document which events fire vs don't

### Phase 3 Verification
1. Set up file watcher on test folder
2. Drop text file, verify Claude processes it
3. Verify output appears in synced location

---

## Execution Order

| Phase | Initiative | Effort | Dependency |
|-------|-----------|--------|------------|
| 1.1 | Template pipeline config | Low | None |
| 1.2 | Issue status schema | Low | 1.1 |
| 1.3 | Depth modules | Medium | 1.2 |
| 1.4 | `/create-template` with research phase | Medium | 1.3 (for testing) |
| 1.5.1 | Design persona categories (research) | Low | None |
| 1.5.2-4 | Design persona skill implementation | Medium | 1.5.1 |
| 2.1 | Hook debugging | Low | None |
| 2.2 | Hookify audit | Low | 2.1 |
| 3.1 | Inbound triggers | Medium | None |
| 3.2 | Scheduled jobs | Low | 3.1 |
| 3.3 | Email monitoring | Medium | 3.1 |
| 4.1 | Create core persona instances (B2B, TTRPG, Youth) | Low | 1.5.2-4 |
| 4.2 | Voiceprint trait fine-tuning | Low | 4.1 |
| 5 | Daggerhart expansion | High | None (separate project) |
| 6 | NPC operationalization | Medium | None |
| 7 | Companion app | High | 3.x complete |

---

## Critical Files Reference

**Phase 1:**
- `~/.claude/commands/create-project.md`
- `~/.claude/commands/create-template.md` (new)
- `~/.claude/templates/software/template.yaml`
- `~/.claude/templates/software/PLANNING_SKILL.md`
- `~/.claude/templates/software/GITHUB_INTEGRATION.md`
- `~/.claude/templates/software/depth-modules/*.yaml` (new)
- `~/.claude/skills/design-personas/SKILL.md` (new)
- `~/.claude/design-personas/*.yaml` (new - persona instances)

**Phase 2:**
- `~/.claude/settings.json`
- `~/.claude/plugins/marketplaces/claude-code-plugins/plugins/hookify/`

**Phase 6:**
- github.com/sagebright/npcs `documentation/*.json`
- `~/.claude/npc-profiles/` (new)
- `~/.claude/commands/persona.md` (new)
