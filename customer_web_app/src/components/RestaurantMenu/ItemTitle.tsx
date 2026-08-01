"use client";

const ItemTitle = ({
  title,
  discountIncluded,
}: {
  title?: string;
  discountIncluded?: boolean;
}) => {
  return (
    <h4
      className={`text-base ${
        discountIncluded ? "text-color-2" : "text-color-9"
      } font-ProximaNovaMed`}
    >
      {title}
    </h4>
  );
};

export default ItemTitle;
