"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  FileDown,
  Loader2,
} from "lucide-react";
import type { ExportColumn } from "@/lib/export-utils";
import { exportToExcel, exportToCSV, exportToJSON, exportToPDF } from "@/lib/export-utils";

type ExportFormat = "excel" | "csv" | "json" | "pdf";

const FORMAT_LABELS: Record<ExportFormat, string> = {
  excel: "Excel",
  csv: "CSV",
  json: "JSON",
  pdf: "PDF",
};

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
  const [pendingFormat, setPendingFormat] = useState<ExportFormat | null>(null);
  const [selectedCols, setSelectedCols] = useState<Set<number>>(new Set());

  const allSelected = selectedCols.size === columns.length;
  const someSelected = selectedCols.size > 0 && !allSelected;

  const runExport = async (
    format: ExportFormat,
    cols: ExportColumn[],
  ) => {
    if (data.length === 0 || cols.length === 0) return;
    setIsExporting(true);
    try {
      await new Promise((r) => setTimeout(r, 50));
      switch (format) {
        case "excel":
          exportToExcel(data, cols, filename, sheetName);
          break;
        case "csv":
          exportToCSV(data, cols, filename);
          break;
        case "json":
          exportToJSON(data, cols, filename, rawJSON);
          break;
        case "pdf":
          exportToPDF(data, cols, filename, title);
          break;
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleMenuItem = (format: ExportFormat) => {
    // Raw JSON dumps ignore columns — they export the record as-is.
    if (format === "json" && rawJSON !== undefined) {
      void runExport(format, columns);
      return;
    }
    setPendingFormat(format);
    setSelectedCols(new Set(columns.map((_, i) => i)));
  };

  const toggleCol = (index: number) => {
    setSelectedCols((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedCols(
      allSelected ? new Set() : new Set(columns.map((_, i) => i)),
    );
  };

  const confirmExport = async () => {
    if (!pendingFormat) return;
    const format = pendingFormat;
    const cols = columns.filter((_, i) => selectedCols.has(i));
    setPendingFormat(null);
    await runExport(format, cols);
  };

  const isDisabled = isExporting || data.length === 0;

  return (
    <>
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
            onClick={() => handleMenuItem("excel")}
            className="cursor-pointer"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export as Excel
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleMenuItem("pdf")}
            className="cursor-pointer"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleMenuItem("csv")}
            className="cursor-pointer"
          >
            <FileText className="mr-2 h-4 w-4" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleMenuItem("json")}
            className="cursor-pointer"
          >
            <FileJson className="mr-2 h-4 w-4" />
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={pendingFormat !== null}
        onOpenChange={(open) => !open && setPendingFormat(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select columns to export</DialogTitle>
            <DialogDescription>
              Choose which columns to include in the{" "}
              {pendingFormat ? FORMAT_LABELS[pendingFormat] : ""} export.
            </DialogDescription>
          </DialogHeader>

          <label className="flex items-center gap-3 rounded-md border-b pb-3 text-sm font-medium cursor-pointer">
            <Checkbox
              checked={someSelected ? "indeterminate" : allSelected}
              onCheckedChange={toggleAll}
            />
            Select all ({selectedCols.size}/{columns.length})
          </label>

          <div className="max-h-64 space-y-1 overflow-y-auto -mx-1 px-1">
            {columns.map((col, index) => (
              <label
                key={index}
                className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
              >
                <Checkbox
                  checked={selectedCols.has(index)}
                  onCheckedChange={() => toggleCol(index)}
                />
                <span className="truncate">{col.header}</span>
              </label>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingFormat(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => void confirmExport()}
              disabled={selectedCols.size === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export {selectedCols.size} column{selectedCols.size === 1 ? "" : "s"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
