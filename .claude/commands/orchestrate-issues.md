# Orchestrate Issues

**Argument:** `$ARGUMENTS` = space-separated issue numbers or "branch" keyword
**Command:** `/orchestrate-issues`

Execute multiple GitHub issues sequentially using fresh-context subagents. Each issue is handled by an independent agent that follows the full `/execute-issue` workflow.

---

## Project Configuration

### Package Manager Detection

Auto-detect from project lockfiles:

```bash
if [ -f "pnpm-lock.yaml" ]; then
  PKG_CMD="pnpm"
  BUILD_CMD="pnpm build"
  LINT_CMD="pnpm lint"
  TEST_CMD="pnpm test"
elif [ -f "yarn.lock" ]; then
  PKG_CMD="yarn"
  BUILD_CMD="yarn build"
  LINT_CMD="yarn lint"
  TEST_CMD="yarn test"
else
  PKG_CMD="npm"
  BUILD_CMD="npm run build"
  LINT_CMD="npm run lint"
  TEST_CMD="npm run test"
fi
```

---

## 1. Parse Arguments & Setup

### 1.1 Parse Issue Numbers

- If `$ARGUMENTS` contains numbers: parse as space-separated issue numbers
- If `$ARGUMENTS` is "branch": fetch all open issues for current branch
- If empty: show usage and exit

```bash
# Get current branch name
git branch --show-current

# If "branch" mode, fetch open issues
gh issue list --state open --json number,title,labels
```

### 1.2 Validate Environment

- [ ] Verify current branch exists and is checked out
- [ ] Verify git status is clean (no uncommitted changes)
- [ ] Run build validation to ensure baseline is passing

```bash
git status --porcelain
$BUILD_CMD
```

**If uncommitted changes exist:**
```
Cannot start orchestration with uncommitted changes.
Please commit or stash your changes first.
```
**STOP** - return control to user.

### 1.3 Create Orchestration Directory

```bash
mkdir -p .claude/orchestration
```

---

## 2. Pre-Orchestration Validation

### 2.1 Fetch All Issue Details

For each issue number, fetch full details:

```bash
gh issue view {N} --json number,title,body,labels
```

### 2.2 Check for Refinement Labels

For each issue, check if it has the `refine` label.

**If any issue has `refine` label:**
```
Issue #{N} has the `refine` label and requires interactive refinement.

Cannot orchestrate issues with `refine` labels automatically.
Please run `/execute-issue {N}` manually first to complete refinement,
then re-run orchestration.

Issues needing refinement: #{N}, #{M}...
```
**STOP orchestration** - return control to user.

### 2.3 Verify All Issues Have Routing Labels

Each issue must have one of: `bug`, `enhancement`, `refactor`, `test`, `documentation`

**If missing routing label:**
```
Issue #{N} is missing a routing label.

Please add one of: bug, enhancement, refactor, test, documentation
Then re-run orchestration.
```
**STOP orchestration** - return control to user.

---

## 3. Analyze Dependencies

### 3.1 Build Dependency Graph

For each issue:
1. Parse issue body for "Depends on #X" or "Blocked by #X" references
2. Extract "Files Involved" section to detect file paths
3. Compare file lists between issues to detect overlaps

### 3.2 Detect File Overlaps

If two issues share files in their "Files Involved" sections:
- The issue with the lower number executes first (implicit dependency)
- Log the detected overlap

### 3.3 Topological Sort

Sort issues to respect dependencies:
1. Issues with no dependencies first
2. Issues depending on others after their dependencies
3. Circular dependencies - report error, skip affected issues

### 3.4 Present Execution Plan

```
## Orchestration Plan

Branch: {branch}
Issues to execute: {count}

### Execution Order

| Order | Issue | Title | Dependencies |
|-------|-------|-------|--------------|
| 1 | #38 | [title] | None |
| 2 | #39 | [title] | Depends on #38 |
| 3 | #40 | [title] | Shares files with #39 |
| 4 | #41 | [title] | Independent |

### Detected Dependencies
- #39 depends on #38 (explicit: "Depends on #38")
- #40 depends on #39 (file overlap: content-validation.ts)

Proceed with orchestration?
```

Use AskUserQuestion to confirm before proceeding.

---

## 4. Execute Issues Sequentially

For each issue in execution order:

### 4.1 Check Dependency Status

Before executing issue #{N}:
- If it depends on a **failed** issue - mark as `skipped`, log reason, continue to next
- If it depends on a **completed** issue - proceed
- If it has no dependencies - proceed

### 4.2 Spawn Subagent

Use the Task tool to spawn a fresh-context subagent:

```
Task tool parameters:
  description: "Execute issue #{N}"
  subagent_type: "general-purpose"
  run_in_background: false
  prompt: [SUBAGENT_PROMPT - see Section 6]
```

### 4.3 Parse Subagent Result

When the subagent completes, look for the ORCHESTRATION_RESULT block:

```
---
ORCHESTRATION_RESULT:
status: completed|failed|blocked|needs_refinement
issue: {N}
commit_hash: <sha or "none">
files_changed:
  - <file1>
  - <file2>
tests_passed: true|false
e2e_status: passed|failed|skipped
e2e_skip_reason: <reason or "none">
visual_status: passed|failed|skipped
visual_skip_reason: <reason or "none">
blockers: <description or "none">
summary: <1-2 sentences>
---
```

**Handle based on status:**
- `completed` - Record success, proceed to next issue
- `failed` - Log failure, mark dependent issues as skipped, continue with independent issues
- `blocked` - Log blocker, mark dependent issues as skipped, continue with independent issues
- `needs_refinement` - Log that manual `/execute-issue` is required

### 4.4 Update Progress

After each issue completes (success or failure):
- Log the result
- Update the orchestration state tracking (mental model, no file write needed)
- Report progress to user

---

## 5. Final Validation & Summary

### 5.1 Run Full Validation

After all issues have been processed:

```bash
$BUILD_CMD && $LINT_CMD && $TEST_CMD
```

### 5.2 Final E2E Validation

After build/lint/test pass, run the full E2E suite to catch cross-issue regressions:

```bash
# Check if Playwright is configured
ls playwright.config.{ts,js,mjs} 2>/dev/null

# If configured, run full suite
$PKG_CMD dev &
DEV_PID=$!
npx wait-on http://localhost:${DEV_PORT:-5173} --timeout 30000
npx playwright test --reporter=list
E2E_EXIT=$?
kill $DEV_PID
```

If E2E fails at this stage, report which tests failed and which issues likely caused the failure (based on files changed per issue).

### 5.3 Generate Summary Report

```
## Orchestration Complete

Branch: {branch}
Total issues: {total}
Completed: {completed_count}
Failed: {failed_count}
Skipped: {skipped_count}

### Results

| Issue | Title | Status | Commit |
|-------|-------|--------|--------|
| #38 | [title] | Completed | abc1234 |
| #39 | [title] | Failed | - |
| #40 | [title] | Skipped (depends on #39) | - |
| #41 | [title] | Completed | def5678 |

### E2E Results Per Issue

| Issue | E2E Status | Visual Status | Notes |
|-------|-----------|---------------|-------|
| #38 | Passed | Passed | — |
| #39 | Failed | — | E2E failures caused issue failure |
| #40 | Skipped | Skipped | Dependency on #39 |
| #41 | Passed | Passed | — |

### Final Validation
- Build: [Pass/Fail]
- Lint: [Pass/Fail]
- Unit Tests: [Pass/Fail]
- E2E Tests (full suite): [Pass/Fail/Skipped]

### Commits Made
```
git log --oneline -{completed_count}
```

### Next Steps
1. Review commits: `git log --oneline -5`
2. Push branch: `git push origin {branch}`
3. Create PR: `gh pr create`

### Issues Requiring Manual Attention
[List any failed or blocked issues with reasons]
```

---

## 6. Subagent Prompt Template

This is the full prompt passed to each subagent via the Task tool:

```markdown
# Issue Execution Task for #{N}

**Branch:** {branch}
**Issue:** #{N}

## STEP 1: Load Required Guidance (MANDATORY FIRST STEP)

Before doing ANYTHING else, read these files to load your execution context:

1. Read `.claude/commands/execute-issue.md` - This is your PRIMARY workflow document
2. Read `CLAUDE.md` - Project context and patterns
3. Read any project documentation referenced in CLAUDE.md

DO NOT proceed until you have read execute-issue.md. This file contains:
- Label-based approach routing
- Pre-flight checklist requirements
- Clean Code standards
- Safe refactoring patterns
- Test-fix-commit workflow
- Compliance checks
- Issue commenting and closing procedures

## STEP 2: Execute the Workflow

Now execute issue #{N} following the execute-issue.md workflow EXACTLY:

1. **Section 1:** Fetch & analyze issue via `gh issue view {N}`
2. **Section 2:** Validate labels & load context
3. **Section 3:** Pre-flight checklist (git clean, build passes)
4. **Section 4:** Setup TodoWrite with issue tasks
5. **Section 5:** Execute implementation (with Clean Code standards)
6. **Section 6:** Validation sequence (build, lint, targeted tests)
7. **Section 7:** Test, fix, commit workflow (LOCAL ONLY - NO PUSH)
8. **Section 7.5:** E2E test execution (detect capability, evaluate risk triggers, write/run E2E tests)
9. **Section 7.6:** Visual review (take screenshots, analyze with vision, fix visual issues)
10. **Section 8:** Compliance check (includes E2E and visual status)
11. **Section 9:** Test coverage validation
12. **Section 10:** Comment results on issue (includes E2E and visual results)
13. **Section 11:** Close issue if all acceptance criteria pass

## CRITICAL RULES

- **NO PUSH** - Commit locally only. The orchestrator handles coordination.
- **NO SKIPPING SECTIONS** - Follow execute-issue.md sequentially, INCLUDING Sections 7.5 and 7.6
- **E2E REQUIRED** - Run E2E tests per Section 7.5. Do NOT skip unless graceful degradation applies.
- **VISUAL REVIEW REQUIRED** - Run visual review per Section 7.6. Do NOT skip unless skip conditions apply.
- **IF BLOCKED** - Stop immediately and report the blocker clearly
- **IF TESTS FAIL** - Follow test-fix cycle (max 5 unit, 3 E2E, 2 visual attempts), then report failure
- **REFINE LABEL** - If issue unexpectedly has `refine` label, report back immediately
- **TWO-TIER E2E** - This project uses two E2E tiers: Tier 1 (`e2e/`) allows mocking for UI integration tests; Tier 2 (`e2e-integration/`) uses real backend (no mocking). Write new E2E tests in `e2e-integration/`. Run both tiers for regression.

## OUTPUT FORMAT

You MUST end your response with this exact structure for the orchestrator to parse:

---
ORCHESTRATION_RESULT:
status: completed|failed|blocked|needs_refinement
issue: {N}
commit_hash: <sha from `git log -1 --format=%H`, or "none" if no commit>
files_changed:
  - <relative path to file 1>
  - <relative path to file 2>
tests_passed: true|false
e2e_status: passed|failed|skipped
e2e_skip_reason: <reason or "none">
visual_status: passed|failed|skipped
visual_skip_reason: <reason or "none">
blockers: <describe any blockers, or "none">
summary: <1-2 sentence summary of what was implemented>
---

This structured output is REQUIRED - the orchestrator depends on it.
```

---

## 7. Error Handling

### 7.1 Circular Dependencies

If topological sort detects a cycle:
```
Circular dependency detected:
  #38 depends on #40
  #40 depends on #39
  #39 depends on #38

These issues cannot be orchestrated automatically.
Please resolve the circular dependency and try again.
```
**Skip** all issues in the cycle, continue with others.

### 7.2 Git Conflicts

If `git status` shows conflicts after a subagent commit:
```
Git conflict detected after issue #{N} commit.

Pausing orchestration. Please resolve conflicts manually:
1. Run `git status` to see conflicted files
2. Resolve conflicts
3. Run `git add .` and `git commit`
4. Re-run orchestration for remaining issues
```
**STOP** - return control to user.

### 7.3 Final Validation Failure

If the final build/lint/test fails:
```
Final validation failed after orchestration.

Failed step: [build|lint|test]
Error: [error message]

Recent commits that may have caused this:
- abc1234 - Issue #38: [title]
- def5678 - Issue #41: [title]

Options:
1. Investigate the failure manually
2. Roll back recent commits: `git reset --soft HEAD~{count}`
3. Fix the issue and commit
```

### 7.4 Subagent Timeout or Failure

If a subagent fails without producing ORCHESTRATION_RESULT:
```
Subagent for issue #{N} did not complete normally.

Last output: [truncated subagent output]

Marking issue #{N} as failed. Continuing with independent issues.
```

---

## Usage Examples

### Execute specific issues

```
/orchestrate-issues 38 39 40 41 42
```

### Execute all open issues on current branch

```
/orchestrate-issues branch
```

---

**Version:** 2.0.0 (canonical)
**Changelog:** Added per-issue E2E + visual review, final E2E validation, extended ORCHESTRATION_RESULT format
