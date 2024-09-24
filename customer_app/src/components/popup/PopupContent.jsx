function PopupContent({ children, className }) {
  return (
    <div className={`popup-content bg-white md:rounded-lg shadow-lg md:max-w-md w-full p-6 ${className}`}>
      {children}
    </div>
  )
}

export default PopupContent