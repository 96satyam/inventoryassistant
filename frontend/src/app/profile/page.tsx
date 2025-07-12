/* --------------------  PROFILE SETTINGS PAGE  -------------------- */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Shield,
  Camera,
  Save,
  ArrowLeft,
  Loader2,
  LogOut,
  Settings,
  Key,
  Crown,
  UserCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { getAuthState, signOutUser, saveAuthState } from '@/lib/authMiddleware'
import { trackActivity } from '@/lib/activity'
import type { UserCredentials } from '@/lib/credentials'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserCredentials | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  useEffect(() => {
    const authState = getAuthState()
    
    if (!authState.isAuthenticated || !authState.user) {
      router.replace('/login')
      return
    }
    
    setCurrentUser(authState.user)
    setFormData({
      name: authState.user.name,
      email: authState.user.email || ''
    })
  }, [router])

  const handleSignOut = async () => {
    setLoading(true)
    try {
      const result = await signOutUser()
      
      if (result.success) {
        toast.success(result.message)
        
        if (currentUser) {
          await trackActivity({
            userId: currentUser.username,
            type: 'logout',
            action: 'user_logout',
            description: `User ${currentUser.name} signed out`
          })
        }
        
        router.replace('/login')
      } else {
        toast.error('Failed to sign out')
      }
    } catch (error) {
      toast.error('Sign out failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          name: formData.name,
          email: formData.email
        }
        
        setCurrentUser(updatedUser)
        saveAuthState({
          isAuthenticated: true,
          user: updatedUser,
          isLoading: false
        })
        
        toast.success('Profile updated successfully')
        
        await trackActivity({
          userId: updatedUser.username,
          type: 'action',
          action: 'profile_update',
          description: 'User profile updated'
        })
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />
      case 'manager':
        return <Settings className="h-4 w-4" />
      default:
        return <UserCheck className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default'
      case 'manager':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600 dark:text-slate-300">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Profile Settings</h1>
              <p className="text-slate-600 dark:text-slate-300">Manage your account information</p>
            </div>
          </div>
          
          <Button
            onClick={handleSignOut}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 shadow-lg border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="relative mx-auto mb-4">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-white" />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-200 dark:border-slate-600">
                  <Camera className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
              
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {currentUser.name}
              </CardTitle>
              
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant={getRoleBadgeVariant(currentUser.role)} className="flex items-center gap-1">
                  {getRoleIcon(currentUser.role)}
                  {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Key className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">Username: {currentUser.username}</span>
                </div>
                
                {currentUser.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-300">{currentUser.email}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">
                    {currentUser.permissions.length} permissions
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-lg border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Account Information
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">
                    Access Permissions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission.charAt(0).toUpperCase() + permission.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
