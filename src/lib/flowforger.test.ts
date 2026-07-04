import { describe, expect, it } from "vitest";
import { analyzeWorkflow, getRiskLevel } from "./flowforger";

describe("FlowForger deterministic workflow scoring", () => {
  it("uses weighted category totals and risk thresholds", () => {
    expect(getRiskLevel(40)).toBe("Low");
    expect(getRiskLevel(41)).toBe("Medium");
    expect(getRiskLevel(70)).toBe("Medium");
    expect(getRiskLevel(71)).toBe("High");
  });

  it("returns evidence and rule triggers for every category and the overall score", () => {
    const result = analyzeWorkflow(
      "Build dashboard, marketplace, auth, deploy today, polish UI first, no tests."
    );

    expect(result.overall.evidence.length).toBeGreaterThan(0);
    expect(result.overall.ruleTriggers.length).toBeGreaterThan(0);
    for (const category of result.categories) {
      expect(category.evidence.length).toBeGreaterThan(0);
      expect(category.ruleTriggers.length).toBeGreaterThan(0);
    }
  });

  it("flags a large multi-deliverable prompt as high scope risk", () => {
    const result = analyzeWorkflow(
      "Create auth, dashboard, admin panel, mobile app, marketplace, billing, analytics, landing page, deploy, docs, and browser QA."
    );

    const scope = result.categories.find((category) => category.id === "scope");
    expect(scope?.score).toBeGreaterThanOrEqual(70);
    expect(scope?.evidence.join(" ")).toContain("deliverable");
  });

  it("detects deploy requests that lack build verification", () => {
    const result = analyzeWorkflow("Deploy this app to Vercel after adding the UI.");
    const deploy = result.categories.find((category) => category.id === "deployment");

    expect(deploy?.score).toBeGreaterThanOrEqual(65);
    expect(deploy?.ruleTriggers).toContain("deploy-without-build-verification");
  });

  it("detects UI polish before core logic as a sequencing risk", () => {
    const result = analyzeWorkflow(
      "First polish the premium UI and animations, then implement the scoring engine."
    );
    const sequence = result.categories.find((category) => category.id === "sequence");

    expect(sequence?.ruleTriggers).toContain("ui-polish-before-core-logic");
  });

  it("detects too many requested skills in one phase", () => {
    const result = analyzeWorkflow(
      "Use GPT Taste, UI/UX Pro Max, Emil Design Eng, Ponytail, Caveman, Superpowers, browser use, and computer use in the first pass."
    );
    const skill = result.categories.find((category) => category.id === "skill");

    expect(skill?.score).toBeGreaterThanOrEqual(60);
    expect(skill?.ruleTriggers).toContain("too-many-skills-one-phase");
  });

  it("requires testing readiness evidence when tests are missing", () => {
    const result = analyzeWorkflow("Build a production dashboard and ship it.");
    const testing = result.categories.find((category) => category.id === "testing");

    expect(testing?.ruleTriggers).toContain("missing-test-plan");
    expect(testing?.evidence.join(" ")).toContain("No explicit test");
  });

  it("treats negative test language as missing tests", () => {
    const result = analyzeWorkflow("Build a dashboard, deploy to Vercel, no tests.");
    const testing = result.categories.find((category) => category.id === "testing");

    expect(testing?.ruleTriggers).toContain("missing-test-plan");
    expect(result.overall.level).not.toBe("Low");
  });

  it("builds a safer Codex-ready revised prompt with passes and verification", () => {
    const result = analyzeWorkflow("Build a dashboard, polish UI, deploy to Vercel.");

    expect(result.revisedPrompt).toContain("Pass 1");
    expect(result.revisedPrompt).toContain("pnpm lint");
    expect(result.revisedPrompt).toContain("pnpm typecheck");
    expect(result.revisedPrompt).toContain("pnpm test");
    expect(result.revisedPrompt).toContain("pnpm build");
    expect(result.revisedPrompt).toContain("browser QA");
    expect(result.revisedPrompt).not.toContain("AI judgment");
  });
});
