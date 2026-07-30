"use client";

import { Inbox } from "lucide-react";

type NoDataProps = {
  title: string;
  description: string;
};

export default function NoData({ title, description }: NoDataProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-6">
        <Inbox className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}
