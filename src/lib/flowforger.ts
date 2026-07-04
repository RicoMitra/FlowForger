export type RiskLevel = "Low" | "Medium" | "High";

export type CategoryId =
  | "scope"
  | "sequence"
  | "skill"
  | "testing"
  | "deployment"
  | "ambiguity";

export type CategoryScore = {
  id: CategoryId;
  label: string;
  weight: number;
  score: number;
  evidence: string[];
  ruleTriggers: string[];
};

export type WorkflowSignals = {
  wordCount: number;
  deliverables: string[];
  skills: string[];
  phases: string[];
  hasTests: boolean;
  hasVerification: boolean;
  hasBuild: boolean;
  hasDeploy: boolean;
  hasBrowserQa: boolean;
  hasRollback: boolean;
  vagueWords: string[];
  timelinePressure: boolean;
  uiBeforeCore: boolean;
  manySkillsOnePhase: boolean;
};

export type WorkflowAnalysis = {
  signals: WorkflowSignals;
  categories: CategoryScore[];
  overall: {
    score: number;
    level: RiskLevel;
    evidence: string[];
    ruleTriggers: string[];
  };
  failurePoints: string[];
  executionPasses: string[];
  checklist: string[];
  revisedPrompt: string;
};

const CATEGORY_META: Record<CategoryId, { label: string; weight: number }> = {
  scope: { label: "Scope & Complexity", weight: 0.25 },
  sequence: { label: "Workflow Sequence", weight: 0.2 },
  skill: { label: "Skill Conflict", weight: 0.15 },
  testing: { label: "Test/QA Readiness", weight: 0.15 },
  deployment: { label: "Deployment Readiness", weight: 0.1 },
  ambiguity: { label: "Ambiguity/Context Cost", weight: 0.15 },
};

const DELIVERABLE_TERMS = [
  "dashboard",
  "sidebar",
  "settings",
  "history",
  "checklist",
  "prompt",
  "chart",
  "editor",
  "marketplace",
  "auth",
  "account",
  "api",
  "database",
  "mobile",
  "landing",
  "docs",
  "vercel",
  "github",
  "analytics",
  "billing",
  "workspace",
  "chat",
];

const SKILL_TERMS = [
  "gpt taste",
  "taste-skill",
  "ui/ux pro max",
  "emil design",
  "ponytail",
  "caveman",
  "superpowers",
  "browser use",
  "computer use",
  "tdd",
  "frontend",
  "design",
];

const VAGUE_TERMS = [
  "premium",
  "polished",
  "beautiful",
  "fast",
  "robust",
  "clean",
  "modern",
  "soon",
  "asap",
  "simple",
  "better",
  "improved",
];

function uniqueMatches(text: string, terms: string[]) {
  return terms.filter((term) => text.includes(term));
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function category(id: CategoryId, score: number, evidence: string[], ruleTriggers: string[]): CategoryScore {
  const meta = CATEGORY_META[id];
  return {
    id,
    label: meta.label,
    weight: meta.weight,
    score: clampScore(score),
    evidence,
    ruleTriggers,
  };
}

function addNeutralEvidence(evidence: string[], trigger: string[], message: string) {
  if (evidence.length === 0) {
    evidence.push(message);
    trigger.push("no-major-risk-detected");
  }
}

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 40) return "Low";
  if (score <= 70) return "Medium";
  return "High";
}

export function extractSignals(input: string): WorkflowSignals {
  const text = input.toLowerCase();
  const words = text.match(/[a-z0-9/+-]+/g) ?? [];
  const deliverables = uniqueMatches(text, DELIVERABLE_TERMS);
  const skills = uniqueMatches(text, SKILL_TERMS);
  const vagueWords = uniqueMatches(text, VAGUE_TERMS);
  const phases = text.match(/\b(first|second|third|phase|pass|step|last)\b/g) ?? [];
  const uiIndex = text.search(/\b(ui|design|polish|animation|visual|style)\b/);
  const coreIndex = text.search(/\b(engine|logic|scoring|parser|calculation|test)\b/);
  const mentionsTests = /\b(test|tests|vitest|jest|qa|unit|component)\b/.test(text);
  const rejectsTests = /\b(no|without|skip|missing|later)\s+(tests?|qa|verification)\b|\btests?\s+(later|missing|not included)\b/.test(text);

  return {
    wordCount: words.length,
    deliverables,
    skills,
    phases,
    hasTests: mentionsTests && !rejectsTests,
    hasVerification: /\b(lint|typecheck|type check|verify|verification|check)\b/.test(text),
    hasBuild: /\b(pnpm|npm|yarn|bun)\s+build\b|\bproduction build\b|\brun (the )?build\b|\bbuild verification\b/.test(text),
    hasDeploy: /\b(deploy|deployment|vercel|publish|release)\b/.test(text),
    hasBrowserQa: /\b(browser qa|browser check|playwright|viewport|mobile viewport|desktop viewport)\b/.test(text),
    hasRollback: /\b(rollback|checkpoint|commit|branch|restore|revert)\b/.test(text),
    vagueWords,
    timelinePressure: /\b(today|tomorrow|asap|urgent|quickly|in one pass|single pass)\b/.test(text),
    uiBeforeCore: uiIndex >= 0 && coreIndex >= 0 && uiIndex < coreIndex,
    manySkillsOnePhase: skills.length >= 6 && phases.length <= 2,
  };
}

function scoreScope(signals: WorkflowSignals) {
  const evidence: string[] = [];
  const triggers: string[] = [];
  let score = 15;

  if (signals.deliverables.length >= 8) {
    score += 60;
    evidence.push(`${signals.deliverables.length} deliverable signals detected: ${signals.deliverables.join(", ")}.`);
    triggers.push("too-many-deliverables-one-pass");
  } else if (signals.deliverables.length >= 4) {
    score += 35;
    evidence.push(`${signals.deliverables.length} deliverable signals detected; split into passes.`);
    triggers.push("multi-deliverable-scope");
  }

  if (signals.timelinePressure) {
    score += 15;
    evidence.push("Timeline pressure detected, which increases execution risk.");
    triggers.push("timeline-pressure");
  }

  if (signals.wordCount > 220) {
    score += 12;
    evidence.push(`${signals.wordCount} words detected; context cost is high for one execution pass.`);
    triggers.push("large-context-window");
  }

  addNeutralEvidence(evidence, triggers, "Scope appears bounded for one planned execution.");
  return category("scope", score, evidence, triggers);
}

function scoreSequence(signals: WorkflowSignals) {
  const evidence: string[] = [];
  const triggers: string[] = [];
  let score = 15;

  if (signals.uiBeforeCore) {
    score += 55;
    evidence.push("UI polish appears before core logic or scoring engine work.");
    triggers.push("ui-polish-before-core-logic");
  }

  if (signals.hasDeploy && !signals.hasVerification) {
    score += 25;
    evidence.push("Deployment is requested before explicit verification gates.");
    triggers.push("deploy-before-verification");
  }

  if (!signals.hasRollback) {
    score += 20;
    evidence.push("No rollback, branch, commit, or checkpoint language detected.");
    triggers.push("missing-rollback-checkpoint");
  }

  addNeutralEvidence(evidence, triggers, "Sequence mentions no major ordering hazard.");
  return category("sequence", score, evidence, triggers);
}

function scoreSkill(signals: WorkflowSignals) {
  const evidence: string[] = [];
  const triggers: string[] = [];
  let score = 10;

  if (signals.manySkillsOnePhase) {
    score += 65;
    evidence.push(`${signals.skills.length} requested skills appear in one phase: ${signals.skills.join(", ")}.`);
    triggers.push("too-many-skills-one-phase");
  } else if (signals.skills.length >= 4) {
    score += 35;
    evidence.push(`${signals.skills.length} skills detected; sequencing their responsibilities matters.`);
    triggers.push("skill-load-needs-sequencing");
  }

  if (signals.skills.includes("caveman") && signals.skills.some((skill) => skill.includes("design") || skill.includes("ui/ux"))) {
    score += 10;
    evidence.push("Terse-output skill and design-polish skills both appear; align output style separately from UI quality.");
    triggers.push("communication-style-vs-design-depth");
  }

  addNeutralEvidence(evidence, triggers, "Skill set appears small enough for one pass.");
  return category("skill", score, evidence, triggers);
}

function scoreTesting(signals: WorkflowSignals) {
  const evidence: string[] = [];
  const triggers: string[] = [];
  let score = 10;

  if (!signals.hasTests) {
    score += 60;
    evidence.push("No explicit test plan detected.");
    triggers.push("missing-test-plan");
  }

  if (!signals.hasVerification) {
    score += 20;
    evidence.push("No lint, typecheck, or verification command detected.");
    triggers.push("missing-verification-commands");
  }

  if (signals.hasBrowserQa && !signals.hasBuild) {
    score += 12;
    evidence.push("Browser QA is mentioned without build verification first.");
    triggers.push("browser-qa-before-build");
  }

  addNeutralEvidence(evidence, triggers, "Testing and verification gates are visible.");
  return category("testing", score, evidence, triggers);
}

function scoreDeployment(signals: WorkflowSignals) {
  const evidence: string[] = [];
  const triggers: string[] = [];
  let score = signals.hasDeploy ? 30 : 8;

  if (signals.hasDeploy && !signals.hasBuild) {
    score += 45;
    evidence.push("Deploy request detected without production build verification.");
    triggers.push("deploy-without-build-verification");
  }

  if (signals.hasDeploy && !signals.hasBrowserQa) {
    score += 15;
    evidence.push("Deploy request detected without browser QA evidence.");
    triggers.push("deploy-without-browser-qa");
  }

  if (!signals.hasDeploy) {
    evidence.push("No deployment request detected.");
    triggers.push("deployment-out-of-scope");
  }

  return category("deployment", score, evidence, triggers);
}

function scoreAmbiguity(signals: WorkflowSignals) {
  const evidence: string[] = [];
  const triggers: string[] = [];
  let score = 10;

  if (signals.vagueWords.length >= 5) {
    score += 45;
    evidence.push(`Vague quality terms detected: ${signals.vagueWords.join(", ")}.`);
    triggers.push("many-vague-quality-terms");
  } else if (signals.vagueWords.length > 0) {
    score += 20;
    evidence.push(`Ambiguous terms need concrete acceptance criteria: ${signals.vagueWords.join(", ")}.`);
    triggers.push("vague-scope-language");
  }

  if (signals.wordCount > 300) {
    score += 35;
    evidence.push(`${signals.wordCount} words detected; context cost can hide constraints.`);
    triggers.push("high-context-cost");
  } else if (signals.wordCount > 160) {
    score += 20;
    evidence.push(`${signals.wordCount} words detected; summarize constraints before execution.`);
    triggers.push("medium-context-cost");
  }

  addNeutralEvidence(evidence, triggers, "Ambiguity and context cost appear low.");
  return category("ambiguity", score, evidence, triggers);
}

function buildFailurePoints(categories: CategoryScore[]) {
  return categories
    .flatMap((category) =>
      category.ruleTriggers
        .filter((trigger) => trigger !== "no-major-risk-detected" && trigger !== "deployment-out-of-scope")
        .map((trigger, index) => `${category.label}: ${category.evidence[index] ?? trigger}`)
    )
    .slice(0, 8);
}

function buildExecutionPasses(categories: CategoryScore[]) {
  const triggers = new Set(categories.flatMap((category) => category.ruleTriggers));
  const passes = [
    "Pass 1: Confirm scope, non-goals, data boundaries, and deterministic scoring rules before editing UI.",
    "Pass 2: Implement and test the pure parsing and scoring engine with visible evidence for every score.",
    "Pass 3: Build the dashboard UI around verified engine output, including empty states and accessible controls.",
    "Pass 4: Run lint, typecheck, tests, and production build before browser QA.",
    "Pass 5: Perform desktop and mobile browser QA, then commit and deploy only after checks pass.",
  ];

  if (triggers.has("too-many-skills-one-phase")) {
    passes.splice(1, 0, "Pass 1B: Sequence requested skills by role so creative direction, UX structure, polish, and simplification do not compete in the same step.");
  }

  return passes;
}

function buildChecklist(categories: CategoryScore[]) {
  const triggers = new Set(categories.flatMap((category) => category.ruleTriggers));
  const checklist = [
    "Define exact deliverables and non-goals before implementation.",
    "Write tests for deterministic parser and scoring rules before engine code.",
    "Show evidence and rule triggers for every category and overall score.",
    "Keep scoring client-side and framework-independent.",
    "Run pnpm lint, pnpm typecheck, pnpm test, and pnpm build.",
    "Run browser QA on desktop and mobile after the production build passes.",
    "Commit a checkpoint before deployment.",
  ];

  if (triggers.has("ui-polish-before-core-logic")) {
    checklist.unshift("Move core logic and tests before UI polish.");
  }
  if (triggers.has("deploy-without-build-verification")) {
    checklist.unshift("Add production build verification before deployment.");
  }
  if (triggers.has("too-many-skills-one-phase")) {
    checklist.unshift("Reduce conflicting skills per execution phase.");
  }

  return checklist;
}

function buildRevisedPrompt(original: string, categories: CategoryScore[]) {
  const failurePoints = buildFailurePoints(categories);
  return [
    "Codex-ready revised prompt:",
    "",
    "Build this in deterministic passes. Do not add AI chat, external APIs, server-side scoring, login, cloud sync, API routes, or automatic execution.",
    "",
    "Pass 1: Create or update governance docs, confirm strict non-goals, and define pure TypeScript scoring contracts.",
    "Pass 2: Write failing tests for parser signals, weighted scoring, evidence output, execution passes, checklist, and revised prompt generation.",
    "Pass 3: Implement the client-side deterministic engine. Every category score and the overall score must display evidence and rule triggers.",
    "Pass 4: Build the UI only after engine tests pass. Keep controls keyboard-friendly, accessible, responsive, and visually consistent.",
    "Pass 5: Run pnpm lint, pnpm typecheck, pnpm test, and pnpm build. Run browser QA only after build passes.",
    "",
    "Known failure points to guard against:",
    ...(failurePoints.length ? failurePoints.map((point) => `- ${point}`) : ["- No major failure points detected by the current rules."]),
    "",
    "Original request:",
    original.trim() || "[No prompt supplied.]",
  ].join("\n");
}

export function analyzeWorkflow(input: string): WorkflowAnalysis {
  const signals = extractSignals(input);
  const categories = [
    scoreScope(signals),
    scoreSequence(signals),
    scoreSkill(signals),
    scoreTesting(signals),
    scoreDeployment(signals),
    scoreAmbiguity(signals),
  ];
  const score = clampScore(categories.reduce((total, item) => total + item.score * item.weight, 0));
  const weightedEvidence = categories.map(
    (category) => `${category.label} contributed ${Math.round(category.score * category.weight)} weighted points: ${category.evidence[0]}`
  );
  const overallTriggers = categories.flatMap((category) => category.ruleTriggers);

  return {
    signals,
    categories,
    overall: {
      score,
      level: getRiskLevel(score),
      evidence: weightedEvidence,
      ruleTriggers: overallTriggers,
    },
    failurePoints: buildFailurePoints(categories),
    executionPasses: buildExecutionPasses(categories),
    checklist: buildChecklist(categories),
    revisedPrompt: buildRevisedPrompt(input, categories),
  };
}
