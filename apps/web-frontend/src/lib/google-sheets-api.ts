import { google } from 'googleapis';

// Google Sheets API configuration
const SPREADSHEET_ID = '1aBW1vma8eF1iNzo5_aB3S2a_a7zS4Tp1vWXncvrASls';

// Service account credentials
const CREDENTIALS = {
  type: "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID || "level-dragon-465507-q8",
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || "27d4323b9ef36a45402f90194adf05e3554d7a9c",
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDQjfFTUlr06lpQ\ncCTzDUIBQOSYKcLnte7gXqCJe/C4dDwhgdK1kQN+Kex4ZoQsokxEPDnV/uAGW3Ub\n4Z4K5+XkRL73fP5MCWCifSHWdD4zPtAzB+9b1mKsYhc7YUd8jqMsCOQIo9jL5kWx\nTUXFN3uRrTodO1XstkDYnpGpePXGhk+bD0u5p6INlCKkbWoljsNH4x9okm2fYSj5\ni4os0R7Y6K6GzCmM+OFqwa+/MTYiRPF/FSZ88QAEEsS8ffLjWVPN99HV8W32oHYm\nmN6W8NTDgbaKTHVD0N+BEXPB1MnOKGJZjv+0KXn2a3RpxrkN1V8I2ZUDXB1SfR+C\n4u3FjBwfAgMBAAECggEAYTjieNTKGSWM77Wvy+xwyjPNvQ+u0CT0lH0Yeq8gE2UA\nSSCDsWfGSJDTr3cfA82vHxoyXgvAtMX67IH7kprzhTv1CFupEppGhckutpIfEvWj\nyj5XO6lP+4uIyAI7+JloANWuNEbpgHg7IgHjViJcxRcLoefw0PZPeYxGXEpKzP4k\nnk4zkAiVbVMfmHHzx1KEhDKClFPkjIzeCo0OrcwylGuAIaTZBh559Zt+s9T4saNA\nMqkn6ENszhtWPvqzR8TLUaNriORDUEF4h4ZfINQmfQ3Jmo3HhNcxtViF2SaKS209\nerlQV5wOSe3ieed5RxORdC5129szQ4dVeBlZc5uBWQKBgQD8vqJadMHjmLe5z8vV\nzbtfgi+8Ae1h1Ne+fnpkDYEMQMUXlbfWaMwnb2s1YjasfuFH8VD8pX0tHXDmpUYZ\nciOkJ48eKF5P2XWsaYbKj8CTUzeP5HJiwCs0YeoX9RcSDr1QhAIEx6sFvbCKLvW/\n9QM5pRN9MkkPnvZSvm2oom+ZVwKBgQDTPZoLjH9NoUvDOdCfhd8lsUWUWqmdInpp\ne/muR1d6DW1xvIdhI6Jd7z4gCkCsEEui1ZYfcqFG2E1xdXkdEDolujhGxzIxT4yo\n9XOXSs+ufT70dQwxRPoDlfQUctlVCjhLzn9ACW/YdYMXyAddnmWBClV80FlgMHcX\nyJppLlkueQKBgQDnedjLq59fySCLZwqyV+fBw0PglotITF0DNGb3d363MCLSRObH\n0dcYTu0LSVX1iYbeEt8vZIlOZmZedwPKjkSiNTDYV/R4gRtKuqMepaWjyFVczccN\nNh7brMlvA6MLgMBWG3CV3CB/84jaJcQg+E7p3owI36MWUWobwhhAl/RJpQKBgQCI\nNDMseSXoVzUzpwampToR4rC7jI3K/N0zQLXoMqXr09aavHYKI2Dg8o77N8ElcMhk\nMRXAJzhoJrYgjx9NpxXnF6CLuorZkrJeiw1CIwGwP5+lHgeDiTcvsrOTr84EcDeG\nYZpZHvyX9IVXgymEqspGHvSqKulGBVn04ur1IOZt+QKBgQCQxEvrNJtcVgwu2RT5\n0sGsP68OYb3PBoWsWnbWm7nXOPDnK8Jo6hiQ8CKbxVlBYIirFPnW3PEwMQ6VXxVJ\nEXDVMaCpWdqfjKy1j2uCfnHfv+irS85DfSR18BsFWx3RKfFSbeYKTJFcp3+/aUFG\ny6MWsmk3xz2lKWpzINvuA3QEZw==\n-----END PRIVATE KEY-----",
  client_email: process.env.GOOGLE_CLIENT_EMAIL || "sheet-access-service@level-dragon-465507-q8.iam.gserviceaccount.com",
  client_id: process.env.GOOGLE_CLIENT_ID || "102936385271350923610",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL || "https://www.googleapis.com/robot/v1/metadata/x509/sheet-access-service%40level-dragon-465507-q8.iam.gserviceaccount.com"
};

interface CellChange {
  sheet: string
  cell: string
  column: string
  row: number
  oldValue: any
  newValue: any
  timestamp: string
  changeId: string
}

class GoogleSheetsAPI {
  private sheets: any;
  private auth: any;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      this.auth = new google.auth.GoogleAuth({
        credentials: CREDENTIALS,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.file'
        ],
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    } catch (error) {
      console.error('Failed to initialize Google Sheets API:', error);
    }
  }

  // Add comment to a specific cell
  async addCellComment(sheetName: string, cellRange: string, comment: string): Promise<boolean> {
    try {
      if (!this.sheets) {
        await this.initializeAuth();
      }

      const sheetId = this.getSheetId(sheetName);
      if (!sheetId) {
        console.error(`Unknown sheet: ${sheetName}`);
        return false;
      }

      // Parse cell range to get row and column indices
      const { row, col } = this.parseCellRange(cellRange);

      const request = {
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [
            {
              updateCells: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: row,
                  endRowIndex: row + 1,
                  startColumnIndex: col,
                  endColumnIndex: col + 1,
                },
                rows: [
                  {
                    values: [
                      {
                        note: comment
                      }
                    ]
                  }
                ],
                fields: 'note'
              }
            }
          ]
        }
      };

      await this.sheets.spreadsheets.batchUpdate(request);
      console.log(`✅ Added comment to ${cellRange} in ${sheetName}: ${comment}`);
      return true;
    } catch (error) {
      console.error(`Failed to add comment to ${cellRange}:`, error);
      return false;
    }
  }

  // Highlight changed cells with conditional formatting
  async highlightChangedCells(changes: CellChange[]): Promise<boolean> {
    try {
      if (!this.sheets || changes.length === 0) {
        return false;
      }

      const requests = [];

      // Group changes by sheet
      const changesBySheet = changes.reduce((acc, change) => {
        if (!acc[change.sheet]) {
          acc[change.sheet] = [];
        }
        acc[change.sheet].push(change);
        return acc;
      }, {} as Record<string, CellChange[]>);

      // Create highlighting requests for each sheet
      for (const [sheetName, sheetChanges] of Object.entries(changesBySheet)) {
        const sheetId = this.getSheetId(sheetName);
        if (!sheetId) continue;

        // Create enhanced visual formatting for changed cells
        for (const change of sheetChanges) {
          const { row, col } = this.parseCellRange(change.cell);

          // Enhanced highlighting with gradient and animation-like effect
          requests.push({
            updateCells: {
              range: {
                sheetId: sheetId,
                startRowIndex: row,
                endRowIndex: row + 1,
                startColumnIndex: col,
                endColumnIndex: col + 1,
              },
              rows: [
                {
                  values: [
                    {
                      userEnteredFormat: {
                        backgroundColor: {
                          red: 0.98,
                          green: 0.85,
                          blue: 0.4,
                          alpha: 0.9
                        },
                        borders: {
                          top: {
                            style: 'SOLID',
                            width: 3,
                            color: { red: 0.9, green: 0.4, blue: 0.0, alpha: 1.0 }
                          },
                          bottom: {
                            style: 'SOLID',
                            width: 3,
                            color: { red: 0.9, green: 0.4, blue: 0.0, alpha: 1.0 }
                          },
                          left: {
                            style: 'SOLID',
                            width: 3,
                            color: { red: 0.9, green: 0.4, blue: 0.0, alpha: 1.0 }
                          },
                          right: {
                            style: 'SOLID',
                            width: 3,
                            color: { red: 0.9, green: 0.4, blue: 0.0, alpha: 1.0 }
                          }
                        },
                        textFormat: {
                          bold: true,
                          foregroundColor: { red: 0.1, green: 0.1, blue: 0.1, alpha: 1.0 }
                        }
                      }
                    }
                  ]
                }
              ],
              fields: 'userEnteredFormat'
            }
          });

          // Add a small indicator in the corner
          requests.push({
            updateCells: {
              range: {
                sheetId: sheetId,
                startRowIndex: row,
                endRowIndex: row + 1,
                startColumnIndex: col,
                endColumnIndex: col + 1,
              },
              rows: [
                {
                  values: [
                    {
                      note: `🔄 CHANGED: ${new Date(change.timestamp).toLocaleString()}\n📊 ${change.column}: ${change.oldValue} → ${change.newValue}\n🎯 Click for details: http://localhost:3001/sheets?cell=${change.cell}`
                    }
                  ]
                }
              ],
              fields: 'note'
            }
          });
        }
      }

      if (requests.length > 0) {
        const batchRequest = {
          spreadsheetId: SPREADSHEET_ID,
          resource: { requests }
        };

        await this.sheets.spreadsheets.batchUpdate(batchRequest);
        console.log(`✅ Highlighted ${changes.length} changed cells`);
      }

      return true;
    } catch (error) {
      console.error('Failed to highlight changed cells:', error);
      return false;
    }
  }

  // Add simple change details as comments to all changed cells
  async addChangeComments(changes: CellChange[]): Promise<boolean> {
    try {
      const commentPromises = changes.map(change => {
        const comment = `🔄 CHANGE DETECTED - CLICK FOR DETAILS
📅 Time: ${new Date(change.timestamp).toLocaleString()}
📊 Column: ${change.column}
📈 Previous: ${change.oldValue || 'Empty'}
📉 Current: ${change.newValue || 'Empty'}`;

        return this.addCellComment(change.sheet, change.cell, comment);
      });

      const results = await Promise.all(commentPromises);
      const successCount = results.filter(Boolean).length;

      console.log(`✅ Added simple comments to ${successCount}/${changes.length} cells`);
      return successCount > 0;
    } catch (error) {
      console.error('Failed to add change comments:', error);
      return false;
    }
  }

  // Add interactive hyperlink to changed cells
  async addInteractiveLinks(changes: CellChange[]): Promise<boolean> {
    try {
      const requests = [];

      for (const change of changes) {
        const sheetId = this.getSheetId(change.sheet);
        if (!sheetId) continue;

        const { row, col } = this.parseCellRange(change.cell);

        // Add hyperlink to dashboard with cell reference
        requests.push({
          updateCells: {
            range: {
              sheetId: sheetId,
              startRowIndex: row,
              endRowIndex: row + 1,
              startColumnIndex: col,
              endColumnIndex: col + 1,
            },
            rows: [
              {
                values: [
                  {
                    userEnteredValue: {
                      formulaValue: `=HYPERLINK("http://localhost:3001/sheets?cell=${change.cell}&change=${change.changeId}", "${change.newValue}")`
                    },
                    userEnteredFormat: {
                      textFormat: {
                        foregroundColor: { red: 0.0, green: 0.0, blue: 1.0 },
                        underline: true,
                        bold: true
                      }
                    }
                  }
                ]
              }
            ],
            fields: 'userEnteredValue,userEnteredFormat'
          }
        });
      }

      if (requests.length > 0) {
        const batchRequest = {
          spreadsheetId: SPREADSHEET_ID,
          resource: { requests }
        };

        await this.sheets.spreadsheets.batchUpdate(batchRequest);
        console.log(`✅ Added interactive links to ${changes.length} cells`);
      }

      return true;
    } catch (error) {
      console.error('Failed to add interactive links:', error);
      return false;
    }
  }

  // Clear all conditional formatting (cleanup function)
  async clearHighlighting(sheetName: string): Promise<boolean> {
    try {
      if (!this.sheets) {
        await this.initializeAuth();
      }

      const sheetId = this.getSheetId(sheetName);
      if (!sheetId) return false;

      const request = {
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [
            {
              deleteConditionalFormatRule: {
                sheetId: sheetId,
                index: 0
              }
            }
          ]
        }
      };

      await this.sheets.spreadsheets.batchUpdate(request);
      console.log(`✅ Cleared highlighting from ${sheetName}`);
      return true;
    } catch (error) {
      console.error(`Failed to clear highlighting from ${sheetName}:`, error);
      return false;
    }
  }

  // Helper: Get sheet ID from sheet name
  private getSheetId(sheetName: string): number | null {
    const sheetIds: Record<string, number> = {
      'Sheet1': 515566561,
      'Sheet2': 390609277
    };
    return sheetIds[sheetName] || null;
  }

  // Helper: Parse cell range (e.g., "B2" -> {row: 1, col: 1})
  private parseCellRange(cellRange: string): { row: number; col: number } {
    const match = cellRange.match(/^([A-Z]+)(\d+)$/);
    if (!match) {
      throw new Error(`Invalid cell range: ${cellRange}`);
    }

    const colStr = match[1];
    const rowStr = match[2];

    // Convert column letters to number (A=0, B=1, etc.)
    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
      col = col * 26 + (colStr.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    col -= 1; // Convert to 0-based index

    const row = parseInt(rowStr) - 1; // Convert to 0-based index

    return { row, col };
  }
}

// Export singleton instance
export const googleSheetsAPI = new GoogleSheetsAPI();
export default googleSheetsAPI;
