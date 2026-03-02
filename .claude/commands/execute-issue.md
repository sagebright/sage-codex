# Execute GitHub Issue

**Argument:** `$ARGUMENTS` = GitHub issue number

---

## Project Configuration

> **Note:** This is the canonical version. Projects can override specific settings.

**Package Manager:** Detect from project (`pnpm` if pnpm-lock.yaml, `npm` if package-lock.json, `yarn` if yarn.lock)

**Build Commands:**
- Build: `$PKG build`
- Lint: `$PKG lint`
- Test: `$PKG test`
- Coverage: `$PKG test --coverage`

**Baseline Documentation:**
- Primary: `PLAN.md` or `documentation/PLAN.md` (if exists)
- Project config: `CLAUDE.md` (if exists)

**Core Labels:** `bug`, `enhancement`, `refactor`, `test`, `documentation`, `refine`

---

## 1. Fetch & Analyze Issue

```bash
gh issue view $ARGUMENTS
```

- [ ] Note issue **title** and **labels**
- [ ] Identify sections: Overview, Tasks, Files, Acceptance Criteria, Notes
- [ ] Check for dependencies (linked issues, prerequisites)

---

## 2. Validate Labels & Load Context

### 2.0 Baseline Documentation

**Always load (if exists):**
- [ ] `PLAN.md` or `documentation/PLAN.md` — Architecture, project structure, tech stack
- [ ] `CLAUDE.md` — Project overview, patterns, dev workflow

### 2.1 Check Labels

**If issue has `refine` label** → Proceed to Section 2.3 (Refinement Workflow)

**If no routing label AND no `refine` label** → Comment and ask:
```bash
gh issue comment $ARGUMENTS --body "Issue needs a routing label: bug, enhancement, refactor, test, documentation

Or add \`refine\` label if issue needs further clarification before implementation."
```

### 2.2 Label → Approach Mapping

| Label | Approach | Test Strategy |
|-------|----------|---------------|
| `bug` | TDD | Write failing test first (RED), fix bug (GREEN) |
| `enhancement` | TDD | Write failing test first (RED), implement (GREEN) |
| `refactor` | Coverage Guard | Capture baseline, maintain/improve coverage |
| `test` | TDD | Improve coverage, verify tests fail appropriately |
| `documentation` | — | No tests required |
| `refine` | Interactive | **Pause** — refinement required (see Section 2.3) |

**Label Categories:**
- **TDD Labels** (`bug`, `enhancement`, `test`): Write failing test first, verify coverage before + after
- **Coverage-Guard Labels** (`refactor`): Capture baseline, maintain/improve coverage
- **Modifier Labels** (`refine`): Triggers pre-execution workflow, then proceeds based on routing label

### 2.3 Check for Refinement Label

If issue has `refine` label:

```
🔄 Issue #$ARGUMENTS has the `refine` label.

This issue needs refinement before implementation can begin.
Starting interactive refinement process...
```

→ Proceed to Section 2.4 (Refinement Workflow)

### 2.4 Refinement Workflow

When `refine` label is detected, execute this interactive workflow:

#### Step 1: Analyze Current Issue State

Read the issue body and identify:
- [ ] What sections are complete vs incomplete
- [ ] What routing label(s) exist (if any)
- [ ] What specific refinements are needed

Present analysis to user:
```
## Current Issue Analysis

**Title:** [title]
**Current Labels:** [labels]
**Routing Label:** [present/missing]

### Completeness Check
| Section | Status | Notes |
|---------|--------|-------|
| Overview | ✅/⚠️/❌ | [observation] |
| Tasks | ✅/⚠️/❌ | [observation] |
| Files Involved | ✅/⚠️/❌ | [observation] |
| Acceptance Criteria | ✅/⚠️/❌ | [observation] |

### Refinement Needed
1. [First refinement area]
2. [Second refinement area]
```

#### Step 2: Interactive Refinement Questions

Ask targeted questions based on what's incomplete:

**If Overview unclear:**
```
❓ Can you describe the specific problem or feature in more detail?
   - What is the current behavior (if bug)?
   - What should the new behavior be?
   - Who/what is affected?
```

**If Tasks are vague:**
```
❓ Let's break this down into specific tasks:
   - What's the first concrete step?
   - What files will need to change?
   - Are there any dependencies on other work?
```

**If Files unknown:**
```
❓ Based on the tasks, which files should be involved?
   - [Suggest files based on codebase analysis]
   - Are there other files you know need changes?
```

**If Acceptance Criteria missing:**
```
❓ How will we know this is complete?
   - What should work that doesn't work now?
   - What tests should pass?
   - What can we verify manually?
```

**If Routing Label missing:**
```
❓ What type of work is this?
   - Bug fix (something broken) → `bug`
   - New feature (new capability) → `enhancement`
   - Code cleanup (no behavior change) → `refactor`
   - Test improvements → `test`
   - Documentation → `documentation`
```

#### Step 3: Confirm Refined Issue

Present the refined issue for approval:

```
## Refined Issue Preview

**Title:** [possibly updated title]
**Labels:** [routing label] (removing `refine`)

### Overview
**What:** [refined description]
**Why:** [refined justification]

### Tasks
- [ ] [Specific task 1]
- [ ] [Specific task 2]
- [ ] [Specific task 3]

### Files Involved
| File | Action |
|------|--------|
| `path/to/file.ts` | Modify |

### Acceptance Criteria
- [ ] [Specific criterion 1]
- [ ] [Specific criterion 2]
- [ ] Build passes
- [ ] Tests pass

---
Ready to update issue and proceed with execution? [y/n/edit]
```

**If user says "edit":**
- Ask what they want to change
- Update and present again

**If user says "n" (abort):**
```
⏸️ Refinement paused. Issue #$ARGUMENTS remains unchanged.

Options:
1. Run `/execute-issue $ARGUMENTS` again when ready to refine
2. Manually update the issue on GitHub
3. Remove the `refine` label if issue is ready
```
Exit workflow.

**If user says "y" (approve):**
Proceed to Step 4.

#### Step 4: Update Issue on GitHub

```bash
# Update the issue body with refined content
gh issue edit $ARGUMENTS --body "$(cat <<'EOF'
[Refined issue body from Step 3]
EOF
)"

# Remove refine label
gh issue edit $ARGUMENTS --remove-label "refine"

# Add routing label if it was missing
gh issue edit $ARGUMENTS --add-label "[routing-label]"
```

Confirm update:
```
✅ Issue #$ARGUMENTS refined and updated.

Changes made:
- Updated issue body with refined details
- Removed `refine` label
- [Added/Confirmed] `[routing-label]` label

Proceeding with execution workflow...
```

#### Step 5: Continue to Normal Execution

After successful refinement, re-fetch the updated issue and continue to **Section 3: Pre-Flight Checklist**.

---

## 3. Pre-Flight Checklist (All Issues)

```
MANDATORY BEFORE IMPLEMENTATION:
□ Read all files in Files Involved section
□ Verify dependencies complete (linked issues)
□ Check git status is clean
□ Confirm on correct branch or create feature branch
□ Run: $PKG build (baseline passing)
□ Run: $PKG test (if tests configured, capture baseline)
```

**If pre-flight fails** → Comment blocker on issue, do not proceed.

---

## 4. Setup TodoWrite

- [ ] Add each task from issue's Tasks section as a todo
- [ ] Mark first task as `in_progress`

---

## 5. Execute Implementation

For each task:
1. Mark `in_progress` in TodoWrite
2. Execute the task
3. Mark `completed` in TodoWrite

**During execution, enforce:**
- 500-line file limit (split large files)
- Input validation on user inputs
- Consistent code style

---

## 5.1 Clean Code Standards (During Implementation)

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Variables | Descriptive, noun-based | `userCount`, `isLoading`, `errorMessage` |
| Functions | Verb + noun, action-based | `fetchUserData()`, `validateEmail()`, `calculateTotal()` |
| Booleans | is/has/should/can prefix | `isVisible`, `hasPermission`, `shouldRefresh` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Components | PascalCase, descriptive | `UserProfileCard`, `LoadingSpinner` |
| Hooks | use prefix | `useAuth`, `useFormValidation` |
| Test files | *.test.ts or *.spec.ts | `UserService.test.ts` |

### Function Guidelines

| Guideline | Limit | Action if Exceeded |
|-----------|-------|-------------------|
| Max lines | 20-30 | Extract helper function |
| Max parameters | 3 | Use options object |
| Nesting depth | 3 levels | Use early returns/extract |
| Cyclomatic complexity | Low | Split into smaller functions |

**Function Design Principles:**
- **Single responsibility:** One reason to change
- **Pure when possible:** Same input → same output, no side effects
- **Early returns:** Use guard clauses to reduce nesting
- **Descriptive names:** Function name describes what it does, not how

### Code Smells Checklist

During implementation, actively watch for and fix:

| Smell | Detection | Fix |
|-------|-----------|-----|
| Long function | >30 lines | Extract smaller functions |
| Long parameter list | >3 params | Use options object `{ name, email, role }` |
| Nested callbacks | >2 levels | Use async/await or extract |
| Repeated code | 2+ identical blocks | Extract to shared function |
| Magic numbers | Literal `86400`, `100` | Create named constant |
| Comments explaining "what" | `// loop through users` | Rename variable/function for clarity |
| Boolean parameters | `process(data, true)` | Use options object or separate functions |
| Long if/else chains | 4+ branches | Use early returns, lookup table, or strategy |
| Dead code | Unreachable/unused | Delete it |
| Inconsistent naming | `user` vs `userData` vs `userInfo` | Standardize across codebase |

### Error Handling Patterns

**Do:**
```typescript
// Specific, actionable error messages
throw new Error(`User ${userId} not found in organization ${orgId}`);

// Early validation with clear errors
if (!email.includes('@')) {
  throw new ValidationError('Email must contain @ symbol');
}

// Typed errors for different failure modes
class NotFoundError extends Error { }
class ValidationError extends Error { }
```

**Don't:**
```typescript
// Vague errors
throw new Error('Something went wrong');

// Silent failures
catch (e) { return null; }

// Generic catch-all
catch (e) { console.log(e); }
```

---

## 5.2 Safe Refactoring Patterns

When refactoring during implementation, follow these patterns:

### Extract Function

**When:** Code block >10 lines with single purpose

**Steps:**
1. Identify cohesive block of code
2. Create function with descriptive name (verb + noun)
3. Identify all variables used → become parameters
4. Identify result → becomes return value
5. Replace original block with function call
6. Run tests to verify behavior unchanged

### Rename for Clarity

**When:** Name doesn't reveal intent

**Steps:**
1. Identify unclear name (`d`, `temp`, `data`, `info`)
2. Ask: "What does this represent?"
3. Choose name that answers the question
4. Use IDE rename (Ctrl/Cmd + Shift + R) - not find/replace
5. Run tests to verify no broken references

**Examples:**
| Before | After | Reason |
|--------|-------|--------|
| `d` | `discountPercentage` | Reveals what the value represents |
| `temp` | `sortedUsers` | Describes the transformation |
| `data` | `apiResponse` | Indicates the source |
| `handleClick` | `submitRegistration` | Describes the action |

### Replace Magic Number/String

**When:** Literal value with hidden meaning

**Steps:**
1. Identify magic value (`86400`, `'pending'`, `0.15`)
2. Determine what it represents
3. Create named constant at module/file scope
4. Replace all occurrences
5. Run tests

### Simplify Conditionals

**When:** Complex boolean expressions or deep nesting

**Techniques:**
1. **Extract to named variable:**
   ```typescript
   // Before
   if (user.role === 'admin' && user.isActive && !user.isSuspended) { ... }

   // After
   const canAccessAdminPanel = user.role === 'admin' && user.isActive && !user.isSuspended;
   if (canAccessAdminPanel) { ... }
   ```

2. **Use early returns (guard clauses):**
   ```typescript
   // Before
   function processUser(user) {
     if (user) {
       if (user.isActive) {
         if (user.hasPermission) {
           // actual logic 20 lines deep
         }
       }
     }
   }

   // After
   function processUser(user) {
     if (!user) return;
     if (!user.isActive) return;
     if (!user.hasPermission) return;
     // actual logic at top level
   }
   ```

---

## 6. Validation Sequence (Label-Aware)

### Quick validation (all issues):
```bash
$PKG build
$PKG lint
```

### TDD Labels (`bug`, `enhancement`, `test`):

**Before coding**: Write failing test first
```bash
# Write test that fails
$PKG test "[new-test-file]"
# Expect: FAIL (RED)
```

**After implementation**: Verify test passes
```bash
$PKG test "[affected-area]"
# Expect: PASS (GREEN)
```

### Coverage-Guard Labels (`refactor`):

**Before coding**: Capture baseline
```bash
$PKG test --coverage "[affected-area]"
# Note coverage %
```

**After implementation**: Verify coverage maintained/improved
```bash
$PKG test --coverage "[affected-area]"
# Verify: >= baseline % (must not decrease)
```

### Pre-commit validation (REQUIRED):
```bash
$PKG build && $PKG lint && $PKG test
```

---

## 7. Test, Fix, and Commit Workflow

### 7.1 Run Tests

```bash
$PKG test
```

If tests not yet configured, fallback:
```bash
$PKG build && $PKG lint
```

**All validations must pass before committing.**

### 7.2 If Tests Fail: Automatic Resolution Loop

1. **Analyze failures** - Read test output, identify root cause
2. **Fix the issue** - Prioritize fixing flaky tests if detected
3. **Re-run tests** - `$PKG test`
4. **Iteration limit**: If after 5 fix attempts tests still fail, **STOP** and report:
   - What's failing
   - What was attempted
   - Ask user for guidance

### 7.3 When Tests Pass: Commit (LOCAL ONLY)

```bash
git add -A
git commit -m "[type]: [issue-title] (#$ARGUMENTS)"
```

Where `[type]` is: `fix` (bug), `feat` (enhancement), `refactor` (refactor), `test` (test), `docs` (documentation)

**CRITICAL - Commit Only, No Push:**
- ❌ Do NOT run `git push` - this is USER responsibility
- ✅ Commits only contain "green" code (tests passed)
- ✅ User will push when ready and monitor CI themselves

---

## 7.5 E2E Test Execution (Post-Commit)

After the local commit succeeds, run E2E tests to verify the implementation works through the full stack (real browser, real backend, real data flow). E2E is NOT part of the RED-GREEN TDD cycle — it is a post-implementation verification layer.

**Flow:** `TDD (unit) → Commit → E2E + Visual Review (parallel, shared dev server) → Compliance`

### 7.5.1 Detect E2E Capability

```bash
# Check for Playwright config
ls playwright.config.{ts,js,mjs} 2>/dev/null

# Check for Playwright in package.json
grep -q '"@playwright/test"' package.json 2>/dev/null

# Check for E2E test directory
ls -d e2e/ tests/e2e/ test/e2e/ 2>/dev/null
```

| Found | State | Action |
|-------|-------|--------|
| Playwright config + test files | `e2e_ready` | Run existing E2E tests |
| Playwright config, no test files | `e2e_scaffold` | Write E2E tests for this issue |
| No Playwright at all | `e2e_absent` | Auto-scaffold Playwright (see 7.5.2) |

### 7.5.2 Auto-Scaffold Playwright (when `e2e_absent`)

Install and configure Playwright automatically:

```bash
# Install Playwright
$PKG install -D @playwright/test
npx playwright install chromium

# Add test:e2e script to package.json
# "test:e2e": "playwright test"
```

Create `playwright.config.ts` with sensible defaults:
- `baseURL`: detect from `vite.config.ts` (`server.port`) or fall back to `http://localhost:5173`
- `testDir`: `./e2e`
- `reporter`: `list`
- `use.trace`: `on-first-retry`

Create empty `e2e/` directory.

Amend the commit to include scaffold files:
```bash
git add playwright.config.ts e2e/ package.json package-lock.json
git commit --amend --no-edit
```

Transition to `e2e_scaffold` state.

### 7.5.3 Validate Backend

Before running E2E tests, verify the backend is reachable using Supabase MCP tools:

```
Use ToolSearch to find Supabase MCP tools
Call list_tables or get_project to verify connectivity
```

| Result | Action |
|--------|--------|
| MCP responds successfully | Backend reachable, proceed |
| MCP fails or unavailable | Skip E2E with note: "Backend not reachable via MCP" |

### 7.5.4 Evaluate Risk Triggers

E2E tests are required when the issue involves **ANY** of these triggers:

| # | Trigger | Example |
|---|---------|---------|
| 1 | **Data mutation** via API or database | Create/update/delete operations |
| 2 | **Multi-step user flow** spanning 2+ pages | Create form → detail page → back to list |
| 3 | **State shared across components** | Zustand stores, React context, prop drilling |
| 4 | **Navigation/routing changes** | New routes, redirect logic, back button behavior |
| 5 | **Conditional rendering** paths | Edit vs read-only, empty vs populated, loading vs loaded |
| 6 | **Async/real-time operations** | SSE, WebSocket, polling, debounced updates |

| Label | E2E Strategy |
|-------|-------------|
| `bug` | Write E2E reproducing the bug scenario (if triggers matched) |
| `enhancement` | Write E2E for the primary user journey (if triggers matched) |
| `refactor` | Run existing E2E for regression only — do NOT write new E2E |
| `test` | Run existing E2E if UI-related |
| `documentation` | Skip E2E entirely |

**If no triggers matched:** Skip E2E writing, run existing E2E suite for regression only.

### 7.5.5 Write E2E Tests

**How many:** 1 E2E test per acceptance criterion that describes user behavior. Typical: 2-4 tests per issue. If the criterion is technical ("function returns X"), no E2E test for that criterion.

**File location:** `e2e/[feature-area].spec.ts`

**Selector strategy — accessibility-first (MANDATORY):**
- Use `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`
- Only fall back to `data-testid` when no accessible name exists (icon-only buttons, canvas elements)
- NEVER use CSS selectors or XPath

**Test data strategy — API-based setup + teardown:**
- `beforeEach`: create test data via `@supabase/supabase-js` client directly (NOT through UI)
- `afterEach`: delete test data via the same client
- Tests are fully isolated — no shared state between tests

#### E2E Template (Supabase-Specific)

```typescript
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

test.describe('Feature: [issue title]', () => {
  let testRecordId: string;

  test.beforeEach(async () => {
    const { data } = await supabase
      .from('table')
      .insert({ name: 'E2E Test Record' })
      .select()
      .single();
    testRecordId = data!.id;
  });

  test.afterEach(async () => {
    await supabase.from('table').delete().eq('id', testRecordId);
  });

  // Pattern 1: Data roundtrip (catches persistence bugs)
  test('data persists after page reload', async ({ page }) => {
    await page.goto(`/record/${testRecordId}`);
    await expect(page.getByRole('heading', { name: 'E2E Test Record' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'E2E Test Record' })).toBeVisible();
  });

  // Pattern 2: State across navigation (catches stale state bugs)
  test('state preserved across navigation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Filter active' }).click();
    await page.getByRole('link', { name: 'E2E Test Record' }).click();
    await page.getByRole('link', { name: 'Back' }).click();
    await expect(page.getByRole('button', { name: 'Filter active' }))
      .toHaveAttribute('aria-pressed', 'true');
  });

  // Pattern 3: Conditional rendering (catches missing UI modes)
  test('renders correctly in [state] mode', async ({ page }) => {
    await page.goto(`/record/${testRecordId}`);
    await expect(page.getByRole('region', { name: 'Details' })).toBeVisible();
  });

  // Pattern 4: Rapid interaction (catches stale closure bugs)
  test('rapid state changes resolve correctly', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Filter A' }).click();
    await page.getByRole('button', { name: 'Filter B' }).click();
    await page.getByRole('button', { name: 'Filter C' }).click();
    await expect(page.getByRole('button', { name: 'Filter C' }))
      .toHaveAttribute('aria-pressed', 'true');
  });
});
```

#### E2E Anti-Patterns (DO NOT)

- **DO NOT** mock API responses in E2E tests — use real Supabase
- **DO NOT** test internal component state — test visible user outcomes
- **DO NOT** share test data between tests — each test creates and cleans up its own
- **DO NOT** use CSS selectors or XPath — use accessibility selectors
- **DO NOT** assert on implementation details (class names, DOM structure)

#### Two-Tier E2E Strategy (Project-Specific)

This project uses a two-tier E2E architecture:

- **Tier 1 (`e2e/`)**: Mock-based UI integration tests. These mock API responses
  (including Anthropic SSE streams) to test UI rendering, stage transitions, and
  component behavior. The "DO NOT mock" rule does NOT apply to Tier 1.

- **Tier 2 (`e2e-integration/`)**: Real-backend tests. These use the real API server
  and Supabase. The "DO NOT mock" rule and Supabase template patterns apply here.
  Anthropic SDK is mocked at the API layer for deterministic responses.

When writing E2E tests per this section, write them in `e2e-integration/`.
When running regression E2E, run both tiers.

### 7.5.6 Run E2E Tests

```bash
# Start dev server in background (keep running for visual review)
$PKG dev &
DEV_PID=$!

# Wait for server
npx wait-on http://localhost:${DEV_PORT:-5173} --timeout 30000

# Run E2E tests
npx playwright test --reporter=list
E2E_EXIT=$?
```

**Do NOT kill the dev server yet** — it will be reused by Section 7.6 (Visual Review).

| Result | Action |
|--------|--------|
| E2E pass | Record `e2e_status: passed`, proceed to 7.6 |
| E2E fail | Fix implementation (NOT the test unless test is clearly wrong), amend commit, re-run |

**Iteration limit: 3 attempts.** After 3 failures, **STOP** and report:
- Which E2E tests are failing
- What was attempted
- Playwright failure screenshots (if available)
- Record `e2e_status: failed`, do NOT close issue

### 7.5.7 Graceful Degradation

| Missing | E2E Impact | Visual Impact | Action |
|---------|-----------|---------------|--------|
| No Playwright | Auto-scaffold (7.5.2) | N/A | Auto-setup |
| No dev server script | Skip E2E + visual | Skip visual | Note in comment |
| No browser tool | E2E runs headless | Skip visual | Note in comment |
| Backend unreachable (MCP) | Skip E2E | Visual still runs | Note in comment |
| No UI changes | Run existing E2E only | Skip visual | Note: "no UI changes" |
| `documentation` label | Skip all | Skip all | No note needed |

---

## 7.6 Visual Review (Post-Commit)

After E2E tests pass (or alongside them using the shared dev server), perform a visual review by taking screenshots and analyzing them with Claude's vision capabilities.

**Visual issues BLOCK closure.** If Claude identifies visual problems it cannot resolve, screenshots are attached to the issue comment and the issue remains open for user review.

### 7.6.1 Browser Tool Auto-Detection

```
Priority 1: ToolSearch("browser_navigate")
  → If docker-gateway MCP found: BROWSER_MODE = "mcp"
    Tools: browser_navigate, browser_snapshot, browser_take_screenshot, browser_click, browser_fill_form

Priority 2: npx playwright --version
  → If Playwright available: BROWSER_MODE = "playwright_cli"
    Tool: npx playwright screenshot <url> <output.png>

Priority 3: Neither available
  → BROWSER_MODE = "none"
  → Skip visual review with note: "Visual review skipped: no browser tool available"
```

### 7.6.2 Screenshot Strategy

Take 2-6 screenshots per issue, targeting what changed:

| View Type | Screenshots |
|-----------|-------------|
| Dashboard / list view | Empty state + populated state |
| Detail / form view | Populated state + after interaction |
| Modal / overlay | Open state |
| All views | 1280x720 viewport |

**If BROWSER_MODE = "mcp":** Use `browser_navigate` → `browser_take_screenshot`. Can also interact (click, fill forms) before screenshotting.

**If BROWSER_MODE = "playwright_cli":**
```bash
npx playwright screenshot --viewport-size=1280,720 --wait-for-timeout=3000 \
  http://localhost:${DEV_PORT} /tmp/screenshot-[view].png
```

### 7.6.3 Vision Analysis Checklist

Read each screenshot with the Read tool (Claude vision). Analyze against:

```
VISUAL REVIEW for [page/component]:

Layout & Structure:
□ Elements properly aligned (no overlapping, no clipping)
□ Spacing is consistent
□ No blank/white areas where content should appear

Content & Data:
□ Text is readable (not truncated, not overflowing)
□ Data displays correctly (numbers formatted, dates readable)
□ Empty states show appropriate messaging

Functionality Indicators:
□ Interactive elements look interactive (buttons styled, links visible)
□ Current state reflected in UI (active tabs, selected filters)
□ Error states display user-friendly messages

Regressions:
□ Existing UI not broken by new changes
□ No visual artifacts (random borders, miscolored elements)
□ All icons/images load correctly
```

### 7.6.4 Fix Loop

**2 attempts.** Visual issues **block closure.**

| Attempt | Action |
|---------|--------|
| Issue found | Fix implementation, amend commit, re-screenshot, re-analyze |
| After 2 failed attempts | Attach screenshots to issue comment, leave issue **open** |

When blocked by visual issues, the issue comment includes:
```markdown
### Visual Issues (Blocking)
- [screenshot description]: [what looks wrong]
- [screenshot description]: [what looks wrong]

Issue left open for user review. Close manually if these are acceptable.
```

### 7.6.5 Skip Conditions

Skip visual review entirely if:
- `documentation` label
- No UI components changed (pure backend/logic)
- No dev server script in package.json
- No browser tool available (`BROWSER_MODE = "none"`)

### 7.6.6 Cleanup

After both E2E and visual review are complete:
```bash
kill $DEV_PID 2>/dev/null
rm -f /tmp/screenshot-*.png
```

---

## 8. Compliance Check

### Process Compliance

```
□ File size: No files over 500 lines
□ Security: Input validation on user inputs
□ Tests: Coverage maintained or improved (if tests configured)
□ E2E: E2E tests pass (or documented skip reason)
□ Visual: Visual review passed (or documented skip reason)
□ Build: $PKG build passes
□ Lint: $PKG lint passes
```

### Clean Code Compliance

Before committing, verify all new/modified code meets these standards:

```
□ Naming: Variables and functions have self-documenting names
□ Functions: No function exceeds 30 lines
□ Parameters: No function has >3 parameters (use options object if needed)
□ Nesting: No code nested >3 levels deep
□ DRY: No copy-pasted code blocks (extract shared logic)
□ Comments: Comments explain "why", not "what" (code is self-documenting)
□ Constants: No magic numbers or strings (use named constants)
□ Errors: Error messages are specific and actionable
□ Dead code: No commented-out code or unused variables
□ Consistency: Naming patterns match existing codebase conventions
```

**If any check fails:** Fix before committing. Do not proceed with technical debt.

---

## 9. Test Coverage Validation

### Check Test Existence:

For files modified/created:
- [ ] Components >100 lines have test file
- [ ] Custom hooks >50 lines have test file
- [ ] New features have integration tests

### Run Coverage Report (when tests configured):

```bash
$PKG test --coverage "[affected-pattern]"
```

### Evaluate Coverage:

**If coverage decreases:**
- Add tests to maintain or improve coverage
- Document reason if coverage cannot be improved (e.g., external dependencies)

---

## 10. Comment Results

```bash
gh issue comment $ARGUMENTS --body "## Implementation Complete (Local Validation)

### Context
- Labels: [labels]
- Docs reviewed: [documentation files]

### Implementation
- [x] Task 1
- [x] Task 2

### Verification
- [x] Build passes
- [x] Lint clean
- [x] Tests pass [or N/A if not configured]
- [x] E2E tests: [passed / scaffolded + passed / skipped (reason)]
- [x] Visual review: [passed / skipped (reason)]

### E2E Results (if applicable)
- Tests run: [count]
- Tests passed: [count]
- Screenshots reviewed: [count]
- Visual issues: [none / list]

### Commit Status
- [x] Changes committed locally
- [ ] NOT pushed (user will push when ready)

### Files Changed
- \`path/file.tsx\` (modified)

---
Executed by Claude Code"
```

**When visual issues block closure**, use this comment format instead:

```bash
gh issue comment $ARGUMENTS --body "## Implementation Complete — Visual Issues Found

### Context
- Labels: [labels]
- Docs reviewed: [documentation files]

### Implementation
- [x] Task 1
- [x] Task 2

### Verification
- [x] Build passes
- [x] Lint clean
- [x] Tests pass
- [x] E2E tests: passed
- [ ] Visual review: **issues found (blocking)**

### Visual Issues (Blocking)
- [screenshot description]: [what looks wrong]
- [screenshot description]: [what looks wrong]

Issue left open for user review. Close manually if these are acceptable.

### Commit Status
- [x] Changes committed locally
- [ ] NOT pushed (user will push when ready)

### Files Changed
- \`path/file.tsx\` (modified)

---
Executed by Claude Code"
```

---

## 11. Close Issue

Only if ALL acceptance criteria pass:
```bash
gh issue close $ARGUMENTS
```

---

## 12. User Action Required

Output to user:

```
✅ Issue closed with local validation complete.

Next steps:
1. Review changes: git log -1 --stat
2. Push to branch: git push origin [branch-name]
3. Monitor CI: gh run watch

Note: If CI fails on GitHub, reopen issue #$ARGUMENTS
```

---

## Error Handling

### No Matching Label
Comment with available labels, wait for user to add one.

### Blocked
Comment blocker details, list completed vs remaining work, leave open.

### Tests Fail
Do NOT close. Comment failure details.

### Scope Expands
Stop. Comment noting scope creep. Suggest follow-up issue.

### Refinement Aborted
If user aborts refinement: Leave issue unchanged, keep `refine` label, inform user they can re-run `/execute-issue` when ready.

---

## Quick Reference Flows

### Bug Fix (`bug` label) - TDD Required
1. Write failing test that reproduces the bug (RED)
2. Run test to confirm RED
3. Implement minimal fix
4. Run test to confirm GREEN
5. Verify no regression (coverage maintained)
6. Commit, then run E2E test reproducing the bug + visual review

### Enhancement (`enhancement` label) - TDD Required
1. Write failing test for new behavior (RED)
2. Run test to confirm RED
3. Implement feature incrementally
4. Run test to confirm GREEN after each step
5. Verify coverage improved
6. Commit, then run E2E for user journey + visual review

### Refactor (`refactor` label) - Coverage Guard
1. Capture baseline coverage for affected files
2. Ensure tests exist for code being changed
3. Make incremental changes, test after each
4. Verify no behavior changes (tests still pass)
5. Verify coverage maintained or improved
6. Commit, then run existing E2E for regression + visual review

### Test (`test` label) - TDD Required
1. Identify coverage gaps
2. Write tests for uncovered paths
3. Verify tests fail appropriately when code is broken
4. Run full suite to confirm no conflicts
5. Coverage must improve
6. Commit, then run E2E if UI-related

### Documentation (`documentation` label)
1. Update relevant docs
2. Verify links work
3. No tests required (E2E and visual review skipped)

### Refinement (`refine` label) - Interactive Pre-Workflow
1. Analyze issue completeness (Overview, Tasks, Files, Acceptance Criteria)
2. Ask targeted refinement questions for incomplete sections
3. Present refined issue for user approval
4. Update issue on GitHub (remove `refine`, confirm routing label)
5. Proceed with routing-label workflow (TDD/Coverage-Guard/Docs)

---

## Fix Loop Budget Summary

| Phase | Section | Max Attempts | Blocks Closure |
|-------|---------|-------------|----------------|
| Unit tests | 7.2 | 5 | Yes |
| E2E tests | 7.5 | 3 | Yes |
| Visual review | 7.6 | 2 | Yes |

Each phase has its own independent budget.

---

**Version**: 2.0.0 (canonical)
**Changelog**: Added E2E testing (7.5) and visual review (7.6) post-commit verification layers
