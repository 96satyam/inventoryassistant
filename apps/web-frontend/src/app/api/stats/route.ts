import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('📊 Dashboard API: Calculating live stats from Google Sheets data...');
    
    // Get live data from our new endpoints
    const [inventoryResponse, forecastResponse] = await Promise.all([
      fetch('http://localhost:3000/api/inventory'),
      fetch('http://localhost:3000/api/forecast')
    ]);
    
    const inventoryData = await inventoryResponse.json();
    const forecastData = await forecastResponse.json();
    
    if (!inventoryData || inventoryData.length === 0) {
      console.warn('⚠️ No inventory data available for stats calculation');
      return NextResponse.json({
        total_skus: 0,
        healthy_stock: 0,
        low_stock: 0,
        forecasted: 0,
        efficiency: 0,
        source: 'no_data'
      });
    }
    
    // Calculate real stats from live data
    const totalSKUs = inventoryData.length;
    
    // Healthy stock: items where available >= required
    const healthyItems = inventoryData.filter((item: any) => 
      (item.available || 0) >= (item.required || 0)
    );
    const healthyStock = healthyItems.length;
    
    // Low stock: items where available < required
    const lowStockItems = inventoryData.filter((item: any) => 
      (item.available || 0) < (item.required || 0)
    );
    const lowStock = lowStockItems.length;
    
    // Total forecasted demand
    const totalForecasted = forecastData.reduce((sum: number, item: any) => 
      sum + (item.qty || 0), 0
    );
    
    // Calculate efficiency: percentage of items with adequate stock
    const efficiency = totalSKUs > 0 ? Math.round((healthyStock / totalSKUs) * 100) : 100;
    
    // Find next shortfall (most urgent low stock item)
    const nextShortfall = lowStockItems
      .map((item: any) => ({
        item: item.name || item.module_company || 'Unknown',
        shortage: (item.required || 0) - (item.available || 0),
        available: item.available || 0,
        required: item.required || 0
      }))
      .sort((a, b) => b.shortage - a.shortage)[0];
    
    const stats = {
      total_skus: totalSKUs,
      healthy_stock: healthyStock,
      low_stock: lowStock,
      forecasted: totalForecasted,
      efficiency: efficiency,
      open_procurements: Math.min(lowStock, 8), // Estimate based on low stock items
      next_shortfall: nextShortfall ? {
        item: nextShortfall.item,
        days: Math.ceil(nextShortfall.shortage / 5), // Estimate days based on shortage
        quantity: nextShortfall.shortage,
        available: nextShortfall.available,
        required: nextShortfall.required
      } : null,
      
      // Additional metadata
      source: 'live_google_sheets',
      last_updated: new Date().toISOString(),
      data_breakdown: {
        total_available: inventoryData.reduce((sum: number, item: any) => sum + (item.available || 0), 0),
        total_required: inventoryData.reduce((sum: number, item: any) => sum + (item.required || 0), 0),
        healthy_percentage: Math.round((healthyStock / totalSKUs) * 100),
        low_stock_percentage: Math.round((lowStock / totalSKUs) * 100)
      }
    };
    
    console.log('📊 Calculated live stats:', stats);

    // Return with cache-busting headers
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('❌ Error calculating live stats:', error);
    
    // Return fallback stats
    const fallbackStats = {
      total_skus: 12,
      healthy_stock: 5,
      low_stock: 7,
      forecasted: 200,
      efficiency: 42,
      open_procurements: 5,
      next_shortfall: {
        item: "Solar Panel",
        days: 3,
        quantity: 15
      },
      source: 'fallback'
    };
    
    return NextResponse.json(fallbackStats);
  }
}
