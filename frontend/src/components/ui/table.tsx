/* ───────── src/components/ui/table.tsx ───────── */
import React from "react";
import { cn } from "@/lib/utils";

/* ------------------------- Table Shell ------------------------- */

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Table({ children, className, ...props }: TableProps) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-lg border", className)} {...props}>
      <table className="min-w-full text-sm">{children}</table>
    </div>
  );
}

interface TableSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function TableHead({ children, className, ...props }: TableSectionProps) {
  return (
    <thead className={cn("bg-muted text-left", className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }: TableSectionProps) {
  return (
    <tbody className={cn("divide-y", className)} {...props}>
      {children}
    </tbody>
  );
}

/* ✅ FIX: strip out invalid whitespace children */
export function TableRow({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  const safeChildren = React.Children.toArray(children).filter(
    (c) => !(typeof c === "string" && /^\s*$/.test(c))
  );

  return (
    <tr className={cn("hover:bg-muted/60", className)} {...props}>
      {safeChildren}
    </tr>
  );
}

/* ------------------------- Table Cell ------------------------- */

interface TableCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  header?: boolean;
}

export function TableCell({
  children,
  header = false,
  className,
  ...props
}: TableCellProps) {
  const base = "px-4 py-2 whitespace-nowrap";
  const Comp = header ? "th" : "td";

  return (
    <Comp className={cn(base, className)} {...props}>
      {children}
    </Comp>
  );
}
