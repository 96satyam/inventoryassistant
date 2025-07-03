// apps/web-frontend/src/app/procurement/page.tsx
import ProcurementTable from "@/components/procurement/procurement-table"

export default async function ProcurementPage() {
  const res = await fetch("http://localhost:8000/procurement/logs", { cache: "no-store" });
  let logs = await res.json();
  logs = Array.isArray(logs) ? logs : [];

  return (
    <div>
      <h1 className="text-2xl font-bold">Procurement Log</h1>
      <p className="text-muted-foreground mt-2">
        Recent procurement actions triggered by the AI pipeline.
      </p>
      <ProcurementTable logs={logs} />
    </div>
  );
}
