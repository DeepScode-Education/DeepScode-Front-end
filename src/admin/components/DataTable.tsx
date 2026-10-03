import { ReactNode, CSSProperties } from "react";
import StatusBadge from "./StatusBadge";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
};

const DataTable = <T extends { id?: string | number; _id?: string | number }>({
  columns,
  rows,
  empty = "No records found",
  rowStyle,
  rowClassName,
  onRowClick, // ── new: optional row click handler
}: {
  columns: Column<T>[];
  rows: T[];
  empty?: string;
  rowStyle?: (row: T) => CSSProperties;
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void; // ── new
}) => (
  <div className="overflow-hidden rounded-xl border border-border bg-card">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground">
          <tr className="border-b border-border bg-secondary/30">
            {columns.map((c) => (
              <th
                key={String(c.key)}
                className={`px-5 py-2.5 text-left font-medium ${c.className || ""}`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-12 text-center text-sm text-muted-foreground"
              >
                {empty}
              </td>
            </tr>
          )}
          {rows.map((row, idx) => (
            <tr
              key={String(row.id ?? row._id ?? idx)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-border last:border-0 hover:bg-secondary/40 ${
                onRowClick ? "cursor-pointer" : ""
              } ${rowClassName ? rowClassName(row) : ""}`}
              style={rowStyle ? rowStyle(row) : undefined}
            >
              {columns.map((c) => (
                <td
                  key={String(c.key)}
                  className={`px-5 py-3 ${c.className || ""}`}
                >
                  {c.render
                    ? c.render(row)
                    : String((row as Record<string, unknown>)[c.key as string] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export { StatusBadge };
export default DataTable;