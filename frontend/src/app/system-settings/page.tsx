/* --------------------  SYSTEM SETTINGS PAGE  -------------------- */
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Info,
  Shield,
  Bell,
  Zap,
  Database,
  Server,
  HardDrive,
  Wifi,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Save,
  RotateCcw,
  Download,
  Trash2,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import {
  getSystemInfo,
  getSystemHealth,
  getBackupInfo,
  getSystemConfigurations,
  updateSystemConfiguration,
  resetSystemConfiguration,
  restartSystem,
  createBackup,
  clearCache,
  getHealthStatusColor,
  getServiceStatusColor,
  getAlertLevelColor,
  type SystemInfo,
  type SystemHealth,
  type BackupInfo,
  type SystemConfiguration
} from '@/lib/system'
import { trackActivity } from '@/lib/activity'

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null)
  const [configurations, setConfigurations] = useState<SystemConfiguration[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'health' | 'backup'>('overview')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadSystemData()
  }, [])

  const loadSystemData = async () => {
    setLoading(true)
    try {
      const [info, health, backup, configs] = await Promise.all([
        getSystemInfo(),
        getSystemHealth(),
        getBackupInfo(),
        getSystemConfigurations()
      ])

      setSystemInfo(info)
      setSystemHealth(health)
      setBackupInfo(backup)
      setConfigurations(configs)

      await trackActivity({
        userId: '1',
        type: 'page_view',
        action: 'system_settings_view',
        description: 'Viewed system settings page'
      })
    } catch (error) {
      toast.error('Failed to load system data')
    } finally {
      setLoading(false)
    }
  }

  const handleConfigUpdate = async (id: string, value: any) => {
    setActionLoading(id)
    try {
      const result = await updateSystemConfiguration(id, value)
      if (result.success) {
        setConfigurations(prev =>
          prev.map(config =>
            config.id === id ? { ...config, value } : config
          )
        )
        toast.success(result.message)
        
        if (result.requiresRestart) {
          toast('⚠️ System restart required for this change to take effect', {
            duration: 5000
          })
        }

        await trackActivity({
          userId: '1',
          type: 'action',
          action: 'config_update',
          description: `Updated configuration: ${id}`,
          metadata: { configId: id, newValue: value }
        })
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to update configuration')
    } finally {
      setActionLoading(null)
    }
  }

  const handleConfigReset = async (id: string) => {
    setActionLoading(`reset_${id}`)
    try {
      const result = await resetSystemConfiguration(id)
      if (result.success) {
        await loadSystemData() // Reload to get updated values
        toast.success(result.message)

        await trackActivity({
          userId: '1',
          type: 'action',
          action: 'config_reset',
          description: `Reset configuration: ${id}`,
          metadata: { configId: id }
        })
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to reset configuration')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSystemAction = async (action: 'restart' | 'backup' | 'cache') => {
    setActionLoading(action)
    try {
      let result
      switch (action) {
        case 'restart':
          result = await restartSystem()
          break
        case 'backup':
          result = await createBackup()
          break
        case 'cache':
          result = await clearCache()
          break
      }

      if (result.success) {
        toast.success(result.message)
        if (action === 'backup') {
          await loadSystemData() // Reload backup info
        }

        await trackActivity({
          userId: '1',
          type: 'system',
          action: `system_${action}`,
          description: `System ${action} initiated`,
          metadata: { action }
        })
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error(`Failed to ${action} system`)
    } finally {
      setActionLoading(null)
    }
  }

  const renderConfigurationInput = (config: SystemConfiguration) => {
    const isLoading = actionLoading === config.id

    switch (config.type) {
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleConfigUpdate(config.id, !config.value)}
              disabled={!config.isEditable || isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.value
                  ? 'bg-blue-600'
                  : 'bg-slate-200 dark:bg-slate-700'
              } ${!config.isEditable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
          </div>
        )

      case 'select':
        return (
          <div className="flex items-center gap-2">
            <select
              value={config.value}
              onChange={(e) => handleConfigUpdate(config.id, e.target.value)}
              disabled={!config.isEditable || isLoading}
              className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-50"
            >
              {config.options?.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
          </div>
        )

      case 'number':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={config.value}
              onChange={(e) => handleConfigUpdate(config.id, Number(e.target.value))}
              disabled={!config.isEditable || isLoading}
              className="w-24 px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-50"
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
          </div>
        )

      case 'string':
        return (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={config.value}
              onChange={(e) => handleConfigUpdate(config.id, e.target.value)}
              disabled={!config.isEditable || isLoading}
              className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-50"
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
          </div>
        )

      default:
        return (
          <span className="text-slate-600 dark:text-slate-200">
            {String(config.value)}
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                System Settings
              </h1>
              <p className="text-slate-600 dark:text-slate-200">
                Configure and monitor your Solar Installer AI system
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleSystemAction('cache')}
              disabled={actionLoading === 'cache'}
              variant="outline"
              size="sm"
            >
              {actionLoading === 'cache' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear Cache
            </Button>
            <Button
              onClick={() => handleSystemAction('backup')}
              disabled={actionLoading === 'backup'}
              variant="outline"
              size="sm"
            >
              {actionLoading === 'backup' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Create Backup
            </Button>
            <Button
              onClick={() => handleSystemAction('restart')}
              disabled={actionLoading === 'restart'}
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              {actionLoading === 'restart' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Restart System
            </Button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-2 mb-8"
        >
          {[
            { id: 'overview', label: 'Overview', icon: Info },
            { id: 'config', label: 'Configuration', icon: Settings },
            { id: 'health', label: 'System Health', icon: Zap },
            { id: 'backup', label: 'Backup & Storage', icon: Database }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/90 dark:bg-slate-700/90 text-slate-600 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && systemInfo && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Information */}
              <Card className="shadow-lg border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Info className="h-5 w-5 text-blue-600" />
                    </div>
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-200">Application</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{systemInfo.appName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-200">Version</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{systemInfo.version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-200">Environment</p>
                      <Badge variant={systemInfo.environment === 'production' ? 'default' : 'secondary'}>
                        {systemInfo.environment}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-200">Build Date</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{systemInfo.buildDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-200">API Version</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{systemInfo.apiVersion}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-200">Database</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{systemInfo.databaseVersion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="shadow-lg border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Server className="h-5 w-5 text-green-600" />
                    </div>
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {systemHealth && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-200">Overall Health</span>
                        <Badge className={getHealthStatusColor(systemHealth.status)}>
                          {systemHealth.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-200">Uptime</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {systemHealth.uptime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-200">Active Services</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {systemHealth.services.filter(s => s.status === 'online').length} / {systemHealth.services.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-200">Unresolved Alerts</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {systemHealth.alerts.filter(a => !a.resolved).length}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-6">
              {['general', 'security', 'notifications', 'performance'].map(category => {
                const categoryConfigs = configurations.filter(c => c.category === category)
                if (categoryConfigs.length === 0) return null

                return (
                  <Card key={category} className="shadow-lg border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 capitalize">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Settings className="h-5 w-5 text-purple-600" />
                        </div>
                        {category} Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {categoryConfigs.map(config => (
                          <div key={config.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                                  {config.name}
                                </h4>
                                {config.requiresRestart && (
                                  <Badge variant="secondary" className="text-xs">
                                    Requires Restart
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-200 mt-1">
                                {config.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {renderConfigurationInput(config)}
                              {config.isEditable && (
                                <Button
                                  onClick={() => handleConfigReset(config.id)}
                                  disabled={actionLoading === `reset_${config.id}`}
                                  variant="ghost"
                                  size="sm"
                                >
                                  {actionLoading === `reset_${config.id}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <RotateCcw className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {activeTab === 'health' && systemHealth && (
            <div className="space-y-6">
              {/* Services Status */}
              <Card className="shadow-lg border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    Services Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {systemHealth.services.map(service => (
                      <div key={service.name} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {service.name}
                          </h4>
                          <Badge className={getServiceStatusColor(service.status)}>
                            {service.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-200">
                          <p>Response: {service.responseTime.toFixed(1)}ms</p>
                          <p>Last Check: {new Date(service.lastCheck).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Alerts */}
              <Card className="shadow-lg border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                    System Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {systemHealth.alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-200">No active alerts</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {systemHealth.alerts.map(alert => (
                        <div key={alert.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <Badge className={getAlertLevelColor(alert.level)}>
                            {alert.level}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-slate-900 dark:text-slate-100">{alert.message}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-200">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {alert.resolved ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'backup' && backupInfo && (
            <Card className="shadow-lg border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Database className="h-5 w-5 text-indigo-600" />
                  </div>
                  Backup & Storage Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-200">Last Backup</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {new Date(backupInfo.lastBackup).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-200">Backup Size</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{backupInfo.backupSize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-200">Storage Location</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{backupInfo.backupLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-200">Auto Backup</p>
                    <Badge variant={backupInfo.autoBackupEnabled ? 'default' : 'secondary'}>
                      {backupInfo.autoBackupEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-200">Retention Period</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{backupInfo.retentionDays} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-200">Next Backup</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {new Date(backupInfo.nextScheduledBackup).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}
