import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders nothing when status is missing", () => {
    const { container } = render(<StatusBadge />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    ["OPEN", "Open"],
    ["CLOSED", "Closed"],
    ["PAUSED", "Paused"],
    ["HIDDEN", "Hidden"],
  ])("maps %s to %s", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("falls back to the raw status for unknown values", () => {
    render(<StatusBadge status="UNKNOWN" />);
    expect(screen.getByText("UNKNOWN")).toBeInTheDocument();
  });
});
