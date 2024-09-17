function OrdersTopBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center mb-4">
      {children}
    </div>
  )
}

export default OrdersTopBar