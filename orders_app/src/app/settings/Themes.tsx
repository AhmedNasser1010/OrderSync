import { Moon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/ui/ModeToggle";

export default function Themes() {
  return (
    <section className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
          <Moon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
          <p className="text-xs text-muted-foreground">Theme preferences</p>
        </div>
      </div>
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center justify-between py-3 border-t border-border">
          <Label htmlFor="dark-mode" className="text-sm text-foreground">Dark Mode</Label>
          <ModeToggle />
        </div>
      </div>
    </section>
  );
}
