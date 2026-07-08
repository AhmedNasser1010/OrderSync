export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-lg mb-4">
            <span className="text-lg font-bold text-primary-foreground">
              O
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage your orders with ease
          </p>
        </div>

        <div>{children}</div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>&copy; 2025 Orders. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
