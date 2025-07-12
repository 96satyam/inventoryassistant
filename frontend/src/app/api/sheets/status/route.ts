import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Frontend API: Fetching live Google Sheets data...');

    // First ensure backend is configured
    try {
      await fetch('http://127.0.0.1:8003/sheets/configure', {
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

    // Get connection status
    const statusResponse = await fetch('http://127.0.0.1:8003/sheets/status');
    const statusData = await statusResponse.json();

    // Get actual worksheet data directly
    let inventoryData = [];
    let installHistoryData = [];

    try {
      console.log('📊 Fetching Sheet1 data...');
      const inventoryResponse = await fetch('http://127.0.0.1:8003/sheets/data/Sheet1');
      const inventoryResult = await inventoryResponse.json();
      if (inventoryResult.success) {
        inventoryData = inventoryResult.data;
        console.log('✅ Got Sheet1 data:', inventoryData.length, 'rows');
      } else {
        console.error('❌ Sheet1 error:', inventoryResult);
      }
    } catch (error) {
      console.error('❌ Could not fetch Sheet1 data:', error);
    }

    try {
      console.log('📊 Fetching Sheet2 data...');
      const historyResponse = await fetch('http://127.0.0.1:8003/sheets/data/Sheet2');
      const historyResult = await historyResponse.json();
      if (historyResult.success) {
        installHistoryData = historyResult.data;
        console.log('✅ Got Sheet2 data:', installHistoryData.length, 'rows');
      } else {
        console.warn('⚠️ Sheet2 error:', historyResult);
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch Sheet2 data:', error);
    }

    // Create a clean response with live data
    const liveData = {
      connected: statusData.connected,
      sheet_id: statusData.sheet_id || '1aBW1vma8eF1iNzo5_aB3S2a_a7zS4Tp1vWXncvrASls',
      spreadsheet_title: statusData.spreadsheet_title || 'Inventory',
      data_sources: {
        inventory: inventoryData,
        install_history: installHistoryData,
        live_data: true,
        last_updated: new Date().toISOString()
      },
      sync_status: statusData.sync_status
    };

    console.log('📊 Live data response:', {
      inventory_rows: inventoryData.length,
      history_rows: installHistoryData.length,
      connected: liveData.connected
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
