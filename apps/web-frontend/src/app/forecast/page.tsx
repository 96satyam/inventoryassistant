import ForecastTable from "@/components/forecast/forecast-table"

export default function ForecastPage() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">📈 Forecasted Demand</h2>
      <ForecastTable />
    </div>
  )
}
