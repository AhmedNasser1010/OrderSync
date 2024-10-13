import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function NavBar() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <ChevronLeft
        className="mr-3 cursor-pointer"
        onClick={() => router.push(".")}
      />
    </div>
  );
}
