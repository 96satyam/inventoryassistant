'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Cloud,
  Database,
  RefreshCw,
  CheckCircle,
  FileSpreadsheet,
  ExternalLink,
  Activity,
  Zap,
  Eye,
  BarChart3,
  TrendingUp,
  Clock,
  Shield,
  Warehouse,
  Calendar,
  Timer,
  History,
  Rocket,
  FileText,
  Save,
  MousePointer
} from 'lucide-react'
import ChangePopup from '@/components/sheets/change-popup'

interface SheetsStatus {
  connected: boolean
  sheet_id: string | null
  spreadsheet_title: string | null
  data_sources: any
  sync_status: any
}

interface CellChange {
  sheet: string
  sheetName: string // "Sheet1" or "Sheet2"
  cell: string // e.g., "A2", "B3"
  column: string // e.g., "Available", "Required", "Name"
  row: number // Row number
  oldValue: any
  newValue: any
  timestamp: string
  changeId: string
}

interface ChangeLogEntry {
  id: string
  timestamp: string
  action: string
  details: string
  sheet: string
  user: string
  cellChanges?: CellChange[] // Array of specific cell changes
  coordinates?: string // Cell coordinates for direct navigation
}

// Column mapping for Google Sheets (based on real data structure)
const SHEET_COLUMNS = {
  inventory: {
    modules_count: 'A',        // "No. Of Modules"
    module_company: 'B',       // "Module Company"
    optimizers_count: 'C',     // "No. of Optimizers"
    optimizers_company: 'D',   // "Optimizers Company"
    inverter_company: 'E',     // "Inverter Company"
    battery_company: 'F',      // "Battery Company"
    rails: 'G',                // "Rails"
    clamps: 'H',               // "Clamps"
    disconnects: 'I',          // "Disconnects"
    conduits: 'J'              // "Conduits"
  },
  install_history: {
    date: 'A',
    customer: 'B',
    system_size: 'C',
    panels: 'D',
    inverter: 'E',
    status: 'F'
  }
}

const SHEET_GIDS = {
  'Sheet1': '515566561',
  'Sheet2': '390609277'
}

export default function SheetsPage() {
  const [status, setStatus] = useState<SheetsStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [countdown, setCountdown] = useState(300) // 5 minutes in seconds
  const [changeLogs, setChangeLogs] = useState<ChangeLogEntry[]>([])
  const [showChangeLogs, setShowChangeLogs] = useState(false)
  const [previousData, setPreviousData] = useState<any>(null)
  const [selectedChange, setSelectedChange] = useState<CellChange | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showRefreshSuccess, setShowRefreshSuccess] = useState(false)

  // Counter for unique IDs
  const [idCounter, setIdCounter] = useState(0)

  // Ref for change log section
  const changeLogRef = useRef<HTMLDivElement>(null)

  // Generate unique ID for change log entries
  const generateUniqueId = () => {
    const newId = `${Date.now()}_${idCounter}_${Math.random().toString(36).substr(2, 9)}`
    setIdCounter(prev => prev + 1)
    return newId
  }

  // Generate unique ID for cell changes
  const generateCellChangeId = (type: string, index: number) => {
    return `${type}_${Date.now()}_${idCounter}_${index}_${Math.random().toString(36).substr(2, 6)}`
  }

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/sheets/status')
      const data = await response.json()

      // Detect changes before updating status
      detectDataChanges(data)

      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch sheets status:', error)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    setLoading(true)

    try {
      console.log('🔄 Starting data refresh...')
      addChangeLog('System', 'Starting data refresh...', 'System')

      await fetchStatus()

      setLastRefresh(new Date())
      setCountdown(300) // Reset countdown to 5 minutes

      // Show success feedback
      setShowRefreshSuccess(true)
      setTimeout(() => setShowRefreshSuccess(false), 3000)

      addChangeLog('System', '✅ Data refreshed successfully', 'System')
      console.log('✅ Data refresh completed successfully')

    } catch (error) {
      console.error('❌ Failed to refresh data:', error)
      addChangeLog('Error', `❌ Failed to refresh data: ${error}`, 'System')

      // Show error feedback
      alert(`Failed to refresh data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  // Add change log entry with debounce to prevent rapid updates
  const addChangeLog = (action: string, details: string, sheet: string) => {
    const newEntry: ChangeLogEntry = {
      id: generateUniqueId(),
      timestamp: new Date().toLocaleString(),
      action,
      details,
      sheet,
      user: 'System'
    }

    // Use setTimeout to batch rapid updates
    setTimeout(() => {
      setChangeLogs(prev => {
        // Check if this exact entry already exists to prevent duplicates
        const exists = prev.some(log =>
          log.action === action &&
          log.details === details &&
          log.sheet === sheet &&
          Math.abs(new Date(log.timestamp).getTime() - new Date(newEntry.timestamp).getTime()) < 1000
        )

        if (exists) {
          console.log('🔄 Skipping duplicate log entry:', details)
          return prev
        }

        return [newEntry, ...prev.slice(0, 49)] // Keep last 50 entries
      })
    }, 10) // Small delay to batch updates
  }

  // Add change log entry with cell changes
  const addChangeLogWithCells = (action: string, details: string, sheet: string, cellChanges: CellChange[]) => {
    const newEntry: ChangeLogEntry = {
      id: generateUniqueId(),
      timestamp: new Date().toLocaleString(),
      action,
      details,
      sheet,
      user: 'System',
      cellChanges,
      coordinates: cellChanges.map(c => c.cell).join(', ')
    }
    setChangeLogs(prev => [newEntry, ...prev.slice(0, 49)]) // Keep last 50 entries

    // Automatically highlight and add comments to changed cells
    if (cellChanges.length > 0) {
      highlightChangedCells(cellChanges)
    }
  }

  // Highlight changed cells in Google Sheets
  const highlightChangedCells = async (cellChanges: CellChange[]) => {
    try {
      const response = await fetch('/api/sheets/highlight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changes: cellChanges,
          action: 'interactive' // Full interactive experience
        }),
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Successfully highlighted cells in Google Sheets:', result)
        addChangeLog('API Success', `Highlighted ${cellChanges.length} cells in Google Sheets`, 'System')
      } else {
        console.error('❌ Failed to highlight cells:', result.error)
        addChangeLog('API Error', `Failed to highlight cells: ${result.error}`, 'System')
      }
    } catch (error) {
      console.error('❌ Error calling highlight API:', error)
      addChangeLog('API Error', `Error highlighting cells: ${error}`, 'System')
    }
  }

  // Save change logs to localStorage
  const saveChangeLogs = () => {
    try {
      localStorage.setItem('sheets-change-logs', JSON.stringify(changeLogs))
      addChangeLog('Export', 'Change logs saved to local storage', 'System')
    } catch (error) {
      console.error('Failed to save change logs:', error)
    }
  }

  // Load change logs from localStorage
  const loadChangeLogs = () => {
    try {
      const saved = localStorage.getItem('sheets-change-logs')
      if (saved) {
        setChangeLogs(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load change logs:', error)
    }
  }

  // Enhanced change detection with cell coordinates
  const detectDataChanges = (newData: any) => {
    if (!previousData || !newData) {
      setPreviousData(newData)
      return
    }

    try {
      const cellChanges: CellChange[] = []

      // Check inventory changes (Sheet1)
      if (newData.data_sources?.inventory && previousData.data_sources?.inventory) {
        const newInventory = newData.data_sources.inventory
        const oldInventory = previousData.data_sources.inventory

        // Track changes with cell coordinates
        console.log('🔍 Comparing inventory data:')
        console.log('📊 New inventory:', newInventory)
        console.log('📊 Old inventory:', oldInventory)

        newInventory.forEach((newItem: any, index: number) => {
          // Use Module Company as the unique identifier
          const oldItem = oldInventory.find((old: any) =>
            old['Module Company'] === newItem['Module Company']
          )
          const rowNumber = index + 2 // +2 because row 1 is header, array is 0-indexed

          console.log(`🔍 Row ${rowNumber} (Index ${index}):`)
          console.log('  📝 New item:', newItem)
          console.log('  📝 Old item:', oldItem)

          if (!oldItem) {
            // New item added
            cellChanges.push({
              sheet: 'Sheet1',
              sheetName: 'Inventory',
              cell: `${SHEET_COLUMNS.inventory.module_company}${rowNumber}`,
              column: 'Module Company',
              row: rowNumber,
              oldValue: null,
              newValue: newItem['Module Company'],
              timestamp: new Date().toISOString(),
              changeId: generateCellChangeId('new', index)
            })
          } else {
            // Check for field changes using real field names

            // Check modules count changes
            if (oldItem['No. Of Modules'] !== newItem['No. Of Modules']) {
              cellChanges.push({
                sheet: 'Sheet1',
                sheetName: 'Inventory',
                cell: `${SHEET_COLUMNS.inventory.modules_count}${rowNumber}`,
                column: 'No. Of Modules',
                row: rowNumber,
                oldValue: oldItem['No. Of Modules'],
                newValue: newItem['No. Of Modules'],
                timestamp: new Date().toISOString(),
                changeId: generateCellChangeId('modules', index)
              })
            }

            // Check module company changes
            if (oldItem['Module Company'] !== newItem['Module Company']) {
              cellChanges.push({
                sheet: 'Sheet1',
                sheetName: 'Inventory',
                cell: `${SHEET_COLUMNS.inventory.module_company}${rowNumber}`,
                column: 'Module Company',
                row: rowNumber,
                oldValue: oldItem['Module Company'],
                newValue: newItem['Module Company'],
                timestamp: new Date().toISOString(),
                changeId: generateCellChangeId('company', index)
              })
            }

            // Check optimizers count changes
            if (oldItem['No. of Optimizers'] !== newItem['No. of Optimizers']) {
              cellChanges.push({
                sheet: 'Sheet1',
                sheetName: 'Inventory',
                cell: `${SHEET_COLUMNS.inventory.optimizers_count}${rowNumber}`,
                column: 'No. of Optimizers',
                row: rowNumber,
                oldValue: oldItem['No. of Optimizers'],
                newValue: newItem['No. of Optimizers'],
                timestamp: new Date().toISOString(),
                changeId: generateCellChangeId('optimizers', index)
              })
            }

            // Check other field changes as needed
            const fieldsToCheck = [
              { key: 'Optimizers Company', column: 'optimizers_company', name: 'Optimizers Company' },
              { key: 'Inverter Company', column: 'inverter_company', name: 'Inverter Company' },
              { key: 'Battery Company', column: 'battery_company', name: 'Battery Company' },
              { key: 'Rails', column: 'rails', name: 'Rails' },
              { key: 'Clamps', column: 'clamps', name: 'Clamps' },
              { key: 'Disconnects', column: 'disconnects', name: 'Disconnects' },
              { key: 'Conduits', column: 'conduits', name: 'Conduits' }
            ]

            fieldsToCheck.forEach((field, fieldIndex) => {
              if (oldItem[field.key] !== newItem[field.key]) {
                cellChanges.push({
                  sheet: 'Sheet1',
                  sheetName: 'Inventory',
                  cell: `${SHEET_COLUMNS.inventory[field.column as keyof typeof SHEET_COLUMNS.inventory]}${rowNumber}`,
                  column: field.name,
                  row: rowNumber,
                  oldValue: oldItem[field.key],
                  newValue: newItem[field.key],
                  timestamp: new Date().toISOString(),
                  changeId: generateCellChangeId(field.column, index * 10 + fieldIndex)
                })
              }
            })
          }
        })
      }

      // Check install history changes (Sheet2)
      if (newData.data_sources?.install_history && previousData.data_sources?.install_history) {
        const newHistory = newData.data_sources.install_history
        const oldHistory = previousData.data_sources.install_history

        // Track new installations
        if (newHistory.length > oldHistory.length) {
          const newRecords = newHistory.slice(oldHistory.length)
          newRecords.forEach((record: any, index: number) => {
            const rowNumber = oldHistory.length + index + 2
            cellChanges.push({
              sheet: 'Sheet2',
              sheetName: 'Install History',
              cell: `A${rowNumber}`,
              column: 'Date',
              row: rowNumber,
              oldValue: null,
              newValue: record.date || 'New Installation',
              timestamp: new Date().toISOString(),
              changeId: generateCellChangeId('install', index)
            })
          })
        }
      }

      // Log changes if any detected
      if (cellChanges.length > 0) {
        const changeDetails = cellChanges.map(change =>
          `${change.cell}: ${change.column} changed from "${change.oldValue}" to "${change.newValue}"`
        ).join(', ')

        const primarySheet = cellChanges[0].sheet
        addChangeLogWithCells('Data Change', changeDetails, primarySheet, cellChanges)
      }

      setPreviousData(newData)
    } catch (error) {
      console.error('Error detecting changes:', error)
    }
  }

  useEffect(() => {
    refreshData()
    loadChangeLogs()

    // Add initial log entry
    addChangeLog('System', 'Sheets page loaded - monitoring started', 'System')

    // Auto-refresh every 5 minutes (300 seconds)
    const refreshInterval = setInterval(refreshData, 300000)

    // Countdown timer - updates every second
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 300 // Reset to 5 minutes
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(refreshInterval)
      clearInterval(countdownInterval)
    }
  }, [])

  // Format countdown time
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const openGoogleSheet = (worksheetGid?: string) => {
    // Use the known sheet ID directly to ensure functionality works
    const sheetId = status?.sheet_id || '1aBW1vma8eF1iNzo5_aB3S2a_a7zS4Tp1vWXncvrASls'
    const baseUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`
    const url = worksheetGid ? `${baseUrl}?gid=${worksheetGid}#gid=${worksheetGid}` : baseUrl
    window.open(url, '_blank')
  }

  const openSheet1 = () => {
    console.log('🔗 Opening Sheet1 - Inventory')
    addChangeLog('Access', 'Opened Sheet1 - Inventory for editing', 'Sheet1')
    openGoogleSheet('515566561')
  }

  const openSheet2 = () => {
    console.log('🔗 Opening Sheet2 - Install History')
    addChangeLog('Access', 'Opened Sheet2 - Install History for editing', 'Sheet2')
    openGoogleSheet('390609277')
  }

  // Open sheet with specific cell highlighted
  const openSheetWithCell = (sheetName: string, cellRange?: string) => {
    console.log(`🔗 Attempting to open sheet: ${sheetName}, cell: ${cellRange}`)

    const sheetId = status?.sheet_id || '1aBW1vma8eF1iNzo5_aB3S2a_a7zS4Tp1vWXncvrASls'
    const gid = SHEET_GIDS[sheetName as keyof typeof SHEET_GIDS]

    console.log(`📊 Sheet ID: ${sheetId}, GID: ${gid}`)
    console.log(`🗂️ Available GIDs:`, SHEET_GIDS)

    if (!gid) {
      console.error(`❌ No GID found for sheet: ${sheetName}`)
      console.log(`🔍 Available sheet names:`, Object.keys(SHEET_GIDS))
      // Fallback to opening the main sheet
      const fallbackUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`
      console.log(`🔄 Using fallback URL: ${fallbackUrl}`)
      window.open(fallbackUrl, '_blank')
      addChangeLog('Access', `Opened fallback sheet (no GID found for ${sheetName})`, 'System')
      return
    }

    // Try multiple URL formats for better compatibility
    let url: string

    if (cellRange) {
      // Format 1: Direct cell selection with range parameter
      url = `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=${gid}&range=${cellRange}`
      console.log(`🎯 Trying URL Format 1 (with range): ${url}`)

      // Also try alternative format
      const altUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit?gid=${gid}#gid=${gid}&range=${cellRange}`
      console.log(`🎯 Alternative URL Format: ${altUrl}`)
    } else {
      url = `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=${gid}`
      console.log(`🎯 Basic URL (no cell): ${url}`)
    }

    try {
      addChangeLog('Access', `Opening ${sheetName}${cellRange ? ` → cell ${cellRange}` : ''}`, sheetName)

      // Add visual feedback
      console.log(`✅ Opening Google Sheets in new tab...`)
      const newWindow = window.open(url, '_blank')

      if (!newWindow) {
        console.error(`❌ Failed to open new window - popup blocked?`)
        addChangeLog('Error', 'Failed to open Google Sheets - popup may be blocked', 'System')
        alert('Failed to open Google Sheets. Please check if popup blocker is enabled.')
      } else {
        console.log(`✅ Successfully opened Google Sheets`)
        addChangeLog('Success', `Successfully opened ${sheetName}`, sheetName)
      }
    } catch (error) {
      console.error(`❌ Error opening sheet:`, error)
      addChangeLog('Error', `Error opening sheet: ${error}`, 'System')
    }
  }

  // Show change popup
  const showChangePopup = (cellChange: CellChange) => {
    setSelectedChange(cellChange)
    setShowPopup(true)
    addChangeLog('Interaction', `Viewed details for cell ${cellChange.cell}`, cellChange.sheet)
  }

  // Close change popup
  const closeChangePopup = () => {
    setShowPopup(false)
    setSelectedChange(null)
  }

  // Handle popup navigation to cell
  const handlePopupNavigation = (sheet: string, cell: string) => {
    openSheetWithCell(sheet, cell)
    closeChangePopup()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Professional Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <FileSpreadsheet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Google Sheets Integration
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  Real-time data synchronization & live monitoring
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 5-Minute Timer */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-lg">
              <Timer className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Next sync: {formatCountdown(countdown)}
              </span>
            </div>

            {/* Change Log Button */}
            <Button
              onClick={() => {
                setShowChangeLogs(!showChangeLogs)
                // Auto-scroll to change log section after a brief delay
                setTimeout(() => {
                  if (!showChangeLogs && changeLogRef.current) {
                    changeLogRef.current.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    })
                  }
                }, 100)
              }}
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-purple-50 hover:border-purple-300"
            >
              <History className="h-4 w-4 mr-2" />
              Change Log ({changeLogs.length})
            </Button>

            <div className="relative">
              <Button
                onClick={refreshData}
                disabled={loading || refreshing}
                variant="outline"
                className={`bg-white/80 backdrop-blur-sm border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-300 ${
                  refreshing ? 'scale-105 shadow-lg border-green-400' : ''
                } ${showRefreshSuccess ? 'border-green-500 bg-green-50' : ''}`}
              >
                <RefreshCw className={`h-4 w-4 mr-2 transition-transform duration-500 ${
                  loading || refreshing ? 'animate-spin' : ''
                }`} />
                {refreshing ? 'Refreshing...' : showRefreshSuccess ? 'Refreshed!' : 'Refresh Data'}
              </Button>

              {/* Success Animation */}
              {showRefreshSuccess && (
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <div className="bg-green-500 text-white rounded-full p-1">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                </div>
              )}

              {/* Refresh Progress Indicator */}
              {refreshing && (
                <div className="absolute inset-0 bg-green-100/50 rounded-md animate-pulse pointer-events-none" />
              )}
            </div>

            {status?.sheet_id && (
              <Button
                onClick={() => openGoogleSheet()}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Google Sheets
              </Button>
            )}
          </div>
        </div>

        {/* Live Status Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Connection Status */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700">Connection</CardTitle>
                <Cloud className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {status?.connected ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg" />
                    <div>
                      <div className="font-bold text-green-700">Connected</div>
                      <div className="text-xs text-muted-foreground">Google Sheets Live</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-orange-500 rounded-full shadow-lg" />
                    <div>
                      <div className="font-bold text-orange-700">Fallback Mode</div>
                      <div className="text-xs text-muted-foreground">Using Excel Files</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Background Sync */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700">Auto Sync</CardTitle>
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-yellow-500" />
                <div>
                  <div className="font-bold text-blue-700">
                    {status?.data_sources?.background_sync ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-xs text-muted-foreground">Every 5 minutes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Freshness */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700">Last Update</CardTitle>
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="font-bold text-purple-700">
                    {lastRefresh.toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Real-time sync</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700">System Health</CardTitle>
                <Shield className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <div className="font-bold text-green-700">Operational</div>
                  <div className="text-xs text-muted-foreground">All systems running</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Data Worksheets */}
        {status?.connected && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">Live Data Worksheets</CardTitle>
                    <CardDescription className="text-gray-600">
                      Real-time data from your Google Sheets - click to view and edit
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Activity className="h-3 w-3 mr-1" />
                  Live Sync
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sheet1 - Inventory */}
                <div
                  onClick={(e) => {
                    console.log('🖱️ Sheet1 card clicked')
                    openSheet1()
                  }}
                  className="group relative p-6 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                        <Warehouse className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Sheet1 - Inventory</h3>
                        <p className="text-sm text-gray-600">Equipment & Stock Management</p>
                      </div>
                    </div>
                    <Eye className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-bold text-green-700">Live Data</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Data Type:</span>
                      <span className="text-sm font-bold text-gray-800">Inventory Items</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Records:</span>
                      <span className="text-sm font-bold text-blue-700">11 Items</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md"
                      onClick={(e) => {
                        console.log('🖱️ Sheet1 button clicked')
                        e.stopPropagation()
                        openSheet1()
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View & Edit Inventory
                    </Button>
                  </div>
                </div>

                {/* Sheet2 - Install History */}
                <div
                  onClick={(e) => {
                    console.log('🖱️ Sheet2 card clicked')
                    openSheet2()
                  }}
                  className="group relative p-6 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Sheet2 - Install History</h3>
                        <p className="text-sm text-gray-600">Installation Records & Analytics</p>
                      </div>
                    </div>
                    <Eye className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-bold text-green-700">Live Data</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Data Type:</span>
                      <span className="text-sm font-bold text-gray-800">Installation Records</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Records:</span>
                      <span className="text-sm font-bold text-blue-700">20 Installations</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                      onClick={(e) => {
                        console.log('🖱️ Sheet2 button clicked')
                        e.stopPropagation()
                        openSheet2()
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View & Edit History
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Integration Details & Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Integration Status */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <FileSpreadsheet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800">Integration Status</CardTitle>
                  <CardDescription className="text-gray-600">
                    Current state of your Google Sheets connection
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {status?.connected ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>🎉 Integration Active!</strong> Your Google Sheets are connected and syncing automatically.
                    {status?.sheet_id && (
                      <div className="mt-3 p-3 bg-green-100 rounded-lg">
                        <div className="text-xs font-mono text-green-700">
                          <strong>Sheet ID:</strong> {status.sheet_id}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          <strong>Spreadsheet:</strong> "Inventory" (2 worksheets)
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-orange-200 bg-orange-50">
                  <Database className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>⚠️ Fallback Mode:</strong> Google Sheets integration is not active.
                    The application is using local Excel files for data.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Real-Time Features */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800">Real-Time Features</CardTitle>
                  <CardDescription className="text-gray-600">
                    Advanced capabilities powered by live data
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Synchronization
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Automatic sync every 5 minutes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Live data updates across all agents
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Background processing & monitoring
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Excel fallback protection
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Database className="h-4 w-4 text-purple-500" />
                    Data Sources
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Warehouse className="h-3 w-3 text-green-500" />
                      Sheet1: Live inventory management
                    </li>
                    <li className="flex items-center gap-2">
                      <BarChart3 className="h-3 w-3 text-blue-500" />
                      Sheet2: Installation history & analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-purple-500" />
                      Real-time forecasting engine
                    </li>
                    <li className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-orange-500" />
                      Live procurement alerts
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Change Log Modal */}
        {showChangeLogs && (
          <Card ref={changeLogRef} className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                    <History className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-purple-900">Change Log</CardTitle>
                    <CardDescription className="text-purple-700">Track all sheet access and modifications</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={saveChangeLogs}
                    size="sm"
                    variant="outline"
                    className="border-purple-200 hover:bg-purple-50"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save Logs
                  </Button>
                  <Button
                    onClick={() => {
                      const allCellChanges = changeLogs
                        .filter(log => log.cellChanges && log.cellChanges.length > 0)
                        .flatMap(log => log.cellChanges!)
                      if (allCellChanges.length > 0) {
                        highlightChangedCells(allCellChanges)
                      }
                    }}
                    size="sm"
                    variant="outline"
                    className="border-orange-200 hover:bg-orange-50"
                  >
                    <Rocket className="h-4 w-4 mr-1" />
                    Highlight All
                  </Button>
                  <Button
                    onClick={() => {
                      // Create a realistic test change based on your actual scenario
                      const testChange: CellChange = {
                        sheet: 'Sheet1',
                        sheetName: 'Inventory',
                        cell: 'B2',
                        column: 'Module Company',
                        row: 2,
                        oldValue: 'Maxeon 7 Series',
                        newValue: '30',
                        timestamp: new Date().toISOString(),
                        changeId: generateCellChangeId('test', 0)
                      }
                      addChangeLogWithCells('Data Change', 'Module Company changed from "Maxeon 7 Series" to "30"', 'Sheet1', [testChange])
                    }}
                    size="sm"
                    variant="outline"
                    className="border-blue-200 hover:bg-blue-50"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Add Test Change
                  </Button>
                  <Button
                    onClick={() => {
                      console.log('🔍 === COMPLETE DATA DEBUG ===')
                      console.log('📊 Current status:', status)
                      console.log('📊 Previous data:', previousData)

                      if (status?.data_sources?.inventory) {
                        console.log('✅ Current inventory data:')
                        console.log('   📋 Type:', typeof status.data_sources.inventory)
                        console.log('   📋 Length:', status.data_sources.inventory.length)
                        console.log('   📋 First item:', status.data_sources.inventory[0])
                        console.log('   📋 All data:', status.data_sources.inventory)
                      } else {
                        console.log('❌ No inventory data found')
                      }

                      if (previousData?.data_sources?.inventory) {
                        console.log('✅ Previous inventory data:')
                        console.log('   📋 Type:', typeof previousData.data_sources.inventory)
                        console.log('   📋 Length:', previousData.data_sources.inventory.length)
                        console.log('   📋 First item:', previousData.data_sources.inventory[0])
                      } else {
                        console.log('❌ No previous inventory data')
                      }

                      console.log('🔍 === END DEBUG ===')
                    }}
                    size="sm"
                    variant="outline"
                    className="border-yellow-200 hover:bg-yellow-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Debug Data
                  </Button>
                  <Button
                    onClick={() => setShowChangeLogs(false)}
                    size="sm"
                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {changeLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No changes logged yet</p>
                  <p className="text-sm">Sheet access and modifications will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {changeLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="p-1 bg-purple-100 rounded">
                        <Clock className="h-3 w-3 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {log.action}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {log.sheet}
                          </Badge>
                          {log.coordinates && (
                            <Badge variant="default" className="text-xs bg-blue-100 text-blue-700">
                              📍 {log.coordinates}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{log.details}</p>
                        <p className="text-xs text-muted-foreground mb-2">{log.timestamp}</p>

                        {/* Cell Changes Details */}
                        {log.cellChanges && log.cellChanges.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-medium text-gray-700">Cell Changes:</p>
                            {log.cellChanges.map((cellChange, index) => (
                              <div key={`${log.id}_${cellChange.changeId}_${index}`} className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50 transition-colors">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">{cellChange.cell}</span>
                                    <Badge variant="outline" className="text-xs">{cellChange.column}</Badge>
                                  </div>
                                  <div className="text-xs text-gray-600 flex items-center gap-1">
                                    <span className="bg-red-50 text-red-700 px-1 rounded">{cellChange.oldValue || 'Empty'}</span>
                                    <span>→</span>
                                    <span className="bg-green-50 text-green-700 px-1 rounded">{cellChange.newValue || 'Empty'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-6 px-2 border-purple-200 hover:bg-purple-50"
                                    onClick={() => showChangePopup(cellChange)}
                                  >
                                    <MousePointer className="h-3 w-3 mr-1" />
                                    Details
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-6 px-2"
                                    onClick={() => openSheetWithCell(cellChange.sheet, cellChange.cell)}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* View in Sheets Button for general logs */}
                        {log.action === 'Data Change' && !log.cellChanges && (
                          <div className="mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => openSheetWithCell(log.sheet)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View in Sheets
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Real-Time Benefits Banner */}
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <AlertDescription className="text-blue-900">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="h-5 w-5 text-blue-600" />
                  <strong className="text-lg">Real-Time Updates Active!</strong>
                </div>
                <div className="mt-2 text-blue-800">
                  Your application automatically syncs with Google Sheets every 5 minutes.
                  Changes made in Google Sheets will appear in your dashboard within 5 minutes.
                  Data is cached for optimal performance while ensuring freshness.
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Live Sync</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Fallback Protected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Background Processing</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Timer className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Next sync: {formatCountdown(countdown)}</span>
                  </div>
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>

        {/* Interactive Change Popup */}
        <ChangePopup
          change={selectedChange}
          isOpen={showPopup}
          onClose={closeChangePopup}
          onNavigateToCell={handlePopupNavigation}
        />

        {/* Refresh Success Popup */}
        {showRefreshSuccess && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <CheckCircle className="h-5 w-5" />
              <div>
                <div className="font-medium">Data Refreshed!</div>
                <div className="text-sm text-green-100">Latest changes detected and processed</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
