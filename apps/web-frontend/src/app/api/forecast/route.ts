import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('📈 Dashboard API: Generating forecast data from live inventory...');
    
    // Get live inventory data first
    const inventoryResponse = await fetch('http://localhost:3000/api/inventory');
    const inventoryData = await inventoryResponse.json();
    
    if (!inventoryData || inventoryData.length === 0) {
      console.warn('⚠️ No inventory data available for forecasting');
      return NextResponse.json([]);
    }
    
    // Generate forecast based on live inventory data
    // Logic: Forecast demand for next 10 installations based on current stock levels
    const forecastData = inventoryData.map((item: any) => {
      const currentStock = item.available || 0;
      const currentDemand = item.required || 0;
      
      // Calculate forecasted demand for next 10 installations
      // If current demand is low, predict higher future demand
      // If current stock is low, mark as high priority
      let forecastedQty = 0;
      
      if (currentDemand > 0) {
        // Base forecast on current demand patterns
        forecastedQty = Math.round(currentDemand * 2.5); // 2.5x current demand for next 10 jobs
      } else {
        // If no current demand, estimate based on stock levels
        forecastedQty = Math.round(currentStock * 0.3); // 30% of current stock
      }
      
      // Add some variability based on item type
      const itemName = item.name || item.module_company || 'Unknown';
      if (itemName.toLowerCase().includes('solar') || itemName.toLowerCase().includes('module')) {
        forecastedQty = Math.round(forecastedQty * 1.2); // Higher demand for solar modules
      }
      
      return {
        model: itemName,
        qty: Math.max(forecastedQty, 1), // Minimum 1 unit
        urgency: currentStock < currentDemand ? 300 : 100, // Higher urgency if low stock
        is_urgent: currentStock < currentDemand,
        category: 'solar_component',
        source: 'live_calculation',
        based_on_stock: currentStock,
        based_on_demand: currentDemand
      };
    }).filter(item => item.qty > 0); // Only include items with forecasted demand
    
    // Sort by urgency and quantity
    const sortedForecast = forecastData
      .sort((a, b) => {
        if (a.is_urgent !== b.is_urgent) {
          return a.is_urgent ? -1 : 1; // Urgent items first
        }
        return b.qty - a.qty; // Then by quantity descending
      })
      .slice(0, 15); // Top 15 forecasted items
    
    console.log('📈 Generated forecast data:', {
      total_items: sortedForecast.length,
      total_forecasted: sortedForecast.reduce((sum, item) => sum + item.qty, 0),
      urgent_items: sortedForecast.filter(item => item.is_urgent).length,
      sample_item: sortedForecast[0]
    });
    
    return NextResponse.json(sortedForecast);
    
  } catch (error) {
    console.error('❌ Error generating forecast data:', error);
    
    // Return fallback forecast data
    const fallbackForecast = [
      {
        model: "Solar Panel 400W",
        qty: 50,
        urgency: 250,
        is_urgent: true,
        source: 'fallback'
      },
      {
        model: "Power Optimizer",
        qty: 45,
        urgency: 200,
        is_urgent: true,
        source: 'fallback'
      },
      {
        model: "Inverter 3kW",
        qty: 25,
        urgency: 150,
        is_urgent: false,
        source: 'fallback'
      }
    ];
    
    return NextResponse.json(fallbackForecast);
  }
}
