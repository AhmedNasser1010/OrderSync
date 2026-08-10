import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import OpenBadge from "./OpenBadge";

const NOW = 1_700_000_000_000;

describe("OpenBadge", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows active for an active restaurant", () => {
    render(<OpenBadge status="active" />);
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("shows busy for a busy restaurant", () => {
    render(<OpenBadge status="busy" />);
    expect(screen.getByText("busy")).toBeInTheDocument();
  });

  it("shows pause for a paused restaurant", () => {
    render(<OpenBadge status="pause" />);
    expect(screen.getByText("pause")).toBeInTheDocument();
  });

  it("shows inactive for an inactive restaurant", () => {
    render(<OpenBadge status="inactive" />);
    expect(screen.getByText("inactive")).toBeInTheDocument();
  });

  it("shows inactive when the restaurant is closed for the day", () => {
    // Wed Nov 15 2023 is the fixed "today"; that weekday is closed.
    render(
      <OpenBadge
        status="active"
        openingHours={
          { wednesday: { start: "10:00", end: "22:00", closed: true } } as never
        }
      />
    );
    expect(screen.getByText("inactive")).toBeInTheDocument();
  });

  it("shows active when open now until a future time", () => {
    render(<OpenBadge status="active" openNowUntil={NOW + 60_000} />);
    expect(screen.getByText("active")).toBeInTheDocument();
  });
});
