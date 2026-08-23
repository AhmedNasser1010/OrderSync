"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileJson, FileText, FileDown, Loader2 } from "lucide-react";
import type { ExportColumn } from "@/lib/export-utils";
import { exportToExcel, exportToCSV, exportToJSON, exportToPDF } from "@/lib/export-utils";

interface ExportButtonProps {
  data: Record<string, unknown>[];
  columns: ExportColumn[];
  filename: string;
  sheetName?: string;
  title?: string;
  rawJSON?: unknown;
}

export function ExportButton({
  data,
  columns,
  filename,
  sheetName,
  title,
  rawJSON,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (
    format: "excel" | "csv" | "json" | "pdf",
  ) => {
    if (data.length === 0) return;
    setIsExporting(true);
    try {
      await new Promise((r) => setTimeout(r, 50));
      switch (format) {
        case "excel":
          exportToExcel(data, columns, filename, sheetName);
          break;
        case "csv":
          exportToCSV(data, columns, filename);
          break;
        case "json":
          exportToJSON(data, columns, filename, rawJSON);
          break;
        case "pdf":
          exportToPDF(data, columns, filename, title);
          break;
      }
    } finally {
      setIsExporting(false);
    }
  };

  const isDisabled = isExporting || data.length === 0;

  return (
    <DropdownMenu open={isDisabled ? false : undefined}>
      <DropdownMenuTrigger
        data-disabled={isDisabled || undefined}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {isExporting ? "Exporting..." : "Export"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport("excel")}
          className="cursor-pointer"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          className="cursor-pointer"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("json")}
          className="cursor-pointer"
        >
          <FileJson className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
