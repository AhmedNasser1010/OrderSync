import { Loader2 } from "lucide-react"

export default function AutoLoginLoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Logging you in...</h2>
        <p className="mt-2 text-sm text-gray-500">Please wait while we securely log you into your account.</p>
      </div>
    </div>
  )
}