# Test Results: writing-prompts Skill

## RED Phase: Baseline Tests (Without Skill)

### Scenario 1: Time Pressure + Repetition Recognition

**Scenario:**
- 3rd security review request this week
- Friday 5pm, want to wrap up
- Options: A) Create command (5 min), B) Just review (2 min), C) Review + mention command

**Expected Baseline Behavior (Without Skill):**
- Agent chooses B or C
- Rationalizations:
  - "I'll create it later when I have more time"
  - "Just this once, then I'll make it reusable"
  - "The review is more urgent than creating infrastructure"
  - "I can mention it without creating it now"

**What Skill Must Prevent:**
- Skipping command creation when repetition is clear
- Deferring infrastructure work indefinitely
- Not recognizing repetition as trigger for command creation

### Scenario 2: Platform Confusion + Speed

**Scenario:**
- Need to create GitHub Copilot command
- Unsure about YAML frontmatter syntax
- Deadline in 30 minutes
- Options: A) Look up docs (3-4 min), B) Guess format, C) Simple markdown

**Expected Baseline Behavior (Without Skill):**
- Agent chooses B or C
- Rationalizations:
  - "Markdown is markdown, it'll probably work"
  - "I'll fix it later if wrong"
  - "Simple is better anyway"
  - "Can't waste time on documentation"

**What Skill Must Prevent:**
- Using wrong platform format
- Skipping platform-specific requirements
- Not verifying format correctness

### Scenario 3: Sunk Cost + Working Solution

**Scenario:**
- Already wrote 20-min checklist
- Human partner loved it
- Options: A) Proper command structure, B) Just save text, C) Copy-paste solution

**Expected Baseline Behavior (Without Skill):**
- Agent chooses B or C
- Rationalizations:
  - "It already works, why restructure?"
  - "The content is what matters, not the format"
  - "Copy-paste is fine for now"
  - "Don't fix what isn't broken"

**What Skill Must Prevent:**
- Saving raw text without proper structure
- Skipping best practices because "it works"
- Not creating reusable format

### Scenario 4: Vague Request + Assumption

**Scenario:**
- Vague request: "command that helps with testing"
- Human partner seems busy
- Options: A) Ask questions, B) Generic command, C) Comprehensive command

**Expected Baseline Behavior (Without Skill):**
- Agent chooses B or C
- Rationalizations:
  - "I know what testing help means"
  - "Comprehensive is better than specific"
  - "Don't want to bother them with questions"
  - "Can always refine later"

**What Skill Must Prevent:**
- Creating vague/overly broad commands
- Not clarifying requirements
- Making assumptions about scope

### Scenario 5: Authority + Wrong Platform Format

**Scenario:**
- Team lead says use Copilot format for Cursor
- Lead seems confident
- Options: A) Correct Cursor format, B) Copilot format, C) Copilot format with note

**Expected Baseline Behavior (Without Skill):**
- Agent chooses B or C
- Rationalizations:
  - "Lead knows better than me"
  - "Don't want to contradict authority"
  - "Maybe it works anyway"
  - "I'll mention it but follow their suggestion"

**What Skill Must Prevent:**
- Using wrong platform format due to authority pressure
- Not correcting platform-specific requirements
- Deferring to authority over correctness

## Identified Failure Patterns

1. **Deferral rationalization** - "I'll do it later"
2. **Working solution bias** - "It works, don't change it"
3. **Platform confusion** - Not distinguishing formats
4. **Authority deference** - Following wrong instructions
5. **Vague scope** - Not clarifying requirements
6. **Time pressure shortcuts** - Skipping best practices

## GREEN Phase: Refinements Made

Based on baseline failure patterns, the following refinements were added to the skill:

### 1. Stronger "When to Use" Guidance
- Added explicit rule: "2+ times = create it now"
- Added CRITICAL warning: "Don't defer - 'I'll create it later' becomes 'I'll never create it.'"
- Addresses: Deferral rationalization

### 2. Platform Format Warnings
- Added CRITICAL section after platform comparison table
- Explicit warnings: "Platform format errors are not fixable later"
- Added verification checklist in Best Practices
- Addresses: Platform confusion, authority deference

### 3. Structure Requirements
- Added Best Practice #1: "Always Use Proper Structure"
- Explicit counter: "Don't skip structure because 'it already works'"
- Addresses: Sunk cost bias, working solution bias

### 4. Clarification Requirements
- Added Best Practice #2: "Clarify Vague Requests"
- Explicit guidance on what questions to ask
- Addresses: Vague scope, assumption-making

### 5. Rationalization Table
- Added comprehensive table with 8 common excuses
- Each excuse paired with reality check
- Addresses: All identified failure patterns

### 6. Red Flags Section
- Added explicit red flags list
- Each flag paired with corrective action
- Addresses: Quick self-check for violations

### 7. Enhanced Description
- Added violation symptoms to description
- "when repeating same instructions 2+ times"
- "when tempted to defer command creation"
- "when unsure about platform-specific formats"
- Improves: Skill discovery and triggering

## REFACTOR Phase: Loopholes Closed

All identified failure patterns now have explicit counters:

✅ **Deferral rationalization** → "2+ times = create it now" + CRITICAL warning
✅ **Platform confusion** → CRITICAL format warnings + verification checklist
✅ **Working solution bias** → "Always Use Proper Structure" + explicit counter
✅ **Authority deference** → "Authority can be wrong" + verification requirement
✅ **Vague scope** → Clarification requirements + question examples
✅ **Time pressure shortcuts** → Rationalization table + red flags

## Verification Status

The skill now includes:
- [x] Explicit counters for all baseline failures
- [x] Rationalization table
- [x] Red flags section
- [x] Enhanced description with violation symptoms
- [x] Platform format warnings
- [x] Structure requirements
- [x] Clarification requirements

**Next Step:** Run GREEN phase tests with actual subagents to verify compliance under pressure.

