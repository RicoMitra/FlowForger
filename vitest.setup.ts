import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

const Icon = ({ size = 16, ...props }: { size?: number }) =>
  React.createElement("svg", {
    width: size,
    height: size,
    "aria-hidden": "true",
    ...props,
  });

vi.mock("lucide-react", () => ({
  AlertTriangle: Icon,
  CheckCircle2: Icon,
  ClipboardCopy: Icon,
  Gauge: Icon,
  Layers3: Icon,
  RotateCcw: Icon,
  ShieldCheck: Icon,
  Sparkles: Icon,
}));

vi.mock("recharts", () => ({
  PolarAngleAxis: () => null,
  PolarGrid: () => null,
  Radar: () => null,
  RadarChart: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "radar-chart" }, children),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "responsive-container" }, children),
}));
