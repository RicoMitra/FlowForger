# Project Context

## Product Summary

FlowForger is a local-first workflow risk dashboard. It helps a user paste a Codex/GPT project prompt or execution plan, inspect deterministic risk signals, and generate safer execution passes before implementation begins.

It is not an AI agent, chat tool, team workspace, cloud project manager, marketplace, or execution automation system.

## Target User and Experience

The primary user is an individual builder who wants to reduce project execution failure before handing work to Codex or GPT-style coding agents.

The interface should feel premium, futuristic, serious, and dashboard-grade: deep black and olive background, yellow-lime glow accents, soft translucent bubble panels, rounded floating cards, glassy surfaces, strong contrast, restrained motion, and consistent styling across every surface.

## MVP Capabilities

- Paste workflow text into a browser editor.
- Parse deterministic signals from the text: deliverables, skills, phases, tests, deployment terms, verification terms, unclear words, rollback/checkpoint terms, context length, and sequencing order.
- Score risk across six weighted categories.
- Show every category score with evidence and rule triggers.
- Show overall risk with weighted contribution evidence.
- Generate failure points, recommended execution passes, an execution checklist, and a revised Codex-ready prompt.
- Persist recent analyses and display settings in `localStorage`.
- Clear local history.
- Run fully client-side with no server routes, external APIs, LLM calls, login, database, or cloud sync.

## Analysis Workflow

1. Capture the pasted workflow text in the browser.
2. Normalize text into lowercase tokens and deterministic signal arrays.
3. Score each category from rule triggers and visible evidence.
4. Calculate weighted total and risk level.
5. Present the score, stress-test breakdown, rule triggers, failure points, passes, checklist, and revised prompt.
6. Save optional local history after the user runs an analysis.
7. Verify behavior through unit tests, component tests, build checks, and browser QA.

## Architecture

- `src/lib/flowforger.ts` contains framework-independent scoring types, signal extraction, weighted category scoring, execution passes, checklist, and revised prompt generation.
- `src/components/flowforger-dashboard.tsx` contains the client dashboard, local persistence, controls, and result presentation.
- `src/app/page.tsx` renders the dashboard.
- `src/app/globals.css` owns the visual system.

No `src/app/api` route should exist for this MVP.

## Definition of Done

The MVP is complete when a user can paste workflow text, run analysis, inspect evidence for every score, use generated passes/checklist/revised prompt, save and clear local history, and use the app on desktop and mobile. Linting, type checking, tests, production build, and browser QA must pass before deployment.
