"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  Gauge,
  Layers3,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { analyzeWorkflow, type WorkflowAnalysis } from "@/lib/flowforger";

type HistoryItem = {
  id: string;
  createdAt: string;
  prompt: string;
  score: number;
  level: string;
};

const STORAGE_KEY = "flowforger:history:v1";
const SETTINGS_KEY = "flowforger:settings:v1";

const samplePrompt =
  "Build a new local-first dashboard, polish UI first, use multiple skills, deploy to Vercel, and check in browser. Include tests later.";

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 8)));
}

function loadCompactMode() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SETTINGS_KEY) === "compact";
  } catch {
    return false;
  }
}

function scoreTone(score: number) {
  if (score <= 40) return "Low risk";
  if (score <= 70) return "Medium risk";
  return "High risk";
}

function shortPrompt(prompt: string) {
  return prompt.length > 62 ? `${prompt.slice(0, 62)}...` : prompt;
}

export function FlowForgerDashboard() {
  const [prompt, setPrompt] = useState(samplePrompt);
  const [analysis, setAnalysis] = useState<WorkflowAnalysis>(() => analyzeWorkflow(samplePrompt));
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [compactMode, setCompactMode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setHistory(loadHistory());
      setCompactMode(loadCompactMode());
    });
  }, []);

  const chartData = useMemo(
    () =>
      analysis.categories.map((category) => ({
        category: category.label.replace(" Readiness", "").replace(" & Complexity", ""),
        risk: category.score,
      })),
    [analysis]
  );

  function runAnalysis() {
    const next = analyzeWorkflow(prompt);
    const item: HistoryItem = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      prompt: prompt.trim() || "[Empty prompt]",
      score: next.overall.score,
      level: next.overall.level,
    };
    const nextHistory = [item, ...history].slice(0, 8);
    setAnalysis(next);
    setHistory(nextHistory);
    saveHistory(nextHistory);
  }

  function clearHistory() {
    setHistory([]);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function toggleCompactMode() {
    const next = !compactMode;
    setCompactMode(next);
    window.localStorage.setItem(SETTINGS_KEY, next ? "compact" : "spacious");
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(analysis.revisedPrompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_10%_10%,rgba(207,255,48,0.18),transparent_26%),radial-gradient(circle_at_80%_0%,rgba(154,175,74,0.2),transparent_24%),linear-gradient(135deg,#030401,#101407_42%,#050604)] text-stone-50">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="relative mx-auto grid min-h-screen w-full max-w-[1560px] gap-5 px-4 py-4 lg:grid-cols-[280px_1fr] lg:px-6">
        <aside className="glass-panel flex flex-col justify-between rounded-[2rem] p-5 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <div className="space-y-8">
            <div>
              <div className="mb-7 flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-lime-300 text-black shadow-[0_0_34px_rgba(217,255,67,0.45)]">
                  <Sparkles size={22} />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.34em] text-lime-200/70">FlowForger</p>
                  <h1 className="text-xl font-semibold tracking-tight">Risk forge</h1>
                </div>
              </div>
              <p className="text-sm leading-6 text-stone-300">
                Client-side workflow stress testing for Codex and GPT project prompts. Deterministic rules only.
              </p>
            </div>

            <nav aria-label="Dashboard sections" className="grid gap-2 text-sm">
              {["Editor", "Risk score", "Stress test", "Checklist", "History", "Settings"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-stone-200 transition hover:border-lime-200/40 hover:bg-lime-200/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-200"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <section id="settings" className="rounded-[1.6rem] border border-lime-100/15 bg-black/20 p-4 shadow-inner">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-lime-100">
              <ShieldCheck size={17} />
              Settings
            </div>
            <label className="flex cursor-pointer items-center justify-between gap-4 text-sm text-stone-300">
              Compact result density
              <input
                className="size-5 accent-lime-300"
                type="checkbox"
                checked={compactMode}
                onChange={toggleCompactMode}
              />
            </label>
            <p className="mt-3 text-xs leading-5 text-stone-500">Saved locally. No sync, no account, no network scoring.</p>
          </section>
        </aside>

        <section className="space-y-5">
          <header className="glass-panel rounded-[2rem] p-5 sm:p-7">
            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
              <div>
                <p className="mb-4 text-sm uppercase tracking-[0.34em] text-lime-200/70">
                  Deterministic execution risk analyzer
                </p>
                <h2 className="max-w-5xl text-4xl font-semibold leading-[1.03] tracking-tight text-white sm:text-6xl">
                  Stress-test a project plan before Codex executes it.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-stone-300">
                  Paste workflow text, reveal category evidence, then generate safer execution passes and a revised prompt.
                </p>
              </div>
              <div className="bubble-card flex flex-col justify-between rounded-[2rem] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-300">Current classification</span>
                  <Gauge className="text-lime-200" size={21} />
                </div>
                <div>
                  <div className="mt-8 text-7xl font-semibold tracking-tight text-lime-200">
                    {analysis.overall.score}
                  </div>
                  <div className="mt-2 text-lg text-white">{scoreTone(analysis.overall.score)}</div>
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-5 xl:grid-cols-[minmax(360px,0.9fr)_1.4fr]">
            <section id="editor" className="glass-panel rounded-[2rem] p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Input editor</h2>
                  <p className="text-sm text-stone-400">Paste a Codex/GPT project prompt or execution plan.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrompt(samplePrompt)}
                  className="icon-button"
                  aria-label="Reset sample prompt"
                >
                  <RotateCcw size={17} />
                </button>
              </div>
              <label htmlFor="workflow-prompt" className="mb-2 block text-sm font-medium text-lime-100">
                Workflow prompt
              </label>
              <textarea
                id="workflow-prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="min-h-[360px] w-full resize-y rounded-[1.6rem] border border-white/10 bg-black/35 p-4 text-sm leading-6 text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-lime-200/70 focus:shadow-[0_0_0_4px_rgba(217,255,67,0.12)]"
                placeholder="Paste workflow text here..."
              />
              <button
                type="button"
                onClick={runAnalysis}
                className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-lime-300 px-5 font-semibold text-black shadow-[0_0_36px_rgba(217,255,67,0.36)] transition hover:bg-lime-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-100"
              >
                <Layers3 size={18} />
                Analyze workflow
              </button>
            </section>

            <section id="risk-score" className="glass-panel rounded-[2rem] p-5">
              <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
                <div className="bubble-card rounded-[2rem] p-5">
                  <h2 className="text-xl font-semibold">Risk score</h2>
                  <div className="mt-6 text-8xl font-semibold tracking-tight text-lime-200">{analysis.overall.score}</div>
                  <p className="mt-2 text-lg text-white">{analysis.overall.level} risk</p>
                  <p className="mt-4 text-sm leading-6 text-stone-300">
                    Weighted total: Scope 25%, Sequence 20%, Skill Conflict 15%, Test/QA 15%, Deployment 10%, Ambiguity 15%.
                  </p>
                </div>
                <div className="min-h-[320px] rounded-[2rem] border border-white/10 bg-black/20 p-4">
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={chartData}>
                      <PolarGrid stroke="rgba(255,255,255,0.16)" />
                      <PolarAngleAxis dataKey="category" tick={{ fill: "#e7f7ba", fontSize: 11 }} />
                      <Radar
                        dataKey="risk"
                        stroke="#d9ff43"
                        fill="#d9ff43"
                        fillOpacity={0.24}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`mt-5 grid gap-3 ${compactMode ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
                {analysis.overall.evidence.map((item) => (
                  <article key={item} className="rounded-3xl border border-lime-100/15 bg-lime-100/[0.055] p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-lime-100">
                      <CheckCircle2 size={16} />
                      Weighted evidence
                    </div>
                    <p className="text-sm leading-6 text-stone-300">{item}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <section id="stress-test" className="grid gap-5 xl:grid-cols-2">
            {analysis.categories.map((category) => (
              <article key={category.id} className="glass-panel rounded-[2rem] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{category.label}</h3>
                    <p className="text-sm text-stone-400">{Math.round(category.weight * 100)}% weighting</p>
                  </div>
                  <div className="rounded-2xl border border-lime-100/20 bg-lime-100/10 px-4 py-2 text-2xl font-semibold text-lime-100">
                    {category.score}
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-lime-300 shadow-[0_0_18px_rgba(217,255,67,0.65)]"
                    style={{ width: `${category.score}%` }}
                  />
                </div>
                <div className="mt-5 grid gap-3">
                  <div>
                    <p className="mb-2 text-sm font-medium text-lime-100">Evidence</p>
                    <ul className="space-y-2 text-sm leading-6 text-stone-300">
                      {category.evidence.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-lime-100">Rule triggers</p>
                    <div className="flex flex-wrap gap-2">
                      {category.ruleTriggers.map((trigger) => (
                        <span key={trigger} className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs text-stone-200">
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-3">
            <article className="glass-panel rounded-[2rem] p-5">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="text-lime-200" size={20} />
                <h2 className="text-xl font-semibold">Failure points</h2>
              </div>
              <ul className="space-y-3 text-sm leading-6 text-stone-300">
                {(analysis.failurePoints.length ? analysis.failurePoints : ["No major failure point detected."]).map((item) => (
                  <li key={item} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="glass-panel rounded-[2rem] p-5">
              <h2 className="mb-4 text-xl font-semibold">Recommended execution passes</h2>
              <ol className="space-y-3 text-sm leading-6 text-stone-300">
                {analysis.executionPasses.map((item) => (
                  <li key={item} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    {item}
                  </li>
                ))}
              </ol>
            </article>

            <article id="checklist" className="glass-panel rounded-[2rem] p-5">
              <h2 className="mb-4 text-xl font-semibold">Execution checklist</h2>
              <ul className="space-y-3 text-sm leading-6 text-stone-300">
                {analysis.checklist.map((item) => (
                  <li key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-lime-200" size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
            <article className="glass-panel rounded-[2rem] p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Codex-ready revised prompt</h2>
                <button type="button" onClick={copyPrompt} className="secondary-button">
                  <ClipboardCopy size={17} />
                  {copied ? "Copied" : "Copy prompt"}
                </button>
              </div>
              <pre className="max-h-[520px] overflow-auto rounded-[1.6rem] border border-white/10 bg-black/40 p-4 text-sm leading-6 text-stone-200">
                {analysis.revisedPrompt}
              </pre>
            </article>

            <article id="history" className="glass-panel rounded-[2rem] p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Recent analyses</h2>
                <button type="button" onClick={clearHistory} className="secondary-button">
                  Clear history
                </button>
              </div>
              {history.length === 0 ? (
                <div className="rounded-[1.6rem] border border-dashed border-lime-100/20 bg-lime-100/[0.04] p-5 text-sm leading-6 text-stone-400">
                  No saved analyses yet. Run an analysis to keep a local checkpoint on this browser.
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setPrompt(item.prompt);
                        setAnalysis(analyzeWorkflow(item.prompt));
                      }}
                      className="w-full rounded-3xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-lime-200/40 hover:bg-lime-200/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-200"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-lime-100">{item.score} / {item.level}</span>
                        <span className="text-xs text-stone-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm leading-5 text-stone-300">{shortPrompt(item.prompt)}</p>
                    </button>
                  ))}
                </div>
              )}
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}
