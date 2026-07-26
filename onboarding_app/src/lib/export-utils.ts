import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export interface ExportColumn {
  header: string;
  accessor: string;
  format?: (value: unknown) => string;
}

function formatTimestamp(value: unknown): string {
  if (typeof value !== "number") return String(value ?? "");
  return new Date(value).toISOString().replace("T", " ").replace(/\.\d{3}Z/, "");
}

function formatBoolean(value: unknown): string {
  return value ? "Yes" : "No";
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

function resolveValue(
  item: Record<string, unknown>,
  accessor: string,
  format?: (value: unknown) => string,
): string {
  const raw = getNestedValue(item, accessor);
  if (format) return format(raw);
  if (Array.isArray(raw)) return raw.join(", ");
  if (typeof raw === "boolean") return formatBoolean(raw);
  if (typeof raw === "number" && accessor.includes("At")) return formatTimestamp(raw);
  if (raw === null || raw === undefined) return "";
  return String(raw);
}

function buildRow(
  item: Record<string, unknown>,
  columns: ExportColumn[],
): Record<string, string> {
  const row: Record<string, string> = {};
  for (const col of columns) {
    row[col.header] = resolveValue(item, col.accessor, col.format);
  }
  return row;
}

function generateFilename(baseName: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${baseName}_${date}`;
}

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  filename: string,
  sheetName = "Sheet1",
): void {
  const rows = data.map((item) => buildRow(item, columns));
  const ws = XLSX.utils.json_to_sheet(rows, { header: columns.map((c) => c.header) });

  const colWidths = columns.map((col) => {
    const maxLen = Math.max(
      col.header.length,
      ...rows.map((row) => (row[col.header] ?? "").length),
    );
    return { wch: Math.min(maxLen + 2, 50) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${generateFilename(filename)}.xlsx`);
}

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  filename: string,
): void {
  const rows = data.map((item) => buildRow(item, columns));
  const ws = XLSX.utils.json_to_sheet(rows, { header: columns.map((c) => c.header) });
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${generateFilename(filename)}.csv`);
}

export function exportToJSON<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  filename: string,
): void {
  const rows = data.map((item) => buildRow(item, columns));
  const json = JSON.stringify(rows, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  saveAs(blob, `${generateFilename(filename)}.json`);
}
