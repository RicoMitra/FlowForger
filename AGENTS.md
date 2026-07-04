# Project Governance

## Owner

This project is owned by **Rico Majesty Daniel Mitra** ([@RicoMitra](https://github.com/RicoMitra)).

## Purpose

FlowForger is a local-first website for deterministic workflow risk analysis. Users paste a Codex/GPT project prompt or implementation plan, then the app scores execution risk before work begins.

FlowForger only analyzes user-provided workflow text and generates deterministic risk results, execution passes, a checklist, and a revised Codex-ready prompt.

## Strict Non-Goals

- No AI chat
- No team workspace
- No cloud sync
- No marketplace
- No account system
- No API routes
- No server-side scoring
- No automatic project execution
- No external API
- No LLM calls
- No login
- No cloud database

## Required Stack

- Next.js with TypeScript
- Tailwind CSS
- shadcn-style local UI primitives
- Recharts
- Vitest and React Testing Library
- pnpm
- Vercel as a separate project

## Data and Privacy Rules

The source of truth is text pasted by the user in the browser. Analysis must run client-side through deterministic TypeScript utilities. Persist only optional local history and settings in `localStorage`.

Do not send prompt text, history, settings, scores, or signals to a server, analytics service, external API, or LLM.

## Scoring Rules

Every score must show evidence and rule triggers. Do not output a risk score without explaining which detected signals contributed to it.

Risk categories:

- Scope & Complexity: 25%
- Workflow Sequence: 20%
- Skill Conflict: 15%
- Test/QA Readiness: 15%
- Deployment Readiness: 10%
- Ambiguity/Context Cost: 15%

Overall risk:

- 0-40: Low
- 41-70: Medium
- 71-100: High

## Decision Policy

Agents may make small reversible implementation decisions that preserve deterministic scoring, privacy, and the approved stack.

Ask the owner before changing product scope, scoring weights, risk thresholds, data storage policy, visual direction, deployment strategy, or adding dependencies that create network/server behavior.

## Quality Guardrails

- Keep scoring utilities framework-independent and covered by unit tests.
- Keep UI components accessible, keyboard-friendly, responsive, and consistent with the dark olive/lime glass visual system.
- No default SaaS template styling.
- No generated score without visible evidence and rule triggers.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before completion.
- Run browser QA on desktop and mobile before deploy or handoff.
