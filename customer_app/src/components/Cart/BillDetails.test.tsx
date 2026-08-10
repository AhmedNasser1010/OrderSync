import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BillDetails from "./BillDetails";

const baseProps = {
  itemTotal: 200,
  deliveryFees: 5,
  orderDiscount: null,
  orderDiscountAmount: 0,
  total: 205,
  savings: 0,
  comment: "",
  onCommentChange: vi.fn(),
};

describe("BillDetails", () => {
  it("renders the totals and the comment input", () => {
    render(<BillDetails {...baseProps}>children</BillDetails>);
    expect(screen.getByText("Bill Details")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("205")).toBeInTheDocument();
    expect(screen.getByText("children")).toBeInTheDocument();
  });

  it("does not render a discount row when there is no order discount", () => {
    render(<BillDetails {...baseProps}>children</BillDetails>);
    expect(screen.queryByText("-5")).not.toBeInTheDocument();
  });

  it("renders the order discount message and amount", () => {
    render(
      <BillDetails
        {...baseProps}
        orderDiscount={{ message: "Summer 10%", code: "SUMMER10" }}
        orderDiscountAmount={20}
        total={185}
      >
        children
      </BillDetails>
    );
    expect(screen.getByText("Summer 10%")).toBeInTheDocument();
    expect(screen.getByText("-20")).toBeInTheDocument();
  });

  it("skips the discount row when the amount is zero", () => {
    render(
      <BillDetails
        {...baseProps}
        orderDiscount={{ message: "Summer 10%" }}
        orderDiscountAmount={0}
      >
        children
      </BillDetails>
    );
    expect(screen.queryByText("-0")).not.toBeInTheDocument();
  });

  it("renders savings when greater than zero", () => {
    render(<BillDetails {...baseProps} savings={30}>children</BillDetails>);
    expect(screen.getByText("You saved")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("hides savings when zero", () => {
    render(<BillDetails {...baseProps}>children</BillDetails>);
    expect(screen.queryByText("You saved")).not.toBeInTheDocument();
  });

  it("renders the invoice number with a hash prefix", () => {
    render(<BillDetails {...baseProps} orderNumber="1234">children</BillDetails>);
    expect(screen.getByText("#1234")).toBeInTheDocument();
  });

  it("forwards comment changes", () => {
    const onCommentChange = vi.fn();
    render(
      <BillDetails {...baseProps} onCommentChange={onCommentChange}>
        children
      </BillDetails>
    );
    fireEvent.change(screen.getByPlaceholderText("Comment, extras"), {
      target: { value: "no onions" },
    });
    expect(onCommentChange).toHaveBeenCalledWith("no onions");
  });

  it("disables the comment input when disabled", () => {
    render(<BillDetails {...baseProps} disabled>children</BillDetails>);
    expect(screen.getByPlaceholderText("Comment, extras")).toBeDisabled();
  });
});
