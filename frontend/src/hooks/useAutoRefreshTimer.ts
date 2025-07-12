import { useState, useEffect, useCallback } from 'react'

interface UseAutoRefreshTimerProps {
  interval?: number // in seconds
  onRefresh?: () => void
  autoStart?: boolean
}

interface UseAutoRefreshTimerReturn {
  timeLeft: number
  isActive: boolean
  start: () => void
  stop: () => void
  reset: () => void
  progress: number // 0-100 percentage
}

export function useAutoRefreshTimer({
  interval = 20,
  onRefresh,
  autoStart = true
}: UseAutoRefreshTimerProps = {}): UseAutoRefreshTimerReturn {
  const [timeLeft, setTimeLeft] = useState(interval)
  const [isActive, setIsActive] = useState(autoStart)

  const start = useCallback(() => {
    setIsActive(true)
    setTimeLeft(interval)
  }, [interval])

  const stop = useCallback(() => {
    setIsActive(false)
  }, [])

  const reset = useCallback(() => {
    setTimeLeft(interval)
  }, [interval])

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Timer reached 0, trigger refresh and reset
            onRefresh?.()
            return interval // Reset to initial value
          }
          return prevTime - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isActive, timeLeft, interval, onRefresh])

  // Calculate progress percentage (0-100)
  const progress = ((interval - timeLeft) / interval) * 100

  return {
    timeLeft,
    isActive,
    start,
    stop,
    reset,
    progress
  }
}
