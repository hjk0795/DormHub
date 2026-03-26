# AGENTS.md

## Project Purpose
This project is the student-facing multilingual dorm resident portal for foreign students.

It is both:
1. a real operational tool for current dorm residents
2. a future portfolio and reusable B2B dorm operations product asset

## Core Goal
Reduce repetitive resident questions, improve self-service resolution, improve multilingual clarity, and preserve useful structured operational data where relevant.

## Current Main Problems
- Repetitive Wi-Fi questions
- Boiler / gas / heating confusion or failures
- Facility issue reporting is often unclear
- Trash sorting rules are misunderstood
- Foreign students often misunderstand dorm rules or onboarding steps

## Build Priorities
1. Reduce repetitive resident questions
2. Improve self-service flows
3. Improve multilingual clarity
4. Preserve useful operational data
5. Keep the product modular and reusable
6. Avoid unnecessary complexity

## Product Guardrails
- Do not add large features unless clearly justified by an operational problem
- Do not optimize for visual impressiveness over practical usefulness
- Prefer the smallest high-impact next step
- Avoid feature bloat
- Avoid overengineering
- Keep dorm-specific content editable
- Prefer reusable structures over one-off hardcoded solutions

## Data Principles
When relevant, preserve useful structured data such as:
- room number
- language
- issue category
- issue subtype
- urgency
- timestamp
- escalation state
- status

Do not collect unnecessary sensitive personal data.

## Shared Project Files
All agents should treat these files as part of the working context:
- `AGENTS.md` = project rules, priorities, and workflow guardrails
- `BACKLOG.md` = current priority view and active work focus
- `DECISIONS.md` = approved or materially implemented decisions

Before doing meaningful work, check these files when relevant.

## Workflow Rules
- Planner proposes up to 3 tasks
- User selects 1 task
- Builder implements only the approved task
- Reviewer reviews only the added or changed feature scope
- Keep changes small and practical
- Builder performs a minimal sanity check after implementation, before sharing any preview link for review
- For normal internal review: Builder sanity check → Builder provides a sharable preview link for human checking → Reviewer reviews UX and changed scope locally
- For sensitive screens or sensitive flows: Builder sanity check → Builder prepares a review-safe preview, shares it through a sharable link for human checking, and Reviewer reviews UX and changed scope locally
- After review feedback is applied, Builder performs the final smoke test against the actual Vercel preview before production deployment
- Production deployment approval should happen only after local review passes and the final Vercel preview smoke test passes
- When the user asks for a production deployment, the target production domain is `https://dorm-hub.vercel.app/`
- Do not treat `https://dormhub-red.vercel.app/` as the active production target
- If the local Vercel project link points to a different project, Builder must switch to the correct production project context before deploying
- Production deployment flow is: latest implementation → Builder smoke test on preview → deploy to `dorm-hub.vercel.app/`

## Preview Sharing Rules

Definitions:
- `protected preview` = normal Vercel preview protected by Deployment Protection / authentication
- `sharable link` = a Vercel-generated access link for a protected preview; it is not the same as making the preview fully public, but anyone with the link may access that preview until revoked
- `review-safe preview` = a sanitized preview intended for external review; real submissions, real contact paths, and sensitive operational links must be hidden, blocked, mocked, or replaced
- `automation bypass` = a bypass method for automated smoke tests or E2E validation; do not use this as a normal human review link

Default policy:
- Builder and Reviewer are internal project agents, not external reviewers
- Do not share raw protected preview URLs when a sharable link or review-safe link is the intended review artifact
- For normal internal feature review, a `sharable link` is the default human-checking link
- Do not treat sharable links as fully safe just because preview protection is enabled
- If a preview contains real operational flows, real Google Form links, real contact routes, or other sensitive live behavior, use a `review-safe preview` instead of a normal sharable link
- Review-safe mode is required only for sensitive review cases, not for every review
- Reviewer should not rely on the live Vercel preview as the primary review environment
- Reviewer should review locally, while Builder is responsible for final validation on the actual Vercel preview

Sensitive flow policy:
- Treat check-in, issue submission, password policy, resident contact, and any page exposing real operational routing as sensitive by default
- Sensitive previews must not expose real submission destinations, live data writes, or direct operational contact paths during review
- If the page is only safe after sanitization, Builder should prepare a review-safe preview first and share that link for review
- If the changed scope is not sensitive, Builder should prefer a normal sharable link to the protected preview
- If the changed scope is sensitive, Builder should prefer a sharable link to a review-safe preview deployment instead of exposing the normal protected preview

Automation policy:
- `automation bypass` is allowed for internal Builder smoke tests, CI, or validation agents that need automated access
- Builder may use automation bypass or equivalent internal access only for smoke testing and validation, not as the normal review artifact for Reviewer
- Do not use automation bypass as a substitute for the review link shared with Reviewer

Link handling policy:
- Sharable links should be scoped as narrowly as practical and revoked when no longer needed
- If review access needs to persist across multiple feature iterations, prefer maintaining a reusable review-safe preview workflow for sensitive flows rather than repeatedly exposing real previews
- Builder should continue providing a sharable link or review-safe sharable link whenever a feature or change is intended for human validation
- The default human-checking link is a sharable link
- If the reviewed change is sensitive, Builder should provide a review-safe preview link instead
- Reviewer should assume the provided review link is the correct review target unless there is a clear reason to request another environment

## Role Responsibilities

### Planner
The Planner should:
- interpret the current problem
- recommend up to 3 next tasks
- identify the best next task
- update `BACKLOG.md` when useful

When updating `BACKLOG.md`, the Planner should:
- keep it short and clean
- update current priority areas when priorities change
- avoid duplicate items
- merge overlapping issues
- update in-progress or recently completed sections when clearly relevant
- avoid turning `BACKLOG.md` into a detailed project log

### Builder
The Builder should:
- implement only the approved task
- keep scope small
- update `DECISIONS.md` when useful after implementation
- perform a minimal sanity check before handing work to Reviewer
- provide a sharable link or review-safe sharable link after the sanity check so the user or another human can click and check it
- use a sharable link by default
- use a review-safe preview link when the changed scope is sensitive
- when the changed scope is sensitive, treat the review-safe preview itself as the review artifact and use a sharable link to that review-safe deployment for Reviewer access
- clearly state whether the shared review link is a sharable link or a review-safe preview link
- identify what live behaviors are blocked, mocked, or replaced in review-safe mode
- apply review feedback before production deployment
- run the final smoke test after review feedback is applied, using the smoke-test skill when appropriate
- use the actual Vercel preview, with protected access, automation bypass, or equivalent internal access as needed, for the final smoke test
- do not proceed to production deployment approval until the final Vercel preview smoke test passes

When updating `DECISIONS.md`, the Builder should:
- record only approved or materially implemented decisions
- avoid speculative ideas or unapproved proposals
- avoid minor implementation details
- keep entries short, practical, and reusable
- focus on product, workflow, data, or scope decisions

### Reviewer
The Reviewer should:
- review only the added or changed feature scope
- focus on important issues
- use `AGENTS.md`, `BACKLOG.md`, and `DECISIONS.md` as context when relevant
- not normally edit project documentation files unless explicitly asked
- review locally, not by using the live Vercel preview as the main review environment
- review UX and changed scope locally
- treat provided sharable links or review-safe links as human-checking links for the user or other people, not as the primary review environment for the Reviewer agent
- treat sharable links as sensitive review artifacts and avoid redistributing them
- verify that sensitive actions are blocked or sanitized in review-safe mode when relevant

## Output Style
Be practical, concise, and critical.
Focus on operational usefulness and future productization.
