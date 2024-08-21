const SizeOptionBtn = ({ children, onMouseUp, isSelected }) => {
  return (
    <button
      onMouseUp={onMouseUp}
      className={`@apply hover:bg-gray-200 ${isSelected && 'bg-gray-200'} px-4 py-1`}>
      {children}
    </button>
  )
}

export default SizeOptionBtn
