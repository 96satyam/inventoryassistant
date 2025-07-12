'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Cloud, 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  FileSpreadsheet,
  Sync,
  ExternalLink
} from 'lucide-react'
import { motion } from 'framer-motion'

interface SheetsStatus {
  connected: boolean
  sheet_id: string | null
  spreadsheet_title: string | null
  data_sources: any
  sync_status: any
}

export default function SheetsIntegration() {
  const [status, setStatus] = useState<SheetsStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [sheetId, setSheetId] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/sheets/status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch sheets status:', error)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleConfigure = async () => {
    if (!sheetId.trim()) {
      setMessage('Please enter a valid Google Sheets ID')
      setMessageType('error')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/sheets/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheet_id: sheetId.trim(),
          enable_sync: true
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage('Google Sheets integration configured successfully!')
        setMessageType('success')
        fetchStatus()
      } else {
        setMessage(data.detail || 'Configuration failed')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Failed to configure Google Sheets integration')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (direction: 'excel_to_sheets' | 'sheets_to_excel') => {
    setLoading(true)
    try {
      const response = await fetch('/api/sheets/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          direction,
          force: true
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage(`Sync started: ${direction.replace('_', ' ')}`)
        setMessageType('success')
        setTimeout(fetchStatus, 2000) // Refresh status after sync
      } else {
        setMessage('Sync failed')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Failed to start sync')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sheets/test-connection', { method: 'POST' })
      const data = await response.json()
      
      setMessage(data.message)
      setMessageType(data.success ? 'success' : 'error')
    } catch (error) {
      setMessage('Connection test failed')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FileSpreadsheet className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Google Sheets Integration</CardTitle>
                <CardDescription>
                  Connect your Solar Installer AI to Google Sheets for real-time data synchronization
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="status" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="configure">Configure</TabsTrigger>
                <TabsTrigger value="sync">Sync Data</TabsTrigger>
              </TabsList>

              <TabsContent value="status" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Cloud className="h-4 w-4" />
                        Connection Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {status?.connected ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Connected
                            </Badge>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <Badge variant="secondary">Not Connected</Badge>
                          </>
                        )}
                      </div>
                      {status?.spreadsheet_title && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Sheet: {status.spreadsheet_title}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Data Sources
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Excel Files:</span>
                          <Badge variant="outline">
                            {status?.data_sources?.excel_files ? 
                              Object.values(status.data_sources.excel_files).filter(Boolean).length : 0
                            } available
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Background Sync:</span>
                          <Badge variant={status?.data_sources?.background_sync ? "default" : "secondary"}>
                            {status?.data_sources?.background_sync ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Button onClick={testConnection} disabled={loading} className="w-full">
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Test Connection
                </Button>
              </TabsContent>

              <TabsContent value="configure" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sheet-id">Google Sheets ID</Label>
                    <Input
                      id="sheet-id"
                      placeholder="Enter your Google Sheets ID from the URL"
                      value={sheetId}
                      onChange={(e) => setSheetId(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Copy the ID from your Google Sheets URL: 
                      docs.google.com/spreadsheets/d/<strong>YOUR_SHEET_ID</strong>/edit
                    </p>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Make sure to share your Google Sheet with: 
                      <code className="bg-muted px-1 rounded text-xs ml-1">
                        sheet-access-service@level-dragon-465507-q8.iam.gserviceaccount.com
                      </code>
                    </AlertDescription>
                  </Alert>

                  <Button onClick={handleConfigure} disabled={loading} className="w-full">
                    <Settings className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Configure Integration
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="sync" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Excel → Google Sheets</CardTitle>
                      <CardDescription>
                        Upload your local Excel data to Google Sheets
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => handleSync('excel_to_sheets')} 
                        disabled={loading || !status?.connected}
                        className="w-full"
                      >
                        <Sync className="h-4 w-4 mr-2" />
                        Sync to Sheets
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Google Sheets → Excel</CardTitle>
                      <CardDescription>
                        Download Google Sheets data to local Excel files
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => handleSync('sheets_to_excel')} 
                        disabled={loading || !status?.connected}
                        className="w-full"
                        variant="outline"
                      >
                        <Sync className="h-4 w-4 mr-2" />
                        Sync to Excel
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {status?.connected && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Background sync is active. Data will be automatically synchronized every 5 minutes.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>

            {message && (
              <Alert className={`mt-4 ${
                messageType === 'success' ? 'border-green-200 bg-green-50' :
                messageType === 'error' ? 'border-red-200 bg-red-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <AlertDescription className={
                  messageType === 'success' ? 'text-green-800' :
                  messageType === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }>
                  {message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
