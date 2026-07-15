import { Shield } from "lucide-react";

export function AccountSetupScreen() {
  return (
    <div className="bg-background flex min-h-dvh items-center p-4">
      <div className="mx-auto w-full max-w-sm">
        <div className="bg-card rounded-2xl p-6 text-center shadow-sm">
          <div className="bg-muted mx-auto flex size-16 items-center justify-center rounded-full">
            <Shield className="text-muted-foreground size-8" />
          </div>
          <h2 className="text-foreground mt-6 text-xl font-semibold">
            Complete Your Registration
          </h2>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            Your account has been created successfully. Please complete your
            registration by contacting your manager. They will set up your
            profile and activate your account.
          </p>
        </div>
      </div>
    </div>
  );
}
