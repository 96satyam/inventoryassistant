/**
 * Test file to verify notification functionality
 * This can be used to test the notification system with sample data
 */

import { generateDashboardNotifications, getNotificationCounts, type NotificationItem } from './notifications'

// Sample test data
const sampleInventory = [
  { name: 'Solar Panel Model A', available: 5, required: 20 }, // Low stock
  { name: 'Inverter Type B', available: 2, required: 15 }, // Low stock
  { name: 'Battery Pack C', available: 25, required: 10 }, // Good stock
  { name: 'Mounting Kit D', available: 8, required: 12 }, // Low stock
  { name: 'Cable Set E', available: 50, required: 30 }, // Good stock
]

const sampleForecast = [
  { model: 'Solar Panel Model A', qty: 25 }, // High demand
  { model: 'Inverter Type B', qty: 8 }, // Medium demand
  { model: 'Battery Pack C', qty: 15 }, // High demand
  { model: 'Mounting Kit D', qty: 5 }, // Low demand
]

const sampleLogs = [
  {
    timestamp: '2025-07-04T10:00:00Z',
    items: { 'Solar Panel Model A': 10, 'Inverter Type B': 5 }
  },
  {
    timestamp: '2025-07-04T09:30:00Z',
    items: { 'Battery Pack C': 8, 'Cable Set E': 12 }
  },
  {
    timestamp: '2025-07-04T09:00:00Z',
    items: { 'Mounting Kit D': 3 }
  }
]

/**
 * Test the notification generation
 */
export function testNotificationGeneration(): NotificationItem[] {
  console.log('🧪 Testing notification generation...')
  
  const notifications = generateDashboardNotifications(
    sampleInventory,
    sampleForecast,
    sampleLogs
  )
  
  console.log(`✅ Generated ${notifications.length} notifications:`)
  notifications.forEach((notification, index) => {
    console.log(`${index + 1}. [${notification.priority.toUpperCase()}] ${notification.title}`)
    console.log(`   ${notification.message}`)
    console.log(`   Type: ${notification.type}, Icon: ${notification.icon}`)
    console.log('')
  })
  
  const counts = getNotificationCounts(notifications)
  console.log('📊 Notification counts:', counts)
  
  return notifications
}

/**
 * Test notification priorities
 */
export function testNotificationPriorities(): void {
  console.log('🎯 Testing notification priorities...')
  
  const notifications = generateDashboardNotifications(
    sampleInventory,
    sampleForecast,
    sampleLogs
  )
  
  const priorityGroups = notifications.reduce((groups, notification) => {
    if (!groups[notification.priority]) {
      groups[notification.priority] = []
    }
    groups[notification.priority].push(notification)
    return groups
  }, {} as Record<string, NotificationItem[]>)
  
  Object.entries(priorityGroups).forEach(([priority, items]) => {
    console.log(`${priority.toUpperCase()}: ${items.length} notifications`)
    items.forEach(item => console.log(`  - ${item.title}`))
  })
}

/**
 * Test with empty data
 */
export function testEmptyData(): void {
  console.log('🔍 Testing with empty data...')
  
  const notifications = generateDashboardNotifications([], [], [])
  console.log(`Empty data generated ${notifications.length} notifications (should be 0)`)
}

/**
 * Run all tests
 */
export function runAllNotificationTests(): void {
  console.log('🚀 Running all notification tests...')
  console.log('=' .repeat(50))
  
  testNotificationGeneration()
  console.log('-'.repeat(30))
  
  testNotificationPriorities()
  console.log('-'.repeat(30))
  
  testEmptyData()
  console.log('-'.repeat(30))
  
  console.log('✅ All notification tests completed!')
}

// Export sample data for use in other tests
export { sampleInventory, sampleForecast, sampleLogs }
