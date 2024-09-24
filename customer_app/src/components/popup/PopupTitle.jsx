function PopupTitle({ children, className }) {
  return (
    <div className={`popup-title text-xl font-semibold text-gray-800 ${className}`}>
      {children}
    </div>
  )
}

export default PopupTitle