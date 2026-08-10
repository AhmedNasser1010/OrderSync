import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DiscountMsg from "./DiscountMsg";

describe("DiscountMsg", () => {
  it("renders nothing when there is no discount message", () => {
    const { container } = render(
      <DiscountMsg discountMsg={null} discountIncluded={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the discount message", () => {
    render(<DiscountMsg discountMsg="20% off" discountIncluded={false} />);
    expect(screen.getByText("20% off")).toBeInTheDocument();
  });

  it("renders with the discount-included styling class when included", () => {
    const { container } = render(
      <DiscountMsg discountMsg="50 off" discountIncluded={true} />
    );
    const span = container.querySelector("span");
    expect(span?.className).toContain("bg-color-11/10");
  });

  it("renders with the neutral styling class when not included", () => {
    const { container } = render(
      <DiscountMsg discountMsg="50 off" discountIncluded={false} />
    );
    const span = container.querySelector("span");
    expect(span?.className).toContain("bg-color-7/60");
  });
});
