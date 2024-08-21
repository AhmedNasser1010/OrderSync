import React from 'react'

const DiscountMsg = ({ discountMsg, discountIncluded }) => {
  if (discountMsg) {
    return (
      <span
        className={`text-sm font-ProximaNovaMed block ${
          discountIncluded ? 'text-color-2' : 'text-[#3e4152a1]'
        } mt-2`}>
        {discountMsg}
      </span>
    )
  }
}

export default DiscountMsg
