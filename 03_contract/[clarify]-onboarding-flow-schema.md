# [clarify] Onboarding Flow Schema

This document formalises the data models and REST endpoints required to deliver the **Guided User Onboarding Flow** (Epic 1) under Mission **onboard_users**.

---

## Data Models

### onboarding_step
| field | type | notes |
|-------|------|-------|
| id | string | Unique identifier (slug/UUID). |
| title | string | Short title displayed in UI. |
| description | string | Detailed explanation of the step's purpose. |
| order | number | Execution order (ascending). |
| component | "roadmap"\|"chat"\|"knowledge"\|"terminal" | Indicates which main tab the step relates to. |
| tooltip | string | Small tooltip text shown in UI. |
| cta | string | Call-to-action label (e.g. "Open Roadmap"). |

### user_onboarding_state
| field | type | notes |
|-------|------|-------|
| user_id | string | Auth/anon session identifier. |
| current_step | onboarding_step.id | The step currently displayed. |
| completed_steps | onboarding_step.id[] | History of completed steps. |
| started_at | ISO-8601 | Timestamp when onboarding began. |
| completed_at | ISO-8601\|null | Timestamp when onboarding finished, or null if in progress. |

---

## REST Endpoints (contract-level)

| method | path | purpose-tag | description |
|--------|------|------------|-------------|
| GET | /onboarding/steps | [clarify] | Retrieve ordered list of **onboarding_step** objects. |
| GET | /onboarding/state | [clarify] | Fetch **user_onboarding_state** for current user (session/cookie). |
| POST | /onboarding/state | [clarify] | Update or create **user_onboarding_state**; request body is full or partial state object. |

All endpoints must:
1. Conform to JSON API style responses `{ data: <payload>, meta?: {...} }`.
2. Return `200` on success; `201` when a new state object is first created.
3. Validate request bodies against the above schema with clear error messages.

---

## Contract-Driven Notes
- Implementation (to be added in `/04_impl`) **must not diverge** from these field names & types.
- Any future change requires a new `[clarify]` journal entry and version bump. 