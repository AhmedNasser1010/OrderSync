import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Users } from "lucide-react";
import Link from "next/link";

export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
      {/* Back Button */}
      <div className="mb-3">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Staff Management
          </h1>
          <p className="text-sm text-muted-foreground flex gap-1">
            <span className="inline-block h-4 w-8 bg-gray-200 rounded animate-pulse" />
            active of
            <span className="inline-block h-4 w-8 bg-gray-200 rounded animate-pulse" />
            members
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            <span className="inline-block h-4 w-8 bg-gray-200 rounded animate-pulse" />
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Active Members</p>
          <p className="text-lg font-semibold text-green-500 flex gap-1">
            <span className="inline-block h-5 w-8 bg-gray-200 rounded animate-pulse" />
            <span className="text-sm text-muted-foreground font-normal">/</span>
            <span className="inline-block h-5 w-8 bg-gray-200 rounded animate-pulse" />
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Total Dues</p>
          <p className="text-lg font-semibold text-green-500">
            <span className="inline-block h-5 w-12 bg-gray-200 rounded animate-pulse" />
          </p>
        </div>
      </div>

      {/* Search input remains static */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search staff..." className="pl-10" disabled />
      </div>
    </header>
  );
}
