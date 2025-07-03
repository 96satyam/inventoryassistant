import InventoryTable from "@/components/inventory/inventory-table";

export default function InventoryPage() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">📦 Inventory Tracker</h2>
      <p className="text-muted-foreground mb-4">
        Live view of warehouse stock (auto‑refreshes every 10 s).
      </p>
      <InventoryTable />
    </div>
  );
}
