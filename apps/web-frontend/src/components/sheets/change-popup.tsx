'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  ExternalLink,
  X,
  ArrowRight,
  Calendar,
  User,
  FileText,
  Zap,
  Target,
  History,
  Eye,
  Copy,
  CheckCircle
} from 'lucide-react'

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

interface ChangePopupProps {
  change: CellChange | null
  isOpen: boolean
  onClose: () => void
  onNavigateToCell: (sheet: string, cell: string) => void
}

export default function ChangePopup({ change, isOpen, onClose, onNavigateToCell }: ChangePopupProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  if (!isOpen || !change) return null

  const copyChangeDetails = async () => {
    const details = `Change Details:
Cell: ${change.cell}
Sheet: ${change.sheetName}
Column: ${change.column}
Previous Value: ${change.oldValue}
New Value: ${change.newValue}
Timestamp: ${new Date(change.timestamp).toLocaleString()}
Change ID: ${change.changeId}`

    try {
      await navigator.clipboard.writeText(details)
      setCopied(true)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getRelativeTime(date)
    }
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  const { date, time, relative } = formatTimestamp(change.timestamp)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl animate-in zoom-in-95 duration-200">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-orange-900">
                  Cell Change Details
                </CardTitle>
                <CardDescription className="text-orange-700">
                  Interactive change tracking for {change.cell}
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={onClose}
              size="sm"
              variant="ghost"
              className="text-orange-600 hover:bg-orange-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Cell Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Cell Location</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-mono text-lg font-bold text-blue-900">{change.cell}</div>
                <div className="text-sm text-blue-700">{change.sheetName} • Row {change.row}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Column</span>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-semibold text-purple-900">{change.column}</div>
                <div className="text-sm text-purple-700">Data field</div>
              </div>
            </div>
          </div>

          {/* Value Change */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Value Change</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 via-gray-50 to-green-50 rounded-lg">
              <div className="flex-1 text-center">
                <div className="text-xs text-red-600 font-medium mb-1">PREVIOUS</div>
                <div className="p-2 bg-red-100 rounded font-mono text-red-900">
                  {change.oldValue || 'Empty'}
                </div>
              </div>
              <ArrowRight className="h-6 w-6 text-gray-400" />
              <div className="flex-1 text-center">
                <div className="text-xs text-green-600 font-medium mb-1">CURRENT</div>
                <div className="p-2 bg-green-100 rounded font-mono text-green-900">
                  {change.newValue || 'Empty'}
                </div>
              </div>
            </div>
          </div>

          {/* Timestamp Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">When Changed</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-indigo-50 rounded-lg text-center">
                <Calendar className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-indigo-900">{date}</div>
                <div className="text-xs text-indigo-700">Date</div>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg text-center">
                <Clock className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-indigo-900">{time}</div>
                <div className="text-xs text-indigo-700">Time</div>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg text-center">
                <User className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
                <div className="text-sm font-medium text-indigo-900">{relative}</div>
                <div className="text-xs text-indigo-700">Relative</div>
              </div>
            </div>
          </div>

          {/* Change ID */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600 mb-1">Change ID</div>
                <div className="font-mono text-sm text-gray-900">{change.changeId}</div>
              </div>
              <Badge variant="secondary" className="text-xs">
                Tracked
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              onClick={() => onNavigateToCell(change.sheet, change.cell)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              View in Google Sheets
            </Button>
            
            <Button
              onClick={copyChangeDetails}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Details
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
