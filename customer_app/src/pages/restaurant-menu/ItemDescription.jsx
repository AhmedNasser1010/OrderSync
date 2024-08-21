const ItemDescription = ({ description }) => {
  if (description) {
    return (
      <p className="text-color-10 mt-3 tracking-tight font-ProximaNovaThin text-sm md:w-3/4">
        {description}
      </p>
    )
  }
}

export default ItemDescription
