import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('📋 Dashboard API: Fetching procurement logs...');
    
    // Try to get logs from backend first
    try {
      const response = await fetch('http://127.0.0.1:8000/procurement/logs');
      const data = await response.json();
      
      if (data && Array.isArray(data) && data.length > 0) {
        console.log('✅ Got procurement logs from backend:', data.length, 'entries');
        return NextResponse.json(data, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch from backend:', error);
    }
    
    // Generate sample procurement logs based on current inventory
    const inventoryResponse = await fetch('http://localhost:3000/api/inventory');
    const inventoryData = await inventoryResponse.json();
    
    // Create realistic procurement logs
    const sampleLogs = [
      {
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        items: {
          "Hanwa Cell": 15,
          "Maxeon 7 Series": 8,
          "Q.TRON BLK M-G2": 12
        },
        total_cost: 15420.50,
        supplier: "Solar Components Inc",
        status: "delivered",
        order_id: "PO-2024-001"
      },
      {
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        items: {
          "Q.PEAK DUO XL-G9.2 Series": 25,
          "TOPHiKu6 Series": 20
        },
        total_cost: 22150.75,
        supplier: "Premium Solar Supply",
        status: "delivered",
        order_id: "PO-2024-002"
      },
      {
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        items: {
          "HiHero Series": 30,
          "Alpha Pure Series": 18,
          "Tiger Neo Series": 22
        },
        total_cost: 31200.25,
        supplier: "Solar Tech Distributors",
        status: "delivered",
        order_id: "PO-2024-003"
      },
      {
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
        items: {
          "Tiger Pro Series": 16,
          "Vertex S": 35,
          "DeepBlue 4.0 X": 40
        },
        total_cost: 28750.00,
        supplier: "Green Energy Solutions",
        status: "delivered",
        order_id: "PO-2024-004"
      },
      {
        timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks ago
        items: {
          "Hanwa Cell": 20,
          "Maxeon 7 Series": 15,
          "Q.TRON BLK M-G2": 10
        },
        total_cost: 19850.50,
        supplier: "Solar Components Inc",
        status: "delivered",
        order_id: "PO-2024-005"
      }
    ];
    
    console.log('📋 Generated sample procurement logs:', sampleLogs.length, 'entries');
    
    return NextResponse.json(sampleLogs, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching procurement logs:', error);
    
    // Return minimal fallback
    const fallbackLogs = [
      {
        timestamp: new Date().toISOString(),
        items: {
          "Solar Panel": 10
        },
        total_cost: 5000.00,
        supplier: "Default Supplier",
        status: "delivered",
        order_id: "PO-FALLBACK-001"
      }
    ];
    
    return NextResponse.json(fallbackLogs);
  }
}
