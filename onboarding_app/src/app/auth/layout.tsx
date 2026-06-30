export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-lg mb-4">
            <span className="text-lg font-bold text-primary-foreground">
              RC
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Restaurant Creator
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage your restaurants with ease
          </p>
        </div>

        {/* Form Container */}
        <div>{children}</div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>© 2025 Restaurant Creator. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
