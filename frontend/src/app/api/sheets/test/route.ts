import { NextRequest, NextResponse } from 'next/server';
import googleSheetsAPI from '@/lib/google-sheets-api';

export async function GET() {
  try {
    console.log('🧪 Testing Google Sheets API...');
    
    // Test basic API connectivity
    const testResult = {
      timestamp: new Date().toISOString(),
      status: 'Testing Google Sheets API',
      credentials: {
        project_id: process.env.GOOGLE_PROJECT_ID ? '✅ Set' : '❌ Missing',
        client_email: process.env.GOOGLE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing',
        private_key: process.env.GOOGLE_PRIVATE_KEY ? '✅ Set' : '❌ Missing',
      },
      spreadsheet_id: '1aBW1vma8eF1iNzo5_aB3S2a_a7zS4Tp1vWXncvrASls'
    };

    console.log('📊 Test result:', testResult);

    return NextResponse.json({
      success: true,
      message: 'Google Sheets API test endpoint',
      data: testResult
    });

  } catch (error) {
    console.error('❌ API Test Error:', error);
    return NextResponse.json(
      { 
        error: 'API test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    console.log('🧪 Testing Google Sheets API action:', action);

    // Create a test change
    const testChange = {
      sheet: 'Sheet1',
      sheetName: 'Inventory',
      cell: 'B2',
      column: 'Available',
      row: 2,
      oldValue: '25',
      newValue: '30',
      timestamp: new Date().toISOString(),
      changeId: `test_${Date.now()}`
    };

    let result = false;
    let message = '';

    switch (action) {
      case 'highlight':
        result = await googleSheetsAPI.highlightChangedCells([testChange]);
        message = result ? 'Successfully highlighted test cell' : 'Failed to highlight test cell';
        break;

      case 'comment':
        result = await googleSheetsAPI.addChangeComments([testChange]);
        message = result ? 'Successfully added test comment' : 'Failed to add test comment';
        break;

      case 'both':
        const highlightResult = await googleSheetsAPI.highlightChangedCells([testChange]);
        const commentResult = await googleSheetsAPI.addChangeComments([testChange]);
        result = highlightResult && commentResult;
        message = result ? 'Successfully highlighted and commented test cell' : 'Failed to highlight/comment test cell';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: highlight, comment, or both' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result,
      message,
      testChange,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API Test Error:', error);
    return NextResponse.json(
      { 
        error: 'API test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
