'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Clock, 
  Database, 
  RefreshCw,
  TrendingUp,
  Package,
  History,
  Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DataUpdate {
  timestamp: Date
  source: 'Google Sheets' | 'Excel'
  type: 'Inventory' | 'Install History'
  rowCount: number
  changes?: string[]
}

interface RealTimeData {
  inventory: any[]
  installHistory: any[]
  lastUpdate: Date
  source: string
}

export default function RealTimeMonitor() {
  const [data, setData] = useState<RealTimeData | null>(null)
  const [updates, setUpdates] = useState<DataUpdate[]>([])
  const [isLive, setIsLive] = useState(true)
  const [loading, setLoading] = useState(false)

  const fetchRealTimeData = async () => {
    setLoading(true)
    try {
      // Fetch inventory data
      const inventoryResponse = await fetch('/api/sheets/data/Sheet1')
      const inventoryData = await inventoryResponse.json()
      
      // Fetch install history data
      const historyResponse = await fetch('/api/sheets/data/Sheet2')
      const historyData = await historyResponse.json()
      
      const newData: RealTimeData = {
        inventory: inventoryData.success ? inventoryData.data : [],
        installHistory: historyData.success ? historyData.data : [],
        lastUpdate: new Date(),
        source: 'Google Sheets'
      }
      
      // Check for changes and add update log
      if (data) {
        const changes: string[] = []
        
        if (newData.inventory.length !== data.inventory.length) {
          changes.push(`Inventory: ${data.inventory.length} → ${newData.inventory.length} rows`)
        }
        
        if (newData.installHistory.length !== data.installHistory.length) {
          changes.push(`Install History: ${data.installHistory.length} → ${newData.installHistory.length} rows`)
        }
        
        if (changes.length > 0) {
          const update: DataUpdate = {
            timestamp: new Date(),
            source: 'Google Sheets',
            type: changes.length > 1 ? 'Inventory' : (changes[0].includes('Inventory') ? 'Inventory' : 'Install History'),
            rowCount: changes.length > 1 ? newData.inventory.length + newData.installHistory.length : 
                     (changes[0].includes('Inventory') ? newData.inventory.length : newData.installHistory.length),
            changes
          }
          
          setUpdates(prev => [update, ...prev.slice(0, 9)]) // Keep last 10 updates
        }
      }
      
      setData(newData)
    } catch (error) {
      console.error('Failed to fetch real-time data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleLiveMode = () => {
    setIsLive(!isLive)
  }

  useEffect(() => {
    // Initial fetch
    fetchRealTimeData()
    
    // Set up real-time polling
    let interval: NodeJS.Timeout | null = null
    
    if (isLive) {
      interval = setInterval(fetchRealTimeData, 30000) // Poll every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLive])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  return (
    <div className="space-y-6">
      {/* Real-Time Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: isLive ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 2, repeat: isLive ? Infinity : 0 }}
                >
                  <Activity className={`h-5 w-5 ${isLive ? 'text-green-500' : 'text-gray-400'}`} />
                </motion.div>
                Real-Time Data Monitor
              </CardTitle>
              <CardDescription>
                Live monitoring of Google Sheets data synchronization
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant={isLive ? "default" : "secondary"} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {isLive ? 'Live' : 'Paused'}
              </Badge>
              
              <Button onClick={toggleLiveMode} variant="outline" size="sm">
                {isLive ? 'Pause' : 'Resume'}
              </Button>
              
              <Button onClick={fetchRealTimeData} disabled={loading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {data && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{data.inventory.length}</div>
                  <div className="text-sm text-muted-foreground">Inventory Items</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <History className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{data.installHistory.length}</div>
                  <div className="text-sm text-muted-foreground">Install Records</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Clock className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-sm font-bold">{formatTime(data.lastUpdate)}</div>
                  <div className="text-sm text-muted-foreground">Last Updated</div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Live Updates Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Live Updates Feed
          </CardTitle>
          <CardDescription>
            Real-time changes detected in your Google Sheets data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {updates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No updates detected yet</p>
                  <p className="text-sm">Changes will appear here when data is modified</p>
                </div>
              ) : (
                updates.map((update, index) => (
                  <motion.div
                    key={`${update.timestamp.getTime()}-${index}`}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-3 p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/10 dark:to-green-900/10"
                  >
                    <div className="flex-shrink-0">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center"
                      >
                        <Zap className="h-4 w-4 text-white" />
                      </motion.div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {update.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {update.source}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(update.timestamp)}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {update.changes?.map((change, changeIndex) => (
                          <div key={changeIndex} className="text-sm font-medium">
                            {change}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Data Freshness Indicator */}
      {data && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                />
                <span className="text-sm font-medium">Data Freshness</span>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium">
                  Updated {Math.floor((Date.now() - data.lastUpdate.getTime()) / 1000)}s ago
                </div>
                <div className="text-xs text-muted-foreground">
                  Next sync in {300 - ((Date.now() - data.lastUpdate.getTime()) / 1000) % 300 | 0}s
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
