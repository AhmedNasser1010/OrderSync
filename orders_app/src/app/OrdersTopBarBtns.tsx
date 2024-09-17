function OrdersTopBarBtns({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center space-x-2">
      {children}
    </div>
  )
}

export default OrdersTopBarBtns