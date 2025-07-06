# Build Journal Protocol (Operator's Manual v2.0)

## Overview

The Build Journal Protocol is a systematic approach to maintaining vision alignment and project integrity through structured documentation and clear separation of concerns. It ensures that every decision, change, and implementation is traceable back to the project's core vision and principles.

## Core Components

### 1. Canonical Directory Structure

The project follows a four-layer directory structure that enforces clear separation of concerns:

```
/01_theory     - Philosophy, metaphors, narrative lore
/02_intent     - UX narratives, product briefs, user stories  
/03_contract   - Schemas, manifests, OpenAPI specs, JSON rules
/04_impl       - Production code, tests, assets, infrastructure
```

### 2. Canon-Layer Separation Rules

**Critical Constraints:**
- **No cross-imports** from higher-numbered to lower-numbered directories
- **All implementation code** must be generated from `/03_contract` materials
- **Each layer** serves its distinct purpose without contamination
- **Theory informs intent, intent drives contracts, contracts generate implementation**

**Layer Responsibilities:**
- **Theory (01)**: Establishes the philosophical foundation and mental models
- **Intent (02)**: Defines what we're trying to achieve and why
- **Contract (03)**: Specifies how we'll achieve it (schemas, APIs, rules)
- **Implementation (04)**: The actual working code and assets

### 3. Purpose-Tag Mandate

Every file, commit message, and PR title must begin with a valid purpose tag:

- **[clarify]** - Understanding, documentation, specification, research
- **[accelerate]** - Performance, optimization, speed, efficiency
- **[safeguard]** - Security, safety, protection, risk mitigation
- **[monetize]** - Revenue, business value, growth, sustainability
- **[empathize]** - User experience, accessibility, human needs, compassion
- **[delight]** - Joy, satisfaction, positive experience, celebration

### 4. Build Journal Structure

The `BUILD_JOURNAL.md` file serves as the single, append-only event log containing:

#### Mission (🎯)
- **seek**: The core intent of the current work phase
- **why**: The purpose and reasoning behind the mission
- **Statement**: Clear, actionable objective

#### Pillars (🏛️)
- **seek**: The core intent of each principle
- **why**: The purpose and reasoning behind each pillar
- **Immutable**: These principles govern all decisions

#### Epics (🗺️)
- **seek**: The core intent of the thematic area
- **why**: The purpose and alignment with pillars
- **Scope**: Large-scale, thematic areas of work

#### Sagas (📜)
- **seek**: The core intent of the concrete project
- **why**: The purpose and expected outcome
- **Goal**: Clear, measurable objectives with recorded outcomes

#### Probes (🔎)
- **seek**: The core intent of the experiment
- **why**: The purpose and hypothesis being tested
- **expires_on**: Time-boxed with expiration dates
- **Status**: Proposed, Active, Blocked, Integrated, Archived, Dormant

## Workflow

### 1. Propose
- Architect or Operator proposes new Sagas or Probes
- Live Alignment Check ensures work aligns with Mission and Pillars
- Purpose tags are assigned and documented

### 2. Explore
- Explorer (human or AI) executes the work
- Progress is logged in the Build Journal
- Context and learnings are captured

### 3. Integrate
- Automated closure when work is complete
- Artifacts are scraped and summarized
- Wisdom is distilled and stored
- Status is updated to Integrated

## Quality Assurance

### Alignment Checks
- Every proposal must pass a Live Alignment Check
- Work must align with current Mission and Pillars
- Purpose tags must be valid and appropriate

### Documentation Standards
- All entries must be timestamped
- Purpose tags are mandatory
- Context must be sufficient for future reference
- No entries may be deleted or modified - only appended

### Review Cadence
- Weekly alignment reviews of the Systemic Ledger
- Automated pruning of expired Probes
- Regular validation of canon-layer separation

## Implementation Guidelines

### File Naming
- Use purpose tags in filenames: `[clarify]-user-research.md`
- Include layer prefixes: `01_theory/[empathize]-accessibility-principles.md`
- Maintain clear, descriptive names

### Commit Messages
- Start with purpose tag: `[accelerate] Optimize database queries`
- Include context and reasoning
- Reference related journal entries

### Pull Request Titles
- Use purpose tags: `[safeguard] Add input validation`
- Be descriptive and specific
- Link to relevant journal entries

## Tools and Automation

### Validation Scripts
- Purpose tag validation
- Canon-layer separation checks
- Build Journal format validation

### Templates
- Standard entry templates for each level
- Purpose tag reference cards
- Alignment check checklists

## Success Metrics

- **Vision Alignment**: All work traces back to Mission and Pillars
- **Documentation Quality**: Complete, clear, and useful journal entries
- **Protocol Adherence**: Consistent use of purpose tags and directory structure
- **Knowledge Retention**: Wisdom is captured and reused effectively

---

*This protocol ensures that the Vision Holder project maintains its integrity and alignment with the user's vision throughout all phases of development.* 