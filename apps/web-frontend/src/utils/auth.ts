/* --------------------  AUTHENTICATION UTILITIES  -------------------- */

export interface User {
  id: string
  email: string
  phone?: string
  name: string
  role: 'admin' | 'user'
  avatar?: string
  createdAt: string
  lastLogin?: string
  isVerified: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email?: string
  phone?: string
  password?: string
  otp?: string
}

export interface SignupData {
  name: string
  email?: string
  phone?: string
  password: string
}

// Mock user data for demonstration
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@solarinstaller.com',
    phone: '+1234567890',
    name: 'Solar Admin',
    role: 'admin',
    avatar: '',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isVerified: true
  }
]

// Local storage keys
const AUTH_STORAGE_KEY = 'solar_auth_state'
const USER_STORAGE_KEY = 'solar_current_user'

/* ---------- Authentication Functions ---------- */

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const sendOTP = async (contact: string, type: 'email' | 'phone'): Promise<{ success: boolean; otp?: string; message: string }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const otp = generateOTP()
  
  // In a real app, you would send the OTP via email/SMS service
  console.log(`📱 OTP sent to ${contact}: ${otp}`)
  
  // Store OTP temporarily (in real app, this would be server-side)
  sessionStorage.setItem(`otp_${contact}`, JSON.stringify({
    otp,
    expires: Date.now() + 5 * 60 * 1000 // 5 minutes
  }))
  
  return {
    success: true,
    otp, // Remove this in production
    message: `OTP sent to ${contact}`
  }
}

export const verifyOTP = async (contact: string, otp: string): Promise<{ success: boolean; message: string }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const storedData = sessionStorage.getItem(`otp_${contact}`)
  if (!storedData) {
    return { success: false, message: 'OTP expired or not found' }
  }
  
  const { otp: storedOTP, expires } = JSON.parse(storedData)
  
  if (Date.now() > expires) {
    sessionStorage.removeItem(`otp_${contact}`)
    return { success: false, message: 'OTP expired' }
  }
  
  if (otp !== storedOTP) {
    return { success: false, message: 'Invalid OTP' }
  }
  
  // Clean up
  sessionStorage.removeItem(`otp_${contact}`)
  return { success: true, message: 'OTP verified successfully' }
}

export const signUp = async (data: SignupData): Promise<{ success: boolean; user?: User; message: string }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const contact = data.email || data.phone
  if (!contact) {
    return { success: false, message: 'Email or phone number is required' }
  }
  
  // Check if user already exists
  const existingUser = MOCK_USERS.find(u => u.email === data.email || u.phone === data.phone)
  if (existingUser) {
    return { success: false, message: 'User already exists with this email/phone' }
  }
  
  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    email: data.email || '',
    phone: data.phone || '',
    name: data.name,
    role: 'user',
    createdAt: new Date().toISOString(),
    isVerified: false
  }
  
  MOCK_USERS.push(newUser)
  
  return {
    success: true,
    user: newUser,
    message: 'Account created successfully. Please verify your email/phone.'
  }
}

export const signIn = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; message: string }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const contact = credentials.email || credentials.phone
  if (!contact) {
    return { success: false, message: 'Email or phone number is required' }
  }
  
  // Find user
  const user = MOCK_USERS.find(u => u.email === contact || u.phone === contact)
  if (!user) {
    return { success: false, message: 'User not found' }
  }
  
  // For demo purposes, we'll use OTP-based login
  if (credentials.otp) {
    const otpResult = await verifyOTP(contact, credentials.otp)
    if (!otpResult.success) {
      return { success: false, message: otpResult.message }
    }
  } else if (credentials.password) {
    // Simple password check for demo (in real app, use proper hashing)
    if (credentials.password !== 'admin123') {
      return { success: false, message: 'Invalid password' }
    }
  } else {
    return { success: false, message: 'Password or OTP is required' }
  }
  
  // Update last login
  user.lastLogin = new Date().toISOString()
  
  return {
    success: true,
    user,
    message: 'Signed in successfully'
  }
}

export const signOut = async (): Promise<{ success: boolean; message: string }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Clear local storage
  localStorage.removeItem(AUTH_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
  
  // Clear session storage
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('otp_')) {
      sessionStorage.removeItem(key)
    }
  })
  
  return {
    success: true,
    message: 'Signed out successfully'
  }
}

/* ---------- Local Storage Functions ---------- */

export const saveAuthState = (authState: AuthState): void => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState))
    if (authState.user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authState.user))
    }
  } catch (error) {
    console.error('Failed to save auth state:', error)
  }
}

export const loadAuthState = (): AuthState => {
  try {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY)
    const userData = localStorage.getItem(USER_STORAGE_KEY)
    
    if (authData && userData) {
      const authState = JSON.parse(authData)
      const user = JSON.parse(userData)
      
      return {
        user,
        isAuthenticated: true,
        isLoading: false
      }
    }
  } catch (error) {
    console.error('Failed to load auth state:', error)
  }
  
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false
  }
}

export const getCurrentUser = (): User | null => {
  try {
    const userData = localStorage.getItem(USER_STORAGE_KEY)
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}

/* ---------- Validation Functions ---------- */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' }
  }
  
  return { isValid: true, message: 'Password is valid' }
}
