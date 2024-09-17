import Image from 'next/image'

export default function NoOrders() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative w-64 h-64 mb-8">
        <Image
          src="/assets/images/no-orders.png"
          alt="No orders illustration"
          layout="fill"
          objectFit="contain"
        />
      </div>
      <h2 className="text-2xl font-bold mb-4">No Orders Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        It looks like there are no orders at the moment.
      </p>
    </div>
  )
}