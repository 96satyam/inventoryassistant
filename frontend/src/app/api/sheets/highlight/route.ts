import { NextRequest, NextResponse } from 'next/server';
import googleSheetsAPI from '@/lib/google-sheets-api';

interface CellChange {
  sheet: string
  sheetName: string
  cell: string
  column: string
  row: number
  oldValue: any
  newValue: any
  timestamp: string
  changeId: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { changes, action } = body;

    if (!changes || !Array.isArray(changes)) {
      return NextResponse.json(
        { error: 'Invalid changes data' },
        { status: 400 }
      );
    }

    let result = false;

    switch (action) {
      case 'highlight':
        // Highlight changed cells with conditional formatting
        result = await googleSheetsAPI.highlightChangedCells(changes);
        break;

      case 'comment':
        // Add comments to changed cells
        result = await googleSheetsAPI.addChangeComments(changes);
        break;

      case 'both':
        // Both highlight and add comments
        const highlightResult = await googleSheetsAPI.highlightChangedCells(changes);
        const commentResult = await googleSheetsAPI.addChangeComments(changes);
        result = highlightResult && commentResult;
        break;

      case 'interactive':
        // Simple interactive experience with highlighting and comments only
        const interactiveHighlight = await googleSheetsAPI.highlightChangedCells(changes);
        const interactiveComments = await googleSheetsAPI.addChangeComments(changes);
        result = interactiveHighlight && interactiveComments;
        break;

      case 'clear':
        // Clear highlighting from specified sheets
        const sheets = [...new Set(changes.map((c: CellChange) => c.sheet))];
        const clearResults = await Promise.all(
          sheets.map(sheet => googleSheetsAPI.clearHighlighting(sheet))
        );
        result = clearResults.every(Boolean);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: highlight, comment, both, interactive, or clear' },
          { status: 400 }
        );
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message: `Successfully ${action}ed ${changes.length} cell changes`,
        processedChanges: changes.length
      });
    } else {
      return NextResponse.json(
        { error: `Failed to ${action} cell changes` },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to test API connectivity
export async function GET() {
  try {
    return NextResponse.json({
      status: 'Google Sheets API ready',
      timestamp: new Date().toISOString(),
      availableActions: ['highlight', 'comment', 'both', 'interactive', 'clear'],
      features: {
        highlighting: 'Visual cell highlighting with borders',
        comments: 'Simple change comments with timestamps',
        interactive: 'Highlighting + comments (simplified)',
        clear: 'Remove all highlighting and formatting'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'API not available', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
