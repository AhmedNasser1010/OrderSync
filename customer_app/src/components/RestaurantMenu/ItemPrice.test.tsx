import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ItemPrice from "./ItemPrice";

describe("ItemPrice", () => {
  it("renders the plain price when no discount is included", () => {
    render(<ItemPrice price={100} finalPrice={100} discountIncluded={false} />);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.queryByText("OFF")).not.toBeInTheDocument();
  });

  it("shows both prices and the percent-off badge when discounted", () => {
    render(<ItemPrice price={100} finalPrice={80} discountIncluded={true} />);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("20% OFF")).toBeInTheDocument();
  });

  it("omits the percent badge when the final price is not lower", () => {
    render(<ItemPrice price={100} finalPrice={100} discountIncluded={true} />);
    expect(screen.getAllByText("100")).toHaveLength(2);
    expect(screen.queryByText(/OFF/)).not.toBeInTheDocument();
  });

  it("renders an empty price cell when the price is undefined", () => {
    const { container } = render(
      <ItemPrice price={undefined} finalPrice={undefined} discountIncluded={false} />
    );
    expect(container.querySelector(".egp")?.textContent).toBe("");
  });
});
