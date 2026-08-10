import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PaymentMethod from "./PaymentMethod";

describe("PaymentMethod", () => {
  it("shows Cash on Delivery as the selected method", () => {
    render(<PaymentMethod />);
    expect(screen.getByText("Cash on Delivery")).toBeInTheDocument();
  });

  it("shows Online Payment as coming soon and disabled", () => {
    render(<PaymentMethod />);
    expect(screen.getByText("Online Payment")).toBeInTheDocument();
    expect(screen.getByText("Soon")).toBeInTheDocument();
  });

  it("always marks the cash option as selected", () => {
    const { container } = render(<PaymentMethod />);
    const selectedRow = container.querySelector(
      ".border-color-2\\/40.bg-color-2\\/10"
    );
    expect(selectedRow).not.toBeNull();
  });

  it("renders the online option greyed out", () => {
    const { container } = render(<PaymentMethod />);
    const onlineRow = container.querySelector(".opacity-60");
    expect(onlineRow).not.toBeNull();
  });
});
