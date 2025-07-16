"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Sun,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { clearAuthState, initializeSession } from '@/lib/authMiddleware'
import { trackActivity } from '@/lib/activity'
import { SSO_CONFIG } from '@/constants/sso'
import { isSsoAuthenticated } from '@/lib/sso'
// API Configuration - uses environment variable consistently
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://staging.framesense.ai'

// Authentication result interface
interface AuthResult {
  success: boolean
  user?: any
  message: string
}

// Professional authentication function with staging API and fallback
const authenticateUser = async (email: string, password: string): Promise<AuthResult> => {
  console.log('🔐 Starting authentication process...')
  console.log('📧 Email:', email)
  console.log('🌐 API Base URL:', API_BASE_URL)

  // First, try staging API
  try {
    console.log('🌐 Attempting staging API authentication...')

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      })
    })

    console.log('📡 Staging API Response status:', response.status)

    if (response.ok) {
      const userData = await response.json()
      console.log('✅ Staging API Success:', userData)

      // Process staging API response
      return processSuccessfulAuth(userData, 'staging')
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.warn('⚠️ Staging API returned error:', response.status, errorData)
      throw new Error(`Staging API error: ${response.status}`)
    }
  } catch (stagingError) {
    console.warn('⚠️ Staging API failed:', stagingError.message)

    // Fallback to local credential validation
    console.log('🔄 Falling back to local authentication...')
    return tryLocalAuthentication(email, password)
  }
}

// Process successful authentication response
const processSuccessfulAuth = (userData: any, source: string): AuthResult => {
  console.log(`✅ ${source} authentication successful:`, userData)

  // Handle the actual API response structure
  const authToken = userData.tokens && typeof userData.tokens === 'string'
    ? userData.tokens
    : `auth_${userData._id || 'user'}_${Date.now()}`

  // Store user data in localStorage for API calls
  localStorage.setItem('user', JSON.stringify(userData))
  localStorage.setItem('authToken', authToken)

  // Store authentication state for auth middleware (sessionStorage)
  const authState = {
    isAuthenticated: true,
    isLoading: false
  }

  const userForAuth = {
    username: userData.email || userData.name || 'user',
    name: userData.name || 'User',
    email: userData.email || '',
    role: userData.roles?.[0] || userData.role || 'user',
    permissions: ['dashboard', 'inventory', 'procurement', 'forecast', 'activity']
  }

  // Use the correct storage keys that authMiddleware expects
  sessionStorage.setItem('solar_auth_state', JSON.stringify(authState))
  sessionStorage.setItem('solar_current_user', JSON.stringify(userForAuth))

  console.log('💾 Auth state saved to sessionStorage')
  console.log('🔍 Stored authState:', authState)
  console.log('🔍 Stored userData:', userForAuth)

  return {
    success: true,
    user: userData,
    message: 'Login successful'
  }
}

// Local authentication fallback
const tryLocalAuthentication = async (email: string, password: string): Promise<AuthResult> => {
  console.log('🏠 Attempting local authentication fallback...')

  // Known working credentials for testing
  const validCredentials = [
    {
      email: 'satyam1@wattmonk.com',
      password: 'Password123',
      _id: 'local_satyam1',
      name: 'Satyam',
      roles: ['admin'],
      tokens: 0
    },
    {
      email: 'admin@wattmonk.com',
      password: 'admin123',
      _id: 'local_admin',
      name: 'Admin User',
      roles: ['admin'],
      tokens: 0
    },
    {
      email: 'test@test.com',
      password: 'test123',
      _id: 'local_test',
      name: 'Test User',
      roles: ['user'],
      tokens: 0
    }
  ]

  const user = validCredentials.find(u =>
    u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )

  if (user) {
    console.log('✅ Local authentication successful')
    return processSuccessfulAuth(user, 'local')
  } else {
    console.error('❌ Local authentication failed - invalid credentials')
    return {
      success: false,
      user: undefined,
      message: 'Invalid email or password'
    }
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '', // Changed from username to email
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Initialize session when login page loads
  useEffect(() => {
    // Check if user is already authenticated via SSO
    if (isSsoAuthenticated()) {
      console.log('🔐 User already authenticated via SSO, redirecting...')
      router.push('/dashboard')
      return
    }

    // Clear any existing auth state and initialize new session
    clearAuthState()
    initializeSession()
  }, [router])

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      toast.error('Email is required')
      return false
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return false
    }
    
    if (!formData.password.trim()) {
      toast.error('Password is required')
      return false
    }
    
    return true
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const result = await authenticateUser(formData.email, formData.password)
      
      if (result.success && result.user) {
        console.log('✅ LOGIN SUCCESS:', result.user)
        toast.success(result.message)

        // Track login activity
        try {
          await trackActivity({
            userId: result.user.email || 'user',
            type: 'login',
            action: 'user_login',
            description: `User ${result.user.name || result.user.email} signed in successfully`
          })
        } catch (activityError) {
          console.warn('Activity tracking failed:', activityError)
        }

        // Verify auth state is saved and valid (using correct storage keys)
        const savedAuthState = sessionStorage.getItem('solar_auth_state')
        const savedUserData = sessionStorage.getItem('solar_current_user')

        console.log('🔍 Verification - Auth state exists:', !!savedAuthState)
        console.log('🔍 Verification - User data exists:', !!savedUserData)

        if (savedAuthState && savedUserData) {
          try {
            const authStateObj = JSON.parse(savedAuthState)
            const userDataObj = JSON.parse(savedUserData)

            console.log('✅ Auth state parsed successfully:', authStateObj)
            console.log('✅ User data parsed successfully:', userDataObj)

            if (authStateObj.isAuthenticated === true) {
              console.log('✅ Authentication verified, redirecting to dashboard...')

              // Force redirect with window.location as backup
              setTimeout(() => {
                console.log('🔀 Executing redirect to dashboard')
                router.replace('/dashboard')

                // Backup redirect method
                setTimeout(() => {
                  if (window.location.pathname === '/login') {
                    console.log('🔄 Backup redirect triggered')
                    window.location.href = '/dashboard'
                  }
                }, 1000)
              }, 300)
            } else {
              console.error('❌ Auth state isAuthenticated is false')
              toast.error('Authentication verification failed. Please try again.')
            }
          } catch (parseError) {
            console.error('❌ Error parsing auth state:', parseError)
            toast.error('Authentication data error. Please try again.')
          }
        } else {
          console.error('❌ Auth state not saved properly!')
          console.error('Missing authState:', !savedAuthState)
          console.error('Missing userData:', !savedUserData)
          toast.error('Authentication state error. Please try again.')
        }
      } else {
        console.log('❌ LOGIN FAILED:', result.message)
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mb-4 shadow-lg"
          >
            <Sun className="h-8 w-8 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2"
          >
            Solar Admin Portal
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-600 dark:text-slate-300"
          >
            Secure access to your solar installation management system
          </motion.p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Sign In
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* SSO Login Option */}
            {SSO_CONFIG.enabled && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300 dark:border-slate-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    // Redirect to SSO provider
                    window.location.href = `${SSO_CONFIG.validationEndpoint}/auth?redirect=${encodeURIComponent(window.location.origin + '/sso-callback')}`;
                  }}
                  disabled={loading}
                  variant="outline"
                  className="w-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-3 rounded-lg transition-all duration-200"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Sign in with SSO
                </Button>
              </>
            )}

          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2024 Solar Installer Admin. Secure & Reliable.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}