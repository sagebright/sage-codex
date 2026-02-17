# LLM Capabilities Assessment

Technical feasibility analysis for the Sage Codex's LLM-driven architecture — what's easy, what needs careful design, and where the real challenges live.

## Easy (Established Patterns)

**Structured panel updates via tool use.** The Anthropic API supports tool use natively. You define tools like `update_section(scene, section, content)` or `signal_scene_ready(scene)`, and the LLM calls them alongside its chat response. The frontend receives the tool call, updates the panel. This is the standard pattern for LLM-driven UIs — it's exactly how Claude Artifacts work. No invention required.

**Content generation.** Generating narrative text, NPC details, adversary stat blocks, frame properties, portent entries — this is what LLMs are best at. With a good system prompt that encodes Daggerheart's mechanics and the adventure's accumulated context, the output quality will be high.

**Readiness signals and button control.** Just another tool call: `signal_ready(scene: 2)`. The frontend watches for it and enables the button. Trivial.

**Frame generation on-the-fly.** Structured content generation with all properties filled — straightforward. You'd define the frame schema and the LLM fills it in.

## Feasible but Needs Careful Design

**State management is the real engineering problem.** As the adventure grows (up to 6 scenes x 9 sections), the LLM needs to know what's currently in the panel to make targeted updates. The solution is a structured state object that the frontend maintains and passes to the LLM on each turn — not relying on the LLM to "remember" from conversation history. This is a solved pattern but it needs to be designed well upfront.

**Cross-section propagation.** Renaming an NPC should update references in Setup, Developments, Transitions. The LLM *can* do this, but it might miss a reference in a wall of text. A hybrid approach is safer: LLM handles the semantic change, then a deterministic find-and-replace catches any remaining literal string references. Belt and suspenders.

**Streaming tool call content.** The Anthropic API supports streaming tool call arguments, so you can stream a section rewrite into the panel in real-time. It adds frontend complexity but the API supports it natively.

**Undo/revision history.** The LLM doesn't maintain this — it's application state. Store previous versions of each section. When the user says "go back to the previous Setup," the app restores from its own history. This is a frontend/storage concern, not an LLM limitation.

## The Real Challenges

**Context window management.** A full adventure session will be long. Conversation history + current panel state + Daggerheart reference data (frame details, adversary stat blocks from DB, etc.) all compete for tokens. Claude supports 200K tokens, which is generous, but cost scales with context length. Strategies:
- Summarize earlier conversation turns (confirmed scenes don't need full chat replay)
- Only include the active scene's full state; compress confirmed scenes to summaries
- Be strategic about when to include Daggerheart reference data

**Latency.** Generating a full scene draft (9 sections) could take 10-30 seconds. Streaming helps with perceived speed, and the wave model actually helps too — you don't generate all 9 at once. But there will be moments where the user waits. The animation philosophy (thinking pulse, streaming text) is designed to make this feel alive rather than stuck.

**Narrative consistency across scenes.** The LLM needs to maintain consistency: an NPC introduced in Scene 1 must be coherent in Scene 4. This is prompt engineering + state management, not a capability gap. Passing the accumulated adventure state (not just conversation history) on each turn is what makes this work.

## Bottom Line

The hardest part of this project is not "can the LLM do it" — it can. The hardest part is **state management and context design**: deciding what the LLM sees on each turn, how panel state flows between frontend and API, and how you keep the context window efficient as the adventure grows. Those are standard software engineering problems, not AI capability problems.

The tool-use pattern for structured panel updates is the exact right approach. The Sage doing heavy lifting is well-matched to what the API can actually deliver.
