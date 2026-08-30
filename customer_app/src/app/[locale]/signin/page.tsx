import { Suspense } from "react";
import { SignInView } from "@/components/Auth/SignInView";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInView />
    </Suspense>
  );
}
