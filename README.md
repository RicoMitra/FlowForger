# FlowForger

FlowForger is a local-first workflow risk analyzer for Codex/GPT project prompts and implementation plans. Paste workflow text, run deterministic scoring, inspect evidence for every warning, and generate safer execution passes, a checklist, and a revised Codex-ready prompt.

No login, cloud database, API routes, external API, LLM calls, server-side scoring, cloud sync, or automatic execution.

## Features

- Deterministic weighted scoring across six categories.
- Visible evidence and rule triggers for every category and overall risk score.
- Failure points, recommended execution passes, execution checklist, and revised prompt.
- Local-only analysis history and settings via `localStorage`.
- Premium dark olive/lime glass dashboard UI.
- Unit and component tests for scoring and critical UI behavior.

## Scoring Model

- Scope & Complexity: 25%
- Workflow Sequence: 20%
- Skill Conflict: 15%
- Test/QA Readiness: 15%
- Deployment Readiness: 10%
- Ambiguity/Context Cost: 15%

Risk levels:

- `0-40`: Low
- `41-70`: Medium
- `71-100`: High

## Local Setup

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Deployment

FlowForger is intended to deploy as a separate Vercel project connected to its own public GitHub repository:

- GitHub: https://github.com/RicoMitra/FlowForger
- Vercel: pending deployment
