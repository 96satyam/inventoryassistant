import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Sheets API: Fetching live Google Sheets data from backend...');

    // Use the updated backend endpoint that now uses Google Sheets
    const inventoryResponse = await fetch('http://127.0.0.1:8003/inventory/', {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (!inventoryResponse.ok) {
      throw new Error(`Backend returned ${inventoryResponse.status}: ${inventoryResponse.statusText}`);
    }

    const inventoryData = await inventoryResponse.json();
    console.log('✅ Got live Google Sheets inventory data:', inventoryData.length, 'rows');

    // Try to get install history data from backend
    let installHistoryData = [];
    try {
      console.log('📊 Fetching install history data...');
      const historyResponse = await fetch('http://127.0.0.1:8003/install-history/');

      if (historyResponse.ok) {
        installHistoryData = await historyResponse.json();
        console.log('✅ Got install history data:', installHistoryData.length, 'rows');
      } else {
        console.log('ℹ️ Install history endpoint not available, using empty array');
      }
    } catch (error) {
      console.log('ℹ️ Install history: Using empty array (endpoint not implemented)');
    }

    // Create a clean response with live Google Sheets data
    const liveData = {
      connected: true, // We know it's connected since we got data
      sheet_id: '1aBW1vma8eF1iNzo5_aB3S2a_a7zS4Tp1vWXncvrASls',
      spreadsheet_title: 'Inventory',
      data_sources: {
        inventory: inventoryData,
        install_history: installHistoryData,
        live_data: true,
        source: 'live_google_sheets',
        last_updated: new Date().toISOString()
      },
      sync_status: {
        last_sync: new Date().toISOString(),
        status: 'connected_google_sheets',
        auto_sync: true,
        real_time: true
      }
    };

    console.log('📊 Sheets API response:', {
      inventory_rows: inventoryData.length,
      history_rows: installHistoryData.length,
      connected: liveData.connected,
      source: 'live_google_sheets_backend'
    });

    return NextResponse.json(liveData);
  } catch (error) {
    console.error('❌ Error fetching live sheets data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live sheets data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
