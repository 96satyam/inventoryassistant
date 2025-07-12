import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('📊 Dashboard API: Fetching live inventory data from backend...');

    // Get inventory data from the working backend endpoint
    const response = await fetch('http://127.0.0.1:8003/inventory/');

    if (!response.ok) {
      console.error('❌ Failed to fetch inventory data:', response.status, response.statusText);
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }

    const rawData = await response.json();
    console.log('✅ Got live inventory data:', rawData.length, 'rows');

    // Transform backend data to dashboard format
    const inventoryData = rawData.map((row: any, index: number) => {
      // Extract the actual values from the backend data structure (backend uses proper field names with spaces)
      const moduleCount = parseInt(row['No. Of Modules']) || 0;
      const moduleCompany = row['Module Company'] || 'Unknown';
      const optimizerCount = parseInt(row['No. of Optimizers']) || 0;

      return {
        // Use Module Company as the primary identifier
        name: moduleCompany,
        module_company: moduleCompany,

        // Use number of modules as available quantity
        available: moduleCount,
        no_of_modules: moduleCount,

        // Use number of optimizers as required/demand
        required: optimizerCount,
        no_of_optimizers: optimizerCount,

        // Include other fields for compatibility (using correct backend field names)
        optimizers_company: row['Optimizers Company'] || '',
        inverter_company: row['Inverter Company'] || '',
        battery_company: row['Battery Company'] || '',
        rails: row['Rails'] || '',
        clamps: row['Clamps'] || '',
        disconnects: row['Disconnects'] || '',
        conduits: row['Conduits'] || '',

        // Add metadata
        row_index: index + 1,
        source: 'backend_api',
        last_updated: new Date().toISOString()
      };
    });
    
    console.log('📊 Transformed inventory data:', {
      total_items: inventoryData.length,
      sample_item: inventoryData[0],
      available_total: inventoryData.reduce((sum, item) => sum + item.available, 0),
      required_total: inventoryData.reduce((sum, item) => sum + item.required, 0)
    });

    return NextResponse.json(inventoryData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching live inventory data:', error);
    
    // Return fallback data if Google Sheets fails
    const fallbackData = [
      {
        name: "Hanwa Cell",
        available: 25,
        required: 11,
        module_company: "Hanwa Cell",
        source: 'fallback'
      },
      {
        name: "Maxeon 7 Series", 
        available: 10,
        required: 8,
        module_company: "Maxeon 7 Series",
        source: 'fallback'
      }
    ];
    
    return NextResponse.json(fallbackData);
  }
}
