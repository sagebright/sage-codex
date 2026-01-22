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

New command for creating templates through guided conversation:
1. Template identity (name, type, description)
2. Expert persona generation
3. Workflow type (dial_tuning vs branching)
4. **Pipeline declaration** (direct_to_issues vs full_refinement)
5. Phase definition
6. Output definition (files, directories, GitHub integration)
7. File generation to `~/.claude/templates/<id>/`

### 1.5 Design Awareness in Persona
**Files**: `~/.claude/templates/software/PLANNING_SKILL.md`

Add design style awareness section with reference patterns:
- Minimalist/Clean (Apple, Linear)
- Bold/Expressive (Stripe, Vercel)
- Corporate/Professional (Salesforce)
- Playful/Creative (Slack, Mailchimp)

Probe for style references during frontend questions.

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

## Phase 4: Designer Persona Framework

### 4.1 Persona Schema Definition
Based on NPC framework (22 traits + 7 layers), create designer-specific schema:

**Designer Voiceprint Traits** (subset):
- Boldness (conservative ↔ experimental)
- Density (minimal ↔ rich)
- Formality (playful ↔ corporate)
- Motion (static ↔ animated)

**Designer Layers**:
- Design Philosophy (principles, values)
- Reference Library (brands, sites to emulate)
- Technical Constraints (frameworks, components)
- Color Strategy (palette generation approach)
- Typography Rules (scale, pairing)

### 4.2 Integration Point
Designer personas become a depth module or template add-on:
- `/create-project software --design-persona b2b-dashboard`
- Loads persona definition, influences all frontend questions

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
4. Run `/create-template` and generate a "functional-spec" template with `direct_to_issues` pipeline
5. Verify functional-spec skips refine-plan and goes directly to create-issues

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
| 1.4 | `/create-template` | Medium | 1.3 (for testing) |
| 1.5 | Design awareness | Low | None |
| 2.1 | Hook debugging | Low | None |
| 2.2 | Hookify audit | Low | 2.1 |
| 3.1 | Inbound triggers | Medium | None |
| 3.2 | Scheduled jobs | Low | 3.1 |
| 3.3 | Email monitoring | Medium | 3.1 |
| 4 | Designer personas | Medium | 1.2, 1.4 |
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

**Phase 2:**
- `~/.claude/settings.json`
- `~/.claude/plugins/marketplaces/claude-code-plugins/plugins/hookify/`

**Phase 6:**
- github.com/sagebright/npcs `documentation/*.json`
- `~/.claude/npc-profiles/` (new)
- `~/.claude/commands/persona.md` (new)
