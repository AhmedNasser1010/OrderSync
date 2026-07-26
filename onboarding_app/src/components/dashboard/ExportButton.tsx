"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileJson, FileText, Loader2 } from "lucide-react";
import type { ExportColumn } from "@/lib/export-utils";
import { exportToExcel, exportToCSV, exportToJSON } from "@/lib/export-utils";

interface ExportButtonProps {
  data: Record<string, unknown>[];
  columns: ExportColumn[];
  filename: string;
  sheetName?: string;
}

export function ExportButton({
  data,
  columns,
  filename,
  sheetName,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (
    format: "excel" | "csv" | "json",
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
          exportToJSON(data, columns, filename);
          break;
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={isExporting || data.length === 0}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isExporting ? "Exporting..." : "Export"}
        </Button>
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
