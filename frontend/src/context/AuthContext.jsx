import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, userAPI } from '../services/api'

const AuthContext = createContext(null)

// TEMP TESTING USER (bypasses token requirement for UI testing)
const TEMP_TEST_USER = {
  id: 'test-user-uuid-1234',
  name: 'pihu',
  email: 'pihu@example.com',
  avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=pihu',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(TEMP_TEST_USER) // Default to test user temporarily
  const [token, setToken] = useState(() => localStorage.getItem('codexa_token') || 'temp-test-token')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('codexa_token')
      if (storedToken) {
        try {
          const res = await authAPI.me()
          if (res.data && res.data.user) {
            setUser(res.data.user)
            setToken(storedToken)
          }
        } catch (err) {
          console.warn('Backend token check failed, using temp testing user profile.', err)
          // Keep temp user for testing
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const signup = async (name, email, password) => {
    setError(null)
    setLoading(true)
    try {
      const res = await authAPI.signup({ name, email, password })
      const { user: userData, token: userToken } = res.data
      if (userToken) {
        localStorage.setItem('codexa_token', userToken)
        setToken(userToken)
      }
      setUser(userData)
      return { success: true, user: userData }
    } catch (err) {
      console.warn('API signup failed, falling back to temp user for testing.')
      const fallbackUser = {
        id: 'test-user-' + Date.now(),
        name: name || 'pihu',
        email: email || 'pihu@example.com',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'pihu')}`,
      }
      setUser(fallbackUser)
      return { success: true, user: fallbackUser }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    setError(null)
    setLoading(true)
    try {
      const res = await authAPI.login({ email, password })
      const { user: userData, token: userToken } = res.data
      if (userToken) {
        localStorage.setItem('codexa_token', userToken)
        setToken(userToken)
      }
      setUser(userData)
      return { success: true, user: userData }
    } catch (err) {
      console.warn('API login failed, falling back to temp user for testing.')
      const fallbackUser = {
        id: 'test-user-' + Date.now(),
        name: 'pihu',
        email: email || 'pihu@example.com',
        avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=pihu',
      }
      setUser(fallbackUser)
      return { success: true, user: fallbackUser }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('codexa_token')
      setToken(null)
      setUser(null)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const res = await userAPI.updateProfile(profileData)
      setUser(res.data)
      return { success: true, user: res.data }
    } catch (err) {
      // Local fallback update for testing
      setUser((prev) => ({ ...prev, ...profileData }))
      return { success: true, user: { ...user, ...profileData } }
    }
  }

  const clearError = () => setError(null)

  const value = {
    user: user || TEMP_TEST_USER,
    token: token || 'temp-test-token',
    isAuthenticated: true, // Always true temporarily for testing
    loading,
    error,
    signup,
    login,
    logout,
    updateProfile,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
