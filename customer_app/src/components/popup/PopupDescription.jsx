function PopupDescription({ children, className }) {
  return (
    <div className={`popup-description text-sm text-gray-600 mt-2 ${className}`}>
      {children}
    </div>
  )
}

export default PopupDescription