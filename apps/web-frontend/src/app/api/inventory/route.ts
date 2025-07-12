import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('📊 Dashboard API: Fetching live inventory data from Google Sheets...');
    
    // Ensure backend is configured for Google Sheets
    try {
      await fetch('http://127.0.0.1:8000/sheets/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheet_id: '1aBW1vma8eF1iNzo5_aB3S2a_a7zS4Tp1vWXncvrASls',
          enable_sync: true
        })
      });
    } catch (error) {
      console.warn('⚠️ Could not configure backend:', error);
    }
    
    // Get live Google Sheets data
    const response = await fetch('http://127.0.0.1:8000/sheets/data/Sheet1');
    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ Failed to get Sheet1 data:', result);
      return NextResponse.json([], { status: 500 });
    }
    
    const rawData = result.data;
    console.log('✅ Got live inventory data:', rawData.length, 'rows');
    
    // Transform Google Sheets data to dashboard format
    const inventoryData = rawData.map((row: any, index: number) => {
      // Extract the actual values from your Google Sheets structure
      const moduleCount = parseInt(row['No. Of Modules']) || 0;
      const moduleCompany = row['Module Company'] || 'Unknown';
      const optimizerCount = parseInt(row['No. of Optimizers']) || 0;
      
      return {
        // Use Module Company as the primary identifier
        name: moduleCompany,
        module_company: moduleCompany,
        
        // Use "No. Of Modules" as available quantity
        available: moduleCount,
        no_of_modules: moduleCount,
        'No. Of Modules': moduleCount,
        
        // Use "No. of Optimizers" as required/demand
        required: optimizerCount,
        no_of_optimizers: optimizerCount,
        'No. of Optimizers': optimizerCount,
        
        // Include other fields for compatibility
        optimizers_company: row['Optimizers Company'] || '',
        inverter_company: row['Inverter Company'] || '',
        battery_company: row['Battery Company'] || '',
        rails: row['Rails'] || '',
        clamps: row['Clamps'] || '',
        disconnects: row['Disconnects'] || '',
        conduits: row['Conduits'] || '',
        
        // Add metadata
        row_index: index + 2, // +2 for header row
        source: 'google_sheets',
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
