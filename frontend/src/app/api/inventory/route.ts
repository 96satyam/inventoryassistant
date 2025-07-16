import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('📊 Frontend API: Fetching cached inventory data from backend...');

    // Get inventory data from the backend (now using cached CSV data)
    const response = await fetch('http://127.0.0.1:8003/inventory/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch inventory data:', response.status, response.statusText);
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }

    const rawData = await response.json();
    console.log('✅ Got cached inventory data:', rawData.length, 'rows');

    // ✅ FIXED: Use the new backend data structure directly
    // Backend now returns properly structured data with name/available/required
    const inventoryData = rawData.map((row: any, index: number) => {
      return {
        // Use the backend's structured data directly
        name: row.name || 'Unknown Item',
        available: parseInt(row.available) || 0,
        required: parseInt(row.required) || 0,

        // Include category and source from backend
        category: row.category || 'unknown',
        source: row.source || 'backend',

        // Add metadata for compatibility
        row_index: index + 1,
        last_updated: new Date().toISOString(),

        // Legacy fields for backward compatibility (if needed)
        module_company: row.name || 'Unknown Item',
        no_of_modules: parseInt(row.available) || 0,
        no_of_optimizers: parseInt(row.required) || 0
      };
    });

    console.log('📊 Processed cached inventory data:', {
      total_items: inventoryData.length,
      sample_item: inventoryData[0],
      available_total: inventoryData.reduce((sum, item) => sum + item.available, 0),
      required_total: inventoryData.reduce((sum, item) => sum + item.required, 0),
      data_source: 'live_google_sheets_backend',
      backend_structure: 'name/available/required'
    });

    return NextResponse.json(inventoryData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Data-Source': 'live-google-sheets'
      }
    });

  } catch (error) {
    console.error('❌ Error fetching live Google Sheets inventory data:', error);

    // Return fallback data if Google Sheets fails
    const fallbackData = [
      {
        name: "Hanwa Qcell",
        available: 11,
        required: 2,
        category: 'modules',
        source: 'fallback_excel',
        last_updated: new Date().toISOString()
      },
      {
        name: "Maxeon 7 Series",
        available: 10,
        required: 1,
        category: 'modules',
        source: 'fallback_excel',
        last_updated: new Date().toISOString()
      }
    ];

    console.log('📄 Using fallback inventory data');
    return NextResponse.json(fallbackData, {
      headers: {
        'X-Data-Source': 'fallback-excel'
      }
    });
  }
}
