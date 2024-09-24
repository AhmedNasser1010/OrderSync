function PopupFooter({ children, className }) {
  return (
    <div className={`popup-footer mt-6 flex justify-center gap-2 ${className}`}>
      {children}
    </div>
  )
}

export default PopupFooter