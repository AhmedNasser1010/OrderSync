const ItemPrice = ({ price, finalPrice, discountIncluded }) => {
  return (
    <span className={`egp text-sm font-ProximaNovaMed ${discountIncluded ? 'text-color-2' : 'text-color-9'}`}>
      {
        discountIncluded ? `${price} > ${finalPrice}` : price
      }
    </span>
  );
};

export default ItemPrice;
