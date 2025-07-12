// src/components/extract/shortfall-table.tsx
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

type Props = {
  data: Record<string, number>;
};

export default function ShortfallTable({ data }: Props) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell header>Model</TableCell>
          <TableCell header className="text-right">
            Qty Needed
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {Object.entries(data).map(([model, qty]) => (
          <TableRow key={model}>
            <TableCell>{model}</TableCell>
            <TableCell className="text-right">{qty}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
