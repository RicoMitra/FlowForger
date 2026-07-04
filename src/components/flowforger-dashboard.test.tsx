import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { FlowForgerDashboard } from "./flowforger-dashboard";

describe("FlowForgerDashboard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("analyzes pasted workflow text and shows score evidence, checklist, and revised prompt", async () => {
    const user = userEvent.setup();
    render(<FlowForgerDashboard />);

    const editor = await screen.findByLabelText(/workflow prompt/i);
    await user.clear(editor);
    await user.type(
      editor,
      "Build dashboard, polish UI first, deploy to Vercel, no tests."
    );
    await user.click(screen.getByRole("button", { name: /analyze workflow/i }));

    expect(screen.getAllByText(/Risk score/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rule triggers/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Recommended execution passes/i)).toBeInTheDocument();
    expect(screen.getByText(/Execution checklist/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Codex-ready revised prompt/i).length).toBeGreaterThan(0);
  });

  it("saves analyses to local history and clears them", async () => {
    const user = userEvent.setup();
    render(<FlowForgerDashboard />);

    const editor = await screen.findByLabelText(/workflow prompt/i);
    await user.clear(editor);
    await user.type(editor, "Build app and deploy.");
    await user.click(screen.getByRole("button", { name: /analyze workflow/i }));

    expect(screen.getByText(/Recent analyses/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Build app and deploy/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clear history/i }));
    expect(screen.queryByRole("button", { name: /Build app and deploy/i })).not.toBeInTheDocument();
  });

  it("keeps long prompt and result text in shrink-safe wrapped containers", async () => {
    const user = userEvent.setup();
    render(<FlowForgerDashboard />);

    const editor = await screen.findByLabelText(/workflow prompt/i);
    fireEvent.change(editor, {
      target: {
        value: `Build ${"VeryLongUnbrokenDeliverableName".repeat(20)} and deploy without tests.`,
      },
    });
    await user.click(screen.getByRole("button", { name: /analyze workflow/i }));

    expect(editor).toHaveClass("text-wrap-anywhere");
    expect(screen.getByTestId("revised-prompt-output")).toHaveClass(
      "contained-x-scroll",
      "text-wrap-anywhere"
    );
  });
});
