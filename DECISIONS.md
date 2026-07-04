# Decision Log

This file records approved product and technical decisions.

## D-001: Deterministic Workflow Risk Analyzer

- **Status:** Accepted
- **Decision:** Build FlowForger as a deterministic risk analyzer for pasted Codex/GPT workflow text.
- **Rationale:** Rule-based analysis is explainable, testable, local-first, and avoids AI judgment.
- **Consequence:** Every score must expose evidence and rule triggers.

## D-002: Strict Client-Side Execution

- **Status:** Accepted
- **Decision:** Run all analysis in the browser with no API routes, server-side scoring, external APIs, LLM calls, login, or database.
- **Rationale:** Prompt text can contain private project plans and should not leave the device.
- **Consequence:** The MVP uses pure TypeScript utilities and local browser state only.

## D-003: Weighted Category Model

- **Status:** Accepted
- **Decision:** Use Scope & Complexity 25%, Workflow Sequence 20%, Skill Conflict 15%, Test/QA Readiness 15%, Deployment Readiness 10%, and Ambiguity/Context Cost 15%.
- **Rationale:** Fixed weights make the overall score transparent and reproducible.
- **Consequence:** Weight or threshold changes require a decision update.

## D-004: Local History Only

- **Status:** Accepted
- **Decision:** Persist recent analyses and settings in `localStorage`.
- **Rationale:** Local history improves usability without accounts or cloud sync.
- **Consequence:** Provide a clear history reset and never sync data elsewhere.

## D-005: Bubble-Glass Visual System

- **Status:** Accepted
- **Decision:** Use a premium dark olive/black dashboard with yellow-lime glow, translucent bubble panels, rounded cards, glass surfaces, and restrained motion.
- **Rationale:** The product should feel distinctive and serious, not like a generic SaaS dashboard.
- **Consequence:** Apply the system consistently across sidebar, editor, score, results, checklist, history, settings, controls, and responsive states.

## D-006: Separate GitHub and Vercel Project

- **Status:** Accepted
- **Decision:** Ship FlowForger as its own public GitHub repository and separate Vercel project.
- **Rationale:** It must not be combined with unrelated projects.
- **Consequence:** Initialize a separate Git repository in the `FlowForger` folder.
